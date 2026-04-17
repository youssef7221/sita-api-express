import { db } from "../db";
import { governorates } from "../db/drizzle/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../errors/appErrors";
import { createServiceLogger } from "../utils/serviceLogger";

const logger = createServiceLogger("GovernoratesService");

export const getAllGovernorates = async () => {
    logger.info("Get all governorates");
    return db.select().from(governorates);
};

export const getGovernorateById = async (id: number) => {
    logger.info("Get governorate by id", { governorateId: id });

    const result = await db.select()
        .from(governorates)
        .where(eq(governorates.governorateId, id))
        .limit(1);
    if (!result[0]) {
        logger.warn("Get governorate by id failed: not found", { governorateId: id });
        throw new NotFoundError("Governorate not found");
    }
    return result[0];
};

export const updateGovernorate = async (id: number, shipping_fees: number) => {
    logger.info("Update governorate started", { governorateId: id, shippingFee: shipping_fees });

    await getGovernorateById(id);
    await db.update(governorates)
        .set({ shippingFee: shipping_fees.toString() })
        .where(eq(governorates.governorateId, id));
};