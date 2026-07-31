# UDHEZUES PERDORIMI - ManagerCRM (Zeo Dental Clinic)

---

## 1. HYRJA NE SISTEM

1. Hapni shfletuesin (Chrome, Firefox, etj.)
2. Shkruani adresën: `http://localhost` ose `http://192.168.x.x` (IP e kompjuterit të klinikës)
3. Vendosni **Emrin e përdoruesit** dhe **Fjalëkalimin**
4. Nga lista e gjuhëve zgjidhni **Albanian**
5. Klikoni **Hyr**

---

## 2. REGJISTRIMI I NJE PACIENTI TE RI

### Hapi 1: Hapni formularin e pacientit

- Klikoni menunë **Pacientët** → **Pacient i Ri**

### Hapi 2: Plotësoni të dhënat personale

Plotësoni fushat e mëposhtme:

| Fusha          | Shpjegimi                   |
| -------------- | --------------------------- |
| **Emër**       | Emri i pacientit            |
| **Mbiemër**    | Mbiemri i pacientit         |
| **Datëlindje** | Data e lindjes (DD/MM/YYYY) |
| **Gjinia**     | Mashkull ose Femër          |
| **Celular**    | Numri i telefonit celular   |
| **E-mail**     | Adresa e email-it (nëse ka) |
| **Adresa**     | Adresa e banimit            |
| **Qyteti**     | Qyteti                      |
| **Profesioni** | Profesioni i pacientit      |

> **Shënim:** Fushat e siguracionit (Insurance) janë opsionale dhe nuk nevojiten.

### Hapi 3: Ruani pacientin

- Klikoni butonin **Krijo Pacientin e Ri** ose **Ruaj**

---

## 3. KARTELA DENTARE (Anamneza Mjekësore)

Kur pacienti vjen për herë të parë, plotësoni Kartelën Dentare:

### Hapi 1: Gjeni pacientin

- **Pacientët** → Kërkoni emrin e pacientit → Klikoni mbi emrin

### Hapi 2: Krijoni një vizitë të re

- Klikoni **Krijo Vizitë të Re** (New Encounter)
- Zgjidhni **Kategorinë** (p.sh. Ekzaminim Dentar)
- Zgjidhni **Doktorin**
- Klikoni **Ruaj**

### Hapi 3: Hapni Kartelën Dentare

- Brenda vizitës, klikoni **Formularët Klinikë** → **Kartela Dentare**

### Hapi 4: Plotësoni Anamnezën Mjekësore

Për secilën pyetje zgjidhni **Po** ose **Jo**:

- Sëmundje kardiovaskulare
- Sëmundje të gjakut
- Sëmundje pulmonare (astma etj)
- Sëmundje renale
- Sëmundje të heparit (hepatit etj)
- Sëmundje tumorale
- Sëmundje të tiroides
- Sëmundje neurologjike (depresion, ankth, epilepsi)
- Sëmundje të traktit gastrointestinal
- Sëmundje infektive (SST, HIV/AIDS etj)
- Diabet
- Tuberkuloz
- Probleme me sinuset
- Artrit / Osteoporozë
- Varësi ndaj drogërave
- Duhan
- Alkol
- Shtatzënë
- Alergji (medikamente, anestezia, latex etj)

### Hapi 5: Plotësoni Historikun

- **A i jeni nënshtruar ndonjë ndërhyrjeje kirurgjikale?** → Po/Jo + detaje
- **A merrni ndonjë mjekim?** → Po/Jo + lista e medikamenteve
- **Detaje mbi alergjitë** → Nëse ka
- **Shënime të tjera** → Informacion shtesë

### Hapi 6: Pëlqimi

- Vendosni shenjë te **Pacienti ka lexuar dhe pranuar formularin e pëlqimit**
- Nëse pacienti është i mitur: shkruani emrin e prindit/kujdestarit
- **Autorizim për fotografi** → Vendosni shenjë nëse pacienti pranon

### Hapi 7: Ruani

- Klikoni **Ruaj**

---

## 4. REGJISTRIMI I NJE VIZITE (Çdo herë që vjen pacienti)

### Hapi 1: Gjeni pacientin

- **Pacientët** → Kërkoni emrin → Klikoni mbi emrin

### Hapi 2: Krijoni vizitën

- Klikoni **Krijo Vizitë të Re**
- Plotësoni:
  - **Data e Vizitës** → Data e sotme (plotësohet automatikisht)
  - **Kategoria** → Zgjidhni llojin e vizitës:
    - Pastrim Dentar
    - Ekzaminim Dentar
    - Mbushje Dentare
    - Trajtim i Kanalit
    - Nxjerrje Dhëmbi
    - Kurorë Dentare
    - Implant Dentar
    - Zbardhim Dhëmbësh
    - Urgjencë Dentare
    - Protezë Dentare
    - etj.
  - **Doktori** → Zgjidhni doktorin
  - **Arsyeja e Vizitës** → Shkruani shkurtimisht arsyen (p.sh. "Dhimbje dhëmbi 36", "Kontroll periodik")
- Klikoni **Ruaj**

---

## 5. SHTIMI I SHERBIMEVE (Fleta e Tarifave / Fee Sheet)

Kjo është pjesa më e rëndësishme — këtu regjistroni çfarë trajtimi u bë dhe sa kushton.

### Hapi 1: Hapni Fletën e Tarifave

- Brenda vizitës, klikoni **Fleta e Tarifave** (Fee Sheet) nga menuja e majtë

### Hapi 2: Kërkoni kodin e procedurës

Në fushën e kërkimit shkruani kodin CDT ose emrin në shqip:

#### TERAPIA (Mbushje)

| Kodi   | Shërbimi                                           | Çmimi (ALL) |
| ------ | -------------------------------------------------- | ----------- |
| D2330  | Kompozit 1 Sipërf. Ant. (Mbushje Gr.1 anterior)    | 3,000       |
| D2331  | Kompozit 2 Sipërf. Ant. (Mbushje Gr.2 anterior)    | 5,000       |
| D2332  | Kompozit 3 Sipërf. Ant. (Mbushje Gr.3)             | 6,000       |
| D2335  | Kompozit 4+ Sipërf. Ant. (Mbushje Gr.4)            | 8,500       |
| D2391  | Kompozit 1 Sipërf. Post. (Mbushje Gr.1 posterior)  | 3,000       |
| D2392  | Kompozit 2 Sipërf. Post. (Mbushje Gr.2 posterior)  | 4,000       |
| D2393  | Kompozit 3 Sipërf. Post. (Mbushje Gr.3 posterior)  | 6,000       |
| D2394  | Kompozit 4+ Sipërf. Post. (Mbushje Gr.4 posterior) | 8,500       |
| D2140  | Amalgamë 1 Sipërfaqe                               | 5,000       |
| D2999E | Fëmijë Gr.1 (Mbushje dhëmb qumështi)               | 2,500       |
| D2999F | Fëmijë Gr.2                                        | 3,000       |
| D2999G | Fëmijë Gr.3                                        | 3,500       |
| D2960  | Veshje Rezine (Fasete kompoziti)                   | 10,000      |

#### PROFILAKSIA (Pastrim)

| Kodi   | Shërbimi                                  | Çmimi (ALL) |
| ------ | ----------------------------------------- | ----------- |
| D1110  | Pastrim për të Rritur (Detartrazh)        | 3,000       |
| D1120  | Pastrim për Fëmijë                        | 1,500       |
| D1999A | Air Flow (Detartrazh + air flow)          | 3,500       |
| D4341  | Pastrim Rrënjësh 4+ (Detartrazh i thellë) | 5,000       |
| D1351  | Mbyllës Dhëmbi (Silante)                  | 2,500       |

#### ORTOPEDIA (Kurorë, Proteza)

| Kodi   | Shërbimi                                          | Çmimi (ALL) |
| ------ | ------------------------------------------------- | ----------- |
| D2751  | Kurorë PFM Metal Bazë (Metal porcelani)           | 12,000      |
| D2740  | Kurorë Porcelani (Zirkon)                         | 25,000      |
| D2999C | Kurorë Full Zirkon                                | 28,000      |
| D2999D | Kurorë E-max                                      | 30,000      |
| D6059  | Kurorë PFM Abatment (Metal porcelani mbi implant) | 24,000      |
| D6065  | Kurorë Implanti Qeramike (Zirkon mbi implant)     | 30,000      |
| D2962  | Veshje Porcelani (Fasete E-max)                   | 40,000      |
| D2799  | Kurorë e Përkohshme (Provizor)                    | 3,000       |
| D5110  | Protezë e Plotë Sipër                             | 27,000      |
| D5120  | Protezë e Plotë Poshtë                            | 27,000      |
| D5999A | Protezë Elastike (Totale elastike)                | 50,000      |
| D5213  | Protezë Pjesshme Sipër Metal (E skeletuar)        | 40,000      |
| D5214  | Protezë Pjesshme Poshtë Metal (E skeletuar)       | 40,000      |

#### KIRURGJIA

| Kodi   | Shërbimi                                | Çmimi (ALL) |
| ------ | --------------------------------------- | ----------- |
| D7111  | Nxjerrje Dhëmb Qumështi                 | 1,500       |
| D7140  | Nxjerrje e Thjeshtë                     | 3,000       |
| D7210  | Nxjerrje Kirurgjikale (Komplikuar)      | 15,000      |
| D7220  | Dhëmb i Ndikur Ind i Butë (Pjekurie)    | 6,000       |
| D7240  | Dhëmb i Ndikur Kockor (Të retinuar)     | 25,000      |
| D6010  | Vendosje Implanti                       | 50,000      |
| D7999A | Ngritje Sinusi (Sinus lift)             | 65,000      |
| D7999B | Graft Kockor (Osteo plastik)            | 30,000      |
| D7999C | Heqje Kisti                             | 35,000      |
| D3410  | Apikoektomi Anterior (Rezeksion apikal) | 20,000      |
| D7283  | Pajisje Dalje Dhëmbi (Tërheqje kanini)  | 20,000      |

#### ENDODONTIA (Kanale)

| Kodi  | Shërbimi                  | Çmimi (ALL) |
| ----- | ------------------------- | ----------- |
| D3310 | Kanal Rrënje Anterior     | 7,000       |
| D3320 | Kanal Rrënje Premolar     | 10,000      |
| D3330 | Kanal Rrënje Molar        | 15,000      |
| D3346 | Ritrajtim Kanali Anterior | 10,000      |
| D3347 | Ritrajtim Kanali Premolar | 12,000      |
| D3348 | Ritrajtim Kanali Molar    | 18,000      |

#### TE TJERA

| Kodi   | Shërbimi                             | Çmimi (ALL) |
| ------ | ------------------------------------ | ----------- |
| D9972  | Zbardhim për Hark (Profesional)      | 10,000      |
| D9974  | Zbardhim i Brendshëm (Endodontik)    | 3,500       |
| D0150  | Vlerësim Gjithëpërfshirës (Konsultë) | 5,000       |
| D9940  | Mbrojtës Nate (Shinë bruksizmi)      | 6,000       |
| D9999A | Plazëm PRP (Rigjenerim)              | 25,000      |
| D9999B | Fibrinë (Rigjenerim)                 | 25,000      |
| D4999A | Graft Gingive                        | 50,000      |
| D8999A | Gummy Smile (Korrigjim buzëqeshje)   | 45,000      |
| D1999B | Pircing                              | 3,000       |
| D2999A | Vidë Metalike (Rikonstruksion)       | 1,000       |
| D2999B | Vidë Qelqi (Rikonstruksion)          | 1,500       |

### Hapi 3: Shtoni shërbimin

1. Zgjidhni kodin nga lista
2. Çmimi plotësohet automatikisht
3. Mund të shtoni disa shërbime njëkohësisht
4. Klikoni **Ruaj**

### Shembull praktik:

Pacienti bën pastrim + mbushje dhëmbi 36 (Gr.2):

1. Shtoni `D1110` - Pastrim për të Rritur → 3,000 ALL
2. Shtoni `D2392` - Kompozit 2 Sipërf. Post. → 4,000 ALL
3. **Totali: 7,000 ALL**
4. Ruani

---

## 6. REGJISTRIMI I PAGESES

### Hapi 1: Hapni faturimin

- Nga menuja kryesore: **Faturimi** → **Pagesa** ose brenda vizitës klikoni **Pagesa**

### Hapi 2: Plotësoni detajet e pagesës

- **Shuma** → Vendosni shumën e paguar (p.sh. 7000)
- **Metoda e Pagesës** → Zgjidhni:
  - Para në dorë (Cash)
  - Kartë krediti/debiti
  - Transfer bankar
- **Data** → Data e pagesës

### Hapi 3: Ruani

- Klikoni **Ruaj**

### Shënim për pagesa me këste:

Nëse pacienti paguan me këste, regjistroni vetëm shumën e paguar sot. Në vizitën e ardhshme, regjistroni pagesën tjetër.

---

## 7. CAKTIMI I TAKIMEVE (Kalendari)

### Hapi 1: Hapni kalendarin

- Klikoni **Kalendari** nga menuja kryesore

### Hapi 2: Krijoni takim të ri

- Klikoni mbi datën dhe orën e dëshiruar në kalendar
- Ose klikoni butonin **+** / **Takim i Ri**

### Hapi 3: Plotësoni detajet

- **Pacienti** → Kërkoni emrin e pacientit
- **Doktori** → Zgjidhni doktorin
- **Kategoria** → Zgjidhni llojin (p.sh. Pastrim Dentar, Kurorë Dentare, etj.)
- **Data & Ora** → Vendosni datën dhe orën
- **Kohëzgjatja** → Zgjidhni kohëzgjatjen (zakonisht 30 min ose 60 min)
- **Shënime** → Shkruani shënime nëse nevojitet

### Hapi 4: Ruani

- Klikoni **Ruaj**

### Statuset e takimeve:

- **@** → I caktuar (pacienti nuk ka ardhur akoma)
- **~** → Ka ardhur (pacienti ka ardhur në klinikë)
- **>** → Ka hyrë te doktori
- **x** → I anuluar
- **?** → Nuk u paraqit

Për të ndryshuar statusin: klikoni mbi takimin → ndryshoni statusin.

---

## 8. KERKIMI I NJE PACIENTI

### Metoda 1: Kërkimi i shpejtë

- Në shiritin e sipërm ka një fushë kërkimi
- Shkruani emrin ose mbiemrin → Klikoni mbi rezultatin

### Metoda 2: Lista e pacientëve

- **Pacientët** → **Lista e Pacientëve**
- Mund të filtroni sipas emrit, datëlindjes, etj.

---

## 9. SHIKIMI I HISTORIKUT TE PACIENTIT

### Hapi 1: Gjeni pacientin

- Kërkoni emrin e pacientit

### Hapi 2: Shikoni vizitat e kaluara

- Në faqen e pacientit, shikoni listën e **Vizitave** (Encounters)
- Klikoni mbi një vizitë për të parë:
  - Shërbimet e kryera (kodet CDT)
  - Çmimin e secilës procedurë
  - Pagesat e bëra
  - Shënimet e doktorit

### Hapi 3: Shikoni Kartelën Dentare

- Klikoni mbi vizitën e parë → **Kartela Dentare** → Shikoni anamnezën mjekësore

---

## 10. VEPRIME TE SHPESHTA (Permbledhje e Shpejte)

### Pacienti vjen per here te pare:

1. **Pacientët** → **Pacient i Ri** → Plotësoni të dhënat → Ruani
2. Krijoni vizitë → Zgjidhni "Ekzaminim Dentar"
3. Hapni **Kartela Dentare** → Plotësoni anamnezën → Ruani
4. **Fleta e Tarifave** → Shtoni `D0150` (Konsultë - 5,000 ALL)
5. Regjistroni pagesën

### Pacienti vjen per pastrim:

1. Gjeni pacientin → Krijoni vizitë → Kategoria: "Pastrim Dentar"
2. **Fleta e Tarifave** → `D1110` (3,000 ALL) ose `D1999A` (Air Flow - 3,500 ALL)
3. Regjistroni pagesën

### Pacienti vjen per mbushje:

1. Gjeni pacientin → Krijoni vizitë → Kategoria: "Mbushje Dentare"
2. Shkruani te arsyeja: "Mbushje dhëmbi 36" (numri i dhëmbit)
3. **Fleta e Tarifave** → Zgjidhni kodin sipas gradës:
   - Gr.1 → `D2330` ose `D2391` (3,000 ALL)
   - Gr.2 → `D2331` ose `D2392` (4,000-5,000 ALL)
   - Gr.3 → `D2332` ose `D2393` (6,000 ALL)
   - Gr.4 → `D2335` ose `D2394` (8,500 ALL)
4. Regjistroni pagesën

### Pacienti vjen per nxjerrje dhembi:

1. Gjeni pacientin → Krijoni vizitë → Kategoria: "Nxjerrje Dhëmbi"
2. Shkruani te arsyeja: "Nxjerrje dhëmbi 48"
3. **Fleta e Tarifave** → Zgjidhni kodin:
   - Dhëmb qumështi → `D7111` (1,500 ALL)
   - Nxjerrje e thjeshtë → `D7140` (3,000 ALL)
   - Dhëmb pjekurie → `D7220` (6,000 ALL)
   - Nxjerrje e komplikuar → `D7210` (15,000 ALL)
4. Regjistroni pagesën

### Pacienti vjen per kurore:

1. Gjeni pacientin → Krijoni vizitë → Kategoria: "Kurorë Dentare"
2. **Vizita 1 (përgatitja):**
   - `D2799` - Kurorë e Përkohshme (Provizor) → 3,000 ALL
3. **Vizita 2 (vendosja përfundimtare):**
   - Metal porcelani → `D2751` (12,000 ALL)
   - Zirkon → `D2740` (25,000 ALL)
   - Full Zirkon → `D2999C` (28,000 ALL)
   - E-max → `D2999D` (30,000 ALL)
4. Regjistroni pagesën

### Pacienti vjen per implant:

1. Gjeni pacientin → Krijoni vizitë → Kategoria: "Implant Dentar"
2. **Vizita 1 (vendosja e implantit):**
   - `D6010` - Vendosje Implanti → 50,000 ALL
   - Nëse nevojitet: `D7999A` - Ngritje Sinusi → 65,000 ALL
   - Nëse nevojitet: `D7999B` - Graft Kockor → 30,000 ALL
3. **Vizita 2 (kurora mbi implant):**
   - `D6059` - Kurorë PFM mbi implant → 24,000 ALL
   - ose `D6065` - Kurorë Zirkon mbi implant → 30,000 ALL
4. Regjistroni pagesat

---

## 11. NUMRAT E DHEMBEVE (Sistemi FDI)

```
        Sipër Djathtas  |  Sipër Majtas
      18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
      ─────────────────────────┼─────────────────────────
      48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
        Poshtë Djathtas |  Poshtë Majtas
```

- **11-18** → Sipër djathtas (inciziv → molar pjekurie)
- **21-28** → Sipër majtas
- **31-38** → Poshtë majtas
- **41-48** → Poshtë djathtas

---

## 12. NDIHME & PROBLEME TE ZAKONSHME

### Nuk gjej pacientin

- Kontrolloni drejtshkrimin e emrit
- Provoni të kërkoni vetëm mbiemrin

### Çmimi nuk shfaqet automatikisht

- Sigurohuni që keni ekzekutuar skriptin `apply_all_albanian.sh`
- Kontrolloni që kodi CDT është i saktë

### Ndërfaqja shfaqet në anglisht

- Dilni nga sistemi
- Hyni përsëri dhe zgjidhni **Albanian** si gjuhë
- Nëse disa fjalë janë akoma në anglisht, ekzekutoni përsëri `apply_all_albanian.sh`

### Kam nevojë për ndihmë teknike

- Kontaktoni administratorin e sistemit

---

_Ky udhëzues u përgatit për stafin e rececionit të Zeo Dental Clinic._
