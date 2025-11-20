import { Router } from 'express';
import { authMiddleware } from '../middleware/Auth.Middleware.js';
import { getStockSummary, getStockOptions } from '../controllers/Stock.Controller.js';

const router = Router();

router.get('/summary', authMiddleware, getStockSummary);
router.get('/options', authMiddleware, getStockOptions);

export default router;
