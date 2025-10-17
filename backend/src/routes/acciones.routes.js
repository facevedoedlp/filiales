// backend/src/routes/acciones.routes.js
import express from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { errors } from '../middleware/errorHandler.js';

const router = express.Router();

// Schema de validación
const accionSchema = z.object({
  tipo: z.enum(['Filial', 'Captación']),
  filialId: z.number().int().optional(),
  fechaRealizacion: z.string().datetime(),
  calendarioId: z.number().int().optional(),
  descripcion: z.string().min(10, 'Descripción muy corta'),
  ubicacion: z.string().optional(),
  otrosColaboradores: z.string().optional(),
  observaciones: z.string().optional(),
  enviarCorreo: z.boolean().optional()
});

// ============================================
// GET /api/acciones
// Listar acciones con filtros
// ============================================
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      filialId,
      tipo,
      fechaDesde,
      fechaHasta
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (filialId) {
      const filialIdInt = parseInt(filialId);
      
      // Verificar acceso
      if (req.user.rol === 'FILIAL' && req.user.filialId !== filialIdInt) {
        throw errors.forbidden('No tienes acceso a estas acciones');
      }
      
      where.filialId = filialIdInt;
    } else if (req.user.rol === 'FILIAL') {
      // Si es usuario de filial y no especifica, solo ve las suyas
      where.filialId = req.user.filialId;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (fechaDesde || fechaHasta) {
      where.fechaRealizacion = {};
      if (fechaDesde) {
        where.fechaRealizacion.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaRealizacion.lte = new Date(fechaHasta);
      }
    }

    const [acciones, total] = await Promise.all([
      prisma.accion.findMany({
        where,
        include: {
          filial: {
            select: { id: true, nombre: true }
          },
          calendario: {
            select: { fecha: true, rival: true }
          },
          usuario: {
            select: { nombre: true }
          }
        },
        orderBy: { fechaRealizacion: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.accion.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        acciones,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/acciones/:id
// Obtener detalle de acción
// ============================================
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const accion = await prisma.accion.findUnique({
      where: { id: parseInt(id) },
      include: {
        filial: {
          select: { id: true, nombre: true }
        },
        calendario: true,
        usuario: {
          select: { nombre: true, correo: true }
        }
      }
    });

    if (!accion) {
      throw errors.notFound('Acción');
    }

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && accion.filialId !== req.user.filialId) {
      throw errors.forbidden('No tienes acceso a esta acción');
    }

    res.json({
      success: true,
      data: accion
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/acciones
// Registrar nueva acción
// ============================================
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const data = accionSchema.parse(req.body);

    // Verificar acceso
    if (data.filialId && req.user.rol === 'FILIAL' && req.user.filialId !== data.filialId) {
      throw errors.forbidden('No puedes crear acciones para esta filial');
    }

    const accion = await prisma.accion.create({
      data: {
        ...data,
        encargadoId: req.user.userId,
        usuarioCorreo: req.user.correo
      },
      include: {
        filial: { select: { nombre: true } }
      }
    });

    // TODO: Enviar notificación si enviarCorreo === true

    res.status(201).json({
      success: true,
      data: accion,
      message: 'Acción registrada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/acciones/:id
// Actualizar acción
// ============================================
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const accionId = parseInt(id);

    const accionExistente = await prisma.accion.findUnique({
      where: { id: accionId }
    });

    if (!accionExistente) {
      throw errors.notFound('Acción');
    }

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && accionExistente.filialId !== req.user.filialId) {
      throw errors.forbidden('No puedes editar esta acción');
    }

    const data = accionSchema.partial().parse(req.body);

    const accion = await prisma.accion.update({
      where: { id: accionId },
      data,
      include: {
        filial: { select: { nombre: true } }
      }
    });

    res.json({
      success: true,
      data: accion,
      message: 'Acción actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DELETE /api/acciones/:id
// Eliminar acción (solo ADMIN)
// ============================================
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      throw errors.forbidden('Solo administradores pueden eliminar acciones');
    }

    const { id } = req.params;

    await prisma.accion.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Acción eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
