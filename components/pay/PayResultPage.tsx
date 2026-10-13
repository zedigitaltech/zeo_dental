import React from 'react';
import { useLanguage, type Language } from '../../contexts/LanguageContext';

/**
 * Where POK sends the patient back after its payment page. The thanks page never says "paid":
 * only POK's order status (checked by the Worker) decides that, and the clinic confirms by e-mail.
 */

interface PayCopy {
  thanksTitle: string;
  thanksBody: string;
  failedTitle: string;
  failedBody: string;
  contact: string;
  home: string;
}

export const PAY_COPY: Record<Language, PayCopy> = {
  sq: {
    thanksTitle: 'Faleminderit',
    thanksBody:
      'Sapo pagesa të regjistrohet nga POK, Zeo Dental Clinic do t’jua konfirmojë me email. Pagesa shkon drejtpërdrejt te klinika.',
    failedTitle: 'Pagesa nuk u krye',
    failedBody:
      'Pagesa nuk përfundoi. Mund të provoni sërish me të njëjtën lidhje sa kohë është e vlefshme, ose të na kontaktoni.',
    contact: 'Na shkruani në WhatsApp',
    home: 'Kthehu te faqja',
  },
  en: {
    thanksTitle: 'Thank you',
    thanksBody:
      'As soon as POK registers the payment, Zeo Dental Clinic will confirm it by email. The payment goes directly to the clinic.',
    failedTitle: 'Payment not completed',
    failedBody:
      'The payment was not completed. You can try again with the same link while it is valid, or contact us.',
    contact: 'Message us on WhatsApp',
    home: 'Back to the website',
  },
  it: {
    thanksTitle: 'Grazie',
    thanksBody:
      'Appena POK registra il pagamento, Zeo Dental Clinic glielo confermerà via email. Il pagamento va direttamente alla clinica.',
    failedTitle: 'Pagamento non completato',
    failedBody:
      'Il pagamento non è stato completato. Può riprovare con lo stesso link finché è valido, oppure contattarci.',
    contact: 'Ci scriva su WhatsApp',
    home: 'Torna al sito',
  },
  de: {
    thanksTitle: 'Vielen Dank',
    thanksBody:
      'Sobald POK die Zahlung verbucht, bestätigt die Zeo Dental Clinic sie Ihnen per E-Mail. Die Zahlung geht direkt an die Klinik.',
    failedTitle: 'Zahlung nicht abgeschlossen',
    failedBody:
      'Die Zahlung wurde nicht abgeschlossen. Sie können es mit demselben Link erneut versuchen, solange er gültig ist, oder uns kontaktieren.',
    contact: 'Schreiben Sie uns auf WhatsApp',
    home: 'Zurück zur Website',
  },
  fr: {
    thanksTitle: 'Merci',
    thanksBody:
      'Dès que POK aura enregistré le paiement, la Zeo Dental Clinic vous le confirmera par e-mail. Le paiement va directement à la clinique.',
    failedTitle: 'Paiement non effectué',
    failedBody:
      'Le paiement n’a pas abouti. Vous pouvez réessayer avec le même lien tant qu’il est valable, ou nous contacter.',
    contact: 'Écrivez-nous sur WhatsApp',
    home: 'Retour au site',
  },
  tr: {
    thanksTitle: 'Teşekkürler',
    thanksBody:
      'POK ödemeyi kaydeder kaydetmez Zeo Dental Clinic bunu size e-postayla onaylayacaktır. Ödeme doğrudan kliniğe gider.',
    failedTitle: 'Ödeme tamamlanmadı',
    failedBody:
      'Ödeme tamamlanmadı. Bağlantı geçerli olduğu sürece aynı bağlantıyla tekrar deneyebilir veya bizimle iletişime geçebilirsiniz.',
    contact: 'Bize WhatsApp’tan yazın',
    home: 'Siteye dön',
  },
  el: {
    thanksTitle: 'Ευχαριστούμε',
    thanksBody:
      'Μόλις η POK καταχωρίσει την πληρωμή, η Zeo Dental Clinic θα σας την επιβεβαιώσει με email. Η πληρωμή πηγαίνει απευθείας στην κλινική.',
    failedTitle: 'Η πληρωμή δεν ολοκληρώθηκε',
    failedBody:
      'Η πληρωμή δεν ολοκληρώθηκε. Μπορείτε να δοκιμάσετε ξανά με τον ίδιο σύνδεσμο όσο ισχύει ή να επικοινωνήσετε μαζί μας.',
    contact: 'Γράψτε μας στο WhatsApp',
    home: 'Επιστροφή στον ιστότοπο',
  },
  es: {
    thanksTitle: 'Gracias',
    thanksBody:
      'En cuanto POK registre el pago, Zeo Dental Clinic se lo confirmará por correo. El pago va directamente a la clínica.',
    failedTitle: 'Pago no completado',
    failedBody:
      'El pago no se ha completado. Puede intentarlo de nuevo con el mismo enlace mientras sea válido, o contactarnos.',
    contact: 'Escríbanos por WhatsApp',
    home: 'Volver al sitio',
  },
};

export const PayResultPage: React.FC<{ outcome: 'thanks' | 'failed' }> = ({ outcome }) => {
  const { language } = useLanguage();
  const c = PAY_COPY[language] ?? PAY_COPY.en;
  return (
    <main className="min-h-screen bg-studio-black flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <p className="font-serif text-4xl text-white mb-10">
          ZEO<span className="text-studio-gold">.</span>
        </p>
        <h1 className="font-serif text-3xl text-white mb-6">
          {outcome === 'thanks' ? c.thanksTitle : c.failedTitle}
        </h1>
        <p className="text-white/70 leading-relaxed mb-10">
          {outcome === 'thanks' ? c.thanksBody : c.failedBody}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/355684004840"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-studio-gold px-6 py-3 text-xs uppercase tracking-ultra text-white hover:bg-studio-gold transition-colors"
          >
            {c.contact}
          </a>
          <a
            href={`/${language}/`}
            className="border border-white/20 px-6 py-3 text-xs uppercase tracking-ultra text-white hover:bg-white hover:text-studio-black transition-colors"
          >
            {c.home}
          </a>
        </div>
      </div>
    </main>
  );
};

export default PayResultPage;
