import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoadNode } from '../../types';

interface BatchMapProps {
  stops: Array<{
    sequence: number;
    node: RoadNode;
    isDepot?: boolean;
    orders?: any[];
  }>;
  routeLegs?: Array<{
    path: string[];
    distanceKm: number;
  }>;
  nodes: RoadNode[];
  className?: string;
}

export const BatchMap: React.FC<BatchMapProps> = ({
  stops,
  routeLegs,
  nodes,
  className = 'h-96',
}) => {
  const butwalCenter: [number, number] = [27.7006, 83.4484];

  // Helper to create numbered custom leaflet divIcon
  const createNumberedIcon = (num: number, isDepot: boolean) => {
    return L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="
          background-color: ${isDepot ? '#dc2626' : '#ea580c'};
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11px;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          ${isDepot ? '★' : num}
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  };

  // Build polyline positions in sequence order
  const polylinePositions: [number, number][] = stops
    .filter((s) => s.node)
    .map((s) => [s.node.latitude, s.node.longitude]);

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200 shadow-sm relative ${className}`}>
      <MapContainer center={butwalCenter} zoom={14} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Sequenced Polyline */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#ea580c',
              weight: 4,
              opacity: 0.8,
              dashArray: '6, 8',
            }}
          />
        )}

        {/* All background road nodes */}
        {nodes.map((node) => {
          const isStop = stops.some((s) => s.node?.id === node.id);
          if (isStop) return null; // rendered as numbered stop instead

          return (
            <Marker
              key={node.id}
              position={[node.latitude, node.longitude]}
              icon={L.divIcon({
                className: 'bg-node',
                html: `<div style="background-color: #9ca3af; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid white;"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5],
              })}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-gray-800">{node.name}</p>
                  <p className="text-[10px] text-gray-500">Unvisited Node</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Numbered Stops */}
        {stops.map((stop, idx) => {
          if (!stop.node) return null;
          const isDepot = stop.isDepot || idx === 0;

          return (
            <Marker
              key={`${stop.node.id}-${idx}`}
              position={[stop.node.latitude, stop.node.longitude]}
              icon={createNumberedIcon(idx, isDepot)}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <span className="font-bold text-gray-900 block">
                    {isDepot ? 'Warehouse Depot' : `Stop #${idx}: ${stop.node.name}`}
                  </span>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {stop.node.latitude.toFixed(4)}°N, {stop.node.longitude.toFixed(4)}°E
                  </p>
                  {stop.orders && stop.orders.length > 0 && (
                    <div className="pt-1 border-t border-gray-100 text-[10px]">
                      <span className="font-semibold text-gray-700">Orders to drop:</span>
                      <ul className="list-disc list-inside text-gray-600">
                        {stop.orders.map((o: any) => (
                          <li key={o.id}>#{o.orderNumber} ({o.customer?.name})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
