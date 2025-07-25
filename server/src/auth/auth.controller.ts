import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import prisma from '../prisma/client';
import { User } from '@prisma/client';
import { userRegistrationSchema } from '../schemas/user.schema';

import { JWT_SECRET } from '../config';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

// Defines the paylod as so the time for expiration
const generateToken = (user: User): string => {

    //! USER INCLUDES PASSWORD, do not pass user object
    return jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '24h',
    });
};

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
        }
    });

    // Generate JWT token
    const token = generateToken(newUser);


    res.status(201).json({
        message: 'User registered sucessfully',
        token
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
    const token = generateToken(user);
    return res.status(202).json({
        token, message: 'Log in was sucessfull'
    });
};


