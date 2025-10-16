import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getTema, listTemas } from '../controllers/foro.controller.js';

const router = Router();

router.get('/', authenticate, listTemas);
router.get('/:id', authenticate, getTema);

export default router;
