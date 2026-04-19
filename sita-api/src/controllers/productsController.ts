import * as productService from "../service/productsService";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { getPagination } from "../utils/paginations";


export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, perPage, skip } = getPagination(req.query);

        let isActive: boolean | undefined;
        if (req.query.isActive === "true") {
            isActive = true;
        } else if (req.query.isActive === "false") {
            isActive = false;
        }

        const { data, total } = await productService.getAllProducts(perPage, skip, isActive, req.query.search as string);
        const totalPages = Math.ceil(total / perPage);

        res.status(200).json(ApiResponse.success(data, {
            page,
            perPage,
            total,
            totalPages,
            isActive,
        }));
    } catch (err) {
        next(err);
    }   
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const product = await productService.getProductById(id);

        res.status(200).json(ApiResponse.success(product));
    } catch (err) {
        next(err);
    }
};

export const getProductsByCategoryId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, perPage, skip } = getPagination(req.query);
        const categoryId = Number(req.params.categoryId);
        const { data, total } = await productService.getProductsByCategoryId(categoryId, perPage, skip);
        const totalPages = Math.ceil(total / perPage);

        res.status(200).json(ApiResponse.success(data, {
            page,
            perPage,
            total,
            totalPages,
        }));
    } catch (err) {
        next(err);
    }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.body;
        const result = await productService.createProduct(dto);
        res.status(201).json(ApiResponse.success(result));
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const dto = req.body;
        const result = await productService.updateProduct(id, dto);
        res.status(200).json(ApiResponse.success(result));
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        await productService.deleteProduct(id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export const changeProductActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const dto = req.body;
        const result = await productService.changeProductActivity(id, dto);
        res.status(200).json(ApiResponse.success(result));
    } catch (err) {
        next(err);
    }
};