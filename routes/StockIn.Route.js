import { Router } from 'express';
import { createStockIn, getAllStockIns, getStockInById } from '../controllers/StockIn.Controller.js';
import { authMiddleware } from '../middleware/Auth.Middleware.js';

const router = Router();

router.post('/', authMiddleware, createStockIn);
router.get('/', authMiddleware, getAllStockIns);
router.get('/:id', authMiddleware, getStockInById);

export default router;