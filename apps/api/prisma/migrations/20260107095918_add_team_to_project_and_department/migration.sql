-- AlterTable
ALTER TABLE `departments` ADD COLUMN `teamId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `teamId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
