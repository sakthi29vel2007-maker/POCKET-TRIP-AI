import React from 'react';
import { getBudgetPossibilities, formatINR } from '../utils/budgetEngine';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

interface WhatCanIGetSectionProps {
  currentBudget: number;
  onBudgetChange: (newBudget: number) => void;
  onSelectPossibilityExample: (destSlug: string) => void;
}

export const WhatCanIGetSection: React.FC<WhatCanIGetSectionProps> = ({
  currentBudget,
  onBudgetChange,
  onSelectPossibilityExample,
}) => {
  const possibilities = getBudgetPossibilities(currentBudget);

  const presetBudgets = [5000, 10000, 20000, 35000, 50000, 100000];

  return (
    <section id="what-can-i-get" className="py-14 border-t border-slate-800/80 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Budget Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              With <span className="text-cyan-400 font-mono">{formatINR(currentBudget)}</span> You Could...
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Switch budgets instantly below to discover how your travel possibilities expand with every rupee.
            </p>
          </div>

          {/* Quick Budget Switcher */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Change Budget:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {presetBudgets.map((amt) => {
                const isActive = currentBudget === amt;
                return (
                  <button
                    key={amt}
                    onClick={() => onBudgetChange(amt)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/50 hover:text-white'
                    }`}
                  >
                    {formatINR(amt)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Possibilities Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {possibilities.map((pos, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  {pos.emoji}
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  {pos.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {pos.description}
                </p>

                <div className="space-y-2 mb-4">
                  {pos.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Example Route:
                </div>
                <div className="text-xs font-bold text-cyan-400 flex items-center justify-between">
                  <span>{pos.exampleDestination}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
