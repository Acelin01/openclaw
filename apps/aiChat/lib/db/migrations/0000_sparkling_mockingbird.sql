CREATE TABLE `Chat` (
	`id` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`title` text NOT NULL,
	`userId` varchar(255) NOT NULL,
	`visibility` enum('public','private') NOT NULL DEFAULT 'private',
	`lastContext` json,
	CONSTRAINT `Chat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Document` (
	`id` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`kind` enum('text','code','image','sheet') NOT NULL DEFAULT 'text',
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `Document_id_createdAt_pk` PRIMARY KEY(`id`,`createdAt`)
);
--> statement-breakpoint
CREATE TABLE `Message_v2` (
	`id` varchar(255) NOT NULL,
	`chatId` varchar(255) NOT NULL,
	`role` varchar(32) NOT NULL,
	`parts` json NOT NULL,
	`attachments` json,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `Message_v2_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Suggestion` (
	`id` varchar(255) NOT NULL,
	`documentId` varchar(255) NOT NULL,
	`documentCreatedAt` timestamp NOT NULL,
	`originalText` text NOT NULL,
	`suggestedText` text NOT NULL,
	`description` text,
	`isResolved` boolean NOT NULL DEFAULT false,
	`userId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `Suggestion_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`name` varchar(255),
	`role` varchar(32) DEFAULT 'CUSTOMER',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `Vote_v2` (
	`chatId` varchar(255) NOT NULL,
	`messageId` varchar(255) NOT NULL,
	`isUpvoted` boolean NOT NULL,
	CONSTRAINT `Vote_v2_chatId_messageId_pk` PRIMARY KEY(`chatId`,`messageId`)
);
--> statement-breakpoint
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Message_v2` ADD CONSTRAINT `Message_v2_chatId_Chat_id_fk` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Suggestion` ADD CONSTRAINT `Suggestion_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Vote_v2` ADD CONSTRAINT `Vote_v2_chatId_Chat_id_fk` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Vote_v2` ADD CONSTRAINT `Vote_v2_messageId_Message_v2_id_fk` FOREIGN KEY (`messageId`) REFERENCES `Message_v2`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `Chat` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `Document` (`userId`);--> statement-breakpoint
CREATE INDEX `chatId_idx` ON `Message_v2` (`chatId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `Suggestion` (`userId`);--> statement-breakpoint
CREATE INDEX `documentId_createdAt_idx` ON `Suggestion` (`documentId`,`documentCreatedAt`);--> statement-breakpoint
CREATE INDEX `messageId_idx` ON `Vote_v2` (`messageId`);