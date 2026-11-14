import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, RotateCcw, SkipForward, MapPin, Warehouse, Cpu } from 'lucide-react';
import api from '../../services/api';
import { RoadNode, RoadEdge } from '../../types';
import { Spinner } from '../Spinner';

export const DijkstraLab: React.FC = () => {
  const [nodes, setNodes] = useState<RoadNode[]>([]);
  const [edges, setEdges] = useState<RoadEdge[]>([]);
  const [startNodeId, setStartNodeId] = useState<string>('');
  const [endNodeId, setEndNodeId] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Stepping animation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const [nRes, eRes] = await Promise.all([
          api.get('/delivery/nodes'),
          api.get('/delivery/edges'),
        ]);
        if (nRes.data.success && eRes.data.success) {
          setNodes(nRes.data.nodes);
          setEdges(eRes.data.edges);

          const depot = nRes.data.nodes.find((n: RoadNode) => n.nodeType === 'DEPOT');
          const other = nRes.data.nodes.find((n: RoadNode) => n.name === 'Golpark');

          setStartNodeId(depot?.id || nRes.data.nodes[0].id);
          setEndNodeId(other?.id || nRes.data.nodes[1].id);
        }
      } catch (err) {
        console.error('Failed to load graph nodes', err);
      } finally {
        setInitLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const runDijkstra = async () => {
    if (!startNodeId || !endNodeId) return;
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);
    try {
      const res = await api.post('/algo/dijkstra', { startNodeId, endNodeId });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Dijkstra query failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startNodeId && endNodeId) {
      runDijkstra();
    }
  }, [startNodeId, endNodeId]);

  // Stepping timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && data?.steps && currentStepIndex < data.steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 700);
    } else if (currentStepIndex >= (data?.steps?.length || 0) - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, data]);

  if (initLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const steps = data?.steps || [];
  const currentStep = steps[currentStepIndex] || null;

  // Build shortest path coordinates for map
  const pathPositions: [number, number][] = (data?.path || [])
    .map((nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      return node ? [node.latitude, node.longitude] : null;
    })
    .filter(Boolean) as [number, number][];

  // Helper node icon
  const getMarkerIcon = (nodeId: string) => {
    const isStart = nodeId === startNodeId;
    const isEnd = nodeId === endNodeId;
    const isCurrentExtracted = currentStep?.extracted === nodeId;
    const isVisited = currentStep?.visited?.includes(nodeId);

    const color = isStart
      ? '#ea580c'
      : isEnd
      ? '#10b981'
      : isCurrentExtracted
      ? '#dc2626'
      : isVisited
      ? '#3b82f6'
      : '#9ca3af';

    return L.divIcon({
      className: 'dijkstra-pin',
      html: `
        <div style="
          background-color: ${color};
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 10px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${isStart ? 'S' : isEnd ? 'E' : '•'}
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Intro info box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center space-x-2 text-blue-950 font-extrabold text-sm">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Algorithm 2: Dijkstra's Single-Source Shortest Path (SSSP)</span>
        </div>
        <p className="text-blue-900 leading-relaxed text-[11px]">
          Pure TypeScript implementation with an array-based binary min-heap priority queue (O((V + E) log V)). Computes exact road network shortest distance and reconstructs the minimum-weight sequence of intersections between Traffic Chowk Depot and customer drop-off points.
        </p>
      </div>

      {/* Selectors & Playback Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <label className="block font-bold text-gray-800 mb-1.5">
            Source Node (Start)
          </label>
          <select
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 bg-white"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} {n.nodeType === 'DEPOT' ? '(Central Warehouse)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-gray-800 mb-1.5">
            Target Node (Destination)
          </label>
          <select
            value={endNodeId}
            onChange={(e) => setEndNodeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 bg-white"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Animation Playback Bar */}
      {steps.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play Stepper'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
              }}
              disabled={currentStepIndex >= steps.length - 1}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="text-gray-600 font-semibold pl-2">
              Iteration {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Extracted Min:</span>
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-red-100 text-red-800">
              {currentStep?.extractedName || 'None'}
            </span>
          </div>
        </div>
      )}

      {/* Map + Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaflet Map with Path Highlight */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Butwal Road Network Visualization</span>
            </h4>
            {data && (
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Shortest Distance: {data.distance.toFixed(2)} km
              </span>
            )}
          </div>

          <div className="h-80 rounded-xl overflow-hidden border border-gray-100 relative">
            <MapContainer
              center={[27.7006, 83.4484]}
              zoom={14}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Road Edges */}
              {edges.map((edge) => {
                const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
                const toNode = nodes.find((n) => n.id === edge.toNodeId);
                if (!fromNode || !toNode) return null;

                return (
                  <Polyline
                    key={edge.id}
                    positions={[
                      [fromNode.latitude, fromNode.longitude],
                      [toNode.latitude, toNode.longitude],
                    ]}
                    pathOptions={{ color: '#d1d5db', weight: 2 }}
                  />
                );
              })}

              {/* Computed Shortest Path */}
              {pathPositions.length > 1 && (
                <Polyline
                  positions={pathPositions}
                  pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.9 }}
                />
              )}

              {/* Nodes */}
              {nodes.map((node) => (
                <Marker
                  key={node.id}
                  position={[node.latitude, node.longitude]}
                  icon={getMarkerIcon(node.id)}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-gray-900">{node.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        Distance from source:{' '}
                        {currentStep?.distances?.[node.id] !== undefined
                          ? currentStep.distances[node.id] === -1
                            ? '∞'
                            : `${currentStep.distances[node.id].toFixed(2)} km`
                          : 'Uncalculated'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Path sequence readout */}
          {data?.pathNames && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-900">
              <span className="font-bold block mb-1">Optimal Shortest Path:</span>
              <div className="flex flex-wrap items-center gap-1.5 font-mono">
                {data.pathNames.map((name: string, i: number) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-blue-400">→</span>}
                    <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-semibold">
                      {name}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Distance Array & PQ Extraction Table */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-gray-900">
              Dijkstra Relaxation & Distance Table
            </h4>
            <span className="text-[10px] text-gray-400 font-mono">
              Live Priority Queue Updates
            </span>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-80 overflow-y-auto text-xs">
            <div className="bg-gray-100 font-bold text-gray-700 px-3 py-2 grid grid-cols-12 gap-2">
              <span className="col-span-5">Road Node</span>
              <span className="col-span-4 text-center">Distance from Source</span>
              <span className="col-span-3 text-right">Status</span>
            </div>

            {nodes.map((node) => {
              const dist = currentStep?.distances?.[node.id];
              const isExtracted = currentStep?.extracted === node.id;
              const isVisited = currentStep?.visited?.includes(node.id);
              const isUpdated = currentStep?.updated?.includes(node.id);

              return (
                <div
                  key={node.id}
                  className={`px-3 py-2 grid grid-cols-12 gap-2 items-center transition-colors ${
                    isExtracted
                      ? 'bg-red-50 font-bold'
                      : isUpdated
                      ? 'bg-amber-50 font-semibold'
                      : isVisited
                      ? 'bg-gray-50'
                      : 'bg-white'
                  }`}
                >
                  <span className="col-span-5 font-medium text-gray-800 truncate">
                    {node.name}
                  </span>
                  <span className="col-span-4 text-center font-mono">
                    {dist === undefined || dist === -1 ? (
                      <span className="text-gray-400">∞ (Infinity)</span>
                    ) : (
                      <span className="font-bold text-blue-700">{dist.toFixed(2)} km</span>
                    )}
                  </span>
                  <span className="col-span-3 text-right">
                    {isExtracted ? (
                      <span className="text-red-700 font-bold text-[10px]">EXTRACTED</span>
                    ) : isUpdated ? (
                      <span className="text-amber-700 font-bold text-[10px]">RELAXED</span>
                    ) : isVisited ? (
                      <span className="text-emerald-700 text-[10px]">VISITED</span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">UNVISITED</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
