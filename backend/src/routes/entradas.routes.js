import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listEntradas } from '../controllers/entradas.controller.js';

const router = Router();

router.get('/', authenticate, listEntradas);

export default router;
