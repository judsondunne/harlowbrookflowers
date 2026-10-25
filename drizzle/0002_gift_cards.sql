ALTER TABLE `gift_subscriptions` ADD `card_style` text DEFAULT 'letterpress' NOT NULL;--> statement-breakpoint
ALTER TABLE `gift_subscriptions` ADD `share_token` text;--> statement-breakpoint
UPDATE `gift_subscriptions` SET `share_token` = lower(hex(randomblob(16))) WHERE `share_token` IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `gift_subscriptions_share_idx` ON `gift_subscriptions` (`share_token`);