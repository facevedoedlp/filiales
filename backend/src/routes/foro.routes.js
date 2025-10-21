import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import * as foroController from '../controllers/foro.controller.js';

const router = express.Router();

router.get('/temas', authenticateToken, foroController.getTemas);
router.get('/temas/:id', authenticateToken, foroController.getTema);
router.post('/temas', authenticateToken, foroController.createTema);
router.put('/temas/:id', authenticateToken, foroController.updateTema);
router.delete('/temas/:id', authenticateToken, requireRole('ADMIN', 'ADMIN_GLOBAL'), foroController.deleteTema);
router.put('/temas/:id/destacar', authenticateToken, requireRole('ADMIN', 'ADMIN_GLOBAL'), foroController.destacarTema);
router.put('/temas/:id/cerrar', authenticateToken, foroController.toggleCerrarTema);
router.post('/temas/:id/respuestas', authenticateToken, foroController.createRespuesta);
router.put('/respuestas/:id', authenticateToken, foroController.updateRespuesta);
router.delete('/respuestas/:id', authenticateToken, foroController.deleteRespuesta);
router.get('/categorias', authenticateToken, foroController.getCategorias);
router.get('/etiquetas', authenticateToken, foroController.getEtiquetas);

export default router;
