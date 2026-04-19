import {AppError} from "../errors/appErrors";
import {Request, Response, NextFunction} from "express";
import { ApiResponse } from "../utils/ApiResponse";
export const errorMiddleware = (err: unknown, req: Request, res: Response, next: NextFunction) => {

      const errorWithStatus = err as { statusCode?: number; message?: string };
      if (typeof errorWithStatus?.statusCode === "number") {
        res.status(errorWithStatus.statusCode).json(ApiResponse.error(errorWithStatus.message ?? "Error"));
        return;
      }

      if (err instanceof AppError) {
        res.status(err.statusCode).json(ApiResponse.error(err.message));
        return;
      } 

      console.error("Unexpected error:", err);

      res.status(500).json(ApiResponse.error("Internal Server Error"));
}