import React from 'react';
import { Compass, Sparkles, Bookmark, MapPin, IndianRupee } from 'lucide-react';
import { formatINR } from '../utils/budgetEngine';

interface NavbarProps {
  currentBudget: number;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenDestinations: () => void;
  onOpenAiChat: () => void;
  onScrollToPlanner: () => void;
  onScrollToPossibilities: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBudget,
  savedCount,
  onOpenSaved,
  onOpenDestinations,
  onOpenAiChat,
  onScrollToPlanner,
  onScrollToPossibilities,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/85 border-b border-cyan-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onScrollToPlanner}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">
                PocketTrip <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                Budget First
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Your Budget. Your Journey. Our Plan.
            </p>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={onScrollToPlanner}
            className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Trip Planner
          </button>
          <button
            onClick={onScrollToPossibilities}
            className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>What Can I Get?</span>
            <span className="text-xs text-cyan-400 font-mono">({formatINR(currentBudget)})</span>
          </button>
          <button
            onClick={onOpenDestinations}
            className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explore Cities</span>
          </button>
        </nav>

        {/* Right CTA / Actions */}
        <div className="flex items-center gap-3">
          {/* Ask AI Trigger */}
          <button
            onClick={onOpenAiChat}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all cursor-pointer shadow-sm shadow-cyan-950"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ask PocketTrip AI</span>
          </button>

          {/* Saved Trips */}
          <button
            onClick={onOpenSaved}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Saved Trips"
            aria-label="Saved Trips"
          >
            <Bookmark className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse">
                {savedCount}
              </span>
            )}
          </button>

          {/* Current Budget Indicator button for mobile/desktop quick jump */}
          <button
            onClick={onScrollToPlanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>{currentBudget.toLocaleString('en-IN')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
