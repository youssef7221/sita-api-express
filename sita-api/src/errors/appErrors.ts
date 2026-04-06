// errors/appErrors.ts

import e from "express";

export class AppError extends Error {
    public readonly statusCode: number;
    
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, message);
    }
}

export class ExistsAlready extends AppError {
    constructor(message: string) {
        super(409, message);
    }
}
export class ValidationError extends AppError {
    constructor(message: string) {
        super(422, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(401, message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string) {
        super(403, message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message);
    }
}

export class ThisItemConnectedWithOtherItemError extends AppError {
    constructor(message: string) {
        super(400, message);
    }
}
export class BadRequestError extends AppError {
    constructor(message: string) {
        super(400, message);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string) {
        super(500, message);
    }
}