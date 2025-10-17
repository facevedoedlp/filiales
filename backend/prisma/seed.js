import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes (opcional)
  console.log('🧹 Limpiando usuarios existentes...');
  await prisma.usuario.deleteMany({});
  
  // Crear países, provincias y localidades básicos
  console.log('📍 Creando datos geográficos...');
  
  await prisma.pais.upsert({
    where: { id: 12 },
    update: {},
    create: { id: 12, nombre: 'Argentina' }
  });

  await prisma.provincia.upsert({
    where: { id: 6 },
    update: {},
    create: { id: 6, paisId: 12, nombre: 'Buenos Aires' }
  });

  await prisma.localidad.upsert({
    where: { id: 6000001 },
    update: {},
    create: { 
      id: 6000001, 
      provinciaId: 6, 
      nombre: 'La Plata' 
    }
  });

  // Crear grupo
  console.log('👥 Creando grupo...');
  await prisma.grupo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Grupo 1',
      descripcion: 'Primer grupo de filiales'
    }
  });

  // Crear cargos
  console.log('🎖️ Creando cargos...');
  await prisma.cargo.upsert({
    where: { nombre: 'Presidente' },
    update: {},
    create: { nombre: 'Presidente', descripcion: 'Presidente de la filial' }
  });

  await prisma.cargo.upsert({
    where: { nombre: 'Secretario' },
    update: {},
    create: { nombre: 'Secretario', descripcion: 'Secretario de la filial' }
  });

  // Crear filial de ejemplo
  console.log('🏘️ Creando filial...');
  await prisma.filial.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Filial La Plata',
      paisId: 12,
      provinciaId: 6,
      localidadId: 6000001,
      nombreLocalidad: 'La Plata',
      esActiva: true,
      esHabilitada: true,
      situacion: 'Constituida',
      grupoId: 1,
      mailInstitucional: 'laplata@filiales.estudiantesdelaplata.com',
      telefono: '221-4567890'
    }
  });

  // Crear usuarios de prueba
  console.log('👤 Creando usuarios...');
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  const filialPassword = await bcrypt.hash('filial123', 10);

  console.log('🔐 Hash de admin123:', adminPassword);
  console.log('🔐 Hash de filial123:', filialPassword);

  await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      correo: 'admin@edlp.com',
      password: adminPassword,
      rol: 'ADMIN',
      esActivo: true
    }
  });

  await prisma.usuario.create({
    data: {
      nombre: 'Usuario Filial La Plata',
      correo: 'laplata@edlp.com',
      password: filialPassword,
      rol: 'FILIAL',
      esActivo: true,
      filialId: 1
    }
  });

  console.log('\n✅ Seed completado exitosamente!');
  console.log('\n📝 Usuarios creados:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 ADMIN:');
  console.log('   Email:    admin@edlp.com');
  console.log('   Password: admin123');
  console.log('\n👤 FILIAL:');
  console.log('   Email:    laplata@edlp.com');
  console.log('   Password: filial123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
