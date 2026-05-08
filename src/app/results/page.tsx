"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, Map } from "lucide-react";
import PlaceCard from "@/components/PlaceCard";

interface Place {
  name: string;
  desc: string;
  rating: number;
  reviews: number;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const location = searchParams.get("location") || "Kolkata";
  const vibe = (searchParams.get("vibe") as "local" | "tourist") || "local";
  const category = searchParams.get("category") || "catering.restaurant";
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          location: location,
          vibe: vibe,
          category: category
        });
        const res = await fetch(`/api/places?${query.toString()}`);
        const data = await res.json();
        setPlaces(data.places || []);
      } catch (error) {
        console.error("API Error:", error);
      }
      setLoading(false);
    };

    fetchPlaces();
  }, [location, vibe, category]);

  const isLocal = vibe === "local";
  const theme = {
    bg: isLocal ? "bg-[#0F172A]" : "bg-[#F8FAFC]",
    text: isLocal ? "text-white" : "text-gray-900",
    accent: isLocal ? "text-blue-400" : "text-amber-500",
  };

  return (
    <main className={`min-h-screen p-6 md:p-12 transition-colors duration-700 ${theme.bg} ${theme.text}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16"
        >
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push("/")}
              className="p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-sm font-mono tracking-widest uppercase opacity-60 mb-1">
                {isLocal ? <Sparkles size={14} /> : <Map size={14} />}
                {isLocal ? "Local Secrets" : "Tourist Pulse"}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                {location}
              </h1>
            </div>
          </div>
          
          <div className={`px-6 py-2 rounded-full border text-sm font-bold ${isLocal ? 'border-blue-400/30 text-blue-400' : 'border-amber-500/30 text-amber-500'}`}>
            {places.length} Spots Found
          </div>
        </motion.div>

        {/* States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-mono uppercase tracking-widest text-xs">Decoding Area Signal...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-gray-500/20 rounded-3xl">
            <p className="text-xl font-medium opacity-50">No {vibe} spots found in this area.</p>
            <button 
              onClick={() => router.push("/")}
              className="mt-4 text-sm underline underline-offset-4 hover:opacity-100 opacity-60"
            >
              Try another search
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {places.map((place, index) => (
              <PlaceCard 
                key={`${place.name}-${index}`} 
                name={place.name}
                description={place.desc}
                rating={place.rating}
                reviews={place.reviews}
                vibe={vibe}
                delay={index}
              />
            ))}
          </motion.div>
        )}

      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <Loader2 className="animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}