#!/usr/bin/env node
/**
 * Copy the Fly upload files into R2 and prove each copy by SHA-256.
 *
 *   node scripts/upload-files.mjs <uploads-dir> --manifest <out>/manifest.json            (plan only)
 *   node scripts/upload-files.mjs <uploads-dir> --manifest <out>/manifest.json --execute  (upload + verify)
 *
 * <uploads-dir> is the backup's uploads/ folder: <booking_id>/<file>. The manifest comes from
 * import-backup.mjs and lists the R2 key, type and size of every booking_files row. For each row:
 *   - file missing on disk  → LOST. The row stays; the admin download answers 410 (design: 2 of 6).
 *   - size differs from the row → refused (exit 1) before anything is uploaded.
 *   - --execute: `wrangler r2 object put` (jurisdiction eu, --remote), then `wrangler r2 object get`
 *     back into a temp file and compare SHA-256 with the local file. Any mismatch → exit 1.
 * Output names keys, sizes and hashes only. A JSON report is written next to the manifest.
 * Nothing is ever deleted, locally or in R2.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const sha256File = path => createHash('sha256').update(readFileSync(path)).digest('hex');

/** Pure: manifest + uploads dir → plan rows. */
export function plan(manifest, uploadsDir) {
  return (manifest.files ?? []).map(f => {
    if (!/^bookings\/[0-9a-f-]{36}\/[\w.-]+$/.test(f.key))
      throw new Error(`unexpected key in manifest: ${f.key}`);
    const local = join(uploadsDir, f.key.slice('bookings/'.length));
    if (!existsSync(local)) return { ...f, local, state: 'lost' };
    const size = statSync(local).size;
    if (size !== f.size_bytes) return { ...f, local, state: 'size-mismatch', local_size: size };
    return { ...f, local, state: 'ready', sha256: sha256File(local) };
  });
}

/** Default runner: wrangler with arguments as an array (no shell). */
export const wranglerRunner = args =>
  execFileSync('npx', ['wrangler', ...args], { stdio: ['ignore', 'pipe', 'inherit'] });

export function execute(
  rows,
  { bucket = 'zeo-dental-uploads', runner = wranglerRunner, scratch } = {}
) {
  const tmp = scratch ?? mkdtempSync(join(tmpdir(), 'zeo-r2-verify-'));
  return rows.map((r, i) => {
    if (r.state !== 'ready') return r;
    const target = `${bucket}/${r.key}`;
    runner([
      'r2',
      'object',
      'put',
      target,
      '--file',
      r.local,
      '--content-type',
      r.mime_type,
      '--jurisdiction',
      'eu',
      '--remote',
    ]);
    const back = join(tmp, `verify-${i}`);
    runner(['r2', 'object', 'get', target, '--file', back, '--jurisdiction', 'eu', '--remote']);
    const remote = existsSync(back) ? sha256File(back) : null;
    return {
      ...r,
      state: remote === r.sha256 ? 'verified' : 'hash-mismatch',
      remote_sha256: remote,
    };
  });
}

const line = r =>
  `${r.state.padEnd(13)} ${r.key}  ${String(r.size_bytes).padStart(9)} B  ${r.sha256 ? r.sha256.slice(0, 16) : '-'}`;

function main() {
  const argv = process.argv.slice(2);
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--execute') opts.execute = true;
    else if (argv[i].startsWith('--')) opts[argv[i].slice(2)] = argv[++i];
    else opts._.push(argv[i]);
  }
  const uploadsDir = opts._[0];
  const manifestPath = opts.manifest;
  const bucket = opts.bucket ?? 'zeo-dental-uploads';
  if (!uploadsDir || !manifestPath) {
    console.error(
      'usage: node scripts/upload-files.mjs <uploads-dir> --manifest <manifest.json> [--execute] [--bucket name]'
    );
    process.exit(2);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let rows = plan(manifest, resolve(uploadsDir));
  if (rows.some(r => r.state === 'size-mismatch')) {
    rows.forEach(r => console.log(line(r)));
    console.error('refused: a file on disk does not match its row size');
    process.exit(1);
  }
  if (opts.execute) rows = execute(rows, { bucket });
  rows.forEach(r => console.log(line(r)));
  const count = s => rows.filter(r => r.state === s).length;
  const summary = {
    rows: rows.length,
    ready: count('ready'),
    verified: count('verified'),
    lost: count('lost'),
    hash_mismatch: count('hash-mismatch'),
  };
  console.log(JSON.stringify(summary));
  const report = join(
    dirname(resolve(manifestPath)),
    opts.execute ? 'upload-report.json' : 'upload-plan.json'
  );
  writeFileSync(
    report,
    JSON.stringify({ summary, files: rows.map(({ local, ...r }) => r) }, null, 2) + '\n',
    { mode: 0o600 }
  );
  console.log(`report: ${report}`);
  if (summary.hash_mismatch > 0) process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
