import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoadNode } from '../types';
import api from '../services/api';
import { MapPin, Warehouse } from 'lucide-react';

// Fix Leaflet default icon bug in React
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const depotIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface DeliveryMapProps {
  selectedNodeId?: string | null;
  onSelectNode: (node: RoadNode) => void;
  className?: string;
}

// Subcomponent to handle map clicks and map to nearest node
function MapClickHandler({
  nodes,
  onSelect,
}: {
  nodes: RoadNode[];
  onSelect: (node: RoadNode) => void;
}) {
  useMapEvents({
    click(e) {
      if (nodes.length === 0) return;
      const { lat, lng } = e.latlng;

      // Find geographically closest node
      let closestNode = nodes[0];
      let minDistance = Infinity;

      for (const node of nodes) {
        const d = Math.hypot(node.latitude - lat, node.longitude - lng);
        if (d < minDistance) {
          minDistance = d;
          closestNode = node;
        }
      }

      onSelect(closestNode);
    },
  });

  return null;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  selectedNodeId,
  onSelectNode,
  className = 'h-80',
}) => {
  const [nodes, setNodes] = useState<RoadNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await api.get('/delivery/nodes');
        if (res.data.success) {
          setNodes(res.data.nodes);
        }
      } catch (err) {
        console.error('Failed to load Butwal nodes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const butwalCenter: [number, number] = [27.7006, 83.4484]; // Traffic Chowk

  if (loading) {
    return (
      <div className={`w-full bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-500 ${className}`}>
        Loading Butwal Road Network...
      </div>
    );
  }

  return (
    <div className={`relative z-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      <MapContainer
        center={butwalCenter}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler nodes={nodes} onSelect={onSelectNode} />

        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isDepot = node.nodeType === 'DEPOT';

          const icon = isSelected ? selectedIcon : isDepot ? depotIcon : defaultIcon;

          return (
            <Marker
              key={node.id}
              position={[node.latitude, node.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectNode(node),
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <div className="font-bold text-gray-900 flex items-center space-x-1">
                    {isDepot ? <Warehouse className="w-3.5 h-3.5 text-red-600" /> : <MapPin className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{node.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {isDepot ? 'Central Fulfillment Depot' : 'Delivery Intersection Node'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">
                    {node.latitude.toFixed(4)}°N, {node.longitude.toFixed(4)}°E
                  </p>
                  <button
                    onClick={() => onSelectNode(node)}
                    className="mt-2 w-full bg-orange-600 text-white font-semibold py-1 rounded text-[11px] hover:bg-orange-700 transition"
                  >
                    Select this Landmark
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Overlay legend */}
      <div className="absolute top-2 right-2 z-[400] bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200 text-[10px] space-y-1">
        <div className="font-bold text-gray-800">Butwal Node Guide:</div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>Central Depot (Traffic Chowk)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>Road Intersection</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Selected Drop-off Point</span>
        </div>
      </div>
    </div>
  );
};
