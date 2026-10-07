import React, { useState } from 'react';
import { Destination } from '../types';
import { DESTINATIONS } from '../data/destinations';
import { formatINR } from '../utils/budgetEngine';
import { 
  X, 
  Search, 
  MapPin, 
  CloudSun, 
  Calendar, 
  ArrowRight, 
  Hotel, 
  UtensilsCrossed, 
  Bus, 
  Sparkles, 
  Star,
  Check 
} from 'lucide-react';

interface CityDirectoryModalProps {
  onClose: () => void;
  onPlanCityWithBudget: (destination: Destination) => void;
  currentBudget: number;
}

export const CityDirectoryModal: React.FC<CityDirectoryModalProps> = ({
  onClose,
  onPlanCityWithBudget,
  currentBudget,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [activeCity, setActiveCity] = useState<Destination | null>(null);

  const states = ['All', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Rajasthan', 'Puducherry'];

  const filteredCities = DESTINATIONS.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'All' || d.state === selectedState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Explore Destinations Database
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                /destinations/[city-slug]
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive guide to Indian cities with live budget synchronization
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content View: City List vs Detailed City Page */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {!activeCity ? (
            <div>
              {/* Search & State Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city, state, or interest (e.g. Kodaikanal, Kerala, tea)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {states.map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedState(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedState === st
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Cities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCities.map((city) => (
                  <div
                    key={city.id}
                    className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={city.heroImage}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
                          {city.state}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 left-3.5 right-3.5">
                        <h3 className="text-xl font-black text-white">{city.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <CloudSun className="w-3 h-3 text-cyan-400" />
                          <span>{city.weather.temp}</span>
                          <span>·</span>
                          <span>{city.bestTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {city.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {city.interests.slice(0, 3).map((int) => (
                          <span key={int} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                            #{int}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                        <button
                          onClick={() => setActiveCity(city)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          View City Guide
                        </button>

                        <button
                          onClick={() => onPlanCityWithBudget(city)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-slate-950 font-bold text-xs uppercase transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                        >
                          Plan with Budget
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* DETAILED CITY PAGE (/destinations/[city-slug]) */
            <div className="space-y-6">
              {/* Back to directory */}
              <button
                onClick={() => setActiveCity(null)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                ← Back to all destinations
              </button>

              {/* City Hero */}
              <div className="relative rounded-2xl overflow-hidden h-72 w-full">
                <img
                  src={activeCity.heroImage}
                  alt={activeCity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-950/80 text-cyan-300 border border-cyan-500/30">
                      {activeCity.state} · {activeCity.region}
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black text-white mt-2">
                      {activeCity.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
                      <span className="flex items-center gap-1">
                        <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Weather: {activeCity.weather.temp} ({activeCity.weather.condition})</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Best Time: {activeCity.bestTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Primary Button */}
                  <button
                    onClick={() => onPlanCityWithBudget(activeCity)}
                    className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide uppercase flex items-center gap-2 shadow-xl shadow-cyan-500/30 cursor-pointer"
                  >
                    <span>PLAN THIS DESTINATION WITH MY BUDGET</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* About */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  About {activeCity.name}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeCity.description}
                </p>
              </div>

              {/* Attractions & Activities */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Top Attractions & Things To Do</span>
                  <span className="text-xs text-cyan-400 font-mono lowercase">verified entry costs</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeCity.activities.map((act) => (
                    <div key={act.id} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-950/70 px-1.5 py-0.5 rounded">
                          {act.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {act.cost === 0 ? 'Free' : formatINR(act.cost)}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-1">{act.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotels & Accommodations */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Stay Tiers in {activeCity.name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeCity.stays.map((stay) => (
                    <div key={stay.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-teal-400">{stay.type}</span>
                        <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{stay.rating}</span>
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-1">{stay.name}</h5>
                      <div className="text-sm font-black text-white font-mono mt-2">
                        {formatINR(stay.pricePerNight)}<span className="text-xs text-slate-400 font-normal"> / night</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{stay.distance}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food & Dining */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Local Food & Signature Dishes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeCity.dailyFood.signatureDishes.map((dish, i) => (
                    <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white">{dish.name}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{dish.description}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-orange-400 shrink-0">
                        ~{formatINR(dish.estPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Destinations */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Nearby Destinations:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {activeCity.nearbyDestinations.map((nb) => (
                      <span key={nb} className="text-xs text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {nb}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onPlanCityWithBudget(activeCity)}
                  className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase transition-all cursor-pointer"
                >
                  Plan Trip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
