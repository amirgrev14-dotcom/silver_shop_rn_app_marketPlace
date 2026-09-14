/*
  Warnings:

  - The values `BUYER_SELLER,ADMIN_SUPER_ADMIN` on the enum `Role` will be removed.
    Existing rows are remapped: BUYER_SELLER → BUYER, ADMIN_SUPER_ADMIN → SUPER_ADMIN.

*/
-- AlterEnum: split glued roles into single-purpose values
-- (drop the old default first — Postgres cannot cast it automatically)
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'SUPER_ADMIN');

ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING (
  CASE "role"::text
    WHEN 'ADMIN_SUPER_ADMIN' THEN 'SUPER_ADMIN'::"Role"
    ELSE 'BUYER'::"Role"
  END
);

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'BUYER';

DROP TYPE "Role_old";
