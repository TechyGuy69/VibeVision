"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Map, AlertCircle, Loader2 } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null); // Catching the Gemini AI Summary

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      setSummary(null);
      
      try {
        const query = new URLSearchParams({ location, vibe, category });
        const res = await fetch(`/api/places?${query.toString()}`);
        
        if (!res.ok) throw new Error("Failed to fetch vibes from the server.");
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        setPlaces(data.places || []);
        setSummary(data.summary || null); // Storing the Gemini AI Summary
        
      } catch (err: any) {
        console.error("API Error:", err);
        setError("We couldn't connect to the vibe satellite. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [location, vibe, category]);

  const isLocal = vibe === "local";
  
  // Premium Gradients and Orbs
  const theme = {
    bg: isLocal 
      ? "linear-gradient(120deg, #020617, #0f172a, #1e1b4b, #0f172a)" 
      : "linear-gradient(120deg, #ffffff, #f8fafc, #e0e7ff, #f8fafc)",
    text: isLocal ? "text-slate-100" : "text-slate-900",
    accent: isLocal ? "text-cyan-400" : "text-indigo-600",
    border: isLocal ? "border-cyan-500/30" : "border-indigo-600/30",
    orb1: isLocal ? "bg-cyan-900/20" : "bg-indigo-300/30",
    orb2: isLocal ? "bg-indigo-900/20" : "bg-cyan-300/30",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes float-slow { 0%, 100% { transform: translate(0px, 0px) scale(1); } 50% { transform: translate(30px, -50px) scale(1.05); } }
        .animate-bg-pan { background-size: 200% 200%; animation: bg-pan 12s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
      `}} />

      <main 
        className={`min-h-screen w-full relative overflow-x-hidden overflow-y-auto transition-colors duration-1000 animate-bg-pan ${theme.text}`} 
        style={{ backgroundImage: theme.bg }}
      >
        {/* BACKGROUND ORBS */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className={`absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] animate-float-slow ${theme.orb1}`} />
          <div className={`absolute top-[40%] -right-[20%] w-[80vw] h-[80vw] rounded-full blur-[150px] animate-float-slow ${theme.orb2}`} style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
          
          {/* HEADER */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-8"
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push("/")}
                className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase opacity-60 mb-1">
                  {isLocal ? <Sparkles size={14} className={theme.accent} /> : <Map size={14} className={theme.accent} />}
                  {isLocal ? "Local Secrets" : "Tourist Pulse"}
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                  {location}
                </h1>
              </div>
            </div>
            
            {!loading && !error && places.length > 0 && (
              <div className={`px-6 py-2 rounded-full border backdrop-blur-md text-sm font-bold ${theme.border} ${theme.accent}`}>
                {places.length} Spots Found
              </div>
            )}
          </motion.div>

          {/* THE NEW AI VIBE SUMMARY CARD */}
          {!loading && !error && summary && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`mb-12 p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${theme.border} bg-black/5 dark:bg-white/5 relative overflow-hidden shadow-2xl`}
            >
              {/* Subtle animated gradient glow behind the text */}
              <div className={`absolute top-0 left-0 w-full h-1 ${isLocal ? 'bg-cyan-500' : 'bg-indigo-500'} opacity-50`} />
              
              <div className="flex items-start gap-4">
                <Sparkles className={`w-8 h-8 shrink-0 mt-1 ${theme.accent}`} />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2">
                    Vibe Check
                  </h3>
                  <p className="text-lg md:text-2xl font-medium leading-relaxed italic opacity-90">
                    "{summary}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ERROR STATE */}
          {error ? (
             <div className="text-center py-20 border border-red-500/20 bg-red-500/5 rounded-3xl backdrop-blur-md">
               <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
               <p className="text-xl font-bold text-red-500 mb-2">Signal Lost</p>
               <p className="opacity-70 mb-6">{error}</p>
               <button onClick={() => window.location.reload()} className={`px-6 py-2 rounded-full font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors`}>
                 Retry Scan
               </button>
             </div>
          ) 
          
          /* SKELETON LOADING GRID */
          : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-md animate-pulse h-64 flex flex-col justify-between">
                  <div>
                    <div className="w-3/4 h-8 bg-black/10 dark:bg-white/10 rounded-lg mb-4"></div>
                    <div className="w-full h-4 bg-black/10 dark:bg-white/10 rounded-md mb-2"></div>
                    <div className="w-5/6 h-4 bg-black/10 dark:bg-white/10 rounded-md"></div>
                  </div>
                  <div className="w-1/2 h-6 bg-black/10 dark:bg-white/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) 
          
          /* EMPTY STATE */
          : places.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-sm">
              <p className="text-xl font-bold opacity-60">No {vibe} spots found in this area.</p>
              <button 
                onClick={() => router.push("/")}
                className={`mt-6 text-sm font-bold uppercase tracking-widest ${theme.accent} hover:opacity-70 transition-opacity`}
              >
                Change Parameters →
              </button>
            </div>
          ) 
          
          /* LOADED DATA GRID */
          : (
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
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
        <div className="animate-pulse font-bold tracking-widest uppercase text-sm">Initializing...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}