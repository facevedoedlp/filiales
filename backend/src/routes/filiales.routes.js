// backend/src/routes/filiales.routes.js
import express from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { errors } from '../middleware/errorHandler.js';

const router = express.Router();

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
        items: filiales,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10))
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
    const data = req.body;

    if (!data.nombre || data.nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la filial es requerido'
      });
    }

    const filialData = {
      nombre: data.nombre.trim(),
      paisId: data.paisId ? parseInt(data.paisId, 10) : null,
      provinciaId: data.provinciaId ? parseInt(data.provinciaId, 10) : null,
      departamentoId: data.departamentoId ? parseInt(data.departamentoId, 10) : null,
      localidadId: data.localidadId ? parseInt(data.localidadId, 10) : null,
      nombreLocalidad: data.nombreLocalidad || null,
      direccionSede: data.direccion || data.direccionSede || null,
      mailInstitucional: data.mailInstitucional || null,
      mailAlternativo: data.mailAlternativo || null,
      telefono: data.telefono || null,
      fechaFundacion: data.fechaFundacion ? new Date(data.fechaFundacion) : null,
      autoridades: data.autoridades || null,
      esActiva: data.esActiva !== undefined ? data.esActiva : true,
      esHabilitada: data.esHabilitada !== undefined ? data.esHabilitada : true,
      situacion: data.situacion || 'ACTIVA',
      grupoId: data.grupoId ? parseInt(data.grupoId, 10) : null,
      coordenadas: data.coordenadas || null,
      kmDesdeEstadio: data.kmDesdeEstadio ? parseFloat(data.kmDesdeEstadio) : null
    };

    const filial = await prisma.filial.create({
      data: filialData,
      include: {
        provincia: { select: { nombre: true } },
        pais: { select: { nombre: true } },
        grupo: { select: { nombre: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: filial,
      message: 'Filial creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando filial:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear la filial',
      error: error.message
    });
  }
});

// ============================================
// PUT /api/filiales/:id
// Actualizar filial
// ============================================
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id, 10);

    if (Number.isNaN(filialId)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    if (req.user.rol === 'FILIAL' && req.user.filialId !== filialId) {
      throw errors.forbidden('No tienes permiso para editar esta filial');
    }

    const data = req.body;

    const filialExistente = await prisma.filial.findUnique({
      where: { id: filialId }
    });

    if (!filialExistente) {
      return res.status(404).json({
        success: false,
        message: 'Filial no encontrada'
      });
    }

    const filialData = {};

    if (data.nombre !== undefined) filialData.nombre = data.nombre.trim();
    if (data.paisId !== undefined) {
      filialData.paisId = data.paisId ? parseInt(data.paisId, 10) : null;
    }
    if (data.provinciaId !== undefined) {
      filialData.provinciaId = data.provinciaId ? parseInt(data.provinciaId, 10) : null;
    }
    if (data.departamentoId !== undefined) {
      filialData.departamentoId = data.departamentoId ? parseInt(data.departamentoId, 10) : null;
    }
    if (data.localidadId !== undefined) {
      filialData.localidadId = data.localidadId ? parseInt(data.localidadId, 10) : null;
    }
    if (data.nombreLocalidad !== undefined) {
      filialData.nombreLocalidad = data.nombreLocalidad || null;
    }
    if (data.direccion !== undefined) {
      filialData.direccionSede = data.direccion || null;
    }
    if (data.direccionSede !== undefined) {
      filialData.direccionSede = data.direccionSede || null;
    }
    if (data.mailInstitucional !== undefined) {
      filialData.mailInstitucional = data.mailInstitucional || null;
    }
    if (data.mailAlternativo !== undefined) {
      filialData.mailAlternativo = data.mailAlternativo || null;
    }
    if (data.telefono !== undefined) {
      filialData.telefono = data.telefono || null;
    }
    if (data.fechaFundacion !== undefined) {
      filialData.fechaFundacion = data.fechaFundacion ? new Date(data.fechaFundacion) : null;
    }
    if (data.autoridades !== undefined) {
      filialData.autoridades = data.autoridades || null;
    }
    if (data.esActiva !== undefined) {
      filialData.esActiva = data.esActiva;
    }
    if (data.esHabilitada !== undefined) {
      filialData.esHabilitada = data.esHabilitada;
    }
    if (data.situacion !== undefined) {
      filialData.situacion = data.situacion;
    }
    if (data.grupoId !== undefined) {
      filialData.grupoId = data.grupoId ? parseInt(data.grupoId, 10) : null;
    }
    if (data.coordenadas !== undefined) {
      filialData.coordenadas = data.coordenadas || null;
    }
    if (data.kmDesdeEstadio !== undefined) {
      filialData.kmDesdeEstadio = data.kmDesdeEstadio ? parseFloat(data.kmDesdeEstadio) : null;
    }

    const filial = await prisma.filial.update({
      where: { id: filialId },
      data: filialData,
      include: {
        provincia: { select: { nombre: true } },
        pais: { select: { nombre: true } },
        grupo: { select: { nombre: true } }
      }
    });

    res.json({
      success: true,
      data: filial,
      message: 'Filial actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando filial:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar la filial',
      error: error.message
    });
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
        periodoRenovacion: actaRenovacion ? 'RENOVADA' : null,
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