// Tests for zeo-web-sync.gs (the pure part). Run: node --test ops/sheets/zeo-web-sync.test.js
// Only fake people here: no real names, phones or e-mails.
const test = require('node:test');
const assert = require('node:assert/strict');
const { zwPlanCallList, zwPlanDeposits, zwDepositText, zwPlanTakimet, zwPrenotatoColumn, zwPrenotatoText, zwPhone, zwSafe, zwWhenText } = require('./zeo-web-sync.gs');

// Same formatting the script gets from Utilities.formatDate(…, 'Europe/Tirane', …).
const fmt = (iso, pattern) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Tirane', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(iso)).map((x) => [x.type, x.value])
  );
  return pattern.replace('dd', p.day).replace('MM', p.month).replace('yyyy', p.year).replace('HH', p.hour).replace('mm', p.minute);
};

// Call list as the agents keep it: A #, B name, C phone, D email, E when (Meta), F flags, G esito, H stato, I Prenotato per.
const HEADER = ['#', 'Nome', 'Telefono', 'Email', 'Quando vuole venire', 'Da controllare', 'Esito chiamata', 'Stato', 'Prenotato per', 'Note agente'];
const metaRow = (o = {}) => [o.no || 1, o.name || 'Carla Finta', o.phone || '+39 333 111 2222', o.email || 'carla@example.it', 'Il prima possibile', 'NUOVO Meta 10/10 08:41', o.g || '', '', o.p || '', o.note || 'agent note'];
const item = (o = {}) => ({
  ref: 'a1b2c3d4', created_at: '2026-10-12T08:05:00.000Z', updated_at: '2026-10-12T08:05:00.000Z',
  name: 'Dario Prova', phone: '+39 347 000 1111', email: 'dario@example.it',
  preferred_date: '2026-11-20', preferred_time: 'morning', confirmed_date: null, confirmed_time: null, status: 'pending', ...o,
});
const P = 8; // "Prenotato per" index in HEADER

test('"Prenotato per" is found by its header text', () => {
  assert.equal(zwPrenotatoColumn(HEADER, [metaRow()]), 8);
  const moved = ['#', 'Nome', 'Telefono', 'Email', 'Q', 'F', 'G', 'H', 'Note', 'prenotato per '];
  assert.equal(zwPrenotatoColumn(moved, []), 9);
});

test('without the header, the first fully empty column after H is used, never one with agent data', () => {
  const header = ['#', 'Nome', 'Telefono', 'Email', 'Q', 'F', 'G', 'H', '', '', ''];
  const data = [[1, 'x', '', '', '', '', '', '', 'agent typed here', '', '']];
  assert.equal(zwPrenotatoColumn(header, data), 9);
  assert.equal(zwPrenotatoColumn(['#', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'used'], [[1]]), -1);
});

test('a new website booking is appended with F = "NUOVO Sito dd/MM HH:mm · ref" in Tirana time', () => {
  const { append, updates } = zwPlanCallList([item()], [metaRow()], P, { fmt });
  assert.equal(updates.length, 0);
  assert.equal(append.length, 1);
  // The leading ' makes Sheets store the phone as text (it is not shown).
  assert.deepEqual(append[0].cells, [2, 'Dario Prova', "'+39 347 000 1111", 'dario@example.it', '', 'NUOVO Sito 12/10 10:05 · ref a1b2c3d4']);
  assert.equal(append[0].prenotato, 'Richiesto: 20/11 mattina · ref a1b2c3d4');
});

test('column E stays blank without an answer and only A-F + Prenotato are ever produced', () => {
  const { append } = zwPlanCallList([item()], [], P, { fmt });
  assert.equal(append[0].cells.length, 6);
  assert.equal(append[0].cells[4], '');
  assert.deepEqual(Object.keys(append[0]).sort(), ['cells', 'prenotato']);
});

test('column E of a new row gets the exact meta-sync wording of travel_timeframe', () => {
  const cases = [
    ['within_30_days', 'Entro 30 giorni'],
    ['1_to_3_months', 'Tra 1 a 3 mesi'],
    ['over_3_months', 'Tra più di 3 mesi'],
    ['next_year', ''],
    [null, ''],
  ];
  for (const [tf, want] of cases) {
    assert.equal(zwWhenText({ travel_timeframe: tf }), want);
    const { append } = zwPlanCallList([item({ travel_timeframe: tf })], [], P, { fmt });
    assert.equal(append[0].cells[4], want);
  }
});

test('column E of an existing row is never written, even when the booking carries an answer', () => {
  const data = [metaRow({ phone: '+39 347 000 1111' })];
  const r = zwPlanCallList([item({ travel_timeframe: 'within_30_days' })], data, P, { fmt });
  assert.equal(r.append.length, 0);
  // Only the "Prenotato per" cell (index P) is ever updated on an existing row.
  assert.deepEqual(r.updates, [{ index: 0, value: 'Richiesto: 20/11 mattina · ref a1b2c3d4' }]);
  const ours = [metaRow({ no: 5, phone: '+39 347 000 1111', p: 'Richiesto: 20/11 mattina · ref a1b2c3d4' })];
  ours[0][5] = 'NUOVO Sito 12/10 10:05 · ref a1b2c3d4';
  const again = zwPlanCallList([item({ travel_timeframe: 'over_3_months' })], ours, P, { fmt });
  assert.deepEqual(again, { append: [], updates: [] });
});

test('a duplicate (same last 9 phone digits or same e-mail) is not appended; its empty Prenotato cell is filled', () => {
  const data = [metaRow({ phone: '+39 347 000 1111', email: 'other@example.it' })];
  const r = zwPlanCallList([item({ phone: '0039 3470001111' })], data, P, { fmt });
  assert.equal(r.append.length, 0);
  assert.deepEqual(r.updates, [{ index: 0, value: 'Richiesto: 20/11 mattina · ref a1b2c3d4' }]);
  const byMail = zwPlanCallList([item({ phone: '' , email: 'CARLA@example.it' })], [metaRow()], P, { fmt });
  assert.equal(byMail.append.length, 0);
  assert.equal(byMail.updates.length, 1);
});

test('a duplicate whose Prenotato cell an agent already filled is left alone', () => {
  const data = [metaRow({ phone: '+39 347 000 1111', p: 'Maria: richiamare lunedì' })];
  const r = zwPlanCallList([item()], data, P, { fmt });
  assert.deepEqual(r, { append: [], updates: [] });
});

test('confirmation by reception rewrites the script-owned cell to "Confermato: …" (matched by ref)', () => {
  const ours = [metaRow({ no: 5, name: 'Dario Prova', phone: '+39 347 000 1111', email: 'dario@example.it', p: 'Richiesto: 20/11 mattina · ref a1b2c3d4' })];
  ours[0][5] = 'NUOVO Sito 12/10 10:05 · ref a1b2c3d4';
  const r = zwPlanCallList([item({ status: 'confirmed', confirmed_date: '2026-11-21', confirmed_time: '10:30' })], ours, P, { fmt });
  assert.deepEqual(r, { append: [], updates: [{ index: 0, value: 'Confermato: 21/11 10:30 · ref a1b2c3d4' }] });
});

test('the agents\' G/H/notes cells are never part of a write', () => {
  const data = [metaRow({ phone: '+39 347 000 1111', g: 'Non risponde', note: 'keep me' })];
  const r = zwPlanCallList([item()], data, P, { fmt });
  for (const u of r.updates) assert.equal(typeof u.index, 'number');
  assert.equal(data[0][6], 'Non risponde'); // input untouched
  assert.equal(data[0][9], 'keep me');
});

test('backfill: only pending bookings are added; skip refs stay out', () => {
  const items = [
    item({ ref: '00000001', phone: '+39 347 000 0001', email: 'a@example.it' }),
    item({ ref: '00000002', phone: '+39 347 000 0002', email: 'b@example.it', status: 'confirmed', confirmed_date: '2026-11-01' }),
    item({ ref: '00000003', phone: '+39 347 000 0003', email: 'c@example.it', status: 'cancelled' }),
    item({ ref: '00000004', phone: '+39 347 000 0004', email: 'd@example.it' }),
  ];
  const r = zwPlanCallList(items, [], P, { fmt, backfill: true, skipRefs: ['00000004'] });
  assert.deepEqual(r.append.map((a) => a.cells[5].slice(-8)), ['00000001']);
  // after the backfill, a booking confirmed straight away is still added
  const later = zwPlanCallList(items.slice(1, 2), [], P, { fmt });
  assert.equal(later.append.length, 1);
});

test('the same person twice in one run is one row', () => {
  const r = zwPlanCallList([item({ ref: '11111111' }), item({ ref: '22222222' })], [], P, { fmt });
  assert.equal(r.append.length, 1);
});

test('Prenotato text for undated requests and cancellations', () => {
  assert.equal(zwPrenotatoText(item({ preferred_date: null, preferred_time: null })), 'Richiesto: senza data · ref a1b2c3d4');
  assert.equal(zwPrenotatoText(item({ status: 'cancelled' })), 'Annullato · ref a1b2c3d4');
});

test('phones: Italian as in meta-sync, plus Albanian numbers', () => {
  assert.equal(zwPhone('+393331112222', '').phone, '+39 333 111 2222');
  assert.deepEqual(zwPhone('+355 68 000 0000', ''), { phone: '+355 68 000 0000', note: 'Numero albanese' });
  assert.equal(zwPhone('068 000 0000', '').phone, '+355 68 000 0000');
  assert.equal(zwPhone('', '').phone, '');
});

test('Takimet: Albanian columns, by date, undated in a "Pa datë" section, Tirana time', () => {
  const rows = zwPlanTakimet([
    item({ ref: 'c0000001', status: 'confirmed', confirmed_date: '2026-11-05', confirmed_time: '10:30', updated_at: '2026-10-12T22:30:00.000Z' }),
    item({ ref: 'c0000002', preferred_date: '2026-11-20', preferred_time: 'afternoon', name: 'ERA FINTA' }),
    item({ ref: 'c0000003', preferred_date: null, preferred_time: null, email: null }),
  ], fmt);
  assert.deepEqual(rows[0], ['Data', 'Ora', 'Emri', 'Telefon', 'Email', 'Statusi', 'Konfirmuar më']);
  assert.deepEqual(rows[1], ['05/11/2026', '10:30', 'Dario Prova', "'+39 347 000 1111", 'dario@example.it', 'Konfirmuar', '13/10/2026 00:30']);
  assert.deepEqual(rows[2], ['20/11/2026', 'pasdite', 'Era Finta', "'+39 347 000 1111", 'dario@example.it', 'Në pritje', '']);
  assert.equal(rows[3][0], 'Pa datë');
  assert.deepEqual(rows[4].slice(0, 2), ['', '']);
  assert.equal(rows[4][4], '');
});

test('Takimet never carries treatment, notes or description', () => {
  const rows = zwPlanTakimet([item({ service: 'SEGRETO', notes: 'SEGRETO', description: 'SEGRETO' })], fmt);
  assert.ok(!JSON.stringify(rows).includes('SEGRETO'));
});

test('an empty Takimet still shows the header and a message', () => {
  assert.equal(zwPlanTakimet([], fmt).length, 2);
});

// ---- security review #1: spreadsheet formula injection ----

const FORMULAS = ['=HYPERLINK("http://evil.example","x")', '+cmd', '-2+3', '@SUM(A1)', '\t=1', '\r=1'];

test('zwSafe prefixes a quote to anything a sheet could read as a formula', () => {
  for (const f of FORMULAS) assert.equal(zwSafe(f), "'" + f);
  assert.equal(zwSafe('Anna Prova'), 'Anna Prova');
  assert.equal(zwSafe(''), '');
  assert.equal(zwSafe(42), 42);
});

test('call list: no user-sourced cell can start a formula', () => {
  const items = FORMULAS.map((f, i) => item({ ref: '0000000' + i, name: f, phone: '', email: `u${i}@example.it` }));
  items.push(item({ ref: 'eeeeeee1', name: 'Ok', phone: '', email: '=evil@example.it' }));
  items.push(item({ ref: 'eeeeeee2', name: 'Ok2', phone: '=1+1', email: 'z@example.it' }));
  items.push(item({ ref: 'eeeeeee3', name: 'Ok3', phone: '', email: 'y@example.it', preferred_time: null, preferred_date: null, status: 'confirmed', confirmed_date: '2026-11-02', confirmed_time: '=IMPORTXML(1)' }));
  const { append } = zwPlanCallList(items, [], P, { fmt });
  assert.equal(append.length, items.length);
  for (const r of append) {
    for (const cell of [...r.cells, r.prenotato]) {
      if (typeof cell === 'string') assert.ok(!/^[=+\-@\t\r]/.test(cell), JSON.stringify(cell));
    }
  }
});

test('call list: an e-mail failing the strict check is flagged "Email da verificare"', () => {
  const { append } = zwPlanCallList([item({ email: 'not an email@x' })], [], P, { fmt });
  assert.match(append[0].cells[5], /Email da verificare/);
  const ok = zwPlanCallList([item({ email: 'ok.name+tag@example.co.uk' })], [], P, { fmt });
  assert.doesNotMatch(ok.append[0].cells[5], /Email da verificare/);
});

test('Takimet: no user-sourced cell can start a formula', () => {
  const rows = zwPlanTakimet(
    FORMULAS.map(f => item({ name: f, phone: f, email: f, status: 'confirmed', confirmed_date: '2026-11-02', confirmed_time: f })),
    fmt
  );
  for (const r of rows.slice(1)) for (const cell of r) if (typeof cell === 'string') assert.ok(!/^[=+\-@\t\r]/.test(cell), JSON.stringify(cell));
});

// ---------------------------------------------------------------- paid deposits -> "Prenotato per"
const dep = (o = {}) => ({
  ref: 'd0e1f2a3', phone: '+39 333 111 2222', email: null, status: 'paid', amount: '100.00', currency: 'EUR',
  paid_at: '2026-10-14T07:30:00.000Z', call_list_ref: null, updated_at: '2026-10-14T07:30:00.000Z', ...o,
});

test('deposit text: "Acconto pagato €100 14/10 · ref", cents kept, ALL written after the amount', () => {
  assert.equal(zwDepositText(dep(), fmt), 'Acconto pagato €100 14/10 · ref d0e1f2a3');
  assert.equal(zwDepositText(dep({ amount: '99.50' }), fmt), 'Acconto pagato €99.50 14/10 · ref d0e1f2a3');
  assert.equal(zwDepositText(dep({ amount: '5000.00', currency: 'ALL' }), fmt), 'Acconto pagato 5000 ALL 14/10 · ref d0e1f2a3');
});

test('a paid deposit fills an empty "Prenotato per" of the row with the same phone, and only that cell', () => {
  const data = [metaRow({ no: 1, phone: '+39 347 000 9999', email: 'x@example.it' }), metaRow({ no: 2 })];
  assert.deepEqual(zwPlanDeposits([dep()], data, P, fmt), [{ index: 1, value: 'Acconto pagato €100 14/10 · ref d0e1f2a3' }]);
});

test('matches by e-mail, else by the call-list row number the agent typed', () => {
  const data = [metaRow({ no: 7, phone: '+39 347 000 9999', email: 'carla@example.it' }), metaRow({ no: 8, phone: '+39 347 000 8888', email: 'z@example.it' })];
  assert.equal(zwPlanDeposits([dep({ phone: null, email: 'CARLA@example.it' })], data, P, fmt)[0].index, 0);
  assert.equal(zwPlanDeposits([dep({ phone: '+39 320 555 0000', call_list_ref: 'riga 8' })], data, P, fmt)[0].index, 1);
  assert.deepEqual(zwPlanDeposits([dep({ phone: '+39 320 555 0000', call_list_ref: 'boh' })], data, P, fmt), []);
});

test("never overwrites an agent's text; appends to this script's booking text; idempotent", () => {
  const agent = [metaRow({ p: 'chiamare lunedì' })];
  assert.deepEqual(zwPlanDeposits([dep()], agent, P, fmt), []);
  const booked = [metaRow({ p: 'Confermato: 20/11 10:00 · ref a1b2c3d4' })];
  const [u] = zwPlanDeposits([dep()], booked, P, fmt);
  assert.equal(u.value, 'Confermato: 20/11 10:00 · ref a1b2c3d4 | Acconto pagato €100 14/10 · ref d0e1f2a3');
  assert.deepEqual(zwPlanDeposits([dep()], [metaRow({ p: u.value })], P, fmt), []);
  // Unpaid deposits are never written.
  assert.deepEqual(zwPlanDeposits([dep({ status: 'pending' })], [metaRow()], P, fmt), []);
});

test('only "Prenotato per" is written, never G/H or agent columns', () => {
  const updates = zwPlanDeposits([dep()], [metaRow()], P, fmt);
  for (const u of updates) assert.deepEqual(Object.keys(u).sort(), ['index', 'value']);
});

test('a booking update keeps the paid-deposit part this script appended', () => {
  const cell = 'Richiesto: 20/11 mattina · ref a1b2c3d4 | Acconto pagato €100 14/10 · ref d0e1f2a3';
  const { updates } = zwPlanCallList([item({ status: 'confirmed', confirmed_date: '2026-11-21', confirmed_time: '09:30' })], [metaRow({ p: cell })], P, { fmt });
  assert.deepEqual(updates, [{ index: 0, value: 'Confermato: 21/11 09:30 · ref a1b2c3d4 | Acconto pagato €100 14/10 · ref d0e1f2a3' }]);
});
