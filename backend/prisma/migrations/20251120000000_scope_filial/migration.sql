-- AlterEnum
ALTER TYPE "Rol" ADD VALUE IF NOT EXISTS 'ADMIN_GLOBAL';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "integrantes_filialId_idx" ON "integrantes"("filialId");
CREATE INDEX IF NOT EXISTS "integrantes_filialId_esActivo_idx" ON "integrantes"("filialId", "esActivo");

-- CreateTable
CREATE TABLE IF NOT EXISTS "auditoria_registros" (
    "id" SERIAL PRIMARY KEY,
    "usuarioId" INTEGER,
    "rol" "Rol",
    "operacion" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "registroId" INTEGER,
    "filialId" INTEGER,
    "datos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auditoria_registros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex for auditoria_registros
CREATE INDEX IF NOT EXISTS "auditoria_registros_tabla_registroId_idx" ON "auditoria_registros"("tabla", "registroId");
CREATE INDEX IF NOT EXISTS "auditoria_registros_filialId_idx" ON "auditoria_registros"("filialId");
