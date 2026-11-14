import { Router } from 'express';
import {
  levenshteinDemo,
  cosineDemo,
  dijkstraDemo,
  tspDemo,
  searchProducts,
} from '../controllers/algoController';

const router = Router();

router.post('/levenshtein', levenshteinDemo);
router.post('/cosine', cosineDemo);
router.post('/dijkstra', dijkstraDemo);
router.post('/tsp', tspDemo);
router.get('/search', searchProducts);

export default router;
