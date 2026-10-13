/**
 * Patient-facing email copy in the site's eight languages. Plain text only: the templates escape
 * every string before it reaches HTML. Copy rules: warm and professional, formal address, no
 * offers / discounts / guarantees, no medical claims, no facts beyond those already on the site
 * (address, phone, email, "arrive 10 minutes early").
 */
import type { EmailLanguage } from './emailLanguage';

export interface EmailCopy {
  /** BCP-47 locale for Intl date formatting. */
  locale: string;
  /** The language's own name, shown to clinic staff. */
  languageName: string;
  greeting: (name: string) => string;
  labels: { service: string; date: string; time: string; address: string };
  addressValue: string;
  slots: { morning: string; afternoon: string; evening: string };
  /** Shown instead of a date when none is set yet. */
  noDate: string;
  /** Shown instead of a time when a date is set but no time. */
  timeTbd: string;
  whatsappButton: string;
  directionsButton: string;
  help: string;
  signoff: string;
  team: string;
  footerNote: string;
  confirmation: {
    subject: string;
    preheader: string;
    title: string;
    intro: string;
    detailsTitle: string;
    arriveNote: string;
  };
  cancellation: {
    subject: string;
    preheader: string;
    title: string;
    intro: string;
    detailsTitle: string;
    reason: string;
    rebook: string;
  };
}

const NBSP = ' ';

export const EMAIL_COPY: Record<EmailLanguage, EmailCopy> = {
  sq: {
    locale: 'sq-AL',
    languageName: 'Shqip',
    greeting: name => `I/E nderuar ${name},`,
    labels: { service: 'Shërbimi', date: 'Data', time: 'Ora', address: 'Adresa' },
    addressValue: 'Rruga Hamdi Sina, Tiranë, Shqipëri',
    slots: { morning: 'Paradite', afternoon: 'Pasdite', evening: 'Mbrëmje' },
    noDate: 'Do t’ju kontaktojmë së shpejti për të caktuar datën dhe orën.',
    timeTbd: 'Do të konfirmohet',
    whatsappButton: 'Na shkruani në WhatsApp',
    directionsButton: 'Si të vini te klinika',
    help: 'Keni pyetje ose dëshironi të ndryshoni takimin? Na shkruani ose na telefononi.',
    signoff: 'Me respekt,',
    team: 'Ekipi i Zeo Dental Clinic',
    footerNote: 'Ky email ju dërgua sepse kërkuat një takim në Zeo Dental Clinic.',
    confirmation: {
      subject: 'Takimi juaj është konfirmuar – Zeo Dental Clinic',
      preheader: 'Detajet e takimit tuaj në Zeo Dental Clinic, Tiranë.',
      title: 'Takimi juaj është konfirmuar',
      intro:
        'Faleminderit që zgjodhët Zeo Dental Clinic. Takimi juaj është konfirmuar dhe më poshtë gjeni të gjitha detajet.',
      detailsTitle: 'Detajet e takimit',
      arriveNote: 'Ju lutemi paraqituni 10 minuta përpara orarit të caktuar.',
    },
    cancellation: {
      subject: 'Takimi juaj është anuluar – Zeo Dental Clinic',
      preheader: 'Takimi juaj në Zeo Dental Clinic është anuluar.',
      title: 'Takimi juaj është anuluar',
      intro: 'Ju njoftojmë se takimi juaj është anuluar.',
      detailsTitle: 'Takimi i anuluar',
      reason: 'Arsyeja',
      rebook: 'Nëse dëshironi të caktoni një takim të ri, do të jemi të lumtur t’ju ndihmojmë.',
    },
  },
  en: {
    locale: 'en-GB',
    languageName: 'English',
    greeting: name => `Dear ${name},`,
    labels: { service: 'Service', date: 'Date', time: 'Time', address: 'Address' },
    addressValue: 'Rruga Hamdi Sina, Tirana, Albania',
    slots: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
    noDate: 'We will contact you shortly to agree the date and time.',
    timeTbd: 'To be confirmed',
    whatsappButton: 'Message us on WhatsApp',
    directionsButton: 'Get directions',
    help: 'Questions, or need to change your appointment? Message or call us.',
    signoff: 'Kind regards,',
    team: 'The Zeo Dental Clinic team',
    footerNote:
      'You are receiving this email because you requested an appointment at Zeo Dental Clinic.',
    confirmation: {
      subject: 'Your appointment is confirmed – Zeo Dental Clinic',
      preheader: 'Your appointment details at Zeo Dental Clinic, Tirana.',
      title: 'Your appointment is confirmed',
      intro:
        'Thank you for choosing Zeo Dental Clinic. Your appointment is confirmed and you will find all the details below.',
      detailsTitle: 'Appointment details',
      arriveNote: 'Please arrive 10 minutes before your appointment time.',
    },
    cancellation: {
      subject: 'Your appointment has been cancelled – Zeo Dental Clinic',
      preheader: 'Your appointment at Zeo Dental Clinic has been cancelled.',
      title: 'Your appointment has been cancelled',
      intro: 'We would like to let you know that your appointment has been cancelled.',
      detailsTitle: 'Cancelled appointment',
      reason: 'Reason',
      rebook: 'If you would like to book a new appointment, we will be glad to help.',
    },
  },
  it: {
    locale: 'it-IT',
    languageName: 'Italiano',
    greeting: name => `Gentile ${name},`,
    labels: { service: 'Servizio', date: 'Data', time: 'Ora', address: 'Indirizzo' },
    addressValue: 'Rruga Hamdi Sina, Tirana, Albania',
    slots: { morning: 'Mattina', afternoon: 'Pomeriggio', evening: 'Sera' },
    noDate: 'La contatteremo a breve per concordare insieme data e ora.',
    timeTbd: 'Da confermare',
    whatsappButton: 'Ci scriva su WhatsApp',
    directionsButton: 'Indicazioni stradali',
    help: 'Ha domande o desidera modificare l’appuntamento? Ci scriva o ci chiami.',
    signoff: 'Cordiali saluti,',
    team: 'Il team di Zeo Dental Clinic',
    footerNote: 'Riceve questa email perché ha richiesto un appuntamento presso Zeo Dental Clinic.',
    confirmation: {
      subject: 'Il suo appuntamento è confermato – Zeo Dental Clinic',
      preheader: 'I dettagli del suo appuntamento presso Zeo Dental Clinic, Tirana.',
      title: 'Il suo appuntamento è confermato',
      intro:
        'Grazie per aver scelto Zeo Dental Clinic. Il suo appuntamento è confermato: qui sotto trova tutti i dettagli.',
      detailsTitle: 'Dettagli dell’appuntamento',
      arriveNote: 'La preghiamo di presentarsi 10 minuti prima dell’orario dell’appuntamento.',
    },
    cancellation: {
      subject: 'Il suo appuntamento è stato annullato – Zeo Dental Clinic',
      preheader: 'Il suo appuntamento presso Zeo Dental Clinic è stato annullato.',
      title: 'Il suo appuntamento è stato annullato',
      intro: 'Le comunichiamo che il suo appuntamento è stato annullato.',
      detailsTitle: 'Appuntamento annullato',
      reason: 'Motivo',
      rebook: 'Se desidera fissare un nuovo appuntamento, saremo lieti di aiutarla.',
    },
  },
  de: {
    locale: 'de-DE',
    languageName: 'Deutsch',
    greeting: name => `Guten Tag ${name},`,
    labels: { service: 'Leistung', date: 'Datum', time: 'Uhrzeit', address: 'Adresse' },
    addressValue: 'Rruga Hamdi Sina, Tirana, Albanien',
    slots: { morning: 'Vormittag', afternoon: 'Nachmittag', evening: 'Abend' },
    noDate: 'Wir melden uns in Kürze bei Ihnen, um Datum und Uhrzeit abzustimmen.',
    timeTbd: 'Wird noch bestätigt',
    whatsappButton: 'Schreiben Sie uns auf WhatsApp',
    directionsButton: 'Route planen',
    help: 'Haben Sie Fragen oder möchten Sie Ihren Termin ändern? Schreiben Sie uns oder rufen Sie uns an.',
    signoff: 'Mit freundlichen Grüßen',
    team: 'Ihr Team der Zeo Dental Clinic',
    footerNote:
      'Sie erhalten diese E-Mail, weil Sie einen Termin in der Zeo Dental Clinic angefragt haben.',
    confirmation: {
      subject: 'Ihr Termin ist bestätigt – Zeo Dental Clinic',
      preheader: 'Die Details zu Ihrem Termin in der Zeo Dental Clinic, Tirana.',
      title: 'Ihr Termin ist bestätigt',
      intro:
        'Vielen Dank, dass Sie sich für die Zeo Dental Clinic entschieden haben. Ihr Termin ist bestätigt – alle Details finden Sie unten.',
      detailsTitle: 'Termindetails',
      arriveNote: 'Bitte kommen Sie 10 Minuten vor Ihrem Termin.',
    },
    cancellation: {
      subject: 'Ihr Termin wurde storniert – Zeo Dental Clinic',
      preheader: 'Ihr Termin in der Zeo Dental Clinic wurde storniert.',
      title: 'Ihr Termin wurde storniert',
      intro: 'Wir möchten Sie darüber informieren, dass Ihr Termin storniert wurde.',
      detailsTitle: 'Stornierter Termin',
      reason: 'Grund',
      rebook: 'Wenn Sie einen neuen Termin vereinbaren möchten, helfen wir Ihnen gerne weiter.',
    },
  },
  fr: {
    locale: 'fr-FR',
    languageName: 'Français',
    greeting: name => `Bonjour ${name},`,
    labels: { service: 'Prestation', date: 'Date', time: 'Heure', address: 'Adresse' },
    addressValue: 'Rruga Hamdi Sina, Tirana, Albanie',
    slots: { morning: 'Matin', afternoon: 'Après-midi', evening: 'Soir' },
    noDate: 'Nous vous contacterons très prochainement pour convenir de la date et de l’heure.',
    timeTbd: 'À confirmer',
    whatsappButton: 'Écrivez-nous sur WhatsApp',
    directionsButton: 'Itinéraire',
    help: `Des questions, ou besoin de modifier votre rendez-vous${NBSP}? Écrivez-nous ou appelez-nous.`,
    signoff: 'Bien cordialement,',
    team: 'L’équipe de la Zeo Dental Clinic',
    footerNote:
      'Vous recevez cet e-mail car vous avez demandé un rendez-vous à la Zeo Dental Clinic.',
    confirmation: {
      subject: 'Votre rendez-vous est confirmé – Zeo Dental Clinic',
      preheader: 'Les détails de votre rendez-vous à la Zeo Dental Clinic, Tirana.',
      title: 'Votre rendez-vous est confirmé',
      intro: `Merci d’avoir choisi la Zeo Dental Clinic. Votre rendez-vous est confirmé${NBSP}: vous trouverez tous les détails ci-dessous.`,
      detailsTitle: 'Détails du rendez-vous',
      arriveNote: 'Merci de vous présenter 10 minutes avant l’heure de votre rendez-vous.',
    },
    cancellation: {
      subject: 'Votre rendez-vous a été annulé – Zeo Dental Clinic',
      preheader: 'Votre rendez-vous à la Zeo Dental Clinic a été annulé.',
      title: 'Votre rendez-vous a été annulé',
      intro: 'Nous vous informons que votre rendez-vous a été annulé.',
      detailsTitle: 'Rendez-vous annulé',
      reason: 'Motif',
      rebook: 'Si vous souhaitez prendre un nouveau rendez-vous, nous serons ravis de vous aider.',
    },
  },
  tr: {
    locale: 'tr-TR',
    languageName: 'Türkçe',
    greeting: name => `Sayın ${name},`,
    labels: { service: 'Hizmet', date: 'Tarih', time: 'Saat', address: 'Adres' },
    addressValue: 'Rruga Hamdi Sina, Tiran, Arnavutluk',
    slots: { morning: 'Sabah', afternoon: 'Öğleden sonra', evening: 'Akşam' },
    noDate: 'Tarih ve saati birlikte belirlemek için en kısa sürede sizinle iletişime geçeceğiz.',
    timeTbd: 'Onaylanacak',
    whatsappButton: 'Bize WhatsApp’tan yazın',
    directionsButton: 'Yol tarifi alın',
    help: 'Sorunuz mu var ya da randevunuzu değiştirmek mi istiyorsunuz? Bize yazın veya bizi arayın.',
    signoff: 'Saygılarımızla,',
    team: 'Zeo Dental Clinic ekibi',
    footerNote: 'Bu e-postayı, Zeo Dental Clinic’ten randevu talep ettiğiniz için almaktasınız.',
    confirmation: {
      subject: 'Randevunuz onaylandı – Zeo Dental Clinic',
      preheader: 'Zeo Dental Clinic (Tiran) randevunuzun ayrıntıları.',
      title: 'Randevunuz onaylandı',
      intro:
        'Zeo Dental Clinic’i tercih ettiğiniz için teşekkür ederiz. Randevunuz onaylandı; tüm ayrıntıları aşağıda bulabilirsiniz.',
      detailsTitle: 'Randevu ayrıntıları',
      arriveNote: 'Lütfen randevu saatinizden 10 dakika önce klinikte olunuz.',
    },
    cancellation: {
      subject: 'Randevunuz iptal edildi – Zeo Dental Clinic',
      preheader: 'Zeo Dental Clinic’teki randevunuz iptal edildi.',
      title: 'Randevunuz iptal edildi',
      intro: 'Randevunuzun iptal edildiğini bildirmek isteriz.',
      detailsTitle: 'İptal edilen randevu',
      reason: 'Neden',
      rebook: 'Yeni bir randevu almak isterseniz size memnuniyetle yardımcı oluruz.',
    },
  },
  el: {
    locale: 'el-GR',
    languageName: 'Ελληνικά',
    greeting: name => `Αγαπητέ/ή ${name},`,
    labels: { service: 'Υπηρεσία', date: 'Ημερομηνία', time: 'Ώρα', address: 'Διεύθυνση' },
    addressValue: 'Rruga Hamdi Sina, Τίρανα, Αλβανία',
    slots: { morning: 'Πρωί', afternoon: 'Απόγευμα', evening: 'Βράδυ' },
    noDate: 'Θα επικοινωνήσουμε σύντομα μαζί σας για να ορίσουμε μαζί ημερομηνία και ώρα.',
    timeTbd: 'Θα επιβεβαιωθεί',
    whatsappButton: 'Στείλτε μας μήνυμα στο WhatsApp',
    directionsButton: 'Οδηγίες μετάβασης',
    help: 'Έχετε ερωτήσεις ή θέλετε να αλλάξετε το ραντεβού σας; Στείλτε μας μήνυμα ή καλέστε μας.',
    signoff: 'Με εκτίμηση,',
    team: 'Η ομάδα της Zeo Dental Clinic',
    footerNote: 'Λαμβάνετε αυτό το email επειδή ζητήσατε ραντεβού στη Zeo Dental Clinic.',
    confirmation: {
      subject: 'Το ραντεβού σας επιβεβαιώθηκε – Zeo Dental Clinic',
      preheader: 'Οι λεπτομέρειες του ραντεβού σας στη Zeo Dental Clinic, Τίρανα.',
      title: 'Το ραντεβού σας επιβεβαιώθηκε',
      intro:
        'Σας ευχαριστούμε που επιλέξατε τη Zeo Dental Clinic. Το ραντεβού σας επιβεβαιώθηκε· παρακάτω θα βρείτε όλες τις λεπτομέρειες.',
      detailsTitle: 'Λεπτομέρειες ραντεβού',
      arriveNote: 'Παρακαλούμε να έρθετε 10 λεπτά πριν από την ώρα του ραντεβού σας.',
    },
    cancellation: {
      subject: 'Το ραντεβού σας ακυρώθηκε – Zeo Dental Clinic',
      preheader: 'Το ραντεβού σας στη Zeo Dental Clinic ακυρώθηκε.',
      title: 'Το ραντεβού σας ακυρώθηκε',
      intro: 'Σας ενημερώνουμε ότι το ραντεβού σας ακυρώθηκε.',
      detailsTitle: 'Ακυρωμένο ραντεβού',
      reason: 'Αιτία',
      rebook: 'Αν θέλετε να κλείσετε νέο ραντεβού, θα χαρούμε να σας βοηθήσουμε.',
    },
  },
  es: {
    locale: 'es-ES',
    languageName: 'Español',
    greeting: name => `Estimado/a ${name}:`,
    labels: { service: 'Servicio', date: 'Fecha', time: 'Hora', address: 'Dirección' },
    addressValue: 'Rruga Hamdi Sina, Tirana, Albania',
    slots: { morning: 'Mañana', afternoon: 'Tarde', evening: 'Última hora de la tarde' },
    noDate: 'Nos pondremos en contacto con usted en breve para acordar la fecha y la hora.',
    timeTbd: 'Por confirmar',
    whatsappButton: 'Escríbanos por WhatsApp',
    directionsButton: 'Cómo llegar',
    help: '¿Tiene alguna pregunta o desea cambiar su cita? Escríbanos o llámenos.',
    signoff: 'Atentamente,',
    team: 'El equipo de Zeo Dental Clinic',
    footerNote: 'Recibe este correo porque solicitó una cita en Zeo Dental Clinic.',
    confirmation: {
      subject: 'Su cita está confirmada – Zeo Dental Clinic',
      preheader: 'Los detalles de su cita en Zeo Dental Clinic, Tirana.',
      title: 'Su cita está confirmada',
      intro:
        'Gracias por elegir Zeo Dental Clinic. Su cita está confirmada; a continuación encontrará todos los detalles.',
      detailsTitle: 'Detalles de la cita',
      arriveNote: 'Le rogamos que llegue 10 minutos antes de la hora de su cita.',
    },
    cancellation: {
      subject: 'Su cita ha sido cancelada – Zeo Dental Clinic',
      preheader: 'Su cita en Zeo Dental Clinic ha sido cancelada.',
      title: 'Su cita ha sido cancelada',
      intro: 'Le informamos de que su cita ha sido cancelada.',
      detailsTitle: 'Cita cancelada',
      reason: 'Motivo',
      rebook: 'Si desea programar una nueva cita, estaremos encantados de ayudarle.',
    },
  },
};
