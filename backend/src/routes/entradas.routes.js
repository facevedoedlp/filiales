import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import * as entradasController from '../controllers/entradas.controller.js';

const router = express.Router();

router.get('/pedidos', authenticateToken, entradasController.getPedidos);
router.get('/pedidos/:id', authenticateToken, entradasController.getPedidoById);
router.post('/pedidos', authenticateToken, entradasController.createPedido);
router.put('/pedidos/:id', authenticateToken, entradasController.updatePedido);
router.put('/pedidos/:id/aprobar', authenticateToken, requireRole('ADMIN', 'ADMIN_GLOBAL'), entradasController.aprobarPedido);
router.put('/pedidos/:id/rechazar', authenticateToken, requireRole('ADMIN', 'ADMIN_GLOBAL'), entradasController.rechazarPedido);
router.get('/fixture', authenticateToken, entradasController.getFixture);

export default router;
