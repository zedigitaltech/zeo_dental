import { ServiceItem, Doctor, Testimonial } from './types';

export const SERVICES: ServiceItem[] = [
  {
    id: 'cosmetic',
    title: 'Cosmetic Dentistry',
    description:
      'Transform your smile with veneers, whitening, and aesthetic bonding tailored to your facial structure.',
    iconName: 'Sparkles',
    // Close-up of a woman smiling with perfect teeth (distinct from implants)
    image:
      'https://images.unsplash.com/photo-1619379854728-1647bc5294d1?auto=format&fit=crop&q=80&w=1600',
    longDescription:
      'Our cosmetic dentistry services are designed to enhance the natural beauty of your smile while maintaining optimal oral health. We believe that a smile makeover is not just about changing teeth; it is about harmonizing your smile with your facial features and personality. Using digital smile design technology, we allow you to preview your new smile before any treatment begins.',
    benefits: [
      'Custom-designed porcelain veneers for a natural look',
      'Professional whitening for immediate results',
      'Minimally invasive bonding techniques',
      'Digital Smile Design preview',
    ],
    process: [
      {
        title: 'Consultation',
        description: 'We discuss your goals and analyze your facial structure.',
      },
      { title: 'Design', description: 'Digital simulation of your new smile for approval.' },
      {
        title: 'Preparation',
        description: 'Minimal preparation of teeth and placement of temporaries.',
      },
      { title: 'Transformation', description: 'Bonding of final ceramics and final adjustments.' },
    ],
  },
  {
    id: 'implants',
    title: 'Dental Implants',
    description:
      'Restore function and confidence with our state-of-the-art titanium and zirconia implant solutions.',
    iconName: 'Anchor',
    // Patient with perfect smile
    image:
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1600',
    longDescription:
      'Dental implants are the gold standard for tooth replacement, offering a permanent solution that looks, feels, and functions like natural teeth. At Zeo, we use 3D guided surgery for unparalleled precision and comfort. Whether you need to replace a single tooth or require a full-arch restoration, our specialists ensure a result that restores both your bite and your confidence.',
    benefits: [
      'Permanent solution for missing teeth',
      'Preserves jaw bone density',
      'No impact on surrounding healthy teeth',
      'Biocompatible materials (Titanium or Zirconia)',
    ],
    process: [
      { title: '3D Scan', description: 'CBCT scanning to map bone structure and nerve pathways.' },
      { title: 'Placement', description: 'Precise surgical placement of the implant post.' },
      {
        title: 'Healing',
        description: 'Osseointegration period where bone fuses with the implant.',
      },
      { title: 'Restoration', description: 'Attachment of the custom-made crown or bridge.' },
    ],
  },
  {
    id: 'ortho',
    title: 'Orthodontics',
    description:
      'Modern alignment solutions including invisible aligners and ceramic braces for all ages.',
    iconName: 'Smile',
    // Teenager/Young Adult smiling with braces
    image:
      'https://images.unsplash.com/photo-1552642986-ccb41e7059e7?auto=format&fit=crop&q=80&w=1600',
    longDescription:
      'Straightening your teeth has never been more discreet or comfortable. We offer comprehensive orthodontic solutions ranging from clear aligners to ceramic braces. Our focus is not just on straight teeth, but on creating a functional bite that promotes long-term joint health. We treat patients of all ages, helping you achieve the smile you have always wanted.',
    benefits: [
      'Clear aligners for discreet treatment',
      'Accelerated orthodontics options',
      'Correction of bite issues (TMJ)',
      'Digital monitoring for fewer office visits',
    ],
    process: [
      { title: 'Assessment', description: 'Digital scanning and bite analysis.' },
      { title: 'Planning', description: 'Custom treatment plan and timeline creation.' },
      {
        title: 'Active Therapy',
        description: 'Wearing aligners or braces with regular check-ins.',
      },
      { title: 'Retention', description: 'Custom retainers to maintain your new smile forever.' },
    ],
  },
  {
    id: 'general',
    title: 'General Care',
    description:
      'Comprehensive preventive care, hygiene, and maintenance for long-lasting oral health.',
    iconName: 'HeartPulse',
    image:
      'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=1600',
    longDescription:
      'Preventive care is the foundation of the Zeo philosophy. We go beyond basic cleaning to provide a comprehensive analysis of your oral health ecosystem. Our hygiene appointments include oral cancer screenings, gum health assessments, and personalized advice to keep your teeth healthy for life. We make routine visits a relaxing, spa-like experience.',
    benefits: [
      'Advanced airflow cleaning technology',
      'Digital cavity detection',
      'Oral cancer screening',
      'Personalized hygiene plans',
    ],
    process: [
      { title: 'Exam', description: 'Comprehensive check-up with low-radiation digital X-rays.' },
      { title: 'Hygiene', description: 'Thorough cleaning and polish by expert hygienists.' },
      { title: 'Education', description: 'Tips and tools tailored to your specific oral biome.' },
      { title: 'Plan', description: 'Long-term maintenance schedule based on risk assessment.' },
    ],
  },
  {
    id: 'surgery',
    title: 'Oral Surgery',
    description:
      'Expert surgical procedures including extractions and gum contouring in a pain-free environment.',
    iconName: 'Activity',
    image:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1600',
    longDescription:
      'When surgery is necessary, our priority is your comfort and safety. Our suite is equipped for sedation dentistry to ensure a completely anxiety-free experience. From wisdom tooth removal to complex gum grafting, our board-certified surgeons use microsurgical techniques to minimize recovery time and maximize results.',
    benefits: [
      'Sedation options for anxiety-free treatment',
      'Microsurgical techniques for faster healing',
      'Wisdom teeth management',
      'Gum grafting and contouring',
    ],
    process: [
      { title: 'Evaluation', description: 'Review of medical history and surgical planning.' },
      { title: 'Comfort', description: 'Administration of local anesthesia or sedation.' },
      { title: 'Procedure', description: 'Minimally invasive surgical execution.' },
      { title: 'Recovery', description: 'Detailed aftercare instructions and follow-up.' },
    ],
  },
  {
    id: 'pediatric',
    title: 'Pediatric Dentistry',
    description:
      'Gentle, engaging care designed specifically for the unique needs of children and teenagers.',
    iconName: 'Baby',
    // Baby smiling with teeth
    image:
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1600',
    longDescription:
      'We believe that positive dental experiences in childhood set the stage for a lifetime of health. Our pediatric wing is designed to be welcoming and non-threatening. We speak "kid," explaining procedures in fun, understandable ways. Our focus is on prevention, sealants, and monitoring growth patterns to intervene early if orthodontic needs arise.',
    benefits: [
      'Child-friendly environment and terminology',
      'Preventive sealants and fluoride',
      'Growth and development monitoring',
      'Emergency trauma care',
    ],
    process: [
      { title: 'Meet & Greet', description: 'Getting comfortable with the team and environment.' },
      {
        title: 'Counting Teeth',
        description: 'Gentle exam to check for cavities and development.',
      },
      { title: 'Cleaning', description: 'Soft polishing and hygiene instruction.' },
      { title: 'Reward', description: 'Positive reinforcement to build confidence.' },
    ],
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-emanuela',
    name: 'Dr. Emanuela Velaj',
    role: 'Founder & Lead Dentist',
    image: '/images/team/emanuela-velaj-card.webp',
    bio: 'Founder of Zeo Dental Clinic, Dr. Velaj is a distinguished graduate of the Faculty of Medicine, Dentistry program, with advanced certifications in Orthodontics and Prosthetic Gnathological Rehabilitation from UCAM, Spain.',
    fullBio:
      'Dr. Emanuela Velaj is the founder of Zeo Dental Clinic, having completed her studies at the Faculty of Medicine, Dentistry program, building a professional profile based on deep knowledge, clinical precision, and continuous commitment to quality. Her training has been enriched over the years with advanced postgraduate courses in key areas of modern dentistry, including endodontics, gnathology, implant-supported prosthetics, dental aesthetics, and orthodontics. She holds a diploma from UCAM – Universidad Católica de Murcia (Spain) in Orthodontics and Prosthetic Gnathological Rehabilitation, where she has acquired contemporary European standards and advanced treatment protocols, focused on functional harmony, sophisticated aesthetics, and long-term sustainability of clinical results. As the founder, she has conceptualized and built Zeo Dental Clinic on the principles of medical excellence, advanced technology, and maximum sterilization standards, creating a modern, refined, and completely safe environment, where every detail is designed for patient comfort and trust. Distinguished by professional elegance, clear communication, and a humane approach, the doctor works with precision, ethics, and maximum dedication, offering personalized treatments and high-level functional and aesthetic results. Personally, she is a mother of two children, a role that has strengthened her empathy, patience, and human sensitivity. Traveling and getting to know different cultures are a constant source of inspiration, while music, dancing, and contact with nature give her balance and positive energy, naturally reflected in her professional philosophy and special care for each patient.',
  },
  // Dr. Dorina first - Oral Surgery & Implantology Specialist (Paris-trained)
  {
    id: 'dr-dorina',
    name: 'Dr. Dorina Beqiraj',
    role: 'Oral Surgery & Implantology Specialist',
    image: '/images/team/dorina-beqiraj-card.jpg',
    bio: 'Expert trained at the most prestigious hospital centers in Paris, Dr. Dorina delivers clinical precision and advanced French-certified treatments.',
    fullBio:
      "Dr. Dorina Beqiraj is a specialist in Oral Surgery and Implantology, trained at the most prestigious hospital centers in Paris. She brings clinical precision and advanced French-certified treatments to every procedure. Her expertise includes specialization in Oral Surgery and Occlusodontology at elite hospitals Pitié Salpêtrière and Charles Foix in Paris, as well as specialized training in Periodontology (gum diseases) at CHU-Nantes. Dr. Dorina holds the French CES certification (Certificat d'Études Supérieures) with diplomas in surgery, implantology, and anatomy-physiology.",
  },
  {
    id: 'dr-rien',
    name: 'Dr. Rien Stambolliu',
    role: 'Dental Specialist',
    image: '/images/team/rien-stambolliu-card.webp',
    bio: 'Graduate of the University of Stomatology, Tirana, Dr. Stambolliu specializes in dental therapy, fixed and mobile prosthetics, and implant-supported restorations.',
    fullBio:
      'Dr. Rien Stambolliu completed his studies at the University of Stomatology, Tirana. Throughout his professional development, he has successfully completed numerous national and international training programs, and has been an active participant in several medical conferences, continuously updating himself with the latest techniques and standards in dentistry. He professionally performs treatments in the field of dental therapy, fixed prosthetics, removable prosthetics, as well as implant-supported prosthetics, paying special attention to the function, aesthetics, and long-term sustainability of the work. Known for his correctness, careful approach, and warm demeanor towards patients, Dr. Rien works with maximum dedication to guarantee quality, safe, and personalized treatments for each patient.',
  },
  {
    id: 'dr-kristi',
    name: 'Dr. Kristi Sulanjaku',
    role: 'Dental Specialist',
    image: '/images/team/kristi-sulanjaku-card.webp',
    bio: 'Dr. Sulanjaku combines clinical excellence with a compassionate approach, ensuring personalized care for every patient.',
    fullBio:
      'Dr. Kristi Sulanjaku is a dedicated dental professional passionate about transforming smiles and improving oral health. With extensive experience in comprehensive dental care, Dr. Sulanjaku focuses on creating positive patient experiences through gentle, effective treatment. Their commitment to excellence and attention to detail ensures that each patient receives the highest quality care tailored to their individual needs.',
  },
];

// Real patient reviews are served live via the Elfsight Google Reviews widget.
// This array is intentionally empty: the previous entries were placeholder/fabricated
// testimonials (invented names, a reference to a non-existent "Dr. Zeo") and must never
// ship on a real medical site. Add genuine, consented patient testimonials here only.
export const TESTIMONIALS: Testimonial[] = [];

// NOTE: This system instruction is UNUSED. The active chatbot prompt is in server/src/routes/chat.ts
// Keeping for reference only.
// export const GEMINI_SYSTEM_INSTRUCTION = `...`;
