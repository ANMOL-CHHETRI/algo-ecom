export interface ProductWithFeatures {
  id: string;
  name: string;
  price: number;
  brand: string | null;
  category: { name: string; slug: string };
  features: { featureKey: string; featureValue: string; weight: number }[];
}

export interface Vocabulary {
  terms: string[];
  termIndex: Map<string, number>;
  maxPrice: number;
}

export function buildVocabulary(products: ProductWithFeatures[]): Vocabulary {
  const termSet = new Set<string>();
  let maxPrice = 0;
  
  for (const product of products) {
    // Category
    termSet.add(`category:${product.category.slug}`);
    
    // Brand
    if (product.brand) {
      termSet.add(`brand:${product.brand.toLowerCase().replace(/\s+/g, '_')}`);
    }
    
    // Features
    for (const feature of product.features) {
      const key = feature.featureKey.toLowerCase().replace(/\s+/g, '_');
      const value = feature.featureValue.toLowerCase().replace(/\s+/g, '_');
      termSet.add(`${key}:${value}`);
    }
    
    if (product.price > maxPrice) maxPrice = product.price;
  }
  
  const terms = Array.from(termSet).sort();
  const termIndex = new Map<string, number>();
  terms.forEach((term, i) => termIndex.set(term, i));
  
  return { terms, termIndex, maxPrice: maxPrice || 1 };
}

export function buildProductVector(
  product: ProductWithFeatures,
  vocabulary: Vocabulary
): number[] {
  const vector = new Array(vocabulary.terms.length + 1).fill(0);
  
  // Category (one-hot)
  const catTerm = `category:${product.category.slug}`;
  const catIdx = vocabulary.termIndex.get(catTerm);
  if (catIdx !== undefined) vector[catIdx] = 1;
  
  // Brand (one-hot)
  if (product.brand) {
    const brandTerm = `brand:${product.brand.toLowerCase().replace(/\s+/g, '_')}`;
    const brandIdx = vocabulary.termIndex.get(brandTerm);
    if (brandIdx !== undefined) vector[brandIdx] = 1;
  }
  
  // Features (weighted multi-hot)
  for (const feature of product.features) {
    const key = feature.featureKey.toLowerCase().replace(/\s+/g, '_');
    const value = feature.featureValue.toLowerCase().replace(/\s+/g, '_');
    const term = `${key}:${value}`;
    const idx = vocabulary.termIndex.get(term);
    if (idx !== undefined) vector[idx] = feature.weight;
  }
  
  // Price tier (normalized 0–1) in the last slot
  vector[vocabulary.terms.length] = product.price / vocabulary.maxPrice;
  
  return vector;
}
