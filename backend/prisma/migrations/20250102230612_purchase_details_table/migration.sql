/*
  Warnings:

  - You are about to drop the `_Purchases` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Purchases" DROP CONSTRAINT "_Purchases_A_fkey";

-- DropForeignKey
ALTER TABLE "_Purchases" DROP CONSTRAINT "_Purchases_B_fkey";

-- DropTable
DROP TABLE "_Purchases";

-- CreateTable
CREATE TABLE "purchaseDetails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amoutnt" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,

    CONSTRAINT "purchaseDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchaseDetails_id_key" ON "purchaseDetails"("id");

-- AddForeignKey
ALTER TABLE "purchaseDetails" ADD CONSTRAINT "purchaseDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchaseDetails" ADD CONSTRAINT "purchaseDetails_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
