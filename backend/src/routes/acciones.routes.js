import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listAcciones } from '../controllers/acciones.controller.js';

const router = Router();

router.get('/', authenticate, listAcciones);

export default router;
