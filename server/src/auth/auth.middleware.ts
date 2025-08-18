import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

import { JWT_SECRET } from '../config';

// Extend the Request interface to include userId
declare module 'express-serve-static-core' {
    interface Request {
        userId: number;
    }
}

/**
 * Middleware to authenticate requests using JWT stored in cookies.
 * 
 * - Checks for the presence of an authToken cookie.
 * - Verifies the JWT token using the configured secret.
 * - Attaches the decoded userId to the request object.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {HttpError} 401 if token is missing or invalid
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies.authToken;

    // Checks if there is token
    if (!token) {

        throw createHttpError(401, 'Access Denied: cookie missing')
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as { userId: number };
        req.userId = decoded.userId;

        next();
    } catch (error) {
        throw createHttpError(401, 'Invalid Token')
    }
};