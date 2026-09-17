-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('DOCTORA', 'SECRETARIA');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMENINO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fechaNac" TIMESTAMP(3) NOT NULL,
    "sexo" "Sexo",
    "fotoUrl" TEXT,
    "tutorNombre" TEXT,
    "tutorDni" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "contactoEmergencia" TEXT,
    "antecedentesFamiliares" TEXT,
    "alergias" TEXT,
    "pesoNacer" DOUBLE PRECISION,
    "tallaNacer" DOUBLE PRECISION,
    "grupoSanguineo" TEXT,
    "observaciones" TEXT,
    "obraSocial" TEXT,
    "numeroAfiliado" TEXT,
    "plan" TEXT,
    "particular" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "diagnostico" TEXT,
    "tratamiento" TEXT,
    "peso" DOUBLE PRECISION,
    "talla" DOUBLE PRECISION,
    "observaciones" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacuna" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dosisTotales" INTEGER NOT NULL,
    "edadRecomendada" TEXT,

    CONSTRAINT "Vacuna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VacunaAplicada" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "vacunaId" TEXT NOT NULL,
    "dosisNumero" INTEGER NOT NULL,
    "fechaAplicada" TIMESTAMP(3),
    "fechaProgramada" TIMESTAMP(3),
    "observaciones" TEXT,

    CONSTRAINT "VacunaAplicada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "pacienteId" TEXT,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_dni_key" ON "Paciente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Vacuna_nombre_key" ON "Vacuna"("nombre");

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VacunaAplicada" ADD CONSTRAINT "VacunaAplicada_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VacunaAplicada" ADD CONSTRAINT "VacunaAplicada_vacunaId_fkey" FOREIGN KEY ("vacunaId") REFERENCES "Vacuna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
