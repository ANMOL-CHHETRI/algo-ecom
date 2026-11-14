import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 text-xs border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
            <p className="text-gray-400 leading-relaxed">
              Localized Algorithm-Driven E-Commerce Platform developed as a BCA Final Year Academic Project, demonstrating Explainable Data Structures & Algorithms.
            </p>
            <div className="flex items-center space-x-2 text-orange-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>BCA Academic Demonstration System</span>
            </div>
          </div>

          {/* Localization info */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Butwal Regional Hub
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <span>Central Depot: Traffic Chowk / Kalikanagar, Butwal Sub-Metropolitan, Lumbini, Nepal</span>
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

          {/* Quick links */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Academic Modules
            </h4>
            <ul className="space-y-1.5 text-gray-400">
              <li>
                <Link to="/algo-lab" className="hover:text-orange-400 transition flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Algorithm Laboratory (Viva)</span>
                </Link>
              </li>
              <li>
                <Link to="/algo-lab?tab=cosine" className="hover:text-orange-400 transition">
                  Cosine Similarity Recommender
                </Link>
              </li>
              <li>
                <Link to="/algo-lab?tab=dijkstra" className="hover:text-orange-400 transition">
                  Dijkstra SSSP Butwal Road Graph
                </Link>
              </li>
              <li>
                <Link to="/algo-lab?tab=tsp" className="hover:text-orange-400 transition">
                  Nearest-Neighbor TSP Batching
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
              Supported Payment & Coverage
            </h4>
            <p className="text-gray-400">
              Cash on Delivery (COD) across 10 Butwal road intersections (Traffic Chowk, Golpark, Devinagar, Milanchowk, Deepnagar, Kalikanagar, Drivertole, Belbas).
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px]">
                eSewa
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-mono text-[10px]">
                Khalti
              </span>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono text-[10px]">
                Fonepay
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800 font-mono text-[10px]">
                COD (NPR)
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 text-center text-gray-500 text-[11px] flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} Algorithm-Driven E-Commerce. BCA Final Year Project. Butwal, Nepal.</p>
          <div className="flex space-x-4">
            <span className="text-gray-400">Coordinates: 27.7006° N, 83.4484° E</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
