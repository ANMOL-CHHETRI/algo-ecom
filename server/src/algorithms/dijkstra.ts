export interface RoadNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RoadEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceKm: number;
  bidirectional: boolean;
}

export interface GraphNeighbor {
  nodeId: string;
  distanceKm: number;
}

export type Graph = Map<string, GraphNeighbor[]>;

export interface DijkstraStep {
  iteration: number;
  extracted: string;
  extractedName: string;
  distanceToExtracted: number;
  distances: Record<string, number>;
  visited: string[];
  updated: string[];
}

export interface DijkstraResult {
  distances: Map<string, number>;
  previous: Map<string, string | null>;
  steps: DijkstraStep[];
}

// Hand-rolled min-heap priority queue
class MinHeap {
  private heap: Array<{ nodeId: string; priority: number }> = [];

  insert(nodeId: string, priority: number): void {
    this.heap.push({ nodeId, priority });
    this.heapifyUp(this.heap.length - 1);
  }

  extractMin(): { nodeId: string; priority: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    return min;
  }

  get size(): number { return this.heap.length; }

  private heapifyUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent].priority <= this.heap[idx].priority) break;
      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }

  private heapifyDown(idx: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
      if (smallest === idx) break;
      [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
      idx = smallest;
    }
  }
}

export function buildAdjacencyList(nodes: RoadNode[], edges: RoadEdge[]): Graph {
  const graph: Graph = new Map();
  
  for (const node of nodes) {
    graph.set(node.id, []);
  }
  
  for (const edge of edges) {
    graph.get(edge.fromNodeId)?.push({ nodeId: edge.toNodeId, distanceKm: edge.distanceKm });
    if (edge.bidirectional) {
      graph.get(edge.toNodeId)?.push({ nodeId: edge.fromNodeId, distanceKm: edge.distanceKm });
    }
  }
  
  return graph;
}

export function dijkstra(
  graph: Graph,
  startNodeId: string,
  nodeNameMap: Map<string, string> = new Map()
): DijkstraResult {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const steps: DijkstraStep[] = [];
  const pq = new MinHeap();
  
  // Initialize distances
  for (const nodeId of graph.keys()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
  }
  distances.set(startNodeId, 0);
  pq.insert(startNodeId, 0);
  
  let iteration = 0;
  
  while (pq.size > 0) {
    const extracted = pq.extractMin();
    if (!extracted) break;
    
    const { nodeId: currentId, priority: currentDist } = extracted;
    
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    const updatedNodes: string[] = [];
    const neighbors = graph.get(currentId) || [];
    
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.nodeId)) continue;
      
      const newDist = currentDist + neighbor.distanceKm;
      const existingDist = distances.get(neighbor.nodeId) ?? Infinity;
      
      if (newDist < existingDist) {
        distances.set(neighbor.nodeId, newDist);
        previous.set(neighbor.nodeId, currentId);
        pq.insert(neighbor.nodeId, newDist);
        updatedNodes.push(neighbor.nodeId);
      }
    }
    
    // Record step for visualization
    const distSnapshot: Record<string, number> = {};
    distances.forEach((v, k) => { distSnapshot[k] = v === Infinity ? -1 : v; });
    
    steps.push({
      iteration: ++iteration,
      extracted: currentId,
      extractedName: nodeNameMap.get(currentId) || currentId,
      distanceToExtracted: currentDist,
      distances: distSnapshot,
      visited: Array.from(visited),
      updated: updatedNodes,
    });
  }
  
  return { distances, previous, steps };
}

export function reconstructPath(
  previous: Map<string, string | null>,
  targetId: string
): string[] {
  const path: string[] = [];
  let current: string | null = targetId;
  
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }
  
  return path;
}

export function computeDistanceMatrix(
  graph: Graph,
  nodeIds: string[],
  nodeNameMap: Map<string, string> = new Map()
): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>();
  
  for (const sourceId of nodeIds) {
    const { distances } = dijkstra(graph, sourceId, nodeNameMap);
    const row = new Map<string, number>();
    for (const targetId of nodeIds) {
      row.set(targetId, distances.get(targetId) ?? Infinity);
    }
    matrix.set(sourceId, row);
  }
  
  return matrix;
}
