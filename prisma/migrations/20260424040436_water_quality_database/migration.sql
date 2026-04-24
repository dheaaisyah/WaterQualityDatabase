/*
  Warnings:

  - You are about to drop the `@co2s` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `aqms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `no2datas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pm25datas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "@co2s";

-- DropTable
DROP TABLE "aqms";

-- DropTable
DROP TABLE "no2datas";

-- DropTable
DROP TABLE "pm25datas";

-- DropTable
DROP TABLE "shts";

-- CreateTable
CREATE TABLE "datawqs" (
    "id" SERIAL NOT NULL,
    "ph" TEXT,
    "tds" TEXT,
    "suhu" TEXT,
    "turbidity" TEXT,
    "ec" TEXT,
    "waktu_masuk" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datawqs_pkey" PRIMARY KEY ("id")
);
