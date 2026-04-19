import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as productImageService from "../service/productImageService";
import { BadRequestError } from "../errors/appErrors";

export const uploadProductImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const files = req.files as Express.Multer.File[] | undefined;

        if (!files || files.length === 0) {
            throw new BadRequestError("At least one image is required");
        }

        const result = await productImageService.uploadProductImages(productId, files, req.body);
        res.status(201).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const imageId = Number(req.params.imageId);
        const result = await productImageService.deleteProductImage(productId, imageId);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};
