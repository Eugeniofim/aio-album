CREATE TABLE `album_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `album_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `album_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `musicians` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`role` varchar(256) NOT NULL,
	`instrument` varchar(128),
	`bio` text,
	`photoKey` varchar(512),
	`photoUrl` varchar(1024),
	`website` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musicians_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `songbook_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('pdf_songbook','zip_album','pdf_dolby') NOT NULL,
	`fileKey` varchar(512),
	`fileUrl` varchar(1024),
	`label` varchar(256),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `songbook_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackNumber` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`composer` varchar(256) NOT NULL,
	`duration` varchar(16) DEFAULT '0:00',
	`lyrics` text,
	`chords` text,
	`briefing` text,
	`audioKey` varchar(512),
	`audioUrl` varchar(1024),
	`coverKey` varchar(512),
	`coverUrl` varchar(1024),
	`isPublished` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoclipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int,
	`title` varchar(256) NOT NULL,
	`composer` varchar(256),
	`youtubeUrl` varchar(512),
	`youtubeId` varchar(64),
	`thumbnailUrl` varchar(1024),
	`status` enum('em_producao','disponivel','em_breve') NOT NULL DEFAULT 'em_producao',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoclipes_id` PRIMARY KEY(`id`)
);
