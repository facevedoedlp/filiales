import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@filiales.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      correo: 'admin@filiales.com',
      password: hashedPassword,
      rol: 'ADMIN',
    },
  });

  console.log('Usuario admin creado:', admin.correo);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
