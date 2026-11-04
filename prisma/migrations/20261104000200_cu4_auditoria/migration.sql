-- Se conservan las filas, el identificador anterior y la fecha original.
ALTER TABLE "LogAuditoria" DROP CONSTRAINT "LogAuditoria_usuarioId_fkey";
ALTER TABLE "LogAuditoria" DROP CONSTRAINT "LogAuditoria_pacienteId_fkey";
ALTER TABLE "LogAuditoria" RENAME COLUMN "usuarioId" TO "usuarioIdLegado";
ALTER TABLE "LogAuditoria" ALTER COLUMN "usuarioIdLegado" DROP NOT NULL;
ALTER TABLE "LogAuditoria" RENAME COLUMN "creadoEn" TO "fecha";
ALTER TABLE "LogAuditoria" ADD COLUMN "usuarioEmail" TEXT,
    ADD COLUMN "entidad" TEXT,
    ADD COLUMN "entidadId" TEXT;
UPDATE "LogAuditoria" AS l SET
    "usuarioEmail" = COALESCE((SELECT u."email" FROM "Usuario" u WHERE u."id" = l."usuarioIdLegado"), 'usuario-legado-sin-email'),
    "entidad" = 'LEGADO', "entidadId" = l."id";
ALTER TABLE "LogAuditoria" ALTER COLUMN "usuarioEmail" SET NOT NULL,
    ALTER COLUMN "entidad" SET NOT NULL,
    ALTER COLUMN "entidadId" SET NOT NULL;
CREATE INDEX "LogAuditoria_fecha_id_idx" ON "LogAuditoria"("fecha", "id");
CREATE INDEX "LogAuditoria_pacienteId_fecha_idx" ON "LogAuditoria"("pacienteId", "fecha");
ALTER TABLE "LogAuditoria" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "LogAuditoria" FROM anon, authenticated;
