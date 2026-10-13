# Deposit links (acconto) — how it works

Status: built, **off** until the clinic's POK credentials and `AGENT_TOKEN` are configured
(the amount, €500, is already set) (`worker/DEPLOY.md` §10).

## Who gets the money

The deposit is paid on **POK's secure payment page** straight into **Zeo Dental Clinic's own POK
merchant account**. The call centre, the agency and Z.E never receive, hold or forward the money.
The website only creates the link and records whether POK reports it paid.

## Flow

1. The agent opens `https://zeodentalclinic.com/agent` (password = `AGENT_TOKEN`), types name,
   phone and/or e-mail, the patient's language (default Italiano) and optionally the call-list
   row, and presses **Crea e invia link acconto**.
2. The Worker creates a POK order for the fixed deposit of **€500** (`DEPOSIT_AMOUNT`,
   `DEPOSIT_CURRENCY`), valid 72 h, and returns the link. If the same patient (same phone or
   e-mail and same name) already has an open link, that link is returned instead of a new one.
   If the open link is under another name (shared family phone), the page asks before replacing it.
3. If there is an e-mail, the patient receives a branded e-mail in their language with the
   amount, the expiry, the "Pay deposit" button, and the line that the payment goes directly to
   Zeo Dental Clinic through POK. The agent can also press **Apri WhatsApp** to send a short
   message with the link from their own WhatsApp.
4. When the patient pays, POK calls the webhook; the Worker asks POK for the order and marks it
   **Pagato** only if POK reports the full amount captured. Then, once: the clinic gets an
   Albanian notification and the patient a receipt.
5. The call list ("Lead da chiamare") shows "Acconto pagato €X dd/MM" in "Prenotato per" for the
   matching row (by phone or e-mail), never overwriting what an agent typed.
6. Reception sees the deposit status on a website booking and can send a link from there too.

After paying, POK sends the patient back to `/{lang}/pay/thanks` (or `/pay/failed`). The thanks
page does **not** say "paid": it says the clinic will confirm by e-mail.

## What agents say (Italian)

> «Le invio ora il link per l'acconto. Il pagamento va direttamente a Zeo Dental Clinic tramite
> la pagina di pagamento sicura di POK: noi del call center non riceviamo alcun denaro.»

Do not promise refunds, discounts or anything about the terms: «Le condizioni dell'acconto
gliele conferma la clinica.» The deposit is deducted from the cost of the treatment.

## Not stored

No health data: only name, phone, e-mail, language, amount, status, the agent label and the
call-list note. Rows are never deleted (soft delete only).
