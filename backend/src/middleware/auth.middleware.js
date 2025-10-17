// backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { errors } from './errorHandler.js';

const normalizeUserPayload = (payload) => {
  if (!payload) {
    return null;
  }

  const userId = payload.user_id ?? payload.userId ?? payload.id ?? payload.sub ?? null;
  const filialId = payload.filial_id ?? payload.filialId ?? null;

  return {
    ...payload,
    user_id: userId,
    userId,
    id: userId,
    filial_id: filialId,
    filialId,
  };
};

// Verificar token JWT
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw errors.unauthorized('Token no proporcionado');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw errors.unauthorized('Token expirado');
        }
        throw errors.unauthorized('Token inválido');
      }

      req.user = normalizeUserPayload(user);
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Verificar roles específicos
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(errors.unauthorized('No autenticado'));
    }

    if (!roles.includes(req.user.rol)) {
      return next(errors.forbidden('No tienes permisos para esta acción'));
    }

    next();
  };
};

// Verificar que el usuario pertenece a la filial
export const requireOwnFilial = (req, res, next) => {
  const filialId = parseInt(req.params.filialId || req.body.filialId || req.query.filialId);

  if (!filialId) {
    return next(errors.badRequest('ID de filial requerido'));
  }

  // Admin y Coordinador pueden acceder a cualquier filial
  if (req.user.rol === 'ADMIN' || req.user.rol === 'COORDINADOR') {
    return next();
  }

  // Usuario de filial solo puede acceder a su propia filial
  if (req.user.filialId !== filialId) {
    return next(errors.forbidden('No tienes acceso a esta filial'));
  }

  next();
};

// Middleware combinado: autenticación + rol
export const authenticateAndRequireRole = (...roles) => {
  return [authenticateToken, requireRole(...roles)];
};