import prisma from '../config/database.js';

export const listForUser = async (userId) => {
  return prisma.notificacion.findMany({
    where: { usuarioId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};
