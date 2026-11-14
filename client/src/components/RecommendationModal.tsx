import React from 'react';
import { X, Sparkles, CheckCircle2, Calculator } from 'lucide-react';
import { RecommendedProduct, Product } from '../types';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct: Product;
  recommendation: RecommendedProduct;
}

export const RecommendationModal: React.FC<RecommendationModalProps> = ({
  isOpen,
  onClose,
  targetProduct,
  recommendation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-orange-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Pure TypeScript Cosine Similarity Algorithm</span>
          </div>
          <h2 className="text-xl font-bold">Why is this recommended?</h2>
          <p className="text-xs text-orange-100 mt-1">
            Mathematical vector space decomposition explaining recommendation logic for BCA Viva examiners.
          </p>
        </div>

        {/* Comparison card */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Current Product (Vector A)
              </span>
              <p className="font-bold text-sm text-gray-900">{targetProduct.name}</p>
              <p className="text-xs text-orange-600 font-semibold mt-0.5">
                Rs. {targetProduct.price.toLocaleString()}
              </p>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Recommended (Vector B)
              </span>
              <p className="font-bold text-sm text-gray-900">{recommendation.name}</p>
              <p className="text-xs text-orange-600 font-semibold mt-0.5">
                Rs. {recommendation.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Similarity Metric Pill */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {recommendation.similarity}%
              </div>
              <div>
                <h4 className="text-sm font-bold text-orange-950">Cosine Similarity Score</h4>
                <p className="text-xs text-orange-800 font-mono">
                  cos(θ) = (A · B) / (||A|| × ||B||) = {(recommendation.similarity / 100).toFixed(4)}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
              High Feature Overlap
            </span>
          </div>

          {/* Dimension by Dimension Breakdown */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Top Contributing Feature Dimensions
              </h3>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-56 overflow-y-auto text-xs">
              <div className="bg-gray-100 font-semibold text-gray-700 px-4 py-2 grid grid-cols-12 gap-2">
                <span className="col-span-5">Feature Dimension</span>
                <span className="col-span-2 text-center">Vec A</span>
                <span className="col-span-2 text-center">Vec B</span>
                <span className="col-span-3 text-right">Contribution</span>
              </div>

              {recommendation.explanation && recommendation.explanation.length > 0 ? (
                recommendation.explanation.slice(0, 8).map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 grid grid-cols-12 gap-2 items-center ${
                      item.product > 0 ? 'bg-emerald-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="col-span-5 flex items-center space-x-1.5 font-medium text-gray-800 truncate">
                      {item.product > 0 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 shrink-0" />
                      )}
                      <span className="font-mono text-[11px] truncate">{item.dimension}</span>
                    </div>
                    <span className="col-span-2 text-center text-gray-600 font-mono">
                      {item.aValue.toFixed(2)}
                    </span>
                    <span className="col-span-2 text-center text-gray-600 font-mono">
                      {item.bValue.toFixed(2)}
                    </span>
                    <span
                      className={`col-span-3 text-right font-mono font-bold ${
                        item.product > 0 ? 'text-emerald-700' : 'text-gray-400'
                      }`}
                    >
                      {item.product > 0 ? `+${item.product.toFixed(3)}` : '0.000'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No overlapping features found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>Formula: Normalized Multi-Hot & Price Embeddings</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
