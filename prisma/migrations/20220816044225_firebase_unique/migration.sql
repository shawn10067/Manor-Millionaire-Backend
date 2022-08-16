/*
  Warnings:

  - A unique constraint covering the columns `[fireBaseId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_fireBaseId_key" ON "User"("fireBaseId");
