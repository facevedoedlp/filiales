// backend/src/routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { errors } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Schemas de validación
const loginSchema = z.object({
  correo: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido')
});

const registerSchema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto'),
  correo: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  rol: z.enum(['ADMIN', 'COORDINADOR', 'FILIAL']).optional(),
  filialId: z.number().optional()
});

// ============================================
// POST /api/auth/login
// ============================================
router.post('/login', async (req, res, next) => {
  try {
    // Validar datos
    const { correo, password } = loginSchema.parse(req.body);

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      include: {
        filial: {
          select: { id: true, nombre: true }
        }
      }
    });

    if (!usuario) {
      throw errors.unauthorized('Credenciales inválidas');
    }

    if (!usuario.esActivo) {
      throw errors.forbidden('Usuario inactivo');
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, usuario.password);
    if (!isValidPassword) {
      throw errors.unauthorized('Credenciales inválidas');
    }

    // Generar JWT
    const token = jwt.sign(
      {
        userId: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        filialId: usuario.filialId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Respuesta sin password
    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      data: {
        token,
        usuario: usuarioSinPassword
      },
      message: 'Login exitoso'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/auth/register (Solo ADMIN)
// ============================================
router.post('/register', authenticateToken, async (req, res, next) => {
  try {
    // Solo admin puede crear usuarios
    if (req.user.rol !== 'ADMIN') {
      throw errors.forbidden('Solo administradores pueden crear usuarios');
    }

    // Validar datos
    const data = registerSchema.parse(req.body);

    // Verificar si el email ya existe
    const existente = await prisma.usuario.findUnique({
      where: { correo: data.correo }
    });

    if (existente) {
      throw errors.conflict('El email ya está registrado');
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        ...data,
        password: hashedPassword
      },
      include: {
        filial: {
          select: { id: true, nombre: true }
        }
      }
    });

    // Respuesta sin password
    const { password: _, ...usuarioSinPassword } = usuario;

    res.status(201).json({
      success: true,
      data: usuarioSinPassword,
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/auth/me
// ============================================
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.userId },
      include: {
        filial: {
          select: {
            id: true,
            nombre: true,
            nombreLocalidad: true,
            esActiva: true
          }
        },
        coordinador: {
          select: {
            id: true,
            nombre: true,
            zona: true
          }
        }
      }
    });

    if (!usuario) {
      throw errors.notFound('Usuario');
    }

    // Respuesta sin password
    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      data: usuarioSinPassword
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/auth/refresh
// ============================================
router.post('/refresh', authenticateToken, async (req, res, next) => {
  try {
    // Generar nuevo token
    const newToken = jwt.sign(
      {
        userId: req.user.userId,
        correo: req.user.correo,
        rol: req.user.rol,
        filialId: req.user.filialId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      data: { token: newToken },
      message: 'Token renovado'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/auth/change-password
// ============================================
router.put('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1, 'Password actual requerido'),
      newPassword: z.string().min(6, 'Nuevo password debe tener al menos 6 caracteres')
    });

    const { currentPassword, newPassword } = schema.parse(req.body);

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.userId }
    });

    // Verificar password actual
    const isValid = await bcrypt.compare(currentPassword, usuario.password);
    if (!isValid) {
      throw errors.unauthorized('Password actual incorrecto');
    }

    // Hashear nuevo password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar
    await prisma.usuario.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;