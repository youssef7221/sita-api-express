import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as sizeChartService from "../service/sizeChartService";

export const createSizeChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const file = req.file as Express.Multer.File;
        const result = await sizeChartService.createSizeChart({ productId }, file);
        res.status(201).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const updateSizeChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const file = req.file as Express.Multer.File;
        const result = await sizeChartService.updateSizeChart({ productId }, file);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const getSizeChartByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const result = await sizeChartService.getSizeChartByProductId(productId);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const deleteSizeChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const result = await sizeChartService.deleteSizeChart(productId);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};
