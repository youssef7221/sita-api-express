import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "../../../postsapi/src/errors/appErrors";

export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((err) => err.message).join(", ");
      next(new ValidationError(message));
      return;
    }

    req.body = result.data;
    next();
  };
};