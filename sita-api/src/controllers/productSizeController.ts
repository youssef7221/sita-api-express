import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as productSizeService from "../service/productSizeService";

export const addProductSize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const dto = req.body;
        const result = await productSizeService.addProductSize(productId, dto);
        res.status(201).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const updateProductSize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const sizeId = Number(req.params.sizeId);
        const dto = req.body;
        const result = await productSizeService.updateProductSize(productId, sizeId, dto);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const deleteProductSize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const sizeId = Number(req.params.sizeId);
        const result = await productSizeService.deleteProductSize(productId, sizeId);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};
