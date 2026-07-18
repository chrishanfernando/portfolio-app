ALTER TABLE `assets` ADD `mer_bps` integer;--> statement-breakpoint
ALTER TABLE `profiles` ADD `comparison_advisor_name` text DEFAULT 'Stockspot' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `comparison_advisor_fee_bps` integer DEFAULT 66 NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `fee_aud` real;