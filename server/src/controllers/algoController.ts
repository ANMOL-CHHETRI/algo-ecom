import { Request, Response } from 'express';
import { computeLevenshtein, searchWithTolerance } from '../algorithms/levenshteinDistance';
import { calculateCosineSimilarity, getRecommendationExplanation } from '../algorithms/cosineSimilarity';
import { buildVocabulary, buildProductVector } from '../algorithms/featureExtraction';
import { buildAdjacencyList, dijkstra, reconstructPath, computeDistanceMatrix } from '../algorithms/dijkstra';
import { nearestNeighborTSP } from '../algorithms/nearestNeighbor';
import { prisma } from '../config/db';

export const levenshteinDemo = (req: Request, res: Response): void => {
  try {
    const { a = '', b = '' } = req.body;
    const result = computeLevenshtein(String(a), String(b));

    // Also calculate the backtracked alignment path for visual rendering
    const m = String(a).length;
    const n = String(b).length;
    const path: Array<{ i: number; j: number; op: string }> = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && String(a)[i - 1] === String(b)[j - 1]) {
        path.push({ i, j, op: 'match' });
        i--;
        j--;
      } else {
        const del = i > 0 ? result.matrix[i - 1][j] : Infinity;
        const ins = j > 0 ? result.matrix[i][j - 1] : Infinity;
        const sub = i > 0 && j > 0 ? result.matrix[i - 1][j - 1] : Infinity;

        const min = Math.min(del, ins, sub);
        if (min === sub && i > 0 && j > 0) {
          path.push({ i, j, op: 'substitution' });
          i--;
          j--;
        } else if (min === del && i > 0) {
          path.push({ i, j, op: 'deletion' });
          i--;
        } else {
          path.push({ i, j, op: 'insertion' });
          j--;
        }
      }
    }
    path.push({ i: 0, j: 0, op: 'start' });
    path.reverse();

    res.json({
      success: true,
      distance: result.distance,
      matrix: result.matrix,
      stringA: String(a),
      stringB: String(b),
      path,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cosineDemo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIdA, productIdB } = req.body;
    const [prodA, prodB, allProducts] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productIdA },
        include: { category: true, features: true },
      }),
      prisma.product.findUnique({
        where: { id: productIdB },
        include: { category: true, features: true },
      }),
      prisma.product.findMany({ include: { category: true, features: true } }),
    ]);

    if (!prodA || !prodB) {
      res.status(404).json({ success: false, message: 'One or both products not found' });
      return;
    }

    const vocabulary = buildVocabulary(allProducts);
    const vecA = buildProductVector(prodA, vocabulary);
    const vecB = buildProductVector(prodB, vocabulary);
    const similarity = calculateCosineSimilarity(vecA, vecB);
    const explanation = getRecommendationExplanation(vecA, vecB, vocabulary);

    const termsWithPrice = [...vocabulary.terms, 'price_tier'];

    res.json({
      success: true,
      productA: { id: prodA.id, name: prodA.name, price: prodA.price, brand: prodA.brand },
      productB: { id: prodB.id, name: prodB.name, price: prodB.price, brand: prodB.brand },
      similarity: Math.round(similarity * 10000) / 100, // percentage e.g. 84.52%
      rawSimilarity: similarity,
      vecA,
      vecB,
      vocabulary: termsWithPrice,
      explanation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const dijkstraDemo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startNodeId, endNodeId } = req.body;
    const [nodes, edges] = await Promise.all([
      prisma.roadNode.findMany({ orderBy: { name: 'asc' } }),
      prisma.roadEdge.findMany(),
    ]);

    const graph = buildAdjacencyList(nodes, edges);
    const nameMap = new Map(nodes.map((n) => [n.id, n.name]));

    const source = startNodeId || nodes.find((n) => n.nodeType === 'DEPOT')?.id || nodes[0].id;
    const target = endNodeId || nodes[1].id;

    const { distances, previous, steps } = dijkstra(graph, source, nameMap);
    const path = reconstructPath(previous, target);
    const pathDistance = distances.get(target) ?? Infinity;

    res.json({
      success: true,
      distance: pathDistance,
      path,
      pathNames: path.map((id) => nameMap.get(id) || id),
      steps,
      nodes,
      edges,
      startNodeId: source,
      endNodeId: target,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const tspDemo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stopNodeIds } = req.body;
    const [nodes, edges] = await Promise.all([
      prisma.roadNode.findMany(),
      prisma.roadEdge.findMany(),
    ]);

    const graph = buildAdjacencyList(nodes, edges);
    const nameMap = new Map(nodes.map((n) => [n.id, n.name]));
    const depot = nodes.find((n) => n.nodeType === 'DEPOT');
    if (!depot) {
      res.status(400).json({ success: false, message: 'No depot node found' });
      return;
    }

    const stops = Array.isArray(stopNodeIds) && stopNodeIds.length > 0
      ? stopNodeIds.filter((id) => id !== depot.id)
      : nodes.filter((n) => n.id !== depot.id).slice(0, 4).map((n) => n.id);

    const allNodeIds = [depot.id, ...stops];
    const matrix = computeDistanceMatrix(graph, allNodeIds, nameMap);

    const result = nearestNeighborTSP(depot.id, stops, matrix, nameMap);

    // Matrix representation for client rendering
    const matrixObj: Record<string, Record<string, number>> = {};
    for (const fromId of allNodeIds) {
      matrixObj[fromId] = {};
      for (const toId of allNodeIds) {
        matrixObj[fromId][toId] = matrix.get(fromId)?.get(toId) ?? Infinity;
      }
    }

    res.json({
      success: true,
      result,
      nodes,
      depot,
      distanceMatrix: matrixObj,
      nodeNames: Object.fromEntries(nameMap),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim() === '') {
      res.json({ success: true, products: [], suggestion: null });
      return;
    }

    const products = await prisma.product.findMany({
      include: { category: true, features: true },
    });

    const candidates = products.map((p) => ({
      id: p.id,
      name: p.name,
      tags: p.features.map((f) => f.featureValue),
    }));

    const results = searchWithTolerance(String(q), candidates, 2);
    const matchedIds = new Set(results.map((r) => r.id));
    const matchedProducts = products.filter((p) => matchedIds.has(p.id));

    const suggestion = results.find((r) => r.distance > 0 && r.suggestion)?.suggestion || null;

    res.json({
      success: true,
      products: matchedProducts,
      suggestion,
      query: String(q),
      matchCount: matchedProducts.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
