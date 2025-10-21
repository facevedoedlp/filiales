import { z } from 'zod';
import prisma from '../config/database.js';
import { errors } from '../middleware/errorHandler.js';
import { toCamelCase, toSnakeCase } from '../utils/case.utils.js';

const temaSchema = z.object({
  titulo: z.string().min(5, 'Título muy corto').max(200, 'Título muy largo'),
  contenido: z.string().min(10, 'Contenido muy corto'),
  categoria: z
    .enum(['GENERAL', 'EVENTOS', 'CONSULTAS', 'ANUNCIOS', 'PROPUESTAS'])
    .default('GENERAL'),
  etiquetas: z.array(z.string()).optional(),
});

const respuestaSchema = z.object({
  contenido: z.string().min(1, 'Contenido requerido'),
});

const quinceMinutosMs = 15 * 60 * 1000;

const canEdit = (registro, user) => {
  if (!registro) {
    return false;
  }

  if (['ADMIN', 'ADMIN_GLOBAL'].includes(user?.rol)) {
    return true;
  }

  if (registro.usuarioId !== user?.userId) {
    return false;
  }

  const tiempoTranscurrido = Date.now() - registro.createdAt.getTime();
  return tiempoTranscurrido <= quinceMinutosMs;
};

const buildEtiquetasData = (etiquetas) => {
  if (!etiquetas || etiquetas.length === 0) {
    return undefined;
  }

  return {
    connectOrCreate: etiquetas.map((nombre) => ({
      where: { nombre },
      create: { nombre },
    })),
  };
};

export const getTemas = async (req, res, next) => {
  try {
    const query = toCamelCase(req.query ?? {});
    const { page = 1, limit = 20, categoria, etiqueta, busqueda, orden = 'recientes' } = query;

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const take = Math.max(Number.parseInt(limit, 10) || 20, 1);
    const skip = (pageNumber - 1) * take;

    const where = {};

    if (categoria) {
      where.categoria = categoria;
    }

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { contenido: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    if (etiqueta) {
      where.etiquetas = {
        some: { nombre: etiqueta },
      };
    }

    let orderBy = { createdAt: 'desc' };
    if (orden === 'populares') {
      orderBy = { vistas: 'desc' };
    } else if (orden === 'respondidos') {
      orderBy = { respuestas: { _count: 'desc' } };
    }

    const [temas, total] = await Promise.all([
      prisma.foroTema.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              filial: { select: { id: true, nombre: true } },
            },
          },
          respuestas: {
            select: {
              id: true,
              createdAt: true,
              usuario: { select: { id: true, nombre: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          etiquetas: { select: { id: true, nombre: true, color: true } },
          _count: { select: { respuestas: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.foroTema.count({ where }),
    ]);

    res.json({
      success: true,
      data: toSnakeCase({
        temas,
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

export const getTema = async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = Number.parseInt(id, 10);

    if (Number.isNaN(temaId)) {
      throw errors.badRequest('ID inválido');
    }

    await prisma.foroTema.update({
      where: { id: temaId },
      data: { vistas: { increment: 1 } },
    });

    const tema = await prisma.foroTema.findUnique({
      where: { id: temaId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            filial: { select: { id: true, nombre: true } },
          },
        },
        respuestas: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                filial: { select: { id: true, nombre: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        etiquetas: { select: { id: true, nombre: true, color: true } },
      },
    });

    if (!tema) {
      throw errors.notFound('Tema');
    }

    res.json({
      success: true,
      data: toSnakeCase(tema),
    });
  } catch (error) {
    next(error);
  }
};

export const createTema = async (req, res, next) => {
  try {
    const body = toCamelCase(req.body ?? {});
    const parsed = temaSchema.parse(body);

    const tema = await prisma.foroTema.create({
      data: {
        titulo: parsed.titulo,
        contenido: parsed.contenido,
        categoria: parsed.categoria,
        usuarioId: req.user?.userId,
        ...(parsed.etiquetas && { etiquetas: buildEtiquetasData(parsed.etiquetas) }),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            filial: { select: { id: true, nombre: true } },
          },
        },
        etiquetas: true,
      },
    });

    res.status(201).json({
      success: true,
      data: toSnakeCase(tema),
      message: 'Tema creado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTema = async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = Number.parseInt(id, 10);

    if (Number.isNaN(temaId)) {
      throw errors.badRequest('ID inválido');
    }

    const existente = await prisma.foroTema.findUnique({ where: { id: temaId } });

    if (!existente) {
      throw errors.notFound('Tema');
    }

    if (!canEdit(existente, req.user)) {
      throw errors.forbidden('No puedes editar este tema');
    }

    const body = toCamelCase(req.body ?? {});
    const parsed = temaSchema.partial().parse(body);

    const data = {
      ...(parsed.titulo ? { titulo: parsed.titulo } : {}),
      ...(parsed.contenido ? { contenido: parsed.contenido } : {}),
      ...(parsed.categoria ? { categoria: parsed.categoria } : {}),
      ...(parsed.etiquetas
        ? {
            etiquetas: {
              set: [],
              ...buildEtiquetasData(parsed.etiquetas),
            },
          }
        : {}),
    };

    const tema = await prisma.foroTema.update({
      where: { id: temaId },
      data,
      include: {
        usuario: { select: { id: true, nombre: true } },
        etiquetas: true,
      },
    });

    res.json({
      success: true,
      data: toSnakeCase(tema),
      message: 'Tema actualizado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTema = async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = Number.parseInt(id, 10);

    if (Number.isNaN(temaId)) {
      throw errors.badRequest('ID inválido');
    }

    if (!['ADMIN', 'ADMIN_GLOBAL'].includes(req.user?.rol)) {
      throw errors.forbidden('Solo administradores pueden eliminar temas');
    }

    await prisma.foroTema.delete({ where: { id: temaId } });

    res.json({
      success: true,
      message: 'Tema eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const destacarTema = async (req, res, next) => {
  try {
    if (!['ADMIN', 'ADMIN_GLOBAL'].includes(req.user?.rol)) {
      throw errors.forbidden('Solo administradores pueden destacar temas');
    }

    const { id } = req.params;
    const temaId = Number.parseInt(id, 10);

    if (Number.isNaN(temaId)) {
      throw errors.badRequest('ID inválido');
    }

    const body = toCamelCase(req.body ?? {});
    const destacar = body.destacar === true || body.destacar === 'true';

    const tema = await prisma.foroTema.update({
      where: { id: temaId },
      data: { esDestacado: destacar },
    });

    res.json({
      success: true,
      data: toSnakeCase(tema),
      message: destacar ? 'Tema destacado' : 'Destaque removido',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCerrarTema = async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = Number.parseInt(id, 10);

    if (Number.isNaN(temaId)) {
      throw errors.badRequest('ID inválido');
    }

    const tema = await prisma.foroTema.findUnique({ where: { id: temaId } });

    if (!tema) {
      throw errors.notFound('Tema');
    }

    if (!['ADMIN', 'ADMIN_GLOBAL'].includes(req.user?.rol) && tema.usuarioId !== req.user?.userId) {
      throw errors.forbidden('No puedes cerrar este tema');
    }

    const temaActualizado = await prisma.foroTema.update({
      where: { id: temaId },
      data: { esCerrado: !tema.esCerrado },
    });

    res.json({
      success: true,
      data: toSnakeCase(temaActualizado),
      message: temaActualizado.esCerrado ? 'Tema cerrado' : 'Tema reabierto',
    });
  } catch (error) {
    next(error);
  }
};

export const createRespuesta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = Number.parseInt(id, 10);

    if (Number.isNaN(temaId)) {
      throw errors.badRequest('ID inválido');
    }

    const tema = await prisma.foroTema.findUnique({ where: { id: temaId } });

    if (!tema) {
      throw errors.notFound('Tema');
    }

    if (tema.esCerrado) {
      throw errors.forbidden('Este tema está cerrado');
    }

    const body = toCamelCase(req.body ?? {});
    const parsed = respuestaSchema.parse(body);

    const respuesta = await prisma.foroRespuesta.create({
      data: {
        contenido: parsed.contenido,
        temaId,
        usuarioId: req.user?.userId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            filial: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (tema.usuarioId !== req.user?.userId) {
      await prisma.notificacion.create({
        data: {
          usuarioId: tema.usuarioId,
          tipo: 'FORO',
          titulo: 'Nueva respuesta en tu tema',
          mensaje: `${req.user?.nombre || 'Alguien'} respondió a tu tema "${tema.titulo}"`,
          url: `/foro/tema/${temaId}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: toSnakeCase(respuesta),
      message: 'Respuesta publicada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const updateRespuesta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const respuestaId = Number.parseInt(id, 10);

    if (Number.isNaN(respuestaId)) {
      throw errors.badRequest('ID inválido');
    }

    const respuestaExistente = await prisma.foroRespuesta.findUnique({ where: { id: respuestaId } });

    if (!respuestaExistente) {
      throw errors.notFound('Respuesta');
    }

    if (!canEdit(respuestaExistente, req.user)) {
      throw errors.forbidden('No puedes editar esta respuesta');
    }

    const body = toCamelCase(req.body ?? {});
    const parsed = respuestaSchema.parse(body);

    const respuesta = await prisma.foroRespuesta.update({
      where: { id: respuestaId },
      data: { contenido: parsed.contenido },
      include: {
        usuario: { select: { id: true, nombre: true } },
      },
    });

    res.json({
      success: true,
      data: toSnakeCase(respuesta),
      message: 'Respuesta actualizada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRespuesta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const respuestaId = Number.parseInt(id, 10);

    if (Number.isNaN(respuestaId)) {
      throw errors.badRequest('ID inválido');
    }

    const respuesta = await prisma.foroRespuesta.findUnique({ where: { id: respuestaId } });

    if (!respuesta) {
      throw errors.notFound('Respuesta');
    }

    if (!['ADMIN', 'ADMIN_GLOBAL'].includes(req.user?.rol) && respuesta.usuarioId !== req.user?.userId) {
      throw errors.forbidden('No puedes eliminar esta respuesta');
    }

    await prisma.foroRespuesta.delete({ where: { id: respuestaId } });

    res.json({
      success: true,
      message: 'Respuesta eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const getCategorias = async (_req, res, next) => {
  try {
    const categorias = [
      { value: 'GENERAL', label: 'General', descripcion: 'Temas generales' },
      { value: 'EVENTOS', label: 'Eventos', descripcion: 'Eventos y actividades' },
      { value: 'CONSULTAS', label: 'Consultas', descripcion: 'Preguntas y dudas' },
      { value: 'ANUNCIOS', label: 'Anuncios', descripcion: 'Anuncios oficiales' },
      { value: 'PROPUESTAS', label: 'Propuestas', descripcion: 'Ideas y propuestas' },
    ];

    const counts = await prisma.foroTema.groupBy({
      by: ['categoria'],
      _count: { id: true },
    });

    const categoriasConConteo = categorias.map((categoria) => ({
      ...categoria,
      count: counts.find((item) => item.categoria === categoria.value)?._count.id || 0,
    }));

    res.json({
      success: true,
      data: toSnakeCase(categoriasConConteo),
    });
  } catch (error) {
    next(error);
  }
};

export const getEtiquetas = async (_req, res, next) => {
  try {
    const etiquetas = await prisma.foroEtiqueta.findMany({
      include: {
        _count: { select: { temas: true } },
      },
      orderBy: {
        temas: {
          _count: 'desc',
        },
      },
      take: 20,
    });

    res.json({
      success: true,
      data: toSnakeCase(etiquetas),
    });
  } catch (error) {
    next(error);
  }
};
