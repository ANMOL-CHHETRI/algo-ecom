import React, { useState } from 'react';
import { Route, Sparkles, Check, ArrowRight, Truck, UserCheck, ShieldAlert } from 'lucide-react';
import { Order, User } from '../../types';
import api from '../../services/api';

interface RouteOptimizationPanelProps {
  orders: Order[];
  couriers: User[];
  onOptimizationSuccess: (result: any) => void;
  onBatchCreated: () => void;
}

export const RouteOptimizationPanel: React.FC<RouteOptimizationPanelProps> = ({
  orders,
  couriers,
  onOptimizationSuccess,
  onBatchCreated,
}) => {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<string>('');
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter pending orders with valid road nodes
  const routableOrders = orders.filter(
    (o) => o.roadNodeId && (o.orderStatus === 'PLACED' || o.orderStatus === 'PROCESSING')
  );

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === routableOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(routableOrders.map((o) => o.id));
    }
  };

  const toggleOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRunOptimization = async () => {
    if (selectedOrderIds.length === 0) {
      setErrorMsg('Please select at least 1 order to optimize delivery route.');
      return;
    }

    setIsOptimizing(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/delivery/optimize', { orderIds: selectedOrderIds });
      if (res.data.success) {
        setOptResult(res.data);
        onOptimizationSuccess(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCreateBatch = async () => {
    if (!optResult) return;
    setIsCreatingBatch(true);
    setErrorMsg(null);
    try {
      const stopNodeIds = optResult.tspResult.orderedStops;
      const res = await api.post('/delivery/batches', {
        orderIds: selectedOrderIds,
        stopNodeIds,
        totalDistanceKm: optResult.tspResult.totalDistanceKm,
        naiveDistanceKm: optResult.tspResult.naiveDistanceKm,
        algorithmLog: optResult.tspResult,
        courierId: selectedCourierId || null,
      });

      if (res.data.success) {
        setOptResult(null);
        setSelectedOrderIds([]);
        onBatchCreated();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create batch');
    } finally {
      setIsCreatingBatch(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
            <Route className="w-5 h-5 text-orange-600" />
            <span>Multi-Stop Route Optimizer (Dijkstra + TSP)</span>
          </h2>
          <p className="text-gray-500 text-[11px] mt-0.5">
            Select pending orders in Butwal to solve the Traveling Salesperson Problem heuristic.
          </p>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={isOptimizing || selectedOrderIds.length === 0}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isOptimizing
              ? 'Computing Dijkstra All-Pairs...'
              : `Optimize (${selectedOrderIds.length} orders)`}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 p-3 text-red-700 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Selectable Orders Checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-gray-800">
            Pending Orders with Designated Road Nodes ({routableOrders.length})
          </span>
          {routableOrders.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-orange-600 hover:underline font-semibold text-[11px]"
            >
              {selectedOrderIds.length === routableOrders.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {routableOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {routableOrders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);
              return (
                <div
                  key={order.id}
                  onClick={() => toggleOrder(order.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-gray-900 truncate">#{order.orderNumber}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      📍 {order.roadNode?.name || 'Unknown'}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-400">
            No active pending orders mapped to Butwal road nodes.
          </div>
        )}
      </div>

      {/* Optimization Results Panel */}
      {optResult && (
        <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-orange-200">
            <div>
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                Calculated Route Efficiency
              </span>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-xl font-black text-orange-950">
                  {optResult.tspResult.totalDistanceKm.toFixed(2)} km
                </span>
                <span className="text-xs text-gray-500 line-through">
                  Naive: {optResult.tspResult.naiveDistanceKm.toFixed(2)} km
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                  {optResult.tspResult.improvement.toFixed(1)}% Distance Saved
                </span>
              </div>
            </div>

            {/* Courier Assignment */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedCourierId}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Assign Courier (Optional)</option>
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || c.email})
                  </option>
                ))}
              </select>

              <button
                onClick={handleCreateBatch}
                disabled={isCreatingBatch}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <Truck className="w-4 h-4" />
                <span>{isCreatingBatch ? 'Dispatching...' : 'Dispatch Batch'}</span>
              </button>
            </div>
          </div>

          {/* Step-by-Step Decision Log */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2">
              Nearest-Neighbor Greedy Decision Sequence:
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {optResult.tspResult.steps.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-lg border border-orange-100 text-[11px] flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-[10px]">
                      {s.step}
                    </span>
                    <span className="font-semibold text-gray-800">{s.fromName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-orange-600">{s.toName}</span>
                  </div>
                  <span className="font-mono text-gray-600 font-bold">{s.distanceKm.toFixed(2)} km</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
