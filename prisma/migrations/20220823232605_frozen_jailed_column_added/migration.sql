/*
  Warnings:

  - You are about to drop the column `frozen` on the `PropertiesOnUsers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PropertiesOnUsers" DROP COLUMN "frozen";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "frozen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jailed" BOOLEAN NOT NULL DEFAULT false;
