import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import ms from 'ms'

import prisma from '../prisma/client';
import { User } from '@prisma/client';

import { userRegistrationSchema } from '../../../common/schemas/user.schema';

import { COOKIE_DOMAIN, JWT_SECRET, JWT_TOKEN_TIME, NODE_ENV } from '../config';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

const EXPIRE: number = ms(JWT_TOKEN_TIME) || ms("24h");


// The routes where de cookie might be send
const COOKIE_PATH = "/";

// Defines the paylod as so the time for expiration
const generateToken = (user: User): string => {

    //! USER INCLUDES PASSWORD, do not pass user object
    return jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: EXPIRE
    });
};

/**
 * Sets the authentication cookie in the response.
 * 
 * @param {Response} res - Express response object
 * @param {string} token - JWT token to set in cookie
 */
const setAuthCookie = (res: Response, token: string): void => {

    res.cookie('authToken', token, {

        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: EXPIRE,
        domain: COOKIE_DOMAIN,

        path: COOKIE_PATH
        //path: '/api/user/'
    });
}

/**
 * Registers a new user, sets authentication cookie, and returns a success message.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @throws {HttpError} 409 if user already exists
 * @returns {Promise<void>}
 */
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

    setAuthCookie(res, token);

    res.status(201).json({
        message: 'User registered sucessfully',
    });
}


/**
 * Authenticates a user with email and password, sets authentication cookie, and returns a success message.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @throws {HttpError} 400 if credentials are invalid
 * @returns {Promise<Response>}
 */
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

    const token = generateToken(user);

    // Generation of the cookie
    setAuthCookie(res, token);


    return res.status(202).json({
        message: 'Log in was sucessfull'
    });
};


/**
 * Logs out the user by clearing the authentication cookie.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const logoutUser = async (req: Request, res: Response) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: COOKIE_PATH,
        sameSite: 'strict'
    });

    res.status(200).json({ message: 'Log out succesful' });
};