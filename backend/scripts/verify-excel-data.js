// backend/scripts/verify-excel-data.js
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_DIR = path.join(__dirname, '../data/excel');

const archivos = [
  { nombre: 'FilialesEDLP.v2.xlsx', hojas: ['Filiales', 'integrantes', 'paises', 'estados_provincias_all', 'localidades_all', 'grupos', 'cargos'] },
  { nombre: 'usuariosFiliales.v2.xlsx', hojas: ['usuarios'] },
  { nombre: 'acciones_pinchas.v2.xlsx', hojas: ['acciones_pinchas'] },
  { nombre: 'captacion.v2.xlsx', hojas: ['captacion'] },
  { nombre: 'entradas_pedidos.v2.xlsx', hojas: ['entradas_pedidos'] },
  { nombre: 'FixturesVozDelEstadio.v2.xlsx', hojas: ['fixtures', 'equipos', 'competiciones'] }
];

function verificarArchivo(nombreArchivo) {
  const filePath = path.join(EXCEL_DIR, nombreArchivo);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ Archivo no encontrado: ${nombreArchivo}`);
    return false;
  }
  
  console.log(`  ✅ Archivo existe: ${nombreArchivo}`);
  return true;
}

function verificarHojas(nombreArchivo, hojasRequeridas) {
  const filePath = path.join(EXCEL_DIR, nombreArchivo);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const hojasDisponibles = workbook.SheetNames;
    
    console.log(`\n  📋 Hojas en ${nombreArchivo}:`);
    
    for (const hojaRequerida of hojasRequeridas) {
      if (hojasDisponibles.includes(hojaRequerida)) {
        const sheet = workbook.Sheets[hojaRequerida];
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log(`     ✅ ${hojaRequerida} - ${data.length} registros`);
      } else {
        console.log(`     ❌ ${hojaRequerida} - NO ENCONTRADA`);
      }
    }
    
    return true;
  } catch (error) {
    console.log(`  ❌ Error leyendo archivo: ${error.message}`);
    return false;
  }
}

function analizarCalidadDatos(nombreArchivo, hoja) {
  const filePath = path.join(EXCEL_DIR, nombreArchivo);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[hoja];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    if (data.length === 0) {
      console.log(`     ⚠️ Sin datos en ${hoja}`);
      return;
    }
    
    // Analizar columnas vacías
    const columnas = Object.keys(data[0]);
    const columnasVacias = [];
    
    for (const col of columnas) {
      const valoresVacios = data.filter(row => 
        row[col] === null || 
        row[col] === undefined || 
        row[col] === ''
      ).length;
      
      const porcentajeVacio = (valoresVacios / data.length) * 100;
      
      if (porcentajeVacio > 50) {
        columnasVacias.push({ columna: col, porcentaje: porcentajeVacio.toFixed(1) });
      }
    }
    
    if (columnasVacias.length > 0) {
      console.log(`\n     ⚠️ Columnas con muchos valores vacíos en ${hoja}:`);
      columnasVacias.forEach(({ columna, porcentaje }) => {
        console.log(`        - ${columna}: ${porcentaje}% vacío`);
      });
    }
    
  } catch (error) {
    console.log(`     ❌ Error analizando calidad: ${error.message}`);
  }
}

async function main() {
  console.log('🔍 ========================================');
  console.log('   VERIFICACIÓN DE ARCHIVOS EXCEL');
  console.log('========================================== 🔍\n');
  
  // Verificar que la carpeta existe
  if (!fs.existsSync(EXCEL_DIR)) {
    console.log(`❌ La carpeta ${EXCEL_DIR} no existe.`);
    console.log(`\nCrea la carpeta y coloca los archivos Excel ahí:\n`);
    console.log(`  mkdir -p ${EXCEL_DIR}`);
    console.log(`\nLuego copia los archivos Excel a esa carpeta.`);
    process.exit(1);
  }
  
  console.log(`✅ Carpeta de datos existe: ${EXCEL_DIR}\n`);
  
  let todosOk = true;
  
  for (const { nombre, hojas } of archivos) {
    console.log(`📄 Verificando: ${nombre}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const archivoExiste = verificarArchivo(nombre);
    
    if (archivoExiste) {
      const hojasOk = verificarHojas(nombre, hojas);
      if (!hojasOk) todosOk = false;
      
      // Analizar calidad de datos en la primera hoja
      console.log(`\n  🔍 Análisis de calidad de datos:`);
      analizarCalidadDatos(nombre, hojas[0]);
    } else {
      todosOk = false;
    }
    
    console.log('\n');
  }
  
  console.log('========================================== 🔍\n');
  
  if (todosOk) {
    console.log('✅ TODOS LOS ARCHIVOS ESTÁN LISTOS PARA IMPORTAR\n');
    console.log('Ejecuta la importación con:');
    console.log('  npm run import:excel\n');
  } else {
    console.log('❌ FALTAN ARCHIVOS O HAY PROBLEMAS\n');
    console.log('Revisa los errores arriba y corrige antes de importar.\n');
    process.exit(1);
  }
}

main().catch(console.error);