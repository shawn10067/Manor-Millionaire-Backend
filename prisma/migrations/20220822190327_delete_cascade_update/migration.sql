-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_requestUserId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "PropertiesOnUsers" DROP CONSTRAINT "PropertiesOnUsers_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "PropertiesOnUsers" DROP CONSTRAINT "PropertiesOnUsers_userId_fkey";

-- DropForeignKey
ALTER TABLE "TradesOnUsers" DROP CONSTRAINT "TradesOnUsers_recieverId_fkey";

-- DropForeignKey
ALTER TABLE "TradesOnUsers" DROP CONSTRAINT "TradesOnUsers_senderId_fkey";

-- AddForeignKey
ALTER TABLE "PropertiesOnUsers" ADD CONSTRAINT "PropertiesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertiesOnUsers" ADD CONSTRAINT "PropertiesOnUsers_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradesOnUsers" ADD CONSTRAINT "TradesOnUsers_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradesOnUsers" ADD CONSTRAINT "TradesOnUsers_recieverId_fkey" FOREIGN KEY ("recieverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_requestUserId_fkey" FOREIGN KEY ("requestUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
