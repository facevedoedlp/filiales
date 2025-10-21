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

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

const accionSchema = z.object({
  tipo: z.string().min(1),
  filialId: optionalNumberSchema,
  fechaRealizacion: z.string().datetime(),
  calendarioId: optionalNumberSchema,
  descripcion: z.string().min(3),
  ubicacion: z.string().optional().nullable(),
  otrosColaboradores: z.string().optional().nullable(),
  imagenPromocion: z.string().optional().nullable(),
  imagen1: z.string().optional().nullable(),
  imagen2: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  enviarCorreo: z.union([z.boolean(), z.string()]).optional().transform((value) => {
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

const buildAccionWhere = (query, user) => {
  const where = {};

  const filialId = parseInteger(query.filialId);
  if (user?.rol === 'FILIAL') {
    if (filialId && filialId !== user.filialId) {
      throw errors.forbidden('No tienes acceso a estas acciones');
    }
    where.filialId = user.filialId ?? null;
  } else if (filialId) {
    where.filialId = filialId;
  }

  if (query.tipo) {
    where.tipo = query.tipo;
  }

  const fechaDesde = parseDate(query.fechaDesde);
  const fechaHasta = parseDate(query.fechaHasta);
  if (fechaDesde || fechaHasta) {
    where.fechaRealizacion = {};
    if (fechaDesde) {
      where.fechaRealizacion.gte = fechaDesde;
    }
    if (fechaHasta) {
      where.fechaRealizacion.lte = fechaHasta;
    }
  }

  return where;
};

const serializeAccion = (accion) => {
  if (!accion) {
    return accion;
  }

  const ahora = new Date();
  const fechaRealizacion = accion.fechaRealizacion ? new Date(accion.fechaRealizacion) : null;
  const fechaCarga = accion.fechaCarga ? new Date(accion.fechaCarga) : null;
  const diasDesdeRealizacion =
    fechaRealizacion ? Math.floor((ahora.getTime() - fechaRealizacion.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const diasDesdeCarga =
    fechaCarga ? Math.floor((ahora.getTime() - fechaCarga.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return {
    ...accion,
    filialNombre: accion.filial?.nombre ?? null,
    calendarioFecha: accion.calendario?.fecha ?? null,
    calendarioRival: accion.calendario?.rival ?? null,
    calendarioCompeticion: accion.calendario?.competicion ?? null,
    responsable: accion.usuario
      ? {
          id: accion.usuario.id,
          nombre: accion.usuario.nombre,
          correo: accion.usuario.correo,
        }
      : null,
    diasDesdeRealizacion,
    diasDesdeCarga,
  };
};

export const getAcciones = async (req, res, next) => {
  try {
    const query = toCamelCase(req.query ?? {});
    const { page = 1, limit = 20, ordenar = 'fechaRealizacion', orden = 'desc' } = query;

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const take = Math.max(Number.parseInt(limit, 10) || 20, 1);
    const skip = (pageNumber - 1) * take;

    const allowedOrderFields = new Set([
      'fechaRealizacion',
      'fechaCarga',
      'tipo',
      'createdAt',
      'updatedAt',
    ]);
    const orderField = allowedOrderFields.has(ordenar) ? ordenar : 'fechaRealizacion';
    const orderDirection = String(orden).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where = buildAccionWhere(query, req.user);

    const [acciones, total] = await Promise.all([
      prisma.accion.findMany({
        where,
        include: {
          filial: { select: { id: true, nombre: true } },
          calendario: { select: { id: true, fecha: true, rival: true, competicion: true, esLocal: true } },
          usuario: { select: { id: true, nombre: true, correo: true } },
        },
        orderBy: { [orderField]: orderDirection },
        skip,
        take,
      }),
      prisma.accion.count({ where }),
    ]);

    const accionesFormateadas = acciones.map(serializeAccion);

    res.json({
      success: true,
      data: toSnakeCase({
        acciones: accionesFormateadas,
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

export const getAccionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accionId = parseInteger(id);

    if (!accionId) {
      throw errors.badRequest('ID inválido');
    }

    const accion = await prisma.accion.findUnique({
      where: { id: accionId },
      include: {
        filial: { select: { id: true, nombre: true } },
        calendario: { select: { id: true, fecha: true, rival: true, competicion: true, esLocal: true } },
        usuario: { select: { id: true, nombre: true, correo: true } },
      },
    });

    if (!accion) {
      throw errors.notFound('Acción');
    }

    if (req.user?.rol === 'FILIAL' && accion.filialId !== req.user.filialId) {
      throw errors.forbidden('No tienes acceso a esta acción');
    }

    res.json({
      success: true,
      data: toSnakeCase(serializeAccion(accion)),
    });
  } catch (error) {
    next(error);
  }
};

export const createAccion = async (req, res, next) => {
  try {
    const body = toCamelCase(req.body ?? {});
    const parsed = accionSchema.parse(body);

    const filialId = parsed.filialId ?? req.user?.filialId ?? null;

    if (req.user?.rol === 'FILIAL' && filialId !== req.user.filialId) {
      throw errors.forbidden('No puedes crear acciones para esta filial');
    }

    const accion = await prisma.accion.create({
      data: {
        tipo: parsed.tipo,
        filialId,
        fechaRealizacion: new Date(parsed.fechaRealizacion),
        calendarioId: parsed.calendarioId ?? null,
        descripcion: parsed.descripcion,
        ubicacion: parsed.ubicacion || null,
        otrosColaboradores: parsed.otrosColaboradores || null,
        imagenPromocion: parsed.imagenPromocion || null,
        imagen1: parsed.imagen1 || null,
        imagen2: parsed.imagen2 || null,
        observaciones: parsed.observaciones || null,
        enviarCorreo: parsed.enviarCorreo ?? false,
        encargadoId: req.user?.userId ?? null,
        usuarioCorreo: req.user?.correo || req.user?.email || null,
      },
      include: {
        filial: { select: { id: true, nombre: true } },
        calendario: { select: { id: true, fecha: true, rival: true, competicion: true, esLocal: true } },
        usuario: { select: { id: true, nombre: true, correo: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: toSnakeCase(serializeAccion(accion)),
      message: 'Acción registrada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accionId = parseInteger(id);

    if (!accionId) {
      throw errors.badRequest('ID inválido');
    }

    const existente = await prisma.accion.findUnique({ where: { id: accionId } });

    if (!existente) {
      throw errors.notFound('Acción');
    }

    if (req.user?.rol === 'FILIAL' && existente.filialId !== req.user.filialId) {
      throw errors.forbidden('No puedes editar esta acción');
    }

    const body = toCamelCase(req.body ?? {});
    const parsed = accionSchema.partial().parse(body);

    const data = {
      ...(parsed.tipo ? { tipo: parsed.tipo } : {}),
      ...(parsed.filialId !== undefined
        ? { filialId: parsed.filialId ?? null }
        : {}),
      ...(parsed.fechaRealizacion ? { fechaRealizacion: new Date(parsed.fechaRealizacion) } : {}),
      ...(parsed.calendarioId !== undefined ? { calendarioId: parsed.calendarioId ?? null } : {}),
      ...(parsed.descripcion ? { descripcion: parsed.descripcion } : {}),
      ...(parsed.ubicacion !== undefined ? { ubicacion: parsed.ubicacion || null } : {}),
      ...(parsed.otrosColaboradores !== undefined
        ? { otrosColaboradores: parsed.otrosColaboradores || null }
        : {}),
      ...(parsed.imagenPromocion !== undefined ? { imagenPromocion: parsed.imagenPromocion || null } : {}),
      ...(parsed.imagen1 !== undefined ? { imagen1: parsed.imagen1 || null } : {}),
      ...(parsed.imagen2 !== undefined ? { imagen2: parsed.imagen2 || null } : {}),
      ...(parsed.observaciones !== undefined ? { observaciones: parsed.observaciones || null } : {}),
      ...(parsed.enviarCorreo !== undefined ? { enviarCorreo: parsed.enviarCorreo } : {}),
    };

    const accion = await prisma.accion.update({
      where: { id: accionId },
      data,
      include: {
        filial: { select: { id: true, nombre: true } },
        calendario: { select: { id: true, fecha: true, rival: true, competicion: true, esLocal: true } },
        usuario: { select: { id: true, nombre: true, correo: true } },
      },
    });

    res.json({
      success: true,
      data: toSnakeCase(serializeAccion(accion)),
      message: 'Acción actualizada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accionId = parseInteger(id);

    if (!accionId) {
      throw errors.badRequest('ID inválido');
    }

    if (!['ADMIN', 'ADMIN_GLOBAL'].includes(req.user?.rol)) {
      throw errors.forbidden('Solo administradores pueden eliminar acciones');
    }

    await prisma.accion.delete({ where: { id: accionId } });

    res.json({
      success: true,
      message: 'Acción eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};
