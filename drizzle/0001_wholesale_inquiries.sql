CREATE TABLE `wholesale_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_name` text NOT NULL,
	`business_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`business_type` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`intended_use` text DEFAULT '' NOT NULL,
	`quantity` text DEFAULT '' NOT NULL,
	`start_date` text DEFAULT '' NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `wholesale_inquiries_created_idx` ON `wholesale_inquiries` (`created_at`);