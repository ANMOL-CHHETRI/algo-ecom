import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleGuard';

const router = Router();
router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);
router.put('/:id/status', requireRole('ADMIN', 'COURIER'), updateOrderStatus);

export default router;
