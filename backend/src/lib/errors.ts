/**
 * Custom application error class
 * Provides structured error responses with HTTP status codes
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string): AppError {
        return new AppError(message, 400);
    }

    static unauthorized(message = 'Unauthorized'): AppError {
        return new AppError(message, 401);
    }

    static forbidden(message = 'Forbidden'): AppError {
        return new AppError(message, 403);
    }

    static notFound(message = 'Not found'): AppError {
        return new AppError(message, 404);
    }

    static conflict(message: string): AppError {
        return new AppError(message, 409);
    }

    static internal(message = 'Internal server error'): AppError {
        return new AppError(message, 500, false);
    }
}
