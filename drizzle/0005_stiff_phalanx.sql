CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`cloudflareImageId` text NOT NULL,
	`userId` text NOT NULL,
	`documentId` text NOT NULL,
	`originalFilename` text NOT NULL,
	`fileSize` integer NOT NULL,
	`contentType` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`documentId`) REFERENCES `md_data`(`id`) ON UPDATE no action ON DELETE cascade
);
