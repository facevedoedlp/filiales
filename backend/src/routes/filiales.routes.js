// backend/src/routes/filiales.routes.js
import express from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { errors } from '../middleware/errorHandler.js';

const router = express.Router();

// Schema de validación para crear/actualizar filial
const filialSchema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto'),
  paisId: z.number().int(),
  provinciaId: z.number().int(),
  localidadId: z.number().int(),
  nombreLocalidad: z.string(),
  departamentoId: z.number().int().optional(),
  direccionSede: z.string().optional(),
  coordenadas: z.string().optional(),
  kmDesdeEstadio: z.number().int().optional(),
  grupoId: z.number().int().optional(),
  fechaFundacion: z.string().datetime().optional(),
  telefono: z.string().optional(),
  mailInstitucional: z.string().email().optional(),
  mailAlternativo: z.string().email().optional(),
  situacion: z.string().optional()
});

// ============================================
// GET /api/filiales
// Listar todas las filiales con filtros
// ============================================
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      esActiva,
      provinciaId,
      grupoId,
      busqueda,
      ordenar = 'nombre',
      orden = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {};

    if (esActiva !== undefined) {
      where.esActiva = esActiva === 'true';
    }

    if (provinciaId) {
      where.provinciaId = parseInt(provinciaId);
    }

    if (grupoId) {
      where.grupoId = parseInt(grupoId);
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { nombreLocalidad: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    // Si es usuario de filial, solo ve su filial
    if (req.user.rol === 'FILIAL' && req.user.filialId) {
      where.id = req.user.filialId;
    }

    // Ordenamiento
    const orderBy = {};
    orderBy[ordenar] = orden;

    // Consultar
    const [filiales, total] = await Promise.all([
      prisma.filial.findMany({
        where,
        include: {
          provincia: { select: { nombre: true } },
          pais: { select: { nombre: true } },
          grupo: { select: { nombre: true } },
          _count: {
            select: {
              integrantes: { where: { esActivo: true } },
              acciones: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.filial.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        filiales,
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
// GET /api/filiales/:id
// Obtener detalle de una filial
// ============================================
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);

    // Verificar acceso si es usuario de filial
    if (req.user.rol === 'FILIAL' && req.user.filialId !== filialId) {
      throw errors.forbidden('No tienes acceso a esta filial');
    }

    const filial = await prisma.filial.findUnique({
      where: { id: filialId },
      include: {
        pais: { select: { id: true, nombre: true } },
        provincia: { select: { id: true, nombre: true } },
        localidad: { select: { id: true, nombre: true } },
        grupo: { select: { id: true, nombre: true } },
        integrantes: {
          where: { esActivo: true },
          include: {
            cargo: { select: { nombre: true } }
          },
          orderBy: { esReferente: 'desc' }
        },
        acciones: {
          take: 10,
          orderBy: { fechaCarga: 'desc' },
          select: {
            id: true,
            descripcion: true,
            fechaRealizacion: true,
            imagenPromocion: true
          }
        },
        _count: {
          select: {
            integrantes: { where: { esActivo: true } },
            acciones: true,
            entradasPedidos: true
          }
        }
      }
    });

    if (!filial) {
      throw errors.notFound('Filial');
    }

    res.json({
      success: true,
      data: filial
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/filiales
// Crear nueva filial (solo ADMIN)
// ============================================
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const data = filialSchema.parse(req.body);

    const filial = await prisma.filial.create({
      data,
      include: {
        provincia: { select: { nombre: true } },
        pais: { select: { nombre: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: filial,
      message: 'Filial creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/filiales/:id
// Actualizar filial
// ============================================
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);

    // Verificar permisos
    if (req.user.rol === 'FILIAL' && req.user.filialId !== filialId) {
      throw errors.forbidden('No tienes permiso para editar esta filial');
    }

    const data = filialSchema.partial().parse(req.body);

    const filial = await prisma.filial.update({
      where: { id: filialId },
      data,
      include: {
        provincia: { select: { nombre: true } },
        pais: { select: { nombre: true } }
      }
    });

    res.json({
      success: true,
      data: filial,
      message: 'Filial actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DELETE /api/filiales/:id
// Desactivar filial (soft delete)
// ============================================
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.filial.update({
      where: { id: parseInt(id) },
      data: { esActiva: false }
    });

    res.json({
      success: true,
      message: 'Filial desactivada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/filiales/:id/renovar
// Renovar autoridades
// ============================================
router.put('/:id/renovar', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);

    // Verificar permisos
    if (req.user.rol === 'FILIAL' && req.user.filialId !== filialId) {
      throw errors.forbidden('No tienes permiso para renovar esta filial');
    }

    const schema = z.object({
      fechaRenovacion: z.string().datetime(),
      actaRenovacion: z.string().optional()
    });

    const { fechaRenovacion, actaRenovacion } = schema.parse(req.body);

    // Calcular próxima renovación (2 años después)
    const proximaRenovacion = new Date(fechaRenovacion);
    proximaRenovacion.setFullYear(proximaRenovacion.getFullYear() + 2);

    const filial = await prisma.filial.update({
      where: { id: filialId },
      data: {
        renovacionAutoridades: proximaRenovacion,
        esRenovada: true,
        periodoRenovacion: false,
        ...(actaRenovacion && { actaConstitutiva: actaRenovacion })
      }
    });

    res.json({
      success: true,
      data: filial,
      message: 'Autoridades renovadas exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/filiales/:id/estadisticas
// Obtener estadísticas de una filial
// ============================================
router.get('/:id/estadisticas', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id);

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && req.user.filialId !== filialId) {
      throw errors.forbidden('No tienes acceso a esta filial');
    }

    const [
      totalIntegrantes,
      integrantesActivos,
      referentes,
      accionesUltimoMes,
      totalAcciones,
      entradasSolicitadas
    ] = await Promise.all([
      prisma.integrante.count({ where: { filialId } }),
      prisma.integrante.count({ where: { filialId, esActivo: true } }),
      prisma.integrante.count({ where: { filialId, esActivo: true, esReferente: true } }),
      prisma.accion.count({
        where: {
          filialId,
          fechaRealizacion: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      }),
      prisma.accion.count({ where: { filialId } }),
      prisma.entradaPedido.count({ where: { filialId } })
    ]);

    res.json({
      success: true,
      data: {
        integrantes: {
          total: totalIntegrantes,
          activos: integrantesActivos,
          inactivos: totalIntegrantes - integrantesActivos,
          referentes
        },
        acciones: {
          total: totalAcciones,
          ultimoMes: accionesUltimoMes
        },
        entradas: {
          solicitadas: entradasSolicitadas
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;