import React, { useState, useEffect, useMemo } from 'react';
import { UserPreferences, TripPlan, Destination } from './types';
import { findDestinationsForBudget, calculateTripForDestination, formatINR } from './utils/budgetEngine';
import { DESTINATIONS } from './data/destinations';
import { Navbar } from './components/Navbar';
import { HeroPlanner } from './components/HeroPlanner';
import { DestinationCard } from './components/DestinationCard';
import { WhatCanIGetSection } from './components/WhatCanIGetSection';
import { TripDetailModal } from './components/TripDetailModal';
import { CityDirectoryModal } from './components/CityDirectoryModal';
import { SavedTripsModal } from './components/SavedTripsModal';
import { AiTravelChat } from './components/AiTravelChat';
import { Footer } from './components/Footer';
import { 
  Sparkles, 
  SlidersHorizontal, 
  CheckCircle2, 
  MapPin, 
  TrendingUp, 
  Compass, 
  MessageSquare,
  Search
} from 'lucide-react';

export default function App() {
  // Initial user preferences state (Default: Madurai, ₹10,000, 2 travellers, 3 days, Budget style)
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 14);
    const dateStr = today.toISOString().split('T')[0];

    return {
      origin: 'Madurai',
      budget: 10000,
      travellers: 2,
      days: 3,
      travelDate: dateStr,
      isFlexible: true,
      travelStyle: 'Budget',
      interests: ['Nature', 'Food'],
    };
  });

  // Saved trips stored in localStorage
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>(() => {
    try {
      const stored = localStorage.getItem('pockettrip_saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modal / View States
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<TripPlan | null>(null);
  const [isCityDirectoryOpen, setIsCityDirectoryOpen] = useState<boolean>(false);
  const [isSavedTripsOpen, setIsSavedTripsOpen] = useState<boolean>(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);

  // Filter & Sort State for Results
  const [activeFilter, setActiveFilter] = useState<'all' | 'withinBudget' | 'mountains' | 'beach' | 'heritage'>('all');
  const [sortBy, setSortBy] = useState<'bestFit' | 'lowestCost' | 'closest'>('bestFit');

  // Sync saved trips with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pockettrip_saved_trips', JSON.stringify(savedTrips));
    } catch (e) {
      console.error('Failed to save trips to local storage', e);
    }
  }, [savedTrips]);

  // Dynamically calculate destinations that match user budget & parameters
  const calculatedPlans = useMemo(() => {
    return findDestinationsForBudget(prefs);
  }, [prefs]);

  // Filtered & Sorted Plans
  const displayedPlans = useMemo(() => {
    let list = [...calculatedPlans];

    // Filter
    if (activeFilter === 'withinBudget') {
      list = list.filter((p) => p.isWithinBudget);
    } else if (activeFilter === 'mountains') {
      list = list.filter((p) => p.destination.interests.includes('Mountains'));
    } else if (activeFilter === 'beach') {
      list = list.filter((p) => p.destination.interests.includes('Beach'));
    } else if (activeFilter === 'heritage') {
      list = list.filter((p) => p.destination.interests.includes('History') || p.destination.interests.includes('Temples'));
    }

    // Sort
    if (sortBy === 'lowestCost') {
      list.sort((a, b) => a.breakdown.total - b.breakdown.total);
    } else if (sortBy === 'closest') {
      list.sort((a, b) => {
        const distA = a.destination.distanceFrom[prefs.origin]?.km || a.destination.defaultDistanceKm;
        const distB = b.destination.distanceFrom[prefs.origin]?.km || b.destination.defaultDistanceKm;
        return distA - distB;
      });
    } else {
      // Default: bestFit (already prioritized by budgetFit & interestMatch in engine)
    }

    return list;
  }, [calculatedPlans, activeFilter, sortBy, prefs.origin]);

  // Handlers
  const handleSaveTrip = (planToSave: TripPlan) => {
    if (savedTrips.some((p) => p.id === planToSave.id)) {
      setSavedTrips((prev) => prev.filter((p) => p.id !== planToSave.id));
    } else {
      setSavedTrips((prev) => [planToSave, ...prev]);
    }
  };

  const handleDeleteSavedTrip = (tripId: string) => {
    setSavedTrips((prev) => prev.filter((p) => p.id !== tripId));
  };

  const handleDuplicateSavedTrip = (plan: TripPlan) => {
    const duplicated: TripPlan = {
      ...plan,
      id: `${plan.id}-copy-${Date.now()}`,
    };
    setSavedTrips((prev) => [duplicated, ...prev]);
  };

  const handleRecalculateSavedTrip = (plan: TripPlan) => {
    setPrefs({
      origin: plan.origin,
      budget: plan.userBudget,
      travellers: plan.travellers,
      days: plan.days,
      travelDate: plan.travelDate,
      isFlexible: plan.isFlexible,
      travelStyle: plan.travelStyle,
      interests: plan.selectedInterests,
    });
    setIsSavedTripsOpen(false);
    scrollToPlanner();
  };

  const handlePlanSpecificCityWithBudget = (dest: Destination) => {
    const specificPlan = calculateTripForDestination(dest, prefs);
    setIsCityDirectoryOpen(false);
    setSelectedPlanForModal(specificPlan);
  };

  const handleSelectPossibilityExample = (destSlug: string) => {
    const found = DESTINATIONS.find((d) => d.slug === destSlug || d.id === destSlug);
    if (found) {
      handlePlanSpecificCityWithBudget(found);
    }
  };

  const scrollToPlanner = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToResults = () => {
    const el = document.getElementById('budget-results');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPossibilities = () => {
    const el = document.getElementById('what-can-i-get');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Navbar */}
      <Navbar
        currentBudget={prefs.budget}
        savedCount={savedTrips.length}
        onOpenSaved={() => setIsSavedTripsOpen(true)}
        onOpenDestinations={() => setIsCityDirectoryOpen(true)}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onScrollToPlanner={scrollToPlanner}
        onScrollToPossibilities={scrollToPossibilities}
      />

      <main className="flex-1">
        {/* 2. Hero Section & Central Budget Planner */}
        <HeroPlanner
          prefs={prefs}
          onUpdatePrefs={setPrefs}
          onSearchTrips={scrollToResults}
        />

        {/* 3. Budget Results Section: "Destinations You Can Afford" */}
        <section id="budget-results" className="py-12 border-t border-slate-900 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header with Affordability Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-800/80">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-time Affordability Engine</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Destinations You Can Afford
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                  Based on your <strong className="text-white font-mono">{formatINR(prefs.budget)}</strong> budget from <strong className="text-white">{prefs.origin}</strong> for <strong className="text-white">{prefs.travellers} {prefs.travellers === 1 ? 'person' : 'people'}</strong> over <strong className="text-white">{prefs.days} days</strong>. Every card itemizes where your money goes.
                </p>
              </div>

              {/* Filter Tabs & Sort Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Segmented Filter Pills */}
                <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({calculatedPlans.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('withinBudget')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeFilter === 'withinBudget'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Within Budget
                  </button>
                  <button
                    onClick={() => setActiveFilter('mountains')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeFilter === 'mountains'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mountains
                  </button>
                  <button
                    onClick={() => setActiveFilter('beach')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeFilter === 'beach'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Beaches
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer"
                  >
                    <option value="bestFit" className="bg-slate-900">Sort: Best Compatibility</option>
                    <option value="lowestCost" className="bg-slate-900">Sort: Lowest Cost</option>
                    <option value="closest" className="bg-slate-900">Sort: Nearest Distance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Destination Cards Grid */}
            {displayedPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPlans.map((plan) => (
                  <DestinationCard
                    key={plan.id}
                    plan={plan}
                    onSelect={(p) => setSelectedPlanForModal(p)}
                    onQuickExplore={(p) => setSelectedPlanForModal(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
                <Compass className="w-12 h-12 text-cyan-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-xl font-bold text-white">No exact matching trips found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
                  Try slightly increasing your budget, choosing flexible dates, or selecting &quot;Budget&quot; travel style.
                </p>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, budget: p.budget + 5000 }))}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                >
                  Increase Budget by +₹5,000
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4. "What Can I Get For My Budget?" Dynamic Section */}
        <WhatCanIGetSection
          currentBudget={prefs.budget}
          onBudgetChange={(newBudget) => setPrefs((p) => ({ ...p, budget: newBudget }))}
          onSelectPossibilityExample={handleSelectPossibilityExample}
        />
      </main>

      {/* 5. Footer */}
      <Footer
        onSelectBudget={(amt) => {
          setPrefs((p) => ({ ...p, budget: amt }));
          scrollToResults();
        }}
        onOpenDestinations={() => setIsCityDirectoryOpen(true)}
        onScrollToPlanner={scrollToPlanner}
      />

      {/* Floating Ask PocketTrip AI Button */}
      {!isAiChatOpen && (
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center gap-2.5 shadow-2xl shadow-cyan-500/40 hover:scale-105 transition-all cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" />
          <span>Ask PocketTrip AI</span>
        </button>
      )}

      {/* Modals & Drawers */}
      {/* 1. Trip Detail Modal (/trip/[destination]) */}
      {selectedPlanForModal && (
        <TripDetailModal
          plan={selectedPlanForModal}
          onClose={() => setSelectedPlanForModal(null)}
          onSaveTrip={handleSaveTrip}
          isSaved={savedTrips.some((t) => t.id === selectedPlanForModal.id)}
          onApplyOptimizedPlan={(newPlan) => {
            setSelectedPlanForModal(newPlan);
            // also update main list if necessary
          }}
          onApplyNewBudget={(newBudget) => {
            setPrefs((p) => ({ ...p, budget: newBudget }));
            const recalculated = calculateTripForDestination(selectedPlanForModal.destination, {
              ...prefs,
              budget: newBudget,
            });
            setSelectedPlanForModal(recalculated);
          }}
        />
      )}

      {/* 2. City Directory Modal (/destinations/[city-slug]) */}
      {isCityDirectoryOpen && (
        <CityDirectoryModal
          onClose={() => setIsCityDirectoryOpen(false)}
          onPlanCityWithBudget={handlePlanSpecificCityWithBudget}
          currentBudget={prefs.budget}
        />
      )}

      {/* 3. Saved Trips Modal (/saved-trips) */}
      {isSavedTripsOpen && (
        <SavedTripsModal
          savedTrips={savedTrips}
          onClose={() => setIsSavedTripsOpen(false)}
          onOpenTrip={(plan) => {
            setIsSavedTripsOpen(false);
            setSelectedPlanForModal(plan);
          }}
          onDeleteTrip={handleDeleteSavedTrip}
          onDuplicateTrip={handleDuplicateSavedTrip}
          onRecalculateTrip={handleRecalculateSavedTrip}
        />
      )}

      {/* 4. AI Travel Chat Floating Assistant */}
      <AiTravelChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        userPrefs={prefs}
        onApplyPlanUpdate={(updated) => {
          setPrefs((p) => ({ ...p, ...updated }));
          scrollToResults();
        }}
      />
    </div>
  );
}
