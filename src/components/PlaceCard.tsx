"use client";

import { motion } from "framer-motion";
import { MapPin, Star, Users, ExternalLink } from "lucide-react";

interface PlaceCardProps {
  name: string;
  description: string;
  rating: number | string;
  reviews: number;
  vibe: "local" | "tourist";
  delay: number;
}

export default function PlaceCard({ name, description, rating, reviews, vibe, delay }: PlaceCardProps) {
  const isLocal = vibe === "local";
  
  const theme = {
    cardBg: isLocal ? "bg-[#1E293B] border-white/5 shadow-2xl" : "bg-white border-black/5 shadow-lg",
    text: isLocal ? "text-slate-100" : "text-slate-900",
    sub: isLocal ? "text-slate-400" : "text-slate-500",
    accent: isLocal ? "text-cyan-400" : "text-indigo-600",
  };

  // Function to open Google Maps
  const handleNavigate = () => {
    const query = encodeURIComponent(`${name} ${description}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5 }}
      className={`group p-6 rounded-3xl border transition-all ${theme.cardBg} ${theme.text}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold tracking-tight leading-tight pr-4">{name}</h3>
        <div className={`flex items-center gap-1 font-mono text-sm font-bold ${theme.accent}`}>
          <Star size={14} fill="currentColor" />
          {rating}
        </div>
      </div>
      
      <p className={`text-sm mb-8 line-clamp-2 leading-relaxed opacity-70 ${theme.sub}`}>
        {description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${theme.sub}`}>
          <Users size={12} />
          {reviews.toLocaleString()} reviews
        </div>
        
        {/* CLICKABLE NAVIGATION ICON */}
        <button 
          onClick={handleNavigate}
          className={`flex items-center gap-2 text-xs font-bold transition-all hover:scale-110 ${theme.accent}`}
          title="Open in Google Maps"
        >
          <span className="hidden sm:inline">Directions</span>
          <div className={`p-2 rounded-full ${isLocal ? 'bg-cyan-500/10' : 'bg-indigo-600/10'}`}>
            <MapPin size={16} strokeWidth={3} />
          </div>
        </button>
      </div>
    </motion.div>
  );
}