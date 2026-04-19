import { eq } from "drizzle-orm";
import { db } from "../db";
import { settings } from "../db/drizzle/schema";

export const findSettingByKey = async (key: string) => {
    const rows = await db.select().from(settings).where(eq(settings.settingKey, key)).limit(1);
    return rows[0];
};

export const updateSettingByKey = async (key: string, settingValue: string) => {
    return db.update(settings)
        .set({ settingValue })
        .where(eq(settings.settingKey, key));
};
