ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `Document` DROP FOREIGN KEY `Document_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `Message_v2` DROP FOREIGN KEY `Message_v2_chatId_Chat_id_fk`;
--> statement-breakpoint
ALTER TABLE `Suggestion` DROP FOREIGN KEY `Suggestion_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `Vote_v2` DROP FOREIGN KEY `Vote_v2_chatId_Chat_id_fk`;
--> statement-breakpoint
ALTER TABLE `Vote_v2` DROP FOREIGN KEY `Vote_v2_messageId_Message_v2_id_fk`;
--> statement-breakpoint
DROP INDEX `userId_idx` ON `Chat`;--> statement-breakpoint
DROP INDEX `userId_idx` ON `Document`;--> statement-breakpoint
DROP INDEX `chatId_idx` ON `Message_v2`;--> statement-breakpoint
DROP INDEX `userId_idx` ON `Suggestion`;--> statement-breakpoint
DROP INDEX `documentId_createdAt_idx` ON `Suggestion`;--> statement-breakpoint
DROP INDEX `messageId_idx` ON `Vote_v2`;--> statement-breakpoint
ALTER TABLE `Document` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `Vote_v2` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `Chat` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Chat` MODIFY COLUMN `userId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Chat` MODIFY COLUMN `visibility` enum('public','private') DEFAULT 'private';--> statement-breakpoint
ALTER TABLE `Document` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Document` MODIFY COLUMN `kind` enum('text','code','image','sheet','quote') DEFAULT 'text';--> statement-breakpoint
ALTER TABLE `Document` MODIFY COLUMN `userId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Message_v2` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Message_v2` MODIFY COLUMN `chatId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Message_v2` MODIFY COLUMN `attachments` json NOT NULL;--> statement-breakpoint
ALTER TABLE `Suggestion` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Suggestion` MODIFY COLUMN `documentId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Suggestion` MODIFY COLUMN `isResolved` boolean;--> statement-breakpoint
ALTER TABLE `Suggestion` MODIFY COLUMN `userId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password` text;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(32) NOT NULL DEFAULT 'CUSTOMER';--> statement-breakpoint
ALTER TABLE `Vote_v2` MODIFY COLUMN `chatId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Vote_v2` MODIFY COLUMN `messageId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `updatedAt`;