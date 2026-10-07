import React from 'react';
import { TripPlan } from '../types';
import { formatINR } from '../utils/budgetEngine';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  CloudSun, 
  ArrowRight, 
  Sparkles, 
  Bus, 
  Hotel, 
  UtensilsCrossed, 
  Car, 
  Ticket, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface DestinationCardProps {
  plan: TripPlan;
  onSelect: (plan: TripPlan) => void;
  onQuickExplore: (plan: TripPlan) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ plan, onSelect, onQuickExplore }) => {
  const { destination, breakdown, origin, isWithinBudget } = plan;
  const dist = destination.distanceFrom[origin] || {
    km: destination.defaultDistanceKm,
    duration: '4h 30m',
  };

  const isOver = !isWithinBudget;

  return (
    <div className="group relative flex flex-col bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
      {/* Top Image Banner */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-950">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/10 flex items-center gap-1 shadow-md">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{destination.state}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-md">
              <CloudSun className="w-3 h-3 text-cyan-400" />
              <span>{destination.weather.temp}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-950/90 backdrop-blur-md text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{plan.budgetFitPercent}% Budget Fit</span>
            </span>
          </div>
        </div>

        {/* Bottom Image Overlay Header */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
            {destination.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{dist.km} km from {origin}</span>
            </span>
            <span className="text-slate-500">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{dist.duration}</span>
            </span>
            <span className="text-slate-500">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{plan.days} Days / {Math.max(1, plan.days - 1)} Nights</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        {/* Estimated Cost & Remaining Strip */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Estimated Trip Cost
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white font-mono">
                {formatINR(breakdown.total)}
              </span>
              <span className="text-xs text-slate-400">
                ({formatINR(breakdown.costPerPerson)}/person)
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isOver ? 'Deficit' : 'Remaining'}
            </div>
            <div className={`text-base font-extrabold font-mono flex items-center justify-end gap-1 mt-0.5 ${
              isOver ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {isOver ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>+{formatINR(breakdown.total - plan.userBudget)}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{formatINR(breakdown.remaining)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {destination.description}
        </p>

        {/* Cost Breakdown Grid */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Itemized Breakdown</span>
            <span className="text-[10px] text-cyan-400/90 lowercase">estimated</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs font-mono">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-sans">
                <Bus className="w-3 h-3 text-cyan-400" />
                <span>Transport</span>
              </div>
              <div className="font-bold text-white mt-0.5">{formatINR(breakdown.transport)}</div>
            </div>

            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-sans">
                <Hotel className="w-3 h-3 text-teal-400" />
                <span>Stay</span>
              </div>
              <div className="font-bold text-white mt-0.5">{formatINR(breakdown.stay)}</div>
            </div>

            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-sans">
                <UtensilsCrossed className="w-3 h-3 text-orange-400" />
                <span>Food</span>
              </div>
              <div className="font-bold text-white mt-0.5">{formatINR(breakdown.food)}</div>
            </div>

            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-sans">
                <Car className="w-3 h-3 text-blue-400" />
                <span>Local Cabs</span>
              </div>
              <div className="font-bold text-white mt-0.5">{formatINR(breakdown.localTransport)}</div>
            </div>

            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-sans">
                <Ticket className="w-3 h-3 text-purple-400" />
                <span>Activities</span>
              </div>
              <div className="font-bold text-white mt-0.5">{formatINR(breakdown.activities)}</div>
            </div>
          </div>
        </div>

        {/* Compatibility & Match Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-cyan-400">
            {plan.interestMatchPercent}% Interest Match
          </span>
          <span className="text-slate-600">·</span>
          {destination.interests.slice(0, 3).map((int) => (
            <span key={int} className="text-[11px] text-slate-400 font-medium">
              #{int}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onSelect(plan)}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all cursor-pointer"
          >
            <span>VIEW COMPLETE TRIP</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
