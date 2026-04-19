import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as productDiscountService from "../service/productDiscountService";

export const getAllProductDiscounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productDiscountService.getAllProductDiscounts();
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const getProductDiscountById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const result = await productDiscountService.getProductDiscountById(id);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const getProductDiscountsByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const result = await productDiscountService.getProductDiscountsByProductId(productId);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const createProductDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.body;
        const result = await productDiscountService.createProductDiscount(dto);
        res.status(201).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const updateProductDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const dto = req.body;
        const result = await productDiscountService.updateProductDiscount(id, dto);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const toggleProductDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const result = await productDiscountService.toggleProductDiscount(id);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const deleteProductDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        await productDiscountService.deleteProductDiscount(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
