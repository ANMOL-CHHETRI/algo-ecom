import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';
import { DeliveryBatch } from '../../types';
import { Spinner } from '../../components/Spinner';

export const CourierDashboard: React.FC = () => {
  const [batches, setBatches] = useState<DeliveryBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/delivery/batches');
        if (res.data.success) {
          setBatches(res.data.batches);
        }
      } catch (err) {
        console.error('Failed to load courier batches', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500">Loading assigned delivery runs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Assigned Delivery Batches</h2>
        <p className="text-gray-500">
          Optimized routes originating from Traffic Chowk Central Depot in Butwal.
        </p>
      </div>

      {batches.length > 0 ? (
        <div className="space-y-4">
          {batches.map((batch) => {
            const completedStops = batch.stops?.filter((s) => s.isCompleted).length || 0;
            const totalStops = batch.stops?.length || 0;
            const progressPercent = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {batch.batchNumber}
                    </span>
                    <p className="text-gray-500 text-[11px]">
                      Created on {new Date(batch.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      batch.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {batch.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-600 font-semibold">
                    <span>Delivery Progress</span>
                    <span>
                      {completedStops} of {totalStops} stops completed ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>Total Distance: <strong>{batch.totalDistanceKm?.toFixed(2)} km</strong></span>
                  </div>

                  <Link
                    to={`/courier/batch/${batch.id}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center space-x-1 shadow-sm"
                  >
                    <span>View Navigation & Stops</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Truck className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No active delivery batches assigned</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            When an administrator runs the Dijkstra + TSP optimizer in the Admin panel and assigns it to you, it will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
