/*
  Warnings:

  - You are about to alter the column `kind` on the `Document` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(16))` to `Enum(EnumId(30))`.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Document` DROP FOREIGN KEY `Document_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Suggestion` DROP FOREIGN KEY `Suggestion_userId_fkey`;

-- DropForeignKey
ALTER TABLE `_UserAssociatedAgents` DROP FOREIGN KEY `_UserAssociatedAgents_B_fkey`;

-- DropForeignKey
ALTER TABLE `addresses` DROP FOREIGN KEY `addresses_userId_fkey`;

-- DropForeignKey
ALTER TABLE `agents` DROP FOREIGN KEY `agents_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ai_conversations` DROP FOREIGN KEY `ai_conversations_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ai_provider_keys` DROP FOREIGN KEY `ai_provider_keys_userId_fkey`;

-- DropForeignKey
ALTER TABLE `chat_interaction_metrics` DROP FOREIGN KEY `chat_interaction_metrics_userId_fkey`;

-- DropForeignKey
ALTER TABLE `financial_reports` DROP FOREIGN KEY `financial_reports_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `inquiries` DROP FOREIGN KEY `inquiries_userId_fkey`;

-- DropForeignKey
ALTER TABLE `interviews` DROP FOREIGN KEY `interviews_candidateId_fkey`;

-- DropForeignKey
ALTER TABLE `interviews` DROP FOREIGN KEY `interviews_interviewerId_fkey`;

-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `invoices_userId_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_userId_fkey`;

-- DropForeignKey
ALTER TABLE `positions` DROP FOREIGN KEY `positions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `project_activities` DROP FOREIGN KEY `project_activities_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_activities` DROP FOREIGN KEY `project_activities_userId_fkey`;

-- DropForeignKey
ALTER TABLE `project_approvals` DROP FOREIGN KEY `project_approvals_approvedBy_fkey`;

-- DropForeignKey
ALTER TABLE `project_approvals` DROP FOREIGN KEY `project_approvals_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_approvals` DROP FOREIGN KEY `project_approvals_requesterId_fkey`;

-- DropForeignKey
ALTER TABLE `project_financials` DROP FOREIGN KEY `project_financials_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_milestones` DROP FOREIGN KEY `project_milestones_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_qna` DROP FOREIGN KEY `project_qna_answeredById_fkey`;

-- DropForeignKey
ALTER TABLE `project_qna` DROP FOREIGN KEY `project_qna_askedById_fkey`;

-- DropForeignKey
ALTER TABLE `project_qna` DROP FOREIGN KEY `project_qna_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_tasks` DROP FOREIGN KEY `project_tasks_assigneeId_fkey`;

-- DropForeignKey
ALTER TABLE `project_team_members` DROP FOREIGN KEY `project_team_members_userId_fkey`;

-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_userId_fkey`;

-- DropForeignKey
ALTER TABLE `quotations` DROP FOREIGN KEY `quotations_userId_fkey`;

-- DropForeignKey
ALTER TABLE `recruitment_applications` DROP FOREIGN KEY `recruitment_applications_userId_fkey`;

-- DropForeignKey
ALTER TABLE `recruitment_settings` DROP FOREIGN KEY `recruitment_settings_userId_fkey`;

-- DropForeignKey
ALTER TABLE `resumes` DROP FOREIGN KEY `resumes_userId_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_userId_fkey`;

-- DropForeignKey
ALTER TABLE `shared_employees` DROP FOREIGN KEY `shared_employees_userId_fkey`;

-- DropForeignKey
ALTER TABLE `subscription_usage_logs` DROP FOREIGN KEY `subscription_usage_logs_userId_fkey`;

-- DropForeignKey
ALTER TABLE `tax_records` DROP FOREIGN KEY `tax_records_userId_fkey`;

-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `user_contacts` DROP FOREIGN KEY `user_contacts_contactId_fkey`;

-- DropForeignKey
ALTER TABLE `user_contacts` DROP FOREIGN KEY `user_contacts_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_events` DROP FOREIGN KEY `user_events_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_sessions` DROP FOREIGN KEY `user_sessions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_subscriptions` DROP FOREIGN KEY `user_subscriptions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_tasks` DROP FOREIGN KEY `user_tasks_userId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `wallets` DROP FOREIGN KEY `wallets_userId_fkey`;

-- DropForeignKey
ALTER TABLE `worker_profiles` DROP FOREIGN KEY `worker_profiles_userId_fkey`;

-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `agentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Document` ADD COLUMN `agentId` VARCHAR(191) NULL,
    ADD COLUMN `messageId` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `visibility` ENUM('public', 'private') NOT NULL DEFAULT 'private',
    MODIFY `kind` ENUM('text', 'code', 'image', 'sheet', 'quote', 'project', 'position', 'requirement', 'resume', 'service', 'matching', 'approval', 'contract', 'message', 'report', 'task', 'milestone', 'iteration', 'defect', 'risk', 'web', 'agent', 'admin') NULL DEFAULT 'quote';

-- AlterTable
ALTER TABLE `Message_v2` ADD COLUMN `agentId` VARCHAR(191) NULL,
    ADD COLUMN `authorAvatar` TEXT NULL,
    ADD COLUMN `authorName` VARCHAR(255) NULL,
    ADD COLUMN `content` TEXT NULL,
    ADD COLUMN `userId` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `agents` ADD COLUMN `avatar` TEXT NULL,
    ADD COLUMN `departmentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `financial_reports` ADD COLUMN `collaborationId` VARCHAR(191) NULL,
    MODIFY `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project_activities` ADD COLUMN `collaborationId` VARCHAR(191) NULL,
    MODIFY `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project_approvals` ADD COLUMN `collaborationId` VARCHAR(191) NULL,
    MODIFY `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project_financials` ADD COLUMN `collaborationId` VARCHAR(191) NULL,
    MODIFY `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project_milestones` ADD COLUMN `collaborationId` VARCHAR(191) NULL,
    MODIFY `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project_qna` ADD COLUMN `collaborationId` VARCHAR(191) NULL,
    MODIFY `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project_requirements` ADD COLUMN `assigneeId` VARCHAR(191) NULL,
    ADD COLUMN `collaborationId` VARCHAR(191) NULL,
    ADD COLUMN `iterationId` VARCHAR(191) NULL,
    ADD COLUMN `reporterId` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NULL DEFAULT 'FUNCTIONAL';

-- AlterTable
ALTER TABLE `project_tasks` ADD COLUMN `collaborationId` VARCHAR(191) NULL,
    ADD COLUMN `iterationId` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NULL DEFAULT 'TASK';

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `aiAppId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('CUSTOMER', 'PROVIDER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `avatarUrl` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isSuspended` BOOLEAN NOT NULL DEFAULT false,
    `departmentId` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NULL,
    `teamId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `users_departmentId_fkey`(`departmentId`),
    INDEX `users_teamId_fkey`(`teamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_collaborations` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `aiAppId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_collaborations_projectId_key`(`projectId`),
    INDEX `project_collaborations_aiAppId_idx`(`aiAppId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_defects` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `collaborationId` VARCHAR(191) NULL,
    `iterationId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `severity` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `reporterId` VARCHAR(191) NULL,
    `assigneeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_defects_projectId_idx`(`projectId`),
    INDEX `project_defects_collaborationId_idx`(`collaborationId`),
    INDEX `project_defects_iterationId_idx`(`iterationId`),
    INDEX `project_defects_assigneeId_idx`(`assigneeId`),
    INDEX `project_defects_reporterId_idx`(`reporterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_risks` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `collaborationId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `level` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `ownerId` VARCHAR(191) NULL,
    `probability` VARCHAR(191) NULL DEFAULT 'MEDIUM',
    `impact` VARCHAR(191) NULL DEFAULT 'MEDIUM',
    `mitigationPlan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_risks_projectId_idx`(`projectId`),
    INDEX `project_risks_collaborationId_idx`(`collaborationId`),
    INDEX `project_risks_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mcp_tools` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `avatar` TEXT NULL,
    `publisher` VARCHAR(100) NULL,
    `skills` JSON NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `isBuiltIn` BOOLEAN NOT NULL DEFAULT true,
    `isAppOutput` BOOLEAN NOT NULL DEFAULT false,
    `creatorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `config` JSON NULL,
    `endpoint` TEXT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'REST',
    `capabilities` JSON NULL,

    INDEX `mcp_tools_creatorId_idx`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Iteration` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `collaborationId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `goals` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PLANNING',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Iteration_projectId_idx`(`projectId`),
    INDEX `Iteration_collaborationId_idx`(`collaborationId`),
    INDEX `Iteration_ownerId_idx`(`ownerId`),
    INDEX `Iteration_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IterationComment` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `iterationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IterationComment_iterationId_idx`(`iterationId`),
    INDEX `IterationComment_userId_idx`(`userId`),
    INDEX `IterationComment_parentId_fkey`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IterationActivity` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `iterationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IterationActivity_iterationId_idx`(`iterationId`),
    INDEX `IterationActivity_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_apps` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `icon` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED',
    `type` VARCHAR(191) NOT NULL DEFAULT 'TOOL',
    `category` VARCHAR(50) NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_ai_apps` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `appId` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_ai_apps_userId_idx`(`userId`),
    INDEX `user_ai_apps_appId_idx`(`appId`),
    UNIQUE INDEX `user_ai_apps_userId_appId_key`(`userId`, `appId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AIAppAgents` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    INDEX `_AIAppAgents_B_index`(`B`),
    UNIQUE INDEX `_AIAppAgents_AB_unique`(`A`, `B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AgentSkills` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AgentSkills_AB_unique`(`A`, `B`),
    INDEX `_AgentSkills_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AgentTools` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AgentTools_AB_unique`(`A`, `B`),
    INDEX `_AgentTools_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ToolRelations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ToolRelations_AB_unique`(`A`, `B`),
    INDEX `_ToolRelations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AIAppTools` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AIAppTools_AB_unique`(`A`, `B`),
    INDEX `_AIAppTools_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx_userId_createdAt` ON `Chat`(`userId`, `createdAt`);

-- CreateIndex
CREATE INDEX `user_createdAt_idx` ON `Chat`(`userId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Chat_agentId_fkey` ON `Chat`(`agentId`);

-- CreateIndex
CREATE INDEX `Document_messageId_idx` ON `Document`(`messageId`);

-- CreateIndex
CREATE INDEX `idx_userId_kind_createdAt` ON `Document`(`userId`, `kind`, `createdAt`);

-- CreateIndex
CREATE INDEX `user_kind_createdAt_idx` ON `Document`(`userId`, `kind`, `createdAt`);

-- CreateIndex
CREATE INDEX `Document_agentId_fkey` ON `Document`(`agentId`);

-- CreateIndex
CREATE INDEX `Message_v2_agentId_idx` ON `Message_v2`(`agentId`);

-- CreateIndex
CREATE INDEX `idx_chatId_createdAt` ON `Message_v2`(`chatId`, `createdAt`);

-- CreateIndex
CREATE INDEX `chat_createdAt_idx` ON `Message_v2`(`chatId`, `createdAt`);

-- CreateIndex
CREATE INDEX `agents_departmentId_fkey` ON `agents`(`departmentId`);

-- CreateIndex
CREATE INDEX `financial_reports_collaborationId_idx` ON `financial_reports`(`collaborationId`);

-- CreateIndex
CREATE INDEX `project_activities_collaborationId_idx` ON `project_activities`(`collaborationId`);

-- CreateIndex
CREATE INDEX `project_approvals_collaborationId_idx` ON `project_approvals`(`collaborationId`);

-- CreateIndex
CREATE INDEX `project_financials_collaborationId_idx` ON `project_financials`(`collaborationId`);

-- CreateIndex
CREATE INDEX `project_milestones_collaborationId_idx` ON `project_milestones`(`collaborationId`);

-- CreateIndex
CREATE INDEX `project_qna_collaborationId_idx` ON `project_qna`(`collaborationId`);

-- CreateIndex
CREATE INDEX `project_requirements_iterationId_idx` ON `project_requirements`(`iterationId`);

-- CreateIndex
CREATE INDEX `project_requirements_collaborationId_idx` ON `project_requirements`(`collaborationId`);

-- CreateIndex
CREATE INDEX `project_requirements_assigneeId_idx` ON `project_requirements`(`assigneeId`);

-- CreateIndex
CREATE INDEX `project_requirements_reporterId_idx` ON `project_requirements`(`reporterId`);

-- CreateIndex
CREATE INDEX `project_tasks_iterationId_idx` ON `project_tasks`(`iterationId`);

-- CreateIndex
CREATE INDEX `project_tasks_collaborationId_idx` ON `project_tasks`(`collaborationId`);

-- CreateIndex
CREATE INDEX `projects_aiAppId_idx` ON `projects`(`aiAppId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tax_records` ADD CONSTRAINT `tax_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_provider_keys` ADD CONSTRAINT `ai_provider_keys_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_subscriptions` ADD CONSTRAINT `user_subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_usage_logs` ADD CONSTRAINT `subscription_usage_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_events` ADD CONSTRAINT `user_events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_interaction_metrics` ADD CONSTRAINT `chat_interaction_metrics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_profiles` ADD CONSTRAINT `worker_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message_v2` ADD CONSTRAINT `Message_v2_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message_v2`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Suggestion` ADD CONSTRAINT `Suggestion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_aiAppId_fkey` FOREIGN KEY (`aiAppId`) REFERENCES `ai_apps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_collaborations` ADD CONSTRAINT `project_collaborations_aiAppId_fkey` FOREIGN KEY (`aiAppId`) REFERENCES `ai_apps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_collaborations` ADD CONSTRAINT `project_collaborations_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `positions` ADD CONSTRAINT `positions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruitment_applications` ADD CONSTRAINT `recruitment_applications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interviews` ADD CONSTRAINT `interviews_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interviews` ADD CONSTRAINT `interviews_interviewerId_fkey` FOREIGN KEY (`interviewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruitment_settings` ADD CONSTRAINT `recruitment_settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_tasks` ADD CONSTRAINT `user_tasks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_requirements` ADD CONSTRAINT `project_requirements_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_requirements` ADD CONSTRAINT `project_requirements_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_requirements` ADD CONSTRAINT `project_requirements_iterationId_fkey` FOREIGN KEY (`iterationId`) REFERENCES `Iteration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_requirements` ADD CONSTRAINT `project_requirements_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_iterationId_fkey` FOREIGN KEY (`iterationId`) REFERENCES `Iteration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_defects` ADD CONSTRAINT `project_defects_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_defects` ADD CONSTRAINT `project_defects_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_defects` ADD CONSTRAINT `project_defects_iterationId_fkey` FOREIGN KEY (`iterationId`) REFERENCES `Iteration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_defects` ADD CONSTRAINT `project_defects_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_defects` ADD CONSTRAINT `project_defects_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_team_members` ADD CONSTRAINT `project_team_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_milestones` ADD CONSTRAINT `project_milestones_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_milestones` ADD CONSTRAINT `project_milestones_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_activities` ADD CONSTRAINT `project_activities_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_activities` ADD CONSTRAINT `project_activities_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_activities` ADD CONSTRAINT `project_activities_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_approvals` ADD CONSTRAINT `project_approvals_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_approvals` ADD CONSTRAINT `project_approvals_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_approvals` ADD CONSTRAINT `project_approvals_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_approvals` ADD CONSTRAINT `project_approvals_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_financials` ADD CONSTRAINT `project_financials_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_financials` ADD CONSTRAINT `project_financials_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_risks` ADD CONSTRAINT `project_risks_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_risks` ADD CONSTRAINT `project_risks_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_risks` ADD CONSTRAINT `project_risks_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_qna` ADD CONSTRAINT `project_qna_answeredById_fkey` FOREIGN KEY (`answeredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_qna` ADD CONSTRAINT `project_qna_askedById_fkey` FOREIGN KEY (`askedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_qna` ADD CONSTRAINT `project_qna_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_qna` ADD CONSTRAINT `project_qna_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_reports` ADD CONSTRAINT `financial_reports_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_reports` ADD CONSTRAINT `financial_reports_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shared_employees` ADD CONSTRAINT `shared_employees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mcp_tools` ADD CONSTRAINT `mcp_tools_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Iteration` ADD CONSTRAINT `Iteration_collaborationId_fkey` FOREIGN KEY (`collaborationId`) REFERENCES `project_collaborations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Iteration` ADD CONSTRAINT `Iteration_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Iteration` ADD CONSTRAINT `Iteration_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IterationComment` ADD CONSTRAINT `IterationComment_iterationId_fkey` FOREIGN KEY (`iterationId`) REFERENCES `Iteration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IterationComment` ADD CONSTRAINT `IterationComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `IterationComment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `IterationComment` ADD CONSTRAINT `IterationComment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IterationActivity` ADD CONSTRAINT `IterationActivity_iterationId_fkey` FOREIGN KEY (`iterationId`) REFERENCES `Iteration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IterationActivity` ADD CONSTRAINT `IterationActivity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_ai_apps` ADD CONSTRAINT `user_ai_apps_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `ai_apps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_ai_apps` ADD CONSTRAINT `user_ai_apps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AIAppAgents` ADD CONSTRAINT `_AIAppAgents_A_fkey` FOREIGN KEY (`A`) REFERENCES `ai_apps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AIAppAgents` ADD CONSTRAINT `_AIAppAgents_B_fkey` FOREIGN KEY (`B`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentSkills` ADD CONSTRAINT `_AgentSkills_A_fkey` FOREIGN KEY (`A`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentSkills` ADD CONSTRAINT `_AgentSkills_B_fkey` FOREIGN KEY (`B`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentTools` ADD CONSTRAINT `_AgentTools_A_fkey` FOREIGN KEY (`A`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentTools` ADD CONSTRAINT `_AgentTools_B_fkey` FOREIGN KEY (`B`) REFERENCES `mcp_tools`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserAssociatedAgents` ADD CONSTRAINT `_UserAssociatedAgents_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ToolRelations` ADD CONSTRAINT `_ToolRelations_A_fkey` FOREIGN KEY (`A`) REFERENCES `mcp_tools`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ToolRelations` ADD CONSTRAINT `_ToolRelations_B_fkey` FOREIGN KEY (`B`) REFERENCES `mcp_tools`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AIAppTools` ADD CONSTRAINT `_AIAppTools_A_fkey` FOREIGN KEY (`A`) REFERENCES `ai_apps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AIAppTools` ADD CONSTRAINT `_AIAppTools_B_fkey` FOREIGN KEY (`B`) REFERENCES `mcp_tools`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
