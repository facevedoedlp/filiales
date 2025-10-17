-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'COORDINADOR', 'FILIAL');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'FILIAL',
    "esActivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filialId" INTEGER,
    "coordinadorId" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordinadores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "zona" TEXT,

    CONSTRAINT "coordinadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filiales" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "paisId" INTEGER NOT NULL,
    "provinciaId" INTEGER NOT NULL,
    "departamentoId" INTEGER,
    "localidadId" INTEGER NOT NULL,
    "nombreLocalidad" TEXT NOT NULL,
    "direccionSede" TEXT,
    "coordenadas" TEXT,
    "kmDesdeEstadio" INTEGER,
    "esActiva" BOOLEAN NOT NULL DEFAULT true,
    "esHabilitada" BOOLEAN NOT NULL DEFAULT false,
    "situacion" TEXT,
    "grupoId" INTEGER,
    "fechaFundacion" TIMESTAMP(3),
    "renovacionAutoridades" TIMESTAMP(3),
    "esRenovada" BOOLEAN NOT NULL DEFAULT false,
    "periodoRenovacion" BOOLEAN NOT NULL DEFAULT false,
    "telefono" TEXT,
    "mailInstitucional" TEXT,
    "mailAlternativo" TEXT,
    "actaConstitutiva" TEXT,
    "escudo" TEXT,
    "planillaIntegrantes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrantes" (
    "id" SERIAL NOT NULL,
    "filialId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "ocupacion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "esActivo" BOOLEAN NOT NULL DEFAULT true,
    "esReferente" BOOLEAN NOT NULL DEFAULT false,
    "cargoId" INTEGER,
    "numeroSocio" TEXT,
    "esParticipativo" BOOLEAN NOT NULL DEFAULT false,
    "asistenteActa" BOOLEAN NOT NULL DEFAULT false,
    "usuarioIngreso" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_inactividad" (
    "id" SERIAL NOT NULL,
    "integranteId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "motivo" TEXT,

    CONSTRAINT "historial_inactividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paises" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "paises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provincias" (
    "id" INTEGER NOT NULL,
    "paisId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localidades" (
    "id" INTEGER NOT NULL,
    "provinciaId" INTEGER NOT NULL,
    "departamentoId" INTEGER,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "localidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acciones" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "filialId" INTEGER,
    "fechaRealizacion" TIMESTAMP(3) NOT NULL,
    "calendarioId" INTEGER,
    "descripcion" TEXT NOT NULL,
    "ubicacion" TEXT,
    "otrosColaboradores" TEXT,
    "encargadoId" INTEGER,
    "imagenPromocion" TEXT,
    "imagen1" TEXT,
    "imagen2" TEXT,
    "observaciones" TEXT,
    "enviarCorreo" BOOLEAN NOT NULL DEFAULT false,
    "usuarioCorreo" TEXT,
    "fechaCarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendario_oficial" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "rival" TEXT,
    "competicion" TEXT,
    "esLocal" BOOLEAN,

    CONSTRAINT "calendario_oficial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entradas_pedidos" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "filialId" INTEGER,
    "nombre" TEXT NOT NULL,
    "localidadId" INTEGER,
    "procedencia" TEXT,
    "dni" TEXT,
    "fixtureId" INTEGER NOT NULL,
    "estadoCarga" BOOLEAN NOT NULL DEFAULT false,
    "entradaAsignada" BOOLEAN NOT NULL DEFAULT false,
    "aprobacionSocios" TEXT NOT NULL DEFAULT 'SIN REVISAR',
    "enviarTelegram" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "listadoExcel" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entradas_pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captacion" (
    "id" SERIAL NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "tipoEvento" TEXT,
    "nombre" TEXT NOT NULL,
    "provinciaId" INTEGER,
    "localidad" TEXT,
    "direccionCompleta" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "equipoCaptacionId" INTEGER,
    "aCargo" TEXT,
    "esSatelite" BOOLEAN NOT NULL DEFAULT false,
    "categorias" TEXT,
    "comentario" TEXT,
    "estadoPrueba" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "captacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuentros" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "filialId" INTEGER,
    "desde" TEXT,
    "latitudOrigen" DOUBLE PRECISION,
    "longitudOrigen" DOUBLE PRECISION,
    "distanciaAutomatica" DOUBLE PRECISION,
    "distancia" DOUBLE PRECISION,
    "origenAuto" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "encuentros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foro_temas" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'GENERAL',
    "usuarioId" INTEGER NOT NULL,
    "esDestacado" BOOLEAN NOT NULL DEFAULT false,
    "esCerrado" BOOLEAN NOT NULL DEFAULT false,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foro_temas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foro_respuestas" (
    "id" SERIAL NOT NULL,
    "temaId" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "esDestacada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foro_respuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foro_etiquetas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "foro_etiquetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ForoEtiquetaToForoTema" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_nombre_key" ON "cargos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "foro_etiquetas_nombre_key" ON "foro_etiquetas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "_ForoEtiquetaToForoTema_AB_unique" ON "_ForoEtiquetaToForoTema"("A", "B");

-- CreateIndex
CREATE INDEX "_ForoEtiquetaToForoTema_B_index" ON "_ForoEtiquetaToForoTema"("B");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_coordinadorId_fkey" FOREIGN KEY ("coordinadorId") REFERENCES "coordinadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filiales" ADD CONSTRAINT "filiales_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "paises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filiales" ADD CONSTRAINT "filiales_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filiales" ADD CONSTRAINT "filiales_localidadId_fkey" FOREIGN KEY ("localidadId") REFERENCES "localidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filiales" ADD CONSTRAINT "filiales_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrantes" ADD CONSTRAINT "integrantes_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrantes" ADD CONSTRAINT "integrantes_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_inactividad" ADD CONSTRAINT "historial_inactividad_integranteId_fkey" FOREIGN KEY ("integranteId") REFERENCES "integrantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provincias" ADD CONSTRAINT "provincias_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "paises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "localidades" ADD CONSTRAINT "localidades_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acciones" ADD CONSTRAINT "acciones_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acciones" ADD CONSTRAINT "acciones_calendarioId_fkey" FOREIGN KEY ("calendarioId") REFERENCES "calendario_oficial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acciones" ADD CONSTRAINT "acciones_encargadoId_fkey" FOREIGN KEY ("encargadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_pedidos" ADD CONSTRAINT "entradas_pedidos_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_pedidos" ADD CONSTRAINT "entradas_pedidos_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "calendario_oficial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuentros" ADD CONSTRAINT "encuentros_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foro_temas" ADD CONSTRAINT "foro_temas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foro_respuestas" ADD CONSTRAINT "foro_respuestas_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "foro_temas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foro_respuestas" ADD CONSTRAINT "foro_respuestas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ForoEtiquetaToForoTema" ADD CONSTRAINT "_ForoEtiquetaToForoTema_A_fkey" FOREIGN KEY ("A") REFERENCES "foro_etiquetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ForoEtiquetaToForoTema" ADD CONSTRAINT "_ForoEtiquetaToForoTema_B_fkey" FOREIGN KEY ("B") REFERENCES "foro_temas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
