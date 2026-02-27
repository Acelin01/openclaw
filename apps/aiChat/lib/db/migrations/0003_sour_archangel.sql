CREATE TABLE `Stream` (
	`id` varchar(36) NOT NULL,
	`chatId` varchar(36) NOT NULL,
	`createdAt` timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE `Document` MODIFY COLUMN `kind` enum('text','code','image','sheet','quote','project','position','requirement','resume','service','matching','approval','contract','message','report','task') DEFAULT 'quote';--> statement-breakpoint
ALTER TABLE `Chat` ADD `isPinned` boolean DEFAULT false;