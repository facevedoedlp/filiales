import prisma from '../config/database.js';
import { toCamelCase, toSnakeCase } from '../utils/case.utils.js';
import { registrarAuditoria } from '../services/auditoria.service.js';

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }
  return null;
};

const formatIntegrante = (integrante) => {
  if (!integrante) {
    return integrante;
  }

  return {
    ...integrante,
    cargo: integrante.cargo?.nombre ?? integrante.cargo ?? null,
  };
};

const hasFilialAccess = (req, filialId) => req.scope?.isGlobalAdmin || filialId === req.scope?.filialId;

export const getIntegrantes = async (req, res) => {
  try {
    const query = toCamelCase(req.query ?? {});
    const { page = 1, limit = 20, filialId, esActivo, busqueda } = query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const take = Math.max(parseInt(limit, 10) || 20, 1);
    const skip = (pageNumber - 1) * take;

    const whereClause = {};

    const resolvedFilialId = req.scope?.resolveFilialId(filialId);
    if (resolvedFilialId !== null && resolvedFilialId !== undefined) {
      whereClause.filialId = resolvedFilialId;
    } else if (!req.scope?.isGlobalAdmin && req.scope?.filialId) {
      whereClause.filialId = req.scope.filialId;
    }

    const esActivoFilter = parseBoolean(esActivo);
    if (esActivoFilter !== null) {
      whereClause.esActivo = esActivoFilter;
    }

    if (busqueda) {
      whereClause.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { correo: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    const [integrantes, total] = await Promise.all([
      prisma.integrante.findMany({
        where: whereClause,
        skip,
        take,
        include: {
          filial: {
            select: {
              id: true,
              nombre: true,
            },
          },
          cargo: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        orderBy: {
          nombre: 'asc',
        },
      }),
      prisma.integrante.count({ where: whereClause }),
    ]);

    const totalPages = take > 0 ? Math.ceil(total / take) : 0;

    res.json({
      success: true,
      data: toSnakeCase({
        items: integrantes.map(formatIntegrante),
        pagination: {
          page: pageNumber,
          limit: take,
          total,
          totalPages,
        },
      }),
    });
  } catch (error) {
    console.error('Error obteniendo integrantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener integrantes',
      error: error.message,
    });
  }
};

export const getIntegranteById = async (req, res) => {
  try {
    const { id } = req.params;
    const integranteId = parseInt(id, 10);

    if (Number.isNaN(integranteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const integrante = await prisma.integrante.findUnique({
      where: { id: integranteId },
      include: {
        filial: {
          select: {
            id: true,
            nombre: true,
          },
        },
        cargo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        historialInactividad: {
          orderBy: { fechaInicio: 'desc' },
        },
      },
    });

    if (!integrante) {
      return res.status(404).json({
        success: false,
        message: 'Integrante no encontrado',
      });
    }

    if (!hasFilialAccess(req, integrante.filialId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este integrante',
      });
    }

    res.json({
      success: true,
      data: toSnakeCase(formatIntegrante(integrante)),
    });
  } catch (error) {
    console.error('Error obteniendo integrante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener integrante',
      error: error.message,
    });
  }
};

export const createIntegrante = async (req, res) => {
  try {
    const body = toCamelCase(req.body ?? {});
    const { filialId, nombre, cargo, correo, telefono, esActivo, ...rest } = body;

    const resolvedFilialId = req.scope?.resolveFilialId(filialId);

    if (resolvedFilialId === null) {
      return res.status(400).json({
        success: false,
        message: 'filial_id es requerido para crear un integrante',
      });
    }

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido',
      });
    }
    if (!hasFilialAccess(req, resolvedFilialId)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes agregar integrantes a esta filial',
      });
    }

    const esActivoValue = parseBoolean(esActivo);
    const integrante = await prisma.integrante.create({
      data: {
        filialId: resolvedFilialId,
        nombre: nombre.trim(),
        cargo: cargo || null,
        correo: correo || null,
        telefono: telefono || null,
        esActivo: esActivoValue === null ? true : esActivoValue,
        ...rest,
      },
      include: {
        filial: {
          select: {
            id: true,
            nombre: true,
          },
        },
        cargo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    registrarAuditoria({
      req,
      operacion: 'CREATE',
      tabla: 'integrantes',
      registroId: integrante.id,
      filialId: integrante.filialId,
      datos: integrante,
    });

    res.status(201).json({
      success: true,
      data: toSnakeCase(formatIntegrante(integrante)),
    });
  } catch (error) {
    console.error('Error creando integrante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear integrante',
      error: error.message,
    });
  }
};

export const updateIntegrante = async (req, res) => {
  try {
    const { id } = req.params;
    const integranteId = parseInt(id, 10);

    if (Number.isNaN(integranteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const existente = await prisma.integrante.findUnique({ where: { id: integranteId } });

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: 'Integrante no encontrado',
      });
    }

    if (!hasFilialAccess(req, existente.filialId)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes editar este integrante',
      });
    }

    const body = toCamelCase(req.body ?? {});
    const { filialId, nombre, cargo, correo, telefono, esActivo, ...rest } = body;
    const data = { ...rest };

    if (typeof nombre !== 'undefined') {
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede estar vacío',
        });
      }
      data.nombre = nombre.trim();
    }

    if (typeof filialId !== 'undefined') {
      const resolvedFilialId = req.scope?.resolveFilialId(filialId);
      if (resolvedFilialId === null) {
        return res.status(400).json({
          success: false,
          message: 'filial_id debe ser un número válido',
        });
      }

      if (!req.scope?.isGlobalAdmin && resolvedFilialId !== existente.filialId) {
        return res.status(403).json({
          success: false,
          message: 'No puedes mover integrantes a otra filial',
        });
      }

      if (req.scope?.isGlobalAdmin) {
        data.filialId = resolvedFilialId;
      }
    }

    if (typeof cargo !== 'undefined') {
      data.cargo = cargo || null;
    }

    if (typeof correo !== 'undefined') {
      data.correo = correo || null;
    }

    if (typeof telefono !== 'undefined') {
      data.telefono = telefono || null;
    }

    if (typeof esActivo !== 'undefined') {
      const esActivoValue = parseBoolean(esActivo);
      if (esActivoValue === null) {
        return res.status(400).json({
          success: false,
          message: 'es_activo debe ser un valor booleano',
        });
      }
      data.esActivo = esActivoValue;
    }

    const integrante = await prisma.integrante.update({
      where: { id: integranteId },
      data,
      include: {
        filial: {
          select: {
            id: true,
            nombre: true,
          },
        },
        cargo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    registrarAuditoria({
      req,
      operacion: 'UPDATE',
      tabla: 'integrantes',
      registroId: integrante.id,
      filialId: integrante.filialId,
      datos: integrante,
    });

    res.json({
      success: true,
      data: toSnakeCase(formatIntegrante(integrante)),
    });
  } catch (error) {
    console.error('Error actualizando integrante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar integrante',
      error: error.message,
    });
  }
};

export const deleteIntegrante = async (req, res) => {
  try {
    const { id } = req.params;
    const integranteId = parseInt(id, 10);

    if (Number.isNaN(integranteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const existente = await prisma.integrante.findUnique({ where: { id: integranteId } });

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: 'Integrante no encontrado',
      });
    }

    if (!hasFilialAccess(req, existente.filialId)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes eliminar este integrante',
      });
    }

    await prisma.integrante.delete({ where: { id: integranteId } });

    registrarAuditoria({
      req,
      operacion: 'DELETE',
      tabla: 'integrantes',
      registroId: integranteId,
      filialId: existente.filialId,
    });

    res.json({
      success: true,
      message: 'Integrante eliminado correctamente',
    });
  } catch (error) {
    console.error('Error eliminando integrante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar integrante',
      error: error.message,
    });
  }
};

export const deactivateIntegrante = async (req, res) => {
  try {
    const { id } = req.params;
    const integranteId = parseInt(id, 10);

    if (Number.isNaN(integranteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const integrante = await prisma.integrante.findUnique({ where: { id: integranteId } });

    if (!integrante) {
      return res.status(404).json({
        success: false,
        message: 'Integrante no encontrado',
      });
    }

    if (!hasFilialAccess(req, integrante.filialId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este integrante',
      });
    }

    const updated = await prisma.integrante.update({
      where: { id: integranteId },
      data: { esActivo: false },
    });

    await prisma.historialInactividad.create({
      data: {
        integranteId,
        fechaInicio: new Date(),
        motivo: 'Desactivado manualmente',
      },
    });

    registrarAuditoria({
      req,
      operacion: 'DEACTIVATE',
      tabla: 'integrantes',
      registroId: integranteId,
      filialId: integrante.filialId,
    });

    res.json({
      success: true,
      data: toSnakeCase(updated),
      message: 'Integrante desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error desactivando integrante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar integrante',
      error: error.message,
    });
  }
};

export const activateIntegrante = async (req, res) => {
  try {
    const { id } = req.params;
    const integranteId = parseInt(id, 10);

    if (Number.isNaN(integranteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const integrante = await prisma.integrante.findUnique({ where: { id: integranteId } });

    if (!integrante) {
      return res.status(404).json({
        success: false,
        message: 'Integrante no encontrado',
      });
    }

    if (!hasFilialAccess(req, integrante.filialId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este integrante',
      });
    }

    await prisma.historialInactividad.updateMany({
      where: {
        integranteId,
        fechaFin: null,
      },
      data: { fechaFin: new Date() },
    });

    const updated = await prisma.integrante.update({
      where: { id: integranteId },
      data: { esActivo: true },
    });

    registrarAuditoria({
      req,
      operacion: 'ACTIVATE',
      tabla: 'integrantes',
      registroId: integranteId,
      filialId: integrante.filialId,
    });

    res.json({
      success: true,
      data: toSnakeCase(updated),
      message: 'Integrante activado exitosamente',
    });
  } catch (error) {
    console.error('Error activando integrante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar integrante',
      error: error.message,
    });
  }
};
