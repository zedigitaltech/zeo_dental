/**
 * Zeo Dental: website bookings -> (1) Maria's call list "Zeo Dental — Lead da chiamare" and
 * (2) the front-desk sheet "Zeo Dental — Takimet" (Albanian, view-only for the desk).
 *
 * Chain: zeodentalclinic.com (Cloudflare Worker + D1) -> GET /api/export/leads and
 * /api/export/appointments (bearer SHEETS_EXPORT_TOKEN) -> this script -> the two spreadsheets.
 * Pull, not push: no Google key lives in the Worker; all Google access stays here.
 *
 * Install once, as elvizekaj@zedigital.tech, in its OWN standalone project (script.google.com >
 * New project). Never in a project bound to a sheet (whoever can edit the sheet can edit a bound
 * script, and the trigger runs as you), and never in the same project as meta-sync.gs or
 * prure-sync.gs: those define setup, phone, PRIORITY... and in one project the file loaded last
 * silently replaces the other's. Every name here starts with "zw" / "ZW_" for that reason.
 *
 * Script Properties (Project Settings > Script Properties), nothing secret in this file:
 *   ZW_BASE_URL          https://zeodentalclinic.com   (or the workers.dev URL before cutover)
 *   ZW_EXPORT_TOKEN      the Worker's SHEETS_EXPORT_TOKEN
 *   ZW_LIST_SHEET_ID     the call list spreadsheet ("Zeo Dental — Lead da chiamare")
 *   ZW_TAKIMET_SHEET_ID  the separate front-desk spreadsheet ("Zeo Dental — Takimet")
 *   ZW_SKIP_REFS         optional, comma-separated refs to keep out of the call list (e.g. unclear entries)
 *   ZW_CURSOR            written by the script; delete it only to redo the backfill
 * Then run zwSetup once and allow access. It runs every 10 minutes on Google's servers.
 *
 * What the call list gets (append-only, same rules as meta-sync.gs):
 *   - A new website booking becomes a new row under the last one: #, name, phone, e-mail,
 *     E = "Quando vuole venire" in the exact words meta-sync.gs writes for the same Meta answer
 *     ("Entro 30 giorni" / "Tra 1 a 3 mesi" / "Tra più di 3 mesi"; blank when the patient did not
 *     answer), F = "NUOVO Sito dd/MM HH:mm · ref xxxxxxxx" (green until G is filled).
 *     E is written only on the new row, never on an existing one.
 *   - A booking whose phone (last 9 digits) or e-mail is already in the list is NOT added again.
 *   - "Prenotato per" lives in its own column, found by its header text; if missing, the header is
 *     written into the first fully empty column after H. A column is never inserted (that would break
 *     the G/H dropdowns, the formula in A2 and the conditional formatting).
 *   - The script owns only the "Prenotato per" cell: it fills it when empty, and rewrites it only
 *     when it already carries this booking's ref (so it never overwrites what an agent typed).
 *     It changes to "Confermato: …" when reception confirms in /receptionist.
 *   - It never writes G, H or any other cell an agent edits.
 *   - First run (no ZW_CURSOR): only status=pending bookings are added (the backfill rule); the
 *     archived test bookings are soft-deleted in the database and never exported.
 * Only name, phone, e-mail, dates, status and when the patient wants to come ever reach Google.
 * Never the treatment interest, the X-ray answer, notes or files (the export does not carry them).
 */

var ZW_LIST_SHEET_NAME = 'Lead da chiamare';
var ZW_FIRST_DATA_ROW = 4; // rows 1-3: title, note, column headers
var ZW_HEADER_ROW = 3;
var ZW_PRENOTATO_HEADER = 'Prenotato per';
var ZW_TAKIMET_TAB = 'Takimet';
var ZW_TZ = 'Europe/Tirane';

// First function in the file, so the editor's Run button runs it by default.
function zwSetup() {
  zwProps(); // fails loudly when a property is missing
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'zwSyncWebsite') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('zwSyncWebsite').timeBased().everyMinutes(10).create();
  zwSyncWebsite();
}

function zwProps() {
  var p = PropertiesService.getScriptProperties();
  var need = ['ZW_BASE_URL', 'ZW_EXPORT_TOKEN', 'ZW_LIST_SHEET_ID', 'ZW_TAKIMET_SHEET_ID'];
  var out = {};
  need.forEach(function (k) {
    var v = p.getProperty(k);
    if (!v) throw new Error('Script Property ' + k + ' is not set');
    out[k] = v;
  });
  out.ZW_SKIP_REFS = p.getProperty('ZW_SKIP_REFS') || '';
  out.ZW_CURSOR = p.getProperty('ZW_CURSOR') || '';
  return out;
}

function zwSyncWebsite() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try {
    var props = zwProps();
    zwSyncCallList(props);
    zwSyncTakimet(props);
  } finally {
    lock.releaseLock();
  }
}

function zwGet(props, path) {
  var res = UrlFetchApp.fetch(props.ZW_BASE_URL.replace(/\/$/, '') + path, {
    headers: { Authorization: 'Bearer ' + props.ZW_EXPORT_TOKEN },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error('GET ' + path.split('?')[0] + ' -> HTTP ' + res.getResponseCode());
  return JSON.parse(res.getContentText());
}

/** All pages after `cursor`; `status` only for the first (backfill) run. */
function zwFetchLeads(props, cursor, status) {
  var items = [];
  var next = cursor;
  for (var page = 0; page < 50; page++) {
    var q = '/api/export/leads?limit=500' + (next ? '&since=' + encodeURIComponent(next) : '') + (status ? '&status=' + status : '');
    var body = zwGet(props, q);
    items = items.concat(body.items);
    next = body.next_cursor || next;
    if (!body.has_more) break;
  }
  return { items: items, cursor: next };
}

function zwSyncCallList(props) {
  var backfill = !props.ZW_CURSOR;
  var got = zwFetchLeads(props, props.ZW_CURSOR, backfill ? 'pending' : '');
  var cursor = got.cursor;
  // After the pending-only backfill, move the cursor past everything else so older non-pending
  // bookings are never picked up later.
  if (backfill) cursor = zwFetchLeads(props, '', '').cursor || cursor;

  var list = SpreadsheetApp.openById(props.ZW_LIST_SHEET_ID).getSheetByName(ZW_LIST_SHEET_NAME);
  var lastCol = Math.max(list.getLastColumn(), 8);
  var header = list.getRange(ZW_HEADER_ROW, 1, 1, lastCol + 1).getDisplayValues()[0];
  var lastRow = list.getLastRow();
  var n = Math.max(lastRow - ZW_FIRST_DATA_ROW + 1, 0);
  var data = n > 0 ? list.getRange(ZW_FIRST_DATA_ROW, 1, n, lastCol + 1).getDisplayValues() : [];
  var pCol = zwPrenotatoColumn(header, data);
  if (pCol < 0) throw new Error('No free column after H for "' + ZW_PRENOTATO_HEADER + '"');

  if (got.items.length > 0) {
    var plan = zwPlanCallList(got.items, data, pCol, {
      skipRefs: props.ZW_SKIP_REFS.split(',').map(function (s) { return s.trim(); }).filter(String),
      backfill: backfill,
      fmt: zwGasFmt,
    });
    if (plan.append.length > 0 || plan.updates.length > 0) {
      if (header[pCol] !== ZW_PRENOTATO_HEADER) list.getRange(ZW_HEADER_ROW, pCol + 1).setValue(ZW_PRENOTATO_HEADER);
      plan.updates.forEach(function (u) {
        list.getRange(ZW_FIRST_DATA_ROW + u.index, pCol + 1).setValue(u.value);
      });
      if (plan.append.length > 0) zwAppend(list, plan.append, pCol);
    }
  }
  PropertiesService.getScriptProperties().setProperty('ZW_CURSOR', cursor || '');
}

/** Same insertion as meta-sync.gs: empty rows under the last one, only they are written. */
function zwAppend(list, rows, pCol) {
  var dv = list.getRange(ZW_FIRST_DATA_ROW, 7, 1, 2).getDataValidations()[0];
  var after = list.getLastRow();
  list.insertRowsAfter(after, rows.length);
  var at = after + 1;
  list.getRange(at, 1, rows.length, 10).clearFormat();
  list.getRange(at, 1, rows.length, 6).setValues(rows.map(function (r) { return r.cells; }));
  list.getRange(at, 7, rows.length, 2).setDataValidations(rows.map(function () { return dv; }));
  list.getRange(at, pCol + 1, rows.length, 1).setValues(rows.map(function (r) { return [r.prenotato]; }));
  zwExtendRules(list);
}

/** Stretch the existing conditional-format rules over the new rows (the rules themselves are meta-sync's). */
function zwExtendRules(list) {
  var max = list.getMaxRows();
  var rules = list.getConditionalFormatRules().map(function (rule) {
    var ranges = rule.getRanges().map(function (r) {
      if (r.getRow() >= ZW_FIRST_DATA_ROW && r.getLastRow() < max) {
        return list.getRange(r.getRow(), r.getColumn(), max - r.getRow() + 1, r.getNumColumns());
      }
      return r;
    });
    return rule.copy().setRanges(ranges).build();
  });
  list.setConditionalFormatRules(rules);
}

function zwSyncTakimet(props) {
  var body = zwGet(props, '/api/export/appointments');
  var ss = SpreadsheetApp.openById(props.ZW_TAKIMET_SHEET_ID);
  var sh = ss.getSheetByName(ZW_TAKIMET_TAB) || ss.insertSheet(ZW_TAKIMET_TAB);
  var rows = zwPlanTakimet(body.items, zwGasFmt);
  sh.clearContents();
  sh.clearFormats();
  sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold').setBackground('#EFE6D8');
  rows.forEach(function (r, i) {
    if (r[0] === 'Pa datë') sh.getRange(i + 1, 1, 1, r.length).setFontWeight('bold').setBackground('#F3F3F3');
  });
  sh.setFrozenRows(1);
  sh.getRange(1, 9).setValue('Përditësuar: ' + Utilities.formatDate(new Date(), ZW_TZ, 'dd/MM/yyyy HH:mm'));
}

function zwGasFmt(iso, pattern) {
  return Utilities.formatDate(new Date(iso), ZW_TZ, pattern);
}

// ---------------------------------------------------------------- pure (tested in zeo-web-sync.test.js)

/**
 * Formula-injection guard for every cell that carries text from the website: a leading ' makes
 * Sheets store the value as plain text (the quote is not displayed), so "=HYPERLINK(...)",
 * "+cmd", "-1+1", "@SUM", tab or CR can never become a formula.
 */
function zwSafe(v) {
  return typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

var ZW_EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/**
 * Column index (0-based) of "Prenotato per": by header text, else the first column after H (index 7)
 * whose header AND data cells are all empty. -1 if none. Never suggests inserting a column.
 */
function zwPrenotatoColumn(header, data) {
  for (var i = 0; i < header.length; i++) {
    if (String(header[i]).trim().toLowerCase() === ZW_PRENOTATO_HEADER.toLowerCase()) return i;
  }
  for (var c = 8; c < header.length; c++) {
    if (String(header[c]).trim() !== '') continue;
    var used = (data || []).some(function (r) { return String(r[c] == null ? '' : r[c]).trim() !== ''; });
    if (!used) return c;
  }
  return -1;
}

var ZW_SLOTS_IT = { morning: 'mattina', afternoon: 'pomeriggio', evening: 'sera' };
var ZW_SLOTS_SQ = { morning: 'mëngjes', afternoon: 'pasdite', evening: 'mbrëmje' };

/**
 * travel_timeframe -> column E, matching meta-sync.gs readableWhen() of the Meta option keys
 * (entro_30_giorni, tra_1_a_3_mesi, tra_più_di_3_mesi) so the list stays uniform.
 */
var ZW_WHEN_IT = {
  within_30_days: 'Entro 30 giorni',
  '1_to_3_months': 'Tra 1 a 3 mesi',
  over_3_months: 'Tra più di 3 mesi',
};

function zwWhenText(item) {
  return ZW_WHEN_IT[item && item.travel_timeframe] || '';
}

function zwDayMonth(ymd) {
  return ymd ? ymd.slice(8, 10) + '/' + ymd.slice(5, 7) : '';
}

/** The "Prenotato per" text for one booking (Italian, like the rest of the call list). */
function zwPrenotatoText(item) {
  var ref = ' · ref ' + item.ref;
  if (item.status === 'confirmed' && item.confirmed_date) {
    return 'Confermato: ' + zwDayMonth(item.confirmed_date) + (item.confirmed_time ? ' ' + item.confirmed_time : '') + ref;
  }
  if (item.status === 'cancelled') return 'Annullato' + ref;
  if (item.preferred_date || item.preferred_time) {
    return 'Richiesto: ' + [zwDayMonth(item.preferred_date), ZW_SLOTS_IT[item.preferred_time] || ''].join(' ').trim() + ref;
  }
  return 'Richiesto: senza data' + ref;
}

/**
 * Pure: export items + call-list rows (A.. from row 4, display values) -> what to write.
 * Returns { append: [{ cells: [#, name, phone, email, E, F], prenotato }], updates: [{ index, value }] }
 * where index is the 0-based data row. Never returns a write for any column but A-F of new rows
 * and the "Prenotato per" column.
 */
function zwPlanCallList(items, data, pCol, opts) {
  opts = opts || {};
  var fmt = opts.fmt;
  var skip = {};
  (opts.skipRefs || []).forEach(function (r) { skip[r] = true; });
  var refRe = /ref ([0-9a-f]{8})/;

  var byRef = {};
  var byKey = {};
  (data || []).forEach(function (r, i) {
    var mF = refRe.exec(String(r[5] || ''));
    var mP = refRe.exec(String(r[pCol] || ''));
    if (mF) byRef[mF[1]] = i;
    if (mP) byRef[mP[1]] = i;
    zwKeys(r[2], r[3]).forEach(function (k) { if (byKey[k] === undefined) byKey[k] = i; });
  });

  var nextNo = (data || []).reduce(function (m, r) { return Math.max(m, Number(r[0]) || 0); }, 0) + 1;
  var append = [];
  var updates = {};
  var setCell = function (index, current, value, ref) {
    var cur = String(current == null ? '' : current).trim();
    // Only an empty cell, or one this script wrote for the same booking.
    if (cur === '' || cur.indexOf('ref ' + ref) >= 0) {
      if (cur !== value) updates[index] = value;
    }
  };

  items.forEach(function (it) {
    if (skip[it.ref]) return;
    var text = zwSafe(zwPrenotatoText(it));
    if (byRef[it.ref] !== undefined) {
      var i = byRef[it.ref];
      if (typeof i === 'number') setCell(i, updates[i] !== undefined ? updates[i] : data[i][pCol], text, it.ref);
      else i.prenotato = text; // appended earlier in this same run
      return;
    }
    var ph = zwPhone(it.phone || '', '');
    var keys = zwKeys(ph.phone, it.email);
    var dupIndex;
    keys.forEach(function (k) { if (dupIndex === undefined && byKey[k] !== undefined) dupIndex = byKey[k]; });
    if (dupIndex !== undefined) {
      if (typeof dupIndex === 'number') {
        setCell(dupIndex, updates[dupIndex] !== undefined ? updates[dupIndex] : data[dupIndex][pCol], text, it.ref);
        byRef[it.ref] = dupIndex;
      }
      return;
    }
    if (it.status !== 'pending' && (opts.backfill || it.status !== 'confirmed')) return;
    var flags = ['NUOVO Sito ' + fmt(it.created_at, 'dd/MM HH:mm') + ' · ref ' + it.ref];
    if (ph.note) flags.push(ph.note);
    var email = String(it.email || '').trim().toLowerCase();
    if (email && !ZW_EMAIL_RE.test(email)) flags.push('Email da verificare');
    var row = {
      cells: [nextNo++, zwSafe(zwCleanName(it.name || '')), zwSafe(ph.phone), zwSafe(email), zwWhenText(it), flags.join('; ')],
      prenotato: text,
    };
    append.push(row);
    byRef[it.ref] = row;
    keys.forEach(function (k) { byKey[k] = row; });
  });

  return {
    append: append,
    updates: Object.keys(updates).map(function (k) { return { index: Number(k), value: updates[k] }; }),
  };
}

/** Dedupe keys exactly as meta-sync.gs: last 9 phone digits, lower-case e-mail. */
function zwKeys(phoneText, email) {
  var keys = [];
  var d = zwDigits(phoneText);
  if (d) keys.push('p' + d.slice(-9));
  if (email) keys.push('e' + String(email).trim().toLowerCase());
  return keys;
}

/**
 * Pure: appointments export -> the "Takimet" tab, in Albanian, Tirana time.
 * Columns: Data, Ora, Emri, Telefon, Email, Statusi, Konfirmuar më. Undated requests go in a
 * "Pa datë" section at the bottom. "Konfirmuar më" is the last change of a confirmed booking
 * (the export carries updated_at, not a separate confirmed_at).
 */
function zwPlanTakimet(items, fmt) {
  var head = ['Data', 'Ora', 'Emri', 'Telefon', 'Email', 'Statusi', 'Konfirmuar më'];
  var status = { pending: 'Në pritje', confirmed: 'Konfirmuar' };
  var row = function (it) {
    var day = it.confirmed_date || it.preferred_date || '';
    var time = it.confirmed_date ? it.confirmed_time || '' : ZW_SLOTS_SQ[it.preferred_time] || '';
    return [
      day ? day.slice(8, 10) + '/' + day.slice(5, 7) + '/' + day.slice(0, 4) : '',
      zwSafe(time),
      zwSafe(zwCleanName(it.name || '')),
      zwSafe(it.phone || ''),
      zwSafe(it.email || ''),
      status[it.status] || it.status,
      it.status === 'confirmed' ? fmt(it.updated_at, 'dd/MM/yyyy HH:mm') : '',
    ];
  };
  var dated = items.filter(function (it) { return it.confirmed_date || it.preferred_date; });
  var undated = items.filter(function (it) { return !(it.confirmed_date || it.preferred_date); });
  var rows = [head].concat(dated.map(row));
  if (undated.length > 0) {
    rows.push(['Pa datë', '', '', '', '', '', '']);
    rows = rows.concat(undated.map(row));
  }
  if (rows.length === 1) rows.push(['', '', 'Asnjë takim i ardhshëm', '', '', '', '']);
  return rows;
}

// ---- copied from meta-sync.gs (renamed: one project per script, no shared names) ----

function zwDigits(s) { return String(s || '').replace(/\D/g, ''); }

function zwItMobile(d) {
  if (d.indexOf('39') === 0 && (d.length === 11 || d.length === 12) && d.charAt(2) === '3') d = d.slice(2);
  if (d.charAt(0) === '3' && (d.length === 9 || d.length === 10)) return '+39 ' + d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6);
  return null;
}

/** meta-sync.gs phone(), plus Albanian numbers (the website, unlike the Meta form, gets them). */
function zwPhone(p, wa) {
  var dp = zwDigits(p), dw = zwDigits(wa);
  if (!dp && !dw) return { phone: '', note: '' };
  if (dp.indexOf('355') === 0 && dp.length >= 11 && dp.length <= 12) {
    return { phone: '+355 ' + dp.slice(3, 5) + ' ' + dp.slice(5, 8) + ' ' + dp.slice(8), note: 'Numero albanese' };
  }
  if (dp.indexOf('06') === 0 && dp.length === 10) {
    return { phone: '+355 ' + dp.slice(1, 3) + ' ' + dp.slice(3, 6) + ' ' + dp.slice(6), note: 'Numero albanese' };
  }
  if (dp.indexOf('41') === 0 && dp.length === 11) return { phone: '+41 ' + dp.slice(2, 4) + ' ' + dp.slice(4, 7) + ' ' + dp.slice(7), note: 'Numero svizzero' };
  if (dp.indexOf('966') === 0) return { phone: '+966 ' + dp.slice(3), note: 'Numero saudita: verificare prima di chiamare' };
  var m = zwItMobile(dp) || zwItMobile(dw);
  if (m) return { phone: m, note: zwDigits(m).length === 12 ? '' : 'Numero incompleto: verificare su WhatsApp' };
  if (dp.indexOf('3933') === 0 && dp.length === 13 && zwItMobile(dw)) return { phone: zwItMobile(dw), note: '' };
  return { phone: String(p || wa).replace(/^p:/, ''), note: 'Numero non valido: provare WhatsApp o email' };
}

function zwCleanName(n) {
  if (n.indexOf('@') >= 0) return '(nome mancante)';
  n = n.replace(/\s+/g, ' ').trim();
  if (n === n.toLowerCase() || n === n.toUpperCase()) {
    return n.toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); });
  }
  return n;
}

if (typeof module !== 'undefined') {
  module.exports = {
    zwPlanCallList: zwPlanCallList,
    zwPlanTakimet: zwPlanTakimet,
    zwPrenotatoColumn: zwPrenotatoColumn,
    zwPrenotatoText: zwPrenotatoText,
    zwPhone: zwPhone,
    zwSafe: zwSafe,
    zwWhenText: zwWhenText,
  };
}
