import React, { useState } from 'react';
import { UserPreferences, TravelStyle, Interest } from '../types';
import { POPULAR_ORIGINS, ALL_INTERESTS } from '../data/destinations';
import { formatINR } from '../utils/budgetEngine';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  Minus, 
  Sparkles, 
  Compass, 
  IndianRupee, 
  Sliders, 
  Check 
} from 'lucide-react';

interface HeroPlannerProps {
  prefs: UserPreferences;
  onUpdatePrefs: (newPrefs: UserPreferences) => void;
  onSearchTrips: () => void;
}

export const HeroPlanner: React.FC<HeroPlannerProps> = ({
  prefs,
  onUpdatePrefs,
  onSearchTrips,
}) => {
  const [budgetInput, setBudgetInput] = useState<string>(prefs.budget.toString());
  const [originSearchOpen, setOriginSearchOpen] = useState<boolean>(false);

  const travelStyles: TravelStyle[] = [
    'Budget',
    'Comfortable',
    'Backpacker',
    'Family',
    'Couple',
    'Adventure',
    'Luxury',
  ];

  const quickBudgetSuggestions = [5000, 10000, 15000, 25000, 50000, 100000];

  const handleBudgetChange = (valStr: string) => {
    // Clean string to digits only
    const clean = valStr.replace(/[^0-9]/g, '');
    setBudgetInput(clean);
    const parsed = parseInt(clean, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdatePrefs({ ...prefs, budget: parsed });
    }
  };

  const handleSelectQuickBudget = (amount: number) => {
    setBudgetInput(amount.toString());
    onUpdatePrefs({ ...prefs, budget: amount });
  };

  const toggleInterest = (interest: Interest) => {
    let updated: Interest[];
    if (prefs.interests.includes(interest)) {
      updated = prefs.interests.filter((i) => i !== interest);
    } else {
      updated = [...prefs.interests, interest];
    }
    onUpdatePrefs({ ...prefs, interests: updated });
  };

  const handleTravellersChange = (delta: number) => {
    const updated = Math.min(12, Math.max(1, prefs.travellers + delta));
    onUpdatePrefs({ ...prefs, travellers: updated });
  };

  const handleDaysChange = (val: number) => {
    const updated = Math.min(30, Math.max(1, val));
    onUpdatePrefs({ ...prefs, days: updated });
  };

  return (
    <section className="relative pt-10 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-teal-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Title & Subheading */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-5 shadow-lg shadow-cyan-950">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>PocketTrip AI · Budget-First Revolution</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Where can your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">budget</span> take you?
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal mt-4 max-w-3xl mx-auto leading-relaxed">
            Enter your budget. We&apos;ll find the destination, stay, food, transport and experiences that fit it.
          </p>
        </div>

        {/* Central Large Planner Card */}
        <div className="relative bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* INPUT 1: STARTING FROM */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Starting From</span>
                <span className="text-cyan-400 text-[10px] lowercase">origin city</span>
              </label>

              <div className="relative">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={prefs.origin}
                  onChange={(e) => onUpdatePrefs({ ...prefs, origin: e.target.value })}
                  onFocus={() => setOriginSearchOpen(true)}
                  placeholder="e.g. Madurai, Chennai, Bengaluru..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-sm focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>

              {/* Quick Origin Suggestions Dropdown */}
              {originSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-slate-950 border border-slate-800 rounded-xl p-2 shadow-2xl max-h-48 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-500 px-2 py-1 uppercase">Popular Origins</div>
                  <div className="grid grid-cols-2 gap-1">
                    {POPULAR_ORIGINS.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          onUpdatePrefs({ ...prefs, origin: city });
                          setOriginSearchOpen(false);
                        }}
                        className="text-left text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* INPUT 2: MY BUDGET (Free input, any amount) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>My Budget</span>
                <span className="text-cyan-400 text-[10px] font-mono">
                  {formatINR(prefs.budget)}
                </span>
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-cyan-400 text-base">
                  ₹
                </span>
                <input
                  type="text"
                  value={budgetInput}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  placeholder="Enter ANY amount..."
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-base focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>

              {/* Quick Preset Buttons (Non-restricting, helpful shortcuts) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {quickBudgetSuggestions.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectQuickBudget(amt)}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      prefs.budget === amt
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {formatINR(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT 3: TRAVELLERS */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Travellers
              </label>

              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleTravellersChange(-1)}
                  disabled={prefs.travellers <= 1}
                  className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Decrease travellers"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-base font-extrabold text-white font-mono">
                    {prefs.travellers}
                  </span>
                  <span className="text-xs text-slate-400">
                    {prefs.travellers === 1 ? 'Person' : 'People'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleTravellersChange(1)}
                  disabled={prefs.travellers >= 12}
                  className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Increase travellers"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* INPUT 4: NUMBER OF DAYS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Number of Days
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {prefs.days} {prefs.days === 1 ? 'Day' : 'Days'} ({Math.max(1, prefs.days - 1)} Nights)
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-inner">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={prefs.days}
                  onChange={(e) => handleDaysChange(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1 day</span>
                  <span>Weekend (3d)</span>
                  <span>1 week</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECOND ROW: TRAVEL DATE & FLEXIBLE DATES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-4 border-t border-slate-800/80">
            {/* Travel Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Travel Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={prefs.travelDate}
                  onChange={(e) => onUpdatePrefs({ ...prefs, travelDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Flexible Dates Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">Flexible Dates</div>
                <div className="text-[11px] text-slate-400">Find cheaper seasonal weekend or weekday fares</div>
              </div>
              <button
                type="button"
                onClick={() => onUpdatePrefs({ ...prefs, isFlexible: !prefs.isFlexible })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.isFlexible ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                    prefs.isFlexible ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* THIRD ROW: TRAVEL STYLE */}
          <div className="mb-6 pt-4 border-t border-slate-800/80">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Travel Style
            </label>
            <div className="flex flex-wrap gap-2">
              {travelStyles.map((style) => {
                const isSelected = prefs.travelStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onUpdatePrefs({ ...prefs, travelStyle: style })}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FOURTH ROW: INTERESTS */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Interests & Themes
              </label>
              <span className="text-[11px] text-cyan-400">
                {prefs.interests.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ALL_INTERESTS.map((interest) => {
                const isSelected = prefs.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRIMARY ACTION BUTTON: 🔍 FIND MY TRIP */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Calculates real estimates from {prefs.origin} within {formatINR(prefs.budget)}</span>
            </div>

            <button
              type="button"
              onClick={onSearchTrips}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-base tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
              <span>🔍 FIND MY TRIP</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
