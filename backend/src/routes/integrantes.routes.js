// backend/src/routes/integrantes.routes.js
import express from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateToken, requireOwnFilial } from '../middleware/auth.middleware.js';
import { errors } from '../middleware/errorHandler.js';

const router = express.Router();

// Schema de validación
const integranteSchema = z.object({
  filialId: z.number().int(),
  nombre: z.string().min(2, 'Nombre muy corto'),
  dni: z.string().optional(),
  fechaNacimiento: z.string().datetime().optional(),
  ocupacion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  esReferente: z.boolean().optional(),
  cargoId: z.number().int().optional(),
  numeroSocio: z.string().optional()
});

// ============================================
// GET /api/integrantes
// Listar integrantes (requiere filialId)
// ============================================
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { filialId, esActivo, cargoId, page = 1, limit = 50 } = req.query;

    if (!filialId) {
      throw errors.badRequest('filialId es requerido');
    }

    const filialIdInt = parseInt(filialId);

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && req.user.filialId !== filialIdInt) {
      throw errors.forbidden('No tienes acceso a esta filial');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { filialId: filialIdInt };

    if (esActivo !== undefined) {
      where.esActivo = esActivo === 'true';
    }

    if (cargoId) {
      where.cargoId = parseInt(cargoId);
    }

    const [integrantes, total] = await Promise.all([
      prisma.integrante.findMany({
        where,
        include: {
          cargo: { select: { id: true, nombre: true } },
          filial: { select: { id: true, nombre: true } }
        },
        orderBy: [
          { esReferente: 'desc' },
          { nombre: 'asc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.integrante.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        integrantes,
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
// GET /api/integrantes/:id
// Obtener detalle de integrante
// ============================================
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const integrante = await prisma.integrante.findUnique({
      where: { id: parseInt(id) },
      include: {
        cargo: true,
        filial: {
          select: { id: true, nombre: true }
        },
        historialInactividad: {
          orderBy: { fechaInicio: 'desc' }
        }
      }
    });

    if (!integrante) {
      throw errors.notFound('Integrante');
    }

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && req.user.filialId !== integrante.filialId) {
      throw errors.forbidden('No tienes acceso a este integrante');
    }

    res.json({
      success: true,
      data: integrante
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/integrantes
// Crear integrante
// ============================================
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const data = integranteSchema.parse(req.body);

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && req.user.filialId !== data.filialId) {
      throw errors.forbidden('No puedes agregar integrantes a esta filial');
    }

    const integrante = await prisma.integrante.create({
      data: {
        ...data,
        usuarioIngreso: req.user.correo
      },
      include: {
        cargo: true,
        filial: { select: { nombre: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: integrante,
      message: 'Integrante creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/integrantes/:id
// Actualizar integrante
// ============================================
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const integranteId = parseInt(id);

    // Buscar integrante
    const integranteExistente = await prisma.integrante.findUnique({
      where: { id: integranteId }
    });

    if (!integranteExistente) {
      throw errors.notFound('Integrante');
    }

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && req.user.filialId !== integranteExistente.filialId) {
      throw errors.forbidden('No puedes editar este integrante');
    }

    const data = integranteSchema.partial().parse(req.body);

    const integrante = await prisma.integrante.update({
      where: { id: integranteId },
      data,
      include: {
        cargo: true,
        filial: { select: { nombre: true } }
      }
    });

    res.json({
      success: true,
      data: integrante,
      message: 'Integrante actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/integrantes/:id/desactivar
// Marcar como inactivo
// ============================================
router.put('/:id/desactivar', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const integranteExistente = await prisma.integrante.findUnique({
      where: { id: parseInt(id) }
    });

    if (!integranteExistente) {
      throw errors.notFound('Integrante');
    }

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && req.user.filialId !== integranteExistente.filialId) {
      throw errors.forbidden('No tienes acceso a este integrante');
    }

    // Transacción: desactivar y registrar historial
    const result = await prisma.$transaction([
      prisma.integrante.update({
        where: { id: parseInt(id) },
        data: { esActivo: false }
      }),
      prisma.historialInactividad.create({
        data: {
          integranteId: parseInt(id),
          fechaInicio: new Date(),
          motivo: motivo || 'Sin especificar'
        }
      })
    ]);

    res.json({
      success: true,
      data: result[0],
      message: 'Integrante desactivado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/integrantes/:id/activar
// Reactivar integrante
// ============================================
router.put('/:id/activar', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const integranteId = parseInt(id);

    const integranteExistente = await prisma.integrante.findUnique({
      where: { id: integranteId }
    });

    if (!integranteExistente) {
      throw errors.notFound('Integrante');
    }

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && req.user.filialId !== integranteExistente.filialId) {
      throw errors.forbidden('No tienes acceso a este integrante');
    }

    // Cerrar último periodo de inactividad
    const ultimoHistorial = await prisma.historialInactividad.findFirst({
      where: {
        integranteId,
        fechaFin: null
      },
      orderBy: { fechaInicio: 'desc' }
    });

    if (ultimoHistorial) {
      await prisma.historialInactividad.update({
        where: { id: ultimoHistorial.id },
        data: { fechaFin: new Date() }
      });
    }

    // Activar integrante
    const integrante = await prisma.integrante.update({
      where: { id: integranteId },
      data: { esActivo: true }
    });

    res.json({
      success: true,
      data: integrante,
      message: 'Integrante activado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
