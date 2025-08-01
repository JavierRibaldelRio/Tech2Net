import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

import { JWT_SECRET } from '../config';

// Extend the Request interface to include userId
declare module 'express-serve-static-core' {
    interface Request {
        userId?: number;
    }
}



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