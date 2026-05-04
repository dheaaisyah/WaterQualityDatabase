/*
  Warnings:

  - The `ph` column on the `datawqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tds` column on the `datawqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `suhu` column on the `datawqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `turbidity` column on the `datawqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ec` column on the `datawqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `waktu_masuk` column on the `datawqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "datawqs" ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "ph",
ADD COLUMN     "ph" DOUBLE PRECISION,
DROP COLUMN "tds",
ADD COLUMN     "tds" DOUBLE PRECISION,
DROP COLUMN "suhu",
ADD COLUMN     "suhu" DOUBLE PRECISION,
DROP COLUMN "turbidity",
ADD COLUMN     "turbidity" DOUBLE PRECISION,
DROP COLUMN "ec",
ADD COLUMN     "ec" DOUBLE PRECISION,
DROP COLUMN "waktu_masuk",
ADD COLUMN     "waktu_masuk" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "aqms" (
    "id" SERIAL NOT NULL,
    "co2" TEXT,
    "suhu" TEXT,
    "humidity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aqms_pkey" PRIMARY KEY ("id")
);
