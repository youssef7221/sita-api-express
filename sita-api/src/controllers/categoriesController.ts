import * as categoriesService from '../service/categoriesService';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { getPagination } from '../utils/paginations';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, perPage, skip } = getPagination(req.query);

        const { data, total } = await categoriesService.getAllCategories(perPage, skip);
        const totalPages = Math.ceil(total / perPage);

        res.status(200).json(ApiResponse.success(data, {
            page,
            perPage,
            total,
            totalPages
        }));
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        const result = await categoriesService.getCategoryById(id);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.body;
        const result = await categoriesService.createCategory(dto);
        res.status(201).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }   
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        const dto = req.body;
        const result = await categoriesService.updateCategory(id, dto);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }   
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        await categoriesService.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
        next(error);
    }   
};
