import * as adminSevice from '../service/adminsService';
import { Request, Response } from 'express';
import { ApiResponse } from '../middleware/ApiResponse';
import { NextFunction } from 'express';

export const getCurrentAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user?.adminId;
        if (!adminId) throw new Error("Unauthorized");
        const admin = await adminSevice.getAdminById(adminId);
        res.status(200).json(ApiResponse.success("Admin fetched successfully", admin));
    } catch (error) {
        next(error);
    }
};

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const dto = req.body;
    try {
        const result = await adminSevice.loginAdmin(dto);
    res.status(200).json(ApiResponse.success("Login successful", result));
    } catch (error) {
        next(error);
    }
};

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
        const dto = req.body;
        try {
            const result = await adminSevice.createAdmin(dto);
            res.status(201).json(ApiResponse.success("Admin created successfully", result));
        }
        catch (error) {
            next(error);
        }   
    };