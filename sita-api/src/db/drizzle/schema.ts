import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, unique, int, varchar, timestamp, tinytext, tinyint, decimal, index, foreignKey, bigint, datetime, date } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const admins = mysqlTable("admins", {
	adminId: int("admin_id").autoincrement().notNull(),
	username: varchar({ length: 100 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.adminId], name: "admins_admin_id"}),
	unique("username").on(table.username),
]);

export const categories = mysqlTable("categories", {
	categoryId: int("category_id").autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: tinytext(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.categoryId], name: "categories_category_id"}),
	unique("slug").on(table.slug),
]);

export const governorates = mysqlTable("governorates", {
	governorateId: int("governorate_id").autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.governorateId], name: "governorates_governorate_id"}),
]);

export const orderItems = mysqlTable("order_items", {
	orderItemId: int("order_item_id").autoincrement().notNull(),
	orderId: int("order_id").notNull().references(() => orders.orderId, { onDelete: "cascade" } ),
	productId: int("product_id").notNull().references(() => products.productId),
	size: varchar({ length: 10 }).notNull(),
	quantity: int().default(1).notNull(),
	unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
	oldPrice: decimal("old_price", { precision: 10, scale: 2 }),
},
(table) => [
	index("order_id").on(table.orderId),
	index("product_id").on(table.productId),
	primaryKey({ columns: [table.orderItemId], name: "order_items_order_item_id"}),
]);

export const orders = mysqlTable("orders", {
	orderId: int("order_id").autoincrement().notNull(),
	orderRef: varchar("order_ref", { length: 20 }).notNull(),
	customerFirstName: varchar("customer_first_name", { length: 100 }).notNull(),
	customerLastName: varchar("customer_last_name", { length: 100 }).notNull(),
	customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
	governorateId: int("governorate_id").references(() => governorates.governorateId),
	address: tinytext().notNull(),
	subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
	shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).notNull(),
	total: decimal({ precision: 10, scale: 2 }).notNull(),
	paymentMethod: tinytext("payment_method").notNull(),
	paymentType: tinytext("payment_type").notNull(),
	screenshotUrl: varchar("screenshot_url", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("governorate_id").on(table.governorateId),
	primaryKey({ columns: [table.orderId], name: "orders_order_id"}),
	unique("order_ref").on(table.orderRef),
]);

export const productDiscounts = mysqlTable("product_discounts", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	// Warning: Can't parse bit(1) from database
	// bit(1)Type: bit(1)("active").notNull(),
	createdAt: datetime("created_at", { mode: 'string', fsp: 6 }),
	discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
	discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),
	endDate: datetime("end_date", { mode: 'string', fsp: 6 }).notNull(),
	startDate: datetime("start_date", { mode: 'string', fsp: 6 }).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 6 }),
	productId: int("product_id").notNull().references(() => products.productId, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "product_discounts_id"}),
]);

export const productImages = mysqlTable("product_images", {
	imageId: int("image_id").autoincrement().notNull(),
	productId: int("product_id").notNull().references(() => products.productId, { onDelete: "cascade" } ),
	imageUrl: varchar("image_url", { length: 500 }).notNull(),
	isPrimary: tinyint("is_primary").default(0).notNull(),
	displayOrder: int("display_order").default(0),
},
(table) => [
	index("idx_product_images_product").on(table.productId),
	primaryKey({ columns: [table.imageId], name: "product_images_image_id"}),
]);

export const productSales = mysqlTable("product_sales", {
	productId: int("product_id").notNull().references(() => products.productId, { onDelete: "cascade" } ),
	saleId: int("sale_id").notNull().references(() => sales.saleId, { onDelete: "cascade" } ),
	customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
},
(table) => [
	index("idx_product_sales_product").on(table.productId),
	index("idx_product_sales_sale").on(table.saleId),
	primaryKey({ columns: [table.productId, table.saleId], name: "product_sales_product_id_sale_id"}),
]);

export const productSizes = mysqlTable("product_sizes", {
	sizeId: int("size_id").autoincrement().notNull(),
	productId: int("product_id").notNull().references(() => products.productId, { onDelete: "cascade" } ),
	sizeName: varchar("size_name", { length: 10 }).notNull(),
	stockQty: int("stock_qty").default(0),
},
(table) => [
	index("product_id").on(table.productId),
	primaryKey({ columns: [table.sizeId], name: "product_sizes_size_id"}),
]);

export const products = mysqlTable("products", {
	productId: int("product_id").autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: tinytext(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	categoryId: int("category_id").notNull().references(() => categories.categoryId),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_products_active").on(table.isActive),
	index("idx_products_category").on(table.categoryId),
	index("idx_products_category_active").on(table.categoryId, table.isActive),
	primaryKey({ columns: [table.productId], name: "products_product_id"}),
]);

export const sales = mysqlTable("sales", {
	saleId: int("sale_id").autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_sales_dates").on(table.startDate, table.endDate),
	primaryKey({ columns: [table.saleId], name: "sales_sale_id"}),
]);

export const settings = mysqlTable("settings", {
	id: int().autoincrement().notNull(),
	settingKey: varchar("setting_key", { length: 50 }),
	settingValue: varchar("setting_value", { length: 50 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "settings_id"}),
]);
