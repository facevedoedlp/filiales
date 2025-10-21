import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import * as accionesController from '../controllers/acciones.controller.js';

const router = express.Router();

router.get('/', authenticateToken, accionesController.getAcciones);
router.get('/:id', authenticateToken, accionesController.getAccionById);
router.post('/', authenticateToken, accionesController.createAccion);
router.put('/:id', authenticateToken, accionesController.updateAccion);
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'ADMIN_GLOBAL'), accionesController.deleteAccion);

export default router;
