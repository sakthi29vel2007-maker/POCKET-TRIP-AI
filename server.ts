import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize server-side Gemini SDK if key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to wrap promises with timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
  ]);
}

// AI Travel Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, context } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!ai) {
    return res.json({
      reply: generateLocalRuleBasedReply(message, context),
      actionSuggestion: extractActionSuggestion(message, context),
    });
  }

  try {
    const systemPrompt = `You are PocketTrip AI, an expert budget-first travel consultant for India.
The user enters their available budget, and you help them find destinations, stays, food, transport, and itineraries that strictly fit their budget.
User's current state:
- Starting location: ${context?.origin || 'Madurai'}
- Budget: ₹${context?.budget || '10,000'}
- Travellers: ${context?.travellers || 2}
- Days: ${context?.days || 3}
- Travel Style: ${context?.travelStyle || 'Budget'}
- Current Destination viewed (if any): ${context?.currentDestination || 'None'}

Instructions:
1. Provide realistic, practical, budget-conscious advice for India.
2. Break down estimated costs clearly (Transport, Stay, Food, Activities, Buffer).
3. If the user asks where they can go for a specific amount (e.g. "I have ₹7,000 from Madurai"), name 2-3 specific realistic destinations with estimated costs.
4. Keep replies crisp, structured, friendly, and actionable (under 200 words).`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      }),
      5000
    );

    const replyText = response.text || "I'm ready to help you plan your trip within your budget!";
    const actionSuggestion = extractActionSuggestion(message, context);

    return res.json({
      reply: replyText,
      actionSuggestion,
    });
  } catch (error: any) {
    console.log('Using local budget rule engine reply for prompt (fallback or timeout)');
    return res.json({
      reply: generateLocalRuleBasedReply(message || '', context),
      actionSuggestion: extractActionSuggestion(message || '', context),
    });
  }
});

// AI Budget Optimizer endpoint
app.post('/api/ai/optimize', async (req, res) => {
  try {
    const { destination, budget, plannedCost, travellers, days, breakdown } = req.body;
    
    const overBudget = (plannedCost || 0) > (budget || 0);
    const deficit = Math.max(0, (plannedCost || 0) - (budget || 0));

    if (ai) {
      const prompt = `Destination: ${destination}. Total Budget: ₹${budget}. Planned Cost: ₹${plannedCost}. Deficit: ₹${deficit}. Travellers: ${travellers}, Days: ${days}. Current breakdown: Transport ₹${breakdown?.transport || 0}, Stay ₹${breakdown?.stay || 0}, Food ₹${breakdown?.food || 0}, Local Travel ₹${breakdown?.localTransport || 0}, Activities ₹${breakdown?.activities || 0}.
Provide 4 specific actionable tips to optimize this budget in India (e.g. switch from private cab to KSRTC/SETC express bus, choose verified boutique homestay over resort, eat at iconic authentic mess for ₹150/thali, skip premium commercial entry for scenic trails). Return a JSON object with:
"tips": string[] (4 items),
"optimizedBreakdown": { "transport": number, "stay": number, "food": number, "localTransport": number, "activities": number, "newTotal": number, "savings": number }`;

      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.5,
            },
          }),
          5000
        );

        if (response.text) {
          try {
            const parsed = JSON.parse(response.text);
            return res.json(parsed);
          } catch {
            // fallback
          }
        }
      } catch (geminiErr) {
        console.log('Gemini optimize timeout or fallback triggered, using algorithmic optimizer');
      }
    }

    // High quality programmatic optimization calculation
    const currentStay = breakdown?.stay || 3000;
    const currentTransport = breakdown?.transport || 2500;
    const currentFood = breakdown?.food || 2000;
    const currentLocal = breakdown?.localTransport || 1000;
    const currentActivities = breakdown?.activities || 800;

    const optStay = Math.round(currentStay * 0.75);
    const optTransport = Math.round(currentTransport * 0.85);
    const optFood = Math.round(currentFood * 0.85);
    const optLocal = Math.round(currentLocal * 0.7);
    const optActivities = Math.round(currentActivities * 0.75);

    const newTotal = optStay + optTransport + optFood + optLocal + optActivities;
    const savings = (breakdown?.total || plannedCost) - newTotal;

    return res.json({
      tips: [
        'Switch from on-demand private cab to state express buses (SETC / KSRTC) or shared cabs.',
        'Choose pre-verified heritage homestays or standard guest houses instead of commercial 3-star hotels.',
        'Enjoy local legendary meals (authentic banana leaf thali & breakfast idlis) instead of multi-cuisine restaurants.',
        'Prioritize scenic free nature trails, lake walks, and viewpoints over commercial theme attractions.'
      ],
      optimizedBreakdown: {
        transport: optTransport,
        stay: optStay,
        food: optFood,
        localTransport: optLocal,
        activities: optActivities,
        newTotal: newTotal,
        savings: Math.max(0, savings)
      }
    });
  } catch (err: any) {
    console.error('Error in /api/ai/optimize:', err);
    return res.status(500).json({ error: 'Failed to optimize budget' });
  }
});

// Helper for offline / fallback replies
function generateLocalRuleBasedReply(msg: string, ctx: any): string {
  const m = msg.toLowerCase();
  const origin = ctx?.origin || 'Madurai';
  
  if (m.includes('7000') || m.includes('7,000')) {
    return `With ₹7,000 from ${origin}, you have great options!
1. **Kodaikanal (2-3 Days)**: Bus fare ~₹400, cozy homestay ~₹1,200/night, food ~₹600/day. Total ~₹5,800.
2. **Rameswaram (2 Days)**: Train fare ~₹250, beachside lodge ~₹1,000/night, seafood & temple visits. Total ~₹4,900.
3. **Courtallam / Tirunelveli (2 Days)**: Waterfalls, legendary Halwa, scenic budget trip under ~₹4,500.`;
  }
  
  if (m.includes('15000') || m.includes('15,000') || (m.includes('4') && m.includes('people'))) {
    return `For 4 travellers with ₹15,000:
Sharing a 4-bed family suite or 2 standard rooms cuts stay costs in half!
- **Top Picks**: Ooty or Kodaikanal (shared cab or train + bus), Munnar (scenic tea trails), or Pondicherry (budget villa).
- Estimated per-person cost: ~₹3,750 for 2 nights / 3 days!`;
  }

  if (m.includes('hotel') && (m.includes('cheap') || m.includes('cheaper') || m.includes('reduce'))) {
    return `To cut hotel costs:
1. Book verified government guest houses or youth hostels (Zostel/homestays) starting at ₹600–₹1,000/night.
2. Look for places 10-15 minutes outside the central market (often 40% cheaper).
3. Try an overnight train or sleeper bus, saving you a whole night's accommodation!`;
  }

  if (m.includes('adventure')) {
    return `Here are high-thrill, low-cost adventure destinations:
- **Kodaikanal**: Dolphin's Nose trek & pine forest cycling (almost free entry!).
- **Vagamon & Munnar**: Paragliding and off-road tea estate jeep trails.
- **Dandeli & Rishikesh**: Budget river rafting and jungle trekking.`;
  }

  return `PocketTrip AI is ready! You can explore destinations matching your budget of ₹${ctx?.budget || '10,000'} starting from ${origin}. Every itinerary includes transport, stay, meals, and activities calculated down to the rupee.`;
}

function extractActionSuggestion(msg: string, ctx: any): any {
  const m = msg.toLowerCase();
  const numbers = m.match(/(\d+[\d,]*)/g);
  let detectedBudget: number | null = null;
  if (numbers) {
    for (const num of numbers) {
      const clean = parseInt(num.replace(/,/g, ''), 10);
      if (clean >= 1000 && clean <= 1000000) {
        detectedBudget = clean;
        break;
      }
    }
  }

  let detectedDestination: string | null = null;
  const popular = ['kodaikanal', 'ooty', 'rameswaram', 'munnar', 'alleppey', 'pondicherry', 'coorg', 'mysuru', 'jaipur', 'goa', 'varkala', 'wayanad'];
  for (const p of popular) {
    if (m.includes(p)) {
      detectedDestination = p.charAt(0).toUpperCase() + p.slice(1);
      break;
    }
  }

  if (detectedBudget || detectedDestination) {
    return {
      budget: detectedBudget,
      destination: detectedDestination,
    };
  }
  return null;
}

// Vite middleware in dev or static serve in prod
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PocketTrip AI server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
