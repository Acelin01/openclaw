-- AlterTable
ALTER TABLE `Document` MODIFY `kind` ENUM('text', 'code', 'image', 'sheet', 'quote', 'project', 'position', 'requirement', 'resume', 'service', 'matching', 'approval', 'contract', 'message', 'report', 'task') NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE `messages` MODIFY `messageType` ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'APPLICATION', 'CHAT') NOT NULL DEFAULT 'TEXT';

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `documents` JSON NULL,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `milestones` JSON NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `teamMembers` JSON NULL;

-- AlterTable
ALTER TABLE `share_links` MODIFY `targetType` ENUM('INQUIRY', 'QUOTATION', 'PROJECT', 'POSITION', 'RESUME', 'SERVICE', 'REQUIREMENT', 'MATCHING', 'REPORT', 'TASK', 'APPROVAL', 'CONTRACT', 'MESSAGE') NOT NULL;

-- CreateTable
CREATE TABLE `schedules` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `type` ENUM('MEETING', 'TASK', 'VIDEO', 'EVENT') NOT NULL DEFAULT 'EVENT',
    `location` VARCHAR(191) NULL,
    `isAllDay` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `taskId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `schedules_taskId_key`(`taskId`),
    INDEX `schedules_userId_idx`(`userId`),
    INDEX `schedules_startTime_endTime_idx`(`startTime`, `endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_requirements` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `priority` VARCHAR(191) NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(191) NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_requirements_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_tasks` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `requirementId` VARCHAR(191) NULL,
    `assigneeId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `priority` VARCHAR(191) NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(191) NULL DEFAULT 'PENDING',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `estimatedHours` DOUBLE NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `subtasks` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_tasks_projectId_idx`(`projectId`),
    INDEX `project_tasks_requirementId_idx`(`requirementId`),
    INDEX `project_tasks_assigneeId_idx`(`assigneeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `user_tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_requirements` ADD CONSTRAINT `project_requirements_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `project_requirements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
