// Tests for upload-files.mjs with synthetic files and a fake wrangler runner (no network, no R2).
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { execute, plan } from './upload-files.mjs';

const BID = '11111111-1111-4111-8111-111111111111';
const manifest = {
  files: [
    {
      id: 1,
      key: `bookings/${BID}/aaaaaaaa-0000-4000-8000-000000000001.jpg`,
      mime_type: 'image/jpeg',
      size_bytes: 4,
    },
    {
      id: 2,
      key: `bookings/${BID}/aaaaaaaa-0000-4000-8000-000000000002.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 9,
    },
  ],
};

function uploadsDir() {
  const dir = mkdtempSync(join(tmpdir(), 'zeo-uploads-'));
  mkdirSync(join(dir, BID));
  writeFileSync(
    join(dir, BID, 'aaaaaaaa-0000-4000-8000-000000000001.jpg'),
    Buffer.from([0xff, 0xd8, 0xff, 0xe0])
  );
  return dir; // the .pdf is "lost", like the 2 files that died in /tmp on Fly
}

/** Fake wrangler: a directory stands in for the bucket. */
function fakeRunner(bucketDir, { corrupt = false } = {}) {
  const calls = [];
  const runner = args => {
    calls.push(args);
    const [, , op, target] = args;
    const file = args[args.indexOf('--file') + 1];
    const stored = join(bucketDir, target);
    if (op === 'put') {
      mkdirSync(dirname(stored), { recursive: true });
      copyFileSync(file, stored);
    }
    if (op === 'get') {
      copyFileSync(stored, file);
      if (corrupt) writeFileSync(file, 'tampered');
    }
  };
  return { runner, calls };
}

test('plan: present files are hashed, missing ones are LOST (not an error)', () => {
  const rows = plan(manifest, uploadsDir());
  assert.equal(rows[0].state, 'ready');
  assert.match(rows[0].sha256, /^[0-9a-f]{64}$/);
  assert.equal(rows[1].state, 'lost');
});

test('plan: a size mismatch is flagged', () => {
  const m = { files: [{ ...manifest.files[0], size_bytes: 5 }] };
  assert.equal(plan(m, uploadsDir())[0].state, 'size-mismatch');
});

test('plan: refuses keys outside bookings/<uuid>/', () => {
  assert.throws(() => plan({ files: [{ key: '../etc/passwd', size_bytes: 1 }] }, uploadsDir()));
});

test('execute: put then get back, verified by sha256, jurisdiction eu and --remote on every call', () => {
  const bucket = mkdtempSync(join(tmpdir(), 'zeo-bucket-'));
  const { runner, calls } = fakeRunner(bucket);
  const rows = execute(plan(manifest, uploadsDir()), { runner });
  assert.deepEqual(
    rows.map(r => r.state),
    ['verified', 'lost']
  );
  assert.equal(calls.length, 2);
  for (const c of calls) {
    assert.ok(c.includes('--remote') && c[c.indexOf('--jurisdiction') + 1] === 'eu');
    assert.ok(c[3].startsWith('zeo-dental-uploads/bookings/'));
    assert.ok(!c.includes('delete'));
  }
  assert.equal(calls[0][calls[0].indexOf('--content-type') + 1], 'image/jpeg');
});

test('execute: a corrupted read-back is a hash mismatch', () => {
  const { runner } = fakeRunner(mkdtempSync(join(tmpdir(), 'zeo-bucket-')), { corrupt: true });
  const rows = execute(plan(manifest, uploadsDir()), { runner });
  assert.equal(rows[0].state, 'hash-mismatch');
});
