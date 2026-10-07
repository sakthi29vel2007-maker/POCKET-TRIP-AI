import React, { useState } from 'react';
import { TripPlan } from '../types';
import { MapPin, Hotel, Camera, Utensils, Navigation, CheckCircle2, Route, Clock } from 'lucide-react';

interface TripRouteMapProps {
  plan: TripPlan;
}

export const TripRouteMap: React.FC<TripRouteMapProps> = ({ plan }) => {
  const { destination, origin, selectedStay } = plan;
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  // Construct optimized sequence nodes
  const nodes = [
    {
      id: 'origin',
      title: origin,
      category: 'Starting Origin',
      type: 'origin',
      icon: Navigation,
      time: '06:00 AM Departure',
      description: `Starting location in ${origin}. Direct transit booked.`,
      color: '#06b6d4', // cyan
      badge: 'Start',
    },
    {
      id: 'stay',
      title: selectedStay.name,
      category: 'Accommodation Check-in',
      type: 'stay',
      icon: Hotel,
      time: '11:00 AM Check-in',
      description: `${selectedStay.type} · ${selectedStay.distance}`,
      color: '#14b8a6', // teal
      badge: 'Base Camp',
    },
    {
      id: 'attraction-1',
      title: destination.activities[0]?.title || 'Scenic Lake / Botanical Gardens',
      category: 'Attraction 1 (Morning Circuit)',
      type: 'attraction',
      icon: Camera,
      time: '02:00 PM',
      description: 'Clustered within 1.5 km of base camp to minimize transit delay.',
      color: '#a855f7', // purple
      badge: 'Stop 1',
    },
    {
      id: 'attraction-2',
      title: destination.activities[1]?.title || 'Panoramic Mountain Viewpoint',
      category: 'Attraction 2 (Afternoon Ridge)',
      type: 'attraction',
      icon: Camera,
      time: '04:30 PM Golden Hour',
      description: 'Sequenced for optimum sunset photography and lighting.',
      color: '#a855f7',
      badge: 'Stop 2',
    },
    {
      id: 'food',
      title: destination.dailyFood.signatureDishes[0]?.name || 'Traditional Food & Dinner Mess',
      category: 'Culinary Stop',
      type: 'food',
      icon: Utensils,
      time: '07:30 PM Dinner',
      description: 'Authentic local dining located on route back to stay.',
      color: '#f97316', // orange
      badge: 'Dining',
    },
    {
      id: 'attraction-3',
      title: destination.activities[2]?.title || 'Evening Lakeside Promenade',
      category: 'Attraction 3 (Evening Stroll)',
      type: 'attraction',
      icon: Camera,
      time: '08:45 PM',
      description: 'Relaxed ambient walk before retiring to hotel.',
      color: '#a855f7',
      badge: 'Stop 3',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Route className="w-5 h-5 text-cyan-400" />
              <span>Optimized Route & Waypoints Map</span>
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60">
              Zero Backtracking
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographically grouped to reduce local taxi fares and unnecessary travel time
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Save up to 45 mins daily</span>
        </div>
      </div>

      {/* Interactive Flow Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Node Timeline */}
        <div className="lg:col-span-7 space-y-3">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedNodeIndex === index;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeIndex(index)}
                className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Connecting Line if not last */}
                {index < nodes.length - 1 && (
                  <div className="absolute left-[27px] top-[46px] bottom-[-16px] w-0.5 bg-slate-800 z-0 pointer-events-none" />
                )}

                {/* Node Icon Avatar */}
                <div
                  className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                  style={{ backgroundColor: `${node.color}20`, color: node.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {node.category}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{node.time}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-tight truncate mt-0.5">
                    {node.title}
                  </h4>

                  <p className="text-xs text-slate-300 mt-0.5">
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Visual Route Simulation Card */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              <span>Route Simulation</span>
              <span className="text-cyan-400 font-mono">Geo-Clustered</span>
            </div>

            {/* SVG Visual Schematic Route Map */}
            <div className="relative w-full h-52 bg-slate-900/80 rounded-xl border border-slate-800/80 p-3 overflow-hidden flex items-center justify-center">
              {/* Background Map Grid & Roads SVG */}
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>

                {/* Grid terrain dots */}
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.4" />
                </pattern>
                <rect width="400" height="200" fill="url(#grid)" />

                {/* Curving optimized path */}
                <path
                  d="M 30,100 C 90,40 140,160 200,80 C 260,20 310,150 370,100"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                />
                <path
                  d="M 30,100 C 90,40 140,160 200,80 C 260,20 310,150 370,100"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="3"
                />

                {/* Waypoint circles with coordinates */}
                {[
                  { cx: 30, cy: 100, idx: 0, label: 'Origin' },
                  { cx: 110, cy: 75, idx: 1, label: 'Stay' },
                  { cx: 175, cy: 120, idx: 2, label: 'Stop 1' },
                  { cx: 235, cy: 65, idx: 3, label: 'Stop 2' },
                  { cx: 305, cy: 125, idx: 4, label: 'Dining' },
                  { cx: 370, cy: 100, idx: 5, label: 'Stop 3' },
                ].map((pt) => {
                  const isCurrent = selectedNodeIndex === pt.idx;
                  return (
                    <g
                      key={pt.idx}
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeIndex(pt.idx)}
                    >
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r={isCurrent ? 12 : 7}
                        fill={isCurrent ? '#06b6d4' : '#0f172a'}
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                        className="transition-all"
                      />
                      {isCurrent && (
                        <circle
                          cx={pt.cx}
                          cy={pt.cy}
                          r={18}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="1.5"
                          opacity="0.5"
                          className="animate-ping"
                        />
                      )}
                      <text
                        x={pt.cx}
                        y={pt.cy - 14}
                        fill="#f8fafc"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Selected Node Details Box */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Active Waypoint: {nodes[selectedNodeIndex].badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {nodes[selectedNodeIndex].time}
              </span>
            </div>
            <h5 className="text-sm font-bold text-white">
              {nodes[selectedNodeIndex].title}
            </h5>
            <p className="text-xs text-slate-400 mt-1">
              {nodes[selectedNodeIndex].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
