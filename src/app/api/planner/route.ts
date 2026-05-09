// src/app/api/planner/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'Anywhere';
  const vibe = searchParams.get('vibe') || 'local';
  const duration = searchParams.get('duration') || '3-day';
  const pref = searchParams.get('pref') || 'everything';

  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    return NextResponse.json({ error: 'Gemini API key missing. Check .env.local' }, { status: 500 });
  }

  try {
    const prompt = `You are an elite, high-end travel curator. Create a ${duration} itinerary for ${location} focusing on "${pref}" with a "${vibe === 'local' ? 'quietly local and hidden' : 'brightly busy and popular'}" vibe.
    
    Return a strictly valid JSON object matching this exact structure. Do not use markdown blocks.
    {
      "title": "A poetic 3 to 6 word title for the trip",
      "summary": "A highly engaging, poetic 2-sentence summary of what this trip will feel like.",
      "days": [
        {
          "day": 1,
          "theme": "A short, aesthetic theme for the day (e.g., 'Arrival & Neon Lights')",
          "activities": [
            {
              "time": "Morning (or Afternoon/Evening/Late Night)",
              "title": "Name of the specific place or activity",
              "desc": "A vivid 1-sentence description of what to do or eat here."
            }
          ]
        }
      ]
    }`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          response_mime_type: "application/json" // Forces Gemini to return pure JSON
        }
      })
    });

    const data = await res.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("AI failed to generate an itinerary.");
    }

    const text = data.candidates[0].content.parts[0].text;
    const itinerary = JSON.parse(text);

    return NextResponse.json({ itinerary });
  } catch (error) {
    console.error("Planner API Error:", error);
    return NextResponse.json({ error: 'Failed to generate itinerary. The AI might be daydreaming.' }, { status: 500 });
  }
}