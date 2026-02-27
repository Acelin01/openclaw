/*
  Warnings:

  - A unique constraint covering the columns `[projectId,agentId]` on the table `project_team_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,agentId]` on the table `user_contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `project_team_members` DROP FOREIGN KEY `project_team_members_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_contacts` DROP FOREIGN KEY `user_contacts_contactId_fkey`;

-- AlterTable
ALTER TABLE `Document` MODIFY `kind` ENUM('text', 'code', 'image', 'sheet', 'quote', 'project', 'position', 'requirement', 'resume', 'service', 'matching', 'approval', 'contract', 'message', 'report', 'task', 'web', 'agent', 'admin', 'document') NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `metadata` JSON NULL;

-- AlterTable
ALTER TABLE `project_team_members` ADD COLUMN `agentId` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `adminToken` TEXT NULL;

-- AlterTable
ALTER TABLE `user_contacts` ADD COLUMN `agentId` VARCHAR(191) NULL,
    MODIFY `contactId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `agent_documents` (
    `agentId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `documentCreatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`agentId`, `documentId`, `documentCreatedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agents` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `prompt` TEXT NOT NULL,
    `mermaid` TEXT NOT NULL,
    `isCallableByOthers` BOOLEAN NOT NULL DEFAULT false,
    `identifier` VARCHAR(50) NULL,
    `whenToCall` TEXT NULL,
    `selectedTools` JSON NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `agents_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AgentToProject` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AgentToProject_AB_unique`(`A`, `B`),
    INDEX `_AgentToProject_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AgentToProjectRequirement` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AgentToProjectRequirement_AB_unique`(`A`, `B`),
    INDEX `_AgentToProjectRequirement_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AgentToProjectTask` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AgentToProjectTask_AB_unique`(`A`, `B`),
    INDEX `_AgentToProjectTask_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AgentToChat` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AgentToChat_AB_unique`(`A`, `B`),
    INDEX `_AgentToChat_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserAssociatedAgents` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UserAssociatedAgents_AB_unique`(`A`, `B`),
    INDEX `_UserAssociatedAgents_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `project_team_members_agentId_idx` ON `project_team_members`(`agentId`);

-- CreateIndex
CREATE UNIQUE INDEX `project_team_members_projectId_agentId_key` ON `project_team_members`(`projectId`, `agentId`);

-- CreateIndex
CREATE INDEX `user_contacts_agentId_idx` ON `user_contacts`(`agentId`);

-- CreateIndex
CREATE UNIQUE INDEX `user_contacts_userId_agentId_key` ON `user_contacts`(`userId`, `agentId`);

-- AddForeignKey
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_team_members` ADD CONSTRAINT `project_team_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_team_members` ADD CONSTRAINT `project_team_members_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_documents` ADD CONSTRAINT `agent_documents_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_documents` ADD CONSTRAINT `agent_documents_documentId_documentCreatedAt_fkey` FOREIGN KEY (`documentId`, `documentCreatedAt`) REFERENCES `Document`(`id`, `createdAt`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToProject` ADD CONSTRAINT `_AgentToProject_A_fkey` FOREIGN KEY (`A`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToProject` ADD CONSTRAINT `_AgentToProject_B_fkey` FOREIGN KEY (`B`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToProjectRequirement` ADD CONSTRAINT `_AgentToProjectRequirement_A_fkey` FOREIGN KEY (`A`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToProjectRequirement` ADD CONSTRAINT `_AgentToProjectRequirement_B_fkey` FOREIGN KEY (`B`) REFERENCES `project_requirements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToProjectTask` ADD CONSTRAINT `_AgentToProjectTask_A_fkey` FOREIGN KEY (`A`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToProjectTask` ADD CONSTRAINT `_AgentToProjectTask_B_fkey` FOREIGN KEY (`B`) REFERENCES `project_tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToChat` ADD CONSTRAINT `_AgentToChat_A_fkey` FOREIGN KEY (`A`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToChat` ADD CONSTRAINT `_AgentToChat_B_fkey` FOREIGN KEY (`B`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserAssociatedAgents` ADD CONSTRAINT `_UserAssociatedAgents_A_fkey` FOREIGN KEY (`A`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserAssociatedAgents` ADD CONSTRAINT `_UserAssociatedAgents_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
