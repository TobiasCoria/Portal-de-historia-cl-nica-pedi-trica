-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "consentimientoAt" TIMESTAMP(3),
ADD COLUMN     "consentimientoPor" TEXT,
ADD COLUMN     "tutorVinculo" TEXT;
