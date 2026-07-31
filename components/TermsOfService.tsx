import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocalePath } from '../hooks/useLocalePath';

export const TermsOfService: React.FC = () => {
  const lp = useLocalePath();
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-studio-black text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <a
            href={lp('/')}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Kthehu në Kreu</span>
          </a>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Kushtet e Shërbimit</h1>
          <p className="text-white/60 mt-2">Përditësuar më: Janar 2026</p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              1. Pranimi i Kushteve
            </h2>
            <p className="text-studio-gray leading-relaxed">
              Duke përdorur shërbimet e Klinikës Dentare Zeo (&quot;Klinika&quot;), ju pranoni këto kushte
              shërbimi. Nëse nuk jeni dakord me këto kushte, ju lutemi mos përdorni shërbimet tona.
              Këto kushte rregullohen nga ligjet e Republikës së Shqipërisë.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              2. Shërbimet Dentare
            </h2>
            <p className="text-studio-gray leading-relaxed mb-4">
              Klinika Dentare Zeo ofron shërbime dentare profesionale duke përfshirë, por jo të
              kufizuara në:
            </p>
            <ul className="list-disc pl-6 text-studio-gray space-y-2">
              <li>Implantologji dhe kirurgji orale</li>
              <li>Protetikë dentare</li>
              <li>Ortodonci dhe aparate invisible</li>
              <li>Kurorë dhe veshje dentare</li>
              <li>Estetikë dentare dhe zbardhim</li>
              <li>Trajtime të përgjithshme dentare</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              3. Rezervimi i Takimeve
            </h2>
            <p className="text-studio-gray leading-relaxed mb-4">
              3.1. Rezervimet mund të bëhen përmes faqes sonë të internetit, telefonit, ose
              WhatsApp-it.
            </p>
            <p className="text-studio-gray leading-relaxed mb-4">
              3.2. Konfirmimi i rezervimit do të dërgohet përmes telefonit ose email-it.
            </p>
            <p className="text-studio-gray leading-relaxed mb-4">
              3.3. Ju lutemi na njoftoni të paktën 24 orë përpara nëse dëshironi të anuloni ose
              ndryshoni takimin tuaj.
            </p>
            <p className="text-studio-gray leading-relaxed">
              3.4. Klinika rezervon të drejtën të anulojë ose riprogramojë takimet në raste
              emergjente ose të paparashikuara.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              4. Pagesat dhe Faturat
            </h2>
            <p className="text-studio-gray leading-relaxed mb-4">
              4.1. Çmimet për shërbimet tona komunikohen përpara fillimit të trajtimit.
            </p>
            <p className="text-studio-gray leading-relaxed mb-4">
              4.2. Pagesa mund të kryhet me para në dorë, kartë krediti/debiti, ose transfertë
              bankare.
            </p>
            <p className="text-studio-gray leading-relaxed mb-4">
              4.3. Për trajtime të gjata, mund të ofrojmë plane pagese me këste. Kushtet e planit do
              të bien dakord me shkrim.
            </p>
            <p className="text-studio-gray leading-relaxed">
              4.4. Të gjitha faturat lëshohen në përputhje me legjislacionin fiskal shqiptar.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              5. Pëlqimi i Informuar
            </h2>
            <p className="text-studio-gray leading-relaxed mb-4">
              5.1. Përpara çdo trajtimi, do t&apos;ju shpjegohen procedurat, risqet, dhe alternativat e
              mundshme.
            </p>
            <p className="text-studio-gray leading-relaxed mb-4">
              5.2. Ju do të nënshkruani një formular pëlqimi të informuar për trajtime të caktuara.
            </p>
            <p className="text-studio-gray leading-relaxed">
              5.3. Keni të drejtë të bëni pyetje dhe të merrni përgjigje të plota përpara se të
              jepni pëlqimin.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              6. Detyrimet e Pacientit
            </h2>
            <p className="text-studio-gray leading-relaxed mb-4">Si pacient, ju pranoni:</p>
            <ul className="list-disc pl-6 text-studio-gray space-y-2">
              <li>
                Të jepni informacion të saktë dhe të plotë rreth historisë suaj mjekësore dhe
                dentare
              </li>
              <li>Të na njoftoni për çdo ndryshim në gjendjen tuaj shëndetësore</li>
              <li>Të ndiqni udhëzimet pas-trajtimit të dhëna nga stafi ynë</li>
              <li>Të paraqiteni në kohë për takimet e rezervuara</li>
              <li>Të paguani për shërbimet e marra sipas kushteve të rëna dakord</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              7. Garancitë dhe Përgjegjësia
            </h2>
            <p className="text-studio-gray leading-relaxed mb-4">
              7.1. Ne ofrojmë garanci për punime të caktuara protetike dhe implantet. Kushtet e
              garancisë komunikohen me shkrim.
            </p>
            <p className="text-studio-gray leading-relaxed mb-4">
              7.2. Garancia vlen vetëm nëse pacienti ndjek udhëzimet e kujdesit dhe paraqitet për
              kontrollet periodike.
            </p>
            <p className="text-studio-gray leading-relaxed">
              7.3. Klinika nuk mban përgjegjësi për komplikacione që rezultojnë nga mosndjekja e
              udhëzimeve ose informacioni i pasaktë i dhënë nga pacienti.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              8. Ankesa dhe Zgjidhja e Mosmarrëveshjeve
            </h2>
            <p className="text-studio-gray leading-relaxed mb-4">
              8.1. Nëse keni ndonjë ankesë, ju lutemi na kontaktoni drejtpërdrejt për ta zgjidhur
              çështjen.
            </p>
            <p className="text-studio-gray leading-relaxed mb-4">
              8.2. Ankesat do të trajtohen brenda 15 ditëve pune.
            </p>
            <p className="text-studio-gray leading-relaxed">
              8.3. Mosmarrëveshjet që nuk zgjidhen me mirëkuptim do t&apos;i nënshtrohen juridiksionit të
              gjykatave të Tiranës, Shqipëri.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              9. Përdorimi i Faqes së Internetit
            </h2>
            <p className="text-studio-gray leading-relaxed mb-4">
              9.1. Përmbajtja e faqes sonë të internetit është vetëm për qëllime informative dhe nuk
              zëvendëson konsultimin profesional dentar.
            </p>
            <p className="text-studio-gray leading-relaxed mb-4">
              9.2. Ne rezervojmë të drejtën të modifikojmë ose heqim përmbajtjen e faqes pa njoftim
              paraprak.
            </p>
            <p className="text-studio-gray leading-relaxed">
              9.3. Të gjitha të drejtat e pronësisë intelektuale mbi përmbajtjen e faqes i përkasin
              Klinikës Dentare Zeo.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              10. Ndryshimi i Kushteve
            </h2>
            <p className="text-studio-gray leading-relaxed">
              Klinika rezervon të drejtën të ndryshojë këto kushte në çdo kohë. Ndryshimet do të
              publikohen në faqen tonë të internetit. Vazhdimi i përdorimit të shërbimeve tona pas
              publikimit të ndryshimeve përbën pranimin e kushteve të reja.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">
              11. Ligji i Aplikueshëm
            </h2>
            <p className="text-studio-gray leading-relaxed">
              Këto kushte rregullohen dhe interpretohen në përputhje me ligjet e Republikës së
              Shqipërisë, duke përfshirë Kodin Civil, Ligjin për Mbrojtjen e Konsumatorit (Nr.
              9902/2008), dhe legjislacionin shëndetësor në fuqi.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-studio-black mb-4">12. Kontakti</h2>
            <p className="text-studio-gray leading-relaxed">
              Për pyetje rreth këtyre kushteve, na kontaktoni:
              <br />
              <br />
              Klinika Dentare Zeo
              <br />
              Rruga Hamdi Sina, Tiranë, Shqipëri
              <br />
              Email: zeodentalclinic@gmail.com
              <br />
              Tel: +355 68 400 4840
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-studio-black text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 text-center">
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} Klinika Dentare Zeo. Të gjitha të drejtat e
            rezervuara.
          </p>
        </div>
      </footer>
    </div>
  );
};
