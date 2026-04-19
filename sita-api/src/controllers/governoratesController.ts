import * as governRatesService from "../service/governoratesService";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
export const getAllGovernRates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await governRatesService.getAllGovernorates();
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const getGovernRateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        const result = await governRatesService.getGovernorateById(id);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};
    export const updateGovernRate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            const shipping = req.body.ShippingFee;
            const result = await governRatesService.updateGovernorate(id, shipping);
            res.status(200).json(ApiResponse.success(result));
        } catch (error) {
            next(error);
        }   
        };  
