-- AlterTable
ALTER TABLE `inquiries` ADD COLUMN `templateId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `quotations` ADD COLUMN `serviceId` VARCHAR(191) NULL,
    ADD COLUMN `templateId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `isSuspended` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PROJECT_RESUME_MATCHING', 'RESUME_JOB_APPLICATION', 'SERVICE_QUOTE_REQUIREMENT') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `priority` INTEGER NOT NULL DEFAULT 0,
    `payload` JSON NULL,
    `result` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_provider_keys` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ai_provider_keys_userId_provider_active_idx`(`userId`, `provider`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('INQUIRY', 'QUOTATION') NOT NULL,
    `schemaVersion` VARCHAR(191) NOT NULL,
    `styleAssets` JSON NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `templates_type_status_idx`(`type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `share_links` (
    `id` VARCHAR(191) NOT NULL,
    `targetType` ENUM('INQUIRY', 'QUOTATION', 'PROJECT', 'POSITION', 'RESUME', 'SERVICE', 'REQUIREMENT', 'MATCHING') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NULL,
    `token` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `expireAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `share_links_token_key`(`token`),
    INDEX `share_links_targetType_targetId_idx`(`targetType`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `location` VARCHAR(191) NULL,
    `languages` JSON NULL,
    `skills` JSON NULL,
    `badges` JSON NULL,
    `hourlyRateAmount` DOUBLE NULL,
    `hourlyRateCurrency` VARCHAR(191) NULL DEFAULT 'USD',
    `hourlyRateUnit` VARCHAR(191) NULL DEFAULT '/小时',
    `responseTimeValue` INTEGER NULL,
    `responseTimeUnit` VARCHAR(191) NULL,
    `consultationEnabled` BOOLEAN NOT NULL DEFAULT false,
    `onlineStatus` BOOLEAN NOT NULL DEFAULT false,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedBy` VARCHAR(191) NULL,
    `verifiedDomains` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `worker_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_services` (
    `id` VARCHAR(191) NOT NULL,
    `workerId` VARCHAR(191) NOT NULL,
    `quotationId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `coverImageUrl` VARCHAR(191) NULL,
    `priceAmount` DOUBLE NOT NULL,
    `priceCurrency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `unit` VARCHAR(191) NULL,
    `deliveryTime` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'DRAFT', 'PENDING_APPROVAL') NULL,
    `rating` DOUBLE NULL,
    `reviewCount` INTEGER NULL,
    `tags` JSON NULL,
    `features` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `worker_services_workerId_idx`(`workerId`),
    INDEX `worker_services_quotationId_idx`(`quotationId`),
    INDEX `worker_services_rating_idx`(`rating`),
    INDEX `worker_services_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_packages` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_packages_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_package_plans` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `tier` ENUM('BASIC', 'STANDARD', 'PREMIUM', 'CUSTOM') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `priceAmount` DOUBLE NOT NULL,
    `priceCurrency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `deliveryTime` VARCHAR(191) NULL,
    `features` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_package_plans_packageId_idx`(`packageId`),
    INDEX `service_package_plans_tier_priceAmount_idx`(`tier`, `priceAmount`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_experiences` (
    `id` VARCHAR(191) NOT NULL,
    `workerId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companyLogoUrl` VARCHAR(191) NULL,
    `roles` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `worker_experiences_workerId_idx`(`workerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `serviceId` VARCHAR(191) NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `aspects` JSON NULL,
    `title` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reviews_providerId_idx`(`providerId`),
    INDEX `reviews_serviceId_idx`(`serviceId`),
    INDEX `reviews_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_faqs` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_faqs_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `title` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `visibility` ENUM('public', 'private') NOT NULL DEFAULT 'private',
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `lastContext` JSON NULL,

    INDEX `Chat_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message_v2` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(32) NOT NULL,
    `parts` JSON NOT NULL,
    `attachments` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    INDEX `Message_v2_chatId_idx`(`chatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `title` TEXT NOT NULL,
    `content` TEXT NULL,
    `kind` ENUM('text', 'code', 'image', 'sheet', 'quote', 'project', 'position', 'requirement', 'resume', 'service', 'matching') NOT NULL DEFAULT 'text',
    `userId` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NULL,

    INDEX `Document_userId_idx`(`userId`),
    PRIMARY KEY (`id`, `createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Suggestion` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `documentCreatedAt` DATETIME(3) NOT NULL,
    `originalText` TEXT NOT NULL,
    `suggestedText` TEXT NOT NULL,
    `description` TEXT NULL,
    `isResolved` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    INDEX `Suggestion_userId_idx`(`userId`),
    INDEX `Suggestion_documentId_documentCreatedAt_idx`(`documentId`, `documentCreatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stream` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    INDEX `Stream_chatId_idx`(`chatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vote_v2` (
    `chatId` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `isUpvoted` BOOLEAN NOT NULL,

    INDEX `Vote_v2_messageId_idx`(`messageId`),
    PRIMARY KEY (`chatId`, `messageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `tags` JSON NULL,
    `status` VARCHAR(191) NULL DEFAULT 'ACTIVE',
    `location` VARCHAR(191) NULL,
    `budgetMin` DOUBLE NULL,
    `budgetMax` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `projects_userId_idx`(`userId`),
    INDEX `projects_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `positions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `companyName` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `employmentType` VARCHAR(191) NULL,
    `salaryMin` DOUBLE NULL,
    `salaryMax` DOUBLE NULL,
    `requirements` JSON NULL,
    `tags` JSON NULL,
    `status` VARCHAR(191) NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `positions_userId_idx`(`userId`),
    INDEX `positions_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resumes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `summary` TEXT NULL,
    `skills` JSON NULL,
    `experiences` JSON NULL,
    `education` JSON NULL,
    `location` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `resumes_userId_idx`(`userId`),
    INDEX `resumes_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `inquiries_templateId_idx` ON `inquiries`(`templateId`);

-- CreateIndex
CREATE INDEX `quotations_serviceId_idx` ON `quotations`(`serviceId`);

-- CreateIndex
CREATE INDEX `quotations_templateId_idx` ON `quotations`(`templateId`);

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `worker_services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_provider_keys` ADD CONSTRAINT `ai_provider_keys_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `share_links` ADD CONSTRAINT `share_links_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_profiles` ADD CONSTRAINT `worker_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_services` ADD CONSTRAINT `worker_services_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `worker_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_services` ADD CONSTRAINT `worker_services_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `quotations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_packages` ADD CONSTRAINT `service_packages_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `worker_services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_package_plans` ADD CONSTRAINT `service_package_plans_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `service_packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_experiences` ADD CONSTRAINT `worker_experiences_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `worker_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `worker_services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_faqs` ADD CONSTRAINT `service_faqs_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `worker_services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message_v2` ADD CONSTRAINT `Message_v2_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Suggestion` ADD CONSTRAINT `Suggestion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Suggestion` ADD CONSTRAINT `Suggestion_documentId_documentCreatedAt_fkey` FOREIGN KEY (`documentId`, `documentCreatedAt`) REFERENCES `Document`(`id`, `createdAt`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stream` ADD CONSTRAINT `Stream_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote_v2` ADD CONSTRAINT `Vote_v2_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote_v2` ADD CONSTRAINT `Vote_v2_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message_v2`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `positions` ADD CONSTRAINT `positions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
