import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calculator,
  BarChart3,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../services/api';
import { Product, formatNPR } from '../../types';
import { Spinner } from '../Spinner';

export const CosineLab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=50');
        if (res.data.success && res.data.products.length > 1) {
          setProducts(res.data.products);
          setSelectedA(res.data.products[0].id);
          setSelectedB(res.data.products[1].id);
        }
      } catch (err) {
        console.error('Failed to load products for Cosine Lab', err);
      } finally {
        setInitLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCompute = async () => {
    if (!selectedA || !selectedB) return;
    setLoading(true);
    try {
      const res = await api.post('/algo/cosine', {
        productIdA: selectedA,
        productIdB: selectedB,
      });
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error('Cosine calculation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedA && selectedB) {
      handleCompute();
    }
  }, [selectedA, selectedB]);

  if (initLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Format Recharts data comparing top overlapping vector dimensions
  const chartData = (result?.explanation || [])
    .slice(0, 10)
    .map((item: any) => ({
      name: item.dimension.replace(/category:|brand:/, ''),
      ProductA: Number(item.aValue.toFixed(2)),
      ProductB: Number(item.bValue.toFixed(2)),
    }));

  return (
    <div className="space-y-6 text-xs">
      {/* Intro info box */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center space-x-2 text-orange-900 font-extrabold text-sm">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span>Algorithm 1: Content-Based Filtering via Cosine Similarity</span>
        </div>
        <p className="text-orange-800 leading-relaxed text-[11px]">
          Represents products as high-dimensional numerical feature vectors containing multi-hot category & brand features, normalized price tier ratios (0.0 to 1.0), and weighted hardware/material specification attributes. Calculates the cosine of the angle between vectors:
        </p>
        <div className="bg-white/80 border border-orange-200 rounded-lg p-2.5 font-mono text-center text-xs font-bold text-orange-950">
          cos(θ) = (A · B) / (‖A‖ × ‖B‖) = Σ(Ai × Bi) / ( √Σ(Ai²) × √Σ(Bi²) )
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <label className="block font-bold text-gray-800 mb-1.5">
            Select Product A (Vector A)
          </label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({formatNPR(p.price)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-gray-800 mb-1.5">
            Select Product B (Vector B)
          </label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({formatNPR(p.price)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2">
          <Spinner size="lg" />
          <p className="text-gray-500">Vectorizing catalog and calculating dot product...</p>
        </div>
      ) : result ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Score card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                {result.similarity}%
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Computed Vector Similarity
                </span>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {result.similarity >= 75
                    ? 'Strong Match (Highly Recommended)'
                    : result.similarity >= 40
                    ? 'Moderate Match'
                    : 'Low Similarity (Distinct Vector Space)'}
                </h3>
                <p className="text-gray-500 text-[11px] font-mono mt-0.5">
                  Raw Scalar: {result.rawSimilarity.toFixed(6)} • Dimension Length: {result.vocabulary.length}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
                θ = {(Math.acos(Math.min(1, Math.max(-1, result.rawSimilarity))) * (180 / Math.PI)).toFixed(1)}° Angle
              </span>
            </div>
          </div>

          {/* Recharts Vector Feature Comparison */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                  <span>Feature Vector Dimension Comparison</span>
                </h4>
                <span className="text-[10px] text-gray-400 font-mono">
                  Normalized Feature Magnitudes
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="ProductA" fill="#ea580c" radius={[4, 4, 0, 0]} name={result.productA.name.slice(0, 15)} />
                    <Bar dataKey="ProductB" fill="#3b82f6" radius={[4, 4, 0, 0]} name={result.productB.name.slice(0, 15)} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Coordinate Breakdown Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-bold text-gray-800 flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-orange-600" />
                <span>Dot Product Mathematical Breakdown (Ai × Bi)</span>
              </h4>
              <span className="text-[10px] text-gray-400 font-mono">
                Showing non-zero contributing dimensions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left divide-y divide-gray-200 text-xs font-mono">
                <thead className="bg-gray-100 font-bold text-gray-600">
                  <tr>
                    <th className="px-4 py-2.5 font-sans">Feature Dimension</th>
                    <th className="px-4 py-2.5 text-center">Vec A (Ai)</th>
                    <th className="px-4 py-2.5 text-center">Vec B (Bi)</th>
                    <th className="px-4 py-2.5 text-right font-sans">Product (Ai × Bi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.explanation.map((item: any, idx: number) => (
                    <tr
                      key={idx}
                      className={item.product > 0 ? 'bg-emerald-50/40 font-semibold' : ''}
                    >
                      <td className="px-4 py-2 text-gray-800 font-sans flex items-center space-x-1.5">
                        {item.product > 0 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-gray-200 shrink-0" />
                        )}
                        <span>{item.dimension}</span>
                      </td>
                      <td className="px-4 py-2 text-center text-gray-600">{item.aValue.toFixed(3)}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{item.bValue.toFixed(3)}</td>
                      <td
                        className={`px-4 py-2 text-right ${
                          item.product > 0 ? 'text-emerald-700 font-bold' : 'text-gray-400'
                        }`}
                      >
                        {item.product > 0 ? `+${item.product.toFixed(4)}` : '0.0000'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
