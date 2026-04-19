import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/appErrors";

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw new UnauthorizedError("No token provided");

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        req.user = decoded;
        next();
    } catch {
        next(new UnauthorizedError("Invalid or expired token"));
    }
};