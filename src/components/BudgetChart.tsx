import React, { useState } from 'react';
import { BudgetBreakdown } from '../types';
import { formatINR } from '../utils/budgetEngine';
import { Bus, Hotel, UtensilsCrossed, Car, Ticket, Wallet, CheckCircle2 } from 'lucide-react';

interface BudgetChartProps {
  breakdown: BudgetBreakdown;
  userBudget: number;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({ breakdown, userBudget }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { key: 'transport', label: 'Transport', amount: breakdown.transport, color: '#06b6d4', icon: Bus },
    { key: 'stay', label: 'Stay', amount: breakdown.stay, color: '#14b8a6', icon: Hotel },
    { key: 'food', label: 'Food', amount: breakdown.food, color: '#f97316', icon: UtensilsCrossed },
    { key: 'localTransport', label: 'Local Transport', amount: breakdown.localTransport, color: '#3b82f6', icon: Car },
    { key: 'activities', label: 'Activities', amount: breakdown.activities, color: '#a855f7', icon: Ticket },
  ];

  const totalCalculated = breakdown.total;
  const remaining = Math.max(0, userBudget - totalCalculated);
  const isOverBudget = totalCalculated > userBudget;
  const percentPlanned = Math.min(100, Math.round((totalCalculated / userBudget) * 100));

  // Compute SVG Donut Chart parameters
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Build segments with percentages relative to userBudget
  const segments: Array<{ key: string; label: string; color: string; dashArray: string; dashOffset: number; percent: number }> = [];
  let accumulatedOffset = 0;

  categories.forEach((cat) => {
    const fraction = userBudget > 0 ? cat.amount / userBudget : 0;
    const strokeDash = Math.max(0, fraction * circumference);
    const strokeSpace = circumference - strokeDash;
    segments.push({
      key: cat.key,
      label: cat.label,
      color: cat.color,
      dashArray: `${strokeDash} ${strokeSpace}`,
      dashOffset: -accumulatedOffset,
      percent: Math.round(fraction * 100),
    });
    accumulatedOffset += strokeDash;
  });

  // Remaining segment if any
  if (remaining > 0 && !isOverBudget) {
    const remainingFraction = remaining / userBudget;
    const remainingDash = remainingFraction * circumference;
    const remainingSpace = circumference - remainingDash;
    segments.push({
      key: 'remaining',
      label: 'Remaining Buffer',
      color: '#10b981', // emerald
      dashArray: `${remainingDash} ${remainingSpace}`,
      dashOffset: -accumulatedOffset,
      percent: Math.round(remainingFraction * 100),
    });
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Complete Budget Breakdown</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear itemized allocation of your {formatINR(userBudget)} budget
          </p>
        </div>

        {/* Remaining Money Indicator */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${
          isOverBudget
            ? 'bg-rose-950/60 border-rose-600/40 text-rose-300'
            : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
        }`}>
          <Wallet className="w-4 h-4 text-emerald-400" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              {isOverBudget ? 'Over Budget By' : 'Remaining Money'}
            </div>
            <div className="text-sm font-extrabold font-mono">
              {isOverBudget ? formatINR(totalCalculated - userBudget) : formatINR(breakdown.remaining)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Status */}
      <div className="mb-6 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <strong className="text-white">{percentPlanned}% of your budget planned</strong>
          </span>
          <span className="font-mono text-cyan-400">
            {formatINR(totalCalculated)} / {formatINR(userBudget)}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          {categories.map((c) => {
            const widthPct = userBudget > 0 ? (c.amount / userBudget) * 100 : 0;
            return (
              <div
                key={c.key}
                style={{ width: `${widthPct}%`, backgroundColor: c.color }}
                title={`${c.label}: ${formatINR(c.amount)} (${Math.round(widthPct)}%)`}
                className="h-full transition-all duration-500 hover:brightness-125"
              />
            );
          })}
          {remaining > 0 && !isOverBudget && (
            <div
              style={{ width: `${(remaining / userBudget) * 100}%`, backgroundColor: '#10b981' }}
              title={`Remaining: ${formatINR(remaining)}`}
              className="h-full transition-all duration-500 bg-emerald-500/80 hover:brightness-125"
            />
          )}
        </div>
      </div>

      {/* Donut Chart & Category Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut SVG */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3">
          <div className="relative w-[200px] h-[200px] flex items-center justify-center">
            <svg width={size} height={size} className="rotate-[-90deg] drop-shadow-md">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />
              {segments.map((seg) => (
                <circle
                  key={seg.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setActiveCategory(seg.key)}
                  onMouseLeave={() => setActiveCategory(null)}
                />
              ))}
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Budget
              </span>
              <span className="text-xl font-extrabold text-white font-mono mt-0.5">
                {formatINR(userBudget)}
              </span>
              <span className="text-[10px] text-cyan-400 font-medium mt-1">
                {percentPlanned}% allocated
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px] text-slate-400">
            {categories.map((c) => (
              <span key={c.key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                <span>{c.label}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-500" />
              <span>Buffer</span>
            </span>
          </div>
        </div>

        {/* Category Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {categories.map((c) => {
            const Icon = c.icon;
            const pct = userBudget > 0 ? Math.round((c.amount / userBudget) * 100) : 0;
            const isHighlighted = activeCategory === c.key;

            return (
              <div
                key={c.key}
                onMouseEnter={() => setActiveCategory(c.key)}
                onMouseLeave={() => setActiveCategory(null)}
                className={`p-3 rounded-xl border transition-all cursor-default ${
                  isHighlighted
                    ? 'bg-slate-800 border-cyan-400 shadow-lg scale-[1.02]'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: `${c.color}25`, color: c.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    {pct}%
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-300">{c.label}</div>
                <div className="text-sm font-extrabold text-white font-mono mt-0.5">
                  {formatINR(c.amount)}
                </div>
              </div>
            );
          })}

          {/* Remaining Card */}
          <div
            className={`p-3 rounded-xl border transition-all cursor-default ${
              activeCategory === 'remaining'
                ? 'bg-emerald-950/80 border-emerald-400 scale-[1.02]'
                : 'bg-emerald-950/40 border-emerald-900/60'
            }`}
            onMouseEnter={() => setActiveCategory('remaining')}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded">
                {Math.max(0, 100 - percentPlanned)}%
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-300">Remaining</div>
            <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
              {formatINR(breakdown.remaining)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
