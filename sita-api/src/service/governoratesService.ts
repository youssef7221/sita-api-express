import { NotFoundError } from "../errors/appErrors";
import { createServiceLogger } from "../utils/serviceLogger";
import { governorateRepository } from "../repository";

const logger = createServiceLogger("GovernoratesService");

export const getAllGovernorates = async () => {
    logger.info("Get all governorates");
    return governorateRepository.findAllGovernorates();
};

export const getGovernorateById = async (id: number) => {
    logger.info("Get governorate by id", { governorateId: id });

    const result = await governorateRepository.findGovernorateById(id);
    if (!result) {
        logger.warn("Get governorate by id failed: not found", { governorateId: id });
        throw new NotFoundError("Governorate not found");
    }
    return result;
};

export const updateGovernorate = async (id: number, shipping_fees: number) => {
    logger.info("Update governorate started", { governorateId: id, shippingFee: shipping_fees });

    await getGovernorateById(id);
    await governorateRepository.updateGovernorateShippingFeeById(id, shipping_fees.toString());
};