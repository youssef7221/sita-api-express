import { z } from "zod";

export const CreateOrderItemSchema = z.object({
	productId: z.coerce.number().int().positive("productId must be a positive integer"),
	sizeId: z.coerce.number().int().positive("sizeId must be a positive integer"),
	quantity: z.coerce.number().int().positive("quantity must be a positive integer"),
});

export const CreateOrderSchema = z.object({
	customerFirstName: z.string().min(1, "customerFirstName is required").max(100),
	customerLastName: z.string().min(1, "customerLastName is required").max(100),
	customerPhone: z.string().min(1, "customerPhone is required").max(20),
	address: z.string().min(1, "address is required"),
	governorateId: z.coerce.number().int().positive("governorateId must be a positive integer"),
	paymentMethod: z.string().min(1, "paymentMethod is required"),
	paymentType: z.string().min(1, "paymentType is required"),
	items: z.array(CreateOrderItemSchema).min(1, "At least one item is required"),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type CreateOrderItemDto = z.infer<typeof CreateOrderItemSchema>;

type FormDataValue = string | string[] | undefined;

const getFirstValue = (value: FormDataValue) => {
	if (Array.isArray(value)) return value[0];
	return value;
};

export const normalizeCreateOrderFormData = (body: Record<string, FormDataValue>) => {
	const itemsMap = new Map<number, { productId?: string; sizeId?: string; quantity?: string }>();

	for (const [key, rawValue] of Object.entries(body)) {
		const match = key.match(/^items\[(\d+)\]\.(productId|sizeId|quantity)$/);
		if (!match) continue;

		const index = Number(match[1]);
		const field = match[2] as "productId" | "sizeId" | "quantity";
		const value = getFirstValue(rawValue);

		if (!itemsMap.has(index)) {
			itemsMap.set(index, {});
		}

		itemsMap.get(index)![field] = value;
	}

	const items = Array.from(itemsMap.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([, item]) => ({
			productId: item.productId,
			sizeId: item.sizeId,
			quantity: item.quantity,
		}));

	return {
		customerFirstName: getFirstValue(body.customerFirstName),
		customerLastName: getFirstValue(body.customerLastName),
		customerPhone: getFirstValue(body.customerPhone),
		address: getFirstValue(body.address),
		governorateId: getFirstValue(body.governorateId),
		paymentMethod: getFirstValue(body.paymentMethod),
		paymentType: getFirstValue(body.paymentType),
		items,
	};
};

export type OrderResponseItemDto = {
	productId: number;
	productName: string;
	size: string;
	quantity: number;
	unitPrice: number;
	oldPrice: number | null;
};

export type OrderResponseDto = {
	id: number;
	orderRef: string;
	customerFirstName: string;
	customerLastName: string;
	customerPhone: string;
	address: string;
	governorateName: string | null;
	paymentMethod: string;
	paymentType: string;
	screenshotUrl: string | null;
	subtotal: number;
	shippingFee: number;
	total: number;
	items: OrderResponseItemDto[];
	createdAt: string | null;
};
    
