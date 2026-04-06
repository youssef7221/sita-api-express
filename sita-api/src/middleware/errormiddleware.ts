import {AppError} from "../errors/appErrors";
import {Request, Response, NextFunction} from "express";
import { ApiResponse } from "./ApiResponse";
export const errorMiddleware = (err: AppError, req: Request, res: Response, next: NextFunction) => {

      if (err instanceof AppError) {
        res.status(err.statusCode).json(ApiResponse.error(err.message));
        return;
      } 

      console.error("Unexpected error:", err);

      res.status(500).json(ApiResponse.error("Internal Server Error"));
}