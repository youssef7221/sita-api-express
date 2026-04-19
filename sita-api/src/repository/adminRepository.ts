import { eq } from "drizzle-orm";
import { db } from "../db";
import { admins } from "../db/drizzle/schema";

export const findAdminByUsername = async (username: string) => {
    const rows = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    return rows[0];
};

export const findAdminById = async (adminId: number) => {
    const rows = await db.select().from(admins).where(eq(admins.adminId, adminId)).limit(1);
    return rows[0];
};

export const insertAdmin = async (username: string, passwordHash: string) => {
    return db.insert(admins).values({ username, passwordHash });
};
