export interface LevenshteinResult {
  distance: number;
  matrix: number[][];
}

export interface SearchResult {
  id: string;
  name: string;
  distance: number;
  suggestion?: string;
}

export function computeLevenshtein(a: string, b: string): LevenshteinResult {
  const m = a.length;
  const n = b.length;
  
  // Initialize DP matrix
  const matrix: number[][] = [];
  for (let i = 0; i <= m; i++) {
    matrix[i] = [];
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        matrix[i][j] = j;
      } else if (j === 0) {
        matrix[i][j] = i;
      } else {
        matrix[i][j] = 0;
      }
    }
  }
  
  // Fill DP matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = 1 + Math.min(
          matrix[i - 1][j],     // deletion
          matrix[i][j - 1],     // insertion
          matrix[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  
  return {
    distance: matrix[m][n],
    matrix,
  };
}

export function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

export function searchWithTolerance(
  query: string,
  candidates: { id: string; name: string; tags: string[] }[],
  threshold: number = 2
): SearchResult[] {
  const normalizedQuery = normalizeQuery(query);
  
  if (!normalizedQuery) return [];
  
  const results: SearchResult[] = [];
  let bestSuggestion: string | undefined;
  let bestDistance = Infinity;
  
  for (const candidate of candidates) {
    const normalizedName = normalizeQuery(candidate.name);
    
    // Check exact match first
    if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) {
      results.push({ id: candidate.id, name: candidate.name, distance: 0 });
      continue;
    }
    
    // Check tags
    const tagMatch = candidate.tags.some(tag => 
      normalizeQuery(tag).includes(normalizedQuery) || normalizedQuery.includes(normalizeQuery(tag))
    );
    if (tagMatch) {
      results.push({ id: candidate.id, name: candidate.name, distance: 0 });
      continue;
    }
    
    // Levenshtein on name words
    const nameWords = normalizedName.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);
    
    let minWordDistance = Infinity;
    for (const nameWord of nameWords) {
      for (const queryWord of queryWords) {
        const { distance } = computeLevenshtein(queryWord, nameWord);
        if (distance < minWordDistance) {
          minWordDistance = distance;
        }
      }
    }
    
    if (minWordDistance <= threshold) {
      results.push({ id: candidate.id, name: candidate.name, distance: minWordDistance });
      if (minWordDistance < bestDistance) {
        bestDistance = minWordDistance;
        bestSuggestion = candidate.name;
      }
    }
  }
  
  // Add suggestion to all fuzzy results
  if (bestSuggestion && results.some(r => r.distance > 0)) {
    results.forEach(r => {
      if (r.distance > 0) r.suggestion = bestSuggestion;
    });
  }
  
  return results.sort((a, b) => a.distance - b.distance);
}
