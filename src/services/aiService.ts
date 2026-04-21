import { getProducts } from './supabaseProducts';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Model priority list — tries each in order until one succeeds
const MODELS = [
  'gemini-flash-lite-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest',
];


export type AuraMode = 'shopping' | 'technical' | 'designer';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

const PERSONA_PROMPTS: Record<AuraMode, string> = {
  shopping: `You are Aura Shopping, the premier concierge for HomeStore. 
  Your tone is sophisticated, enthusiastic, and highly persuasive.
  
  CORE MISSION:
  - Match users with products that fit their lifestyle and budget.
  - Highlight current promotions and the "lifestyle value" of items.
  - Always suggest at least 2 comparable options when asked for advice.
  
  RESPONSE STYLE:
  - Use elegant language (e.g., "exquisite," "unmatched efficiency," "curated selection").
  - Structure responses with bullet points for features.
  - Keep it upbeat but professional.`,
  
  technical: `You are Aura Technical, the chief engineer consultant for HomeStore. 
  Your tone is analytical, precise, and authoritative.
  
  CORE MISSION:
  - Provide deep-dive technical specifications (wattage, dimensions, certifications).
  - Explain the science behind energy efficiency (A+++ ratings).
  - Give maintenance tips and installation requirements.
  
  RESPONSE STYLE:
  - Use structured tables or lists for technical data.
  - Focus on reliability and performance metrics.
  - Be direct and data-centric. No fluff.`,
  
  designer: `You are Aura Designer, the creative lead at HomeStore Design Studio. 
  Your tone is inspirational, artistic, and visionary.
  
  CORE MISSION:
  - Coordinate appliances with home aesthetics (Modern, Rustic, Minimalist).
  - Advise on color palettes, finishes (matte vs gloss), and spatial flow.
  - Help users create a cohesive "look" for their kitchen or laundry room.
  
  RESPONSE STYLE:
  - Use descriptive, evocative language.
  - Mention materials and textures.
  - Structure suggestions by "Room Vibe" or "Design Trend".`
};

export async function generateAuraResponse(
  mode: AuraMode,
  messages: ChatMessage[],
  contextProducts?: any[]
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key is not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  // Fetch product catalog for grounding
  let productContext = '';
  try {
    if (!contextProducts) {
      const products = await getProducts();
      productContext = products.map(p =>
        `- **${p.name}** [ID: ${p.id}] [Code: ${p.productCode}]: ${p.price} TND. ${p.description.substring(0, 120)} Features: ${p.features.slice(0, 4).join(', ')}.`
      ).join('\n');
    } else {
      productContext = contextProducts.map(p =>
        `- **${p.name}** - ${p.price} TND. ${p.description}`
      ).join('\n');
    }
  } catch (e) {
    console.warn('Aura: Could not fetch product context, continuing without it.', e);
  }

  const systemInstruction = `${PERSONA_PROMPTS[mode]}

SYSTEM DIRECTIVES:
1. You represent 'HomeStore', a premium Tunisian appliance retailer.
2. DATA SOURCE: Only reference products from this list when making recommendations:
${productContext || 'Product catalog temporarily unavailable — give general expert advice.'}

RESPONSE FORMATTING RULES (STRICT):
- Use ### Headers for section titles.
- Use **Bold** for product names and key features.
- Use *Italics* for design styles or technical terms.
- Use > Blockquotes for expert tips or key highlights.
- Always end with a helpful follow-up question.
- Refer to product IDs as "Ref: [ID]" when mentioned.
- NEVER break character.`;

  // Build conversation history in Gemini format
  // Filter out empty messages and map to Gemini's expected structure
  const history = messages
    .filter(m => m.content.trim().length > 0)
    .map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

  // Gemini requires the last turn to be from 'user'
  const lastTurn = history[history.length - 1];
  const validHistory = (!lastTurn || lastTurn.role !== 'user')
    ? [...history, { role: 'user' as const, parts: [{ text: 'Hello' }] }]
    : history;

  const requestBody = {
    // system_instruction is a DEDICATED top-level field — NOT inside contents[]
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: validHistory,
    generationConfig: {
      temperature: 0.75,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    ]
  };

  // Try each model in order — fall back if rate-limited or unavailable
  let lastError: Error | null = null;
  for (const model of MODELS) {
    try {
      const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // Skip to next model on rate limit (429) or model unavailability (503/404)
      if (!response.ok) {
        const code = data.error?.code ?? response.status;
        const msg = data.error?.message ?? `HTTP ${response.status}`;
        if (code === 429 || code === 503 || code === 404) {
          console.warn(`Aura: Model [${model}] unavailable (${code}), trying next...`);
          lastError = new Error(msg);
          continue;
        }
        throw new Error(msg);
      }

      if (!data.candidates || data.candidates.length === 0) {
        console.warn(`Aura: Model [${model}] returned no candidates, trying next...`);
        lastError = new Error('No response generated.');
        continue;
      }

      return data.candidates[0].content.parts[0].text;

    } catch (err: any) {
      // Network errors — try next model
      if (err.name === 'TypeError') {
        console.warn(`Aura: Network error with [${model}], trying next...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  // All models failed
  throw lastError ?? new Error('All Aura AI models are currently unavailable.');
}

