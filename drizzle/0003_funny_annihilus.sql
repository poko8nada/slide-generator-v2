ALTER TABLE `slide` RENAME TO `md_data`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_md_data` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_md_data`("id", "userId", "title", "body", "createdAt", "updatedAt") SELECT "id", "userId", "title", "body", "createdAt", "updatedAt" FROM `md_data`;--> statement-breakpoint
DROP TABLE `md_data`;--> statement-breakpoint
ALTER TABLE `__new_md_data` RENAME TO `md_data`;--> statement-breakpoint
PRAGMA foreign_keys=ON;