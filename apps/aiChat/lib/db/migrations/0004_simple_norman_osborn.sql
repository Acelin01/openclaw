ALTER TABLE `Chat` ADD `projectId` varchar(36);--> statement-breakpoint
ALTER TABLE `Message_v2` ADD `content` text;--> statement-breakpoint
ALTER TABLE `Message_v2` ADD `userId` varchar(36);--> statement-breakpoint
ALTER TABLE `Message_v2` ADD `authorName` varchar(255);--> statement-breakpoint
ALTER TABLE `Message_v2` ADD `authorAvatar` text;