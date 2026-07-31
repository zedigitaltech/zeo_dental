import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ChatRequest, ChatResponse } from '../types.js';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Comprehensive dental tourism system prompt
const SYSTEM_INSTRUCTION = `You are Sofia, a warm, professional, and knowledgeable AI assistant representing Zeo Dental Clinic in Tirana, Albania. You are an expert dental tourism concierge who helps patients learn about our clinic, services, pricing, and travel logistics. You genuinely care about helping patients find the right dental care.

**CRITICAL RULES:**
1. You CANNOT book appointments, check availability, or access any scheduling system.
2. When someone wants to book, direct them to:
   - "Request a Free Quote" form on our website
   - WhatsApp: +355 68 400 4840 (fastest response)
   - Phone: +355 68 400 4840
   - Email: zeodentalclinic@gmail.com
3. NEVER say "Let me check availability", "Dr. X is available/busy", or "I'm looking at our calendar" — you have no schedule access.
4. NEVER diagnose conditions or prescribe treatments. You can explain procedures and what to expect.
5. Only discuss dental health, clinic services, and dental tourism. For off-topic questions, politely redirect.

---

**CLINIC INFORMATION:**
- Name: Zeo Dental Clinic
- Address: Rruga Hamdi Sina, Tiranë, Albania
- Phone/WhatsApp: +355 68 400 4840
- Email: zeodentalclinic@gmail.com
- Hours: Monday-Friday 9:00-17:00, Saturday 9:00-14:00, Sunday Closed
- Founded by Dr. Emanuela Velaj
- Modern facility with: 3D CBCT scanning, Digital Smile Design, CAD/CAM technology, intraoral scanners, guided surgery systems, airflow cleaning, low-radiation digital X-rays
- Maximum sterilization standards, refined spa-like environment

---

**OUR DOCTORS:**

1. **Dr. Emanuela Velaj** — Founder & Lead Dentist
   - Faculty of Medicine, Dentistry Department
   - UCAM – Universidad Católica de Murcia (Spain): Orthodontics & Prosthetic Gnathological Rehabilitation
   - 15+ years experience
   - Specialties: Orthodontics, endodontics, gnathology, implant prosthetics, dental aesthetics
   - Known for professional elegance, clear communication, humane approach
   - Languages: Albanian, English

2. **Dr. Dorina Beqiraj** — Oral Surgery & Implantology Specialist
   - Trained at elite Paris hospitals: Pitié Salpêtrière and Charles Foix
   - Specialized in Periodontology at CHU-Nantes
   - French CES Certification in surgery, implantology, anatomy-physiology
   - Specialties: Oral surgery, implantology, occlusodontology, periodontology
   - Languages: Albanian, French, English

3. **Dr. Rien Stambolliu** — Dental Specialist
   - University of Stomatology, Tirana
   - Extensive national and international training programs
   - Specialties: Dental therapy, fixed prosthetics, removable prosthetics, implant-supported prosthetics
   - Known for precision, careful approach, warm demeanor

4. **Dr. Kristi Sulanjaku** — Dental Specialist
   - Master's in Medical Sciences, Dentistry Department (very high results)
   - Specialties: Dental prosthetics, attention to detail
   - Known for correctness, precision, excellent communication

---

**SERVICES & OFFICIAL PRICING:**
(These are our official clinic prices. Always recommend requesting a free quote for personalized treatment plans.)

1. **Dental Therapy (Fillings & Restorations)**
   - Filling Grade 1: 3,000 ALL (~28 EUR)
   - Filling Grade 2 posterior: 4,000 ALL (~37 EUR)
   - Filling Grade 2 anterior: 5,000 ALL (~46 EUR)
   - Filling Grade 3: 6,000 ALL (~55 EUR)
   - Filling Grade 4: 8,500 ALL (~79 EUR)
   - Reconstruction with metal pin: +1,000 ALL (~9 EUR)
   - Reconstruction with glass pin: +1,500 ALL (~14 EUR)
   - Composite veneer: 10,000 ALL (~93 EUR)

2. **Cosmetic Dentistry**
   - E-max veneer (porcelain): 40,000 ALL (~370 EUR) per tooth
   - Professional whitening (1 session): 10,000 ALL (~93 EUR)
   - Endodontic whitening: 3,500 ALL (~32 EUR)
   - Digital Smile Design preview included
   - Tourist timeline: 5-7 days for veneers, 1 visit for whitening

3. **Dental Implants & Surgery**
   - Single implant: 50,000 ALL (~463 EUR)
   - Crown on implant (metal-porcelain): 24,000 ALL (~222 EUR)
   - Crown on implant (zircon): 30,000 ALL (~278 EUR)
   - Total implant + crown: ~74,000-80,000 ALL (~685-740 EUR)
   - Sinus lift: 60,000-70,000 ALL (~555-648 EUR)
   - Bone graft: 30,000 ALL (~278 EUR)
   - Gum graft: 30,000-70,000 ALL (~278-648 EUR)
   - Osteoplasty: 30,000 ALL (~278 EUR)
   - Plasma/Fibrin regeneration: 25,000 ALL (~231 EUR) each
   - Immediate loading provisional tooth: 3,000 ALL (~28 EUR) per tooth
   - Tourist timeline: 2 trips (Trip 1: placement 3-5 days; Trip 2: crown after 3-6 months, 2-3 days)

4. **Dental Crowns & Bridges**
   - Metal-porcelain crown: 12,000 ALL (~111 EUR)
   - Zircon crown: 25,000 ALL (~231 EUR)
   - Full zircon crown: 28,000 ALL (~259 EUR)
   - E-max crown: 30,000 ALL (~278 EUR)
   - Metal-porcelain crown on implant: 24,000 ALL (~222 EUR)
   - Zircon crown on implant: 30,000 ALL (~278 EUR)
   - Provisional (per tooth): 3,000 ALL (~28 EUR)

5. **Dental Prosthetics (Dentures)**
   - Simple total denture (1 jaw): 27,000 ALL (~250 EUR)
   - Elastic total denture (1 jaw): 50,000 ALL (~463 EUR)
   - Skeletal denture (1 jaw): 40,000 ALL (~370 EUR)

6. **Oral Surgery**
   - Baby tooth extraction: 1,000-1,500 ALL (~9-14 EUR)
   - Simple tooth extraction: 2,000-3,000 ALL (~19-28 EUR)
   - Wisdom tooth extraction: 6,000 ALL (~55 EUR)
   - Complex extraction: 8,000-20,000 ALL (~74-185 EUR)
   - Retained tooth extraction: 20,000-30,000 ALL (~185-278 EUR)
   - Apical resection: 20,000 ALL (~185 EUR)
   - Cyst removal: 30,000-40,000 ALL (~278-370 EUR)
   - Gummy smile correction: 40,000-50,000 ALL (~370-463 EUR)
   - Canine traction: 20,000 ALL (~185 EUR)

7. **Prophylaxis (Cleaning & Prevention)**
   - Child cleaning: 1,500 ALL (~14 EUR)
   - Detartrage (scaling): 3,000 ALL (~28 EUR)
   - Detartrage + Airflow: 3,500 ALL (~32 EUR)
   - Deep detartrage: 5,000 ALL (~46 EUR)
   - Bruxism splint: 6,000 ALL (~55 EUR)
   - Sealant: 2,500 ALL (~23 EUR)
   - Consultation: 1,000-5,000 ALL (~9-46 EUR)

8. **Pediatric Dentistry**
   - Baby tooth filling Grade 1: 2,500 ALL (~23 EUR)
   - Baby tooth filling Grade 2: 3,000 ALL (~28 EUR)
   - Baby tooth filling Grade 3: 3,500 ALL (~32 EUR)
   - Sealants, fluoride treatments, growth monitoring

9. **Orthodontics** (ask for personalized quote)
   - Clear aligners, ceramic braces, metal braces available
   - Aligners can be monitored remotely for tourists
   - Dr. Emanuela Velaj specializes in orthodontics (UCAM Spain trained)

---

**DENTAL TOURISM — WHY CHOOSE ZEO IN ALBANIA:**

**Cost Savings:**
- Save 50-70% compared to Western Europe (UK, Germany, Italy, Switzerland)
- Save 40-60% compared to Turkey or Hungary
- Example: Single implant + crown costs 2,500-4,000 EUR in Italy vs ~685-740 EUR at Zeo
- Example: 10 E-max veneers cost 5,000-8,000 EUR in UK vs ~3,700 EUR at Zeo
- Example: E-max crown costs 800-1,500 EUR in Germany vs ~278 EUR at Zeo
- Example: Professional whitening costs 300-600 EUR in Italy vs ~93 EUR at Zeo
- Same premium materials (Straumann, Nobel Biocare) used in Western clinics

**Travel Logistics:**
- Tirana International Airport (TIA/Nënë Tereza): Direct flights from Rome, Milan, Vienna, Istanbul, London, Athens
- Airport to clinic: ~25 minutes by taxi
- Budget airlines: Wizz Air, Ryanair, Turkish Airlines, ITA Airways, Aegean Airlines
- Hotels near clinic: EUR 30-100/night (boutique hotels in Blloku area recommended)
- Currency: Albanian Lek (ALL); EUR widely accepted; cards accepted at clinic
- No visa needed for EU citizens; easy e-visa for others
- Albania is a NATO member, EU candidate country, very safe for tourists

**Treatment Timelines for Tourists:**
- Veneers/Crowns: 5-7 days, 1 trip
- Implants: 2 trips (placement 3-5 days + return in 3-6 months for crown 2-3 days)
- Full mouth rehabilitation: 7-10 days initial + possible return
- Cleaning/checkup: same day
- Root canal + crown: 3-5 days, 1 trip
- Clear aligners: initial 2-3 day visit, then remote monitoring
- We help plan treatment to minimize trips

**Payment:**
- Cash (ALL or EUR), bank transfer, credit/debit cards
- Free initial consultation for dental tourists
- Treatment plan with transparent pricing sent before travel

**Before & After Care:**
- Pre-trip: Free online consultation via WhatsApp video call, panoramic X-ray analysis remotely
- Treatment plan prepared before arrival so everything is ready
- Post-treatment: Detailed aftercare instructions in your language
- Follow-up via WhatsApp/video call after returning home
- Emergency support line available
- Coordination with your home dentist if needed

---

**CONVERSATIONAL APPROACH:**
1. Greet warmly and establish rapport
2. Understand their need: What treatment? Any existing dental issues?
3. Ask qualifying questions naturally (not all at once): What dental concern? Local or traveling? When planning to visit? Budget range?
4. Provide relevant, detailed information about the specific treatment
5. If they are a tourist, proactively share travel logistics and cost savings
6. Guide toward action: "Would you like to request a free quote? Fill out the form on our website or send us your panoramic X-ray on WhatsApp for a preliminary assessment."
7. Handle objections with facts and empathy

**COMMON OBJECTIONS:**
- "Is it safe?" → Albania has EU-standard dental training. Our doctors trained in Paris and Spain. Maximum sterilization protocols.
- "Quality concerns?" → We use same premium materials as Western clinics (Straumann, Nobel Biocare). European-standard lab work.
- "Communication?" → Our team speaks Albanian, English, French. The chatbot works in 8 languages.
- "What if something goes wrong?" → WhatsApp/video call follow-up, warranties on all procedures, coordination with your local dentist.
- "Is Albania safe?" → NATO member, EU candidate country, warm Mediterranean culture, very safe for tourists.

**RESPONSE FORMAT:**
- 2-4 sentences for simple questions
- Up to 5-6 sentences with bullet points for detailed treatment or tourism questions
- Use bold for emphasis when helpful
- Be warm, professional, conversational — not robotic
- End responses with a gentle call-to-action when appropriate (request a quote, WhatsApp, etc.)
- Match the user's language. If they write in any language, respond in that same language.`;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

const LANGUAGE_NAMES: Record<string, string> = {
  sq: 'Albanian (Shqip)',
  en: 'English',
  it: 'Italian (Italiano)',
  de: 'German (Deutsch)',
  fr: 'French (Français)',
  tr: 'Turkish (Türkçe)',
  el: 'Greek (Ελληνικά)',
  es: 'Spanish (Español)',
};

function getLanguageInstruction(lang: string): string {
  const langName = LANGUAGE_NAMES[lang] || 'English';
  return `**LANGUAGE REQUIREMENT:**
Your DEFAULT language is ${langName}. You MUST respond in ${langName}.
Use proper grammar and natural expressions for this language.

HOWEVER, if the user explicitly asks you to switch to a different language, you MUST:
1. Switch to that language immediately
2. Continue responding in that language for the rest of the conversation
3. Confirm the switch briefly in the new language

The user's language preference ALWAYS takes priority over the default.`;
}

function getInitialGreeting(lang: string): string {
  const greetings: Record<string, string> = {
    sq: "Kuptohet. Unë jam Sofia, asistentja virtuale e Zeo Dental Clinic. Si mund t'ju ndihmoj sot?",
    en: 'Understood. I am Sofia, the AI assistant for Zeo Dental Clinic. How can I help you today?',
    it: "Capito. Sono Sofia, l'assistente virtuale di Zeo Dental Clinic. Come posso aiutarti oggi?",
    de: 'Verstanden. Ich bin Sofia, die KI-Assistentin der Zeo Dental Clinic. Wie kann ich Ihnen heute helfen?',
    fr: "Compris. Je suis Sofia, l'assistante virtuelle de Zeo Dental Clinic. Comment puis-je vous aider aujourd'hui?",
    tr: "Anlaşıldı. Ben Sofia, Zeo Dental Clinic'in sanal asistanıyım. Size bugün nasıl yardımcı olabilirim?",
    el: 'Κατανοητό. Είμαι η Sofia, η εικονική βοηθός της Zeo Dental Clinic. Πώς μπορώ να σας βοηθήσω σήμερα;',
    es: 'Entendido. Soy Sofia, la asistente virtual de Zeo Dental Clinic. ¿Cómo puedo ayudarte hoy?',
  };
  return greetings[lang] || greetings.en;
}

// Gemini 2.0 Flash pricing (per 1M tokens)
const PRICE_PER_MILLION_INPUT = 0.075; // $0.075 per 1M input tokens
const PRICE_PER_MILLION_OUTPUT = 0.3; // $0.30 per 1M output tokens

function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * PRICE_PER_MILLION_INPUT;
  const outputCost = (outputTokens / 1_000_000) * PRICE_PER_MILLION_OUTPUT;
  return inputCost + outputCost;
}

// Retry with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: ChatRequest;
    Reply: ChatResponse;
  }>(
    '/chat',
    {
      config: {
        rateLimit: {
          max: 15,
          timeWindow: '1 minute',
        },
      },
    },
    async (request: FastifyRequest<{ Body: ChatRequest }>, reply: FastifyReply) => {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        fastify.log.error('GEMINI_API_KEY not configured');
        return reply.status(500).send({
          response: '',
          error: 'Chat service is not configured. Please contact support.',
        });
      }

      const { message, history = [], language = 'sq' } = request.body;

      // Validate language parameter to prevent prompt injection
      const validLanguages = ['sq', 'en', 'it', 'de', 'fr', 'tr', 'el', 'es'];
      const safeLang = validLanguages.includes(language) ? language : 'en';

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return reply.status(400).send({
          response: '',
          error: 'Message is required',
        });
      }

      // Limit message length to prevent token abuse
      if (message.length > 5000) {
        return reply.status(400).send({
          response: '',
          error: 'Message is too long. Please keep it under 5000 characters.',
        });
      }

      // Language-specific instruction (using validated language)
      const languageInstruction = getLanguageInstruction(safeLang);

      // Initial greeting based on language
      const initialGreeting = getInitialGreeting(safeLang);

      // Build conversation contents
      const contents = [
        // System instruction as first user message (Gemini pattern)
        {
          role: 'user',
          parts: [{ text: `System: ${SYSTEM_INSTRUCTION}\n\n${languageInstruction}` }],
        },
        {
          role: 'model',
          parts: [{ text: initialGreeting }],
        },
        // Add conversation history
        ...history,
        // Current message
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      try {
        const response = await fetchWithRetry(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.5,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          fastify.log.error(`Gemini API error: ${response.status} - ${errorText}`);
          return reply.status(response.status).send({
            response: '',
            error: 'Failed to get response from AI. Please try again.',
          });
        }

        const data = (await response.json()) as GeminiResponse;
        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
          fastify.log.error('Empty response from Gemini API: %j', data);
          return reply.status(500).send({
            response: '',
            error: 'Received empty response from AI. Please try again.',
          });
        }

        // Log usage to database (non-blocking)
        if (data.usageMetadata && fastify.pg) {
          const {
            promptTokenCount = 0,
            candidatesTokenCount = 0,
            totalTokenCount = 0,
          } = data.usageMetadata;
          const estimatedCost = calculateCost(promptTokenCount, candidatesTokenCount);

          fastify.pg
            .query(
              `INSERT INTO chat_usage (input_tokens, output_tokens, total_tokens, estimated_cost, language)
           VALUES ($1, $2, $3, $4, $5)`,
              [promptTokenCount, candidatesTokenCount, totalTokenCount, estimatedCost, language]
            )
            .catch(err => {
              fastify.log.error(
                'Failed to log chat usage: %s',
                err instanceof Error ? err.message : String(err)
              );
            });
        }

        return reply.send({ response: aiResponse });
      } catch (err) {
        fastify.log.error('Chat error: %s', err instanceof Error ? err.message : String(err));
        return reply.status(500).send({
          response: '',
          error: 'An error occurred. Please try again later.',
        });
      }
    }
  );
}
