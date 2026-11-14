import { describe, it, expect } from 'vitest';
import { buildAdjacencyList, dijkstra, reconstructPath } from '../dijkstra';
import type { RoadNode, RoadEdge } from '../dijkstra';

const nodes: RoadNode[] = [
  { id: 'A', name: 'Node A', latitude: 0, longitude: 0 },
  { id: 'B', name: 'Node B', latitude: 0, longitude: 0 },
  { id: 'C', name: 'Node C', latitude: 0, longitude: 0 },
];

const edges: RoadEdge[] = [
  { id: 'e1', fromNodeId: 'A', toNodeId: 'B', distanceKm: 1, bidirectional: true },
  { id: 'e2', fromNodeId: 'B', toNodeId: 'C', distanceKm: 2, bidirectional: true },
];

describe('dijkstra', () => {
  it('computes correct distances in linear graph A-B-C', () => {
    const graph = buildAdjacencyList(nodes, edges);
    const { distances } = dijkstra(graph, 'A');
    expect(distances.get('A')).toBe(0);
    expect(distances.get('B')).toBe(1);
    expect(distances.get('C')).toBe(3);
  });

  it('distance to disconnected node is Infinity', () => {
    const isolatedNodes: RoadNode[] = [
      ...nodes,
      { id: 'D', name: 'Node D', latitude: 0, longitude: 0 },
    ];
    const graph = buildAdjacencyList(isolatedNodes, edges);
    const { distances } = dijkstra(graph, 'A');
    expect(distances.get('D')).toBe(Infinity);
  });

  it('distance from node to itself is 0', () => {
    const graph = buildAdjacencyList(nodes, edges);
    const { distances } = dijkstra(graph, 'B');
    expect(distances.get('B')).toBe(0);
  });

  it('reconstructPath returns correct path', () => {
    const graph = buildAdjacencyList(nodes, edges);
    const { previous } = dijkstra(graph, 'A');
    const path = reconstructPath(previous, 'C');
    expect(path).toEqual(['A', 'B', 'C']);
  });

  it('records steps for visualization', () => {
    const graph = buildAdjacencyList(nodes, edges);
    const { steps } = dijkstra(graph, 'A');
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].iteration).toBe(1);
  });
});
