import type { Language } from './i18n.js';

interface SeoMeta {
  title: string;
  description: string;
}

export const SEO_META: Record<string, Partial<Record<Language, SeoMeta>>> = {
  '/': {
    sq: {
      title: 'Zeo Dental Clinic | Klinikë Dentare Premium në Tiranë',
      description:
        'Klinikë dentare premium në Tiranë, Shqipëri. Implante dentare, estetikë dentare, ortodonci dhe trajtime të avancuara. Rezervoni konsultën falas tani.',
    },
    en: {
      title: 'Zeo Dental Clinic | Premium Dental Care in Tirana, Albania',
      description:
        'Premium dental clinic in Tirana, Albania. Dental implants, cosmetic dentistry & orthodontics. Save 50-70% vs UK/US prices. Book your free consultation today.',
    },
    it: {
      title: 'Zeo Dental Clinic | Dentista a Tirana, Albania',
      description:
        'Clinica dentale premium a Tirana, Albania. Impianti dentali, faccette e ortodonzia. Risparmia fino al 70% rispetto ai prezzi italiani. Preventivo gratuito.',
    },
    de: {
      title: 'Zeo Dental Clinic | Zahnarzt in Tirana, Albanien',
      description:
        'Premium-Zahnklinik in Tirana, Albanien. Zahnimplantate, ästhetische Zahnmedizin & Kieferorthopädie. Sparen Sie 50-70%. Kostenlose Beratung buchen.',
    },
    fr: {
      title: 'Zeo Dental Clinic | Dentiste à Tirana, Albanie',
      description:
        'Clinique dentaire premium à Tirana, Albanie. Implants dentaires, facettes et orthodontie. Économisez 50-70%. Devis gratuit en ligne.',
    },
    tr: {
      title: 'Zeo Dental Clinic | Tirana Diş Kliniği, Arnavutluk',
      description:
        "Tirana, Arnavutluk'ta premium diş kliniği. Diş implantları, estetik diş hekimliği ve ortodonti. %50-70 tasarruf edin. Ücretsiz danışmanlık alın.",
    },
    el: {
      title: 'Zeo Dental Clinic | Οδοντίατρος στα Τίρανα, Αλβανία',
      description:
        'Premium οδοντιατρική κλινική στα Τίρανα, Αλβανία. Οδοντικά εμφυτεύματα, αισθητική οδοντιατρική και ορθοδοντική. Εξοικονομήστε 50-70%. Δωρεάν εκτίμηση.',
    },
    es: {
      title: 'Zeo Dental Clinic | Clínica Dental en Tirana, Albania',
      description:
        'Clínica dental premium en Tirana, Albania. Implantes dentales, estética dental y ortodoncia. Ahorre 50-70% vs precios locales. Consulta gratuita online.',
    },
  },

  '/treatments': {
    sq: {
      title: 'Trajtimet Dentare | Zeo Dental Clinic Tiranë',
      description:
        'Të gjitha trajtimet dentare në Zeo Dental Clinic: implante, proteza, ortodonci, endodonci dhe estetikë dentare. Teknologji të avancuar në Tiranë.',
    },
    en: {
      title: 'Dental Treatments | Zeo Dental Clinic Albania',
      description:
        'Explore all dental treatments at Zeo Dental Clinic: implants, prosthetics, aligners, orthodontics, crowns & endodontics. Affordable prices in Albania.',
    },
    it: {
      title: 'Trattamenti Dentali | Zeo Dental Clinic Albania',
      description:
        'Scopri tutti i trattamenti dentali: impianti, protesi, allineatori, ortodonzia, corone ed endodonzia. Prezzi accessibili in Albania. Richiedi preventivo.',
    },
    de: {
      title: 'Zahnbehandlungen | Zeo Dental Clinic Albanien',
      description:
        'Alle Zahnbehandlungen bei Zeo Dental Clinic: Implantate, Prothetik, Aligner, Kieferorthopädie, Kronen & Endodontie. Günstige Preise in Albanien.',
    },
    fr: {
      title: 'Soins Dentaires | Zeo Dental Clinic Albanie',
      description:
        'Découvrez tous nos soins dentaires : implants, prothèses, aligneurs, orthodontie, couronnes et endodontie. Tarifs abordables en Albanie.',
    },
    tr: {
      title: 'Diş Tedavileri | Zeo Dental Clinic Arnavutluk',
      description:
        "Tüm diş tedavilerimizi keşfedin: implantlar, protezler, şeffaf plaklar, ortodonti, kronlar ve endodonti. Arnavutluk'ta uygun fiyatlar.",
    },
    el: {
      title: 'Οδοντιατρικές Θεραπείες | Zeo Dental Clinic Αλβανία',
      description:
        'Ανακαλύψτε τις θεραπείες μας: εμφυτεύματα, προσθετική, διαφανείς νάρθηκες, ορθοδοντική, στεφάνες και ενδοδοντία. Προσιτές τιμές στην Αλβανία.',
    },
    es: {
      title: 'Tratamientos Dentales | Zeo Dental Clinic Albania',
      description:
        'Descubra todos los tratamientos dentales: implantes, prótesis, alineadores, ortodoncia, coronas y endodoncia. Precios accesibles en Albania.',
    },
  },

  '/treatments/implantology': {
    sq: {
      title: 'Implante Dentare në Tiranë | Zeo Dental Clinic',
      description:
        'Implante dentare me cilësi premium në Tiranë. Teknologji Straumann & Nobel Biocare, kirurgji e udhëhequr nga kompjuteri. Konsultë falas dhe plan trajtimi.',
    },
    en: {
      title: 'Dental Implants in Albania | Zeo Dental Clinic',
      description:
        'Premium dental implants in Tirana, Albania. Straumann & Nobel Biocare implants, guided surgery. Save 50-70% vs UK prices. Free consultation & treatment plan.',
    },
    it: {
      title: 'Impianti Dentali in Albania | Zeo Dental Clinic',
      description:
        "Impianti dentali premium a Tirana, Albania. Straumann e Nobel Biocare, chirurgia guidata. Risparmia fino al 70% rispetto all'Italia. Preventivo gratuito.",
    },
    de: {
      title: 'Zahnimplantate in Albanien | Zeo Dental Clinic',
      description:
        'Premium-Zahnimplantate in Tirana, Albanien. Straumann & Nobel Biocare, geführte Chirurgie. Bis zu 70% günstiger. Kostenlose Beratung vereinbaren.',
    },
    fr: {
      title: 'Implants Dentaires en Albanie | Zeo Dental Clinic',
      description:
        "Implants dentaires premium à Tirana, Albanie. Straumann et Nobel Biocare, chirurgie guidée. Économisez jusqu'à 70%. Devis gratuit et plan de traitement.",
    },
    tr: {
      title: 'Diş İmplantları Arnavutluk | Zeo Dental Clinic',
      description:
        "Tirana, Arnavutluk'ta premium diş implantları. Straumann ve Nobel Biocare, bilgisayar destekli cerrahi. %50-70 tasarruf. Ücretsiz muayene ve tedavi planı.",
    },
    el: {
      title: 'Οδοντικά Εμφυτεύματα Αλβανία | Zeo Dental Clinic',
      description:
        'Premium οδοντικά εμφυτεύματα στα Τίρανα, Αλβανία. Straumann & Nobel Biocare, καθοδηγούμενη χειρουργική. Εξοικονομήστε 50-70%. Δωρεάν εκτίμηση.',
    },
    es: {
      title: 'Implantes Dentales en Albania | Zeo Dental Clinic',
      description:
        'Implantes dentales premium en Tirana, Albania. Straumann y Nobel Biocare, cirugía guiada. Ahorre hasta un 70%. Consulta gratuita y plan de tratamiento.',
    },
  },

  '/treatments/prosthetics': {
    sq: {
      title: 'Proteza Dentare në Tiranë | Zeo Dental Clinic',
      description:
        'Proteza fikse dhe të lëvizshme me cilësi premium në Tiranë. Ura dentare, proteza totale dhe parciale. Laborator i brendshëm dixhital. Konsultë falas.',
    },
    en: {
      title: 'Dental Prosthetics in Albania | Zeo Dental Clinic',
      description:
        'Premium dental prosthetics in Tirana, Albania. Fixed bridges, dentures & implant-supported restorations. In-house digital lab. Save 60%. Free quote today.',
    },
    it: {
      title: 'Protesi Dentali in Albania | Zeo Dental Clinic',
      description:
        'Protesi dentali premium a Tirana, Albania. Ponti fissi, protesi mobili e su impianti. Laboratorio digitale interno. Risparmia fino al 60%. Preventivo gratis.',
    },
    de: {
      title: 'Zahnprothesen in Albanien | Zeo Dental Clinic',
      description:
        'Premium-Zahnprothetik in Tirana, Albanien. Festsitzende Brücken, Prothesen und implantatgetragene Versorgungen. Hauseigenes Digitallabor. Bis zu 60% sparen.',
    },
    fr: {
      title: 'Prothèses Dentaires en Albanie | Zeo Dental Clinic',
      description:
        'Prothèses dentaires premium à Tirana, Albanie. Bridges, prothèses amovibles et sur implants. Laboratoire numérique intégré. Économisez 60%. Devis gratuit.',
    },
    tr: {
      title: 'Diş Protezleri Arnavutluk | Zeo Dental Clinic',
      description:
        "Tirana, Arnavutluk'ta premium diş protezleri. Sabit köprüler, hareketli ve implant üstü protezler. Dijital laboratuvar. %60 tasarruf. Ücretsiz teklif alın.",
    },
    el: {
      title: 'Οδοντικές Προσθετικές Αλβανία | Zeo Dental Clinic',
      description:
        'Premium οδοντικές προσθετικές στα Τίρανα, Αλβανία. Γέφυρες, οδοντοστοιχίες και αποκαταστάσεις επί εμφυτευμάτων. Ψηφιακό εργαστήριο. Εξοικονομήστε 60%.',
    },
    es: {
      title: 'Prótesis Dentales en Albania | Zeo Dental Clinic',
      description:
        'Prótesis dentales premium en Tirana, Albania. Puentes fijos, dentaduras y prótesis sobre implantes. Laboratorio digital propio. Ahorre un 60%. Presupuesto gratis.',
    },
  },

  '/treatments/aligners': {
    sq: {
      title: 'Aparatura Transparente | Zeo Dental Clinic Tiranë',
      description:
        'Aparatura transparente (aligners) për drejtimin e dhëmbëve në Tiranë. Alternativë komode ndaj aparaturës metalike. Plani i trajtimit dixhital 3D. Konsultë falas.',
    },
    en: {
      title: 'Clear Aligners in Albania | Zeo Dental Clinic',
      description:
        'Affordable clear aligners in Tirana, Albania. Invisible teeth straightening without metal braces. 3D digital treatment planning. Save 50%. Free consultation.',
    },
    it: {
      title: 'Allineatori Trasparenti Albania | Zeo Dental Clinic',
      description:
        "Allineatori trasparenti a Tirana, Albania. Denti dritti senza apparecchio metallico. Pianificazione digitale 3D. Risparmia il 50% rispetto all'Italia. Preventivo gratis.",
    },
    de: {
      title: 'Unsichtbare Zahnschienen Albanien | Zeo Dental Clinic',
      description:
        'Transparente Zahnschienen in Tirana, Albanien. Unsichtbare Zahnkorrektur ohne Metallspangen. 3D-Behandlungsplanung. Bis zu 50% sparen. Kostenlose Beratung.',
    },
    fr: {
      title: 'Aligneurs Transparents Albanie | Zeo Dental Clinic',
      description:
        'Aligneurs transparents à Tirana, Albanie. Alignement dentaire invisible sans bagues métalliques. Planification numérique 3D. Économisez 50%. Devis gratuit.',
    },
    tr: {
      title: 'Şeffaf Plaklar Arnavutluk | Zeo Dental Clinic',
      description:
        "Tirana, Arnavutluk'ta uygun fiyatlı şeffaf plak tedavisi. Metal braket olmadan görünmez diş düzeltme. 3D dijital planlama. %50 tasarruf. Ücretsiz konsültasyon.",
    },
    el: {
      title: 'Διαφανείς Νάρθηκες Αλβανία | Zeo Dental Clinic',
      description:
        'Διαφανείς νάρθηκες στα Τίρανα, Αλβανία. Αόρατη ευθυγράμμιση δοντιών χωρίς μεταλλικά σιδεράκια. 3D ψηφιακός σχεδιασμός. Εξοικονομήστε 50%. Δωρεάν εκτίμηση.',
    },
    es: {
      title: 'Alineadores Transparentes Albania | Zeo Dental Clinic',
      description:
        'Alineadores transparentes en Tirana, Albania. Alineación dental invisible sin brackets metálicos. Planificación digital 3D. Ahorre un 50%. Consulta gratuita.',
    },
  },

  '/treatments/orthodontics': {
    sq: {
      title: 'Ortodonci në Tiranë | Zeo Dental Clinic',
      description:
        'Trajtime ortodontike profesionale në Tiranë. Aparatura metalike, qeramike dhe transparente. Drejtim i dhëmbëve për të rritur dhe fëmijë. Konsultë falas.',
    },
    en: {
      title: 'Orthodontics in Albania | Zeo Dental Clinic',
      description:
        'Professional orthodontic treatment in Tirana, Albania. Metal, ceramic & clear braces for adults and children. Affordable prices. Book your free consultation.',
    },
    it: {
      title: 'Ortodonzia in Albania | Zeo Dental Clinic Tirana',
      description:
        'Trattamenti ortodontici professionali a Tirana, Albania. Apparecchi metallici, ceramici e trasparenti. Risparmia fino al 60%. Prenota il tuo preventivo gratis.',
    },
    de: {
      title: 'Kieferorthopädie in Albanien | Zeo Dental Clinic',
      description:
        'Professionelle kieferorthopädische Behandlung in Tirana, Albanien. Feste Zahnspangen, Keramik- und Aligner-Lösungen. Bis zu 60% günstiger. Jetzt beraten lassen.',
    },
    fr: {
      title: 'Orthodontie en Albanie | Zeo Dental Clinic Tirana',
      description:
        "Traitement orthodontique professionnel à Tirana, Albanie. Appareils métalliques, céramiques et transparents. Économisez jusqu'à 60%. Consultation gratuite.",
    },
    tr: {
      title: 'Ortodonti Arnavutluk | Zeo Dental Clinic Tirana',
      description:
        "Tirana, Arnavutluk'ta profesyonel ortodonti tedavisi. Metal, seramik ve şeffaf braketler. Yetişkinler ve çocuklar için. %60 tasarruf. Ücretsiz muayene.",
    },
    el: {
      title: 'Ορθοδοντική στην Αλβανία | Zeo Dental Clinic',
      description:
        'Επαγγελματική ορθοδοντική θεραπεία στα Τίρανα, Αλβανία. Μεταλλικά, κεραμικά και διαφανή σιδεράκια. Προσιτές τιμές. Κλείστε δωρεάν ραντεβού εκτίμησης.',
    },
    es: {
      title: 'Ortodoncia en Albania | Zeo Dental Clinic Tirana',
      description:
        'Tratamiento de ortodoncia profesional en Tirana, Albania. Brackets metálicos, cerámicos y transparentes. Ahorre hasta un 60%. Consulta gratuita online.',
    },
  },

  '/treatments/crowns': {
    sq: {
      title: 'Kurora Dentare në Tiranë | Zeo Dental Clinic',
      description:
        'Kurora dentare me cilësi premium në Tiranë. Kurora në zirkon, porcelan dhe e-max. Laborator dixhital i brendshëm, rezultate natyrore. Konsultë falas.',
    },
    en: {
      title: 'Dental Crowns in Albania | Zeo Dental Clinic',
      description:
        'Premium dental crowns in Tirana, Albania. Zirconia, porcelain & E-max crowns with in-house digital lab. Natural-looking results. Save 60%. Free consultation.',
    },
    it: {
      title: 'Corone Dentali in Albania | Zeo Dental Clinic',
      description:
        'Corone dentali premium a Tirana, Albania. Zirconio, porcellana ed E-max con laboratorio digitale interno. Risultati naturali. Risparmia il 60%. Preventivo gratis.',
    },
    de: {
      title: 'Zahnkronen in Albanien | Zeo Dental Clinic',
      description:
        'Premium-Zahnkronen in Tirana, Albanien. Zirkonium-, Porzellan- und E-max-Kronen im hauseigenen Digitallabor. Natürliche Ergebnisse. Bis zu 60% günstiger.',
    },
    fr: {
      title: 'Couronnes Dentaires en Albanie | Zeo Dental Clinic',
      description:
        'Couronnes dentaires premium à Tirana, Albanie. Zircone, porcelaine et E-max, laboratoire numérique intégré. Résultats naturels. Économisez 60%. Devis gratuit.',
    },
    tr: {
      title: 'Diş Kronları Arnavutluk | Zeo Dental Clinic',
      description:
        "Tirana, Arnavutluk'ta premium diş kronları. Zirkonyum, porselen ve E-max kronlar. Dijital laboratuvar, doğal sonuçlar. %60 tasarruf. Ücretsiz konsültasyon.",
    },
    el: {
      title: 'Οδοντικές Στεφάνες Αλβανία | Zeo Dental Clinic',
      description:
        'Premium οδοντικές στεφάνες στα Τίρανα, Αλβανία. Ζιρκόνιο, πορσελάνη και E-max με ψηφιακό εργαστήριο. Φυσικά αποτελέσματα. Εξοικονομήστε 60%. Δωρεάν εκτίμηση.',
    },
    es: {
      title: 'Coronas Dentales en Albania | Zeo Dental Clinic',
      description:
        'Coronas dentales premium en Tirana, Albania. Zirconio, porcelana y E-max con laboratorio digital propio. Resultados naturales. Ahorre un 60%. Presupuesto gratis.',
    },
  },

  '/treatments/endodontics': {
    sq: {
      title: 'Endodonci dhe Estetikë Dentare | Zeo Dental Clinic',
      description:
        'Trajtime endodontike dhe estetikë dentare në Tiranë. Trajtim i kanaleve, zbardhim dhe faseta dentare. Teknologji mikroskopike. Konsultë falas në klinikë.',
    },
    en: {
      title: 'Endodontics & Aesthetic Dentistry | Zeo Dental',
      description:
        'Expert root canal treatment and aesthetic dentistry in Tirana, Albania. Microscope-assisted endodontics, veneers & whitening. Save 50-70%. Free consultation.',
    },
    it: {
      title: 'Endodonzia e Estetica Dentale | Zeo Dental Clinic',
      description:
        'Endodonzia e odontoiatria estetica a Tirana, Albania. Devitalizzazioni al microscopio, faccette e sbiancamento. Risparmia fino al 70%. Preventivo gratuito.',
    },
    de: {
      title: 'Endodontie & Ästhetische Zahnheilkunde | Zeo Dental',
      description:
        'Wurzelbehandlung und ästhetische Zahnmedizin in Tirana, Albanien. Mikroskop-Endodontie, Veneers & Bleaching. Bis zu 70% sparen. Kostenlose Beratung buchen.',
    },
    fr: {
      title: 'Endodontie & Dentisterie Esthétique | Zeo Dental',
      description:
        'Traitement de canal et dentisterie esthétique à Tirana, Albanie. Endodontie au microscope, facettes et blanchiment. Économisez 50-70%. Devis gratuit.',
    },
    tr: {
      title: 'Endodonti ve Estetik Diş Hekimliği | Zeo Dental',
      description:
        "Tirana, Arnavutluk'ta kanal tedavisi ve estetik diş hekimliği. Mikroskop destekli endodonti, veneer ve beyazlatma. %50-70 tasarruf. Ücretsiz değerlendirme.",
    },
    el: {
      title: 'Ενδοδοντία & Αισθητική Οδοντιατρική | Zeo Dental',
      description:
        'Θεραπεία ριζικών σωλήνων και αισθητική οδοντιατρική στα Τίρανα, Αλβανία. Ενδοδοντία με μικροσκόπιο, όψεις και λεύκανση. Εξοικονομήστε 50-70%. Δωρεάν εκτίμηση.',
    },
    es: {
      title: 'Endodoncia y Estética Dental | Zeo Dental Clinic',
      description:
        'Endodoncia y estética dental en Tirana, Albania. Tratamiento de conducto con microscopio, carillas y blanqueamiento. Ahorre 50-70%. Consulta gratuita.',
    },
  },

  '/philosophy': {
    sq: {
      title: 'Filozofia Jonë | Zeo Dental Clinic Tiranë',
      description:
        'Zbuloni filozofinë e Zeo Dental Clinic: kujdes i përqendruar te pacienti, teknologji e avancuar dhe standarde ndërkombëtare në Tiranë, Shqipëri.',
    },
    en: {
      title: 'Our Philosophy | Zeo Dental Clinic Tirana',
      description:
        'Discover the Zeo Dental philosophy: patient-centered care, advanced technology, and international standards. Premium dental clinic in Tirana, Albania.',
    },
    it: {
      title: 'La Nostra Filosofia | Zeo Dental Clinic Tirana',
      description:
        'Scopri la filosofia Zeo Dental: cura centrata sul paziente, tecnologia avanzata e standard internazionali. Clinica dentale premium a Tirana, Albania.',
    },
    de: {
      title: 'Unsere Philosophie | Zeo Dental Clinic Tirana',
      description:
        'Entdecken Sie die Zeo Dental Philosophie: patientenorientierte Versorgung, modernste Technologie und internationale Standards in Tirana, Albanien.',
    },
    fr: {
      title: 'Notre Philosophie | Zeo Dental Clinic Tirana',
      description:
        'Découvrez la philosophie Zeo Dental : soins centrés sur le patient, technologie avancée et standards internationaux. Clinique dentaire premium à Tirana.',
    },
    tr: {
      title: 'Felsefemiz | Zeo Dental Clinic Tirana',
      description:
        "Zeo Dental felsefesini keşfedin: hasta odaklı bakım, ileri teknoloji ve uluslararası standartlar. Tirana, Arnavutluk'ta premium diş kliniği.",
    },
    el: {
      title: 'Η Φιλοσοφία μας | Zeo Dental Clinic Τίρανα',
      description:
        'Ανακαλύψτε τη φιλοσοφία Zeo Dental: φροντίδα με επίκεντρο τον ασθενή, προηγμένη τεχνολογία και διεθνή πρότυπα. Premium κλινική στα Τίρανα, Αλβανία.',
    },
    es: {
      title: 'Nuestra Filosofía | Zeo Dental Clinic Tirana',
      description:
        'Descubra la filosofía Zeo Dental: atención centrada en el paciente, tecnología avanzada y estándares internacionales. Clínica premium en Tirana, Albania.',
    },
  },

  '/team': {
    sq: {
      title: 'Ekipi Ynë i Mjekëve | Zeo Dental Clinic Tiranë',
      description:
        'Njihuni me ekipin e dentistëve dhe specialistëve të Zeo Dental Clinic. Doktorë me përvojë ndërkombëtare dhe specializime të avancuara në Tiranë.',
    },
    en: {
      title: 'Our Dental Team | Zeo Dental Clinic Albania',
      description:
        'Meet the experienced dentists and specialists at Zeo Dental Clinic. Internationally trained doctors with advanced specializations in Tirana, Albania.',
    },
    it: {
      title: 'Il Nostro Team di Dentisti | Zeo Dental Clinic',
      description:
        'Conosci i dentisti e specialisti di Zeo Dental Clinic a Tirana. Dottori con formazione internazionale e specializzazioni avanzate. Prenota la tua visita.',
    },
    de: {
      title: 'Unser Ärzteteam | Zeo Dental Clinic Albanien',
      description:
        'Lernen Sie das erfahrene Zahnärzteteam der Zeo Dental Clinic kennen. International ausgebildete Ärzte mit Spezialisierungen in Tirana, Albanien.',
    },
    fr: {
      title: 'Notre Équipe de Dentistes | Zeo Dental Clinic',
      description:
        "Rencontrez les dentistes et spécialistes de Zeo Dental Clinic à Tirana. Médecins formés à l'international avec des spécialisations avancées.",
    },
    tr: {
      title: 'Doktor Ekibimiz | Zeo Dental Clinic Arnavutluk',
      description:
        "Zeo Dental Clinic'in deneyimli diş hekimleri ve uzmanlarıyla tanışın. Uluslararası eğitimli doktorlar, Tirana, Arnavutluk. Randevu alın.",
    },
    el: {
      title: 'Η Ομάδα μας | Zeo Dental Clinic Αλβανία',
      description:
        'Γνωρίστε τους έμπειρους οδοντιάτρους και ειδικούς του Zeo Dental Clinic. Διεθνώς εκπαιδευμένοι γιατροί στα Τίρανα, Αλβανία. Κλείστε ραντεβού.',
    },
    es: {
      title: 'Nuestro Equipo Dental | Zeo Dental Clinic Albania',
      description:
        'Conozca a los dentistas y especialistas de Zeo Dental Clinic. Doctores con formación internacional en Tirana, Albania. Reserve su cita hoy.',
    },
  },

  '/cases': {
    sq: {
      title: 'Raste Klinike Para & Pas | Zeo Dental Clinic',
      description:
        'Shikoni rastet klinike para dhe pas trajtimit në Zeo Dental Clinic. Rezultate reale të implanteve, kurorëve, fasetave dhe ortodoncisë në Tiranë.',
    },
    en: {
      title: 'Before & After Cases | Zeo Dental Clinic Albania',
      description:
        'View real before and after dental cases at Zeo Dental Clinic. Implant, crown, veneer & orthodontic transformations. See our results in Tirana, Albania.',
    },
    it: {
      title: 'Casi Clinici Prima e Dopo | Zeo Dental Clinic',
      description:
        'Guarda i casi clinici prima e dopo di Zeo Dental Clinic. Trasformazioni con impianti, corone, faccette e ortodonzia. Risultati reali a Tirana, Albania.',
    },
    de: {
      title: 'Vorher-Nachher Fälle | Zeo Dental Clinic Albanien',
      description:
        'Echte Vorher-Nachher-Ergebnisse der Zeo Dental Clinic. Implantate, Kronen, Veneers und Kieferorthopädie. Überzeugen Sie sich selbst. Tirana, Albanien.',
    },
    fr: {
      title: 'Cas Cliniques Avant & Après | Zeo Dental Clinic',
      description:
        'Découvrez nos cas cliniques avant et après. Transformations avec implants, couronnes, facettes et orthodontie. Résultats réels à Tirana, Albanie.',
    },
    tr: {
      title: 'Önce ve Sonra Vakaları | Zeo Dental Clinic',
      description:
        "Zeo Dental Clinic'in gerçek önce-sonra vakalarını görün. İmplant, kron, veneer ve ortodonti dönüşümleri. Tirana, Arnavutluk'ta sonuçlarımızı keşfedin.",
    },
    el: {
      title: 'Κλινικά Περιστατικά Πριν & Μετά | Zeo Dental',
      description:
        'Δείτε πραγματικά περιστατικά πριν και μετά στο Zeo Dental Clinic. Εμφυτεύματα, στεφάνες, όψεις και ορθοδοντική. Αποτελέσματα στα Τίρανα, Αλβανία.',
    },
    es: {
      title: 'Casos Clínicos Antes y Después | Zeo Dental',
      description:
        'Vea casos reales antes y después en Zeo Dental Clinic. Transformaciones con implantes, coronas, carillas y ortodoncia. Resultados en Tirana, Albania.',
    },
  },

  '/book': {
    sq: {
      title: 'Kërkoni Preventiv Falas | Zeo Dental Clinic Tiranë',
      description:
        'Kërkoni një preventiv falas nga Zeo Dental Clinic në Tiranë. Plotësoni formularin dhe merrni planin e trajtimit me çmime transparente brenda 24 orëve.',
    },
    en: {
      title: 'Request a Free Quote | Zeo Dental Clinic Albania',
      description:
        'Get your free dental treatment quote from Zeo Dental Clinic in Tirana, Albania. Receive a personalized treatment plan with transparent pricing within 24 hours.',
    },
    it: {
      title: 'Richiedi Preventivo Gratuito | Zeo Dental Clinic',
      description:
        'Richiedi un preventivo gratuito da Zeo Dental Clinic a Tirana. Piano di trattamento personalizzato con prezzi trasparenti entro 24 ore. Risparmia fino al 70%.',
    },
    de: {
      title: 'Kostenloses Angebot anfordern | Zeo Dental Clinic',
      description:
        'Fordern Sie Ihr kostenloses Angebot von der Zeo Dental Clinic in Tirana an. Individueller Behandlungsplan mit transparenten Preisen innerhalb von 24 Stunden.',
    },
    fr: {
      title: 'Devis Gratuit en Ligne | Zeo Dental Clinic Albanie',
      description:
        "Demandez votre devis gratuit chez Zeo Dental Clinic à Tirana. Plan de traitement personnalisé avec prix transparents sous 24 heures. Économisez jusqu'à 70%.",
    },
    tr: {
      title: 'Ücretsiz Teklif Alın | Zeo Dental Clinic Arnavutluk',
      description:
        "Zeo Dental Clinic'ten ücretsiz diş tedavi teklifi alın. Tirana'da kişiselleştirilmiş tedavi planı, şeffaf fiyatlar, 24 saat içinde yanıt. %50-70 tasarruf.",
    },
    el: {
      title: 'Δωρεάν Προσφορά | Zeo Dental Clinic Αλβανία',
      description:
        'Ζητήστε δωρεάν εκτίμηση από το Zeo Dental Clinic στα Τίρανα. Εξατομικευμένο σχέδιο θεραπείας με διαφανείς τιμές εντός 24 ωρών. Εξοικονομήστε 50-70%.',
    },
    es: {
      title: 'Presupuesto Gratuito | Zeo Dental Clinic Albania',
      description:
        'Solicite su presupuesto dental gratuito en Zeo Dental Clinic, Tirana. Plan de tratamiento personalizado con precios transparentes en 24 horas. Ahorre hasta un 70%.',
    },
  },

  '/privacy-policy': {
    sq: {
      title: 'Politika e Privatësisë | Zeo Dental Clinic',
      description:
        'Lexoni politikën e privatësisë së Zeo Dental Clinic. Informacion mbi mbrojtjen e të dhënave personale dhe përpunimin e tyre sipas legjislacionit shqiptar dhe GDPR.',
    },
    en: {
      title: 'Privacy Policy | Zeo Dental Clinic',
      description:
        "Read Zeo Dental Clinic's privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and Albanian data protection laws.",
    },
    it: {
      title: 'Informativa sulla Privacy | Zeo Dental Clinic',
      description:
        "Leggi l'informativa sulla privacy di Zeo Dental Clinic. Scopri come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali in conformità al GDPR.",
    },
    de: {
      title: 'Datenschutzerklärung | Zeo Dental Clinic',
      description:
        'Lesen Sie die Datenschutzerklärung der Zeo Dental Clinic. Erfahren Sie, wie wir Ihre Daten DSGVO-konform erheben, verwenden und schützen.',
    },
    fr: {
      title: 'Politique de Confidentialité | Zeo Dental Clinic',
      description:
        'Consultez la politique de confidentialité de Zeo Dental Clinic. Découvrez comment nous collectons, utilisons et protégeons vos données conformément au RGPD.',
    },
    tr: {
      title: 'Gizlilik Politikası | Zeo Dental Clinic',
      description:
        'Zeo Dental Clinic gizlilik politikasını okuyun. Kişisel verilerinizin KVKK ve GDPR uyumlu olarak nasıl toplandığını ve korunduğunu öğrenin.',
    },
    el: {
      title: 'Πολιτική Απορρήτου | Zeo Dental Clinic',
      description:
        'Διαβάστε την πολιτική απορρήτου του Zeo Dental Clinic. Μάθετε πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα δεδομένα σας σύμφωνα με τον GDPR.',
    },
    es: {
      title: 'Política de Privacidad | Zeo Dental Clinic',
      description:
        'Lea la política de privacidad de Zeo Dental Clinic. Conozca cómo recopilamos, usamos y protegemos sus datos personales conforme al RGPD.',
    },
  },

  '/terms-of-service': {
    sq: {
      title: 'Kushtet e Shërbimit | Zeo Dental Clinic',
      description:
        'Lexoni kushtet e shërbimit të Zeo Dental Clinic. Informacion mbi kushtet e përdorimit të faqes, rezervimeve dhe shërbimeve dentare në Tiranë, Shqipëri.',
    },
    en: {
      title: 'Terms of Service | Zeo Dental Clinic',
      description:
        'Read the terms of service for Zeo Dental Clinic. Information on website usage, booking conditions, and dental service terms in Tirana, Albania.',
    },
    it: {
      title: 'Termini di Servizio | Zeo Dental Clinic',
      description:
        "Leggi i termini di servizio di Zeo Dental Clinic. Informazioni sulle condizioni d'uso del sito, prenotazioni e servizi dentali a Tirana, Albania.",
    },
    de: {
      title: 'Nutzungsbedingungen | Zeo Dental Clinic',
      description:
        'Lesen Sie die Nutzungsbedingungen der Zeo Dental Clinic. Informationen zu Website-Nutzung, Buchungsbedingungen und zahnärztlichen Leistungen in Tirana.',
    },
    fr: {
      title: "Conditions d'Utilisation | Zeo Dental Clinic",
      description:
        "Consultez les conditions d'utilisation de Zeo Dental Clinic. Informations sur l'utilisation du site, les réservations et les services dentaires à Tirana.",
    },
    tr: {
      title: 'Hizmet Şartları | Zeo Dental Clinic',
      description:
        'Zeo Dental Clinic hizmet şartlarını okuyun. Web sitesi kullanımı, randevu koşulları ve diş hizmetleri hakkında bilgi. Tirana, Arnavutluk.',
    },
    el: {
      title: 'Όροι Χρήσης | Zeo Dental Clinic',
      description:
        'Διαβάστε τους όρους χρήσης του Zeo Dental Clinic. Πληροφορίες για τη χρήση του ιστοτόπου, τους όρους κρατήσεων και τις οδοντιατρικές υπηρεσίες στα Τίρανα.',
    },
    es: {
      title: 'Términos de Servicio | Zeo Dental Clinic',
      description:
        'Lea los términos de servicio de Zeo Dental Clinic. Información sobre el uso del sitio, condiciones de reserva y servicios dentales en Tirana, Albania.',
    },
  },

  '/packages': {
    sq: {
      title: 'Paketa Turizmi Dentar | Zeo Dental Clinic',
      description:
        'Paketa te plota kujdesi dentar per pacientet nderkombetar. Transfer aeroporti, akomodim dhe koordinator personal. Kerkoni oferte falas.',
    },
    en: {
      title: 'Dental Tourism Packages | Zeo Dental Clinic Albania',
      description:
        'All-inclusive dental tourism packages in Tirana. Airport transfer, hotel, personal coordinator. Request your free personalized quote today.',
    },
    it: {
      title: 'Pacchetti Turismo Dentale | Zeo Dental Clinic Albania',
      description:
        'Pacchetti turismo dentale tutto incluso a Tirana. Transfer aeroportuale, hotel, coordinatore personale. Richiedi il tuo preventivo gratuito.',
    },
    de: {
      title: 'Zahntourismus-Pakete | Zeo Dental Clinic Albanien',
      description:
        'All-inclusive Zahntourismus-Pakete in Tirana. Flughafentransfer, Hotel, persoenlicher Koordinator. Fordern Sie Ihr kostenloses Angebot an.',
    },
    fr: {
      title: 'Forfaits Tourisme Dentaire | Zeo Dental Clinic Albanie',
      description:
        'Forfaits tourisme dentaire tout compris a Tirana. Transfert aeroport, hotel, coordinateur personnel. Demandez votre devis gratuit.',
    },
    tr: {
      title: 'Dis Turizmi Paketleri | Zeo Dental Clinic Arnavutluk',
      description:
        "Tirana'da her sey dahil dis turizmi paketleri. Havalimani transferi, otel, kisisel koordinator. Ucretsiz teklifinizi isteyin.",
    },
    el: {
      title: 'Paketa Odontiatrikou Tourismou | Zeo Dental Clinic Albania',
      description:
        'Olokleiromena paketa odontiatrikou tourismou sta Tirana. Metafora aerodromiou, xenodocheio, prosopikos syntonistis. Zitiste dorean prosfora.',
    },
    es: {
      title: 'Paquetes Turismo Dental | Zeo Dental Clinic Albania',
      description:
        'Paquetes de turismo dental todo incluido en Tirana. Transfer aeropuerto, hotel, coordinador personal. Solicita tu presupuesto gratuito.',
    },
  },
};

export function getSeoMeta(barePath: string, lang: Language): SeoMeta {
  const routeMeta = SEO_META[barePath];
  if (routeMeta?.[lang]) return routeMeta[lang];
  if (routeMeta?.en) return routeMeta.en;
  return {
    title: 'Zeo Dental Clinic | Premium Dental Care in Tirana, Albania',
    description: 'Premium cosmetic dentistry, dental implants, orthodontics in Tirana, Albania.',
  };
}
