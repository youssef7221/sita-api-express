import {db} from "../db";
import {admins} from "../db/drizzle/schema";
import {eq} from "drizzle-orm";
import { LoginDto, RegisterDto } from "../dtos/auth/authDto";
import bcrypt from "bcrypt";
import { ExistsAlready, NotFoundError, UnauthorizedError } from "../errors/appErrors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createServiceLogger } from "../utils/serviceLogger";

dotenv.config();

const logger = createServiceLogger("AdminsService");

export const loginAdmin = async (dto : LoginDto) => {
    logger.info("Admin login started", { username: dto.username });

    const admin = await db.select().from(admins).where(eq(admins.username, dto.username)).limit(1);
    if (!admin[0]) {
        logger.warn("Admin login failed: username not found", { username: dto.username });
        throw new UnauthorizedError("Invalid username or password");
    };
    const token = jwt.sign(
        { adminId: admin[0].adminId }, 
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );
    const { passwordHash, createdAt, ...userWithoutPassword } = admin[0];
    logger.info("Admin login succeeded", { adminId: userWithoutPassword.adminId, username: dto.username });
    return { ...userWithoutPassword, token };
}

export const getAdminByUsername = async (username: string) => {
    logger.info("Get admin by username", { username });
    const admin = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    return admin[0];
}

export const getAdminById = async (adminId: number) => {
    logger.info("Get admin by id", { adminId });
    const admin = await db.select().from(admins).where(eq(admins.adminId, adminId)).limit(1);
    if (!admin[0]) {
        logger.warn("Get admin by id failed: not found", { adminId });
        throw new NotFoundError("Admin not found");
    }
    const { passwordHash, ...adminWithoutPassword } = admin[0];
    return adminWithoutPassword;
}

export const createAdmin = async (dto : RegisterDto)=> {
    logger.info("Create admin started", { username: dto.username });

    const passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.username) {
        const existingAdmin = await getAdminByUsername(dto.username);
        if (existingAdmin) {
            logger.warn("Create admin failed: username exists", { username: dto.username });
            throw new ExistsAlready("Admin with this username already exists");
        }
    }
    const [admin] = await db.insert(admins).values({
        username: dto.username,
        passwordHash
    });
    
    return {
        adminId: admin.insertId,
        username: dto.username
    };
    
}
