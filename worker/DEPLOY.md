# Zeo Dental — Cloudflare runbook

One Cloudflare Worker on Z.E's free account serves the whole site on one origin:
static files from Workers static assets (the Vite build in `../dist`), and the
Worker for `/`, `/{lang}/*` (SEO HTML), `/sitemap.xml`, `/health` and `/api/*`.
D1 `zeo-dental` holds bookings, R2 `zeo-dental-uploads` holds patient files.
Design and owner decisions: `../docs/MIGRATION-CLOUDFLARE.md`.

The Fly app (account `lorenc-ndoj`, not ours) is **never modified**. It stays
the fallback until the cutover is verified (§6).

Everything below runs from `worker/`. Items marked **[verify]** are Cloudflare
or Google facts that could not be checked from the build machine.

Verified locally: `npm run verify` (typecheck + Worker tests + script tests) and
`npm run prodcheck` against `npm run dev` (static assets, `_headers`, redirects,
SEO HTML, sitemap, booking, R2 upload and download, export feeds, soft delete).

## 0. What only Elvi can do

| Step                                                                       | Why it is yours                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------- |
| `npx wrangler login`                                                       | account credentials                                |
| create D1 + R2 (§1)                                                        | account resources                                  |
| new Gemini key (Z.E Google account) and new Resend account/key (EU region) | the old keys are in a Fly account that is not ours |
| set the secrets (§2)                                                       | secrets never go in files                          |
| install the Apps Script (§5)                                               | runs as elvizekaj@zedigital.tech                   |
| nameservers + DNS (§6)                                                     | registrar (Namecheap) + Cloudflare zone            |

## 1. Resources (once)

```bash
cd worker
npm install
npx wrangler login
npx wrangler whoami                               # must show the Z.E account

# D1, in the EU. Jurisdiction cannot be changed after creation.
npx wrangler d1 create zeo-dental --jurisdiction eu        # [verify] flag + free-plan availability
#   fallback if refused:  npx wrangler d1 create zeo-dental --location weur   (placement hint only)
#   → paste the printed database_id into wrangler.toml [[d1_databases]] (replace the 0000… placeholder)

# R2, in the EU jurisdiction. No public access, no r2.dev URL — never enable either.
npx wrangler r2 bucket create zeo-dental-uploads --jurisdiction eu
#   wrangler.toml already has  jurisdiction = "eu"  on the UPLOADS binding   [verify]

npm run db:migrate:remote                         # applies migrations/0000_init.sql
```

Rate limiting: `wrangler.toml` declares two `[[ratelimits]]` bindings (chat 15/60 s,
booking + upload 10/60 s). If the free plan refuses them at deploy **[verify]**,
delete the two blocks and redeploy: the Worker then counts in D1 (`rate_limits`,
keyed by a salted daily hash, no addresses stored).

## 2. Secrets

Each command prompts for the value; nothing is written to disk.

```bash
npx wrangler secret put RESEND_API_KEY            # NEW key, Z.E Resend account, EU region
npx wrangler secret put MAIL_FROM                 # e.g.  Zeo Dental Clinic <noreply@mail.zeodentalclinic.com>
npx wrangler secret put MAIL_TO                   # clinic inbox for new-booking mails (a test inbox for the first prodcheck)
npx wrangler secret put MAIL_TO_PARTNER           # optional second recipient
openssl rand -hex 24 | npx wrangler secret put ADMIN_TOKEN          # also the /receptionist password; keep it in the password manager
openssl rand -hex 24 | npx wrangler secret put SHEETS_EXPORT_TOKEN  # also goes into the Apps Script properties (§5)
openssl rand -hex 32 | npx wrangler secret put RATE_LIMIT_SALT
# Optional, WhatsApp stays off without both:
#   npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID
#   npx wrangler secret put WHATSAPP_ACCESS_TOKEN
```

`ADMIN_TOKEN` and `SHEETS_EXPORT_TOKEN` must be at least 32 characters: with a
shorter value the Worker refuses every admin/export request (500, logged).
`openssl rand -hex 24` gives 48.

Build-time variable (public, not a secret): `VITE_ELFSIGHT_WIDGET_ID` must be in
the shell (or `../.env.production`) when the site is built; the Fly Dockerfile
used `f2d6942e-44a2-4e68-b564-3809a1f1cabb`.

The chatbot needs no key: it runs on Workers AI (`[ai]` binding), model
`@cf/google/gemma-4-26b-a4b-it` with thinking off. Optional var `AI_MODEL` swaps the model.

Resend + DNS: a new Resend domain's DKIM record collides with the existing
`resend._domainkey`. Either verify a subdomain (`mail.zeodentalclinic.com`,
recommended, no collision) or swap the DKIM record only after the flip (§6).
Free tier: 100 e-mails/day.

## 3. First deploy (workers.dev, no traffic yet)

```bash
export VITE_ELFSIGHT_WIDGET_ID=f2d6942e-44a2-4e68-b564-3809a1f1cabb
npm run deploy            # verify (typecheck + tests) → build ../dist → wrangler deploy
ADMIN_TOKEN=… SHEETS_EXPORT_TOKEN=… PRODCHECK_EMAIL=<test inbox> \
  npm run prodcheck -- --base https://zeo-dental.<account>.workers.dev
```

`prodcheck` makes one tagged test booking (clinic mail goes to `MAIL_TO`), uploads
a synthetic JPEG, downloads it as admin, sends a confirmation to `PRODCHECK_EMAIL`,
reads both export feeds, asks the chatbot one question, then soft-deletes the test row
(`deleted_at`). Check the test inbox by hand. All checks must pass before §4.

Measure the upload CPU (**[verify]**: 3 × 10 MB through `formData()` may exceed
the free plan's 10 ms CPU): upload three ~10 MB JPEGs on the workers.dev URL and
watch `npm run logs` / the dashboard for `exceededCpu`. Fallback if it binds:
one raw-body `PUT` per file streamed to R2 (frontend change).

## 4. Data import

The dump and the uploads live outside the repo (`~/Desktop/Backups/zeo-dental/`).
The generated SQL contains personal data: write it outside the repo, remove it
after the import.

```bash
OUT=$(mktemp -d)/zeo-import                 # outside the repo; the script refuses a path inside it
# Optional: one booking id per line for the internal TEST bookings (imported soft-deleted, kept)
node scripts/import-backup.mjs ~/Desktop/Backups/zeo-dental/zeo-dental-db-YYYY-MM-DD.json \
  --out "$OUT" --archive-ids ~/Desktop/Backups/zeo-dental/archive-ids.txt
#   prints counts only. Expected on the 2026-10-12 dump: bookings 23, booking_files 6, chat_usage 31,
#   and backfill_pending = 11 (the 11 real pending leads). If not 11, fix archive-ids before going on.
npx wrangler d1 execute zeo-dental --remote --file "$OUT/import.sql"
npx wrangler d1 execute zeo-dental --remote --command \
  "SELECT (SELECT COUNT(*) FROM bookings) b, (SELECT COUNT(*) FROM booking_files) f, (SELECT COUNT(*) FROM chat_usage) u"

# Files: plan first (keys, sizes, sha256; 2 of 6 are expected LOST — they died in /tmp on Fly)
node scripts/upload-files.mjs ~/Desktop/Backups/zeo-dental/uploads --manifest "$OUT/manifest.json"
node scripts/upload-files.mjs ~/Desktop/Backups/zeo-dental/uploads --manifest "$OUT/manifest.json" --execute
#   each object is read back and compared by SHA-256; report in $OUT/upload-report.json
rm -P "$OUT/import.sql"
```

The importer refuses any row that would break a schema CHECK (it names table,
row and column, never a value). It keeps ids, so re-running is safe: files and
chat usage are `INSERT OR IGNORE`; bookings are overwritten only by a _newer_
Fly row (`updated_at`), so nothing changed in D1 is clobbered.

The two lost files keep their rows; the admin download answers **410**. Whether
the clinic contacts those two patients is open question **d** in the design.

## 5. Google Sheets sync

1. In Drive (as elvizekaj@zedigital.tech) create the spreadsheet **"Zeo Dental — Takimet"**.
   Share it **view-only** with the clinic desk. Edits stay in `/receptionist`.
2. script.google.com → **New project** (standalone, not bound to any sheet, not the
   meta-sync project) → paste `../ops/sheets/zeo-web-sync.gs`.
3. Project Settings → Script Properties:
   `ZW_BASE_URL` (workers.dev URL until §6, then `https://zeodentalclinic.com`),
   `ZW_EXPORT_TOKEN` (= `SHEETS_EXPORT_TOKEN`), `ZW_LIST_SHEET_ID` (the call list),
   `ZW_TAKIMET_SHEET_ID` (step 1), optional `ZW_SKIP_REFS` (comma-separated refs of the
   3 unclear entries, first 8 characters of the id).
4. Run `zwSetup` once, allow access. It adds only the 11 pending leads on the first run,
   then runs every 10 minutes. It writes the "Prenotato per" header into the first empty
   column after H if that header does not exist; it never inserts columns.
5. Exclude `/api/export/*` from Bot Fight Mode / bot rules once the zone is proxied
   **[verify]** — Apps Script requests come from Google IPs without a browser.

Tests for the pure logic: `node --test ../ops/sheets/zeo-web-sync.test.js`.

## 6. Cutover and rollback

1. **Record DNS first**, before touching nameservers:
   - export Namecheap Advanced DNS;
   - `dig` apex and `www` (A/AAAA/CNAME), MX, TXT (SPF, `_dmarc`, site verifications),
     `resend._domainkey` and `send.`, other DKIM selectors, CAA;
   - check whether Namecheap e-mail forwarding is on (its MX records are hidden in the panel);
   - turn off DNSSEC at Namecheap if it is on.
     A capture from 2026-10-12 is in `~/Desktop/Backups/zeo-dental/dns-records-2026-10-12.txt`.
2. Add the zone to Z.E's Cloudflare and compare every record with the capture. Point apex
   and `www` at the **Fly IPs, DNS-only (grey cloud)** — proxying Fly would make its rate
   limiter see Cloudflare's IPs instead of visitors'.
3. Switch the nameservers; wait up to 48 h. **The site does not change in this step.**
   Then confirm mail still works (send to and from the clinic address).
4. Deploy on workers.dev, run `prodcheck` (§3), import the data (§4).
5. **Flip:** check Universal SSL is active for the zone, set apex + `www` to proxied
   (orange), uncomment the two `[[routes]]` in `wrangler.toml`, `npm run deploy`.
   Seconds. Then `npm run prodcheck -- --base https://zeodentalclinic.com`.
6. Delta import at **+1 h** and **+24 h**: dump Fly again (same method as the 2026-10-12
   backup) and repeat §4 (`import-backup.mjs` + `d1 execute`, then `upload-files.mjs`).
   Fly keeps running throughout.
7. **Rollback**
   - bad deploy: `npx wrangler rollback` (previous version, seconds);
   - full revert: remove the `[[routes]]` (redeploy) or delete the route in the dashboard,
     set apex + `www` back to grey → traffic returns to Fly. Bookings made in D1 during the
     window: export them (`/api/export/leads?since=<flip time>` or the receptionist panel)
     and send them to the clinic by hand — nothing writes into Fly.

## 7. Day-two operations

| Task                    | Command                                                                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| live logs               | `npm run logs`                                                                                                                                                                                                 |
| roll back the Worker    | `npx wrangler rollback`                                                                                                                                                                                        |
| roll back the database  | D1 Time Travel, 7 days on the free plan: note the bookmark first (`npx wrangler d1 time-travel info zeo-dental`), then `… time-travel restore zeo-dental --timestamp=<RFC3339>` (destructive for later writes) |
| backup the database     | `npx wrangler d1 export zeo-dental --remote --output zeo-$(date +%F).sql`, then encrypt it (`age`/`gpg`) and store it outside the repo; weekly                                                                 |
| new migration           | add `migrations/0001_….sql` → `npm run db:migrate:remote` → `npm run deploy`                                                                                                                                   |
| rotate the admin token  | `openssl rand -hex 24 \| npx wrangler secret put ADMIN_TOKEN`                                                                                                                                                  |
| rotate the export token | same for `SHEETS_EXPORT_TOKEN`, then update `ZW_EXPORT_TOKEN` in the Apps Script                                                                                                                               |
| heartbeat               | an external pinger on `https://zeodentalclinic.com/health` expecting 200                                                                                                                                       |
| remove a test booking   | `UPDATE bookings SET deleted_at = …` (soft delete only; never `DELETE`)                                                                                                                                        |

Uploaded files are **never purged and never auto-retired** (owner decision
2026-10-12); `booking_files.expires_at` is informational. GDPR retention is to be
revisited with the clinic.

## 8. Free-plan limits and open checks

| Limit           | Value                                        | Zeo's use                                                      |
| --------------- | -------------------------------------------- | -------------------------------------------------------------- |
| Worker requests | 100k/day                                     | each HTML page view and API call counts; static files are free |
| Worker CPU      | 10 ms/request                                | SEO HTML and JSON are small; uploads **[verify]** (§3)         |
| Subrequests     | 50 external / invocation                     | chat: one Workers AI call; confirm: Resend + WhatsApp          |
| Cron triggers   | 5/account                                    | none used (no retention cron)                                  |
| D1 Time Travel  | 7 days                                       | plus the weekly encrypted export                               |
| R2              | 10 GB-month, 1M class A, 10M class B / month | a few MB of X-rays                                             |
| Resend          | 100 e-mails/day                              | one per booking + confirmations                                |
| Workers AI      | 10,000 neurons/day (whole account)           | ~34–48 neurons per chat answer; `CHAT_DAILY_CAP` 120 keeps it free |

Open checks before go-live:

- **[verify]** `wrangler d1 create --jurisdiction eu` on the free plan; `jurisdiction = "eu"` on the R2 binding; `[[ratelimits]]` on the free plan; `wrangler r2 object put/get --jurisdiction eu`.
- Workers compute is not pinned to the EU on the free plan: name Cloudflare and Resend as processors in the privacy policy.

## 9. Security controls (review of 2026-10-12) and known follow-ups

In place:

- Bearer routes and `/api/receptionist/login`: per-address lockout after 10 failed
  attempts in 15 minutes (429, even with the right secret). Unlock = wait, or a new address.
- Chat: history must be `user`/`model` turns with text parts only (≤20 turns, user turns
  ≤1000 chars, model turns ≤4000); total history + message is kept ≤8000 chars by dropping
  the oldest turns. The clinic prompt is sent as the `system` message to Workers AI (no key).
  Upstream errors (including the free neurons running out) are 502 with a generic message.
  Caps: 15/min and `CHAT_DAILY_PER_IP` (40)/day per address, `CHAT_DAILY_CAP` (120)/day global.
- Uploads: `Content-Length` required (411), parsed bytes re-checked, at most 3 files per
  booking in total, D1 rows written before R2 objects (an R2 failure logs the keys).
- Booking fields: name 200, service 100, description 2000, notes 2000, e-mail 254, phone 40
  characters; stricter e-mail format.
- D1 rate-limit fallback is a fixed ring (`<bucket>:<0..4095>`), bounded without any DELETE.
- Apps Script: every website-sourced cell is quote-prefixed when it could start a formula.

Known follow-ups (accepted for now): security review items **10** and **12** — see the
review of `feat/cloudflare-migration`. Also still open from the design: login returns the
admin token itself (parity with Fly, design item 11).

## 10. Deposit links (POK) — off until configured

The call centre's `/agent` page (and reception's booking modal) create a POK payment link
for one fixed deposit of **€500** (`DEPOSIT_AMOUNT = "500.00"`, `DEPOSIT_CURRENCY = "EUR"`, owner decision). The money goes to **Zeo Dental Clinic's own POK merchant account**;
neither the call centre nor Z.E ever receives it. Flow and the agents' wording:
`../docs/DEPOSITS.md`.

The amount is already in wrangler.toml `[vars]`, but until **all** of `POK_KEY_ID`,
`POK_KEY_SECRET`, `POK_MERCHANT_ID` and `AGENT_TOKEN` are set, every `/api/agent/*` and `/api/pay/*` endpoint
answers 503 and `/agent` shows "non configurato". Production is unaffected until then.

**What the clinic must obtain from POK** (the clinic's account, in the clinic's name):

1. A verified **POK merchant account** for Zeo Dental Clinic (NUIS of the clinic).
2. SDK credentials **for staging and for production**: `keyId`, `keySecret`, `merchantId`.
3. Written answers from POK, before going live:
   - EUR orders are accepted for this merchant, and **foreign cards** (Italian patients) can pay
     on the hosted page **[verify]**;
   - the **webhook**: when it is called, from which addresses, and its payload/signature.
     The Worker ignores the body and re-reads the order with `GET /sdk-orders/{id}` **[verify]**;
   - the `Authorization` header format (the SDK sends the raw access token, no `Bearer`) **[verify]**;
   - how a paid order shows: the SDK has no status field, so "paid" = `capturedAmount` ≥ `amount`
     with the same currency **[verify]**;
   - whether an unpaid order can be cancelled (we do not call any cancel endpoint; it expires).

**Secrets** (never in files):

```bash
npx wrangler secret put POK_KEY_ID
npx wrangler secret put POK_KEY_SECRET
npx wrangler secret put POK_MERCHANT_ID
npx wrangler secret put AGENT_TOKEN        # ≥32 chars, different from ADMIN_TOKEN
```

Then check `DEPOSIT_AMOUNT` (`"500.00"`), `DEPOSIT_CURRENCY` (`"EUR"`) and
`DEPOSIT_EXPIRES_MINUTES`, apply the migration and deploy:

```bash
npx wrangler d1 migrations apply zeo-dental --remote   # 0003_deposits.sql, additive only
npm run deploy
```

**Staging test** (`POK_ENV = "staging"`, staging credentials):

1. Log in at `/agent` with `AGENT_TOKEN`, create a link for a test patient with your own e-mail.
2. Pay it on POK's staging page with a staging test card.
3. Within seconds the deposit shows **Pagato**, the clinic inbox gets "Parapagim i paguar" and
   the test e-mail gets the receipt — exactly once. If the webhook never arrives, opening the
   `/agent` list re-checks pending deposits with POK (up to 5 per refresh).
4. Only then switch `POK_ENV = "production"` with the production credentials and repeat once
   with a real small payment the clinic refunds itself.

Controls: the webhook URL carries a random 64-hex token per deposit (constant-time check, 401
without POK being asked), is rate-limited (60/min per address), and only POK's own
`GET /sdk-orders/{id}` can mark a deposit paid, and only when amount and currency match.
At most one pending link per contact (last 9 phone digits, else e-mail; partial unique index):
a double click creates one POK order; a pending link under another name answers 409 and the
agent must confirm to replace it (the old one is cancelled). Cancel/expire/fail only ever move a
*pending* deposit, so "paid" can never be overwritten. "Paid" also requires POK's order id and
reference to be ours and an explicit currency. Unknown ids and wrong tokens on the webhook
both answer 401. Wrong agent tokens count toward the same 10-per-15-minutes lockout as reception.
Sheets: `zwSyncWebsite` also writes "Acconto pagato €X dd/MM" into "Prenotato per" for the
matching call-list row (same ownership rule as bookings); before the migration it skips quietly.
