import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Route, Cpu, Type, ArrowLeft, GraduationCap } from 'lucide-react';
import { CosineLab } from '../components/lab/CosineLab';
import { DijkstraLab } from '../components/lab/DijkstraLab';
import { TSPLab } from '../components/lab/TSPLab';
import { LevenshteinLab } from '../components/lab/LevenshteinLab';

export const AlgoLabPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'cosine';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabs = [
    {
      id: 'cosine',
      name: '1. Cosine Similarity',
      subtitle: 'Recommendation Engine',
      icon: Sparkles,
      color: 'text-orange-600',
    },
    {
      id: 'dijkstra',
      name: '2. Dijkstra SSSP',
      subtitle: 'Butwal Road Graph',
      icon: Cpu,
      color: 'text-blue-600',
    },
    {
      id: 'tsp',
      name: '3. Nearest-Neighbor TSP',
      subtitle: 'Delivery Batching',
      icon: Route,
      color: 'text-emerald-600',
    },
    {
      id: 'levenshtein',
      name: '4. Levenshtein Distance',
      subtitle: 'Typo-Tolerant Search',
      icon: Type,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-purple-800/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-purple-200">
            <GraduationCap className="w-4 h-4 text-purple-300" />
            <span>BCA Final Year Viva Demonstration Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Academic Algorithm Laboratory
          </h1>

          <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Live interactive visualizer built for external examiners to inspect all 4 hand-rolled TypeScript algorithms powering the Butwal E-Commerce Platform. Zero external black-box APIs.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-100'
                  : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${tab.color}`} />
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{tab.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{tab.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-transparent">
        {currentTab === 'cosine' && <CosineLab />}
        {currentTab === 'dijkstra' && <DijkstraLab />}
        {currentTab === 'tsp' && <TSPLab />}
        {currentTab === 'levenshtein' && <LevenshteinLab />}
      </div>
    </div>
  );
};
