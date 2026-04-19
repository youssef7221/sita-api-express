import { eq } from "drizzle-orm";
import { db } from "../db";
import { governorates } from "../db/drizzle/schema";

export const findAllGovernorates = async () => {
    return db.select().from(governorates);
};

export const findGovernorateById = async (id: number) => {
    const rows = await db.select()
        .from(governorates)
        .where(eq(governorates.governorateId, id))
        .limit(1);
    return rows[0];
};

export const updateGovernorateShippingFeeById = async (id: number, shippingFee: string) => {
    return db.update(governorates)
        .set({ shippingFee })
        .where(eq(governorates.governorateId, id));
};
