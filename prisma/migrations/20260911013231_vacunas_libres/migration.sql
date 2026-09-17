/*
  Warnings:

  - You are about to drop the column `dosisNumero` on the `VacunaAplicada` table. All the data in the column will be lost.
  - You are about to drop the column `vacunaId` on the `VacunaAplicada` table. All the data in the column will be lost.
  - You are about to drop the `Vacuna` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nombre` to the `VacunaAplicada` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VacunaAplicada" DROP CONSTRAINT "VacunaAplicada_vacunaId_fkey";

-- AlterTable
ALTER TABLE "VacunaAplicada" DROP COLUMN "dosisNumero",
DROP COLUMN "vacunaId",
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dosis" TEXT,
ADD COLUMN     "nombre" TEXT NOT NULL;

-- DropTable
DROP TABLE "Vacuna";
