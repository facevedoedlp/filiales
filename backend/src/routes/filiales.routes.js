import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import * as filialesController from '../controllers/filiales.controller.js';

const router = express.Router();

router.get('/', authenticateToken, filialesController.getFiliales);
router.get('/:id', authenticateToken, filialesController.getFilialById);
router.post('/', authenticateToken, requireRole('ADMIN'), filialesController.createFilial);
router.put('/:id', authenticateToken, filialesController.updateFilial);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), filialesController.deleteFilial);
router.put('/:id/renovar', authenticateToken, filialesController.renovarAutoridades);
router.get('/:id/estadisticas', authenticateToken, filialesController.getEstadisticas);

export default router;
