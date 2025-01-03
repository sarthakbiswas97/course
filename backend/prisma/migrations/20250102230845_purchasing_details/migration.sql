-- CreateTable
CREATE TABLE "_Purchases" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Purchases_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Purchases_B_index" ON "_Purchases"("B");

-- AddForeignKey
ALTER TABLE "_Purchases" ADD CONSTRAINT "_Purchases_A_fkey" FOREIGN KEY ("A") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Purchases" ADD CONSTRAINT "_Purchases_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
