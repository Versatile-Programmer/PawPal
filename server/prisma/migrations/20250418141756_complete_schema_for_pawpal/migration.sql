/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PetGender" AS ENUM ('Male', 'Female', 'Unknown');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('Small', 'Medium', 'Large');

-- CreateEnum
CREATE TYPE "AdoptionStatus" AS ENUM ('Available', 'Pending', 'Adopted', 'Withdrawn');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ADOPTION_REQUEST_RECEIVED', 'ADOPTION_REQUEST_APPROVED', 'ADOPTION_REQUEST_REJECTED', 'NEW_PET_MATCH');

-- CreateEnum
CREATE TYPE "RelatedEntityType" AS ENUM ('PET', 'ADOPTION_REQUEST', 'USER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('VACCINATION_RECORD', 'HEALTH_CERTIFICATE', 'PHOTO', 'OTHER');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "password_reset_token" VARCHAR(255),
    "contact_number" VARCHAR(20),
    "token_send_at" TIMESTAMP,
    "email_verified_at" TIMESTAMP,
    "email_verify_token" VARCHAR(255),
    "registration_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "pets" (
    "pet_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "species" VARCHAR(50) NOT NULL,
    "breed" VARCHAR(100),
    "age" INTEGER,
    "gender" "PetGender" NOT NULL,
    "size" "PetSize",
    "color" VARCHAR(100),
    "description" TEXT,
    "adoption_status" "AdoptionStatus" NOT NULL DEFAULT 'Available',
    "image_url" VARCHAR(255),
    "date_listed" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listed_by_user_id" BIGINT NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("pet_id")
);

-- CreateTable
CREATE TABLE "adoption_requests" (
    "request_id" BIGSERIAL NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "request_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RequestStatus" NOT NULL DEFAULT 'Pending',
    "message_to_lister" TEXT,

    CONSTRAINT "adoption_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "pet_documents" (
    "document_id" BIGSERIAL NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "document_type" "DocumentType",
    "upload_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by_user_id" BIGINT NOT NULL,

    CONSTRAINT "pet_documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_entity_id" BIGINT,
    "related_entity_type" "RelatedEntityType",

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_password_reset_token_key" ON "users"("password_reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_verify_token_key" ON "users"("email_verify_token");

-- CreateIndex
CREATE INDEX "pets_listed_by_user_id_idx" ON "pets"("listed_by_user_id");

-- CreateIndex
CREATE INDEX "adoption_requests_pet_id_idx" ON "adoption_requests"("pet_id");

-- CreateIndex
CREATE INDEX "adoption_requests_user_id_idx" ON "adoption_requests"("user_id");

-- CreateIndex
CREATE INDEX "pet_documents_pet_id_idx" ON "pet_documents"("pet_id");

-- CreateIndex
CREATE INDEX "pet_documents_uploaded_by_user_id_idx" ON "pet_documents"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_listed_by_user_id_fkey" FOREIGN KEY ("listed_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("pet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_documents" ADD CONSTRAINT "pet_documents_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("pet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_documents" ADD CONSTRAINT "pet_documents_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
