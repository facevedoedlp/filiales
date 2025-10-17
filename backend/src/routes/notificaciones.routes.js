// backend/src/routes/notificaciones.routes.js
import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { errors } from '../middleware/errorHandler.js';

const router = express.Router();

// ============================================
// GET /api/notificaciones
// Listar notificaciones del usuario
// ============================================
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { leida, tipo, limit = 20 } = req.query;

    const where = {
      usuarioId: req.user.userId
    };

    if (leida !== undefined) {
      where.leida = leida === 'true';
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    const noLeidas = await prisma.notificacion.count({
      where: {
        usuarioId: req.user.userId,
        leida: false
      }
    });

    res.json({
      success: true,
      data: {
        notificaciones,
        noLeidas
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/notificaciones/:id/leer
// Marcar notificación como leída
// ============================================
router.put('/:id/leer', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const notifId = parseInt(id);

    const notificacion = await prisma.notificacion.findUnique({
      where: { id: notifId }
    });

    if (!notificacion) {
      throw errors.notFound('Notificación');
    }

    if (notificacion.usuarioId !== req.user.userId) {
      throw errors.forbidden('No tienes acceso a esta notificación');
    }

    const updated = await prisma.notificacion.update({
      where: { id: notifId },
      data: { leida: true }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/notificaciones/leer-todas
// Marcar todas como leídas
// ============================================
router.put('/leer-todas', authenticateToken, async (req, res, next) => {
  try {
    const result = await prisma.notificacion.updateMany({
      where: {
        usuarioId: req.user.userId,
        leida: false
      },
      data: { leida: true }
    });

    res.json({
      success: true,
      message: `${result.count} notificaciones marcadas como leídas`
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DELETE /api/notificaciones/:id
// Eliminar notificación
// ============================================
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const notifId = parseInt(id);

    const notificacion = await prisma.notificacion.findUnique({
      where: { id: notifId }
    });

    if (!notificacion) {
      throw errors.notFound('Notificación');
    }

    if (notificacion.usuarioId !== req.user.userId) {
      throw errors.forbidden('No tienes acceso a esta notificación');
    }

    await prisma.notificacion.delete({
      where: { id: notifId }
    });

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
