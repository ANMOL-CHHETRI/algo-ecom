import { describe, it, expect } from 'vitest';
import { computeLevenshtein, searchWithTolerance } from '../levenshteinDistance';

describe('computeLevenshtein', () => {
  it('returns 0 for two empty strings', () => {
    const { distance } = computeLevenshtein('', '');
    expect(distance).toBe(0);
  });

  it('returns length of b when a is empty', () => {
    const { distance } = computeLevenshtein('', 'abc');
    expect(distance).toBe(3);
  });

  it('returns length of a when b is empty', () => {
    const { distance } = computeLevenshtein('abc', '');
    expect(distance).toBe(3);
  });

  it('computes classic kitten → sitting distance of 3', () => {
    const { distance } = computeLevenshtein('kitten', 'sitting');
    expect(distance).toBe(3);
  });

  it('computes laptop → lapotp distance of 2', () => {
    const { distance } = computeLevenshtein('laptop', 'lapotp');
    expect(distance).toBe(2);
  });

  it('returns distance 0 for identical strings', () => {
    const { distance } = computeLevenshtein('mobile', 'mobile');
    expect(distance).toBe(0);
  });

  it('matrix dimensions are (a.length+1) × (b.length+1)', () => {
    const { matrix } = computeLevenshtein('abc', 'de');
    expect(matrix.length).toBe(4);
    expect(matrix[0].length).toBe(3);
  });

  it('matrix[0][j] = j for all j', () => {
    const { matrix } = computeLevenshtein('ab', 'cde');
    expect(matrix[0]).toEqual([0, 1, 2, 3]);
  });

  it('matrix[i][0] = i for all i', () => {
    const { matrix } = computeLevenshtein('abc', 'de');
    expect(matrix.map(row => row[0])).toEqual([0, 1, 2, 3]);
  });
});

describe('searchWithTolerance', () => {
  const candidates = [
    { id: '1', name: 'Samsung Laptop', tags: ['electronics', 'laptop'] },
    { id: '2', name: 'Apple iPhone', tags: ['electronics', 'phone'] },
    { id: '3', name: 'JBL Speaker', tags: ['electronics', 'audio'] },
  ];

  it('finds exact match', () => {
    const results = searchWithTolerance('laptop', candidates);
    expect(results.some(r => r.id === '1')).toBe(true);
  });

  it('finds fuzzy match within threshold', () => {
    const results = searchWithTolerance('lapotp', candidates);
    expect(results.some(r => r.id === '1')).toBe(true);
  });

  it('returns empty for empty query', () => {
    const results = searchWithTolerance('', candidates);
    expect(results).toHaveLength(0);
  });
});
