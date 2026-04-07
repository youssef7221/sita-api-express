import { db } from "../db";
import { settings } from "../db/drizzle/schema";
import { eq } from "drizzle-orm";
import { NotFoundError, ExistsAlready } from "../errors/appErrors";
import { UpdateSettingDto } from "../dtos/settings/settingsDto";

const parseSettingValue = (val: string | null) => {
    if (val === "true") return true;
    if (val === "false") return false;
    if (val !== null && !isNaN(Number(val))) return Number(val);
    return val;
};

export const getSettingByKey = async (key: string) => {
    const settingRows = await db.select().from(settings).where(eq(settings.settingKey, key)).limit(1);
    if (!settingRows[0]) throw new NotFoundError(`Setting key ${key} not found`);

    return {
        key: settingRows[0].settingKey,
        value: parseSettingValue(settingRows[0].settingValue)
    };
};

export const updateSetting = async (key: string, dto: UpdateSettingDto) => {
    const settingRows = await db.select().from(settings).where(eq(settings.settingKey, key)).limit(1);
    
    if (settingRows[0]) {
        await db.update(settings)
            .set({ settingValue: String(dto.value) })
            .where(eq(settings.settingKey, key));
    } else {
       throw new NotFoundError(`Setting key ${key} not found`);
    }
    return {
        key,
        value: parseSettingValue(String(dto.value))
    };
};
