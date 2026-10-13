/**
 * Deposit-link copy in the site's eight languages (payment request, receipt, WhatsApp text, the
 * POK order description). Plain text only: templates escape every string. Copy rules, on top of
 * emailCopy.ts: the payee is always Zeo Dental Clinic and the money goes straight to the clinic via
 * POK's page; no refund promise, no offer / discount / promotion / guarantee wording; the terms are
 * either the clinic's own page (DEPOSIT_TERMS_URL) or "the clinic will confirm the terms".
 */
import type { EmailLanguage } from './emailLanguage';

export interface DepositCopy {
  /** POK order description, shown on POK's payment page. */
  description: string;
  labels: { payee: string; amount: string; validUntil: string; paidOn: string; reference: string };
  request: {
    subject: string;
    preheader: string;
    title: string;
    intro: string;
    detailsTitle: string;
    button: string;
    linkFallback: string;
  };
  secureNote: string;
  deducted: string;
  termsLink: string;
  termsDefault: string;
  notRequested: string;
  footerNote: string;
  receipt: {
    subject: string;
    preheader: string;
    title: string;
    intro: string;
    detailsTitle: string;
    next: string;
  };
  /** WhatsApp text after the greeting. */
  whatsapp: (amount: string, url: string) => string;
}

export const DEPOSIT_COPY: Record<EmailLanguage, DepositCopy> = {
  sq: {
    description: 'Parapagim — Zeo Dental Clinic',
    labels: {
      payee: 'Përfituesi',
      amount: 'Shuma',
      validUntil: 'E vlefshme deri më',
      paidOn: 'Paguar më',
      reference: 'Referenca',
    },
    request: {
      subject: 'Lidhja për parapagimin – Zeo Dental Clinic',
      preheader: 'Paguani parapagimin në mënyrë të sigurt përmes faqes së POK.',
      title: 'Parapagimi për trajtimin tuaj',
      intro:
        'Siç u ra dakord me ekipin tonë, më poshtë gjeni lidhjen për të paguar parapagimin për trajtimin tuaj në Zeo Dental Clinic.',
      detailsTitle: 'Detajet e pagesës',
      button: 'Paguani parapagimin',
      linkFallback: 'Nëse butoni nuk funksionon, hapni këtë lidhje:',
    },
    secureNote:
      'Pagesa shkon drejtpërdrejt te Zeo Dental Clinic përmes faqes së sigurt të pagesës së POK. Askush tjetër nuk e merr këtë pagesë.',
    deducted: 'Parapagimi zbritet nga kostoja e trajtimit tuaj.',
    termsLink: 'Kushtet e parapagimit:',
    termsDefault: 'Klinika do t’ju konfirmojë kushtet e parapagimit.',
    notRequested: 'Nëse nuk e keni kërkuar këtë pagesë, mund ta injoroni këtë email.',
    footerNote: 'Ky email ju dërgua sepse folët me ekipin e Zeo Dental Clinic për një trajtim.',
    receipt: {
      subject: 'Parapagimi juaj u mor – Zeo Dental Clinic',
      preheader: 'Konfirmim i parapagimit tuaj në Zeo Dental Clinic.',
      title: 'Faleminderit, parapagimi u mor',
      intro: 'Ju konfirmojmë se kemi marrë parapagimin tuaj.',
      detailsTitle: 'Detajet e pagesës',
      next: 'Ekipi ynë do t’ju kontaktojë për hapat e mëtejshëm.',
    },
    whatsapp: (amount, url) =>
      `ja lidhja për parapagimin prej ${amount} për Zeo Dental Clinic. Pagesa shkon drejtpërdrejt te klinika përmes faqes së sigurt të POK: ${url}`,
  },
  en: {
    description: 'Deposit — Zeo Dental Clinic',
    labels: {
      payee: 'Payee',
      amount: 'Amount',
      validUntil: 'Valid until',
      paidOn: 'Paid on',
      reference: 'Reference',
    },
    request: {
      subject: 'Your deposit payment link – Zeo Dental Clinic',
      preheader: 'Pay your deposit securely on POK’s payment page.',
      title: 'Deposit for your treatment',
      intro:
        'As agreed with our team, here is the link to pay the deposit for your treatment at Zeo Dental Clinic.',
      detailsTitle: 'Payment details',
      button: 'Pay deposit',
      linkFallback: 'If the button does not work, open this link:',
    },
    secureNote:
      'The payment goes directly to Zeo Dental Clinic through POK’s secure payment page. Nobody else receives this money.',
    deducted: 'The deposit is deducted from the cost of your treatment.',
    termsLink: 'Deposit terms:',
    termsDefault: 'The clinic will confirm the deposit terms with you.',
    notRequested: 'If you did not request this payment, you can ignore this email.',
    footerNote:
      'You are receiving this email because you spoke with the Zeo Dental Clinic team about a treatment.',
    receipt: {
      subject: 'Deposit received – Zeo Dental Clinic',
      preheader: 'Confirmation of your deposit to Zeo Dental Clinic.',
      title: 'Thank you, your deposit has been received',
      intro: 'We confirm that we have received your deposit.',
      detailsTitle: 'Payment details',
      next: 'Our team will contact you about the next steps.',
    },
    whatsapp: (amount, url) =>
      `here is the link to pay the ${amount} deposit to Zeo Dental Clinic. The payment goes directly to the clinic through POK's secure page: ${url}`,
  },
  it: {
    description: 'Acconto — Zeo Dental Clinic',
    labels: {
      payee: 'Beneficiario',
      amount: 'Importo',
      validUntil: 'Valido fino al',
      paidOn: 'Pagato il',
      reference: 'Riferimento',
    },
    request: {
      subject: 'Link per il pagamento dell’acconto – Zeo Dental Clinic',
      preheader: 'Paghi l’acconto in modo sicuro sulla pagina di pagamento POK.',
      title: 'Acconto per il suo trattamento',
      intro:
        'Come concordato con il nostro team, ecco il link per pagare l’acconto per il suo trattamento presso Zeo Dental Clinic.',
      detailsTitle: 'Dettagli del pagamento',
      button: 'Paga l’acconto',
      linkFallback: 'Se il pulsante non funziona, apra questo link:',
    },
    secureNote:
      'Il pagamento va direttamente a Zeo Dental Clinic tramite la pagina di pagamento sicura di POK. Nessun altro riceve questo denaro.',
    deducted: 'L’acconto viene detratto dal costo del suo trattamento.',
    termsLink: 'Condizioni dell’acconto:',
    termsDefault: 'La clinica le confermerà le condizioni dell’acconto.',
    notRequested: 'Se non ha richiesto questo pagamento, può ignorare questa email.',
    footerNote:
      'Riceve questa email perché ha parlato con il team di Zeo Dental Clinic di un trattamento.',
    receipt: {
      subject: 'Acconto ricevuto – Zeo Dental Clinic',
      preheader: 'Conferma del suo acconto a Zeo Dental Clinic.',
      title: 'Grazie, abbiamo ricevuto il suo acconto',
      intro: 'Le confermiamo di aver ricevuto il suo acconto.',
      detailsTitle: 'Dettagli del pagamento',
      next: 'Il nostro team la contatterà per i prossimi passi.',
    },
    whatsapp: (amount, url) =>
      `ecco il link per pagare l'acconto di ${amount} a Zeo Dental Clinic. Il pagamento va direttamente alla clinica tramite la pagina sicura di POK: ${url}`,
  },
  de: {
    description: 'Anzahlung — Zeo Dental Clinic',
    labels: {
      payee: 'Empfänger',
      amount: 'Betrag',
      validUntil: 'Gültig bis',
      paidOn: 'Bezahlt am',
      reference: 'Referenz',
    },
    request: {
      subject: 'Ihr Link für die Anzahlung – Zeo Dental Clinic',
      preheader: 'Zahlen Sie Ihre Anzahlung sicher auf der Zahlungsseite von POK.',
      title: 'Anzahlung für Ihre Behandlung',
      intro:
        'Wie mit unserem Team vereinbart, finden Sie hier den Link zur Zahlung der Anzahlung für Ihre Behandlung in der Zeo Dental Clinic.',
      detailsTitle: 'Zahlungsdetails',
      button: 'Anzahlung bezahlen',
      linkFallback: 'Falls die Schaltfläche nicht funktioniert, öffnen Sie diesen Link:',
    },
    secureNote:
      'Die Zahlung geht direkt an die Zeo Dental Clinic über die sichere Zahlungsseite von POK. Niemand sonst erhält dieses Geld.',
    deducted: 'Die Anzahlung wird von den Kosten Ihrer Behandlung abgezogen.',
    termsLink: 'Bedingungen der Anzahlung:',
    termsDefault: 'Die Klinik wird Ihnen die Bedingungen der Anzahlung bestätigen.',
    notRequested:
      'Falls Sie diese Zahlung nicht angefordert haben, können Sie diese E-Mail ignorieren.',
    footerNote:
      'Sie erhalten diese E-Mail, weil Sie mit dem Team der Zeo Dental Clinic über eine Behandlung gesprochen haben.',
    receipt: {
      subject: 'Anzahlung erhalten – Zeo Dental Clinic',
      preheader: 'Bestätigung Ihrer Anzahlung an die Zeo Dental Clinic.',
      title: 'Vielen Dank, Ihre Anzahlung ist eingegangen',
      intro: 'Wir bestätigen den Eingang Ihrer Anzahlung.',
      detailsTitle: 'Zahlungsdetails',
      next: 'Unser Team wird Sie wegen der nächsten Schritte kontaktieren.',
    },
    whatsapp: (amount, url) =>
      `hier ist der Link zur Zahlung der Anzahlung von ${amount} an die Zeo Dental Clinic. Die Zahlung geht direkt an die Klinik über die sichere Seite von POK: ${url}`,
  },
  fr: {
    description: 'Acompte — Zeo Dental Clinic',
    labels: {
      payee: 'Bénéficiaire',
      amount: 'Montant',
      validUntil: 'Valable jusqu’au',
      paidOn: 'Payé le',
      reference: 'Référence',
    },
    request: {
      subject: 'Votre lien de paiement de l’acompte – Zeo Dental Clinic',
      preheader: 'Payez votre acompte en toute sécurité sur la page de paiement POK.',
      title: 'Acompte pour votre traitement',
      intro:
        'Comme convenu avec notre équipe, voici le lien pour payer l’acompte de votre traitement à la Zeo Dental Clinic.',
      detailsTitle: 'Détails du paiement',
      button: 'Payer l’acompte',
      linkFallback: 'Si le bouton ne fonctionne pas, ouvrez ce lien :',
    },
    secureNote:
      'Le paiement est versé directement à la Zeo Dental Clinic via la page de paiement sécurisée de POK. Personne d’autre ne reçoit cet argent.',
    deducted: 'L’acompte est déduit du coût de votre traitement.',
    termsLink: 'Conditions de l’acompte :',
    termsDefault: 'La clinique vous confirmera les conditions de l’acompte.',
    notRequested: 'Si vous n’avez pas demandé ce paiement, vous pouvez ignorer cet e-mail.',
    footerNote:
      'Vous recevez cet e-mail car vous avez parlé d’un traitement avec l’équipe de la Zeo Dental Clinic.',
    receipt: {
      subject: 'Acompte reçu – Zeo Dental Clinic',
      preheader: 'Confirmation de votre acompte à la Zeo Dental Clinic.',
      title: 'Merci, votre acompte a été reçu',
      intro: 'Nous vous confirmons la réception de votre acompte.',
      detailsTitle: 'Détails du paiement',
      next: 'Notre équipe vous contactera pour les prochaines étapes.',
    },
    whatsapp: (amount, url) =>
      `voici le lien pour payer l'acompte de ${amount} à la Zeo Dental Clinic. Le paiement va directement à la clinique via la page sécurisée de POK : ${url}`,
  },
  tr: {
    description: 'Ön ödeme — Zeo Dental Clinic',
    labels: {
      payee: 'Alıcı',
      amount: 'Tutar',
      validUntil: 'Son geçerlilik',
      paidOn: 'Ödeme tarihi',
      reference: 'Referans',
    },
    request: {
      subject: 'Ön ödeme bağlantınız – Zeo Dental Clinic',
      preheader: 'Ön ödemenizi POK’un güvenli ödeme sayfasında yapın.',
      title: 'Tedaviniz için ön ödeme',
      intro:
        'Ekibimizle kararlaştırıldığı gibi, Zeo Dental Clinic’teki tedaviniz için ön ödeme bağlantısını aşağıda bulabilirsiniz.',
      detailsTitle: 'Ödeme bilgileri',
      button: 'Ön ödemeyi yap',
      linkFallback: 'Düğme çalışmazsa bu bağlantıyı açın:',
    },
    secureNote:
      'Ödeme, POK’un güvenli ödeme sayfası üzerinden doğrudan Zeo Dental Clinic’e gider. Bu parayı başka kimse almaz.',
    deducted: 'Ön ödeme, tedavinizin ücretinden düşülür.',
    termsLink: 'Ön ödeme koşulları:',
    termsDefault: 'Klinik, ön ödeme koşullarını sizinle teyit edecektir.',
    notRequested: 'Bu ödemeyi siz talep etmediyseniz bu e-postayı dikkate almayabilirsiniz.',
    footerNote:
      'Bu e-postayı, bir tedavi hakkında Zeo Dental Clinic ekibiyle görüştüğünüz için alıyorsunuz.',
    receipt: {
      subject: 'Ön ödemeniz alındı – Zeo Dental Clinic',
      preheader: 'Zeo Dental Clinic’e yaptığınız ön ödemenin onayı.',
      title: 'Teşekkürler, ön ödemeniz alındı',
      intro: 'Ön ödemenizi aldığımızı onaylarız.',
      detailsTitle: 'Ödeme bilgileri',
      next: 'Ekibimiz sonraki adımlar için sizinle iletişime geçecektir.',
    },
    whatsapp: (amount, url) =>
      `Zeo Dental Clinic'e ${amount} tutarındaki ön ödeme bağlantınız burada. Ödeme, POK'un güvenli sayfası üzerinden doğrudan kliniğe gider: ${url}`,
  },
  el: {
    description: 'Προκαταβολή — Zeo Dental Clinic',
    labels: {
      payee: 'Δικαιούχος',
      amount: 'Ποσό',
      validUntil: 'Ισχύει έως',
      paidOn: 'Πληρώθηκε στις',
      reference: 'Αναφορά',
    },
    request: {
      subject: 'Ο σύνδεσμος πληρωμής της προκαταβολής σας – Zeo Dental Clinic',
      preheader: 'Πληρώστε την προκαταβολή σας με ασφάλεια στη σελίδα πληρωμής της POK.',
      title: 'Προκαταβολή για τη θεραπεία σας',
      intro:
        'Όπως συμφωνήσαμε με την ομάδα μας, ακολουθεί ο σύνδεσμος για την πληρωμή της προκαταβολής για τη θεραπεία σας στη Zeo Dental Clinic.',
      detailsTitle: 'Στοιχεία πληρωμής',
      button: 'Πληρωμή προκαταβολής',
      linkFallback: 'Αν το κουμπί δεν λειτουργεί, ανοίξτε αυτόν τον σύνδεσμο:',
    },
    secureNote:
      'Η πληρωμή πηγαίνει απευθείας στη Zeo Dental Clinic μέσω της ασφαλούς σελίδας πληρωμής της POK. Κανείς άλλος δεν λαμβάνει αυτά τα χρήματα.',
    deducted: 'Η προκαταβολή αφαιρείται από το κόστος της θεραπείας σας.',
    termsLink: 'Όροι της προκαταβολής:',
    termsDefault: 'Η κλινική θα σας επιβεβαιώσει τους όρους της προκαταβολής.',
    notRequested: 'Αν δεν ζητήσατε αυτή την πληρωμή, μπορείτε να αγνοήσετε αυτό το email.',
    footerNote:
      'Λαμβάνετε αυτό το email επειδή μιλήσατε με την ομάδα της Zeo Dental Clinic για μια θεραπεία.',
    receipt: {
      subject: 'Η προκαταβολή σας ελήφθη – Zeo Dental Clinic',
      preheader: 'Επιβεβαίωση της προκαταβολής σας στη Zeo Dental Clinic.',
      title: 'Ευχαριστούμε, η προκαταβολή σας ελήφθη',
      intro: 'Επιβεβαιώνουμε ότι λάβαμε την προκαταβολή σας.',
      detailsTitle: 'Στοιχεία πληρωμής',
      next: 'Η ομάδα μας θα επικοινωνήσει μαζί σας για τα επόμενα βήματα.',
    },
    whatsapp: (amount, url) =>
      `ορίστε ο σύνδεσμος για την προκαταβολή των ${amount} στη Zeo Dental Clinic. Η πληρωμή πηγαίνει απευθείας στην κλινική μέσω της ασφαλούς σελίδας της POK: ${url}`,
  },
  es: {
    description: 'Anticipo — Zeo Dental Clinic',
    labels: {
      payee: 'Beneficiario',
      amount: 'Importe',
      validUntil: 'Válido hasta',
      paidOn: 'Pagado el',
      reference: 'Referencia',
    },
    request: {
      subject: 'Su enlace de pago del anticipo – Zeo Dental Clinic',
      preheader: 'Pague su anticipo de forma segura en la página de pago de POK.',
      title: 'Anticipo para su tratamiento',
      intro:
        'Tal como acordó con nuestro equipo, aquí tiene el enlace para pagar el anticipo de su tratamiento en Zeo Dental Clinic.',
      detailsTitle: 'Detalles del pago',
      button: 'Pagar el anticipo',
      linkFallback: 'Si el botón no funciona, abra este enlace:',
    },
    secureNote:
      'El pago va directamente a Zeo Dental Clinic a través de la página de pago segura de POK. Nadie más recibe este dinero.',
    deducted: 'El anticipo se deduce del coste de su tratamiento.',
    termsLink: 'Condiciones del anticipo:',
    termsDefault: 'La clínica le confirmará las condiciones del anticipo.',
    notRequested: 'Si no ha solicitado este pago, puede ignorar este correo.',
    footerNote:
      'Recibe este correo porque habló con el equipo de Zeo Dental Clinic sobre un tratamiento.',
    receipt: {
      subject: 'Anticipo recibido – Zeo Dental Clinic',
      preheader: 'Confirmación de su anticipo a Zeo Dental Clinic.',
      title: 'Gracias, hemos recibido su anticipo',
      intro: 'Le confirmamos que hemos recibido su anticipo.',
      detailsTitle: 'Detalles del pago',
      next: 'Nuestro equipo se pondrá en contacto con usted para los próximos pasos.',
    },
    whatsapp: (amount, url) =>
      `aquí tiene el enlace para pagar el anticipo de ${amount} a Zeo Dental Clinic. El pago va directamente a la clínica a través de la página segura de POK: ${url}`,
  },
};
