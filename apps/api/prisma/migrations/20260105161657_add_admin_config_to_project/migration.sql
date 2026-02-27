-- AlterTable
ALTER TABLE `Document` MODIFY `kind` ENUM('text', 'code', 'image', 'sheet', 'quote', 'project', 'position', 'requirement', 'resume', 'service', 'matching', 'approval', 'contract', 'message', 'report', 'task', 'web', 'agent') NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `adminConfigs` JSON NULL,
    ADD COLUMN `isAdminEnabled` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `__drizzle_migrations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `hash` TEXT NOT NULL,
    `created_at` BIGINT NULL,

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
