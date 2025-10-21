import { z } from 'zod';
import prisma from '../config/database.js';
import { errors } from '../middleware/errorHandler.js';
import { toCamelCase, toSnakeCase } from '../utils/case.utils.js';

const parseInteger = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const optionalNumberSchema = z
  .union([z.number().int(), z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }
    return parseInteger(value);
  });

const pedidoSchema = z.object({
  tipo: z.string().default('Filial'),
  filialId: optionalNumberSchema,
  nombre: z.string().min(2, 'Nombre requerido'),
  localidadId: optionalNumberSchema,
  procedencia: z.string().optional().nullable(),
  dni: z.string().optional().nullable(),
  fixtureId: optionalNumberSchema,
  observaciones: z.string().optional().nullable(),
  enviarTelegram: z.union([z.boolean(), z.string()]).optional().transform((value) => {
    if (value === undefined) {
      return undefined;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return undefined;
  }),
});

const ensureFilialAccess = (req, filialId) => {
  if (!filialId) {
    return;
  }

  if (req.user?.rol === 'FILIAL' && req.user.filialId !== filialId) {
    throw errors.forbidden('No tienes acceso a estos pedidos');
  }
};

export const getPedidos = async (req, res, next) => {
  try {
    const query = toCamelCase(req.query ?? {});
    const { page = 1, limit = 50, fixtureId, filialId, aprobacionSocios } = query;

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const take = Math.max(Number.parseInt(limit, 10) || 50, 1);
    const skip = (pageNumber - 1) * take;

    const where = {};

    const fixtureIdParsed = parseInteger(fixtureId);
    if (fixtureIdParsed) {
      where.fixtureId = fixtureIdParsed;
    }

    let filialIdParsed = parseInteger(filialId);
    if (req.user?.rol === 'FILIAL') {
      if (filialIdParsed && filialIdParsed !== req.user.filialId) {
        throw errors.forbidden('No tienes acceso a estos pedidos');
      }
      filialIdParsed = req.user.filialId ?? null;
    }

    if (filialIdParsed) {
      where.filialId = filialIdParsed;
    }

    if (aprobacionSocios) {
      where.aprobacionSocios = aprobacionSocios;
    }

    const [pedidos, total] = await Promise.all([
      prisma.entradaPedido.findMany({
        where,
        include: {
          filial: { select: { id: true, nombre: true } },
          fixture: { select: { id: true, fecha: true, rival: true, competicion: true, esLocal: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.entradaPedido.count({ where }),
    ]);

    res.json({
      success: true,
      data: toSnakeCase({
        pedidos,
        pagination: {
          page: pageNumber,
          limit: take,
          total,
          totalPages: take > 0 ? Math.ceil(total / take) : 0,
        },
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const getPedidoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedidoId = parseInteger(id);

    if (!pedidoId) {
      throw errors.badRequest('ID inválido');
    }

    const pedido = await prisma.entradaPedido.findUnique({
      where: { id: pedidoId },
      include: {
        filial: { select: { id: true, nombre: true } },
        fixture: { select: { id: true, fecha: true, rival: true, competicion: true, esLocal: true } },
      },
    });

    if (!pedido) {
      throw errors.notFound('Pedido');
    }

    ensureFilialAccess(req, pedido.filialId);

    res.json({
      success: true,
      data: toSnakeCase(pedido),
    });
  } catch (error) {
    next(error);
  }
};

export const createPedido = async (req, res, next) => {
  try {
    const body = toCamelCase(req.body ?? {});
    const parsed = pedidoSchema.parse(body);

    if (parsed.fixtureId === undefined || parsed.fixtureId === null) {
      throw errors.badRequest('fixture_id es requerido');
    }

    let filialId = parsed.filialId ?? null;
    if (req.user?.rol === 'FILIAL') {
      filialId = req.user.filialId ?? null;
    }

    ensureFilialAccess(req, filialId);

    const pedido = await prisma.entradaPedido.create({
      data: {
        tipo: parsed.tipo,
        filialId,
        nombre: parsed.nombre,
        localidadId: parsed.localidadId ?? null,
        procedencia: parsed.procedencia || null,
        dni: parsed.dni || null,
        fixtureId: parsed.fixtureId,
        observaciones: parsed.observaciones || null,
        enviarTelegram: parsed.enviarTelegram ?? false,
      },
      include: {
        filial: { select: { id: true, nombre: true } },
        fixture: { select: { id: true, fecha: true, rival: true, competicion: true, esLocal: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: toSnakeCase(pedido),
      message: 'Pedido creado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const updatePedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedidoId = parseInteger(id);

    if (!pedidoId) {
      throw errors.badRequest('ID inválido');
    }

    const existente = await prisma.entradaPedido.findUnique({ where: { id: pedidoId } });

    if (!existente) {
      throw errors.notFound('Pedido');
    }

    ensureFilialAccess(req, existente.filialId);

    const body = toCamelCase(req.body ?? {});
    const parsed = pedidoSchema.partial().parse(body);

    const data = {
      ...(parsed.tipo ? { tipo: parsed.tipo } : {}),
      ...(parsed.filialId !== undefined ? { filialId: parsed.filialId ?? existente.filialId } : {}),
      ...(parsed.nombre ? { nombre: parsed.nombre } : {}),
      ...(parsed.localidadId !== undefined ? { localidadId: parsed.localidadId ?? null } : {}),
      ...(parsed.procedencia !== undefined ? { procedencia: parsed.procedencia || null } : {}),
      ...(parsed.dni !== undefined ? { dni: parsed.dni || null } : {}),
      ...(parsed.fixtureId ? { fixtureId: parsed.fixtureId } : {}),
      ...(parsed.observaciones !== undefined ? { observaciones: parsed.observaciones || null } : {}),
      ...(parsed.enviarTelegram !== undefined ? { enviarTelegram: parsed.enviarTelegram } : {}),
    };

    const pedido = await prisma.entradaPedido.update({
      where: { id: pedidoId },
      data,
      include: {
        filial: { select: { id: true, nombre: true } },
        fixture: { select: { id: true, fecha: true, rival: true, competicion: true, esLocal: true } },
      },
    });

    res.json({
      success: true,
      data: toSnakeCase(pedido),
      message: 'Pedido actualizado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const aprobarPedido = async (req, res, next) => {
  try {
    if (!['ADMIN', 'ADMIN_GLOBAL'].includes(req.user?.rol)) {
      throw errors.forbidden('Solo administradores pueden aprobar pedidos');
    }

    const { id } = req.params;
    const pedidoId = parseInteger(id);

    if (!pedidoId) {
      throw errors.badRequest('ID inválido');
    }

    const pedido = await prisma.entradaPedido.update({
      where: { id: pedidoId },
      data: {
        aprobacionSocios: 'APROBADO',
        entradaAsignada: true,
      },
    });

    res.json({
      success: true,
      data: toSnakeCase(pedido),
      message: 'Pedido aprobado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const rechazarPedido = async (req, res, next) => {
  try {
    if (!['ADMIN', 'ADMIN_GLOBAL'].includes(req.user?.rol)) {
      throw errors.forbidden('Solo administradores pueden rechazar pedidos');
    }

    const { id } = req.params;
    const pedidoId = parseInteger(id);

    if (!pedidoId) {
      throw errors.badRequest('ID inválido');
    }

    const body = toCamelCase(req.body ?? {});
    const motivo = body.motivo || body.observacion || null;

    const pedido = await prisma.entradaPedido.update({
      where: { id: pedidoId },
      data: {
        aprobacionSocios: 'RECHAZADO',
        observaciones: motivo || undefined,
        entradaAsignada: false,
      },
    });

    res.json({
      success: true,
      data: toSnakeCase(pedido),
      message: 'Pedido rechazado',
    });
  } catch (error) {
    next(error);
  }
};

export const getFixture = async (req, res, next) => {
  try {
    const query = toCamelCase(req.query ?? {});
    const { proximos = true, limit = 10 } = query;

    const proximosBool = typeof proximos === 'string' ? proximos.toLowerCase() === 'true' : Boolean(proximos);
    const take = Math.max(Number.parseInt(limit, 10) || 10, 1);

    const where = {};
    if (proximosBool) {
      where.fecha = {
        gte: new Date(),
      };
    }

    const partidos = await prisma.calendario.findMany({
      where,
      orderBy: { fecha: proximosBool ? 'asc' : 'desc' },
      take,
      include: {
        _count: { select: { entradas: true } },
      },
    });

    res.json({
      success: true,
      data: toSnakeCase(partidos),
    });
  } catch (error) {
    next(error);
  }
};
