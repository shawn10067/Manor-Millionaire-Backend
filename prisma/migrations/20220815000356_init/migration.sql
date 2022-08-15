-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "cash" INTEGER NOT NULL,
    "fireBaseId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "aloneIncome" INTEGER NOT NULL,
    "setIncome" INTEGER NOT NULL,
    "tier1Income" INTEGER NOT NULL,
    "tier2Income" INTEGER NOT NULL,
    "propertyValue" INTEGER NOT NULL,
    "tier1Cost" INTEGER NOT NULL,
    "tier2Cost" INTEGER NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertiesOnUsers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'alone',
    "frozen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PropertiesOnUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradesOnUsers" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recieverId" INTEGER NOT NULL,
    "senderCash" INTEGER NOT NULL,
    "recieverCash" INTEGER NOT NULL,

    CONSTRAINT "TradesOnUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_friends" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_propertySender" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_propertyReceiver" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Property_id_key" ON "Property"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PropertiesOnUsers_id_key" ON "PropertiesOnUsers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TradesOnUsers_id_key" ON "TradesOnUsers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_friends_AB_unique" ON "_friends"("A", "B");

-- CreateIndex
CREATE INDEX "_friends_B_index" ON "_friends"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_propertySender_AB_unique" ON "_propertySender"("A", "B");

-- CreateIndex
CREATE INDEX "_propertySender_B_index" ON "_propertySender"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_propertyReceiver_AB_unique" ON "_propertyReceiver"("A", "B");

-- CreateIndex
CREATE INDEX "_propertyReceiver_B_index" ON "_propertyReceiver"("B");

-- AddForeignKey
ALTER TABLE "PropertiesOnUsers" ADD CONSTRAINT "PropertiesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertiesOnUsers" ADD CONSTRAINT "PropertiesOnUsers_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradesOnUsers" ADD CONSTRAINT "TradesOnUsers_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradesOnUsers" ADD CONSTRAINT "TradesOnUsers_recieverId_fkey" FOREIGN KEY ("recieverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_propertySender" ADD CONSTRAINT "_propertySender_A_fkey" FOREIGN KEY ("A") REFERENCES "PropertiesOnUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_propertySender" ADD CONSTRAINT "_propertySender_B_fkey" FOREIGN KEY ("B") REFERENCES "TradesOnUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_propertyReceiver" ADD CONSTRAINT "_propertyReceiver_A_fkey" FOREIGN KEY ("A") REFERENCES "PropertiesOnUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_propertyReceiver" ADD CONSTRAINT "_propertyReceiver_B_fkey" FOREIGN KEY ("B") REFERENCES "TradesOnUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
