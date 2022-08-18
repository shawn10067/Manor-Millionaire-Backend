/*
  Warnings:

  - You are about to drop the column `requestId` on the `FriendRequest` table. All the data in the column will be lost.
  - Added the required column `requestUserId` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_requestId_fkey";

-- AlterTable
ALTER TABLE "FriendRequest" DROP COLUMN "requestId",
ADD COLUMN     "requestUserId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_requestUserId_fkey" FOREIGN KEY ("requestUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
