import React, { useState } from 'react';
import { TripPlan, TransportOption } from '../types';
import { formatINR, calculateBudgetIncreasePerks } from '../utils/budgetEngine';
import { BudgetChart } from './BudgetChart';
import { TripRouteMap } from './TripRouteMap';
import { 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  Bus, 
  Hotel, 
  UtensilsCrossed, 
  Ticket, 
  Sparkles, 
  Zap, 
  Bookmark, 
  Share2, 
  Printer, 
  TrendingUp, 
  Clock, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertCircle, 
  Loader2,
  Copy
} from 'lucide-react';

interface TripDetailModalProps {
  plan: TripPlan;
  onClose: () => void;
  onSaveTrip: (plan: TripPlan) => void;
  isSaved: boolean;
  onApplyOptimizedPlan?: (newPlan: TripPlan) => void;
  onApplyNewBudget?: (newBudget: number) => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  plan,
  onClose,
  onSaveTrip,
  isSaved,
  onApplyOptimizedPlan,
  onApplyNewBudget,
}) => {
  const { destination, origin, days, travellers, breakdown, userBudget } = plan;
  const nights = Math.max(1, days - 1);

  // States
  const [selectedTransportIndex, setSelectedTransportIndex] = useState<number>(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [showShareNotification, setShowShareNotification] = useState<boolean>(false);

  // Increase Budget perk calculation
  const [budgetIncrement, setBudgetIncrement] = useState<number>(5000);
  const perks = calculateBudgetIncreasePerks(plan, budgetIncrement);

  // Active selected transport
  const currentTransport: TransportOption = destination.transportOptions[selectedTransportIndex] || destination.transportOptions[0];

  // AI Budget Optimizer Trigger
  const handleOptimizeBudget = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination.name,
          budget: userBudget,
          plannedCost: breakdown.total,
          travellers,
          days,
          breakdown,
        }),
      });

      if (!response.ok) {
        throw new Error('Optimizer request failed');
      }

      const data = await response.json();
      setOptimizationResult(data);
    } catch (err) {
      console.error('Error optimizing budget:', err);
      // Fallback local optimization
      setOptimizationResult({
        tips: [
          'Switch to direct government express bus (SETC/KSRTC) instead of private cab.',
          'Choose verified homestay with mountain views instead of luxury resort.',
          'Savor local legendary mess thalis for ₹150 instead of hotel dining.',
          'Explore nature trails, lake walks, and viewpoints with zero entry fees.',
        ],
        optimizedBreakdown: {
          transport: Math.round(breakdown.transport * 0.8),
          stay: Math.round(breakdown.stay * 0.75),
          food: Math.round(breakdown.food * 0.85),
          localTransport: Math.round(breakdown.localTransport * 0.7),
          activities: Math.round(breakdown.activities * 0.8),
          newTotal: Math.round(breakdown.total * 0.78),
          savings: Math.round(breakdown.total * 0.22),
        },
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = () => {
    if (!optimizationResult || !onApplyOptimizedPlan) return;
    const opt = optimizationResult.optimizedBreakdown;
    const updatedPlan: TripPlan = {
      ...plan,
      breakdown: {
        ...breakdown,
        transport: opt.transport,
        stay: opt.stay,
        food: opt.food,
        localTransport: opt.localTransport,
        activities: opt.activities,
        total: opt.newTotal,
        remaining: userBudget - opt.newTotal,
        costPerPerson: Math.round(opt.newTotal / travellers),
        percentPlanned: Math.min(100, Math.round((opt.newTotal / userBudget) * 100)),
      },
      isWithinBudget: opt.newTotal <= userBudget,
    };
    onApplyOptimizedPlan(updatedPlan);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {destination.name}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {destination.state}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {days} Days • {nights} Nights • {travellers} {travellers === 1 ? 'Traveller' : 'Travellers'} • Style: {plan.travelStyle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveTrip(plan)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title={isSaved ? 'Trip Saved' : 'Save Trip'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Share Trip"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export / Print"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share notification toast */}
        {showShareNotification && (
          <div className="absolute top-20 right-6 z-50 bg-cyan-950 border border-cyan-500 text-cyan-200 text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in">
            <Copy className="w-4 h-4 text-cyan-400" />
            <span>Trip link copied to clipboard!</span>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-8 flex-1">
          {/* Top Hero Summary Bar */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalized Budget Calculation</span>
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Trip from {origin} to {destination.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  {destination.description}
                </p>
              </div>

              {/* 3 Core Numbers Banner */}
              <div className="grid grid-cols-3 gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800/80">
                <div className="px-3 py-2 text-center border-r border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Budget</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">{formatINR(userBudget)}</div>
                </div>

                <div className="px-3 py-2 text-center border-r border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planned Cost</div>
                  <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">{formatINR(breakdown.total)}</div>
                </div>

                <div className="px-3 py-2 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</div>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">{formatINR(breakdown.remaining)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: COMPLETE BUDGET BREAKDOWN & DONUT CHART */}
          <section>
            <BudgetChart breakdown={breakdown} userBudget={userBudget} />
          </section>

          {/* SECTION 2: TRAVEL PLAN */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Bus className="w-4 h-4 text-cyan-400" />
                  <span>Travel Plan: {origin} → {destination.name}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Transportation options calculated from distance and regional schedules
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Estimated Fares
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {destination.transportOptions.map((opt, i) => {
                const isSelected = selectedTransportIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedTransportIndex(i)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Bus className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{opt.type}</span>
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-medium text-slate-300">
                        {opt.operator}
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="text-slate-200 font-mono">{opt.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Departure:</span>
                          <span className="text-slate-200">{opt.departure}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Arrival:</span>
                          <span className="text-slate-200">{opt.arrival}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-sans">Fare / person:</span>
                      <span className="text-sm font-extrabold text-cyan-400 font-mono">
                        {formatINR(opt.farePerPerson)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 3: STAY PLAN */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-teal-400" />
                  <span>Stay Plan — {nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accommodation selected to strictly balance with your total budget
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Stay: </span>
                <span className="text-base font-extrabold text-teal-400 font-mono">
                  {formatINR(breakdown.stay)}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Hotel className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-base font-bold text-white">{plan.selectedStay.name}</h5>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-teal-300 border border-teal-800/60 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-teal-400 text-teal-400" />
                      <span>{plan.selectedStay.rating}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {plan.selectedStay.type} · {plan.selectedStay.roomType} · {plan.selectedStay.distance}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {plan.selectedStay.amenities.map((amenity, idx) => (
                      <span key={idx} className="text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-right shrink-0 w-full md:w-auto">
                <div className="text-xs text-slate-400">Nightly Rate</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {formatINR(plan.selectedStay.pricePerNight)}<span className="text-xs text-slate-400 font-normal"> / night</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {nights} nights × {Math.ceil(travellers / 2)} room(s)
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: FOOD PLAN */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                  <span>Food Plan & Daily Culinary Budget</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated daily allocation with signature local specialties
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Food: </span>
                <span className="text-base font-extrabold text-orange-400 font-mono">
                  {formatINR(breakdown.food)}
                </span>
              </div>
            </div>

            {/* Daily Food Budget Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-400">Breakfast</div>
                <div className="text-base font-black text-white font-mono mt-1">
                  {formatINR(destination.dailyFood.breakfast.cost)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {destination.dailyFood.breakfast.items.join(', ')}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-400">Lunch</div>
                <div className="text-base font-black text-white font-mono mt-1">
                  {formatINR(destination.dailyFood.lunch.cost)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {destination.dailyFood.lunch.items.join(', ')}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-400">Snacks & Tea</div>
                <div className="text-base font-black text-white font-mono mt-1">
                  {formatINR(destination.dailyFood.snacks.cost)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {destination.dailyFood.snacks.items.join(', ')}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-400">Dinner</div>
                <div className="text-base font-black text-white font-mono mt-1">
                  {formatINR(destination.dailyFood.dinner.cost)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {destination.dailyFood.dinner.items.join(', ')}
                </div>
              </div>
            </div>

            {/* Signature Dishes Spotlight */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Recommended Local Dishes To Try:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {destination.dailyFood.signatureDishes.map((dish, i) => (
                  <div key={i} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{dish.name}</span>
                        <span className="text-[10px] text-orange-400 bg-orange-950/60 px-1.5 py-0.2 rounded">
                          {dish.meal}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{dish.description}</p>
                    </div>
                    <span className="text-xs font-bold text-white font-mono shrink-0">
                      ~{formatINR(dish.estPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 5: ACTIVITIES */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>Activities & Experiences</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filtered by your interests ({plan.selectedInterests.join(', ') || 'General Highlights'})
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Activities: </span>
                <span className="text-base font-extrabold text-purple-400 font-mono">
                  {formatINR(breakdown.activities)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {destination.activities.map((act) => (
                <div key={act.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded">
                        {act.category}
                      </span>
                      <span className="text-xs font-extrabold text-white font-mono">
                        {act.cost === 0 ? 'Free Entry' : formatINR(act.cost)}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white tracking-tight">{act.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{act.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{act.duration}</span>
                    </span>
                    <span>{act.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: DAY-BY-DAY PLAN */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Day-by-Day Intelligent Plan</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Route grouped to minimize local transport cost and transit fatigue
                </p>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-semibold">
                {plan.itinerary.length} Days Planned
              </span>
            </div>

            <div className="space-y-3">
              {plan.itinerary.map((day) => {
                const isExpanded = expandedDay === day.dayNumber;
                return (
                  <div
                    key={day.dayNumber}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono flex items-center justify-center">
                          D{day.dayNumber}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white">{day.dayTitle}</div>
                          <div className="text-xs text-slate-400">{day.theme}</div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-slate-900 space-y-2.5">
                        {day.stops.map((stop, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/60 flex items-start gap-3"
                          >
                            <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded shrink-0">
                              {stop.time}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h6 className="text-xs font-bold text-white">{stop.title}</h6>
                                {stop.cost > 0 && (
                                  <span className="text-xs font-mono font-bold text-slate-400">
                                    ~{formatINR(stop.cost)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{stop.description}</p>
                              <div className="text-[10px] text-slate-500 mt-1">📍 {stop.location}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 7: INTERACTIVE ROUTE MAP */}
          <section>
            <TripRouteMap plan={plan} />
          </section>

          {/* SECTION 8: AI BUDGET OPTIMIZER */}
          <section className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-teal-950/40 border border-cyan-500/30 rounded-2xl p-5 md:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Budget Optimizer</span>
                </div>
                <h4 className="text-lg font-black text-white tracking-tight">
                  Squeeze More Value from Your Budget
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Let PocketTrip AI analyze your transport, stay, and food to unlock extra savings or balance costs.
                </p>
              </div>

              <button
                onClick={handleOptimizeBudget}
                disabled={isOptimizing}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer shrink-0 disabled:opacity-60"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>⚡ OPTIMIZE MY BUDGET</span>
                  </>
                )}
              </button>
            </div>

            {/* Optimization Result Display */}
            {optimizationResult && (
              <div className="mt-4 pt-4 border-t border-cyan-500/20 bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>PocketTrip AI Suggestions:</span>
                  </h5>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Est. Potential Savings: {formatINR(optimizationResult.optimizedBreakdown.savings)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {optimizationResult.tips.map((tip: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-400">
                    New Optimized Total: <strong className="text-white font-mono text-sm">{formatINR(optimizationResult.optimizedBreakdown.newTotal)}</strong>
                  </div>
                  <button
                    onClick={handleApplyOptimization}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    REBUILD MY TRIP
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 9: "WHAT HAPPENS IF I INCREASE MY BUDGET?" */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>What happens if I increase my budget?</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current budget: <span className="font-mono text-white font-bold">{formatINR(userBudget)}</span>
                </p>
              </div>

              {/* Increment selectors */}
              <div className="flex items-center gap-2">
                {[3000, 5000, 10000].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => setBudgetIncrement(inc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      budgetIncrement === inc
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    +{formatINR(inc)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-300">
                  With {formatINR(perks.newBudget)} (+{formatINR(perks.addedAmount)}), you unlock:
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Dynamically Calculated</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                  <Hotel className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-200 block mb-0.5">Stay Upgrade:</strong>
                    <span className="text-slate-400">{perks.hotelUpgrade}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                  <Bus className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-200 block mb-0.5">Better Transport:</strong>
                    <span className="text-slate-400">{perks.transportUpgrade}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                  <Ticket className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-200 block mb-0.5">Extra Attraction / Tour:</strong>
                    <span className="text-slate-400">{perks.activityAddon}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                  <UtensilsCrossed className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-200 block mb-0.5">Gourmet Food Experience:</strong>
                    <span className="text-slate-400">{perks.culinaryAddon}</span>
                  </div>
                </div>
              </div>

              {onApplyNewBudget && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onApplyNewBudget(perks.newBudget)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase transition-all cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    Upgrade Planner to {formatINR(perks.newBudget)}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 21: IMPORTANT DATA DISCLAIMER RULE */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Important Data Rule:</strong> Prices are estimates calculated from regional transit rates, stay indexes, and entry fees. They may change depending on travel dates, seasonal demand, and booking conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
