import { ProductWithFeatures, Vocabulary, buildVocabulary, buildProductVector } from './featureExtraction';

export interface ExplanationItem {
  dimension: string;
  aValue: number;
  bValue: number;
  product: number;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  similarity: number;
  explanation: ExplanationItem[];
}

export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vectors must have the same length');
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  // Guard against zero-vector
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);
}

export function getRecommendationExplanation(
  vecA: number[],
  vecB: number[],
  vocabulary: Vocabulary
): ExplanationItem[] {
  const explanation: ExplanationItem[] = [];
  const allTerms = [...vocabulary.terms, 'price_tier'];
  
  for (let i = 0; i < vecA.length; i++) {
    if (vecA[i] > 0 || vecB[i] > 0) {
      explanation.push({
        dimension: allTerms[i] || `dim_${i}`,
        aValue: vecA[i],
        bValue: vecB[i],
        product: vecA[i] * vecB[i],
      });
    }
  }
  
  return explanation.sort((a, b) => b.product - a.product);
}

export function getRecommendations(
  targetProduct: ProductWithFeatures,
  allProducts: ProductWithFeatures[],
  limit: number = 4
): RecommendedProduct[] {
  const vocabulary = buildVocabulary(allProducts);
  const targetVec = buildProductVector(targetProduct, vocabulary);
  
  const scores: Array<{
    product: ProductWithFeatures;
    similarity: number;
    vecB: number[];
  }> = [];
  
  for (const product of allProducts) {
    if (product.id === targetProduct.id) continue;
    
    const vec = buildProductVector(product, vocabulary);
    const similarity = calculateCosineSimilarity(targetVec, vec);
    scores.push({ product, similarity, vecB: vec });
  }
  
  scores.sort((a, b) => b.similarity - a.similarity);
  
  return scores.slice(0, limit).map(({ product, similarity, vecB }) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    similarity,
    explanation: getRecommendationExplanation(targetVec, vecB, vocabulary),
  }));
}
