/*
  Warnings:

  - You are about to drop the column `productIds` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `OrderProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderProduct" DROP CONSTRAINT "OrderProduct_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderProduct" DROP CONSTRAINT "OrderProduct_productId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "productIds",
ADD COLUMN     "productId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."OrderProduct";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
