import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import prisma from '../prisma/client';
import { userRegistrationSchema } from '../schemas/user.schema';

//Dotenv configuration
import dotenv from 'dotenv';
dotenv.config();

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;



if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

//Creates user and returns its token 
export const registerUser = async (req: Request, res: Response) => {


    const { username, email, name, surnames, password } = userRegistrationSchema.parse(req.body);

    // Check if user already exists 
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw createHttpError(409, 'User already exists')
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user & return it except password
    const newUser = await prisma.user.create({
        data: {
            username,
            email,
            name,
            surnames,
            password: hashedPassword,
            createdAt: new Date(),
        },
        select: {
            id: true,
            email: true,
            username: true,
            name: true,
            surnames: true,
            createdAt: true
        }
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
        expiresIn: '24h'
    });


    res.status(201).json({
        message: 'User registered sucessfully',
        token,
        user: newUser
    });
}


// Given the email & password, returns token
export const loginUser = async (req: Request, res: Response) => {

    const { email, password } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({
        where: { email }
    });

    // If is not register or the password not mat
    if (!user || !(await bcrypt.compare(password, user.password))) {

        throw createHttpError(400, 'Invalid credentials');
    }

    // Define el payload
    const token = jwt.sign({ userId: user.id, }, JWT_SECRET, {
        expiresIn: '24h'
    });

    return res.status(202).json({ token, user: { id: user.id, email: user.email } });
};


