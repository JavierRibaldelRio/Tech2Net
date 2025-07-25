import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import dotenv from 'dotenv';
dotenv.config();

// Extend the Request interface to include userId
declare module 'express-serve-static-core' {
    interface Request {
        userId?: number;
    }
}

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
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