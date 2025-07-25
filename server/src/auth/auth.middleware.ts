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

    // Removes "Bearer " prefix from the token 
    const token = req.headers['authorization']?.split(' ')[1];

    // Checks if there is token
    if (!token) {

        throw createHttpError(401, 'Access Denied: token missing')
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as { userId: number };
        req.userId = decoded.userId;

        next();
    } catch (error) {
        throw createHttpError(401, 'Invalid Token')
    }
};