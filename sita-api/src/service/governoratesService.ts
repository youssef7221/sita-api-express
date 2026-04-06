import { db } from "../db";
import { governorates } from "../db/drizzle/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../errors/appErrors";

export const getAllGovernorates = async () => {
    return db.select().from(governorates);
};

export const getGovernorateById = async (id: number) => {
    const result = await db.select()
        .from(governorates)
        .where(eq(governorates.governorateId, id))
        .limit(1);
    if (!result[0]) throw new NotFoundError("Governorate not found");
    return result[0];
};

export const updateGovernorate = async (id: number, shipping_fees: number) => {
    await getGovernorateById(id);
    await db.update(governorates)
        .set({ shippingFee: shipping_fees.toString() })
        .where(eq(governorates.governorateId, id));
};