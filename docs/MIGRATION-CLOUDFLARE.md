# Zeo Dental — Fly.io → Cloudflare migration

## Owner decisions (2026-10-12)

- **Host:** Cloudflare (Worker + D1 + R2), Z.E's free account. Not DGX (latency).
- **Uploads retention:** DO NOT delete patient files. No purge and no auto-retire cron; the 90-day `expires_at` stays informational. (GDPR retention to be revisited with the clinic.)
- **Backfill:** only the 11 real pending leads go into the sheets. The 9 archived tests and the 3 unclear entries stay out.
- **Chatbot:** free. Changed 2026-10-13 from the Gemini free tier to Cloudflare Workers AI (Gemma 4, no key, 10,000 neurons/day free). Data-use terms for prompts **[verify]** before go-live.
- **Reception views:** both. Call list gets a "Prenotato per" column. A separate view-only Albanian sheet "Zeo Dental — Takimet" goes to the clinic desk.
- **Keys:** the Resend key is copied from Fly; no Gemini key is needed any more. The old ones live in a Fly account that is not ours.
- The old Fly account (lorenc-ndoj, overdue) is never modified; it stays as a fallback until cutover is verified.

Everything below comes from reading the worktree code, the backup's schema section (I did not read the patient rows), `fanar/` and `meta-sync.gs`. Items marked **[verify]** are Cloudflare or Google facts I could not check from here.

### Problems in the current code that change the design

1. **Email-only bookings fail.** In production `bookings.phone` is still NOT NULL; migration 005 only relaxed `email`. The code allows a booking with just an email, so that insert would hit the constraint and return 500.
2. **The schema has drifted.** Production has no `check_booking_status`, `idx_bookings_created` or `idx_chat_usage_date`.
3. **Two uploads are lost.** There are 6 `booking_files` rows but only 4 files on disk; the other 2 died in `/tmp`.
4. **Admins have no way to read uploaded files.** No endpoint serves them.
5. **The 90-day `expires_at` is never enforced.**
6. **The booking email goes only to the clinic** (`MAIL_TO`, default gmail, plus `MAIL_TO_PARTNER`). Patients get mail only when reception confirms or cancels, not when they book.
7. **Background work would be killed on Workers.** The email, the `chat_usage` insert and CRM sync are fire-and-forget. On Workers they must go through `ctx.waitUntil` or they get cut off.
8. **Key leak risk at build time.** `vite.config.ts` copies `GEMINI_API_KEY` into the browser bundle if it is set during the build. Remove that `define`.
9. **Visitor IPs go to a third party.** Language detection sends each IP over plain http to ip-api.com. `request.cf.country` does the same job with no outside call.
10. **CRM sync and WhatsApp are switched off in production** (no `CRM_*` or `WHATSAPP_*` secrets). Don't port CRM sync. Keep WhatsApp, which already returns false when unconfigured.
11. **Admin login returns the `ADMIN_TOKEN` itself.** Keep this for parity, flagged.
12. **The chat model may be retired.** `gemini-2.0-flash` may be retired **[verify]**; test the live chat now.

### 1) Target architecture

- **Hosting:** one Worker with static assets, not Pages. This matches fanar.
- **wrangler.toml:**
  - `not_found_handling = "none"`, so any path with no matching file reaches the Worker.
  - `run_worker_first = ["/", "/api/*", "/health", "/sitemap.xml"]`.
  - Delete `public/sitemap.xml`; it is stale and would shadow the dynamic one.
  - Observability on.
- **Framework:** Hono. It handles about 16 routes with params; fanar uses a plain `fetch` handler, which would also work. Use raw D1 prepared statements behind small repository functions, no ORM.
- **SEO pages:** port `renderHtml` and `seoMeta.ts` unchanged. Fetch the template once per isolate via `env.ASSETS.fetch('/index.html')`, then do the same regex replacements.
  - `/{lang}/*` returns the injected HTML.
  - `/` redirects 302 to the `zeo-lang` cookie language, else `cf.country`, else `en`.
  - Any other path without a file extension redirects 302 to `/en<path>`.
  - Missing files return 404.
- **Headers:** take the real header set from Fly with `curl -sI`. Static files get them from `public/_headers`; Worker responses get them from a `HARDENING` const. This includes the Elfsight CSP.
- **D1 (`zeo-dental`):** create with `--jurisdiction eu` **[verify it exists on the free plan]**, else `--location weur` (only a hint). This setting cannot be changed after creation.
  - `id TEXT PRIMARY KEY` (existing UUIDs kept, new ones from `crypto.randomUUID()`).
  - Timestamps as `TEXT` ISO-8601 UTC with milliseconds and `Z`, default `strftime('%Y-%m-%dT%H:%M:%fZ','now')`. Dates as `TEXT YYYY-MM-DD` with a GLOB check.
  - Booleans as `INTEGER CHECK IN (0,1)`, mapped back to true/false so JSON stays identical.
  - `CHECK status IN (5 values)`, `CHECK preferred_time IN (morning, afternoon, evening)`, `phone` nullable plus `CHECK (phone IS NOT NULL OR email IS NOT NULL)`.
  - `deleted_at` on all three tables. `booking_files.booking_id REFERENCES bookings` without CASCADE. Add `retired_at`.
  - Set `updated_at` explicitly in every UPDATE. Translate Postgres-only SQL: `ILIKE` becomes `LIKE` (case-insensitive only for ASCII), and `NOW()-INTERVAL` becomes `datetime('now','-7 days')`.
- **R2:** bucket `zeo-dental-uploads`, `--jurisdiction eu`, with `jurisdiction="eu"` on the binding **[verify]**. No public access, no r2.dev URL. Keys are `bookings/<booking_id>/<uuid>.<ext>`. No personal data in object metadata.
- **Rate limiting:** a Rate Limiting binding for chat (15/60s) and booking/upload (10/60s) **[verify free plan; it counts per data centre]**. If that isn't available, use a D1 counter keyed by a daily salted IP hash, as fanar does. Add a daily cap on Gemini calls taken from `chat_usage`. Drop the global 200/min limit, since static files are free.
- **Cron (daily):** soft-retire expired files (sets `retired_at`). Whether the R2 object is actually purged is open question **c**.

### 2) API parity (old to new)

| Old                                                                                                               | New                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/`, `/{lang}/*`, unprefixed path, `/sitemap.xml`                                                                 | Same behaviour (see SEO pages above)                                                                                  |
| `GET /health`, `/api/detect-language`                                                                             | Same; language from `cf.country`                                                                                      |
| `POST /api/chat`                                                                                                  | Same; usage insert via `waitUntil`                                                                                    |
| `POST /api/booking`                                                                                               | Same; email via `waitUntil` (Resend over `fetch`); email-only bookings now work                                       |
| `POST /api/booking/:id/files`                                                                                     | `request.formData()` to R2. Also check the file's actual type (magic bytes), not just the MIME type the browser sends |
| `GET /api/bookings`, `/api/receptionist/*` (login, stats, chat-stats, bookings list/get, confirm, cancel, status) | Same, Bearer token. Every query filters `deleted_at IS NULL`                                                          |
| **New** `GET /api/receptionist/bookings/:id/files[/:fileId]`                                                      | Admin only. Streams from R2 with `no-store` and `attachment`; returns 410 for the 2 lost files                        |
| **New** `GET /api/export/leads?since=`, `/api/export/appointments`                                                | Separate `SHEETS_EXPORT_TOKEN`, read-only (see sheet sync below)                                                      |

### 3) Data migration

1. Write `scripts/import-backup.mjs`. It reads the JSON outside the repo and writes SQL to the scratchpad, never into git.
2. Normalise values: timestamps to ISO `Z`. Dates: assert every value ends in `T00:00:00.000Z`, then keep the first 10 characters. Booleans to 0/1.
3. Assert every row passes the new CHECKs before inserting.
4. Insert in order bookings, files, chat_usage with explicit ids, using `INSERT OR IGNORE`.
5. Apply with `wrangler d1 execute --remote --file`.
6. Upload the 4 files to `bookings/<bid>/<file>` and rewrite `storage_path` to match. Verify by row counts (23/6/31) and the SHA-256 of each object.
7. After cutover, run the delta: dump Fly again and import again. Because ids are kept and inserts ignore duplicates, re-running is safe.

### 4) Implementation tasks (tests first, run in CI)

1. Golden SEO test: save Fastify `renderHtml` output for 15 routes × 8 languages, and require the Worker output to be byte-identical.
2. Schema `0000_init.sql` plus importer, tested on a synthetic fixture (no real patient data).
3. Port the routes and `server/tests` to `@cloudflare/vitest-pool-workers` (local D1 and R2).
4. Headers and CSP parity test against the saved Fly headers.
5. Uploads to R2, the admin file endpoints and the retention cron.
6. Export endpoints and the Apps Script (below).
7. `prodcheck.mjs` smoke test: tagged test booking, upload, email to a test inbox, then soft-delete the test row.
8. `DEPLOY.md` in the fanar style. Run `security-reviewer` before the first deploy.

### 5) Cutover and rollback

1. **Record DNS first**, before touching nameservers.
   - Export Namecheap Advanced DNS.
   - `dig` apex and `www` (A/AAAA/CNAME), MX, TXT (SPF, `_dmarc`, site verifications), the `resend._domainkey` and `send.` records, other DKIM selectors, and CAA.
   - Check whether Namecheap email forwarding is on; its MX records are hidden in the panel.
   - Turn off DNSSEC at Namecheap if it is enabled.
2. Add the zone to Z.E's Cloudflare and compare every record against the capture. Point apex and `www` at the **Fly IPs, DNS-only (grey cloud)**. Proxying Fly would make its rate limiter see Cloudflare's IPs instead of visitors'.
3. Switch the nameservers and wait up to 48h. **The site doesn't change during this step**; then confirm mail still works.
4. Deploy on workers.dev, run `prodcheck`, then import the data.
5. **Flip:** set apex and `www` to proxied (orange cloud) and add the Workers Route `zeodentalclinic.com/*`. Check that Universal SSL is active first. This takes seconds.
6. Run the delta import at +1h and +24h. Fly keeps running throughout.
7. **Rollback:** use `wrangler rollback` for a bad deploy. For a full revert, delete the route and set the records back to grey; traffic returns to Fly. Bookings made in D1 during the window are exported and sent to the clinic by hand, since we don't write into Fly.

### Owner requirement: Google Sheet sync

**Use pull, not push** (the coordinator's lean is right). Push would put a Google service-account key in the Worker and need RS256 signing plus a second secret. Pull keeps all Google access in Apps Script owned by elvizekaj@zedigital.tech.

- **Export endpoints.** They return only `ref` (first 8 characters of the id), `created_at`, `updated_at`, name, phone, email, `preferred_date`, `preferred_time`, `confirmed_date`, `confirmed_time` and `status`.
  - They never return `description`, `notes`, `service` (the treatment interest) or files.
  - `leads` takes an `(updated_at, id)` cursor; `appointments` returns upcoming bookings that aren't deleted.
  - The token is kept in Script Properties.
  - Exclude `/api/export/*` from Bot Fight Mode **[verify]**.
- **New standalone project `zeo-web-sync.gs`.** Separate from `meta-sync.gs`, with no shared function names (that file's own header warns about this). It reuses `phone()` and the dedupe rule by copying them in, and runs every 10 minutes.
- **(1) Call list:** append-only, deduped by last 9 phone digits or email.
  - F = `NUOVO Sito dd/MM HH:mm · ref xxxx`.
  - **"Prenotato per" goes in a new column**, found by its header text in the first empty column after H. Never insert a column (that would break the G/H dropdowns, the formula in A2 and the conditional formatting).
  - E keeps its Meta meaning and stays blank for website rows.
  - The script owns only the "Prenotato per" cell: it fills it when a booking is a duplicate and the cell is empty, and changes it to "Confermato: …" when reception confirms (matched by ref). It never touches cells the agents edit.
- **(2) Front desk:** a separate file, **"Zeo Dental — Takimet"**, so the desk has no access to the call list.
  - Tab "Takimet" is fully rewritten each run, sorted by confirmed date, else preferred date (Europe/Tirane).
  - Columns: Data, Ora, Emri, Telefon, Email, Statusi, Konfirmuar më. Undated quote requests go in a "Pa datë" section.
  - Share view-only. Edits stay in `/receptionist`.

### 6) Risks and open questions

- **a. Keys:** the Gemini and Resend keys are in a Fly account that isn't ours, so we cannot read them. New keys are needed.
  - Gemini: if we use the free tier, its terms may bar serving EEA/UK users and allow Google to use the data **[verify]**.
  - Resend: a new account in the EU region. Its DKIM collides with the existing `resend._domainkey`, so either verify `mail.zeodentalclinic.com` or swap the DKIM record only after the flip. Free tier is 100 emails/day.
- **b. Upload CPU limit:** 3 × 10 MB through `formData()` may exceed the free plan's 10 ms CPU per request. Measure it; the fallback is one raw-body PUT per file streamed to R2.
- **c. Purging expired files:** the soft-delete-only rule conflicts with the 90-day GDPR retention. This needs Elvi's decision.
- **d. Lost files:** should the clinic contact the 2 patients whose files were lost?
- **e. Backfill:** should the 23 old bookings be copied into the sheets?
- **f. Where requests are processed:** Workers compute is not pinned to the EU on the free plan. Cloudflare and Resend need to be named as processors in the privacy policy.
- **g. Free-plan limits:** 100k Worker requests/day (each HTML page view counts), cron triggers 2 of 5 used on the account, D1 Time Travel 7 days. Add a periodic encrypted `wrangler d1 export`.

Files: `/Users/ezekaj/Desktop/Code/Web/websites/zeo_dental/.claude/worktrees/agent-a12b78e526e559f72/server/src/{index.ts,routes/*.ts,utils/seoMeta.ts,services/emailTemplates.ts}`, `.../server/migrations/*.sql`, `.../vite.config.ts`, `.../components/Booking.tsx`, `/Users/ezekaj/Desktop/Code/fanar/{wrangler.toml,DEPLOY.md}`, `/Users/ezekaj/Desktop/call_dental_turism/ops/zeo/sync/meta-sync.gs`.
