export interface PrivacyListItem {
  bold?: string;
  text: string;
}

export interface PrivacySection {
  title: string;
  paragraphs?: string[];
  listIntro?: string;
  items?: PrivacyListItem[];
}

export interface PrivacyContent {
  backToHome: string;
  pageTitle: string;
  lastUpdated: string;
  copyright: string;
  sections: PrivacySection[];
}

type Language = 'sq' | 'en' | 'it' | 'de' | 'fr' | 'tr' | 'el' | 'es';

const en: PrivacyContent = {
  backToHome: 'Back to Home',
  pageTitle: 'Privacy Policy',
  lastUpdated: 'Last updated: February 2026',
  copyright: '\u00a9 2026 Zeo Dental Clinic. All rights reserved.',
  sections: [
    {
      title: '1. General Information',
      paragraphs: [
        'Zeo Dental Clinic ("we", "our", or "the Clinic") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information in accordance with Albanian Law No. 9887/2008 "On the Protection of Personal Data" and the European Union General Data Protection Regulation (GDPR).',
        '**Data Controller:**\nZeo Dental Clinic\nRruga Hamdi Sina, Tirana, Albania\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840',
      ],
    },
    {
      title: '2. Data We Collect',
      listIntro: 'We collect the following types of data:',
      items: [
        {
          bold: 'Identification data:',
          text: 'First name, last name, phone number, email address',
        },
        {
          bold: 'Health data:',
          text: 'Dental history, requested treatment, radiographs, and other medical information necessary for dental care',
        },
        {
          bold: 'Communication data:',
          text: 'Correspondence with our clinic via email, phone, or WhatsApp',
        },
        { bold: 'Booking data:', text: 'Preferred date and time of appointments' },
      ],
    },
    {
      title: '3. Legal Basis for Processing',
      listIntro: 'We process your personal data based on:',
      items: [
        {
          bold: 'Your consent:',
          text: 'When you give consent for data processing (Article 6(1)(a) GDPR)',
        },
        {
          bold: 'Performance of a contract:',
          text: 'To provide the dental services you have requested (Article 6(1)(b) GDPR)',
        },
        {
          bold: 'Legal obligations:',
          text: 'To fulfill our legal obligations under Albanian health law (Article 6(1)(c) GDPR)',
        },
        {
          bold: 'Legitimate interests:',
          text: 'To improve our services and for direct communication (Article 6(1)(f) GDPR)',
        },
      ],
    },
    {
      title: '4. How We Use Your Data',
      items: [
        { text: 'To manage your bookings and appointments' },
        { text: 'To provide dental treatment and medical care' },
        { text: 'To contact you regarding your appointments or treatments' },
        { text: 'To fulfill our legal and regulatory obligations' },
        { text: 'To improve our services and patient experience' },
      ],
    },
    {
      title: '5. Data Retention',
      paragraphs: [
        'Your personal data is retained in accordance with Albanian legislation on medical documentation. Health data is retained for a minimum period of 10 years after the last treatment, as required by law. Other personal data is retained only for as long as necessary for the purposes of processing.',
      ],
    },
    {
      title: '6. Your Rights',
      listIntro: 'Under GDPR and Albanian law, you have the right to:',
      items: [
        { bold: 'Access:', text: 'Request a copy of your personal data' },
        { bold: 'Rectification:', text: 'Request correction of inaccurate data' },
        { bold: 'Erasure:', text: 'Request deletion of your data ("right to be forgotten")' },
        { bold: 'Restriction:', text: 'Request restriction of processing' },
        { bold: 'Portability:', text: 'Receive your data in a structured format' },
        { bold: 'Object:', text: 'Object to processing for direct marketing' },
        {
          bold: 'Withdraw consent:',
          text: 'At any time, without affecting the lawfulness of prior processing',
        },
      ],
    },
    {
      title: '7. Data Security',
      paragraphs: [
        'We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, loss, or damage. Our system uses SSL/TLS encryption for data transmission and is hosted on secure servers.',
      ],
    },
    {
      title: '8. Cookies and Similar Technologies',
      paragraphs: [
        'Our website uses essential cookies for the proper functioning of the site. We do not use cookies for marketing or tracking purposes without your consent.',
      ],
    },
    {
      title: '9. Virtual Assistant (AI Chatbot)',
      paragraphs: [
        'Our virtual assistant (chatbot) uses Google Gemini API. Conversations are processed by Google and are not stored on our servers. Do not share sensitive health information via chat.',
      ],
    },
    {
      title: '10. WhatsApp Notifications',
      paragraphs: [
        'If you provide consent, we may send you appointment notifications via WhatsApp. Your phone number is shared with Meta Platforms (WhatsApp Business API) for this purpose. You may withdraw consent at any time.',
      ],
    },
    {
      title: '11. Patient Management System (CRM)',
      paragraphs: [
        'Your booking data is synced to our patient management system (ManagerCRM) for appointment scheduling and medical record keeping.',
      ],
    },
    {
      title: '12. IP Geolocation',
      paragraphs: [
        'We use your IP address to automatically detect your preferred language. This data is processed in real-time and is not stored. You can change your language manually at any time.',
      ],
    },
    {
      title: '13. Data Transfers',
      paragraphs: [
        'Your personal data is not transferred outside Albania or the European Union without appropriate safeguards. If a transfer is necessary, we will ensure the receiving country provides an adequate level of protection.',
        'For the services mentioned above, data may be transferred to: Google LLC (US) for AI chatbot processing, and Meta Platforms, Inc. (US) for WhatsApp notifications. These transfers are protected by Standard Contractual Clauses (SCCs) approved by the European Commission.',
      ],
    },
    {
      title: '14. Contact',
      paragraphs: [
        'For any questions about this policy or to exercise your rights, please contact us:',
        'Zeo Dental Clinic\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840\nAddress: Rruga Hamdi Sina, Tirana, Albania',
      ],
    },
    {
      title: '15. Supervisory Authority',
      paragraphs: [
        'If you believe your rights have been violated, you have the right to file a complaint with the Commissioner for the Right to Information and Personal Data Protection:',
        'Commissioner for the Right to Information and Personal Data Protection\nRruga "Abdi Toptani", Nr. 5, Tirana\nWebsite: www.idp.al',
      ],
    },
  ],
};

const sq: PrivacyContent = {
  backToHome: 'Kthehu n\u00eb Kreu',
  pageTitle: 'Politika e Privat\u00ebsis\u00eb',
  lastUpdated: 'P\u00ebrdit\u00ebsuar m\u00eb: Shkurt 2026',
  copyright: '\u00a9 2026 Klinika Dentare Zeo. T\u00eb gjitha t\u00eb drejtat e rezervuara.',
  sections: [
    {
      title: '1. Informacione t\u00eb P\u00ebrgjithshme',
      paragraphs: [
        'Klinika Dentare Zeo ("ne", "ton\u00eb", ose "Klinika") respekton privat\u00ebsin\u00eb tuaj dhe \u00ebsht\u00eb e p\u00ebrkushtuar p\u00ebr t\u00eb mbrojtur t\u00eb dh\u00ebnat tuaja personale. Kjo politik\u00eb privat\u00ebsie shpjegon se si ne mbledhim, p\u00ebrdorim, dhe mbrojm\u00eb informacionin tuaj n\u00eb p\u00ebrputhje me Ligjin Shqiptar Nr. 9887/2008 "P\u00ebr Mbrojtjen e t\u00eb Dh\u00ebnave Personale" dhe Rregulloren e P\u00ebrgjithshme t\u00eb Mbrojtjes s\u00eb t\u00eb Dh\u00ebnave (GDPR) t\u00eb Bashkimit Evropian.',
        '**Kontrollori i t\u00eb Dh\u00ebnave:**\nKlinika Dentare Zeo\nRruga Hamdi Sina, Tiran\u00eb, Shqip\u00ebri\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840',
      ],
    },
    {
      title: '2. T\u00eb Dh\u00ebnat q\u00eb Mbledhim',
      listIntro: 'Ne mbledhim k\u00ebto lloje t\u00eb dh\u00ebnash:',
      items: [
        {
          bold: 'T\u00eb dh\u00ebna identifikuese:',
          text: 'Emri, mbiemri, numri i telefonit, adresa e email-it',
        },
        {
          bold: 'T\u00eb dh\u00ebna sh\u00ebndet\u00ebsore:',
          text: 'Historia dentare, trajtimi i k\u00ebrkuar, radiografit\u00eb, dhe informacione t\u00eb tjera mjek\u00ebsore t\u00eb nevojshme p\u00ebr kujdesin dentar',
        },
        {
          bold: 'T\u00eb dh\u00ebna komunikimi:',
          text: 'Korrespondenca me klinik\u00ebn ton\u00eb p\u00ebrmes email-it, telefonit, ose WhatsApp',
        },
        { bold: 'T\u00eb dh\u00ebna rezervimi:', text: 'Data dhe ora e preferuar e takimeve' },
      ],
    },
    {
      title: '3. Baza Ligjore p\u00ebr P\u00ebrpunimin',
      listIntro: 'Ne p\u00ebrpunojm\u00eb t\u00eb dh\u00ebnat tuaja personale bazuar n\u00eb:',
      items: [
        {
          bold: 'P\u00eblqimin tuaj:',
          text: 'Kur jepni p\u00eblqimin p\u00ebr p\u00ebrpunimin e t\u00eb dh\u00ebnave (Article 6(1)(a) GDPR)',
        },
        {
          bold: 'Ekzekutimin e kontrat\u00ebs:',
          text: 'P\u00ebr t\u00eb ofruar sh\u00ebrbimet dentare q\u00eb keni k\u00ebrkuar (Article 6(1)(b) GDPR)',
        },
        {
          bold: 'Detyrimet ligjore:',
          text: 'P\u00ebr t\u00eb p\u00ebrmbushur detyrimet tona ligjore sipas ligjit shqiptar t\u00eb sh\u00ebndet\u00ebsis\u00eb (Article 6(1)(c) GDPR)',
        },
        {
          bold: 'Interesat legjitime:',
          text: 'P\u00ebr t\u00eb p\u00ebrmir\u00ebsuar sh\u00ebrbimet tona dhe p\u00ebr komunikim t\u00eb drejtp\u00ebrdrejt\u00eb (Article 6(1)(f) GDPR)',
        },
      ],
    },
    {
      title: '4. Si i P\u00ebrdorim t\u00eb Dh\u00ebnat Tuaja',
      items: [
        { text: 'P\u00ebr t\u00eb menaxhuar rezervimet dhe takimet tuaja' },
        { text: 'P\u00ebr t\u00eb ofruar trajtim dentar dhe kujdes mjek\u00ebsor' },
        { text: "P\u00ebr t'ju kontaktuar n\u00eb lidhje me takimet ose trajtimet tuaja" },
        { text: 'P\u00ebr t\u00eb p\u00ebrmbushur detyrimet tona ligjore dhe rregullatore' },
        {
          text: 'P\u00ebr t\u00eb p\u00ebrmir\u00ebsuar sh\u00ebrbimet dhe p\u00ebrvoj\u00ebn e pacient\u00ebve',
        },
      ],
    },
    {
      title: '5. Ruajtja e t\u00eb Dh\u00ebnave',
      paragraphs: [
        'T\u00eb dh\u00ebnat tuaja personale ruhen n\u00eb p\u00ebrputhje me legjislacionin shqiptar p\u00ebr dokumentacionin mjek\u00ebsor. T\u00eb dh\u00ebnat sh\u00ebndet\u00ebsore ruhen p\u00ebr nj\u00eb periudh\u00eb minimale prej 10 vitesh pas trajtimit t\u00eb fundit, si\u00e7 k\u00ebrkohet nga ligji. T\u00eb dh\u00ebnat e tjera personale ruhen vet\u00ebm p\u00ebr aq koh\u00eb sa \u00ebsht\u00eb e nevojshme p\u00ebr q\u00ebllimet e p\u00ebrpunimit.',
      ],
    },
    {
      title: '6. T\u00eb Drejtat Tuaja',
      listIntro: 'Sipas GDPR dhe ligjit shqiptar, ju keni t\u00eb drejt\u00eb:',
      items: [
        {
          bold: 'T\u00eb aksesoni:',
          text: 'T\u00eb k\u00ebrkoni nj\u00eb kopje t\u00eb t\u00eb dh\u00ebnave tuaja personale',
        },
        {
          bold: 'T\u00eb korrigjoni:',
          text: 'T\u00eb k\u00ebrkoni korrigjimin e t\u00eb dh\u00ebnave t\u00eb pasakta',
        },
        {
          bold: 'T\u00eb fshini:',
          text: 'T\u00eb k\u00ebrkoni fshirjen e t\u00eb dh\u00ebnave tuaja ("e drejta p\u00ebr t\'u harruar")',
        },
        { bold: 'T\u00eb kufizoni:', text: 'T\u00eb k\u00ebrkoni kufizimin e p\u00ebrpunimit' },
        {
          bold: 'T\u00eb transportoni:',
          text: 'T\u00eb merrni t\u00eb dh\u00ebnat tuaja n\u00eb format t\u00eb strukturuar',
        },
        {
          bold: 'T\u00eb kund\u00ebrshtoni:',
          text: 'T\u00eb kund\u00ebrshtoni p\u00ebrpunimin p\u00ebr marketing t\u00eb drejtp\u00ebrdrejt\u00eb',
        },
        {
          bold: 'T\u00eb t\u00ebrhiqni p\u00eblqimin:',
          text: 'N\u00eb \u00e7do koh\u00eb, pa ndikuar ligjshm\u00ebrin\u00eb e p\u00ebrpunimit t\u00eb m\u00ebparsh\u00ebm',
        },
      ],
    },
    {
      title: '7. Siguria e t\u00eb Dh\u00ebnave',
      paragraphs: [
        'Ne zbatojm\u00eb masa t\u00eb p\u00ebrshtatshme teknike dhe organizative p\u00ebr t\u00eb mbrojtur t\u00eb dh\u00ebnat tuaja personale nga aksesi i paautorizuar, humbja, ose d\u00ebmtimi. Sistemi yn\u00eb p\u00ebrdor enkriptim SSL/TLS p\u00ebr transmetimin e t\u00eb dh\u00ebnave dhe ruhet n\u00eb servera t\u00eb sigurt.',
      ],
    },
    {
      title: '8. Cookies dhe Teknologji t\u00eb Ngjashme',
      paragraphs: [
        'Faqja jon\u00eb e internetit p\u00ebrdor cookies thelbësore p\u00ebr funksionimin e duhur t\u00eb sajtit. Ne nuk p\u00ebrdorim cookies p\u00ebr q\u00ebllime marketing ose gjurmimi pa p\u00eblqimin tuaj.',
      ],
    },
    {
      title: '9. Asistenti Virtual (Chatbot AI)',
      paragraphs: [
        'Asistenti yn\u00eb virtual (chatbot) p\u00ebrdor Google Gemini API. Bisedat p\u00ebrpunohen nga Google dhe nuk ruhen n\u00eb server\u00ebt tan\u00eb. Mos ndani informacione t\u00eb ndjeshme sh\u00ebndet\u00ebsore p\u00ebrmes chat-it.',
      ],
    },
    {
      title: '10. Njoftimet p\u00ebrmes WhatsApp',
      paragraphs: [
        "N\u00ebse jepni p\u00eblqimin, ne mund t'ju d\u00ebrgojm\u00eb njoftime p\u00ebr takimet p\u00ebrmes WhatsApp. Numri juaj i telefonit ndahet me Meta Platforms (WhatsApp Business API) p\u00ebr k\u00ebt\u00eb q\u00ebllim. Ju mund t\u00eb t\u00ebrhiqni p\u00eblqimin n\u00eb \u00e7do koh\u00eb.",
      ],
    },
    {
      title: '11. Sistemi i Menaxhimit t\u00eb Pacient\u00ebve (CRM)',
      paragraphs: [
        'T\u00eb dh\u00ebnat tuaja t\u00eb rezervimit sinkronizohen me sistemin ton\u00eb t\u00eb menaxhimit t\u00eb pacient\u00ebve (ManagerCRM) p\u00ebr planifikimin e takimeve dhe mbajtjen e regjistrave mjek\u00ebsore.',
      ],
    },
    {
      title: '12. Gjeolokacioni i IP-s\u00eb',
      paragraphs: [
        'Ne p\u00ebrdorim adres\u00ebn tuaj IP p\u00ebr t\u00eb zbuluar gjuh\u00ebn e preferuar automatikisht. Kjo e dh\u00ebn\u00eb p\u00ebrpunohet n\u00eb koh\u00eb reale dhe nuk ruhet. Ju mund t\u00eb ndryshoni gjuh\u00ebn manualisht n\u00eb \u00e7do koh\u00eb.',
      ],
    },
    {
      title: '13. Transferimi i t\u00eb Dh\u00ebnave',
      paragraphs: [
        'T\u00eb dh\u00ebnat tuaja personale nuk transferohen jasht\u00eb Shqip\u00ebris\u00eb ose Bashkimit Evropian pa masat e duhura mbrojt\u00ebse. N\u00ebse transferimi \u00ebsht\u00eb i nevojsh\u00ebm, do t\u00eb sigurohemi q\u00eb vendi prit\u00ebs t\u00eb ofroj\u00eb nj\u00eb nivel adekuat mbrojtjeje.',
        'P\u00ebr sh\u00ebrbimet e p\u00ebrmendura m\u00eb sip\u00ebr, t\u00eb dh\u00ebnat mund t\u00eb transferohen te: Google LLC (US) p\u00ebr p\u00ebrpunimin e chatbot-it AI, dhe Meta Platforms, Inc. (US) p\u00ebr njoftimet WhatsApp. K\u00ebto transferime mbrohen nga Klauzolat Standarde Kontraktuale (SCC) t\u00eb miratuara nga Komisioni Evropian.',
      ],
    },
    {
      title: '14. Kontakti',
      paragraphs: [
        'P\u00ebr \u00e7do pyetje rreth k\u00ebsaj politike ose p\u00ebr t\u00eb ushtruar t\u00eb drejtat tuaja, na kontaktoni:',
        'Klinika Dentare Zeo\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840\nAdresa: Rruga Hamdi Sina, Tiran\u00eb, Shqip\u00ebri',
      ],
    },
    {
      title: '15. Autoriteti Mbik\u00ebqyr\u00ebs',
      paragraphs: [
        'N\u00ebse besoni se t\u00eb drejtat tuaja jan\u00eb shkelur, keni t\u00eb drejt\u00eb t\u00eb paraqisni nj\u00eb ankes\u00eb pran\u00eb Komisionerit p\u00ebr t\u00eb Drejt\u00ebn e Informimit dhe Mbrojtjen e t\u00eb Dh\u00ebnave Personale:',
        'Komisioneri p\u00ebr t\u00eb Drejt\u00ebn e Informimit dhe Mbrojtjen e t\u00eb Dh\u00ebnave Personale\nRruga "Abdi Toptani", Nr. 5, Tiran\u00eb\nWebsite: www.idp.al',
      ],
    },
  ],
};

const it: PrivacyContent = {
  backToHome: 'Torna alla Home',
  pageTitle: 'Informativa sulla Privacy',
  lastUpdated: 'Ultimo aggiornamento: febbraio 2026',
  copyright: '\u00a9 2026 Zeo Dental Clinic. Tutti i diritti riservati.',
  sections: [
    {
      title: '1. Informazioni Generali',
      paragraphs: [
        'Zeo Dental Clinic ("noi", "nostro/a" o "la Clinica") rispetta la vostra privacy e si impegna a proteggere i vostri dati personali. La presente informativa sulla privacy spiega come raccogliamo, utilizziamo e proteggiamo le vostre informazioni in conformit\u00e0 alla Legge albanese n. 9887/2008 "Sulla protezione dei dati personali" e al Regolamento Generale sulla Protezione dei Dati dell\'Unione Europea (GDPR).',
        '**Titolare del trattamento:**\nZeo Dental Clinic\nRruga Hamdi Sina, Tirana, Albania\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840',
      ],
    },
    {
      title: '2. Dati che Raccogliamo',
      listIntro: 'Raccogliamo le seguenti tipologie di dati:',
      items: [
        {
          bold: 'Dati identificativi:',
          text: 'Nome, cognome, numero di telefono, indirizzo email',
        },
        {
          bold: 'Dati sanitari:',
          text: 'Anamnesi dentale, trattamento richiesto, radiografie e altre informazioni mediche necessarie per le cure odontoiatriche',
        },
        {
          bold: 'Dati di comunicazione:',
          text: 'Corrispondenza con la nostra clinica tramite email, telefono o WhatsApp',
        },
        { bold: 'Dati di prenotazione:', text: 'Data e orario preferiti degli appuntamenti' },
      ],
    },
    {
      title: '3. Base Giuridica del Trattamento',
      listIntro: 'Trattiamo i vostri dati personali sulla base di:',
      items: [
        {
          bold: 'Il vostro consenso:',
          text: 'Quando prestate il consenso al trattamento dei dati (Article 6(1)(a) GDPR)',
        },
        {
          bold: 'Esecuzione di un contratto:',
          text: 'Per fornire i servizi odontoiatrici da voi richiesti (Article 6(1)(b) GDPR)',
        },
        {
          bold: 'Obblighi di legge:',
          text: 'Per adempiere ai nostri obblighi legali ai sensi della legislazione sanitaria albanese (Article 6(1)(c) GDPR)',
        },
        {
          bold: 'Interessi legittimi:',
          text: 'Per migliorare i nostri servizi e per la comunicazione diretta (Article 6(1)(f) GDPR)',
        },
      ],
    },
    {
      title: '4. Come Utilizziamo i Vostri Dati',
      items: [
        { text: 'Per gestire le vostre prenotazioni e appuntamenti' },
        { text: 'Per fornire trattamenti odontoiatrici e cure mediche' },
        { text: 'Per contattarvi riguardo ai vostri appuntamenti o trattamenti' },
        { text: 'Per adempiere ai nostri obblighi legali e normativi' },
        { text: "Per migliorare i nostri servizi e l'esperienza del paziente" },
      ],
    },
    {
      title: '5. Conservazione dei Dati',
      paragraphs: [
        "I vostri dati personali sono conservati in conformit\u00e0 alla legislazione albanese sulla documentazione medica. I dati sanitari sono conservati per un periodo minimo di 10 anni dall'ultimo trattamento, come previsto dalla legge. Gli altri dati personali sono conservati solo per il tempo necessario alle finalit\u00e0 del trattamento.",
      ],
    },
    {
      title: '6. I Vostri Diritti',
      listIntro: 'Ai sensi del GDPR e della legislazione albanese, avete il diritto di:',
      items: [
        { bold: 'Accesso:', text: 'Richiedere una copia dei vostri dati personali' },
        { bold: 'Rettifica:', text: 'Richiedere la correzione di dati inesatti' },
        {
          bold: 'Cancellazione:',
          text: 'Richiedere la cancellazione dei vostri dati ("diritto all\'oblio")',
        },
        { bold: 'Limitazione:', text: 'Richiedere la limitazione del trattamento' },
        { bold: 'Portabilit\u00e0:', text: 'Ricevere i vostri dati in un formato strutturato' },
        {
          bold: 'Opposizione:',
          text: 'Opporsi al trattamento per finalit\u00e0 di marketing diretto',
        },
        {
          bold: 'Revoca del consenso:',
          text: 'In qualsiasi momento, senza pregiudicare la liceit\u00e0 del trattamento precedente',
        },
      ],
    },
    {
      title: '7. Sicurezza dei Dati',
      paragraphs: [
        'Adottiamo misure tecniche e organizzative adeguate per proteggere i vostri dati personali da accesso non autorizzato, perdita o danneggiamento. Il nostro sistema utilizza la crittografia SSL/TLS per la trasmissione dei dati ed \u00e8 ospitato su server sicuri.',
      ],
    },
    {
      title: '8. Cookie e Tecnologie Simili',
      paragraphs: [
        'Il nostro sito web utilizza cookie essenziali per il corretto funzionamento del sito. Non utilizziamo cookie per finalit\u00e0 di marketing o tracciamento senza il vostro consenso.',
      ],
    },
    {
      title: '9. Assistente Virtuale (Chatbot IA)',
      paragraphs: [
        'Il nostro assistente virtuale (chatbot) utilizza Google Gemini API. Le conversazioni sono elaborate da Google e non sono memorizzate sui nostri server. Si prega di non condividere informazioni sanitarie sensibili tramite la chat.',
      ],
    },
    {
      title: '10. Notifiche WhatsApp',
      paragraphs: [
        'Se prestate il consenso, potremmo inviarvi notifiche sugli appuntamenti tramite WhatsApp. Il vostro numero di telefono viene condiviso con Meta Platforms (WhatsApp Business API) a tale scopo. Potete revocare il consenso in qualsiasi momento.',
      ],
    },
    {
      title: '11. Sistema di Gestione Pazienti (CRM)',
      paragraphs: [
        'I dati delle vostre prenotazioni vengono sincronizzati con il nostro sistema di gestione pazienti (ManagerCRM) per la pianificazione degli appuntamenti e la tenuta delle cartelle cliniche.',
      ],
    },
    {
      title: '12. Geolocalizzazione IP',
      paragraphs: [
        'Utilizziamo il vostro indirizzo IP per rilevare automaticamente la vostra lingua preferita. Questi dati vengono elaborati in tempo reale e non vengono memorizzati. Potete cambiare la lingua manualmente in qualsiasi momento.',
      ],
    },
    {
      title: '13. Trasferimento dei Dati',
      paragraphs: [
        "I vostri dati personali non vengono trasferiti al di fuori dell'Albania o dell'Unione Europea senza adeguate garanzie. Se un trasferimento \u00e8 necessario, ci assicureremo che il paese destinatario fornisca un livello adeguato di protezione.",
        "Per i servizi sopra menzionati, i dati possono essere trasferiti a: Google LLC (US) per l'elaborazione del chatbot IA e Meta Platforms, Inc. (US) per le notifiche WhatsApp. Tali trasferimenti sono protetti dalle Clausole Contrattuali Standard (SCC) approvate dalla Commissione Europea.",
      ],
    },
    {
      title: '14. Contatti',
      paragraphs: [
        'Per qualsiasi domanda riguardante la presente informativa o per esercitare i vostri diritti, vi preghiamo di contattarci:',
        'Zeo Dental Clinic\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840\nIndirizzo: Rruga Hamdi Sina, Tirana, Albania',
      ],
    },
    {
      title: '15. Autorit\u00e0 di Controllo',
      paragraphs: [
        "Se ritenete che i vostri diritti siano stati violati, avete il diritto di presentare un reclamo al Commissario per il Diritto all'Informazione e la Protezione dei Dati Personali:",
        'Commissioner for the Right to Information and Personal Data Protection\nRruga "Abdi Toptani", Nr. 5, Tirana\nWebsite: www.idp.al',
      ],
    },
  ],
};

const de: PrivacyContent = {
  backToHome: 'Zur\u00fcck zur Startseite',
  pageTitle: 'Datenschutzerkl\u00e4rung',
  lastUpdated: 'Letzte Aktualisierung: Februar 2026',
  copyright: '\u00a9 2026 Zeo Dental Clinic. Alle Rechte vorbehalten.',
  sections: [
    {
      title: '1. Allgemeine Informationen',
      paragraphs: [
        'Zeo Dental Clinic ("wir", "unser" oder "die Klinik") respektiert Ihre Privatsph\u00e4re und verpflichtet sich zum Schutz Ihrer personenbezogenen Daten. Diese Datenschutzerkl\u00e4rung erl\u00e4utert, wie wir Ihre Informationen in \u00dcbereinstimmung mit dem albanischen Gesetz Nr. 9887/2008 "\u00dcber den Schutz personenbezogener Daten" und der Datenschutz-Grundverordnung der Europ\u00e4ischen Union (GDPR) erheben, verwenden und sch\u00fctzen.',
        '**Verantwortlicher:**\nZeo Dental Clinic\nRruga Hamdi Sina, Tirana, Albania\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840',
      ],
    },
    {
      title: '2. Daten, die wir erheben',
      listIntro: 'Wir erheben folgende Arten von Daten:',
      items: [
        { bold: 'Identifikationsdaten:', text: 'Vorname, Nachname, Telefonnummer, E-Mail-Adresse' },
        {
          bold: 'Gesundheitsdaten:',
          text: 'Zahn\u00e4rztliche Vorgeschichte, gew\u00fcnschte Behandlung, R\u00f6ntgenaufnahmen und weitere medizinische Informationen, die f\u00fcr die zahn\u00e4rztliche Versorgung erforderlich sind',
        },
        {
          bold: 'Kommunikationsdaten:',
          text: 'Korrespondenz mit unserer Klinik per E-Mail, Telefon oder WhatsApp',
        },
        { bold: 'Buchungsdaten:', text: 'Bevorzugtes Datum und Uhrzeit der Termine' },
      ],
    },
    {
      title: '3. Rechtsgrundlage der Verarbeitung',
      listIntro: 'Wir verarbeiten Ihre personenbezogenen Daten auf Grundlage von:',
      items: [
        {
          bold: 'Ihre Einwilligung:',
          text: 'Wenn Sie Ihre Einwilligung zur Datenverarbeitung erteilen (Article 6(1)(a) GDPR)',
        },
        {
          bold: 'Vertragserf\u00fcllung:',
          text: 'Um die von Ihnen gew\u00fcnschten zahn\u00e4rztlichen Leistungen zu erbringen (Article 6(1)(b) GDPR)',
        },
        {
          bold: 'Gesetzliche Pflichten:',
          text: 'Um unsere gesetzlichen Verpflichtungen gem\u00e4\u00df dem albanischen Gesundheitsrecht zu erf\u00fcllen (Article 6(1)(c) GDPR)',
        },
        {
          bold: 'Berechtigte Interessen:',
          text: 'Zur Verbesserung unserer Leistungen und f\u00fcr die direkte Kommunikation (Article 6(1)(f) GDPR)',
        },
      ],
    },
    {
      title: '4. Wie wir Ihre Daten verwenden',
      items: [
        { text: 'Zur Verwaltung Ihrer Buchungen und Termine' },
        { text: 'Zur Erbringung zahn\u00e4rztlicher Behandlungen und medizinischer Versorgung' },
        { text: 'Um Sie bez\u00fcglich Ihrer Termine oder Behandlungen zu kontaktieren' },
        { text: 'Zur Erf\u00fcllung unserer gesetzlichen und beh\u00f6rdlichen Pflichten' },
        { text: 'Zur Verbesserung unserer Leistungen und der Patientenerfahrung' },
      ],
    },
    {
      title: '5. Aufbewahrung der Daten',
      paragraphs: [
        'Ihre personenbezogenen Daten werden gem\u00e4\u00df der albanischen Gesetzgebung zur medizinischen Dokumentation aufbewahrt. Gesundheitsdaten werden f\u00fcr einen Mindestzeitraum von 10 Jahren nach der letzten Behandlung aufbewahrt, wie gesetzlich vorgeschrieben. Andere personenbezogene Daten werden nur so lange aufbewahrt, wie es f\u00fcr die Zwecke der Verarbeitung erforderlich ist.',
      ],
    },
    {
      title: '6. Ihre Rechte',
      listIntro: 'Gem\u00e4\u00df der GDPR und dem albanischen Recht haben Sie das Recht auf:',
      items: [
        { bold: 'Auskunft:', text: 'Eine Kopie Ihrer personenbezogenen Daten anzufordern' },
        { bold: 'Berichtigung:', text: 'Die Korrektur unrichtiger Daten zu verlangen' },
        {
          bold: 'L\u00f6schung:',
          text: 'Die L\u00f6schung Ihrer Daten zu verlangen ("Recht auf Vergessenwerden")',
        },
        {
          bold: 'Einschr\u00e4nkung:',
          text: 'Die Einschr\u00e4nkung der Verarbeitung zu verlangen',
        },
        {
          bold: 'Daten\u00fcbertragbarkeit:',
          text: 'Ihre Daten in einem strukturierten Format zu erhalten',
        },
        {
          bold: 'Widerspruch:',
          text: 'Der Verarbeitung f\u00fcr Zwecke der Direktwerbung zu widersprechen',
        },
        {
          bold: 'Widerruf der Einwilligung:',
          text: 'Jederzeit, ohne dass die Rechtm\u00e4\u00dfigkeit der vorherigen Verarbeitung ber\u00fchrt wird',
        },
      ],
    },
    {
      title: '7. Datensicherheit',
      paragraphs: [
        'Wir setzen geeignete technische und organisatorische Ma\u00dfnahmen ein, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Verlust oder Besch\u00e4digung zu sch\u00fctzen. Unser System verwendet SSL/TLS-Verschl\u00fcsselung f\u00fcr die Daten\u00fcbertragung und wird auf sicheren Servern gehostet.',
      ],
    },
    {
      title: '8. Cookies und \u00e4hnliche Technologien',
      paragraphs: [
        'Unsere Website verwendet essenzielle Cookies f\u00fcr das ordnungsgem\u00e4\u00dfe Funktionieren der Seite. Wir verwenden keine Cookies f\u00fcr Marketing- oder Tracking-Zwecke ohne Ihre Einwilligung.',
      ],
    },
    {
      title: '9. Virtueller Assistent (KI-Chatbot)',
      paragraphs: [
        'Unser virtueller Assistent (Chatbot) verwendet Google Gemini API. Gespr\u00e4che werden von Google verarbeitet und nicht auf unseren Servern gespeichert. Bitte teilen Sie keine sensiblen Gesundheitsinformationen \u00fcber den Chat mit.',
      ],
    },
    {
      title: '10. WhatsApp-Benachrichtigungen',
      paragraphs: [
        'Wenn Sie Ihre Einwilligung erteilen, k\u00f6nnen wir Ihnen Terminbenachrichtigungen \u00fcber WhatsApp senden. Ihre Telefonnummer wird zu diesem Zweck an Meta Platforms (WhatsApp Business API) weitergegeben. Sie k\u00f6nnen Ihre Einwilligung jederzeit widerrufen.',
      ],
    },
    {
      title: '11. Patientenverwaltungssystem (CRM)',
      paragraphs: [
        'Ihre Buchungsdaten werden mit unserem Patientenverwaltungssystem (ManagerCRM) zur Terminplanung und F\u00fchrung der Krankenakten synchronisiert.',
      ],
    },
    {
      title: '12. IP-Geolokalisierung',
      paragraphs: [
        'Wir verwenden Ihre IP-Adresse, um Ihre bevorzugte Sprache automatisch zu erkennen. Diese Daten werden in Echtzeit verarbeitet und nicht gespeichert. Sie k\u00f6nnen Ihre Sprache jederzeit manuell \u00e4ndern.',
      ],
    },
    {
      title: '13. Daten\u00fcbermittlung',
      paragraphs: [
        'Ihre personenbezogenen Daten werden ohne angemessene Schutzma\u00dfnahmen nicht au\u00dferhalb Albaniens oder der Europ\u00e4ischen Union \u00fcbermittelt. Sollte eine \u00dcbermittlung erforderlich sein, stellen wir sicher, dass das Empf\u00e4ngerland ein angemessenes Schutzniveau bietet.',
        'F\u00fcr die oben genannten Dienste k\u00f6nnen Daten \u00fcbermittelt werden an: Google LLC (US) f\u00fcr die KI-Chatbot-Verarbeitung und Meta Platforms, Inc. (US) f\u00fcr WhatsApp-Benachrichtigungen. Diese \u00dcbermittlungen sind durch von der Europ\u00e4ischen Kommission genehmigte Standardvertragsklauseln (SCCs) gesch\u00fctzt.',
      ],
    },
    {
      title: '14. Kontakt',
      paragraphs: [
        'Bei Fragen zu dieser Datenschutzerkl\u00e4rung oder zur Aus\u00fcbung Ihrer Rechte kontaktieren Sie uns bitte:',
        'Zeo Dental Clinic\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840\nAdresse: Rruga Hamdi Sina, Tirana, Albania',
      ],
    },
    {
      title: '15. Aufsichtsbeh\u00f6rde',
      paragraphs: [
        'Wenn Sie der Ansicht sind, dass Ihre Rechte verletzt wurden, haben Sie das Recht, eine Beschwerde beim Kommissar f\u00fcr das Recht auf Information und den Schutz personenbezogener Daten einzureichen:',
        'Commissioner for the Right to Information and Personal Data Protection\nRruga "Abdi Toptani", Nr. 5, Tirana\nWebsite: www.idp.al',
      ],
    },
  ],
};
const fr: PrivacyContent = {
  backToHome: "Retour \u00e0 l'accueil",
  pageTitle: 'Politique de Confidentialit\u00e9',
  lastUpdated: 'Derni\u00e8re mise \u00e0 jour : f\u00e9vrier 2026',
  copyright: '\u00a9 2026 Zeo Dental Clinic. Tous droits r\u00e9serv\u00e9s.',
  sections: [
    {
      title: '1. Informations G\u00e9n\u00e9rales',
      paragraphs: [
        "Zeo Dental Clinic (\u00ab nous \u00bb, \u00ab notre \u00bb ou \u00ab la Clinique \u00bb) respecte votre vie priv\u00e9e et s'engage \u00e0 prot\u00e9ger vos donn\u00e9es personnelles. La pr\u00e9sente politique de confidentialit\u00e9 explique comment nous collectons, utilisons et prot\u00e9geons vos informations conform\u00e9ment \u00e0 la loi albanaise n\u00b0 9887/2008 \u00ab Sur la protection des donn\u00e9es personnelles \u00bb et au R\u00e8glement g\u00e9n\u00e9ral sur la protection des donn\u00e9es (RGPD) de l'Union europ\u00e9enne.",
        '**Responsable du traitement :**\nZeo Dental Clinic\nRruga Hamdi Sina, Tirana, Albania\nEmail : zeodentalclinic@gmail.com\nT\u00e9l : +355 68 400 4840',
      ],
    },
    {
      title: '2. Donn\u00e9es que nous collectons',
      listIntro: 'Nous collectons les types de donn\u00e9es suivants :',
      items: [
        {
          bold: "Donn\u00e9es d'identification :",
          text: 'Pr\u00e9nom, nom, num\u00e9ro de t\u00e9l\u00e9phone, adresse e-mail',
        },
        {
          bold: 'Donn\u00e9es de sant\u00e9 :',
          text: 'Ant\u00e9c\u00e9dents dentaires, traitement demand\u00e9, radiographies et autres informations m\u00e9dicales n\u00e9cessaires aux soins dentaires',
        },
        {
          bold: 'Donn\u00e9es de communication :',
          text: 'Correspondance avec notre clinique par e-mail, t\u00e9l\u00e9phone ou WhatsApp',
        },
        {
          bold: 'Donn\u00e9es de r\u00e9servation :',
          text: 'Date et heure pr\u00e9f\u00e9r\u00e9es des rendez-vous',
        },
      ],
    },
    {
      title: '3. Base juridique du traitement',
      listIntro: 'Nous traitons vos donn\u00e9es personnelles sur la base de :',
      items: [
        {
          bold: 'Votre consentement :',
          text: 'Lorsque vous donnez votre consentement au traitement des donn\u00e9es (Article 6(1)(a) GDPR)',
        },
        {
          bold: "Ex\u00e9cution d'un contrat :",
          text: 'Pour fournir les services dentaires que vous avez demand\u00e9s (Article 6(1)(b) GDPR)',
        },
        {
          bold: 'Obligations l\u00e9gales :',
          text: 'Pour remplir nos obligations l\u00e9gales en vertu du droit sanitaire albanais (Article 6(1)(c) GDPR)',
        },
        {
          bold: 'Int\u00e9r\u00eats l\u00e9gitimes :',
          text: 'Pour am\u00e9liorer nos services et pour la communication directe (Article 6(1)(f) GDPR)',
        },
      ],
    },
    {
      title: '4. Comment nous utilisons vos donn\u00e9es',
      items: [
        { text: 'Pour g\u00e9rer vos r\u00e9servations et rendez-vous' },
        { text: 'Pour fournir des traitements dentaires et des soins m\u00e9dicaux' },
        { text: 'Pour vous contacter concernant vos rendez-vous ou traitements' },
        { text: 'Pour remplir nos obligations l\u00e9gales et r\u00e9glementaires' },
        { text: "Pour am\u00e9liorer nos services et l'exp\u00e9rience patient" },
      ],
    },
    {
      title: '5. Conservation des donn\u00e9es',
      paragraphs: [
        "Vos donn\u00e9es personnelles sont conserv\u00e9es conform\u00e9ment \u00e0 la l\u00e9gislation albanaise sur la documentation m\u00e9dicale. Les donn\u00e9es de sant\u00e9 sont conserv\u00e9es pendant une dur\u00e9e minimale de 10 ans apr\u00e8s le dernier traitement, comme l'exige la loi. Les autres donn\u00e9es personnelles ne sont conserv\u00e9es que pendant la dur\u00e9e n\u00e9cessaire aux finalit\u00e9s du traitement.",
      ],
    },
    {
      title: '6. Vos droits',
      listIntro: 'En vertu du RGPD et de la l\u00e9gislation albanaise, vous avez le droit de :',
      items: [
        { bold: 'Acc\u00e8s :', text: 'Demander une copie de vos donn\u00e9es personnelles' },
        { bold: 'Rectification :', text: 'Demander la correction de donn\u00e9es inexactes' },
        {
          bold: 'Effacement :',
          text: "Demander la suppression de vos donn\u00e9es (\u00ab droit \u00e0 l'oubli \u00bb)",
        },
        { bold: 'Limitation :', text: 'Demander la limitation du traitement' },
        {
          bold: 'Portabilit\u00e9 :',
          text: 'Recevoir vos donn\u00e9es dans un format structur\u00e9',
        },
        {
          bold: 'Opposition :',
          text: 'Vous opposer au traitement \u00e0 des fins de marketing direct',
        },
        {
          bold: 'Retrait du consentement :',
          text: '\u00c0 tout moment, sans affecter la lic\u00e9it\u00e9 du traitement ant\u00e9rieur',
        },
      ],
    },
    {
      title: '7. S\u00e9curit\u00e9 des donn\u00e9es',
      paragraphs: [
        'Nous mettons en \u0153uvre des mesures techniques et organisationnelles appropri\u00e9es pour prot\u00e9ger vos donn\u00e9es personnelles contre tout acc\u00e8s non autoris\u00e9, perte ou dommage. Notre syst\u00e8me utilise le chiffrement SSL/TLS pour la transmission des donn\u00e9es et est h\u00e9berg\u00e9 sur des serveurs s\u00e9curis\u00e9s.',
      ],
    },
    {
      title: '8. Cookies et technologies similaires',
      paragraphs: [
        "Notre site web utilise des cookies essentiels au bon fonctionnement du site. Nous n'utilisons pas de cookies \u00e0 des fins de marketing ou de suivi sans votre consentement.",
      ],
    },
    {
      title: '9. Assistant virtuel (chatbot IA)',
      paragraphs: [
        "Notre assistant virtuel (chatbot) utilise Google Gemini API. Les conversations sont trait\u00e9es par Google et ne sont pas stock\u00e9es sur nos serveurs. Ne partagez pas d'informations de sant\u00e9 sensibles via le chat.",
      ],
    },
    {
      title: '10. Notifications WhatsApp',
      paragraphs: [
        'Si vous donnez votre consentement, nous pouvons vous envoyer des notifications de rendez-vous via WhatsApp. Votre num\u00e9ro de t\u00e9l\u00e9phone est partag\u00e9 avec Meta Platforms (WhatsApp Business API) \u00e0 cette fin. Vous pouvez retirer votre consentement \u00e0 tout moment.',
      ],
    },
    {
      title: '11. Syst\u00e8me de gestion des patients (CRM)',
      paragraphs: [
        'Vos donn\u00e9es de r\u00e9servation sont synchronis\u00e9es avec notre syst\u00e8me de gestion des patients (ManagerCRM) pour la planification des rendez-vous et la tenue des dossiers m\u00e9dicaux.',
      ],
    },
    {
      title: '12. G\u00e9olocalisation IP',
      paragraphs: [
        'Nous utilisons votre adresse IP pour d\u00e9tecter automatiquement votre langue pr\u00e9f\u00e9r\u00e9e. Ces donn\u00e9es sont trait\u00e9es en temps r\u00e9el et ne sont pas stock\u00e9es. Vous pouvez changer votre langue manuellement \u00e0 tout moment.',
      ],
    },
    {
      title: '13. Transferts de donn\u00e9es',
      paragraphs: [
        "Vos donn\u00e9es personnelles ne sont pas transf\u00e9r\u00e9es en dehors de l'Albanie ou de l'Union europ\u00e9enne sans garanties appropri\u00e9es. Si un transfert est n\u00e9cessaire, nous nous assurerons que le pays destinataire offre un niveau de protection ad\u00e9quat.",
        'Pour les services mentionn\u00e9s ci-dessus, les donn\u00e9es peuvent \u00eatre transf\u00e9r\u00e9es \u00e0 : Google LLC (US) pour le traitement du chatbot IA, et Meta Platforms, Inc. (US) pour les notifications WhatsApp. Ces transferts sont prot\u00e9g\u00e9s par des clauses contractuelles types (CCT) approuv\u00e9es par la Commission europ\u00e9enne.',
      ],
    },
    {
      title: '14. Contact',
      paragraphs: [
        'Pour toute question concernant cette politique ou pour exercer vos droits, veuillez nous contacter :',
        'Zeo Dental Clinic\nEmail : zeodentalclinic@gmail.com\nT\u00e9l : +355 68 400 4840\nAdresse : Rruga Hamdi Sina, Tirana, Albania',
      ],
    },
    {
      title: '15. Autorit\u00e9 de contr\u00f4le',
      paragraphs: [
        "Si vous estimez que vos droits ont \u00e9t\u00e9 viol\u00e9s, vous avez le droit de d\u00e9poser une plainte aupr\u00e8s du Commissaire pour le droit \u00e0 l'information et la protection des donn\u00e9es personnelles :",
        'Commissioner for the Right to Information and Personal Data Protection\nRruga "Abdi Toptani", Nr. 5, Tirana\nSite web : www.idp.al',
      ],
    },
  ],
};
const tr: PrivacyContent = {
  backToHome: 'Ana Sayfaya D\u00f6n',
  pageTitle: 'Gizlilik Politikas\u0131',
  lastUpdated: 'Son g\u00fcncelleme: \u015eubat 2026',
  copyright: '\u00a9 2026 Zeo Dental Clinic. T\u00fcm haklar\u0131 sakl\u0131d\u0131r.',
  sections: [
    {
      title: '1. Genel Bilgiler',
      paragraphs: [
        'Zeo Dental Clinic ("biz", "bizim" veya "Klinik") gizlili\u011finize sayg\u0131 duyar ve ki\u015fisel verilerinizi korumay\u0131 taahh\u00fct eder. Bu gizlilik politikas\u0131, bilgilerinizi Arnavutluk 9887/2008 say\u0131l\u0131 "Ki\u015fisel Verilerin Korunmas\u0131 Hakk\u0131nda" Kanun ve Avrupa Birli\u011fi Genel Veri Koruma T\u00fcz\u00fc\u011f\u00fc (GDPR) uyar\u0131nca nas\u0131l toplad\u0131\u011f\u0131m\u0131z\u0131, kulland\u0131\u011f\u0131m\u0131z\u0131 ve korudu\u011fumuzu a\u00e7\u0131klamaktad\u0131r.',
        '**Veri Sorumlusu:**\nZeo Dental Clinic\nRruga Hamdi Sina, Tirana, Albania\nE-posta: zeodentalclinic@gmail.com\nTel: +355 68 400 4840',
      ],
    },
    {
      title: '2. Toplad\u0131\u011f\u0131m\u0131z Veriler',
      listIntro: 'A\u015fa\u011f\u0131daki t\u00fcrde verileri topluyoruz:',
      items: [
        { bold: 'Kimlik verileri:', text: 'Ad, soyad, telefon numaras\u0131, e-posta adresi' },
        {
          bold: 'Sa\u011fl\u0131k verileri:',
          text: 'Di\u015f ge\u00e7mi\u015fi, talep edilen tedavi, radyografiler ve di\u015f bak\u0131m\u0131 i\u00e7in gerekli di\u011fer t\u0131bbi bilgiler',
        },
        {
          bold: '\u0130leti\u015fim verileri:',
          text: 'E-posta, telefon veya WhatsApp arac\u0131l\u0131\u011f\u0131yla klini\u011fimizle yap\u0131lan yaz\u0131\u015fmalar',
        },
        { bold: 'Randevu verileri:', text: 'Tercih edilen randevu tarihi ve saati' },
      ],
    },
    {
      title: '3. \u0130\u015flemenin Hukuki Dayana\u011f\u0131',
      listIntro:
        'Ki\u015fisel verilerinizi a\u015fa\u011f\u0131daki hukuki dayanaklara g\u00f6re i\u015fliyoruz:',
      items: [
        {
          bold: 'A\u00e7\u0131k r\u0131zan\u0131z:',
          text: 'Veri i\u015fleme i\u00e7in onay verdi\u011finizde (Article 6(1)(a) GDPR)',
        },
        {
          bold: 'S\u00f6zle\u015fmenin ifas\u0131:',
          text: 'Talep etti\u011finiz di\u015f hekimli\u011fi hizmetlerini sunmak i\u00e7in (Article 6(1)(b) GDPR)',
        },
        {
          bold: 'Yasal y\u00fck\u00fcml\u00fcl\u00fckler:',
          text: 'Arnavutluk sa\u011fl\u0131k mevzuat\u0131 kapsam\u0131ndaki yasal y\u00fck\u00fcml\u00fcl\u00fcklerimizi yerine getirmek i\u00e7in (Article 6(1)(c) GDPR)',
        },
        {
          bold: 'Me\u015fru menfaatler:',
          text: 'Hizmetlerimizi geli\u015ftirmek ve do\u011frudan ileti\u015fim i\u00e7in (Article 6(1)(f) GDPR)',
        },
      ],
    },
    {
      title: '4. Verilerinizi Nas\u0131l Kullan\u0131yoruz',
      items: [
        {
          text: 'Randevular\u0131n\u0131z\u0131 ve rezervasyonlar\u0131n\u0131z\u0131 y\u00f6netmek i\u00e7in',
        },
        { text: 'Di\u015f tedavisi ve t\u0131bbi bak\u0131m sa\u011flamak i\u00e7in' },
        {
          text: 'Randevular\u0131n\u0131z veya tedavileriniz hakk\u0131nda sizinle ileti\u015fime ge\u00e7mek i\u00e7in',
        },
        {
          text: 'Yasal ve d\u00fczenleyici y\u00fck\u00fcml\u00fcl\u00fcklerimizi yerine getirmek i\u00e7in',
        },
        { text: 'Hizmetlerimizi ve hasta deneyimini iyile\u015ftirmek i\u00e7in' },
      ],
    },
    {
      title: '5. Veri Saklama',
      paragraphs: [
        'Ki\u015fisel verileriniz, t\u0131bbi belgelere ili\u015fkin Arnavutluk mevzuat\u0131na uygun olarak saklanmaktad\u0131r. Sa\u011fl\u0131k verileri, yasan\u0131n gerektirdi\u011fi \u015fekilde son tedaviden sonra en az 10 y\u0131l s\u00fcreyle saklan\u0131r. Di\u011fer ki\u015fisel veriler yaln\u0131zca i\u015fleme ama\u00e7lar\u0131 i\u00e7in gerekli oldu\u011fu s\u00fcrece saklan\u0131r.',
      ],
    },
    {
      title: '6. Haklar\u0131n\u0131z',
      listIntro:
        'GDPR ve Arnavutluk mevzuat\u0131 kapsam\u0131nda a\u015fa\u011f\u0131daki haklara sahipsiniz:',
      items: [
        {
          bold: 'Eri\u015fim:',
          text: 'Ki\u015fisel verilerinizin bir kopyas\u0131n\u0131 talep etme',
        },
        { bold: 'D\u00fczeltme:', text: 'Hatal\u0131 verilerin d\u00fczeltilmesini talep etme' },
        { bold: 'Silme:', text: 'Verilerinizin silinmesini talep etme ("unutulma hakk\u0131")' },
        {
          bold: 'K\u0131s\u0131tlama:',
          text: '\u0130\u015flemenin k\u0131s\u0131tlanmas\u0131n\u0131 talep etme',
        },
        {
          bold: 'Ta\u015f\u0131nabilirlik:',
          text: 'Verilerinizi yap\u0131land\u0131r\u0131lm\u0131\u015f bir formatta alma',
        },
        {
          bold: '\u0130tiraz:',
          text: 'Do\u011frudan pazarlama amac\u0131yla i\u015flemeye itiraz etme',
        },
        {
          bold: 'Onay\u0131 geri \u00e7ekme:',
          text: '\u00d6nceki i\u015flemenin hukuka uygunlu\u011funu etkilemeksizin, herhangi bir zamanda',
        },
      ],
    },
    {
      title: '7. Veri G\u00fcvenli\u011fi',
      paragraphs: [
        'Ki\u015fisel verilerinizi yetkisiz eri\u015fime, kayba veya hasara kar\u015f\u0131 korumak i\u00e7in uygun teknik ve organizasyonel \u00f6nlemler uyguluyoruz. Sistemimiz veri iletimi i\u00e7in SSL/TLS \u015fifreleme kullanmakta olup g\u00fcvenli sunucularda bar\u0131nd\u0131r\u0131lmaktad\u0131r.',
      ],
    },
    {
      title: '8. \u00c7erezler ve Benzer Teknolojiler',
      paragraphs: [
        'Web sitemiz, sitenin d\u00fczg\u00fcn \u00e7al\u0131\u015fmas\u0131 i\u00e7in gerekli \u00e7erezleri kullanmaktad\u0131r. Onay\u0131n\u0131z olmadan pazarlama veya izleme ama\u00e7l\u0131 \u00e7erezler kullanm\u0131yoruz.',
      ],
    },
    {
      title: '9. Sanal Asistan (Yapay Zeka Sohbet Robotu)',
      paragraphs: [
        'Sanal asistan\u0131m\u0131z (sohbet robotu) Google Gemini API kullanmaktad\u0131r. Konu\u015fmalar Google taraf\u0131ndan i\u015flenmekte olup sunucular\u0131m\u0131zda saklanmamaktad\u0131r. Sohbet \u00fczerinden hassas sa\u011fl\u0131k bilgilerinizi payla\u015fmay\u0131n\u0131z.',
      ],
    },
    {
      title: '10. WhatsApp Bildirimleri',
      paragraphs: [
        'Onay vermeniz halinde, randevu bildirimlerini WhatsApp arac\u0131l\u0131\u011f\u0131yla g\u00f6nderebiliriz. Telefon numaran\u0131z bu ama\u00e7la Meta Platforms (WhatsApp Business API) ile payla\u015f\u0131lmaktad\u0131r. Onay\u0131n\u0131z\u0131 istedi\u011finiz zaman geri \u00e7ekebilirsiniz.',
      ],
    },
    {
      title: '11. Hasta Y\u00f6netim Sistemi (CRM)',
      paragraphs: [
        'Randevu verileriniz, randevu planlamas\u0131 ve t\u0131bbi kay\u0131t tutma amac\u0131yla hasta y\u00f6netim sistemimize (ManagerCRM) senkronize edilmektedir.',
      ],
    },
    {
      title: '12. IP Co\u011frafi Konum',
      paragraphs: [
        'Tercih etti\u011finiz dili otomatik olarak tespit etmek i\u00e7in IP adresinizi kullan\u0131yoruz. Bu veriler ger\u00e7ek zamanl\u0131 olarak i\u015flenmekte ve saklanmamaktad\u0131r. Dilinizi istedi\u011finiz zaman manuel olarak de\u011fi\u015ftirebilirsiniz.',
      ],
    },
    {
      title: '13. Veri Aktar\u0131mlar\u0131',
      paragraphs: [
        'Ki\u015fisel verileriniz, uygun g\u00fcvenceler olmaks\u0131z\u0131n Arnavutluk veya Avrupa Birli\u011fi d\u0131\u015f\u0131na aktar\u0131lmaz. Aktar\u0131m gerekli olmas\u0131 halinde, al\u0131c\u0131 \u00fclkenin yeterli d\u00fczeyde koruma sa\u011flad\u0131\u011f\u0131ndan emin olaca\u011f\u0131z.',
        'Yukar\u0131da belirtilen hizmetler i\u00e7in veriler \u015fu kurulu\u015flara aktar\u0131labilir: Google LLC (US) yapay zeka sohbet robotu i\u015fleme i\u00e7in ve Meta Platforms, Inc. (US) WhatsApp bildirimleri i\u00e7in. Bu aktar\u0131mlar, Avrupa Komisyonu taraf\u0131ndan onaylanan Standart S\u00f6zle\u015fme H\u00fck\u00fcmleri (SSH) ile korunmaktad\u0131r.',
      ],
    },
    {
      title: '14. \u0130leti\u015fim',
      paragraphs: [
        'Bu politika hakk\u0131nda herhangi bir sorunuz varsa veya haklar\u0131n\u0131z\u0131 kullanmak istiyorsan\u0131z, l\u00fctfen bizimle ileti\u015fime ge\u00e7in:',
        'Zeo Dental Clinic\nE-posta: zeodentalclinic@gmail.com\nTel: +355 68 400 4840\nAdres: Rruga Hamdi Sina, Tirana, Albania',
      ],
    },
    {
      title: '15. Denetim Makam\u0131',
      paragraphs: [
        "Haklar\u0131n\u0131z\u0131n ihlal edildi\u011fine inan\u0131yorsan\u0131z, Bilgi Edinme Hakk\u0131 ve Ki\u015fisel Verilerin Korunmas\u0131 Komiserli\u011fi'ne \u015fikayette bulunma hakk\u0131na sahipsiniz:",
        'Commissioner for the Right to Information and Personal Data Protection\nRruga "Abdi Toptani", Nr. 5, Tirana\nWeb sitesi: www.idp.al',
      ],
    },
  ],
};
const el: PrivacyContent = {
  backToHome:
    '\u0395\u03c0\u03b9\u03c3\u03c4\u03c1\u03bf\u03c6\u03ae \u03c3\u03c4\u03b7\u03bd \u0391\u03c1\u03c7\u03b9\u03ba\u03ae',
  pageTitle:
    '\u03a0\u03bf\u03bb\u03b9\u03c4\u03b9\u03ba\u03ae \u0391\u03c0\u03bf\u03c1\u03c1\u03ae\u03c4\u03bf\u03c5',
  lastUpdated:
    '\u03a4\u03b5\u03bb\u03b5\u03c5\u03c4\u03b1\u03af\u03b1 \u03b5\u03bd\u03b7\u03bc\u03ad\u03c1\u03c9\u03c3\u03b7: \u03a6\u03b5\u03b2\u03c1\u03bf\u03c5\u03ac\u03c1\u03b9\u03bf\u03c2 2026',
  copyright:
    '\u00a9 2026 Zeo Dental Clinic. \u039c\u03b5 \u03b5\u03c0\u03b9\u03c6\u03cd\u03bb\u03b1\u03be\u03b7 \u03c0\u03b1\u03bd\u03c4\u03cc\u03c2 \u03b4\u03b9\u03ba\u03b1\u03b9\u03ce\u03bc\u03b1\u03c4\u03bf\u03c2.',
  sections: [
    {
      title:
        '1. \u0393\u03b5\u03bd\u03b9\u03ba\u03ad\u03c2 \u03a0\u03bb\u03b7\u03c1\u03bf\u03c6\u03bf\u03c1\u03af\u03b5\u03c2',
      paragraphs: [
        '\u0397 Zeo Dental Clinic ("\u03b5\u03bc\u03b5\u03af\u03c2", "\u03bc\u03b1\u03c2" \u03ae "\u03b7 \u039a\u03bb\u03b9\u03bd\u03b9\u03ba\u03ae") \u03c3\u03ad\u03b2\u03b5\u03c4\u03b1\u03b9 \u03c4\u03bf \u03b1\u03c0\u03cc\u03c1\u03c1\u03b7\u03c4\u03cc \u03c3\u03b1\u03c2 \u03ba\u03b1\u03b9 \u03b4\u03b5\u03c3\u03bc\u03b5\u03cd\u03b5\u03c4\u03b1\u03b9 \u03bd\u03b1 \u03c0\u03c1\u03bf\u03c3\u03c4\u03b1\u03c4\u03b5\u03cd\u03b5\u03b9 \u03c4\u03b1 \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac \u03c3\u03b1\u03c2 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1. \u0397 \u03c0\u03b1\u03c1\u03bf\u03cd\u03c3\u03b1 \u03c0\u03bf\u03bb\u03b9\u03c4\u03b9\u03ba\u03ae \u03b1\u03c0\u03bf\u03c1\u03c1\u03ae\u03c4\u03bf\u03c5 \u03b5\u03be\u03b7\u03b3\u03b5\u03af \u03c0\u03ce\u03c2 \u03c3\u03c5\u03bb\u03bb\u03ad\u03b3\u03bf\u03c5\u03bc\u03b5, \u03c7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03bf\u03cd\u03bc\u03b5 \u03ba\u03b1\u03b9 \u03c0\u03c1\u03bf\u03c3\u03c4\u03b1\u03c4\u03b5\u03cd\u03bf\u03c5\u03bc\u03b5 \u03c4\u03b9\u03c2 \u03c0\u03bb\u03b7\u03c1\u03bf\u03c6\u03bf\u03c1\u03af\u03b5\u03c2 \u03c3\u03b1\u03c2 \u03c3\u03cd\u03bc\u03c6\u03c9\u03bd\u03b1 \u03bc\u03b5 \u03c4\u03bf\u03bd \u0391\u03bb\u03b2\u03b1\u03bd\u03b9\u03ba\u03cc \u039d\u03cc\u03bc\u03bf \u0391\u03c1. 9887/2008 "\u0393\u03b9\u03b1 \u03c4\u03b7\u03bd \u03a0\u03c1\u03bf\u03c3\u03c4\u03b1\u03c3\u03af\u03b1 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd \u03a0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03bf\u03cd \u03a7\u03b1\u03c1\u03b1\u03ba\u03c4\u03ae\u03c1\u03b1" \u03ba\u03b1\u03b9 \u03c4\u03bf\u03bd \u0393\u03b5\u03bd\u03b9\u03ba\u03cc \u039a\u03b1\u03bd\u03bf\u03bd\u03b9\u03c3\u03bc\u03cc \u03a0\u03c1\u03bf\u03c3\u03c4\u03b1\u03c3\u03af\u03b1\u03c2 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd (GDPR) \u03c4\u03b7\u03c2 \u0395\u03c5\u03c1\u03c9\u03c0\u03b1\u03ca\u03ba\u03ae\u03c2 \u0388\u03bd\u03c9\u03c3\u03b7\u03c2.',
        '**\u03a5\u03c0\u03b5\u03cd\u03b8\u03c5\u03bd\u03bf\u03c2 \u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1\u03c2 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd:**\nZeo Dental Clinic\nRruga Hamdi Sina, Tirana, Albania\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840',
      ],
    },
    {
      title:
        '2. \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c0\u03bf\u03c5 \u03a3\u03c5\u03bb\u03bb\u03ad\u03b3\u03bf\u03c5\u03bc\u03b5',
      listIntro:
        '\u03a3\u03c5\u03bb\u03bb\u03ad\u03b3\u03bf\u03c5\u03bc\u03b5 \u03c4\u03bf\u03c5\u03c2 \u03b1\u03ba\u03cc\u03bb\u03bf\u03c5\u03b8\u03bf\u03c5\u03c2 \u03c4\u03cd\u03c0\u03bf\u03c5\u03c2 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd:',
      items: [
        {
          bold: '\u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c4\u03b1\u03c5\u03c4\u03bf\u03c0\u03bf\u03af\u03b7\u03c3\u03b7\u03c2:',
          text: '\u038c\u03bd\u03bf\u03bc\u03b1, \u03b5\u03c0\u03ce\u03bd\u03c5\u03bc\u03bf, \u03b1\u03c1\u03b9\u03b8\u03bc\u03cc\u03c2 \u03c4\u03b7\u03bb\u03b5\u03c6\u03ce\u03bd\u03bf\u03c5, \u03b4\u03b9\u03b5\u03cd\u03b8\u03c5\u03bd\u03c3\u03b7 email',
        },
        {
          bold: '\u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c5\u03b3\u03b5\u03af\u03b1\u03c2:',
          text: '\u039f\u03b4\u03bf\u03bd\u03c4\u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03cc \u03b9\u03c3\u03c4\u03bf\u03c1\u03b9\u03ba\u03cc, \u03b1\u03b9\u03c4\u03bf\u03cd\u03bc\u03b5\u03bd\u03b7 \u03b8\u03b5\u03c1\u03b1\u03c0\u03b5\u03af\u03b1, \u03b1\u03ba\u03c4\u03b9\u03bd\u03bf\u03b3\u03c1\u03b1\u03c6\u03af\u03b5\u03c2 \u03ba\u03b1\u03b9 \u03ac\u03bb\u03bb\u03b5\u03c2 \u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03ad\u03c2 \u03c0\u03bb\u03b7\u03c1\u03bf\u03c6\u03bf\u03c1\u03af\u03b5\u03c2 \u03b1\u03c0\u03b1\u03c1\u03b1\u03af\u03c4\u03b7\u03c4\u03b5\u03c2 \u03b3\u03b9\u03b1 \u03c4\u03b7\u03bd \u03bf\u03b4\u03bf\u03bd\u03c4\u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03ae \u03c6\u03c1\u03bf\u03bd\u03c4\u03af\u03b4\u03b1',
        },
        {
          bold: '\u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03b5\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03af\u03b1\u03c2:',
          text: '\u0391\u03bb\u03bb\u03b7\u03bb\u03bf\u03b3\u03c1\u03b1\u03c6\u03af\u03b1 \u03bc\u03b5 \u03c4\u03b7\u03bd \u03ba\u03bb\u03b9\u03bd\u03b9\u03ba\u03ae \u03bc\u03b1\u03c2 \u03bc\u03ad\u03c3\u03c9 email, \u03c4\u03b7\u03bb\u03b5\u03c6\u03ce\u03bd\u03bf\u03c5 \u03ae WhatsApp',
        },
        {
          bold: '\u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03ba\u03c1\u03b1\u03c4\u03ae\u03c3\u03b5\u03c9\u03bd:',
          text: '\u03a0\u03c1\u03bf\u03c4\u03b9\u03bc\u03ce\u03bc\u03b5\u03bd\u03b7 \u03b7\u03bc\u03b5\u03c1\u03bf\u03bc\u03b7\u03bd\u03af\u03b1 \u03ba\u03b1\u03b9 \u03ce\u03c1\u03b1 \u03c1\u03b1\u03bd\u03c4\u03b5\u03b2\u03bf\u03cd',
        },
      ],
    },
    {
      title:
        '3. \u039d\u03bf\u03bc\u03b9\u03ba\u03ae \u0392\u03ac\u03c3\u03b7 \u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1\u03c2',
      listIntro:
        '\u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03b6\u03cc\u03bc\u03b1\u03c3\u03c4\u03b5 \u03c4\u03b1 \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac \u03c3\u03b1\u03c2 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03b2\u03ac\u03c3\u03b5\u03b9:',
      items: [
        {
          bold: '\u0397 \u03c3\u03c5\u03b3\u03ba\u03b1\u03c4\u03ac\u03b8\u03b5\u03c3\u03ae \u03c3\u03b1\u03c2:',
          text: '\u038c\u03c4\u03b1\u03bd \u03b4\u03af\u03bd\u03b5\u03c4\u03b5 \u03c4\u03b7 \u03c3\u03c5\u03b3\u03ba\u03b1\u03c4\u03ac\u03b8\u03b5\u03c3\u03ae \u03c3\u03b1\u03c2 \u03b3\u03b9\u03b1 \u03c4\u03b7\u03bd \u03b5\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd (Article 6(1)(a) GDPR)',
        },
        {
          bold: '\u0395\u03ba\u03c4\u03ad\u03bb\u03b5\u03c3\u03b7 \u03c3\u03cd\u03bc\u03b2\u03b1\u03c3\u03b7\u03c2:',
          text: '\u0393\u03b9\u03b1 \u03c4\u03b7\u03bd \u03c0\u03b1\u03c1\u03bf\u03c7\u03ae \u03c4\u03c9\u03bd \u03bf\u03b4\u03bf\u03bd\u03c4\u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03ce\u03bd \u03c5\u03c0\u03b7\u03c1\u03b5\u03c3\u03b9\u03ce\u03bd \u03c0\u03bf\u03c5 \u03ad\u03c7\u03b5\u03c4\u03b5 \u03b6\u03b7\u03c4\u03ae\u03c3\u03b5\u03b9 (Article 6(1)(b) GDPR)',
        },
        {
          bold: '\u039d\u03bf\u03bc\u03b9\u03ba\u03ad\u03c2 \u03c5\u03c0\u03bf\u03c7\u03c1\u03b5\u03ce\u03c3\u03b5\u03b9\u03c2:',
          text: '\u0393\u03b9\u03b1 \u03c4\u03b7\u03bd \u03b5\u03ba\u03c0\u03bb\u03ae\u03c1\u03c9\u03c3\u03b7 \u03c4\u03c9\u03bd \u03bd\u03bf\u03bc\u03b9\u03ba\u03ce\u03bd \u03bc\u03b1\u03c2 \u03c5\u03c0\u03bf\u03c7\u03c1\u03b5\u03ce\u03c3\u03b5\u03c9\u03bd \u03b2\u03ac\u03c3\u03b5\u03b9 \u03c4\u03bf\u03c5 \u03b1\u03bb\u03b2\u03b1\u03bd\u03b9\u03ba\u03bf\u03cd \u03bd\u03cc\u03bc\u03bf\u03c5 \u03c0\u03b5\u03c1\u03af \u03c5\u03b3\u03b5\u03af\u03b1\u03c2 (Article 6(1)(c) GDPR)',
        },
        {
          bold: '\u0388\u03bd\u03bd\u03bf\u03bc\u03b1 \u03c3\u03c5\u03bc\u03c6\u03ad\u03c1\u03bf\u03bd\u03c4\u03b1:',
          text: '\u0393\u03b9\u03b1 \u03c4\u03b7 \u03b2\u03b5\u03bb\u03c4\u03af\u03c9\u03c3\u03b7 \u03c4\u03c9\u03bd \u03c5\u03c0\u03b7\u03c1\u03b5\u03c3\u03b9\u03ce\u03bd \u03bc\u03b1\u03c2 \u03ba\u03b1\u03b9 \u03b3\u03b9\u03b1 \u03ac\u03bc\u03b5\u03c3\u03b7 \u03b5\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03af\u03b1 (Article 6(1)(f) GDPR)',
        },
      ],
    },
    {
      title:
        '4. \u03a0\u03ce\u03c2 \u03a7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03bf\u03cd\u03bc\u03b5 \u03c4\u03b1 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c3\u03b1\u03c2',
      items: [
        {
          text: '\u0393\u03b9\u03b1 \u03c4\u03b7 \u03b4\u03b9\u03b1\u03c7\u03b5\u03af\u03c1\u03b9\u03c3\u03b7 \u03c4\u03c9\u03bd \u03ba\u03c1\u03b1\u03c4\u03ae\u03c3\u03b5\u03c9\u03bd \u03ba\u03b1\u03b9 \u03c4\u03c9\u03bd \u03c1\u03b1\u03bd\u03c4\u03b5\u03b2\u03bf\u03cd \u03c3\u03b1\u03c2',
        },
        {
          text: '\u0393\u03b9\u03b1 \u03c4\u03b7\u03bd \u03c0\u03b1\u03c1\u03bf\u03c7\u03ae \u03bf\u03b4\u03bf\u03bd\u03c4\u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03ae\u03c2 \u03b8\u03b5\u03c1\u03b1\u03c0\u03b5\u03af\u03b1\u03c2 \u03ba\u03b1\u03b9 \u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03ae\u03c2 \u03c6\u03c1\u03bf\u03bd\u03c4\u03af\u03b4\u03b1\u03c2',
        },
        {
          text: '\u0393\u03b9\u03b1 \u03bd\u03b1 \u03b5\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03bf\u03cd\u03bc\u03b5 \u03bc\u03b1\u03b6\u03af \u03c3\u03b1\u03c2 \u03c3\u03c7\u03b5\u03c4\u03b9\u03ba\u03ac \u03bc\u03b5 \u03c4\u03b1 \u03c1\u03b1\u03bd\u03c4\u03b5\u03b2\u03bf\u03cd \u03ae \u03c4\u03b9\u03c2 \u03b8\u03b5\u03c1\u03b1\u03c0\u03b5\u03af\u03b5\u03c2 \u03c3\u03b1\u03c2',
        },
        {
          text: '\u0393\u03b9\u03b1 \u03c4\u03b7\u03bd \u03b5\u03ba\u03c0\u03bb\u03ae\u03c1\u03c9\u03c3\u03b7 \u03c4\u03c9\u03bd \u03bd\u03bf\u03bc\u03b9\u03ba\u03ce\u03bd \u03ba\u03b1\u03b9 \u03ba\u03b1\u03bd\u03bf\u03bd\u03b9\u03c3\u03c4\u03b9\u03ba\u03ce\u03bd \u03bc\u03b1\u03c2 \u03c5\u03c0\u03bf\u03c7\u03c1\u03b5\u03ce\u03c3\u03b5\u03c9\u03bd',
        },
        {
          text: '\u0393\u03b9\u03b1 \u03c4\u03b7 \u03b2\u03b5\u03bb\u03c4\u03af\u03c9\u03c3\u03b7 \u03c4\u03c9\u03bd \u03c5\u03c0\u03b7\u03c1\u03b5\u03c3\u03b9\u03ce\u03bd \u03bc\u03b1\u03c2 \u03ba\u03b1\u03b9 \u03c4\u03b7\u03c2 \u03b5\u03bc\u03c0\u03b5\u03b9\u03c1\u03af\u03b1\u03c2 \u03c4\u03c9\u03bd \u03b1\u03c3\u03b8\u03b5\u03bd\u03ce\u03bd',
        },
      ],
    },
    {
      title:
        '5. \u0394\u03b9\u03b1\u03c4\u03ae\u03c1\u03b7\u03c3\u03b7 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd',
      paragraphs: [
        '\u03a4\u03b1 \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac \u03c3\u03b1\u03c2 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03b4\u03b9\u03b1\u03c4\u03b7\u03c1\u03bf\u03cd\u03bd\u03c4\u03b1\u03b9 \u03c3\u03cd\u03bc\u03c6\u03c9\u03bd\u03b1 \u03bc\u03b5 \u03c4\u03b7\u03bd \u03b1\u03bb\u03b2\u03b1\u03bd\u03b9\u03ba\u03ae \u03bd\u03bf\u03bc\u03bf\u03b8\u03b5\u03c3\u03af\u03b1 \u03c0\u03b5\u03c1\u03af \u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03ae\u03c2 \u03c4\u03b5\u03ba\u03bc\u03b7\u03c1\u03af\u03c9\u03c3\u03b7\u03c2. \u03a4\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c5\u03b3\u03b5\u03af\u03b1\u03c2 \u03b4\u03b9\u03b1\u03c4\u03b7\u03c1\u03bf\u03cd\u03bd\u03c4\u03b1\u03b9 \u03b3\u03b9\u03b1 \u03b5\u03bb\u03ac\u03c7\u03b9\u03c3\u03c4\u03b7 \u03c0\u03b5\u03c1\u03af\u03bf\u03b4\u03bf 10 \u03b5\u03c4\u03ce\u03bd \u03bc\u03b5\u03c4\u03ac \u03c4\u03b7\u03bd \u03c4\u03b5\u03bb\u03b5\u03c5\u03c4\u03b1\u03af\u03b1 \u03b8\u03b5\u03c1\u03b1\u03c0\u03b5\u03af\u03b1, \u03cc\u03c0\u03c9\u03c2 \u03b1\u03c0\u03b1\u03b9\u03c4\u03b5\u03af \u03bf \u03bd\u03cc\u03bc\u03bf\u03c2. \u03a4\u03b1 \u03c5\u03c0\u03cc\u03bb\u03bf\u03b9\u03c0\u03b1 \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03b4\u03b9\u03b1\u03c4\u03b7\u03c1\u03bf\u03cd\u03bd\u03c4\u03b1\u03b9 \u03bc\u03cc\u03bd\u03bf \u03b3\u03b9\u03b1 \u03cc\u03c3\u03bf \u03c7\u03c1\u03cc\u03bd\u03bf \u03b5\u03af\u03bd\u03b1\u03b9 \u03b1\u03c0\u03b1\u03c1\u03b1\u03af\u03c4\u03b7\u03c4\u03bf \u03b3\u03b9\u03b1 \u03c4\u03bf\u03c5\u03c2 \u03c3\u03ba\u03bf\u03c0\u03bf\u03cd\u03c2 \u03c4\u03b7\u03c2 \u03b5\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1\u03c2.',
      ],
    },
    {
      title:
        '6. \u03a4\u03b1 \u0394\u03b9\u03ba\u03b1\u03b9\u03ce\u03bc\u03b1\u03c4\u03ac \u03c3\u03b1\u03c2',
      listIntro:
        '\u03a3\u03cd\u03bc\u03c6\u03c9\u03bd\u03b1 \u03bc\u03b5 \u03c4\u03bf\u03bd GDPR \u03ba\u03b1\u03b9 \u03c4\u03b7\u03bd \u03b1\u03bb\u03b2\u03b1\u03bd\u03b9\u03ba\u03ae \u03bd\u03bf\u03bc\u03bf\u03b8\u03b5\u03c3\u03af\u03b1, \u03ad\u03c7\u03b5\u03c4\u03b5 \u03c4\u03bf \u03b4\u03b9\u03ba\u03b1\u03af\u03c9\u03bc\u03b1:',
      items: [
        {
          bold: '\u03a0\u03c1\u03cc\u03c3\u03b2\u03b1\u03c3\u03b7:',
          text: '\u039d\u03b1 \u03b6\u03b7\u03c4\u03ae\u03c3\u03b5\u03c4\u03b5 \u03b1\u03bd\u03c4\u03af\u03b3\u03c1\u03b1\u03c6\u03bf \u03c4\u03c9\u03bd \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ce\u03bd \u03c3\u03b1\u03c2 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd',
        },
        {
          bold: '\u0394\u03b9\u03cc\u03c1\u03b8\u03c9\u03c3\u03b7:',
          text: '\u039d\u03b1 \u03b6\u03b7\u03c4\u03ae\u03c3\u03b5\u03c4\u03b5 \u03c4\u03b7 \u03b4\u03b9\u03cc\u03c1\u03b8\u03c9\u03c3\u03b7 \u03b1\u03bd\u03b1\u03ba\u03c1\u03b9\u03b2\u03ce\u03bd \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd',
        },
        {
          bold: '\u0394\u03b9\u03b1\u03b3\u03c1\u03b1\u03c6\u03ae:',
          text: '\u039d\u03b1 \u03b6\u03b7\u03c4\u03ae\u03c3\u03b5\u03c4\u03b5 \u03c4\u03b7 \u03b4\u03b9\u03b1\u03b3\u03c1\u03b1\u03c6\u03ae \u03c4\u03c9\u03bd \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd \u03c3\u03b1\u03c2 ("\u03b4\u03b9\u03ba\u03b1\u03af\u03c9\u03bc\u03b1 \u03c3\u03c4\u03b7 \u03bb\u03ae\u03b8\u03b7")',
        },
        {
          bold: '\u03a0\u03b5\u03c1\u03b9\u03bf\u03c1\u03b9\u03c3\u03bc\u03cc\u03c2:',
          text: '\u039d\u03b1 \u03b6\u03b7\u03c4\u03ae\u03c3\u03b5\u03c4\u03b5 \u03c4\u03bf\u03bd \u03c0\u03b5\u03c1\u03b9\u03bf\u03c1\u03b9\u03c3\u03bc\u03cc \u03c4\u03b7\u03c2 \u03b5\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1\u03c2',
        },
        {
          bold: '\u03a6\u03bf\u03c1\u03b7\u03c4\u03cc\u03c4\u03b7\u03c4\u03b1:',
          text: '\u039d\u03b1 \u03bb\u03ac\u03b2\u03b5\u03c4\u03b5 \u03c4\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c3\u03b1\u03c2 \u03c3\u03b5 \u03b4\u03bf\u03bc\u03b7\u03bc\u03ad\u03bd\u03b7 \u03bc\u03bf\u03c1\u03c6\u03ae',
        },
        {
          bold: '\u0395\u03bd\u03b1\u03bd\u03c4\u03af\u03c9\u03c3\u03b7:',
          text: '\u039d\u03b1 \u03b1\u03bd\u03c4\u03b9\u03c4\u03b1\u03c7\u03b8\u03b5\u03af\u03c4\u03b5 \u03c3\u03c4\u03b7\u03bd \u03b5\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1 \u03b3\u03b9\u03b1 \u03c3\u03ba\u03bf\u03c0\u03bf\u03cd\u03c2 \u03ac\u03bc\u03b5\u03c3\u03bf\u03c5 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c4\u03b9\u03bd\u03b3\u03ba',
        },
        {
          bold: '\u0391\u03bd\u03ac\u03ba\u03bb\u03b7\u03c3\u03b7 \u03c3\u03c5\u03b3\u03ba\u03b1\u03c4\u03ac\u03b8\u03b5\u03c3\u03b7\u03c2:',
          text: '\u0391\u03bd\u03ac \u03c0\u03ac\u03c3\u03b1 \u03c3\u03c4\u03b9\u03b3\u03bc\u03ae, \u03c7\u03c9\u03c1\u03af\u03c2 \u03bd\u03b1 \u03b5\u03c0\u03b7\u03c1\u03b5\u03ac\u03b6\u03b5\u03c4\u03b1\u03b9 \u03b7 \u03bd\u03bf\u03bc\u03b9\u03bc\u03cc\u03c4\u03b7\u03c4\u03b1 \u03c4\u03b7\u03c2 \u03c0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03b7\u03c2 \u03b5\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1\u03c2',
        },
      ],
    },
    {
      title:
        '7. \u0391\u03c3\u03c6\u03ac\u03bb\u03b5\u03b9\u03b1 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd',
      paragraphs: [
        '\u0395\u03c6\u03b1\u03c1\u03bc\u03cc\u03b6\u03bf\u03c5\u03bc\u03b5 \u03ba\u03b1\u03c4\u03ac\u03bb\u03bb\u03b7\u03bb\u03b1 \u03c4\u03b5\u03c7\u03bd\u03b9\u03ba\u03ac \u03ba\u03b1\u03b9 \u03bf\u03c1\u03b3\u03b1\u03bd\u03c9\u03c4\u03b9\u03ba\u03ac \u03bc\u03ad\u03c4\u03c1\u03b1 \u03b3\u03b9\u03b1 \u03c4\u03b7\u03bd \u03c0\u03c1\u03bf\u03c3\u03c4\u03b1\u03c3\u03af\u03b1 \u03c4\u03c9\u03bd \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ce\u03bd \u03c3\u03b1\u03c2 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd \u03b1\u03c0\u03cc \u03bc\u03b7 \u03b5\u03be\u03bf\u03c5\u03c3\u03b9\u03bf\u03b4\u03bf\u03c4\u03b7\u03bc\u03ad\u03bd\u03b7 \u03c0\u03c1\u03cc\u03c3\u03b2\u03b1\u03c3\u03b7, \u03b1\u03c0\u03ce\u03bb\u03b5\u03b9\u03b1 \u03ae \u03b6\u03b7\u03bc\u03af\u03b1. \u03a4\u03bf \u03c3\u03cd\u03c3\u03c4\u03b7\u03bc\u03ac \u03bc\u03b1\u03c2 \u03c7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03b5\u03af \u03ba\u03c1\u03c5\u03c0\u03c4\u03bf\u03b3\u03c1\u03ac\u03c6\u03b7\u03c3\u03b7 SSL/TLS \u03b3\u03b9\u03b1 \u03c4\u03b7 \u03bc\u03b5\u03c4\u03ac\u03b4\u03bf\u03c3\u03b7 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd \u03ba\u03b1\u03b9 \u03c6\u03b9\u03bb\u03bf\u03be\u03b5\u03bd\u03b5\u03af\u03c4\u03b1\u03b9 \u03c3\u03b5 \u03b1\u03c3\u03c6\u03b1\u03bb\u03b5\u03af\u03c2 \u03b4\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ad\u03c2.',
      ],
    },
    {
      title:
        '8. Cookies \u03ba\u03b1\u03b9 \u03a0\u03b1\u03c1\u03cc\u03bc\u03bf\u03b9\u03b5\u03c2 \u03a4\u03b5\u03c7\u03bd\u03bf\u03bb\u03bf\u03b3\u03af\u03b5\u03c2',
      paragraphs: [
        '\u039f \u03b9\u03c3\u03c4\u03cc\u03c4\u03bf\u03c0\u03cc\u03c2 \u03bc\u03b1\u03c2 \u03c7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03b5\u03af \u03b1\u03c0\u03b1\u03c1\u03b1\u03af\u03c4\u03b7\u03c4\u03b1 cookies \u03b3\u03b9\u03b1 \u03c4\u03b7 \u03c3\u03c9\u03c3\u03c4\u03ae \u03bb\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03af\u03b1 \u03c4\u03bf\u03c5 \u03b9\u03c3\u03c4\u03cc\u03c4\u03bf\u03c0\u03bf\u03c5. \u0394\u03b5\u03bd \u03c7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03bf\u03cd\u03bc\u03b5 cookies \u03b3\u03b9\u03b1 \u03c3\u03ba\u03bf\u03c0\u03bf\u03cd\u03c2 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c4\u03b9\u03bd\u03b3\u03ba \u03ae \u03c0\u03b1\u03c1\u03b1\u03ba\u03bf\u03bb\u03bf\u03cd\u03b8\u03b7\u03c3\u03b7\u03c2 \u03c7\u03c9\u03c1\u03af\u03c2 \u03c4\u03b7 \u03c3\u03c5\u03b3\u03ba\u03b1\u03c4\u03ac\u03b8\u03b5\u03c3\u03ae \u03c3\u03b1\u03c2.',
      ],
    },
    {
      title:
        '9. \u0395\u03b9\u03ba\u03bf\u03bd\u03b9\u03ba\u03cc\u03c2 \u0392\u03bf\u03b7\u03b8\u03cc\u03c2 (AI Chatbot)',
      paragraphs: [
        '\u039f \u03b5\u03b9\u03ba\u03bf\u03bd\u03b9\u03ba\u03cc\u03c2 \u03bc\u03b1\u03c2 \u03b2\u03bf\u03b7\u03b8\u03cc\u03c2 (chatbot) \u03c7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03b5\u03af \u03c4\u03bf Google Gemini API. \u039f\u03b9 \u03c3\u03c5\u03bd\u03bf\u03bc\u03b9\u03bb\u03af\u03b5\u03c2 \u03c5\u03c0\u03bf\u03b2\u03ac\u03bb\u03bb\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c3\u03b5 \u03b5\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1 \u03b1\u03c0\u03cc \u03c4\u03b7 Google \u03ba\u03b1\u03b9 \u03b4\u03b5\u03bd \u03b1\u03c0\u03bf\u03b8\u03b7\u03ba\u03b5\u03cd\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c3\u03c4\u03bf\u03c5\u03c2 \u03b4\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ad\u03c2 \u03bc\u03b1\u03c2. \u039c\u03b7\u03bd \u03bc\u03bf\u03b9\u03c1\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5 \u03b5\u03c5\u03b1\u03af\u03c3\u03b8\u03b7\u03c4\u03b5\u03c2 \u03c0\u03bb\u03b7\u03c1\u03bf\u03c6\u03bf\u03c1\u03af\u03b5\u03c2 \u03c5\u03b3\u03b5\u03af\u03b1\u03c2 \u03bc\u03ad\u03c3\u03c9 \u03c4\u03b7\u03c2 \u03c3\u03c5\u03bd\u03bf\u03bc\u03b9\u03bb\u03af\u03b1\u03c2.',
      ],
    },
    {
      title:
        '10. \u0395\u03b9\u03b4\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b5\u03b9\u03c2 \u03bc\u03ad\u03c3\u03c9 WhatsApp',
      paragraphs: [
        '\u0395\u03ac\u03bd \u03b4\u03ce\u03c3\u03b5\u03c4\u03b5 \u03c4\u03b7 \u03c3\u03c5\u03b3\u03ba\u03b1\u03c4\u03ac\u03b8\u03b5\u03c3\u03ae \u03c3\u03b1\u03c2, \u03b5\u03bd\u03b4\u03ad\u03c7\u03b5\u03c4\u03b1\u03b9 \u03bd\u03b1 \u03c3\u03b1\u03c2 \u03c3\u03c4\u03b5\u03af\u03bb\u03bf\u03c5\u03bc\u03b5 \u03b5\u03b9\u03b4\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b5\u03b9\u03c2 \u03c1\u03b1\u03bd\u03c4\u03b5\u03b2\u03bf\u03cd \u03bc\u03ad\u03c3\u03c9 WhatsApp. \u039f \u03b1\u03c1\u03b9\u03b8\u03bc\u03cc\u03c2 \u03c4\u03b7\u03bb\u03b5\u03c6\u03ce\u03bd\u03bf\u03c5 \u03c3\u03b1\u03c2 \u03ba\u03bf\u03b9\u03bd\u03bf\u03c0\u03bf\u03b9\u03b5\u03af\u03c4\u03b1\u03b9 \u03c3\u03c4\u03b7 Meta Platforms (WhatsApp Business API) \u03b3\u03b9\u03b1 \u03b1\u03c5\u03c4\u03cc\u03bd \u03c4\u03bf\u03bd \u03c3\u03ba\u03bf\u03c0\u03cc. \u039c\u03c0\u03bf\u03c1\u03b5\u03af\u03c4\u03b5 \u03bd\u03b1 \u03b1\u03bd\u03b1\u03ba\u03b1\u03bb\u03ad\u03c3\u03b5\u03c4\u03b5 \u03c4\u03b7 \u03c3\u03c5\u03b3\u03ba\u03b1\u03c4\u03ac\u03b8\u03b5\u03c3\u03ae \u03c3\u03b1\u03c2 \u03b1\u03bd\u03ac \u03c0\u03ac\u03c3\u03b1 \u03c3\u03c4\u03b9\u03b3\u03bc\u03ae.',
      ],
    },
    {
      title:
        '11. \u03a3\u03cd\u03c3\u03c4\u03b7\u03bc\u03b1 \u0394\u03b9\u03b1\u03c7\u03b5\u03af\u03c1\u03b9\u03c3\u03b7\u03c2 \u0391\u03c3\u03b8\u03b5\u03bd\u03ce\u03bd (CRM)',
      paragraphs: [
        '\u03a4\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03ba\u03c1\u03b1\u03c4\u03ae\u03c3\u03b5\u03ce\u03bd \u03c3\u03b1\u03c2 \u03c3\u03c5\u03b3\u03c7\u03c1\u03bf\u03bd\u03af\u03b6\u03bf\u03bd\u03c4\u03b1\u03b9 \u03bc\u03b5 \u03c4\u03bf \u03c3\u03cd\u03c3\u03c4\u03b7\u03bc\u03b1 \u03b4\u03b9\u03b1\u03c7\u03b5\u03af\u03c1\u03b9\u03c3\u03b7\u03c2 \u03b1\u03c3\u03b8\u03b5\u03bd\u03ce\u03bd \u03bc\u03b1\u03c2 (ManagerCRM) \u03b3\u03b9\u03b1 \u03c4\u03bf\u03bd \u03c0\u03c1\u03bf\u03b3\u03c1\u03b1\u03bc\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03cc \u03c1\u03b1\u03bd\u03c4\u03b5\u03b2\u03bf\u03cd \u03ba\u03b1\u03b9 \u03c4\u03b7\u03bd \u03c4\u03ae\u03c1\u03b7\u03c3\u03b7 \u03b9\u03b1\u03c4\u03c1\u03b9\u03ba\u03bf\u03cd \u03b1\u03c1\u03c7\u03b5\u03af\u03bf\u03c5.',
      ],
    },
    {
      title:
        '12. \u0393\u03b5\u03c9\u03b5\u03bd\u03c4\u03bf\u03c0\u03b9\u03c3\u03bc\u03cc\u03c2 IP',
      paragraphs: [
        '\u03a7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03bf\u03cd\u03bc\u03b5 \u03c4\u03b7 \u03b4\u03b9\u03b5\u03cd\u03b8\u03c5\u03bd\u03c3\u03b7 IP \u03c3\u03b1\u03c2 \u03b3\u03b9\u03b1 \u03b1\u03c5\u03c4\u03cc\u03bc\u03b1\u03c4\u03b7 \u03b1\u03bd\u03af\u03c7\u03bd\u03b5\u03c5\u03c3\u03b7 \u03c4\u03b7\u03c2 \u03c0\u03c1\u03bf\u03c4\u03b9\u03bc\u03ce\u03bc\u03b5\u03bd\u03b7\u03c2 \u03b3\u03bb\u03ce\u03c3\u03c3\u03b1\u03c2 \u03c3\u03b1\u03c2. \u0391\u03c5\u03c4\u03ac \u03c4\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c5\u03c0\u03bf\u03b2\u03ac\u03bb\u03bb\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c3\u03b5 \u03b5\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1 \u03c3\u03b5 \u03c0\u03c1\u03b1\u03b3\u03bc\u03b1\u03c4\u03b9\u03ba\u03cc \u03c7\u03c1\u03cc\u03bd\u03bf \u03ba\u03b1\u03b9 \u03b4\u03b5\u03bd \u03b1\u03c0\u03bf\u03b8\u03b7\u03ba\u03b5\u03cd\u03bf\u03bd\u03c4\u03b1\u03b9. \u039c\u03c0\u03bf\u03c1\u03b5\u03af\u03c4\u03b5 \u03bd\u03b1 \u03b1\u03bb\u03bb\u03ac\u03be\u03b5\u03c4\u03b5 \u03c4\u03b7 \u03b3\u03bb\u03ce\u03c3\u03c3\u03b1 \u03c3\u03b1\u03c2 \u03c7\u03b5\u03b9\u03c1\u03bf\u03ba\u03af\u03bd\u03b7\u03c4\u03b1 \u03b1\u03bd\u03ac \u03c0\u03ac\u03c3\u03b1 \u03c3\u03c4\u03b9\u03b3\u03bc\u03ae.',
      ],
    },
    {
      title:
        '13. \u039c\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03ad\u03c2 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd',
      paragraphs: [
        '\u03a4\u03b1 \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac \u03c3\u03b1\u03c2 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03b4\u03b5\u03bd \u03bc\u03b5\u03c4\u03b1\u03c6\u03ad\u03c1\u03bf\u03bd\u03c4\u03b1\u03b9 \u03b5\u03ba\u03c4\u03cc\u03c2 \u0391\u03bb\u03b2\u03b1\u03bd\u03af\u03b1\u03c2 \u03ae \u0395\u03c5\u03c1\u03c9\u03c0\u03b1\u03ca\u03ba\u03ae\u03c2 \u0388\u03bd\u03c9\u03c3\u03b7\u03c2 \u03c7\u03c9\u03c1\u03af\u03c2 \u03ba\u03b1\u03c4\u03ac\u03bb\u03bb\u03b7\u03bb\u03b5\u03c2 \u03b5\u03b3\u03b3\u03c5\u03ae\u03c3\u03b5\u03b9\u03c2. \u0395\u03ac\u03bd \u03bc\u03b9\u03b1 \u03bc\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03ac \u03b5\u03af\u03bd\u03b1\u03b9 \u03b1\u03c0\u03b1\u03c1\u03b1\u03af\u03c4\u03b7\u03c4\u03b7, \u03b8\u03b1 \u03b4\u03b9\u03b1\u03c3\u03c6\u03b1\u03bb\u03af\u03c3\u03bf\u03c5\u03bc\u03b5 \u03cc\u03c4\u03b9 \u03b7 \u03c7\u03ce\u03c1\u03b1 \u03c5\u03c0\u03bf\u03b4\u03bf\u03c7\u03ae\u03c2 \u03c0\u03b1\u03c1\u03ad\u03c7\u03b5\u03b9 \u03b5\u03c0\u03b1\u03c1\u03ba\u03ad\u03c2 \u03b5\u03c0\u03af\u03c0\u03b5\u03b4\u03bf \u03c0\u03c1\u03bf\u03c3\u03c4\u03b1\u03c3\u03af\u03b1\u03c2.',
        '\u0393\u03b9\u03b1 \u03c4\u03b9\u03c2 \u03c5\u03c0\u03b7\u03c1\u03b5\u03c3\u03af\u03b5\u03c2 \u03c0\u03bf\u03c5 \u03b1\u03bd\u03b1\u03c6\u03ad\u03c1\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c0\u03b1\u03c1\u03b1\u03c0\u03ac\u03bd\u03c9, \u03c4\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03b5\u03bd\u03b4\u03ad\u03c7\u03b5\u03c4\u03b1\u03b9 \u03bd\u03b1 \u03bc\u03b5\u03c4\u03b1\u03c6\u03b5\u03c1\u03b8\u03bf\u03cd\u03bd \u03c3\u03b5: Google LLC (US) \u03b3\u03b9\u03b1 \u03c4\u03b7\u03bd \u03b5\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1 \u03c4\u03bf\u03c5 AI chatbot, \u03ba\u03b1\u03b9 Meta Platforms, Inc. (US) \u03b3\u03b9\u03b1 \u03c4\u03b9\u03c2 \u03b5\u03b9\u03b4\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b5\u03b9\u03c2 \u03bc\u03ad\u03c3\u03c9 WhatsApp. \u0391\u03c5\u03c4\u03ad\u03c2 \u03bf\u03b9 \u03bc\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03ad\u03c2 \u03c0\u03c1\u03bf\u03c3\u03c4\u03b1\u03c4\u03b5\u03cd\u03bf\u03bd\u03c4\u03b1\u03b9 \u03b1\u03c0\u03cc \u03a4\u03c5\u03c0\u03bf\u03c0\u03bf\u03b9\u03b7\u03bc\u03ad\u03bd\u03b5\u03c2 \u03a3\u03c5\u03bc\u03b2\u03b1\u03c4\u03b9\u03ba\u03ad\u03c2 \u03a1\u03ae\u03c4\u03c1\u03b5\u03c2 (SCCs) \u03b5\u03b3\u03ba\u03b5\u03ba\u03c1\u03b9\u03bc\u03ad\u03bd\u03b5\u03c2 \u03b1\u03c0\u03cc \u03c4\u03b7\u03bd \u0395\u03c5\u03c1\u03c9\u03c0\u03b1\u03ca\u03ba\u03ae \u0395\u03c0\u03b9\u03c4\u03c1\u03bf\u03c0\u03ae.',
      ],
    },
    {
      title: '14. \u0395\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03af\u03b1',
      paragraphs: [
        '\u0393\u03b9\u03b1 \u03bf\u03c0\u03bf\u03b9\u03b1\u03b4\u03ae\u03c0\u03bf\u03c4\u03b5 \u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7 \u03c3\u03c7\u03b5\u03c4\u03b9\u03ba\u03ac \u03bc\u03b5 \u03b1\u03c5\u03c4\u03ae\u03bd \u03c4\u03b7\u03bd \u03c0\u03bf\u03bb\u03b9\u03c4\u03b9\u03ba\u03ae \u03ae \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03b1\u03c3\u03ba\u03ae\u03c3\u03b5\u03c4\u03b5 \u03c4\u03b1 \u03b4\u03b9\u03ba\u03b1\u03b9\u03ce\u03bc\u03b1\u03c4\u03ac \u03c3\u03b1\u03c2, \u03c0\u03b1\u03c1\u03b1\u03ba\u03b1\u03bb\u03bf\u03cd\u03bc\u03b5 \u03b5\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03ae\u03c3\u03c4\u03b5 \u03bc\u03b1\u03b6\u03af \u03bc\u03b1\u03c2:',
        'Zeo Dental Clinic\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840\nAddress: Rruga Hamdi Sina, Tirana, Albania',
      ],
    },
    {
      title: '15. \u0395\u03c0\u03bf\u03c0\u03c4\u03b9\u03ba\u03ae \u0391\u03c1\u03c7\u03ae',
      paragraphs: [
        '\u0395\u03ac\u03bd \u03c0\u03b9\u03c3\u03c4\u03b5\u03cd\u03b5\u03c4\u03b5 \u03cc\u03c4\u03b9 \u03c4\u03b1 \u03b4\u03b9\u03ba\u03b1\u03b9\u03ce\u03bc\u03b1\u03c4\u03ac \u03c3\u03b1\u03c2 \u03ad\u03c7\u03bf\u03c5\u03bd \u03c0\u03b1\u03c1\u03b1\u03b2\u03b9\u03b1\u03c3\u03c4\u03b5\u03af, \u03ad\u03c7\u03b5\u03c4\u03b5 \u03c4\u03bf \u03b4\u03b9\u03ba\u03b1\u03af\u03c9\u03bc\u03b1 \u03bd\u03b1 \u03c5\u03c0\u03bf\u03b2\u03ac\u03bb\u03b5\u03c4\u03b5 \u03ba\u03b1\u03c4\u03b1\u03b3\u03b3\u03b5\u03bb\u03af\u03b1 \u03c3\u03c4\u03bf\u03bd \u0395\u03c0\u03af\u03c4\u03c1\u03bf\u03c0\u03bf \u03b3\u03b9\u03b1 \u03c4\u03bf \u0394\u03b9\u03ba\u03b1\u03af\u03c9\u03bc\u03b1 \u03c3\u03c4\u03b7\u03bd \u03a0\u03bb\u03b7\u03c1\u03bf\u03c6\u03cc\u03c1\u03b7\u03c3\u03b7 \u03ba\u03b1\u03b9 \u03c4\u03b7\u03bd \u03a0\u03c1\u03bf\u03c3\u03c4\u03b1\u03c3\u03af\u03b1 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd \u03a0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03bf\u03cd \u03a7\u03b1\u03c1\u03b1\u03ba\u03c4\u03ae\u03c1\u03b1:',
        'Commissioner for the Right to Information and Personal Data Protection\nRruga "Abdi Toptani", Nr. 5, Tirana\nWebsite: www.idp.al',
      ],
    },
  ],
};
const es: PrivacyContent = {
  backToHome: 'Volver al Inicio',
  pageTitle: 'Pol\u00edtica de Privacidad',
  lastUpdated: '\u00daltima actualizaci\u00f3n: Febrero 2026',
  copyright: '\u00a9 2026 Zeo Dental Clinic. Todos los derechos reservados.',
  sections: [
    {
      title: '1. Informaci\u00f3n General',
      paragraphs: [
        'Zeo Dental Clinic ("nosotros", "nuestro" o "la Cl\u00ednica") respeta su privacidad y se compromete a proteger sus datos personales. Esta pol\u00edtica de privacidad explica c\u00f3mo recopilamos, utilizamos y protegemos su informaci\u00f3n de conformidad con la Ley albanesa N.\u00ba 9887/2008 "Sobre la Protecci\u00f3n de Datos Personales" y el Reglamento General de Protecci\u00f3n de Datos (GDPR) de la Uni\u00f3n Europea.',
        '**Responsable del Tratamiento de Datos:**\nZeo Dental Clinic\nRruga Hamdi Sina, Tirana, Albania\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840',
      ],
    },
    {
      title: '2. Datos que Recopilamos',
      listIntro: 'Recopilamos los siguientes tipos de datos:',
      items: [
        {
          bold: 'Datos de identificaci\u00f3n:',
          text: 'Nombre, apellido, n\u00famero de tel\u00e9fono, direcci\u00f3n de correo electr\u00f3nico',
        },
        {
          bold: 'Datos de salud:',
          text: 'Historial dental, tratamiento solicitado, radiograf\u00edas y otra informaci\u00f3n m\u00e9dica necesaria para la atenci\u00f3n dental',
        },
        {
          bold: 'Datos de comunicaci\u00f3n:',
          text: 'Correspondencia con nuestra cl\u00ednica a trav\u00e9s de correo electr\u00f3nico, tel\u00e9fono o WhatsApp',
        },
        { bold: 'Datos de reservas:', text: 'Fecha y hora preferidas de las citas' },
      ],
    },
    {
      title: '3. Base Legal del Tratamiento',
      listIntro: 'Tratamos sus datos personales en base a:',
      items: [
        {
          bold: 'Su consentimiento:',
          text: 'Cuando usted da su consentimiento para el tratamiento de datos (Article 6(1)(a) GDPR)',
        },
        {
          bold: 'Ejecuci\u00f3n de un contrato:',
          text: 'Para prestar los servicios dentales que usted ha solicitado (Article 6(1)(b) GDPR)',
        },
        {
          bold: 'Obligaciones legales:',
          text: 'Para cumplir con nuestras obligaciones legales en virtud de la legislaci\u00f3n sanitaria albanesa (Article 6(1)(c) GDPR)',
        },
        {
          bold: 'Intereses leg\u00edtimos:',
          text: 'Para mejorar nuestros servicios y para la comunicaci\u00f3n directa (Article 6(1)(f) GDPR)',
        },
      ],
    },
    {
      title: '4. C\u00f3mo Utilizamos sus Datos',
      items: [
        { text: 'Para gestionar sus reservas y citas' },
        { text: 'Para proporcionar tratamiento dental y atenci\u00f3n m\u00e9dica' },
        { text: 'Para contactarle en relaci\u00f3n con sus citas o tratamientos' },
        { text: 'Para cumplir con nuestras obligaciones legales y regulatorias' },
        { text: 'Para mejorar nuestros servicios y la experiencia del paciente' },
      ],
    },
    {
      title: '5. Conservaci\u00f3n de Datos',
      paragraphs: [
        'Sus datos personales se conservan de conformidad con la legislaci\u00f3n albanesa sobre documentaci\u00f3n m\u00e9dica. Los datos de salud se conservan durante un per\u00edodo m\u00ednimo de 10 a\u00f1os despu\u00e9s del \u00faltimo tratamiento, seg\u00fan lo exige la ley. Los dem\u00e1s datos personales se conservan \u00fanicamente durante el tiempo necesario para los fines del tratamiento.',
      ],
    },
    {
      title: '6. Sus Derechos',
      listIntro: 'En virtud del GDPR y la legislaci\u00f3n albanesa, usted tiene derecho a:',
      items: [
        { bold: 'Acceso:', text: 'Solicitar una copia de sus datos personales' },
        { bold: 'Rectificaci\u00f3n:', text: 'Solicitar la correcci\u00f3n de datos inexactos' },
        {
          bold: 'Supresi\u00f3n:',
          text: 'Solicitar la eliminaci\u00f3n de sus datos ("derecho al olvido")',
        },
        { bold: 'Limitaci\u00f3n:', text: 'Solicitar la limitaci\u00f3n del tratamiento' },
        { bold: 'Portabilidad:', text: 'Recibir sus datos en un formato estructurado' },
        { bold: 'Oposici\u00f3n:', text: 'Oponerse al tratamiento con fines de marketing directo' },
        {
          bold: 'Retirar el consentimiento:',
          text: 'En cualquier momento, sin que ello afecte a la licitud del tratamiento previo',
        },
      ],
    },
    {
      title: '7. Seguridad de los Datos',
      paragraphs: [
        'Implementamos medidas t\u00e9cnicas y organizativas apropiadas para proteger sus datos personales contra el acceso no autorizado, la p\u00e9rdida o el da\u00f1o. Nuestro sistema utiliza cifrado SSL/TLS para la transmisi\u00f3n de datos y est\u00e1 alojado en servidores seguros.',
      ],
    },
    {
      title: '8. Cookies y Tecnolog\u00edas Similares',
      paragraphs: [
        'Nuestro sitio web utiliza cookies esenciales para el correcto funcionamiento del sitio. No utilizamos cookies con fines de marketing o seguimiento sin su consentimiento.',
      ],
    },
    {
      title: '9. Asistente Virtual (AI Chatbot)',
      paragraphs: [
        'Nuestro asistente virtual (chatbot) utiliza Google Gemini API. Las conversaciones son procesadas por Google y no se almacenan en nuestros servidores. No comparta informaci\u00f3n de salud confidencial a trav\u00e9s del chat.',
      ],
    },
    {
      title: '10. Notificaciones por WhatsApp',
      paragraphs: [
        'Si usted otorga su consentimiento, podemos enviarle notificaciones de citas a trav\u00e9s de WhatsApp. Su n\u00famero de tel\u00e9fono se comparte con Meta Platforms (WhatsApp Business API) para este fin. Puede retirar su consentimiento en cualquier momento.',
      ],
    },
    {
      title: '11. Sistema de Gesti\u00f3n de Pacientes (CRM)',
      paragraphs: [
        'Los datos de sus reservas se sincronizan con nuestro sistema de gesti\u00f3n de pacientes (ManagerCRM) para la programaci\u00f3n de citas y el mantenimiento de registros m\u00e9dicos.',
      ],
    },
    {
      title: '12. Geolocalizaci\u00f3n IP',
      paragraphs: [
        'Utilizamos su direcci\u00f3n IP para detectar autom\u00e1ticamente su idioma preferido. Estos datos se procesan en tiempo real y no se almacenan. Puede cambiar su idioma manualmente en cualquier momento.',
      ],
    },
    {
      title: '13. Transferencias de Datos',
      paragraphs: [
        'Sus datos personales no se transfieren fuera de Albania o de la Uni\u00f3n Europea sin las garant\u00edas adecuadas. Si una transferencia es necesaria, nos aseguraremos de que el pa\u00eds receptor proporcione un nivel adecuado de protecci\u00f3n.',
        'Para los servicios mencionados anteriormente, los datos pueden ser transferidos a: Google LLC (US) para el procesamiento del AI chatbot, y Meta Platforms, Inc. (US) para las notificaciones por WhatsApp. Estas transferencias est\u00e1n protegidas por Cl\u00e1usulas Contractuales Tipo (SCCs) aprobadas por la Comisi\u00f3n Europea.',
      ],
    },
    {
      title: '14. Contacto',
      paragraphs: [
        'Para cualquier pregunta sobre esta pol\u00edtica o para ejercer sus derechos, p\u00f3ngase en contacto con nosotros:',
        'Zeo Dental Clinic\nEmail: zeodentalclinic@gmail.com\nTel: +355 68 400 4840\nAddress: Rruga Hamdi Sina, Tirana, Albania',
      ],
    },
    {
      title: '15. Autoridad de Supervisi\u00f3n',
      paragraphs: [
        'Si considera que sus derechos han sido vulnerados, tiene derecho a presentar una reclamaci\u00f3n ante el Comisionado para el Derecho a la Informaci\u00f3n y la Protecci\u00f3n de Datos Personales:',
        'Commissioner for the Right to Information and Personal Data Protection\nRruga "Abdi Toptani", Nr. 5, Tirana\nWebsite: www.idp.al',
      ],
    },
  ],
};

export const privacyContent: Record<Language, PrivacyContent> = {
  en,
  sq,
  it,
  de,
  fr,
  tr,
  el,
  es,
};
