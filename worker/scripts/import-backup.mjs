#!/usr/bin/env node
/**
 * Fly Postgres backup (JSON) → D1 SQL.
 *
 *   node scripts/import-backup.mjs <backup.json> --out <dir outside the repo> [--archive-ids <file>]
 *
 * Reads the JSON dump, normalises every value to the D1 schema (migrations/0000_init.sql),
 * asserts every row passes the schema's CHECKs, and writes <out>/import.sql plus a counts-only
 * <out>/manifest.json. It never prints a field value: errors name the table, row number and column.
 * Then (DEPLOY.md §4):  npx wrangler d1 execute zeo-dental --remote --file <out>/import.sql
 *
 * Re-runnable (the post-cutover delta import): ids are kept; booking_files and chat_usage use
 * INSERT OR IGNORE; bookings use an upsert that only overwrites when the backup row is newer
 * (updated_at), so a change made in D1 after cutover is never clobbered by an older Fly row.
 *
 * --archive-ids <file>: one booking id per line (e.g. the internal test bookings). Those rows are
 * imported with deleted_at set (soft delete), so they are kept but invisible everywhere.
 *
 * Accepted shapes (the exact dump layout is located by table name, up to 3 levels deep):
 *   { "bookings": [...], "booking_files": [...], "chat_usage": [...] }
 *   { "tables": { "bookings": { "rows": [...] }, ... } }      (and similar nestings)
 */
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
export const SLOTS = ['morning', 'afternoon', 'evening'];
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export class ImportError extends Error {}

/** Find an array of rows for `table` anywhere in the first 3 levels of the dump. */
export function findTable(dump, table, depth = 0) {
  if (!dump || typeof dump !== 'object' || depth > 3) return undefined;
  for (const [k, v] of Object.entries(dump)) {
    if (k === table) {
      if (Array.isArray(v)) return v;
      if (v && Array.isArray(v.rows)) return v.rows;
      if (v && Array.isArray(v.data)) return v.data;
    }
  }
  for (const v of Object.values(dump)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const found = findTable(v, table, depth + 1);
      if (found) return found;
    }
  }
  return undefined;
}

/** Key paths only (never values), to explain an unexpected layout. */
function describeShape(dump, prefix = '', depth = 0) {
  if (!dump || typeof dump !== 'object' || depth > 2) return [];
  return Object.entries(dump).flatMap(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) return [`${p}[${v.length}]`];
    if (v && typeof v === 'object') return [p, ...describeShape(v, p, depth + 1)];
    return [p];
  });
}

const fail = (table, i, col, why) => {
  throw new ImportError(`${table} row ${i + 1}: column "${col}" ${why}`);
};

function ts(table, i, col, v, nullable) {
  if (v === null || v === undefined || v === '') {
    if (nullable) return null;
    fail(table, i, col, 'is required');
  }
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) fail(table, i, col, 'is not a timestamp');
  return d.toISOString();
}

/** DATE columns: node-pg serialises them as local-midnight Dates; on a UTC host that is T00:00:00.000Z. */
function date(table, i, col, v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T00:00:00(\.000)?Z$/.test(s)) return s.slice(0, 10);
  return fail(table, i, col, 'is not a UTC-midnight date (dump taken on a non-UTC host?)');
}

function bool(table, i, col, v) {
  if (v === null || v === undefined) return 0;
  if (v === true || v === 1 || v === 't' || v === 'true' || v === '1') return 1;
  if (v === false || v === 0 || v === 'f' || v === 'false' || v === '0') return 0;
  return fail(table, i, col, 'is not a boolean');
}

function text(table, i, col, v, nullable = true) {
  if (v === null || v === undefined) {
    if (nullable) return null;
    fail(table, i, col, 'is required');
  }
  return String(v);
}

function int(table, i, col, v) {
  const n = Number(v);
  if (!Number.isInteger(n)) fail(table, i, col, 'is not an integer');
  return n;
}

export function normaliseBooking(r, i, archived, now) {
  const t = 'bookings';
  const id = text(t, i, 'id', r.id, false);
  if (!/^[0-9a-f-]{36}$/i.test(id)) fail(t, i, 'id', 'is not a uuid');
  const email = r.email ? String(r.email) : null;
  const phone = r.phone ? String(r.phone) : null;
  if (!email && !phone)
    fail(t, i, 'phone/email', 'are both empty (CHECK phone IS NOT NULL OR email IS NOT NULL)');
  const status = r.status ?? 'pending';
  if (!STATUSES.includes(status)) fail(t, i, 'status', `is not one of ${STATUSES.join('/')}`);
  const slot = r.preferred_time ? String(r.preferred_time).toLowerCase() : null;
  if (slot !== null && !SLOTS.includes(slot))
    fail(t, i, 'preferred_time', `is not one of ${SLOTS.join('/')}`);
  const created = ts(t, i, 'created_at', r.created_at, false);
  return {
    id: id.toLowerCase(),
    name: text(t, i, 'name', r.name, false),
    email,
    phone,
    service: text(t, i, 'service', r.service, false),
    preferred_date: date(t, i, 'preferred_date', r.preferred_date),
    preferred_time: slot,
    status,
    description: text(t, i, 'description', r.description),
    notes: text(t, i, 'notes', r.notes),
    confirmed_date: date(t, i, 'confirmed_date', r.confirmed_date),
    confirmed_time: text(t, i, 'confirmed_time', r.confirmed_time),
    cancellation_reason: text(t, i, 'cancellation_reason', r.cancellation_reason),
    confirmed_by: text(t, i, 'confirmed_by', r.confirmed_by),
    confirmed_at: ts(t, i, 'confirmed_at', r.confirmed_at, true),
    whatsapp_sent: bool(t, i, 'whatsapp_sent', r.whatsapp_sent),
    confirmation_email_sent: bool(t, i, 'confirmation_email_sent', r.confirmation_email_sent),
    created_at: created,
    updated_at: ts(t, i, 'updated_at', r.updated_at ?? r.created_at, false),
    deleted_at: archived.has(id.toLowerCase()) ? now : null,
  };
}

export function normaliseFile(r, i, bookingIds) {
  const t = 'booking_files';
  const bookingId = text(t, i, 'booking_id', r.booking_id, false).toLowerCase();
  if (!bookingIds.has(bookingId))
    fail(t, i, 'booking_id', 'references a booking that is not in the dump');
  const filename = text(t, i, 'filename', r.filename, false);
  if (!/^[\w.-]+$/.test(filename)) fail(t, i, 'filename', 'has unexpected characters');
  const size = int(t, i, 'size_bytes', r.size_bytes);
  if (size < 0) fail(t, i, 'size_bytes', 'is negative');
  return {
    id: int(t, i, 'id', r.id),
    booking_id: bookingId,
    filename,
    original_name: text(t, i, 'original_name', r.original_name, false),
    mime_type: text(t, i, 'mime_type', r.mime_type, false),
    size_bytes: size,
    // Fly stored "<booking_id>/<file>" on local disk; R2 keys are "bookings/<booking_id>/<file>".
    storage_path: `bookings/${bookingId}/${filename}`,
    health_data_consent: bool(t, i, 'health_data_consent', r.health_data_consent),
    expires_at: ts(t, i, 'expires_at', r.expires_at, false),
    created_at: ts(t, i, 'created_at', r.created_at, false),
  };
}

export function normaliseUsage(r, i) {
  const t = 'chat_usage';
  const cost = Number(r.estimated_cost ?? 0);
  if (!Number.isFinite(cost)) fail(t, i, 'estimated_cost', 'is not a number');
  return {
    id: int(t, i, 'id', r.id),
    input_tokens: int(t, i, 'input_tokens', r.input_tokens),
    output_tokens: int(t, i, 'output_tokens', r.output_tokens),
    total_tokens: int(t, i, 'total_tokens', r.total_tokens),
    estimated_cost: cost,
    language: r.language == null ? null : String(r.language).slice(0, 5),
    created_at: ts(t, i, 'created_at', r.created_at, false),
  };
}

export function sqlValue(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

function insert(table, row, tail = '') {
  const cols = Object.keys(row);
  return `INSERT ${tail ? '' : 'OR IGNORE '}INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(c => sqlValue(row[c])).join(', ')})${tail};`;
}

const BOOKING_UPDATABLE = [
  'name',
  'email',
  'phone',
  'service',
  'preferred_date',
  'preferred_time',
  'status',
  'description',
  'notes',
  'confirmed_date',
  'confirmed_time',
  'cancellation_reason',
  'confirmed_by',
  'confirmed_at',
  'whatsapp_sent',
  'confirmation_email_sent',
  'updated_at',
];

/** Pure: dump object → { sql, manifest }. Throws ImportError on any row that would break a CHECK. */
export function buildImport(dump, { archivedIds = [], now = new Date().toISOString() } = {}) {
  const rawBookings = findTable(dump, 'bookings');
  if (!rawBookings) {
    throw new ImportError(
      `no "bookings" table found. Keys in the dump: ${describeShape(dump).join(', ')}`
    );
  }
  const archived = new Set(archivedIds.map(s => s.trim().toLowerCase()).filter(Boolean));
  const bookings = rawBookings.map((r, i) => normaliseBooking(r, i, archived, now));
  const ids = new Set(bookings.map(b => b.id));
  if (ids.size !== bookings.length) throw new ImportError('bookings: duplicate ids in the dump');
  const unknownArchived = [...archived].filter(id => !ids.has(id));
  if (unknownArchived.length)
    throw new ImportError(`--archive-ids: ${unknownArchived.length} id(s) not in the dump`);
  const files = (findTable(dump, 'booking_files') ?? []).map((r, i) => normaliseFile(r, i, ids));
  const usage = (findTable(dump, 'chat_usage') ?? []).map((r, i) => normaliseUsage(r, i));

  const upsert =
    ` ON CONFLICT (id) DO UPDATE SET ${BOOKING_UPDATABLE.map(c => `${c} = excluded.${c}`).join(', ')}` +
    ` WHERE excluded.updated_at > bookings.updated_at`;
  const lines = [
    '-- Generated by worker/scripts/import-backup.mjs. Contains personal data: keep outside the repo,',
    '-- delete after import. Order: bookings, booking_files, chat_usage.',
    ...bookings.map(b => insert('bookings', b, upsert)),
    ...files.map(f => insert('booking_files', f)),
    ...usage.map(u => insert('chat_usage', u)),
    '',
  ];

  const byStatus = Object.fromEntries(
    STATUSES.map(s => [s, bookings.filter(b => b.status === s).length])
  );
  const manifest = {
    generated_at: now,
    counts: { bookings: bookings.length, booking_files: files.length, chat_usage: usage.length },
    bookings_by_status: byStatus,
    archived: bookings.filter(b => b.deleted_at).length,
    // What the sheet backfill (status=pending, not soft-deleted) will pick up.
    backfill_pending: bookings.filter(b => b.status === 'pending' && !b.deleted_at).length,
    // R2 keys the upload step must create (ids only, no names).
    files: files.map(f => ({
      id: f.id,
      key: f.storage_path,
      mime_type: f.mime_type,
      size_bytes: f.size_bytes,
    })),
  };
  return { sql: lines.join('\n'), manifest };
}

export function assertOutsideRepo(outDir, repoRoot = REPO_ROOT) {
  const abs = resolve(outDir);
  let real = abs;
  try {
    real = realpathSync(abs);
  } catch {
    /* not created yet */
  }
  for (const p of [abs, real]) {
    if (p === repoRoot || p.startsWith(repoRoot + sep)) {
      throw new ImportError(
        `--out must be outside the repository (${repoRoot}); it will hold personal data`
      );
    }
  }
  return abs;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[++i];
    else args._.push(argv[i]);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = args._[0];
  if (!input || !args.out) {
    console.error(
      'usage: node scripts/import-backup.mjs <backup.json> --out <dir outside the repo> [--archive-ids <file>]'
    );
    process.exit(2);
  }
  try {
    const out = assertOutsideRepo(args.out);
    const dump = JSON.parse(readFileSync(input, 'utf8'));
    const archivedIds = args['archive-ids']
      ? readFileSync(args['archive-ids'], 'utf8').split('\n')
      : [];
    const { sql, manifest } = buildImport(dump, { archivedIds });
    mkdirSync(out, { recursive: true, mode: 0o700 });
    writeFileSync(join(out, 'import.sql'), sql, { mode: 0o600 });
    writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', {
      mode: 0o600,
    });
    console.log(`wrote ${join(out, 'import.sql')}`);
    console.log(
      JSON.stringify({
        counts: manifest.counts,
        bookings_by_status: manifest.bookings_by_status,
        archived: manifest.archived,
        backfill_pending: manifest.backfill_pending,
      })
    );
  } catch (err) {
    console.error(err instanceof ImportError ? `import refused: ${err.message}` : err);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
