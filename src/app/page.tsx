"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shuffle, Navigation, Repeat, X, Code2, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// VISION DATA
const CATEGORIES = [
  { label: "dining & food", value: "catering.restaurant" },
  { label: "curated cafes", value: "catering.cafe" },
  { label: "retail & shops", value: "commercial.shopping_mall" },
  { label: "culture & sights", value: "tourism.sights" }
];

// PLANNER DATA
const DURATIONS = ["1-day", "3-day", "5-day", "1-week"];
const PREFERENCES = ["food & dining", "culture & arts", "hidden gems", "nature & views", "everything"];

const Particles = ({ isCalm }: { isCalm: boolean }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      drift: Math.random() * 50 - 25,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: isCalm ? "rgba(34, 211, 238, 0.4)" : "rgba(79, 70, 229, 0.3)",
            boxShadow: isCalm 
              ? "0 0 15px 2px rgba(34, 211, 238, 0.3)" 
              : "0 0 15px 2px rgba(79, 70, 229, 0.2)",
          }}
          animate={{ y: [0, -150, 0], x: [0, p.drift, 0], opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  
  // APP MODE
  const [mode, setMode] = useState<"vision" | "planner">("vision");
  
  // SHARED STATE
  const [isCalm, setIsCalm] = useState(false);
  const [location, setLocation] = useState("");
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // VISION SPECIFIC STATE
  const [catIndex, setCatIndex] = useState(0);
  
  // PLANNER SPECIFIC STATE
  const [durIndex, setDurIndex] = useState(1);
  const [prefIndex, setPrefIndex] = useState(0);

  // --- NEW: TEAM OVERLAY STATE ---
  const [showTeam, setShowTeam] = useState(false);
  const [activeDev, setActiveDev] = useState<"usnish" | "debasmita" | null>(null);

  const theme = {
    bg: isCalm 
      ? "linear-gradient(120deg, #020617, #0f172a, #1e1b4b, #0f172a)" 
      : "linear-gradient(120deg, #ffffff, #f8fafc, #e0e7ff, #f8fafc)",
    text: isCalm ? "text-slate-100" : "text-slate-900",
    accent: isCalm ? "text-cyan-400" : "text-indigo-600",
    button: isCalm 
      ? "bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_40px_-10px_rgba(6,182,212,0.6)]" 
      : "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_40px_-10px_rgba(79,70,229,0.6)]",
    border: isCalm ? "border-slate-700" : "border-slate-300",
  };

  const handleRoulette = () => {
    if (isRouletteSpinning) return;
    setIsRouletteSpinning(true);
    let spins = 0;
    const cities = ["Mumbai", "Bengaluru", "Goa", "Jaipur", "Delhi", "Kolkata", "Tokyo", "Kyoto", "London", "Paris", "New York", "Cape Town"];
    
    const interval = setInterval(() => {
      setIsCalm(Math.random() > 0.5);
      setLocation(cities[Math.floor(Math.random() * cities.length)]);
      
      if (mode === "vision") {
        setCatIndex(Math.floor(Math.random() * CATEGORIES.length));
      } else {
        setDurIndex(Math.floor(Math.random() * DURATIONS.length));
        setPrefIndex(Math.floor(Math.random() * PREFERENCES.length));
      }
      
      spins++;
      if (spins > 10) {
        clearInterval(interval);
        setIsRouletteSpinning(false);
      }
    }, 100);
  };

  const handleLocateMe = async () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
            if (API_KEY) {
              const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${API_KEY}`);
              const data = await res.json();
              setLocation(data.features[0].properties.city || "Current Location");
            } else setLocation("Current Location");
          } catch { setLocation("Current Location"); } 
          finally { setIsLocating(false); }
        },
        () => setIsLocating(false)
      );
    } else setIsLocating(false);
  };

  const handleSearch = () => {
    const searchLoc = location.trim() === "" ? "Kolkata" : location;
    if (mode === "vision") {
      router.push(`/results?location=${encodeURIComponent(searchLoc)}&vibe=${isCalm ? "local" : "tourist"}&category=${CATEGORIES[catIndex].value}`);
    } else {
      router.push(`/planner?location=${encodeURIComponent(searchLoc)}&vibe=${isCalm ? "local" : "tourist"}&duration=${DURATIONS[durIndex]}&pref=${PREFERENCES[prefIndex]}`);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-bg-pan { background-size: 200% 200%; animation: bg-pan 12s ease-in-out infinite; }
        .animate-marquee { display: inline-block; animation: marquee 40s linear infinite; }
      `}} />

      <div 
        className={`min-h-screen w-full relative flex flex-col justify-center px-6 md:px-12 transition-colors duration-1000 animate-bg-pan ${theme.text}`}
        style={{ backgroundImage: theme.bg }}
      >
        <Particles isCalm={isCalm} />

        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-0 left-0 w-full px-6 py-6 flex justify-between items-center z-50"
        >
          <button 
            onClick={() => setMode(mode === "vision" ? "planner" : "vision")}
            className="flex items-center gap-3 group outline-none"
            title="Switch App Mode"
          >
            <span className={`text-sm font-black tracking-widest uppercase italic transition-colors duration-300 group-hover:${theme.accent}`}>
              {mode === "vision" ? "VIBEVISION" : "VIBEPLANNER"}
            </span>
            <div className={`flex items-center gap-1 text-[10px] font-bold tracking-widest opacity-30 group-hover:opacity-100 group-hover:${theme.accent} transition-all duration-300 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full`}>
              <Repeat size={10} /> SWITCH
            </div>
          </button>
          
          {/* THE NEW DUO CODERS BUTTON */}
          <button 
            onClick={() => setShowTeam(true)}
            className={`text-[11px] font-black opacity-50 hover:opacity-100 hover:${theme.accent} tracking-widest uppercase transition-all duration-300 flex items-center gap-2`}
          >
            <Terminal size={14} /> DUO CODERS
          </button>
        </motion.nav>

        <div className="max-w-5xl w-full mt-10 mx-auto z-10 relative min-h-[40vh] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            
            {/* VIBEVISION MODE */}
            {mode === "vision" && (
              <motion.div 
                key="vision"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-y-4 sm:gap-y-6 text-[11vw] sm:text-7xl md:text-[85px] lg:text-[100px] font-bold tracking-tighter leading-none select-none"
              >
                <div className="flex flex-wrap items-center gap-x-3">
                  <span className="pointer-events-none">Find</span>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setCatIndex((prev) => (prev + 1) % CATEGORIES.length); }}
                    className={`appearance-none bg-transparent border-b-4 ${theme.border} ${theme.accent} pb-1 px-1 outline-none touch-manipulation active:opacity-50 transition-all duration-300 hover:scale-[1.02]`}
                  >
                    {CATEGORIES[catIndex].label}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3">
                  <span className="pointer-events-none">that are</span>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setIsCalm((prev) => !prev); }}
                    className={`appearance-none bg-transparent border-b-4 border-transparent ${theme.accent} pb-1 px-1 outline-none touch-manipulation active:opacity-50 transition-all duration-300 hover:scale-[1.02]`}
                  >
                    {isCalm ? "quietly local" : "brightly busy"}
                  </button>
                  <span className="pointer-events-none">in</span>
                </div>
              </motion.div>
            )}

            {/* VIBEPLANNER MODE */}
            {mode === "planner" && (
              <motion.div 
                key="planner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-y-4 sm:gap-y-6 text-[10vw] sm:text-6xl md:text-[75px] lg:text-[85px] font-bold tracking-tighter leading-none select-none"
              >
                <div className="flex flex-wrap items-center gap-x-3">
                  <span className="pointer-events-none">Plan a</span>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setDurIndex((prev) => (prev + 1) % DURATIONS.length); }}
                    className={`appearance-none bg-transparent border-b-4 ${theme.border} ${theme.accent} pb-1 px-1 outline-none touch-manipulation active:opacity-50 transition-all duration-300 hover:scale-[1.02]`}
                  >
                    {DURATIONS[durIndex]}
                  </button>
                  <span className="pointer-events-none">escape to</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className={`flex flex-col gap-y-4 sm:gap-y-6 font-bold tracking-tighter leading-none mt-4 sm:mt-6 ${mode === 'vision' ? 'text-[11vw] sm:text-7xl md:text-[85px] lg:text-[100px]' : 'text-[10vw] sm:text-6xl md:text-[75px] lg:text-[85px]'}`}>
            <div className="flex flex-wrap items-center gap-x-3">
              <div className="relative inline-flex items-baseline max-w-full shrink group">
                <input
                  className={`bg-transparent border-b-4 ${theme.border} outline-none w-[60vw] sm:w-[400px] md:w-[500px] pb-1 pr-12 placeholder:opacity-30 placeholder:italic placeholder:text-slate-400 touch-manipulation transition-colors duration-500 ${theme.accent}`}
                  placeholder="Anywhere"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                />
                <button 
                  onClick={handleLocateMe}
                  className={`absolute right-4 bottom-4 md:bottom-6 opacity-30 hover:opacity-100 transition-opacity ${theme.accent} ${isLocating ? 'animate-pulse' : ''}`}
                  title="Locate Me"
                >
                  <Navigation size={32} />
                </button>
                {mode === "vision" && <span className="pointer-events-none ml-2">.</span>}
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {mode === "planner" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-y-4 sm:gap-y-6 text-[10vw] sm:text-6xl md:text-[75px] lg:text-[85px] font-bold tracking-tighter leading-none select-none mt-4 sm:mt-6"
              >
                <div className="flex flex-wrap items-center gap-x-3">
                  <span className="pointer-events-none">craving</span>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setPrefIndex((prev) => (prev + 1) % PREFERENCES.length); }}
                    className={`appearance-none bg-transparent border-b-4 ${theme.border} ${theme.accent} pb-1 px-1 outline-none touch-manipulation active:opacity-50 transition-all duration-300 hover:scale-[1.02]`}
                  >
                    {PREFERENCES[prefIndex]}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3">
                  <span className="pointer-events-none">that feels</span>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setIsCalm((prev) => !prev); }}
                    className={`appearance-none bg-transparent border-b-4 border-transparent ${theme.accent} pb-1 px-1 outline-none touch-manipulation active:opacity-50 transition-all duration-300 hover:scale-[1.02]`}
                  >
                    {isCalm ? "quietly local" : "brightly busy"}
                  </button>
                  <span className="pointer-events-none">.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-12 sm:mt-20 relative z-30 flex flex-wrap items-center gap-4"
          >
            <button 
              type="button"
              onClick={handleSearch}
              className={`${theme.button} text-white px-10 py-5 rounded-2xl text-xl font-black flex items-center justify-center gap-4 w-full sm:w-fit active:scale-95 transition-all duration-300 relative z-[100]`}
            >
              {mode === "vision" ? "Explore Universe" : "Generate Itinerary"}
              <ArrowRight size={24} />
            </button>

            <button 
              type="button"
              onClick={handleRoulette}
              className={`p-5 rounded-2xl border-2 ${theme.border} backdrop-blur-md flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all duration-300 relative z-[100] ${isRouletteSpinning ? 'animate-spin' : ''}`}
              title="Surprise Me"
            >
              <Shuffle size={24} className={theme.accent} />
            </button>
          </motion.div>
        </div>

        <div className="fixed bottom-0 left-0 w-full overflow-hidden py-3 pointer-events-none z-40 bg-black/5 dark:bg-white/5 backdrop-blur-md border-t border-black/10 dark:border-white/10">
          <div className="whitespace-nowrap flex text-xs font-bold uppercase tracking-widest opacity-40">
            <div className="animate-marquee flex shrink-0">
              <span className="mx-8">→ 3-day food trip in Tokyo</span>
              <span className="mx-8">→ Curated cafes in Bengaluru</span>
              <span className="mx-8">→ 1-week nature escape in Goa</span>
              <span className="mx-8">→ Quiet retail in London</span>
              <span className="mx-8">→ 5-day culture tour in Jaipur</span>
              <span className="mx-8">→ Street food in Mumbai</span>
            </div>
            <div className="animate-marquee flex shrink-0" aria-hidden="true">
              <span className="mx-8">→ 3-day food trip in Tokyo</span>
              <span className="mx-8">→ Curated cafes in Bengaluru</span>
              <span className="mx-8">→ 1-week nature escape in Goa</span>
              <span className="mx-8">→ Quiet retail in London</span>
              <span className="mx-8">→ 5-day culture tour in Jaipur</span>
              <span className="mx-8">→ Street food in Mumbai</span>
            </div>
          </div>
        </div>

        {/* --- THE CINEMATIC TEAM OVERLAY --- */}
        <AnimatePresence>
          {showTeam && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617]/90 backdrop-blur-2xl text-white p-6"
            >
              <button 
                onClick={() => { setShowTeam(false); setActiveDev(null); }}
                className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="max-w-4xl w-full">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-16"
                >
                  <Code2 className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
                  <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2">Developed By</h2>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter">DUO CODERS</h1>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* USNISH CARD */}
                  <motion.div 
                    onClick={() => setActiveDev(activeDev === "usnish" ? null : "usnish")}
                    className={`p-8 rounded-3xl border cursor-pointer transition-all duration-500 ${activeDev === "usnish" ? 'bg-cyan-900/20 border-cyan-500/50 scale-105' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Usnish Banerjee</h3>
                    
                    <AnimatePresence>
                      {activeDev === "usnish" && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-6 text-lg leading-relaxed opacity-90 italic">
                            "Architect of logic. As a 3rd-year BCA student at Techno Main Salt Lake, Usnish translates raw caffeine and complex syntax into scalable digital realities. Where others see rigid code, he sees an infinite canvas."
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* DEBASMITA CARD */}
                  <motion.div 
                    onClick={() => setActiveDev(activeDev === "debasmita" ? null : "debasmita")}
                    className={`p-8 rounded-3xl border cursor-pointer transition-all duration-500 ${activeDev === "debasmita" ? 'bg-indigo-900/20 border-indigo-500/50 scale-105' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Debasmita Banik</h3>
                    
                    <AnimatePresence>
                      {activeDev === "debasmita" && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-6 text-lg leading-relaxed opacity-90 italic">
                            "Engineer of experiences. Pursuing her 3rd-year BCA at MAKAUT, Debasmita bridges the gap between machine efficiency and human intuition. She writes the algorithms that make the digital world breathe."
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}