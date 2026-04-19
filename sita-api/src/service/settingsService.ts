import { NotFoundError } from "../errors/appErrors";
import { UpdateSettingDto } from "../dtos/settings/settingsDto";
import { createServiceLogger } from "../utils/serviceLogger";
import { settingsRepository } from "../repository";

const logger = createServiceLogger("SettingsService");

const parseSettingValue = (val: string | null) => {
    if (val === "true") return true;
    if (val === "false") return false;
    if (val !== null && !isNaN(Number(val))) return Number(val);
    return val;
};

export const getSettingByKey = async (key: string) => {
    logger.info("Get setting by key", { key });

    const settingRow = await settingsRepository.findSettingByKey(key);
    if (!settingRow) {
        logger.warn("Get setting by key failed: not found", { key });
        throw new NotFoundError(`Setting key ${key} not found`);
    }

    return {
        key: settingRow.settingKey,
        value: parseSettingValue(settingRow.settingValue)
    };
};

export const updateSetting = async (key: string, dto: UpdateSettingDto) => {
    logger.info("Update setting started", { key });

    const settingRow = await settingsRepository.findSettingByKey(key);
    
    if (settingRow) {
        await settingsRepository.updateSettingByKey(key, String(dto.value));
    } else {
       logger.warn("Update setting failed: not found", { key });
       throw new NotFoundError(`Setting key ${key} not found`);
    }
    return {
        key,
        value: parseSettingValue(String(dto.value))
    };
};
