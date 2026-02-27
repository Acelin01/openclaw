/*
  Warnings:

  - You are about to drop the column `companyName` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `teamMembers` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `positions` DROP COLUMN `companyName`,
    ADD COLUMN `teamId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `teamMembers`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `companyName`,
    ADD COLUMN `teamId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `teams` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `positions` ADD CONSTRAINT `positions_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
