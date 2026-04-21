import { Request, Response, NextFunction } from "express";
import * as ordersService from "../service/orderService";
import { ApiResponse } from "../utils/ApiResponse";
import { getPagination } from "../utils/paginations";
import { CreateOrderSchema, normalizeCreateOrderFormData } from "../dtos/order/orderRequestDto";
import { BadRequestError, ValidationError } from "../errors/appErrors";
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, perPage, skip } = getPagination(req.query);
        const { data, total } = await ordersService.getAllOrders(perPage, skip);
        const totalPages = Math.ceil(total / perPage);
        res.json(ApiResponse.success(data, { page, perPage, total, totalPages }));
    } catch (error) {
        next(error);
    }
}

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const order = await ordersService.getOrderById(id);
        res.json(ApiResponse.success(order));
    }  catch (error) {
        next(error);
    }   
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const normalized = normalizeCreateOrderFormData(req.body as Record<string, string | string[] | undefined>);
        const validationResult = CreateOrderSchema.safeParse(normalized);

        if (!validationResult.success) {
            const message = validationResult.error.issues.map((issue) => issue.message).join(", ");
            throw new ValidationError(message);
        }

        const screenshot = req.file as Express.Multer.File | undefined;
        if (!screenshot) {
            throw new BadRequestError("screenshot is required");
        }

        const order = await ordersService.createOrder(validationResult.data, screenshot);
        res.status(201).json(ApiResponse.success(order));
    } catch (error) {
        next(error);
    }
};
