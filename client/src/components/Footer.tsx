import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Cpu, ArrowRight, Sparkles, Route, Truck, Search } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-10 pb-8 text-xs border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Prominent BCA Final Year Viva Demonstration Banner */}
        <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-gray-900 border border-purple-800/50 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>BCA Final Year Viva Demonstration</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Academic Algorithm Laboratory (Algo Lab)
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                4 pure-TypeScript algorithms built from scratch without black-box APIs, featuring interactive step-by-step visualizers and mathematical explainability localized for Butwal, Nepal.
              </p>
            </div>

            <Link
              to="/algo-lab"
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition flex items-center space-x-2 shrink-0 group border border-purple-500/50"
            >
              <Cpu className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Launch BCA Algo Lab</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Algorithm Quick Launch Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-purple-900/40 text-[11px]">
            <Link
              to="/algo-lab?tab=cosine"
              className="bg-purple-900/30 hover:bg-purple-900/60 border border-purple-800/40 p-2.5 rounded-xl transition flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <span className="p-1.5 rounded-lg bg-purple-800/50 text-purple-300">📐</span>
              <span className="font-semibold truncate">Cosine Recommender</span>
            </Link>
            <Link
              to="/algo-lab?tab=dijkstra"
              className="bg-indigo-900/30 hover:bg-indigo-900/60 border border-indigo-800/40 p-2.5 rounded-xl transition flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <Route className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-semibold truncate">Dijkstra SSSP Graph</span>
            </Link>
            <Link
              to="/algo-lab?tab=tsp"
              className="bg-amber-900/30 hover:bg-amber-900/60 border border-amber-800/40 p-2.5 rounded-xl transition flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold truncate">Nearest-Neighbor TSP</span>
            </Link>
            <Link
              to="/algo-lab?tab=levenshtein"
              className="bg-emerald-900/30 hover:bg-emerald-900/60 border border-emerald-800/40 p-2.5 rounded-xl transition flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold truncate">Levenshtein Search</span>
            </Link>
          </div>
        </div>

        {/* 4 Column Standard Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-lg">
                ब
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                BuTwal<span className="text-orange-500">.ECom</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Production-grade localized e-commerce platform for Butwal, Nepal. Demonstrates real-time graph routing, multi-stop courier batching, and personalized vector search.
            </p>
            <div className="flex items-center space-x-2 text-orange-400 font-medium text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>BCA Academic Demonstration System</span>
            </div>
          </div>

          {/* Localization info */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Butwal Regional Hub
            </h4>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <span>Central Depot: Traffic Chowk / Kalikanagar, Butwal, Rupandehi, Lumbini Province, Nepal</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+977-9856012345 / 071-540000</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>support@butwalecom.com</span>
              </li>
            </ul>
          </div>

          {/* Academic Modules */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Algorithms & Viva Demos
            </h4>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li>
                <Link to="/algo-lab" className="hover:text-purple-400 transition flex items-center space-x-1 font-semibold text-purple-300">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Interactive Algo Lab</span>
                </Link>
              </li>
              <li>
                <Link to="/algo-lab?tab=cosine" className="hover:text-orange-400 transition">
                  Cosine Similarity Vector Space
                </Link>
              </li>
              <li>
                <Link to="/algo-lab?tab=dijkstra" className="hover:text-orange-400 transition">
                  Dijkstra SSSP Butwal Road Network
                </Link>
              </li>
              <li>
                <Link to="/algo-lab?tab=tsp" className="hover:text-orange-400 transition">
                  Traveling Salesperson (TSP) Sequencing
                </Link>
              </li>
              <li>
                <Link to="/algo-lab?tab=levenshtein" className="hover:text-orange-400 transition">
                  Levenshtein Typo-Tolerant Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Node Network */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Supported Payments & Delivery
            </h4>
            <p className="text-gray-400 text-[11px]">
              Instant QR transfer via eSewa & Khalti (0 extra fees), or Cash on Delivery (+Rs. 10 handling charge) across 10 Butwal road intersections.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px]">
                eSewa QR
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-mono text-[10px]">
                Khalti QR
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800 font-mono text-[10px]">
                COD (+Rs. 10)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-gray-800 text-center text-gray-500 text-[11px] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} Algorithm-Driven E-Commerce Platform. BCA Final Year Academic Project. Butwal, Nepal.</p>
          <div className="flex space-x-4">
            <span className="text-gray-400">Coordinates: 27.7006° N, 83.4484° E</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
