import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as integrantesController from '../controllers/integrantes.controller.js';

const router = express.Router();

// GET /api/integrantes - Listar integrantes (filialId OPCIONAL)
router.get('/', authenticateToken, integrantesController.getIntegrantes);

// GET /api/integrantes/:id - Obtener un integrante
router.get('/:id', authenticateToken, integrantesController.getIntegranteById);

// POST /api/integrantes - Crear integrante (filialId REQUERIDO aquí)
router.post('/', authenticateToken, integrantesController.createIntegrante);

// PUT /api/integrantes/:id - Actualizar integrante
router.put('/:id', authenticateToken, integrantesController.updateIntegrante);

// DELETE /api/integrantes/:id - Eliminar integrante
router.delete('/:id', authenticateToken, integrantesController.deleteIntegrante);

// PUT /api/integrantes/:id/desactivar - Marcar como inactivo
router.put('/:id/desactivar', authenticateToken, integrantesController.deactivateIntegrante);

// PUT /api/integrantes/:id/activar - Reactivar integrante
router.put('/:id/activar', authenticateToken, integrantesController.activateIntegrante);

export default router;
