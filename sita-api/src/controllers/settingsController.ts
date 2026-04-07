import * as settingsService from '../service/settingsService';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../middleware/ApiResponse';

export const getSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.params.key as string;
        const result = await settingsService.getSettingByKey(key);
    
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const updateSetting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.params.key as string;
        const dto = req.body;
        const result = await settingsService.updateSetting(key, dto);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }   
};
