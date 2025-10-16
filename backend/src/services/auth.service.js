import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { signToken, verifyToken } from '../utils/jwt.utils.js';

export const login = async ({ correo, password }) => {
  const user = await prisma.usuario.findUnique({
    where: { correo },
    include: { filial: { select: { id: true, nombre: true } } },
  });

  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const token = signToken({ userId: user.id, rol: user.rol, filialId: user.filialId });

  return {
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      filialId: user.filialId,
      filial: user.filial,
    },
  };
};

export const refresh = async ({ token }) => {
  try {
    const decoded = verifyToken(token);
    const newToken = signToken({
      userId: decoded.userId,
      rol: decoded.rol,
      filialId: decoded.filialId,
    });

    return { token: newToken };
  } catch (error) {
    const err = new Error('Token inválido');
    err.status = 401;
    throw err;
  }
};

export const me = async (userId) => {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nombre: true,
      correo: true,
      rol: true,
      filialId: true,
      filial: {
        select: { id: true, nombre: true },
      },
    },
  });

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  return user;
};
