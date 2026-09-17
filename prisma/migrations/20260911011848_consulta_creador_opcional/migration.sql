-- DropForeignKey
ALTER TABLE "Consulta" DROP CONSTRAINT "Consulta_creadoPorId_fkey";

-- AlterTable
ALTER TABLE "Consulta" ALTER COLUMN "creadoPorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
