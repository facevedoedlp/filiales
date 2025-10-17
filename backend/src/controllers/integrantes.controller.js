import prisma from '../config/database.js';

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return undefined;
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

export const getIntegrantes = async (req, res) => {
  try {
    const { page = 1, limit = 20, filialId, esActivo, busqueda } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const take = Math.max(parseInt(limit, 10) || 20, 1);
    const skip = (pageNumber - 1) * take;

    const whereClause = {};

    if (filialId) {
      const filialIdInt = parseInt(filialId, 10);
      if (Number.isNaN(filialIdInt)) {
        return res.status(400).json({
          success: false,
          message: 'filialId debe ser un número válido',
        });
      }

      if (req.user?.rol === 'FILIAL' && req.user.filialId !== filialIdInt) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a los integrantes de esta filial',
        });
      }

      whereClause.filialId = filialIdInt;
    } else if (req.user?.rol === 'FILIAL' && req.user.filialId) {
      whereClause.filialId = req.user.filialId;
    }

    const esActivoFilter = parseBoolean(esActivo);
    if (typeof esActivoFilter !== 'undefined') {
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
      data: {
        items: integrantes.map(formatIntegrante),
        pagination: {
          page: pageNumber,
          limit: take,
          total,
          totalPages,
        },
      },
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

    if (req.user?.rol === 'FILIAL' && req.user.filialId !== integrante.filialId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este integrante',
      });
    }

    res.json({
      success: true,
      data: formatIntegrante(integrante),
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
    const { filialId, nombre, cargo, correo, telefono, esActivo, ...rest } = req.body;

    if (!filialId) {
      return res.status(400).json({
        success: false,
        message: 'filialId es requerido para crear un integrante',
      });
    }

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido',
      });
    }

    const filialIdInt = parseInt(filialId, 10);

    if (Number.isNaN(filialIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'filialId debe ser un número válido',
      });
    }

    if (req.user?.rol === 'FILIAL' && req.user.filialId !== filialIdInt) {
      return res.status(403).json({
        success: false,
        message: 'No puedes agregar integrantes a esta filial',
      });
    }

    const integrante = await prisma.integrante.create({
      data: {
        filialId: filialIdInt,
        nombre: nombre.trim(),
        cargo: cargo || null,
        correo: correo || null,
        telefono: telefono || null,
        esActivo: typeof esActivo !== 'undefined' ? Boolean(esActivo) : true,
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

    res.status(201).json({
      success: true,
      data: formatIntegrante(integrante),
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

    if (req.user?.rol === 'FILIAL' && req.user.filialId !== existente.filialId) {
      return res.status(403).json({
        success: false,
        message: 'No puedes editar este integrante',
      });
    }

    const { filialId, nombre, cargo, correo, telefono, esActivo, ...rest } = req.body;
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
      const filialIdInt = filialId ? parseInt(filialId, 10) : null;
      if (filialIdInt && Number.isNaN(filialIdInt)) {
        return res.status(400).json({
          success: false,
          message: 'filialId debe ser un número válido',
        });
      }

      if (filialIdInt && req.user?.rol === 'FILIAL' && req.user.filialId !== filialIdInt) {
        return res.status(403).json({
          success: false,
          message: 'No puedes mover integrantes a otra filial',
        });
      }

      if (filialIdInt) {
        data.filialId = filialIdInt;
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
      data.esActivo = Boolean(esActivo);
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

    res.json({
      success: true,
      data: formatIntegrante(integrante),
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

    if (req.user?.rol === 'FILIAL' && req.user.filialId !== existente.filialId) {
      return res.status(403).json({
        success: false,
        message: 'No puedes eliminar este integrante',
      });
    }

    await prisma.integrante.delete({ where: { id: integranteId } });

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

    if (req.user?.rol === 'FILIAL' && req.user.filialId !== integrante.filialId) {
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

    res.json({
      success: true,
      data: updated,
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

    if (req.user?.rol === 'FILIAL' && req.user.filialId !== integrante.filialId) {
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

    res.json({
      success: true,
      data: updated,
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
