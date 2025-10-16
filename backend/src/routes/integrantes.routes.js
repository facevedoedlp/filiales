import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listIntegrantes } from '../controllers/integrantes.controller.js';

const router = Router();

router.get('/', authenticate, listIntegrantes);

export default router;
