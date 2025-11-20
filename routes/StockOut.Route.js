import {Router} from "express";
import {createStockOut , getAllStockOuts, getStockOutById} from "../controllers/StockOut.Controller.js";
import { authMiddleware } from '../middleware/Auth.Middleware.js';

const router = Router();

router.post('/', authMiddleware, createStockOut);
router.get('/', authMiddleware, getAllStockOuts);
router.get('/:id', authMiddleware, getStockOutById);

export default router;