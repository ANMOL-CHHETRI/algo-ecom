import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations,
  listCategories,
  getAdminStats,
} from '../controllers/productController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.get('/', listProducts);
router.get('/admin/stats', authenticateToken, requireRole('ADMIN'), getAdminStats);
router.get('/:id', getProduct);
router.get('/:id/recommendations', getRecommendations);
router.post('/', authenticateToken, requireRole('ADMIN'), createProduct);
router.put('/:id', authenticateToken, requireRole('ADMIN'), updateProduct);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteProduct);

const categoryRouter = Router();
categoryRouter.get('/', listCategories);

export { categoryRouter };
export default router;
