import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { buildVocabulary, buildProductVector } from '../algorithms/featureExtraction';
import { calculateCosineSimilarity, getRecommendationExplanation } from '../algorithms/cosineSimilarity';

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, categoryId, minPrice, maxPrice, inStock, page = '1', limit = '12' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId as string;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    if (inStock === 'true') where.stockQuantity = { gt: 0 };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, features: true },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ success: true, products, total, page: pageNum, limit: limitNum });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, features: true },
    });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { features, ...productData } = req.body;
    const product = await prisma.product.create({
      data: {
        ...productData,
        features: features && features.length > 0 ? { create: features } : undefined,
      },
      include: { category: true, features: true },
    });
    res.status(201).json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { features, ...productData } = req.body;
    
    if (features) {
      await prisma.productFeature.deleteMany({ where: { productId: req.params.id } });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...productData,
        features: features && features.length > 0 ? { create: features } : undefined,
      },
      include: { category: true, features: true },
    });
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, features: true },
    });
    if (!targetProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const allProducts = await prisma.product.findMany({
      include: { category: true, features: true },
    });

    const vocabulary = buildVocabulary(allProducts);
    const targetVec = buildProductVector(targetProduct, vocabulary);

    const scores = allProducts
      .filter((p) => p.id !== targetProduct.id)
      .map((p) => {
        const vec = buildProductVector(p, vocabulary);
        const similarity = calculateCosineSimilarity(targetVec, vec);
        return { product: p, similarity, vec };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4);

    const recommendations = scores.map(({ product, similarity, vec }) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images,
      brand: product.brand,
      category: product.category,
      similarity: Math.round(similarity * 100),
      explanation: getRecommendationExplanation(targetVec, vec, vocabulary),
      targetVector: targetVec,
      productVector: vec,
    }));

    res.json({
      success: true,
      recommendations,
      targetVector: targetVec,
      vocabulary: [...vocabulary.terms, 'price_tier'],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalRevenue, totalOrders, lowStockProducts, totalProducts] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { orderStatus: { not: 'CANCELLED' } },
      }),
      prisma.order.count(),
      prisma.product.count({ where: { stockQuantity: { lte: 5 } } }),
      prisma.product.count(),
    ]);

    const categoriesWithCount = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });

    const recentOrders = await prisma.order.findMany({
      take: 7,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, totalAmount: true, orderNumber: true, orderStatus: true },
    });

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalOrders,
        lowStockProducts,
        totalProducts,
        categoryShare: categoriesWithCount.map((c) => ({
          name: c.name,
          value: c._count.products,
        })),
        recentOrders,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
