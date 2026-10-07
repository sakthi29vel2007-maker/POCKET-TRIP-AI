import React from 'react';
import { Compass, Sparkles, Heart } from 'lucide-react';
import { formatINR } from '../utils/budgetEngine';

interface FooterProps {
  onSelectBudget: (budget: number) => void;
  onOpenDestinations: () => void;
  onScrollToPlanner: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectBudget,
  onOpenDestinations,
  onScrollToPlanner,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      {/* Important Data Rule Banner */}
      <div className="bg-cyan-950/40 border-b border-cyan-500/20 py-4 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-cyan-200">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <p>
            <strong className="text-white">Important Data Rule:</strong> Prices are estimates and may change depending on travel dates, availability and booking conditions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-3 cursor-pointer" onClick={onScrollToPlanner}>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                PocketTrip <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-300 mb-2">
              Your Budget. Your Journey. Our Plan.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
              The budget-first AI travel planner that eliminates guess work. Tell us what you have in your wallet, and we build complete, verified itineraries covering transport, accommodation, food, and activities.
            </p>
          </div>

          {/* Quick Budgets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Explore by Budget
            </h4>
            <ul className="space-y-2">
              {[5000, 10000, 15000, 25000, 50000, 100000].map((amt) => (
                <li key={amt}>
                  <button
                    onClick={() => onSelectBudget(amt)}
                    className="hover:text-cyan-400 transition-colors text-left cursor-pointer"
                  >
                    Trips within {formatINR(amt)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Top States & Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Regional Destinations
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenDestinations} className="hover:text-cyan-400 transition-colors">
                  Tamil Nadu (Kodai, Ooty, Rameswaram)
                </button>
              </li>
              <li>
                <button onClick={onOpenDestinations} className="hover:text-cyan-400 transition-colors">
                  Kerala (Munnar, Alleppey, Varkala)
                </button>
              </li>
              <li>
                <button onClick={onOpenDestinations} className="hover:text-cyan-400 transition-colors">
                  Karnataka (Coorg, Hampi, Mysuru)
                </button>
              </li>
              <li>
                <button onClick={onOpenDestinations} className="hover:text-cyan-400 transition-colors">
                  Rajasthan (Jaipur, Udaipur, Jodhpur)
                </button>
              </li>
              <li>
                <button onClick={onOpenDestinations} className="hover:text-cyan-400 transition-colors">
                  Puducherry (White Town & Beaches)
                </button>
              </li>
            </ul>
          </div>

          {/* Core Philosophy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Core Principles
            </h4>
            <ul className="space-y-2">
              <li>• Zero destination prerequisites</li>
              <li>• Any custom rupee amount allowed</li>
              <li>• Multi-category cost transparency</li>
              <li>• Realistic local transit routing</li>
              <li>• AI budget rebalancing</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} PocketTrip AI. Built for budget travelers across India.
          </div>
          <div className="flex items-center gap-1">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
            <span>for seamless journeys</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
