import { relations } from "drizzle-orm/relations";
import { orders, orderItems, products, governorates, productDiscounts, productImages, productSales, sales, productSizes, categories } from "./schema";

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.orderId]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.productId]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	governorate: one(governorates, {
		fields: [orders.governorateId],
		references: [governorates.governorateId]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	orderItems: many(orderItems),
	productDiscounts: many(productDiscounts),
	productImages: many(productImages),
	productSales: many(productSales),
	productSizes: many(productSizes),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.categoryId]
	}),
}));

export const governoratesRelations = relations(governorates, ({many}) => ({
	orders: many(orders),
}));

export const productDiscountsRelations = relations(productDiscounts, ({one}) => ({
	product: one(products, {
		fields: [productDiscounts.productId],
		references: [products.productId]
	}),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.productId]
	}),
}));

export const productSalesRelations = relations(productSales, ({one}) => ({
	product: one(products, {
		fields: [productSales.productId],
		references: [products.productId]
	}),
	sale: one(sales, {
		fields: [productSales.saleId],
		references: [sales.saleId]
	}),
}));

export const salesRelations = relations(sales, ({many}) => ({
	productSales: many(productSales),
}));

export const productSizesRelations = relations(productSizes, ({one}) => ({
	product: one(products, {
		fields: [productSizes.productId],
		references: [products.productId]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));