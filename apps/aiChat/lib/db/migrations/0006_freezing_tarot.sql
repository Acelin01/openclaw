CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`adminConfigs` json,
	`adminToken` text,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `Document` MODIFY COLUMN `kind` enum('text','code','image','sheet','quote','project','position','requirement','resume','service','matching','approval','contract','message','report','task','web','agent','agent-dashboard','entity-dashboard','admin','document','iteration') DEFAULT 'quote';--> statement-breakpoint
ALTER TABLE `Document` ADD `visibility` enum('public','private') DEFAULT 'private';--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `brief` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `intro` text;--> statement-breakpoint
ALTER TABLE `users` ADD `skills` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isFreelancer` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `Chat` (`userId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `Chat` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_createdAt_idx` ON `Chat` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `Document` (`userId`);--> statement-breakpoint
CREATE INDEX `kind_idx` ON `Document` (`kind`);--> statement-breakpoint
CREATE INDEX `chatId_idx` ON `Document` (`chatId`);--> statement-breakpoint
CREATE INDEX `user_kind_createdAt_idx` ON `Document` (`userId`,`kind`,`createdAt`);--> statement-breakpoint
CREATE INDEX `chatId_idx` ON `Message_v2` (`chatId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `Message_v2` (`createdAt`);--> statement-breakpoint
CREATE INDEX `chat_createdAt_idx` ON `Message_v2` (`chatId`,`createdAt`);