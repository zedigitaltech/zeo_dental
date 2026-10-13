#!/usr/bin/env node
/**
 * Renders the transactional emails to static HTML (+ .txt) files for a visual check in a browser
 * or an email-testing tool. Sample data only — no bindings, no network, nothing is sent.
 *
 *   node scripts/render-email-previews.mjs [outDir] [baseUrl]
 *
 * outDir defaults to ./email-previews. baseUrl defaults to the local public/ folder so the logo
 * shows before it is deployed; pass https://zeodentalclinic.com to preview the real links.
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] ?? 'email-previews');
const baseUrl = process.argv[3] ?? pathToFileURL(path.join(here, '../../public')).href;
const bundle = path.join(tmpdir(), `zeo-email-templates-${process.pid}.mjs`);

await build({
  entryPoints: [path.join(here, '../src/lib/emailTemplates.ts')],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  outfile: bundle,
  logLevel: 'error',
});
const t = await import(pathToFileURL(bundle).href);
rmSync(bundle);

const inTwoWeeks = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
const sample = {
  id: '00000000-0000-4000-8000-000000000000',
  name: 'Maria Rossi',
  email: 'maria.rossi@example.invalid',
  phone: '+39 333 123 4567',
  service: 'Implantologia',
  preferred_date: inTwoWeeks,
  preferred_time: 'morning',
  confirmed_date: inTwoWeeks,
  confirmed_time: '10:30',
  description: 'Vorrei una visita di controllo.\nHo una radiografia recente.',
  notes: null,
  cancellation_reason: 'Richiesta della paziente',
  language: 'it',
};
const undated = {
  ...sample,
  preferred_date: null,
  preferred_time: null,
  confirmed_date: null,
  confirmed_time: null,
};

const files = {};
for (const lang of ['it', 'en', 'sq', 'de', 'el']) {
  files[`confirmation-${lang}`] = t.renderConfirmationEmail({ ...sample, language: lang }, lang, {
    baseUrl,
  });
}
files['confirmation-it-no-date'] = t.renderConfirmationEmail(undated, 'it', { baseUrl });
files['cancellation-it'] = t.renderCancellationEmail(sample, 'it', { baseUrl });
files['clinic-notification'] = t.renderClinicNotification(sample, { baseUrl });
files['clinic-notification-no-date'] = t.renderClinicNotification(
  { ...undated, language: null },
  { baseUrl }
);

mkdirSync(outDir, { recursive: true });
const index = [];
for (const [name, mail] of Object.entries(files)) {
  writeFileSync(path.join(outDir, `${name}.html`), mail.html);
  writeFileSync(path.join(outDir, `${name}.txt`), `Subject: ${mail.subject}\n\n${mail.text}\n`);
  const subject = mail.subject.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  index.push(
    `<li><a href="${name}.html">${name}</a> — ${subject} (<a href="${name}.txt">text</a>)</li>`
  );
}
writeFileSync(
  path.join(outDir, 'index.html'),
  `<!doctype html><meta charset="utf-8"><title>Zeo email previews</title><ul>${index.join('')}</ul>`
);
console.log(`Wrote ${Object.keys(files).length} previews to ${outDir}`);
