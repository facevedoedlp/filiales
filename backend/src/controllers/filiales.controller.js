import prisma from '../config/database.js';
import { errors } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { toCamelCase } from '../utils/case.utils.js';

const parseInteger = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseFloatOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const createFilial = async (req, res, next) => {
  try {
    const data = toCamelCase(req.body ?? {});

    if (!data.nombre || data.nombre.trim() === '') {
      throw errors.badRequest('El nombre de la filial es requerido');
    }

    const filialData = {
      nombre: data.nombre.trim(),
      paisId: parseInteger(data.paisId),
      provinciaId: parseInteger(data.provinciaId),
      departamentoId: parseInteger(data.departamentoId),
      localidadId: parseInteger(data.localidadId),
      nombreLocalidad: data.nombreLocalidad || null,
      direccionSede: data.direccion || data.direccionSede || null,
      mailInstitucional: data.mailInstitucional || null,
      mailAlternativo: data.mailAlternativo || null,
      telefono: data.telefono || null,
      fechaFundacion: data.fechaFundacion ? new Date(data.fechaFundacion) : null,
      esActiva: data.esActiva !== undefined ? data.esActiva : true,
      esHabilitada: data.esHabilitada !== undefined ? data.esHabilitada : true,
      situacion: data.situacion || 'ACTIVA',
      grupoId: parseInteger(data.grupoId),
      coordenadas: data.coordenadas || null,
      kmDesdeEstadio: parseFloatOrNull(data.kmDesdeEstadio),
    };

    const filial = await prisma.filial.create({
      data: filialData,
      include: {
        pais: true,
        provincia: true,
        grupo: true,
      },
    });

    res.status(201).json({
      success: true,
      data: filial,
      message: 'Filial creada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const updateFilial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = toCamelCase(req.body ?? {});

    const filialExistente = await prisma.filial.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!filialExistente) {
      throw errors.notFound('Filial');
    }

    const filialData = {};

    if (data.nombre !== undefined) filialData.nombre = data.nombre.trim();
    if (data.paisId !== undefined) filialData.paisId = parseInteger(data.paisId);
    if (data.provinciaId !== undefined) filialData.provinciaId = parseInteger(data.provinciaId);
    if (data.departamentoId !== undefined) filialData.departamentoId = parseInteger(data.departamentoId);
    if (data.localidadId !== undefined) filialData.localidadId = parseInteger(data.localidadId);
    if (data.nombreLocalidad !== undefined)
      filialData.nombreLocalidad = data.nombreLocalidad || null;
    if (data.direccion !== undefined) filialData.direccionSede = data.direccion || null;
    if (data.direccionSede !== undefined)
      filialData.direccionSede = data.direccionSede || null;
    if (data.mailInstitucional !== undefined)
      filialData.mailInstitucional = data.mailInstitucional || null;
    if (data.mailAlternativo !== undefined)
      filialData.mailAlternativo = data.mailAlternativo || null;
    if (data.telefono !== undefined) filialData.telefono = data.telefono || null;
    if (data.fechaFundacion !== undefined)
      filialData.fechaFundacion = data.fechaFundacion ? new Date(data.fechaFundacion) : null;
    if (data.esActiva !== undefined) filialData.esActiva = data.esActiva;
    if (data.esHabilitada !== undefined) filialData.esHabilitada = data.esHabilitada;
    if (data.situacion !== undefined) filialData.situacion = data.situacion;
    if (data.grupoId !== undefined) filialData.grupoId = parseInteger(data.grupoId);
    if (data.coordenadas !== undefined) filialData.coordenadas = data.coordenadas || null;
    if (data.kmDesdeEstadio !== undefined)
      filialData.kmDesdeEstadio = parseFloatOrNull(data.kmDesdeEstadio);

    const filial = await prisma.filial.update({
      where: { id: parseInt(id, 10) },
      data: filialData,
      include: {
        pais: true,
        provincia: true,
        grupo: true,
      },
    });

    res.json({
      success: true,
      data: filial,
      message: 'Filial actualizada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const getFiliales = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      esActiva,
      provinciaId,
      grupoId,
      busqueda,
      ordenar = 'nombre',
      orden = 'asc',
    } = req.query;

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(Number.parseInt(limit, 10) || 20, 1);
    const skip = (pageNumber - 1) * limitNumber;
    const where = {};

    if (esActiva !== undefined) where.esActiva = esActiva === 'true' || esActiva === true;
    if (provinciaId) where.provinciaId = parseInt(provinciaId, 10);
    if (grupoId) where.grupoId = parseInt(grupoId, 10);
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { nombreLocalidad: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    if (req.user.rol === 'FILIAL' && req.user.filialId) {
      where.id = req.user.filialId;
    }

    const sortOrder = String(orden).toLowerCase() === 'desc' ? 'desc' : 'asc';

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
            },
          },
        },
        orderBy: { [ordenar]: sortOrder },
        skip,
        take: limitNumber,
      }),
      prisma.filial.count({ where }),
    ]);

    const filialesFormateadas = filiales.map((filial) => ({
      ...filial,
      totalIntegrantes: filial._count?.integrantes || 0,
      provinciaNombre: filial.provincia?.nombre,
      paisNombre: filial.pais?.nombre,
      grupoNombre: filial.grupo?.nombre,
    }));

    res.json({
      success: true,
      data: {
        filiales: filialesFormateadas,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFilialById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id, 10);

    if (Number.isNaN(filialId)) {
      throw errors.badRequest('ID inválido');
    }

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
            cargo: { select: { nombre: true } },
          },
          orderBy: { esReferente: 'desc' },
        },
        _count: {
          select: {
            integrantes: { where: { esActivo: true } },
          },
        },
      },
    });

    if (!filial) {
      throw errors.notFound('Filial');
    }

    const filialConDatos = {
      ...filial,
      totalIntegrantesActivos: filial._count?.integrantes || 0,
      provinciaNombre: filial.provincia?.nombre,
      paisNombre: filial.pais?.nombre,
      localidadNombre: filial.localidad?.nombre,
      grupoNombre: filial.grupo?.nombre,
    };

    res.json({
      success: true,
      data: filialConDatos,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFilial = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.filial.update({
      where: { id: parseInt(id, 10) },
      data: { esActiva: false },
    });

    res.json({
      success: true,
      message: 'Filial desactivada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const renovarAutoridades = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id, 10);

    if (Number.isNaN(filialId)) {
      throw errors.badRequest('ID inválido');
    }

    if (req.user.rol === 'FILIAL' && req.user.filialId !== filialId) {
      throw errors.forbidden('No tienes permiso');
    }

    const schema = z.object({
      fechaRenovacion: z.string(),
      observaciones: z.string().optional(),
    });

    const body = toCamelCase(req.body ?? {});
    const { fechaRenovacion } = schema.parse(body);

    const proximaRenovacion = new Date(fechaRenovacion);
    proximaRenovacion.setFullYear(proximaRenovacion.getFullYear() + 2);

    const filial = await prisma.filial.update({
      where: { id: filialId },
      data: {
        renovacionAutoridades: proximaRenovacion,
        esRenovada: true,
      },
    });

    res.json({
      success: true,
      data: filial,
      message: 'Autoridades renovadas exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const getEstadisticas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filialId = parseInt(id, 10);

    if (Number.isNaN(filialId)) {
      throw errors.badRequest('ID inválido');
    }

    if (req.user.rol === 'FILIAL' && req.user.filialId !== filialId) {
      throw errors.forbidden('No tienes acceso');
    }

    const [totalIntegrantes, integrantesActivos, totalAcciones] = await Promise.all([
      prisma.integrante.count({ where: { filialId } }),
      prisma.integrante.count({ where: { filialId, esActivo: true } }),
      prisma.accion.count({ where: { filialId } }),
    ]);

    res.json({
      success: true,
      data: {
        totalIntegrantes,
        integrantesActivos,
        totalAcciones,
      },
    });
  } catch (error) {
    next(error);
  }
};
