-- CreateIndex
CREATE INDEX "FriendRequest_userId_idx" ON "FriendRequest"("userId");

-- CreateIndex
CREATE INDEX "PropertiesOnUsers_userId_idx" ON "PropertiesOnUsers"("userId");

-- CreateIndex
CREATE INDEX "TradesOnUsers_recieverId_idx" ON "TradesOnUsers"("recieverId");

-- CreateIndex
CREATE INDEX "User_username_fireBaseId_idx" ON "User"("username", "fireBaseId");
