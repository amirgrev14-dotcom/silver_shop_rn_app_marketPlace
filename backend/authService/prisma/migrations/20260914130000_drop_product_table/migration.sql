-- DropProduct (moved to the standalone productService)
ALTER TABLE "Product" DROP CONSTRAINT "Product_sellerId_fkey";

DROP TABLE "Product";

DROP TYPE "ProductStatus";
