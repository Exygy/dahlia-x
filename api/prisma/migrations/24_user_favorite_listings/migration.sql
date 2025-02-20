-- CreateTable
CREATE TABLE "_favorite_listings" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_favorite_listings_AB_unique" ON "_favorite_listings"("A", "B");

-- CreateIndex
CREATE INDEX "_favorite_listings_B_index" ON "_favorite_listings"("B");

-- AddForeignKey
ALTER TABLE "_favorite_listings" ADD CONSTRAINT "_favorite_listings_A_fkey" FOREIGN KEY ("A") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favorite_listings" ADD CONSTRAINT "_favorite_listings_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;