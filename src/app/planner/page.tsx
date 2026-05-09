// src/app/planner/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, MapPin, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";

interface Activity {
  time: string;
  title: string;
  desc: string;
}

interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

interface Itinerary {
  title: string;
  summary: string;
  days: DayPlan[];
}

function PlannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const location = searchParams.get("location") || "Anywhere";
  const vibe = searchParams.get("vibe") || "local";
  const duration = searchParams.get("duration") || "3-day";
  const pref = searchParams.get("pref") || "everything";
  
  const [data, setData] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({ location, vibe, duration, pref });
        const res = await fetch(`/api/planner?${query.toString()}`);
        const result = await res.json();
        
        if (result.error) throw new Error(result.error);
        setData(result.itinerary);
      } catch (err: any) {
        setError(err.message || "Failed to generate itinerary.");
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [location, vibe, duration, pref]);

  const isLocal = vibe === "local";
  
  const theme = {
    bg: isLocal 
      ? "linear-gradient(120deg, #020617, #0f172a, #1e1b4b, #0f172a)" 
      : "linear-gradient(120deg, #ffffff, #f8fafc, #e0e7ff, #f8fafc)",
    text: isLocal ? "text-slate-100" : "text-slate-900",
    accent: isLocal ? "text-cyan-400" : "text-indigo-600",
    border: isLocal ? "border-cyan-500/30" : "border-indigo-600/30",
    glassBg: isLocal ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10",
    skeletonPulse: isLocal ? "bg-white/10" : "bg-black/10",
  };

  return (
    <main 
      className={`min-h-screen w-full relative overflow-x-hidden overflow-y-auto transition-colors duration-1000 ${theme.text}`} 
      style={{ backgroundImage: theme.bg }}
    >
      <div className="relative z-10 max-w-4xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6 mb-12 pt-8">
          <button 
            onClick={() => router.push("/")}
            className={`p-3 rounded-full ${theme.glassBg} hover:opacity-70 transition-colors backdrop-blur-md`}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase opacity-60 mb-1">
              <Calendar size={14} className={theme.accent} />
              {duration} • {vibe} • {pref}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              {location}
            </h1>
          </div>
        </motion.div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className={`w-16 h-16 animate-spin mb-6 ${theme.accent}`} />
            <h3 className="text-2xl font-bold mb-2">Curating your experience...</h3>
            <p className="opacity-60 max-w-md">Gemini is currently writing a bespoke {duration} itinerary for {location}. This takes about 5-10 seconds.</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className={`text-center py-20 border border-red-500/20 bg-red-500/5 rounded-3xl backdrop-blur-md`}>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-red-500 mb-2">Planning Failed</p>
            <p className="opacity-70 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className={`px-6 py-2 rounded-full font-bold ${theme.skeletonPulse} hover:opacity-70`}>Try Again</button>
          </div>
        )}

        {/* ITINERARY CONTENT */}
        {!loading && !error && data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            
            {/* HERO SUMMARY CARD */}
            <div className={`mb-12 p-8 md:p-10 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden ${theme.glassBg}`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${isLocal ? 'bg-cyan-500' : 'bg-indigo-500'} opacity-50`} />
              <h2 className={`text-3xl md:text-4xl font-black mb-4 ${theme.accent}`}>{data.title}</h2>
              <p className="text-lg md:text-xl font-medium leading-relaxed italic opacity-90">"{data.summary}"</p>
            </div>

            {/* DAY BY DAY TIMELINE */}
            <div className="space-y-12">
              {data.days.map((day, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="relative pl-4 md:pl-8 border-l-2 border-black/10 dark:border-white/10"
                >
                  {/* Day Badge */}
                  <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${isLocal ? 'bg-cyan-500 text-slate-900' : 'bg-indigo-600 text-white'}`}>
                    {day.day}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-6 pt-1 tracking-tight">Day {day.day}: <span className="opacity-60 font-medium">{day.theme}</span></h3>
                  
                  <div className="grid gap-4">
                    {day.activities.map((act, j) => (
                      <div key={j} className={`p-6 rounded-2xl backdrop-blur-md ${theme.glassBg} hover:scale-[1.01] transition-transform`}>
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 p-2 rounded-full ${theme.skeletonPulse}`}>
                            <Clock size={16} className={theme.accent} />
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">{act.time}</div>
                            <h4 className="text-lg font-bold mb-2">{act.title}</h4>
                            <p className="opacity-80 leading-relaxed text-sm md:text-base">{act.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </main>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <PlannerContent />
    </Suspense>
  );
}