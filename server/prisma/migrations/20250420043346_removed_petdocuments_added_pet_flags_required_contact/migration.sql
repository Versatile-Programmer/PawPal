/*
  Warnings:

  - You are about to drop the `pet_documents` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `contact_number` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "pet_documents" DROP CONSTRAINT "pet_documents_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "pet_documents" DROP CONSTRAINT "pet_documents_uploaded_by_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "contact_number" SET NOT NULL;

-- DropTable
DROP TABLE "pet_documents";
