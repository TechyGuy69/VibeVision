"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { label: "dining & food", value: "catering.restaurant" },
  { label: "curated cafes", value: "catering.cafe" },
  { label: "retail & shops", value: "commercial.shopping_mall" },
  { label: "culture & sights", value: "tourism.sights" }
];

export default function LandingPage() {
  const router = useRouter();
  const [isCalm, setIsCalm] = useState(false);
  const [catIndex, setCatIndex] = useState(0);
  const [location, setLocation] = useState("");

  const currentCategory = CATEGORIES[catIndex];

  const theme = {
    bg: isCalm ? "#020617" : "#ffffff",
    text: isCalm ? "text-slate-100" : "text-slate-900",
    accent: isCalm ? "text-cyan-500" : "text-indigo-600",
    button: isCalm ? "bg-cyan-500" : "bg-indigo-600",
  };

  const handleSearch = () => {
    const searchLoc = location.trim() === "" ? "Kolkata" : location;
    router.push(`/results?location=${encodeURIComponent(searchLoc)}&vibe=${isCalm ? "local" : "tourist"}&category=${currentCategory.value}`);
  };

  return (
    <div 
      className={`min-h-screen w-full flex flex-col justify-center px-6 md:px-12 transition-colors duration-500 ${theme.text}`}
      style={{ backgroundColor: theme.bg }}
    >
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full px-6 py-6 flex justify-between items-center pointer-events-none">
        <span className="text-sm font-black tracking-widest uppercase italic pointer-events-auto">VIBEVISION</span>
        <span className="text-[10px] font-bold opacity-30 tracking-widest pointer-events-auto">BETA V1.0</span>
      </nav>

      <div className="max-w-5xl w-full mt-10 mx-auto z-10">
        
        {/* THE PREMIUM SENTENCE */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-4 sm:gap-y-6 text-[11vw] sm:text-7xl md:text-[90px] font-bold tracking-tighter leading-none select-none">
          
          <span className="pointer-events-none">Find</span>
          
          {/* CATEGORY CYCLE BUTTON */}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setCatIndex((prev) => (prev + 1) % CATEGORIES.length);
            }}
            className={`appearance-none bg-transparent border-b-4 border-slate-300 ${theme.accent} pb-1 px-1 outline-none touch-manipulation active:opacity-50 transition-opacity`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {currentCategory.label}
          </button>
          
          <span className="pointer-events-none">that are</span>
          
          {/* VIBE CYCLE BUTTON */}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsCalm((prev) => !prev);
            }}
            className={`appearance-none bg-transparent border-b-4 border-transparent ${theme.accent} pb-1 px-1 outline-none touch-manipulation active:opacity-50 transition-opacity`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {isCalm ? "quietly local" : "brightly busy"}
          </button>
          
          <span className="pointer-events-none">in</span>
          
          {/* LOCATION INPUT & PERIOD LOCKED TOGETHER */}
          <div className="inline-flex items-baseline max-w-full shrink">
            <input
              className={`bg-transparent border-b-4 border-slate-300 outline-none w-[50vw] sm:w-[350px] md:w-[400px] text-[11vw] sm:text-7xl md:text-[90px] font-bold tracking-tighter pb-1 placeholder:opacity-30 placeholder:italic placeholder:text-slate-400 touch-manipulation ${theme.accent}`}
              placeholder="Anywhere"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
            <span className="pointer-events-none ml-2">.</span>
          </div>
        </div>

        {/* EXPLORE BUTTON */}
        <div className="mt-16 sm:mt-24">
          <button 
            type="button"
            onClick={handleSearch}
            className={`${theme.button} text-white px-10 py-5 rounded-2xl text-xl font-black flex items-center justify-center gap-4 w-full sm:w-fit active:scale-95 shadow-xl transition-transform`}
          >
            Explore Universe
            <ArrowRight size={24} />
          </button>
        </div>

      </div>
    </div>
  );
}