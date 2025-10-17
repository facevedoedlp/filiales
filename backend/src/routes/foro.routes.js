// backend/src/routes/foro.routes.js
import express from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { errors } from '../middleware/errorHandler.js';

const router = express.Router();

// Schemas de validación
const temaSchema = z.object({
  titulo: z.string().min(5, 'Título muy corto').max(200, 'Título muy largo'),
  contenido: z.string().min(10, 'Contenido muy corto'),
  categoria: z.enum(['GENERAL', 'EVENTOS', 'CONSULTAS', 'ANUNCIOS', 'PROPUESTAS']).default('GENERAL'),
  etiquetas: z.array(z.string()).optional()
});

const respuestaSchema = z.object({
  contenido: z.string().min(1, 'Contenido requerido')
});

// ============================================
// GET /api/foro/temas
// Listar temas del foro con filtros
// ============================================
router.get('/temas', authenticateToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoria,
      etiqueta,
      busqueda,
      orden = 'recientes'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {};

    if (categoria) {
      where.categoria = categoria;
    }

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { contenido: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    if (etiqueta) {
      where.etiquetas = {
        some: { nombre: etiqueta }
      };
    }

    // Ordenamiento
    let orderBy = { createdAt: 'desc' }; // recientes por defecto
    if (orden === 'populares') {
      orderBy = { vistas: 'desc' };
    } else if (orden === 'respondidos') {
      orderBy = { respuestas: { _count: 'desc' } };
    }

    // Consultar
    const [temas, total] = await Promise.all([
      prisma.foroTema.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              filial: {
                select: { nombre: true }
              }
            }
          },
          respuestas: {
            select: {
              id: true,
              createdAt: true,
              usuario: {
                select: { nombre: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          etiquetas: {
            select: { id: true, nombre: true, color: true }
          },
          _count: {
            select: { respuestas: true }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.foroTema.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        temas,
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
// GET /api/foro/temas/:id
// Obtener detalle de un tema con respuestas
// ============================================
router.get('/temas/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = parseInt(id);

    // Incrementar vistas
    await prisma.foroTema.update({
      where: { id: temaId },
      data: { vistas: { increment: 1 } }
    });

    const tema = await prisma.foroTema.findUnique({
      where: { id: temaId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            filial: {
              select: { nombre: true }
            }
          }
        },
        respuestas: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                filial: {
                  select: { nombre: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        etiquetas: {
          select: { id: true, nombre: true, color: true }
        }
      }
    });

    if (!tema) {
      throw errors.notFound('Tema');
    }

    res.json({
      success: true,
      data: tema
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/foro/temas
// Crear nuevo tema
// ============================================
router.post('/temas', authenticateToken, async (req, res, next) => {
  try {
    const { titulo, contenido, categoria, etiquetas } = temaSchema.parse(req.body);

    // Crear o conectar etiquetas
    const etiquetasData = etiquetas?.length
      ? {
          connectOrCreate: etiquetas.map(nombre => ({
            where: { nombre },
            create: { nombre }
          }))
        }
      : undefined;

    const tema = await prisma.foroTema.create({
      data: {
        titulo,
        contenido,
        categoria,
        usuarioId: req.user.userId,
        ...(etiquetasData && { etiquetas: etiquetasData })
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            filial: { select: { nombre: true } }
          }
        },
        etiquetas: true
      }
    });

    res.status(201).json({
      success: true,
      data: tema,
      message: 'Tema creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/foro/temas/:id
// Editar tema (solo autor o admin)
// ============================================
router.put('/temas/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = parseInt(id);

    // Buscar tema
    const temaExistente = await prisma.foroTema.findUnique({
      where: { id: temaId }
    });

    if (!temaExistente) {
      throw errors.notFound('Tema');
    }

    // Verificar permisos
    if (req.user.rol !== 'ADMIN' && temaExistente.usuarioId !== req.user.userId) {
      throw errors.forbidden('No puedes editar este tema');
    }

    // Verificar tiempo límite de edición (15 minutos)
    if (req.user.rol !== 'ADMIN') {
      const tiempoTranscurrido = Date.now() - temaExistente.createdAt.getTime();
      const quinceMinutos = 15 * 60 * 1000;
      
      if (tiempoTranscurrido > quinceMinutos) {
        throw errors.forbidden('El tiempo para editar ha expirado (15 minutos)');
      }
    }

    const { titulo, contenido, categoria } = temaSchema.partial().parse(req.body);

    const tema = await prisma.foroTema.update({
      where: { id: temaId },
      data: { titulo, contenido, categoria },
      include: {
        usuario: {
          select: { nombre: true }
        },
        etiquetas: true
      }
    });

    res.json({
      success: true,
      data: tema,
      message: 'Tema actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DELETE /api/foro/temas/:id
// Eliminar tema (solo admin)
// ============================================
router.delete('/temas/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.foroTema.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Tema eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/foro/temas/:id/destacar
// Destacar/quitar destaque de tema (solo admin)
// ============================================
router.put('/temas/:id/destacar', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { destacar } = req.body;

    const tema = await prisma.foroTema.update({
      where: { id: parseInt(id) },
      data: { esDestacado: destacar === true }
    });

    res.json({
      success: true,
      data: tema,
      message: destacar ? 'Tema destacado' : 'Destaque removido'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/foro/temas/:id/cerrar
// Cerrar tema (admin o autor)
// ============================================
router.put('/temas/:id/cerrar', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = parseInt(id);

    const tema = await prisma.foroTema.findUnique({
      where: { id: temaId }
    });

    if (!tema) {
      throw errors.notFound('Tema');
    }

    // Verificar permisos
    if (req.user.rol !== 'ADMIN' && tema.usuarioId !== req.user.userId) {
      throw errors.forbidden('No puedes cerrar este tema');
    }

    const temaActualizado = await prisma.foroTema.update({
      where: { id: temaId },
      data: { esCerrado: !tema.esCerrado }
    });

    res.json({
      success: true,
      data: temaActualizado,
      message: temaActualizado.esCerrado ? 'Tema cerrado' : 'Tema reabierto'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/foro/temas/:id/respuestas
// Responder a un tema
// ============================================
router.post('/temas/:id/respuestas', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const temaId = parseInt(id);

    // Verificar que el tema existe y no está cerrado
    const tema = await prisma.foroTema.findUnique({
      where: { id: temaId }
    });

    if (!tema) {
      throw errors.notFound('Tema');
    }

    if (tema.esCerrado) {
      throw errors.forbidden('Este tema está cerrado');
    }

    const { contenido } = respuestaSchema.parse(req.body);

    const respuesta = await prisma.foroRespuesta.create({
      data: {
        contenido,
        temaId,
        usuarioId: req.user.userId
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            filial: { select: { nombre: true } }
          }
        }
      }
    });

    // Crear notificación para el autor del tema (si no es él mismo)
    if (tema.usuarioId !== req.user.userId) {
      await prisma.notificacion.create({
        data: {
          usuarioId: tema.usuarioId,
          tipo: 'FORO',
          titulo: 'Nueva respuesta en tu tema',
          mensaje: `${req.user.nombre || 'Alguien'} respondió a tu tema "${tema.titulo}"`,
          url: `/foro/tema/${temaId}`
        }
      });
    }

    res.status(201).json({
      success: true,
      data: respuesta,
      message: 'Respuesta publicada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/foro/respuestas/:id
// Editar respuesta (solo autor)
// ============================================
router.put('/respuestas/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const respuestaId = parseInt(id);

    const respuestaExistente = await prisma.foroRespuesta.findUnique({
      where: { id: respuestaId }
    });

    if (!respuestaExistente) {
      throw errors.notFound('Respuesta');
    }

    // Verificar que es el autor
    if (respuestaExistente.usuarioId !== req.user.userId) {
      throw errors.forbidden('No puedes editar esta respuesta');
    }

    // Verificar tiempo límite (15 minutos)
    const tiempoTranscurrido = Date.now() - respuestaExistente.createdAt.getTime();
    const quinceMinutos = 15 * 60 * 1000;
    
    if (tiempoTranscurrido > quinceMinutos) {
      throw errors.forbidden('El tiempo para editar ha expirado (15 minutos)');
    }

    const { contenido } = respuestaSchema.parse(req.body);

    const respuesta = await prisma.foroRespuesta.update({
      where: { id: respuestaId },
      data: { contenido },
      include: {
        usuario: {
          select: { nombre: true }
        }
      }
    });

    res.json({
      success: true,
      data: respuesta,
      message: 'Respuesta actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DELETE /api/foro/respuestas/:id
// Eliminar respuesta (admin o autor)
// ============================================
router.delete('/respuestas/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const respuestaId = parseInt(id);

    const respuesta = await prisma.foroRespuesta.findUnique({
      where: { id: respuestaId }
    });

    if (!respuesta) {
      throw errors.notFound('Respuesta');
    }

    // Verificar permisos
    if (req.user.rol !== 'ADMIN' && respuesta.usuarioId !== req.user.userId) {
      throw errors.forbidden('No puedes eliminar esta respuesta');
    }

    await prisma.foroRespuesta.delete({
      where: { id: respuestaId }
    });

    res.json({
      success: true,
      message: 'Respuesta eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/foro/categorias
// Listar categorías disponibles
// ============================================
router.get('/categorias', authenticateToken, async (req, res, next) => {
  try {
    const categorias = [
      { value: 'GENERAL', label: 'General', descripcion: 'Temas generales' },
      { value: 'EVENTOS', label: 'Eventos', descripcion: 'Eventos y actividades' },
      { value: 'CONSULTAS', label: 'Consultas', descripcion: 'Preguntas y dudas' },
      { value: 'ANUNCIOS', label: 'Anuncios', descripcion: 'Anuncios oficiales' },
      { value: 'PROPUESTAS', label: 'Propuestas', descripcion: 'Ideas y propuestas' }
    ];

    // Contar temas por categoría
    const counts = await prisma.foroTema.groupBy({
      by: ['categoria'],
      _count: { id: true }
    });

    const categoriasConConteo = categorias.map(cat => ({
      ...cat,
      count: counts.find(c => c.categoria === cat.value)?._count.id || 0
    }));

    res.json({
      success: true,
      data: categoriasConConteo
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/foro/etiquetas
// Listar etiquetas más usadas
// ============================================
router.get('/etiquetas', authenticateToken, async (req, res, next) => {
  try {
    const etiquetas = await prisma.foroEtiqueta.findMany({
      include: {
        _count: {
          select: { temas: true }
        }
      },
      orderBy: {
        temas: {
          _count: 'desc'
        }
      },
      take: 20
    });

    res.json({
      success: true,
      data: etiquetas
    });
  } catch (error) {
    next(error);
  }
});

export default router;