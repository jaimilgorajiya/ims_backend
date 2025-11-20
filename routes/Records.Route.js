import { Router } from 'express';
import { authMiddleware } from '../middleware/Auth.Middleware.js';
import { getAllRecords } from '../controllers/Records.Controller.js';

const router = Router();

router.get('/', authMiddleware, getAllRecords);

export default router;
