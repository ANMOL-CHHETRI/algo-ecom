import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CheckCircle2, Phone } from 'lucide-react';
import api from '../../services/api';
import { DeliveryBatch, RoadNode } from '../../types';
import { StopCard } from '../../components/courier/StopCard';
import { BatchMap } from '../../components/admin/BatchMap';
import { Spinner } from '../../components/Spinner';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<DeliveryBatch | null>(null);
  const [nodes, setNodes] = useState<RoadNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatch = async () => {
    if (!id) return;
    try {
      const [batchRes, nodesRes] = await Promise.all([
        api.get(`/delivery/batches/${id}`),
        api.get('/delivery/nodes'),
      ]);
      if (batchRes.data.success) setBatch(batchRes.data.batch);
      if (nodesRes.data.success) setNodes(nodesRes.data.nodes);
    } catch (err) {
      console.error('Failed to load batch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const handleCompleteStop = async (stopId: string) => {
    try {
      await api.put(`/delivery/stops/${stopId}/complete`);
      fetchBatch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete stop');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500">Loading delivery run navigation...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-20">
        <h3 className="text-base font-bold text-gray-900">Batch not found</h3>
        <Link to="/courier" className="text-emerald-600 text-xs mt-2 inline-block hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const mapStops = (batch.stops || []).map((s, idx) => ({
    sequence: idx,
    node: s.roadNode,
    isDepot: idx === 0,
  }));

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <Link
            to="/courier"
            className="text-gray-500 hover:text-emerald-700 flex items-center space-x-1 mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Batches</span>
          </Link>
          <h2 className="text-xl font-extrabold text-gray-900">{batch.batchNumber}</h2>
          <p className="text-gray-500 text-[11px]">
            Total Distance: <strong>{batch.totalDistanceKm?.toFixed(2)} km</strong> • Butwal Corridor
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {batch.status}
        </span>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-2">
        <h3 className="font-bold text-gray-800 flex items-center space-x-1.5">
          <MapPin className="w-4 h-4 text-orange-600" />
          <span>Interactive Route Corridor Navigation</span>
        </h3>
        <BatchMap stops={mapStops} nodes={nodes} className="h-72" />
      </div>

      {/* Stop Sequence Cards */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-gray-900">
          Delivery Drop Sequence ({batch.stops?.length || 0} stops)
        </h3>

        <div className="space-y-2.5">
          {batch.stops?.map((stop, idx) => {
            const stopOrders = (batch.deliveries || [])
              .filter((d) => d.order && d.order.roadNodeId === stop.roadNodeId)
              .map((d) => d.order!)
              .filter(Boolean);

            return (
              <StopCard
                key={stop.id}
                stop={stop}
                index={idx}
                onComplete={handleCompleteStop}
                isCompleted={stop.isCompleted}
                orders={stopOrders}
                isDepot={idx === 0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
