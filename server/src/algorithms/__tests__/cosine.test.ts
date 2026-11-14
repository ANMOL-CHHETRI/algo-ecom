import { describe, it, expect } from 'vitest';
import { calculateCosineSimilarity } from '../cosineSimilarity';

describe('calculateCosineSimilarity', () => {
  it('returns 1.0 for identical vectors', () => {
    const result = calculateCosineSimilarity([1, 0, 1], [1, 0, 1]);
    expect(result).toBeCloseTo(1.0);
  });

  it('returns 0.0 for orthogonal vectors', () => {
    const result = calculateCosineSimilarity([1, 0, 0], [0, 1, 0]);
    expect(result).toBeCloseTo(0.0);
  });

  it('returns 0.0 for zero vector (not NaN)', () => {
    const result = calculateCosineSimilarity([0, 0, 0], [1, 2, 3]);
    expect(result).toBe(0);
    expect(Number.isNaN(result)).toBe(false);
  });

  it('returns 0.0 when both are zero vectors', () => {
    const result = calculateCosineSimilarity([0, 0, 0], [0, 0, 0]);
    expect(result).toBe(0);
  });

  it('returns value between 0 and 1 for similar vectors', () => {
    const result = calculateCosineSimilarity([1, 1, 0], [1, 0, 0]);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('throws for mismatched vector lengths', () => {
    expect(() => calculateCosineSimilarity([1, 2], [1, 2, 3])).toThrow();
  });
});
