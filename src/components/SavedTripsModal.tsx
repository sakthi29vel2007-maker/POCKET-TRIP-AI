import React from 'react';
import { TripPlan } from '../types';
import { formatINR } from '../utils/budgetEngine';
import { 
  X, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Bookmark, 
  Sparkles,
  Share2 
} from 'lucide-react';

interface SavedTripsModalProps {
  savedTrips: TripPlan[];
  onClose: () => void;
  onOpenTrip: (plan: TripPlan) => void;
  onDeleteTrip: (tripId: string) => void;
  onDuplicateTrip: (plan: TripPlan) => void;
  onRecalculateTrip: (plan: TripPlan) => void;
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({
  savedTrips,
  onClose,
  onOpenTrip,
  onDeleteTrip,
  onDuplicateTrip,
  onRecalculateTrip,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Your Saved Itineraries
              </h2>
              <p className="text-xs text-slate-400">
                {savedTrips.length} {savedTrips.length === 1 ? 'trip' : 'trips'} saved in your local storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {savedTrips.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No saved trips yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Explore destinations that fit your budget, open the complete trip details, and click &quot;Save&quot; to keep them here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedTrips.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={plan.destination.heroImage}
                      alt={plan.destination.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-white">{plan.destination.name}</h4>
                        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                          Budget: {formatINR(plan.userBudget)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>From {plan.origin}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{plan.days} Days ({plan.travellers} {plan.travellers === 1 ? 'person' : 'people'})</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-2 font-mono">
                        Planned Cost: <strong className="text-white">{formatINR(plan.breakdown.total)}</strong> · Remaining: <strong className="text-emerald-400">{formatINR(plan.breakdown.remaining)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center w-full md:w-auto justify-end">
                    <button
                      onClick={() => onOpenTrip(plan)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Plan</span>
                    </button>

                    <button
                      onClick={() => onRecalculateTrip(plan)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Load in planner"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onDuplicateTrip(plan)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Duplicate Trip"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteTrip(plan.id)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
