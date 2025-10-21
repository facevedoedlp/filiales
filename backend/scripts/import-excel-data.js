// backend/scripts/import-excel-data.js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Ruta a la carpeta con los Excel
const EXCEL_DIR = path.join(__dirname, '../data/excel');

// Modo debug - cambiar a true para ver las columnas
const DEBUG = process.env.DEBUG === 'true';

// Función para convertir fechas de Excel a JavaScript
function excelDateToJSDate(excelDate) {
  if (!excelDate || excelDate === '') return null;
  if (typeof excelDate === 'string') {
    const parsed = new Date(excelDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // Las fechas de Excel son días desde 1900-01-01
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return isNaN(date.getTime()) ? null : date;
}

// Función para normalizar booleanos
function normalizeBoolean(value) {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toUpperCase() === 'SI' || value.toUpperCase() === 'TRUE';
  }
  return Boolean(value);
}

// ============================================
// 1. IMPORTAR DATOS GEOGRÁFICOS
// ============================================

async function importGeografia() {
  console.log('\n📍 Importando datos geográficos...');
  
  const filePath = path.join(EXCEL_DIR, 'FilialesEDLP.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  
  // Importar países
  console.log('  🌍 Países...');
  const paisesSheet = workbook.Sheets['paises'];
  const paises = XLSX.utils.sheet_to_json(paisesSheet);
  
  if (DEBUG && paises.length > 0) {
    console.log('    🔍 Columnas disponibles:', Object.keys(paises[0]));
    console.log('    🔍 Primera fila:', paises[0]);
  }
  
  for (const pais of paises) {
    const paisId = parseInt(pais.pais_id);
    const paisNombre = pais.nombre;
    
    if (!paisNombre || !paisId) {
      console.log('    ⚠️ País inválido:', pais);
      continue;
    }
    
    await prisma.pais.upsert({
      where: { id: paisId },
      update: { nombre: paisNombre },
      create: { 
        id: paisId, 
        nombre: paisNombre 
      }
    });
  }
  console.log(`    ✅ ${paises.length} países`);
  
  // Importar provincias
  console.log('  🗺️ Provincias...');
  const provinciasSheet = workbook.Sheets['estados_provincias_all'];
  const provincias = XLSX.utils.sheet_to_json(provinciasSheet);
  
  for (const prov of provincias) {
    const provId = parseInt(prov.provincia_id);
    const provNombre = prov.departamento_zona; // ← Esta es la columna correcta
    const provPaisId = parseInt(prov.pais_id);
    
    if (!provNombre || !provId || !provPaisId) {
      console.log('    ⚠️ Provincia inválida:', prov);
      continue;
    }
    
    await prisma.provincia.upsert({
      where: { id: provId },
      update: { 
        nombre: provNombre,
        paisId: provPaisId
      },
      create: { 
        id: provId,
        paisId: provPaisId,
        nombre: provNombre
      }
    });
  }
  console.log(`    ✅ ${provincias.length} provincias`);
  
  // Importar localidades
  console.log('  🏘️ Localidades...');
  const localidadesSheet = workbook.Sheets['localidades_all'];
  const localidades = XLSX.utils.sheet_to_json(localidadesSheet);
  
  let importedLoc = 0;
  for (const loc of localidades) {
    try {
      const locId = parseInt(loc.localidad_id);
      const locNombre = loc.nombre_localidad;
      const locProvId = parseInt(loc.provincia_id);
      const locDeptId = loc.departamento_id ? parseInt(loc.departamento_id) : null;
      
      if (!locNombre || !locProvId || !locId) {
        continue;
      }
      
      await prisma.localidad.upsert({
        where: { id: locId },
        update: {
          nombre: locNombre,
          provinciaId: locProvId,
          departamentoId: locDeptId
        },
        create: {
          id: locId,
          provinciaId: locProvId,
          nombre: locNombre,
          departamentoId: locDeptId
        }
      });
      importedLoc++;
    } catch (error) {
      // Ignorar duplicados o errores de constraint
      if (!error.code?.includes('P2002')) {
        console.error(`    ⚠️ Error en localidad ${loc.nombre_localidad}:`, error.message);
      }
    }
  }
  console.log(`    ✅ ${importedLoc} localidades`);
}

// ============================================
// 2. IMPORTAR GRUPOS Y CARGOS
// ============================================

async function importGruposYCargos() {
  console.log('\n👥 Importando grupos y cargos...');
  
  const filePath = path.join(EXCEL_DIR, 'FilialesEDLP.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  
  // Grupos
  const gruposSheet = workbook.Sheets['grupos'];
  const grupos = XLSX.utils.sheet_to_json(gruposSheet);
  
  for (const grupo of grupos) {
    await prisma.grupo.upsert({
      where: { id: parseInt(grupo.id) },
      update: { 
        nombre: grupo.grupo,
        descripcion: grupo.codigo || null
      },
      create: {
        id: parseInt(grupo.id),
        nombre: grupo.grupo,
        descripcion: grupo.codigo || null
      }
    });
  }
  console.log(`  ✅ ${grupos.length} grupos`);
  
  // Cargos
  const cargosSheet = workbook.Sheets['cargos'];
  const cargos = XLSX.utils.sheet_to_json(cargosSheet);
  
  for (const cargo of cargos) {
    await prisma.cargo.upsert({
      where: { nombre: cargo.cargo },
      update: { descripcion: cargo.orden ? `Orden: ${cargo.orden}` : null },
      create: {
        nombre: cargo.cargo,
        descripcion: cargo.orden ? `Orden: ${cargo.orden}` : null
      }
    });
  }
  console.log(`  ✅ ${cargos.length} cargos`);
}

// ============================================
// 3. IMPORTAR FILIALES
// ============================================

async function importFiliales() {
  console.log('\n🏛️ Importando filiales...');
  
  const filePath = path.join(EXCEL_DIR, 'FilialesEDLP.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['Filiales'];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let errors = 0;
  const filialesFallidas = [];
  
  for (const row of data) {
    try {
      // Validar provincia y localidad - si no son válidas, usar valores por defecto de Argentina
      const provinciaId = parseInt(row.provincia_id) || 6; // Buenos Aires por defecto
      const localidadId = parseInt(row.localidad_id) || 6000001; // La Plata por defecto
      const paisId = parseInt(row.pais_id) || 12; // Argentina por defecto
      
      // Convertir direccionSede a string si es número
      const direccionSede = row.sede ? String(row.sede) : null;
      
      await prisma.filial.upsert({
        where: { id: parseInt(row.id) },
        update: {
          nombre: row.nombre_filial,
          paisId: paisId,
          provinciaId: provinciaId,
          departamentoId: row.departamento_id ? parseInt(row.departamento_id) : null,
          localidadId: localidadId,
          nombreLocalidad: row.nombre_localidad || 'Sin especificar',
          direccionSede: direccionSede,
          coordenadas: row.coordenadas_filial,
          kmDesdeEstadio: row.km ? parseInt(row.km) : null,
          esActiva: normalizeBoolean(row.es_activa),
          esHabilitada: normalizeBoolean(row.es_habilitada),
          situacion: row.situacion,
          grupoId: row.grupo_id ? parseInt(row.grupo_id) : null,
          fechaFundacion: excelDateToJSDate(row.fundacion),
          renovacionAutoridades: excelDateToJSDate(row.renovacion_autoridades),
          esRenovada: normalizeBoolean(row.es_renovada),
          periodoRenovacion: normalizeBoolean(row.periodo_renovacion),
          telefono: row.tel ? String(row.tel) : null,
          mailInstitucional: row.mail_inst || null,
          mailAlternativo: row.mail_alt || null,
          actaConstitutiva: row.acta_constitutiva || null,
          escudo: row.escudo || null,
          planillaIntegrantes: row['planilla_integrantes        '] || null
        },
        create: {
          id: parseInt(row.id),
          nombre: row.nombre_filial,
          paisId: paisId,
          provinciaId: provinciaId,
          departamentoId: row.departamento_id ? parseInt(row.departamento_id) : null,
          localidadId: localidadId,
          nombreLocalidad: row.nombre_localidad || 'Sin especificar',
          direccionSede: direccionSede,
          coordenadas: row.coordenadas_filial,
          kmDesdeEstadio: row.km ? parseInt(row.km) : null,
          esActiva: normalizeBoolean(row.es_activa),
          esHabilitada: normalizeBoolean(row.es_habilitada),
          situacion: row.situacion,
          grupoId: row.grupo_id ? parseInt(row.grupo_id) : null,
          fechaFundacion: excelDateToJSDate(row.fundacion),
          renovacionAutoridades: excelDateToJSDate(row.renovacion_autoridades),
          esRenovada: normalizeBoolean(row.es_renovada),
          periodoRenovacion: normalizeBoolean(row.periodo_renovacion),
          telefono: row.tel ? String(row.tel) : null,
          mailInstitucional: row.mail_inst || null,
          mailAlternativo: row.mail_alt || null,
          actaConstitutiva: row.acta_constitutiva || null,
          escudo: row.escudo || null,
          planillaIntegrantes: row['planilla_integrantes        '] || null
        }
      });
      imported++;
    } catch (error) {
      filialesFallidas.push({ id: row.id, nombre: row.nombre_filial });
      errors++;
    }
  }
  
  console.log(`  ✅ Importadas: ${imported} filiales`);
  if (errors > 0) {
    console.log(`  ⚠️ Errores: ${errors} filiales no importadas`);
    console.log(`  📋 IDs fallidos: ${filialesFallidas.map(f => `${f.id} (${f.nombre})`).join(', ')}`);
  }
}

// ============================================
// 4. IMPORTAR INTEGRANTES
// ============================================

async function importIntegrantes() {
  console.log('\n👤 Importando integrantes...');
  
  const filePath = path.join(EXCEL_DIR, 'FilialesEDLP.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['integrantes'];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let errors = 0;
  let skipped = 0;
  
  for (const row of data) {
    try {
      const filialId = parseInt(row.filial_id);
      
      // Saltar si no tiene nombre (obligatorio)
      if (!row.nombre || row.nombre.trim() === '') {
        skipped++;
        continue;
      }
      
      // Verificar que la filial existe antes de crear el integrante
      const filialExists = await prisma.filial.findUnique({
        where: { id: filialId }
      });
      
      if (!filialExists) {
        skipped++;
        continue;
      }
      
      // Buscar cargo por nombre si existe
      let cargoId = null;
      if (row.nombre_cargo) {
        const cargo = await prisma.cargo.findFirst({
          where: { nombre: { contains: row.nombre_cargo } }
        });
        cargoId = cargo?.id;
      }
      
      await prisma.integrante.create({
        data: {
          filialId: filialId,
          nombre: row.nombre,
          dni: row.dni ? String(row.dni) : null,
          fechaNacimiento: excelDateToJSDate(row.fecha_nacimiento),
          ocupacion: row.ocupacion || null,
          telefono: row.telefono ? String(row.telefono) : null,
          email: row.email || null,
          esActivo: normalizeBoolean(row.activo),
          esReferente: normalizeBoolean(row.referente),
          cargoId: cargoId,
          numeroSocio: row.numero_socio ? String(row.numero_socio) : null,
          esParticipativo: normalizeBoolean(row.es_participativo),
          asistenteActa: normalizeBoolean(row.asistente_acta),
          usuarioIngreso: row.usuario_ingreso || null,
          fechaIngreso: excelDateToJSDate(row.fecha_ingreso)
        }
      });
      imported++;
    } catch (error) {
      console.error(`  ❌ Error en integrante ${row.nombre}:`, error.message);
      errors++;
    }
  }
  
  console.log(`  ✅ Importados: ${imported} integrantes`);
  if (skipped > 0) console.log(`  ⚠️ Saltados (filial no existe): ${skipped}`);
  if (errors > 0) console.log(`  ⚠️ Errores: ${errors}`);
}

// ============================================
// 5. IMPORTAR USUARIOS
// ============================================

async function importUsuarios() {
  console.log('\n👥 Importando usuarios...');
  
  const filePath = path.join(EXCEL_DIR, 'usuariosFiliales.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['usuarios'];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  // Mapeo de roles (ajustar según tu sistema)
  const rolesMap = {
    1: 'ADMIN',
    2: 'COORDINADOR',
    3: 'FILIAL'
  };
  
  for (const row of data) {
    try {
      // Saltar si no tiene correo
      if (!row.correo || row.correo.trim() === '') {
        skipped++;
        continue;
      }
      
      const hashedPassword = await bcrypt.hash('password123', 10); // Password temporal
      
      // Ignorar coordinadorId por ahora (no existe la tabla Coordinador con datos)
      await prisma.usuario.create({
        data: {
          nombre: row.nombre,
          correo: row.correo.trim(),
          password: hashedPassword,
          rol: rolesMap[parseInt(row.Rol)] || 'FILIAL',
          esActivo: normalizeBoolean(row.es_activo),
          filialId: row.filial_id ? parseInt(row.filial_id) : null,
          coordinadorId: null // Ignorar por ahora
        }
      });
      imported++;
    } catch (error) {
      // Ignorar duplicados
      if (error.code !== 'P2002') {
        console.error(`  ❌ Error en usuario ${row.correo || 'sin correo'}:`, error.message);
        errors++;
      }
    }
  }
  
  console.log(`  ✅ Importados: ${imported} usuarios`);
  if (skipped > 0) console.log(`  ⚠️ Saltados (sin correo): ${skipped}`);
  console.log(`  ⚠️ Todos los usuarios tienen password temporal: password123`);
  if (errors > 0) console.log(`  ⚠️ Errores: ${errors}`);
}

// ============================================
// 6. IMPORTAR CALENDARIO (FIXTURES)
// ============================================

async function importCalendario() {
  console.log('\n📅 Importando calendario/fixtures...');
  
  const filePath = path.join(EXCEL_DIR, 'FixturesVozDelEstadio.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['fixtures'];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let errors = 0;
  
  // Obtener equipos y competiciones para mapear
  const equiposSheet = workbook.Sheets['equipos'];
  const equipos = XLSX.utils.sheet_to_json(equiposSheet);
  const equiposMap = {};
  equipos.forEach(e => { equiposMap[e.id] = e.nombre; });
  
  const competicionesSheet = workbook.Sheets['competiciones'];
  const competiciones = XLSX.utils.sheet_to_json(competicionesSheet);
  const competicionesMap = {};
  competiciones.forEach(c => { competicionesMap[c.id] = c.nombre; });
  
  for (const row of data) {
    try {
      await prisma.calendario.upsert({
        where: { id: parseInt(row.id) },
        update: {
          fecha: excelDateToJSDate(row.fecha),
          rival: equiposMap[parseInt(row.equipo_id)],
          competicion: competicionesMap[parseInt(row.competicion_id)],
          esLocal: row.condicion === 'local'
        },
        create: {
          id: parseInt(row.id),
          fecha: excelDateToJSDate(row.fecha),
          rival: equiposMap[parseInt(row.equipo_id)],
          competicion: competicionesMap[parseInt(row.competicion_id)],
          esLocal: row.condicion === 'local'
        }
      });
      imported++;
    } catch (error) {
      console.error(`  ❌ Error en fixture ${row.id}:`, error.message);
      errors++;
    }
  }
  
  console.log(`  ✅ Importados: ${imported} partidos`);
  if (errors > 0) console.log(`  ⚠️ Errores: ${errors}`);
}

// ============================================
// 7. IMPORTAR ACCIONES
// ============================================

async function importAcciones() {
  console.log('\n🎯 Importando acciones...');
  
  const filePath = path.join(EXCEL_DIR, 'acciones_pinchas.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['acciones_pinchas'];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let errors = 0;
  
  for (const row of data) {
    try {
      await prisma.accion.create({
        data: {
          tipo: row.tipo || 'Filial',
          filialId: row.filial_id ? parseInt(row.filial_id) : null,
          fechaRealizacion: excelDateToJSDate(row.fecha_realizacion),
          calendarioId: row.calendario_id ? parseInt(row.calendario_id) : null,
          descripcion: row.descripcion_accion || '',
          ubicacion: row.ubicacion_accion,
          otrosColaboradores: row.otros_colaboradores,
          encargadoId: row.encargado ? parseInt(row.encargado) : null,
          imagenPromocion: row.imagen_promocion,
          imagen1: row.imagen_1,
          imagen2: row.imagen_2,
          observaciones: row.observaciones,
          enviarCorreo: normalizeBoolean(row.enviar_correo),
          usuarioCorreo: row.usuario_correo,
          fechaCarga: excelDateToJSDate(row.fecha_carga_accion)
        }
      });
      imported++;
    } catch (error) {
      console.error(`  ❌ Error en acción ${row.ID}:`, error.message);
      errors++;
    }
  }
  
  console.log(`  ✅ Importadas: ${imported} acciones`);
  if (errors > 0) console.log(`  ⚠️ Errores: ${errors}`);
}

// ============================================
// 8. IMPORTAR ENTRADAS
// ============================================

async function importEntradas() {
  console.log('\n🎫 Importando pedidos de entradas...');
  
  const filePath = path.join(EXCEL_DIR, 'entradas_pedidos.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['entradas_pedidos'];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let errors = 0;
  
  for (const row of data) {
    try {
      await prisma.entradaPedido.create({
        data: {
          tipo: row.tipo || 'Filial',
          filialId: row.filial_id ? parseInt(row.filial_id) : null,
          nombre: row.nombre,
          localidadId: row.localidad_id ? parseInt(row.localidad_id) : null,
          procedencia: row.procedencia,
          dni: row.dni_numero ? String(row.dni_numero) : null,
          fixtureId: parseInt(row.fixture_id),
          estadoCarga: normalizeBoolean(row.estado_carga),
          entradaAsignada: normalizeBoolean(row.entrada_asignada),
          aprobacionSocios: row.aprovacion_socios || 'SIN REVISAR',
          enviarTelegram: normalizeBoolean(row.eviar_telegram),
          observaciones: row.observaciones,
          listadoExcel: normalizeBoolean(row.listado_excel)
        }
      });
      imported++;
    } catch (error) {
      console.error(`  ❌ Error en entrada ${row.id}:`, error.message);
      errors++;
    }
  }
  
  console.log(`  ✅ Importadas: ${imported} solicitudes de entradas`);
  if (errors > 0) console.log(`  ⚠️ Errores: ${errors}`);
}

// ============================================
// 9. IMPORTAR CAPTACIÓN
// ============================================

async function importCaptacion() {
  console.log('\n🎯 Importando eventos de captación...');
  
  const filePath = path.join(EXCEL_DIR, 'captacion.v2.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['captacion'];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let imported = 0;
  let errors = 0;
  
  for (const row of data) {
    try {
      await prisma.captacion.create({
        data: {
          fechaInicio: excelDateToJSDate(row['FECHA INICIO']),
          fechaFin: excelDateToJSDate(row['FECHA FIN']),
          tipoEvento: row['TIPO EVENTO'],
          nombre: row['NOMBRE'],
          provinciaId: null, // Necesitaría mapeo de nombres a IDs
          localidad: row['LOCALIDAD'],
          direccionCompleta: row['DIRECCION COMPLETA'],
          latitud: row['LATITUD'] ? parseFloat(row['LATITUD']) : null,
          longitud: row['LONGITUD'] ? parseFloat(row['LONGITUD']) : null,
          equipoCaptacionId: row.equipo_captacion_id ? parseInt(row.equipo_captacion_id) : null,
          aCargo: row['A CARGO'],
          esSatelite: normalizeBoolean(row['SATÉLITE'] === 'SI' || row['SATÉLITE'] === 'Sí'),
          categorias: row['CATEGORÍAS'],
          comentario: row['COMENTARIO'],
          estadoPrueba: row['ESTADO DE PRUEBA']
        }
      });
      imported++;
    } catch (error) {
      console.error(`  ❌ Error en captación ${row.NOMBRE}:`, error.message);
      errors++;
    }
  }
  
  console.log(`  ✅ Importados: ${imported} eventos de captación`);
  if (errors > 0) console.log(`  ⚠️ Errores: ${errors}`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🚀 ========================================');
  console.log('   IMPORTACIÓN DE DATOS DESDE EXCEL');
  console.log('========================================== 🚀\n');
  
  try {
    await importGeografia();
    await importGruposYCargos();
    await importFiliales();
    await importIntegrantes();
    await importUsuarios();
    await importCalendario();
    await importAcciones();
    await importEntradas();
    await importCaptacion();
    
    console.log('\n✅ ========================================');
    console.log('   IMPORTACIÓN COMPLETADA EXITOSAMENTE');
    console.log('========================================== ✅\n');
    
  } catch (error) {
    console.error('\n❌ Error fatal en la importación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();