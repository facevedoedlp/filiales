// backend/src/config/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Manejar señales de terminación
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;