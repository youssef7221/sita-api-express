CREATE TABLE `admins` (
	`admin_id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `admins_admin_id` PRIMARY KEY(`admin_id`),
	CONSTRAINT `username` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`category_id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` tinytext,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `categories_category_id` PRIMARY KEY(`category_id`),
	CONSTRAINT `slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `governorates` (
	`governorate_id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`shipping_fee` decimal(10,2) NOT NULL,
	CONSTRAINT `governorates_governorate_id` PRIMARY KEY(`governorate_id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`order_item_id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`product_id` int NOT NULL,
	`size` varchar(10) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unit_price` decimal(10,2) NOT NULL,
	`old_price` decimal(10,2),
	CONSTRAINT `order_items_order_item_id` PRIMARY KEY(`order_item_id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`order_id` int AUTO_INCREMENT NOT NULL,
	`order_ref` varchar(20) NOT NULL,
	`customer_first_name` varchar(100) NOT NULL,
	`customer_last_name` varchar(100) NOT NULL,
	`customer_phone` varchar(20) NOT NULL,
	`governorate_id` int,
	`address` tinytext NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`shipping_fee` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`payment_method` tinytext NOT NULL,
	`payment_type` tinytext NOT NULL,
	`screenshot_url` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_order_id` PRIMARY KEY(`order_id`),
	CONSTRAINT `order_ref` UNIQUE(`order_ref`)
);
--> statement-breakpoint
CREATE TABLE `product_discounts` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`active` tinyint NOT NULL DEFAULT 1,
	`created_at` datetime(6),
	`discount_percentage` decimal(5,2),
	`discounted_price` decimal(10,2),
	`end_date` datetime(6) NOT NULL,
	`start_date` datetime(6) NOT NULL,
	`updated_at` datetime(6),
	`product_id` int NOT NULL,
	CONSTRAINT `product_discounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`image_id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`is_primary` tinyint NOT NULL DEFAULT 0,
	`display_order` int DEFAULT 0,
	CONSTRAINT `product_images_image_id` PRIMARY KEY(`image_id`)
);
--> statement-breakpoint
CREATE TABLE `product_sales` (
	`product_id` int NOT NULL,
	`sale_id` int NOT NULL,
	`custom_price` decimal(10,2),
	CONSTRAINT `product_sales_product_id_sale_id` PRIMARY KEY(`product_id`,`sale_id`)
);
--> statement-breakpoint
CREATE TABLE `product_sizes` (
	`size_id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`size_name` varchar(10) NOT NULL,
	`stock_qty` int DEFAULT 0,
	CONSTRAINT `product_sizes_size_id` PRIMARY KEY(`size_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`product_id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` tinytext,
	`price` decimal(10,2) NOT NULL,
	`category_id` int NOT NULL,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_product_id` PRIMARY KEY(`product_id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`sale_id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`discount_percent` decimal(5,2),
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sales_sale_id` PRIMARY KEY(`sale_id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(50),
	`setting_value` varchar(50),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sizeChart` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`chart_url` varchar(500) NOT NULL,
	CONSTRAINT `sizeChart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_governorate_id_governorates_governorate_id_fk` FOREIGN KEY (`governorate_id`) REFERENCES `governorates`(`governorate_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_discounts` ADD CONSTRAINT `product_discounts_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_sales` ADD CONSTRAINT `product_sales_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_sales` ADD CONSTRAINT `product_sales_sale_id_sales_sale_id_fk` FOREIGN KEY (`sale_id`) REFERENCES `sales`(`sale_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_sizes` ADD CONSTRAINT `product_sizes_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sizeChart` ADD CONSTRAINT `sizeChart_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `product_id` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `governorate_id` ON `orders` (`governorate_id`);--> statement-breakpoint
CREATE INDEX `idx_product_images_product` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_sales_product` ON `product_sales` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_sales_sale` ON `product_sales` (`sale_id`);--> statement-breakpoint
CREATE INDEX `product_id` ON `product_sizes` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_products_active` ON `products` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_products_category` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_category_active` ON `products` (`category_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `idx_sales_dates` ON `sales` (`start_date`,`end_date`);