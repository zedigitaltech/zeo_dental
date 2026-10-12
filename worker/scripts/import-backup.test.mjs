// Tests for import-backup.mjs on a SYNTHETIC fixture (fake people only). Run: node --test scripts/
// The generated SQL is applied to an in-memory SQLite built from migrations/0000_init.sql, so the
// schema's CHECKs are exercised exactly as D1 (SQLite) will.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { ImportError, assertOutsideRepo, buildImport, findTable } from './import-backup.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, '..', 'migrations', '0000_init.sql'), 'utf8');
const fixture = () =>
  JSON.parse(readFileSync(join(here, 'fixtures', 'backup.synthetic.json'), 'utf8'));
const NOW = '2026-10-12T16:00:00.000Z';

function db(sql) {
  const d = new DatabaseSync(':memory:');
  d.exec('PRAGMA foreign_keys = ON;');
  d.exec(schema);
  if (sql) d.exec(sql);
  return d;
}

test('imports all three tables with values normalised to the D1 schema', () => {
  const { sql, manifest } = buildImport(fixture(), { now: NOW });
  const d = db(sql);
  assert.deepEqual(manifest.counts, { bookings: 3, booking_files: 2, chat_usage: 2 });
  const a = d
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .get('11111111-1111-4111-8111-111111111111');
  assert.equal(a.preferred_date, '2026-11-20');
  assert.equal(a.created_at, '2026-09-01T10:00:00.123Z');
  assert.equal(a.description, "Fake description, it's quoted");
  assert.equal(a.deleted_at, null);
  const b = d
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .get('22222222-2222-4222-8222-222222222222');
  assert.equal(b.confirmed_date, '2026-11-05');
  assert.equal(b.whatsapp_sent, 1);
  assert.equal(b.confirmation_email_sent, 1);
  assert.equal(b.email, null); // phone-only row passes the phone-or-email CHECK
  const files = d.prepare('SELECT id, storage_path FROM booking_files ORDER BY id').all();
  assert.deepEqual(
    files.map(f => f.storage_path),
    [
      'bookings/11111111-1111-4111-8111-111111111111/aaaaaaaa-0000-4000-8000-000000000001.jpg',
      'bookings/11111111-1111-4111-8111-111111111111/aaaaaaaa-0000-4000-8000-000000000002.pdf',
    ]
  );
  const usage = d.prepare('SELECT id, estimated_cost FROM chat_usage ORDER BY id').all();
  assert.deepEqual(
    usage.map(u => [u.id, u.estimated_cost]),
    [
      [7, 0.000013],
      [8, 0.000007],
    ]
  );
  assert.equal(manifest.backfill_pending, 2);
});

test('the manifest carries counts and R2 keys, never names, emails, phones or notes', () => {
  const { manifest } = buildImport(fixture(), { now: NOW });
  const s = JSON.stringify(manifest);
  for (const secret of [
    'Anna',
    'anna.prova',
    '+39 333',
    'fake note',
    'xray.jpg',
    'Fake description',
  ]) {
    assert.ok(!s.includes(secret), `manifest leaks ${secret}`);
  }
});

test('re-running is safe and an older backup row never overwrites a newer D1 row', () => {
  const { sql } = buildImport(fixture(), { now: NOW });
  const d = db(sql);
  d.exec(
    `UPDATE bookings SET status = 'confirmed', updated_at = '2026-10-13T00:00:00.000Z' WHERE id = '11111111-1111-4111-8111-111111111111'`
  );
  d.exec(sql); // delta import of the same (older) dump
  assert.equal(d.prepare('SELECT COUNT(*) AS n FROM bookings').get().n, 3);
  assert.equal(d.prepare('SELECT COUNT(*) AS n FROM booking_files').get().n, 2);
  assert.equal(
    d.prepare('SELECT status FROM bookings WHERE id LIKE ?').get('1111%').status,
    'confirmed'
  );
});

test('a newer backup row (changed on Fly during the cutover window) updates D1', () => {
  const d = db(buildImport(fixture(), { now: NOW }).sql);
  const later = fixture();
  later.tables.bookings.rows[0].status = 'cancelled';
  later.tables.bookings.rows[0].updated_at = '2026-10-14T00:00:00.000Z';
  d.exec(buildImport(later, { now: NOW }).sql);
  assert.equal(
    d.prepare('SELECT status FROM bookings WHERE id LIKE ?').get('1111%').status,
    'cancelled'
  );
});

test('--archive-ids soft-deletes (keeps) the listed bookings and they leave the backfill', () => {
  const { sql, manifest } = buildImport(fixture(), {
    now: NOW,
    archivedIds: ['33333333-3333-4333-8333-333333333333', ''],
  });
  const d = db(sql);
  assert.equal(
    d.prepare('SELECT deleted_at FROM bookings WHERE id LIKE ?').get('3333%').deleted_at,
    NOW
  );
  assert.equal(manifest.archived, 1);
  assert.equal(manifest.backfill_pending, 1);
  assert.throws(
    () => buildImport(fixture(), { archivedIds: ['44444444-4444-4444-8444-444444444444'] }),
    ImportError
  );
});

const broken = mutate => {
  const f = fixture();
  mutate(f.tables);
  return () => buildImport(f, { now: NOW });
};

test('rows that would break a CHECK are refused, naming row and column but no value', () => {
  const cases = [
    [
      t => {
        t.bookings.rows[0].status = 'archived';
      },
      /bookings row 1: column "status"/,
    ],
    [
      t => {
        t.bookings.rows[0].preferred_time = 'night';
      },
      /preferred_time/,
    ],
    [
      t => {
        t.bookings.rows[1].phone = null;
      },
      /phone\/email/,
    ],
    [
      t => {
        t.bookings.rows[0].preferred_date = '2026-11-19T23:00:00.000Z';
      },
      /UTC-midnight/,
    ],
    [
      t => {
        t.bookings.rows[0].created_at = 'yesterday';
      },
      /created_at/,
    ],
    [
      t => {
        t.booking_files.rows[0].booking_id = '99999999-9999-4999-8999-999999999999';
      },
      /references a booking/,
    ],
    [
      t => {
        t.chat_usage.rows[0].input_tokens = 'many';
      },
      /input_tokens/,
    ],
  ];
  for (const [mutate, re] of cases) {
    assert.throws(
      broken(mutate),
      err => err instanceof ImportError && re.test(err.message) && !/Anna|anna\./.test(err.message)
    );
  }
});

test('finds tables in a flat layout too, and explains an unknown layout by key names only', () => {
  const flat = { bookings: fixture().tables.bookings.rows };
  assert.equal(findTable(flat, 'bookings').length, 3);
  assert.throws(
    () => buildImport({ rows: [{ name: 'Anna Prova' }] }),
    err => /Keys in the dump: rows\[1\]/.test(err.message) && !/Anna/.test(err.message)
  );
});

test('refuses to write output inside the repository', () => {
  const repo = join(here, '..', '..');
  assert.throws(() => assertOutsideRepo(join(repo, 'tmp-out'), repo), ImportError);
  assert.doesNotThrow(() => assertOutsideRepo(join(tmpdir(), 'zeo-import'), repo));
});

test('CLI: writes import.sql + manifest.json to --out and prints counts only', () => {
  const out = mkdtempSync(join(tmpdir(), 'zeo-import-test-'));
  const ids = join(out, 'archive.txt');
  writeFileSync(ids, '33333333-3333-4333-8333-333333333333\n');
  const stdout = execFileSync(
    process.execPath,
    [
      join(here, 'import-backup.mjs'),
      join(here, 'fixtures', 'backup.synthetic.json'),
      '--out',
      out,
      '--archive-ids',
      ids,
    ],
    { encoding: 'utf8' }
  );
  assert.match(stdout, /"bookings":3/);
  assert.ok(!/Anna|example\.invalid/.test(stdout));
  const d = db(readFileSync(join(out, 'import.sql'), 'utf8'));
  assert.equal(d.prepare('SELECT COUNT(*) AS n FROM bookings WHERE deleted_at IS NULL').get().n, 2);
});
