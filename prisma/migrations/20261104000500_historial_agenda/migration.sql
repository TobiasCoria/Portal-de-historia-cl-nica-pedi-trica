ALTER TABLE "Paciente" ADD COLUMN "esDemo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Consulta" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "autorEmail" TEXT;
ALTER TABLE "Perfil" ADD COLUMN "matricula" TEXT;
ALTER TABLE "Turno" ADD COLUMN "duracion" INTEGER NOT NULL DEFAULT 30;
ALTER TYPE "EstadoTurno" ADD VALUE 'AUSENTE';
CREATE TABLE "ConsultaRevision" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "usuarioEmail" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    CONSTRAINT "ConsultaRevision_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ConsultaRevision_consultaId_version_key" ON "ConsultaRevision"("consultaId", "version");
ALTER TABLE "ConsultaRevision" ADD CONSTRAINT "ConsultaRevision_consultaId_fkey"
 FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConsultaRevision" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "ConsultaRevision" FROM anon, authenticated;
