import {db} from "../db";
import {admins} from "../db/drizzle/schema";
import {eq} from "drizzle-orm";
import { LoginDto, RegisterDto } from "../dtos/auth/authDto";
import bcrypt from "bcrypt";
import { ExistsAlready, NotFoundError, UnauthorizedError } from "../../../postsapi/src/errors/appErrors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const loginAdmin = async (dto : LoginDto) => {
    const admin = await db.select().from(admins).where(eq(admins.username, dto.username)).limit(1);
    if (!admin[0]) {
        throw new UnauthorizedError("Invalid username or password");
    };
    const token = jwt.sign(
        { adminId: admin[0].adminId }, 
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );
    const { passwordHash, createdAt, ...userWithoutPassword } = admin[0];
    return { ...userWithoutPassword, token };
}

export const getAdminByUsername = async (username: string) => {
    const admin = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    return admin[0];
}

export const getAdminById = async (adminId: number) => {
    const admin = await db.select().from(admins).where(eq(admins.adminId, adminId)).limit(1);
    const { passwordHash, ...adminWithoutPassword } = admin[0];
    return adminWithoutPassword;
}

export const createAdmin = async (dto : RegisterDto)=> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.username) {
        const existingAdmin = await getAdminByUsername(dto.username);
        if (existingAdmin) {
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
