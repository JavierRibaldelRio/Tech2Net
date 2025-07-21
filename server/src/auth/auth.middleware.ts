import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

    if (!token) return res.status(401).json({ error: 'Access Denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as { userId: number };
        req.userId = decoded.userId;

        next();
    } catch (error) {
        console.error("Error: " + error);
        res.status(401).json({ error: 'Invalid Token' });
    }
};