import React, { useState, useEffect } from 'react';
import { Route, Sparkles, Check, ArrowRight, MapPin, Calculator, Award } from 'lucide-react';
import api from '../../services/api';
import { RoadNode } from '../../types';
import { BatchMap } from '../admin/BatchMap';
import { Spinner } from '../Spinner';

export const TSPLab: React.FC = () => {
  const [nodes, setNodes] = useState<RoadNode[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await api.get('/delivery/nodes');
        if (res.data.success) {
          setNodes(res.data.nodes);

          // Select default 4 sample nodes
          const nonDepots = res.data.nodes.filter((n: RoadNode) => n.nodeType !== 'DEPOT');
          const sample = nonDepots.slice(0, 4).map((n: RoadNode) => n.id);
          setSelectedNodeIds(sample);
        }
      } catch (err) {
        console.error('Failed to load nodes for TSP Lab', err);
      } finally {
        setInitLoading(false);
      }
    };
    fetchNodes();
  }, []);

  const runTSP = async () => {
    if (selectedNodeIds.length === 0) return;
    setLoading(true);
    try {
      const res = await api.post('/algo/tsp', { stopNodeIds: selectedNodeIds });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('TSP failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedNodeIds.length > 0) {
      runTSP();
    }
  }, [selectedNodeIds]);

  const toggleNode = (id: string) => {
    setSelectedNodeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (initLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const depot = nodes.find((n) => n.nodeType === 'DEPOT');

  // Format stops for BatchMap
  const mapStops = (data?.result?.orderedStops || []).map((nodeId: string, idx: number) => {
    const node = nodes.find((n) => n.id === nodeId);
    return {
      sequence: idx,
      node: node || { id: nodeId, name: nodeId, latitude: 27.7, longitude: 83.4, nodeType: 'CUSTOMER_STOP' as const },
      isDepot: nodeId === depot?.id,
    };
  });

  return (
    <div className="space-y-6 text-xs">
      {/* Intro info box */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center space-x-2 text-emerald-950 font-extrabold text-sm">
          <Route className="w-4 h-4 text-emerald-600" />
          <span>Algorithm 3: Nearest-Neighbor Traveling Salesperson Problem (TSP)</span>
        </div>
        <p className="text-emerald-900 leading-relaxed text-[11px]">
          Greedy heuristic solving multi-stop order fulfillment in NP-hard complexity. Starting at the Central Warehouse Depot (Traffic Chowk), evaluates all-pairs shortest distances via Dijkstra matrix, greedily transitions to the closest unvisited customer drop-off node, and returns to the depot upon completion.
        </p>
      </div>

      {/* Node selection checklist */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-800">
            Select Delivery Drop-Off Nodes in Butwal ({selectedNodeIds.length} selected)
          </h4>
          <span className="text-[11px] text-gray-400">
            Depot: <strong>Traffic Chowk (Fixed Hub)</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {nodes
            .filter((n) => n.nodeType !== 'DEPOT')
            .map((node) => {
              const isSelected = selectedNodeIds.includes(node.id);
              return (
                <button
                  key={node.id}
                  onClick={() => toggleNode(node.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{node.name}</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Spinner size="lg" />
          <p className="text-gray-500">Computing distance matrix & greedy permutations...</p>
        </div>
      ) : data?.result ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Comparative Metrics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Optimized TSP Route
              </span>
              <span className="text-2xl font-black text-emerald-600">
                {data.result.totalDistanceKm.toFixed(2)} km
              </span>
              <p className="text-[11px] text-gray-500">Greedy Nearest Neighbor</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Unoptimized (Naive Sequence)
              </span>
              <span className="text-2xl font-black text-gray-500 line-through">
                {data.result.naiveDistanceKm.toFixed(2)} km
              </span>
              <p className="text-[11px] text-gray-500">Arbitrary order of placement</p>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Fuel & Distance Reduction
              </span>
              <span className="text-2xl font-black text-emerald-700 flex items-center space-x-1">
                <Award className="w-6 h-6 text-emerald-600" />
                <span>{data.result.improvement.toFixed(1)}%</span>
              </span>
              <p className="text-[11px] text-emerald-800">Route distance saved</p>
            </div>
          </div>

          {/* Map + Greedy Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Sequenced Stop Coordinates on Leaflet Map</span>
              </h4>
              <BatchMap stops={mapStops} nodes={nodes} className="h-80" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Greedy Decision Steps & Justification</span>
              </h4>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {data.result.steps.map((s: any) => (
                  <div
                    key={s.step}
                    className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1 text-[11px]"
                  >
                    <div className="flex items-center justify-between font-bold text-gray-800">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {s.step}
                        </span>
                        <span>{s.fromName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-emerald-700">{s.toName}</span>
                      </div>
                      <span className="font-mono text-emerald-900 font-bold">
                        {s.distanceKm.toFixed(2)} km
                      </span>
                    </div>
                    <p className="text-gray-500 text-[10px] pl-6 leading-relaxed">
                      {s.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
