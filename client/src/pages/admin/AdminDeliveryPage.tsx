import React, { useState, useEffect } from 'react';
import { Route, MapPin, Truck, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';
import { Order, User, DeliveryBatch, RoadNode } from '../../types';
import { RouteOptimizationPanel } from '../../components/admin/RouteOptimizationPanel';
import { BatchMap } from '../../components/admin/BatchMap';
import { Spinner } from '../../components/Spinner';

export const AdminDeliveryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<DeliveryBatch[]>([]);
  const [nodes, setNodes] = useState<RoadNode[]>([]);
  const [couriers, setCouriers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Active optimization preview
  const [activeOptResult, setActiveOptResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [ordersRes, batchesRes, nodesRes] = await Promise.all([
        api.get('/orders'),
        api.get('/delivery/batches'),
        api.get('/delivery/nodes'),
      ]);

      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
      if (batchesRes.data.success) setBatches(batchesRes.data.batches);
      if (nodesRes.data.success) setNodes(nodesRes.data.nodes);

      // Create sample courier list or extract
      setCouriers([
        {
          id: 'courier-sample-1',
          name: 'Ram Bahadur Thapa',
          email: 'courier@butwalecom.com',
          phone: '+977-9847123456',
          role: 'COURIER',
        },
      ]);
    } catch (err) {
      console.error('Failed to load delivery batch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500">Loading delivery networks & batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-xs">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">
          Delivery Batching & Graph Route Optimization
        </h2>
        <p className="text-gray-500">
          Solves the Traveling Salesperson Problem (TSP) using Dijkstra shortest path distance matrix on Butwal Road Network.
        </p>
      </div>

      {/* Route Optimizer Panel */}
      <RouteOptimizationPanel
        orders={orders}
        couriers={couriers}
        onOptimizationSuccess={(res) => setActiveOptResult(res)}
        onBatchCreated={fetchData}
      />

      {/* Visual Map of the Optimized Sequence */}
      {activeOptResult && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Optimized Multi-Stop Delivery Corridor (Butwal Graph)</span>
            </h3>
            <span className="text-[11px] font-mono font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
              Total Route: {activeOptResult.tspResult.totalDistanceKm.toFixed(2)} km
            </span>
          </div>

          <BatchMap
            stops={activeOptResult.stopDetails}
            routeLegs={activeOptResult.routeLegs}
            nodes={nodes}
            className="h-96"
          />
        </div>
      )}

      {/* Existing Delivery Batches */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>Active & Historical Delivery Batches ({batches.length})</span>
        </h3>

        {batches.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <div key={batch.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {batch.batchNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        batch.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : batch.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>

                  <p className="text-gray-500 text-[11px]">
                    Assigned Courier: <strong>{batch.courier?.name || 'Unassigned'}</strong> • Total Distance:{' '}
                    <strong>{batch.totalDistanceKm?.toFixed(2) || '0.00'} km</strong>
                  </p>

                  <div className="flex items-center space-x-1 text-[11px] text-gray-600 pt-1">
                    <span className="font-semibold">Stops:</span>
                    {batch.stops?.map((stop, i) => (
                      <span key={stop.id} className="inline-flex items-center">
                        {i > 0 && <span className="mx-1 text-gray-400">→</span>}
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          {stop.roadNode?.name || `Stop ${i + 1}`}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right text-[11px] text-gray-400 font-mono">
                  {new Date(batch.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            No delivery batches created yet. Select orders above to generate your first batch.
          </div>
        )}
      </div>
    </div>
  );
};
