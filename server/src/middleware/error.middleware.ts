import { Response, Request, ErrorRequestHandler, NextFunction } from "express";

import { ZodError, prettifyError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { HttpError } from 'http-errors'



// Check prisma error reference: https://www.prisma.io/docs/orm/reference/error-reference#error-codes



export const errorHandler = (err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {

    console.error('[Error Handler]', err);
    // --- Handle Zod Validation Errors (400 Bad Request) ---
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation Error',
            message: prettifyError(err),
        });
    }
    // --- Handle Prisma Errors (Database Layer) ---
    if (err instanceof PrismaClientKnownRequestError) {
        // Unique constraint violation (e.g., duplicate email)
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Resource already exists',
                prismaCode: err.code,
            });
        }
        // Record not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                error: 'Not Found',
                message: 'The requested resource does not exist',
                prismaCode: err.code,
            });
        }
        // Generic Prisma error 
        return res.status(500).json({
            error: 'Database Error',
            prismaCode: err.code,
            message: err.message,
        });
    }

    // --- Handle Custom HTTP Errors ---
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            error: err.name,
            message: err.message,
        });
    }

    // --- Handle Generic JavaScript Errors (500 Internal Server Error) ---
    if (err instanceof Error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
        });
    }

    // --- Fallback for Unhandled Errors ---
    res.status(500).json({
        error: 'Unknown Error',
        message: 'An unexpected error occurred',
    });


}