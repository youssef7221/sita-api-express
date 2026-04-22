import { LoginDto, RegisterDto } from "../dtos/auth/authDto";
import bcrypt from "bcrypt";
import { ExistsAlready, NotFoundError, UnauthorizedError } from "../errors/appErrors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createServiceLogger } from "../utils/serviceLogger";
import {adminRepository} from "../repository";
dotenv.config();

const logger = createServiceLogger("AdminsService");

export const loginAdmin = async (dto : LoginDto) => {
    logger.info("Admin login started", { username: dto.username });

    const admin = await adminRepository.findAdminByUsername(dto.username);
    const isPasswordValid = admin ? await bcrypt.compare(dto.password, admin.passwordHash) : false;
    if (!admin || !isPasswordValid) {
        logger.warn("Admin login failed: invalid username or password", { username: dto.username });
        throw new UnauthorizedError("Invalid username or password");
    }
    const token = jwt.sign(
        { adminId: admin.adminId }, 
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );
    const { passwordHash, createdAt, ...userWithoutPassword } = admin;
    logger.info("Admin login succeeded", { adminId: userWithoutPassword.adminId, username: dto.username });
    return { ...userWithoutPassword, token };
}

export const getAdminByUsername = async (username: string) => {
    logger.info("Get admin by username", { username });
    return adminRepository.findAdminByUsername(username);
}

export const getAdminById = async (adminId: number) => {
    logger.info("Get admin by id", { adminId });
    const admin = await adminRepository.findAdminById(adminId);
    if (!admin) {
        logger.warn("Get admin by id failed: not found", { adminId });
        throw new NotFoundError("Admin not found");
    }
    const { passwordHash, ...adminWithoutPassword } = admin;
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
    const [admin] = await adminRepository.insertAdmin(dto.username, passwordHash);
    
    return {
        adminId: admin.insertId,
        username: dto.username
    };
    
}
