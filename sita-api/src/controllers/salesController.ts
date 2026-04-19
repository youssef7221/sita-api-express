import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as salesService from "../service/salesService";

export const getActiveSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sale = await salesService.getActiveSale();

        if (!sale) {
            res.status(204).send();
            return;
        }

        res.status(200).json(ApiResponse.success(sale));
    } catch (error) {
        next(error);
    }
};

export const getAllSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await salesService.getAllSales();
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const result = await salesService.getSaleById(id);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.body;
        const result = await salesService.createSale(dto);
        res.status(201).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const dto = req.body;
        const result = await salesService.updateSale(id, dto);
        res.status(200).json(ApiResponse.success(result));
    } catch (error) {
        next(error);
    }
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        await salesService.deleteSale(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
