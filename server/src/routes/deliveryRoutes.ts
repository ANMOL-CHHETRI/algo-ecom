import { Router } from 'express';
import {
  getNodes,
  getEdges,
  optimizeRoute,
  createBatch,
  listBatches,
  getBatch,
  assignCourier,
  completeStop,
  updateDeliveryStatus,
  getCouriers,
} from '../controllers/deliveryController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleGuard';

const router = Router();
router.use(authenticateToken);

router.get('/nodes', getNodes);
router.get('/edges', getEdges);
router.get('/couriers', requireRole('ADMIN'), getCouriers);
router.post('/optimize', requireRole('ADMIN'), optimizeRoute);
router.post('/batches', requireRole('ADMIN'), createBatch);
router.get('/batches', requireRole('ADMIN', 'COURIER'), listBatches);
router.get('/batches/:id', requireRole('ADMIN', 'COURIER'), getBatch);
router.put('/batches/:id/assign', requireRole('ADMIN'), assignCourier);
router.put('/stops/:stopId/complete', requireRole('COURIER', 'ADMIN'), completeStop);
router.put('/deliveries/:deliveryId/status', requireRole('COURIER', 'ADMIN'), updateDeliveryStatus);

export default router;
