import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Ruta a la carpeta con los Excel
const EXCEL_DIR = path.join(__dirname, '../../data/excel');

async function importPaises() {
  console.log('📍 Importando Países...');
  // Lógica de importación
}

async function importProvincias() {
  console.log('🗺️ Importando Provincias...');
  // Lógica de importación
}

async function importLocalidades() {
  console.log('🏘️ Importando Localidades...');
  // Lógica de importación
}

async function importFiliales(excelPath) {
  console.log('🏛️ Importando Filiales...');
  
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let errors = 0;
  
  for (const row of data) {
    try {
      await prisma.filial.create({
        data: {
          nombre: row['Nombre'] || row['nombre'],
          paisId: parseInt(row['PaisId']) || 12, // Argentina por defecto
          provinciaId: parseInt(row['ProvinciaId']),
          localidadId: parseInt(row['LocalidadId']),
          nombreLocalidad: row['Localidad'] || row['localidad'],
          direccionSede: row['Direccion'] || row['direccion'],
          telefono: row['Telefono'] || row['telefono'],
          mailInstitucional: row['Email'] || row['email'],
          esActiva: row['Activa'] === 'SI' || row['activa'] === true,
          esHabilitada: row['Habilitada'] === 'SI' || row['habilitada'] === true,
          situacion: row['Situacion'] || row['situacion'],
          fechaFundacion: row['FechaFundacion'] ? new Date(row['FechaFundacion']) : null,
          // Agrega más campos según tu Excel
        }
      });
      imported++;
    } catch (error) {
      console.error(`Error en fila ${row['Nombre']}:`, error.message);
      errors++;
    }
  }
  
  console.log(`✅ Importadas: ${imported} filiales`);
  console.log(`❌ Errores: ${errors}`);
}

async function importIntegrantes(excelPath) {
  console.log('👥 Importando Integrantes...');
  
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let errors = 0;
  
  for (const row of data) {
    try {
      // Buscar la filial por nombre
      const filial = await prisma.filial.findFirst({
        where: { nombre: { contains: row['Filial'] || row['filial'] } }
      });
      
      if (!filial) {
        console.log(`⚠️ Filial no encontrada: ${row['Filial']}`);
        continue;
      }
      
      await prisma.integrante.create({
        data: {
          filialId: filial.id,
          nombre: row['Nombre'] || row['nombre'],
          dni: row['DNI']?.toString() || row['dni']?.toString(),
          fechaNacimiento: row['FechaNacimiento'] ? new Date(row['FechaNacimiento']) : null,
          telefono: row['Telefono']?.toString() || row['telefono']?.toString(),
          email: row['Email'] || row['email'],
          esActivo: row['Activo'] === 'SI' || row['activo'] === true,
          esReferente: row['Referente'] === 'SI' || row['referente'] === true,
          numeroSocio: row['NumeroSocio']?.toString() || row['numeroSocio']?.toString(),
        }
      });
      imported++;
    } catch (error) {
      console.error(`Error en fila ${row['Nombre']}:`, error.message);
      errors++;
    }
  }
  
  console.log(`✅ Importados: ${imported} integrantes`);
  console.log(`❌ Errores: ${errors}`);
}

async function main() {
  console.log('🚀 Iniciando importación de datos...\n');
  
  try {
    // Importar en orden
    await importPaises();
    await importProvincias();
    await importLocalidades();
    
    // Importar desde archivos Excel
    await importFiliales(path.join(EXCEL_DIR, 'filiales.xlsx'));
    await importIntegrantes(path.join(EXCEL_DIR, 'integrantes.xlsx'));
    
    console.log('\n✅ Importación completada!');
  } catch (error) {
    console.error('❌ Error en la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
