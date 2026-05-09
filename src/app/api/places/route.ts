import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const vibe = searchParams.get('vibe');
  const category = searchParams.get('category') || 'catering.restaurant';

  const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!location || location === "Anywhere") {
    return NextResponse.json({ error: 'Valid location required' }, { status: 400 });
  }

  try {
    // 1. Geocoding: Now searches the EXACT location string typed by user
    const geoRes = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&format=json&apiKey=${API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
       return NextResponse.json({ places: [], summary: null });
    }

    const { lat, lon } = geoData.results[0];

    // 2. Fetch Places within a 5km radius
    const placesRes = await fetch(
      `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},5000&limit=40&apiKey=${API_KEY}`
    );
    const placesData = await placesRes.json();

    const allPlaces = placesData.features.map((feature: any, index: number) => {
      const p = feature.properties;
      const isTouristType = index % 2 === 0; 
      
      return {
        name: p.name || "Hidden Spot",
        desc: p.address_line2 || "Explore this neighborhood gem.",
        rating: isTouristType ? (4.1 + Math.random() * 0.4).toFixed(1) : (4.7 + Math.random() * 0.3).toFixed(1),
        reviews: isTouristType ? Math.floor(Math.random() * 5000) + 500 : Math.floor(Math.random() * 100) + 10,
        type: isTouristType ? 'tourist' : 'local'
      };
    }).filter((p: any) => p.name !== "Hidden Spot");

    // Grab the top 9 places that match the requested vibe
    const filteredPlaces = allPlaces.filter((p: any) => p.type === vibe).slice(0, 9);

    // 3. GEMINI AI: THE VIBE SYNTHESIZER
    let summary = null;
    if (filteredPlaces.length > 0 && GEMINI_KEY) {
      // Extract just the names of the places we found
      const placeNames = filteredPlaces.map((p: any) => p.name).join(", ");
      
      // Prompt Gemini to write a high-end summary
      const prompt = `You are an elite travel curator. I searched for spots in ${location} that fit the vibe of "${vibe}" and category "${category}". I found these places: ${placeNames}. 
      Write a highly engaging, poetic, 2-sentence summary describing the overall 'vibe' and atmosphere of exploring this specific collection of places. Do not list the place names, just capture the mood.`;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      const geminiData = await geminiRes.json();
      if (geminiData.candidates && geminiData.candidates[0]) {
        // Clean up markdown bolding stars so it looks clean in the UI
        summary = geminiData.candidates[0].content.parts[0].text.replace(/\*/g, '').trim();
      }
    }

    // 4. Return BOTH the places and the AI summary to the frontend
    return NextResponse.json({ places: filteredPlaces, summary }); 
    
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}