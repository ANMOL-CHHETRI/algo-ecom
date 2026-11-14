import React, { useState, useEffect } from 'react';
import { Type, Sparkles, CheckCircle2, ArrowRight, CornerDownRight } from 'lucide-react';
import api from '../../services/api';
import { Spinner } from '../Spinner';

export const LevenshteinLab: React.FC = () => {
  const [stringA, setStringA] = useState('lapotp');
  const [stringB, setStringB] = useState('laptop');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const compute = async () => {
    if (!stringA && !stringB) return;
    setLoading(true);
    try {
      const res = await api.post('/algo/levenshtein', { a: stringA, b: stringB });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Levenshtein error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    compute();
  }, [stringA, stringB]);

  const presetExamples = [
    { a: 'lapotp', b: 'laptop', note: 'Typo in search bar' },
    { a: 'mblie', b: 'mobile', note: 'Phonetic omission' },
    { a: 'samsng', b: 'samsung', note: 'Missing vowel' },
    { a: 'kitten', b: 'sitting', note: 'Classic academic benchmark' },
  ];

  // Helper to determine if cell (i, j) is in the backtracked path
  const isCellInPath = (i: number, j: number) => {
    return data?.path?.some((p: any) => p.i === i && p.j === j);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Intro box */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center space-x-2 text-purple-950 font-extrabold text-sm">
          <Type className="w-4 h-4 text-purple-600" />
          <span>Algorithm 4: Dynamic Programming Levenshtein Distance Matrix</span>
        </div>
        <p className="text-purple-900 leading-relaxed text-[11px]">
          Powers our search bar auto-correction ("Did you mean: [Corrected Term]?"). Calculates the minimum number of single-character insertions, deletions, or substitutions required to transform String A into String B using a 2D dynamic programming recurrence relation:
        </p>
        <div className="bg-white/80 border border-purple-200 rounded-lg p-2.5 font-mono text-center text-xs font-bold text-purple-950">
          D[i, j] = min( D[i-1, j] + 1, D[i, j-1] + 1, D[i-1, j-1] + (A[i] ≠ B[j] ? 1 : 0) )
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-gray-500 uppercase">Presets:</span>
        {presetExamples.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => {
              setStringA(ex.a);
              setStringB(ex.b);
            }}
            className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition text-[11px]"
          >
            <strong>{ex.a}</strong> → <strong>{ex.b}</strong> ({ex.note})
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <label className="block font-bold text-gray-800 mb-1.5">
            String A (Input / Search Query)
          </label>
          <input
            type="text"
            value={stringA}
            onChange={(e) => setStringA(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-500"
            placeholder="Type word..."
          />
        </div>

        <div>
          <label className="block font-bold text-gray-800 mb-1.5">
            String B (Candidate / Catalog Term)
          </label>
          <input
            type="text"
            value={stringB}
            onChange={(e) => setStringB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-500"
            placeholder="Target word..."
          />
        </div>
      </div>

      {/* DP Matrix Visualization */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2">
          <Spinner size="lg" />
          <p className="text-gray-500">Constructing 2D dynamic programming grid...</p>
        </div>
      ) : data?.matrix ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Result Metric */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {data.distance}
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Minimum Edit Distance
                </span>
                <h3 className="text-base font-extrabold text-gray-900">
                  {data.distance === 0
                    ? 'Identical Match'
                    : data.distance <= 2
                    ? 'Accepted Auto-Correction (Within Search Tolerance)'
                    : 'Beyond Auto-Correction Threshold (> 2 edits)'}
                </h3>
                <p className="text-gray-500 text-[11px] font-mono mt-0.5">
                  Operations: {data.distance} total insertion(s), deletion(s), or substitution(s)
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Grid: {data.matrix.length} × {data.matrix[0].length} Cells
              </span>
            </div>
          </div>

          {/* 2D DP Matrix HTML Table */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>2D Dynamic Programming Cost Matrix with Backtrack Alignment</span>
              </h4>
              <div className="flex items-center space-x-3 text-[10px]">
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-amber-400" />
                  <span>Optimal Backtrack Path</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="border-collapse mx-auto font-mono text-center text-xs">
                <thead>
                  <tr>
                    <th className="p-2 border border-gray-200 bg-gray-100 text-gray-400 font-normal">
                      i\j
                    </th>
                    <th className="p-2 border border-gray-200 bg-gray-100 font-bold text-gray-600">
                      ε
                    </th>
                    {stringB.split('').map((char, j) => (
                      <th
                        key={j}
                        className="p-2 border border-gray-200 bg-purple-50 text-purple-900 font-bold uppercase min-w-[36px]"
                      >
                        {char}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row: number[], i: number) => (
                    <tr key={i}>
                      <th className="p-2 border border-gray-200 bg-purple-50 text-purple-900 font-bold uppercase min-w-[36px]">
                        {i === 0 ? 'ε' : stringA[i - 1]}
                      </th>
                      {row.map((cell: number, j: number) => {
                        const inPath = isCellInPath(i, j);
                        const isFinal = i === stringA.length && j === stringB.length;

                        return (
                          <td
                            key={j}
                            className={`p-2.5 border transition-all ${
                              isFinal
                                ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                                : inPath
                                ? 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                                : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Backtracked alignment steps */}
            {data.path && (
              <div className="mt-4 p-3.5 bg-purple-50 rounded-xl border border-purple-100 space-y-1.5 text-[11px] text-purple-950">
                <span className="font-bold block">Backtracking Step Sequence:</span>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                  {data.path.map((p: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white border border-purple-200 font-semibold"
                    >
                      ({p.i}, {p.j}): {p.op}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
