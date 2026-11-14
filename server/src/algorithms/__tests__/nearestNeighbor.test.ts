import { describe, it, expect } from 'vitest';
import { nearestNeighborTSP } from '../nearestNeighbor';

function makeMatrix(nodes: string[], distances: Record<string, Record<string, number>>): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>();
  for (const from of nodes) {
    const row = new Map<string, number>();
    for (const to of nodes) {
      row.set(to, distances[from]?.[to] ?? Infinity);
    }
    matrix.set(from, row);
  }
  return matrix;
}

describe('nearestNeighborTSP', () => {
  it('returns only depot for empty stops', () => {
    const matrix = makeMatrix(['depot'], { depot: { depot: 0 } });
    const result = nearestNeighborTSP('depot', [], matrix);
    expect(result.orderedStops).toEqual(['depot']);
    expect(result.totalDistanceKm).toBe(0);
  });

  it('visits single stop and returns to depot', () => {
    const distances = {
      depot: { depot: 0, A: 5 },
      A: { depot: 5, A: 0 },
    };
    const matrix = makeMatrix(['depot', 'A'], distances);
    const result = nearestNeighborTSP('depot', ['A'], matrix);
    expect(result.orderedStops).toEqual(['depot', 'A', 'depot']);
    expect(result.totalDistanceKm).toBeCloseTo(10);
  });

  it('greedily picks nearest unvisited stop', () => {
    const distances = {
      depot: { depot: 0, A: 1, B: 10 },
      A: { depot: 1, A: 0, B: 2 },
      B: { depot: 10, A: 2, B: 0 },
    };
    const matrix = makeMatrix(['depot', 'A', 'B'], distances);
    const result = nearestNeighborTSP('depot', ['A', 'B'], matrix);
    // Should go depot→A(1km)→B(2km)→depot(10km) = 13km
    // NOT depot→B(10km)→A(2km)→depot(1km) = 13km (same in this case, but order differs)
    expect(result.orderedStops[1]).toBe('A'); // greedy picks A first (dist=1 < 10)
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('calculates naive distance for comparison', () => {
    const distances = {
      depot: { depot: 0, A: 10, B: 1 },
      A: { depot: 10, A: 0, B: 2 },
      B: { depot: 1, A: 2, B: 0 },
    };
    const matrix = makeMatrix(['depot', 'A', 'B'], distances);
    const result = nearestNeighborTSP('depot', ['A', 'B'], matrix);
    // Naive: depot→A(10)→B(2)→depot(1) = 13
    expect(result.naiveDistanceKm).toBeCloseTo(13);
  });
});
