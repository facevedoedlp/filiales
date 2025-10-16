import prisma from '../config/database.js';
import { verifyToken } from '../utils/jwt.utils.js';
import { errorResponse } from '../utils/response.utils.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse(res, 'Token no provisto', 401);
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await prisma.usuario.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        esActivo: true,
        filialId: true,
      },
    });

    if (!user || !user.esActivo) {
      return errorResponse(res, 'Usuario no autorizado', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Token inválido', 401);
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return errorResponse(res, 'No tienes permisos suficientes', 403);
  }

  next();
};
