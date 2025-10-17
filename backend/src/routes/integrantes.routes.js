import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { scopeFilial } from '../middleware/scope.middleware.js';
import * as integrantesController from '../controllers/integrantes.controller.js';

const router = express.Router();

// GET /api/integrantes - Listar integrantes (filialId OPCIONAL)
router.get('/', authenticateToken, scopeFilial, integrantesController.getIntegrantes);

// GET /api/integrantes/:id - Obtener un integrante
router.get('/:id', authenticateToken, scopeFilial, integrantesController.getIntegranteById);

// POST /api/integrantes - Crear integrante (filialId REQUERIDO aquí)
router.post('/', authenticateToken, scopeFilial, integrantesController.createIntegrante);

// PUT /api/integrantes/:id - Actualizar integrante
router.put('/:id', authenticateToken, scopeFilial, integrantesController.updateIntegrante);

// DELETE /api/integrantes/:id - Eliminar integrante
router.delete('/:id', authenticateToken, scopeFilial, integrantesController.deleteIntegrante);

// PUT /api/integrantes/:id/desactivar - Marcar como inactivo
router.put('/:id/desactivar', authenticateToken, scopeFilial, integrantesController.deactivateIntegrante);

// PUT /api/integrantes/:id/activar - Reactivar integrante
router.put('/:id/activar', authenticateToken, scopeFilial, integrantesController.activateIntegrante);

export default router;
