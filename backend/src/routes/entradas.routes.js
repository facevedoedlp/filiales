// backend/src/routes/entradas.routes.js
import express from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { errors } from '../middleware/errorHandler.js';

const router = express.Router();

// Schema de validación
const pedidoSchema = z.object({
  tipo: z.string().default('Filial'),
  filialId: z.number().int().optional(),
  nombre: z.string().min(2, 'Nombre requerido'),
  localidadId: z.number().int().optional(),
  procedencia: z.string().optional(),
  dni: z.string().optional(),
  fixtureId: z.number().int(),
  observaciones: z.string().optional()
});

// ============================================
// GET /api/entradas/pedidos
// Listar pedidos de entradas
// ============================================
router.get('/pedidos', authenticateToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      fixtureId,
      filialId,
      aprobacionSocios
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (fixtureId) {
      where.fixtureId = parseInt(fixtureId);
    }

    if (filialId) {
      const filialIdInt = parseInt(filialId);
      
      // Verificar acceso
      if (req.user.rol === 'FILIAL' && req.user.filialId !== filialIdInt) {
        throw errors.forbidden('No tienes acceso a estos pedidos');
      }
      
      where.filialId = filialIdInt;
    } else if (req.user.rol === 'FILIAL') {
      where.filialId = req.user.filialId;
    }

    if (aprobacionSocios) {
      where.aprobacionSocios = aprobacionSocios;
    }

    const [pedidos, total] = await Promise.all([
      prisma.entradaPedido.findMany({
        where,
        include: {
          filial: {
            select: { id: true, nombre: true }
          },
          fixture: {
            select: { fecha: true, rival: true, competicion: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.entradaPedido.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        pedidos,
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
// GET /api/entradas/pedidos/:id
// Obtener detalle de pedido
// ============================================
router.get('/pedidos/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.entradaPedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        filial: true,
        fixture: true
      }
    });

    if (!pedido) {
      throw errors.notFound('Pedido');
    }

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && pedido.filialId !== req.user.filialId) {
      throw errors.forbidden('No tienes acceso a este pedido');
    }

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/entradas/pedidos
// Crear pedido de entrada
// ============================================
router.post('/pedidos', authenticateToken, async (req, res, next) => {
  try {
    const data = pedidoSchema.parse(req.body);

    // Verificar acceso
    if (data.filialId && req.user.rol === 'FILIAL' && req.user.filialId !== data.filialId) {
      throw errors.forbidden('No puedes crear pedidos para esta filial');
    }

    // Si es usuario de filial, asignar su filialId
    if (req.user.rol === 'FILIAL' && !data.filialId) {
      data.filialId = req.user.filialId;
    }

    const pedido = await prisma.entradaPedido.create({
      data,
      include: {
        filial: { select: { nombre: true } },
        fixture: { select: { fecha: true, rival: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: pedido,
      message: 'Pedido creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/entradas/pedidos/:id
// Actualizar pedido
// ============================================
router.put('/pedidos/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedidoId = parseInt(id);

    const pedidoExistente = await prisma.entradaPedido.findUnique({
      where: { id: pedidoId }
    });

    if (!pedidoExistente) {
      throw errors.notFound('Pedido');
    }

    // Verificar acceso
    if (req.user.rol === 'FILIAL' && pedidoExistente.filialId !== req.user.filialId) {
      throw errors.forbidden('No puedes editar este pedido');
    }

    const data = pedidoSchema.partial().parse(req.body);

    const pedido = await prisma.entradaPedido.update({
      where: { id: pedidoId },
      data
    });

    res.json({
      success: true,
      data: pedido,
      message: 'Pedido actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/entradas/pedidos/:id/aprobar
// Aprobar pedido (solo ADMIN)
// ============================================
router.put('/pedidos/:id/aprobar', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.entradaPedido.update({
      where: { id: parseInt(id) },
      data: {
        aprobacionSocios: 'APROBADO',
        entradaAsignada: true
      }
    });

    // TODO: Enviar notificación a la filial

    res.json({
      success: true,
      data: pedido,
      message: 'Pedido aprobado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/entradas/pedidos/:id/rechazar
// Rechazar pedido (solo ADMIN)
// ============================================
router.put('/pedidos/:id/rechazar', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const pedido = await prisma.entradaPedido.update({
      where: { id: parseInt(id) },
      data: {
        aprobacionSocios: 'RECHAZADO',
        observaciones: motivo || pedido.observaciones
      }
    });

    // TODO: Enviar notificación a la filial

    res.json({
      success: true,
      data: pedido,
      message: 'Pedido rechazado'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/entradas/fixture
// Listar partidos del calendario
// ============================================
router.get('/fixture', authenticateToken, async (req, res, next) => {
  try {
    const { proximos = true, limit = 10 } = req.query;

    const where = {};

    if (proximos === 'true') {
      where.fecha = {
        gte: new Date()
      };
    }

    const partidos = await prisma.calendario.findMany({
      where,
      orderBy: { fecha: 'asc' },
      take: parseInt(limit),
      include: {
        _count: {
          select: { entradas: true }
        }
      }
    });

    res.json({
      success: true,
      data: partidos
    });
  } catch (error) {
    next(error);
  }
});

export default router;
