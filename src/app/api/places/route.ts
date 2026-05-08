import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const vibe = searchParams.get('vibe');
  const category = searchParams.get('category') || 'catering.restaurant';

  const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

  if (!location || location === "Anywhere") return NextResponse.json({ error: 'Valid location required' }, { status: 400 });

  try {
    // 1. Geocoding: Now searches the EXACT location string typed by user
    const geoRes = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&format=json&apiKey=${API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
       return NextResponse.json({ places: [] });
    }

    const { lat, lon } = geoData.results[0];

    // 2. Fetch Places within a 5km radius (wider for smaller areas like Habra)
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

    const filteredPlaces = allPlaces.filter((p: any) => p.type === vibe);

    return NextResponse.json({ places: filteredPlaces.slice(0, 9) }); 
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}