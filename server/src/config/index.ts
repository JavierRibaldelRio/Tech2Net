import type { StringValue } from 'ms';

//Dotenv configuration
import dotenv from 'dotenv';
dotenv.config();


function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not defined`);
    }
    return value;
}

// Get the JWT secret from environment variables
export const JWT_SECRET: string = getEnvVar('JWT_SECRET');
export const JWT_TOKEN_TIME: StringValue = getEnvVar('JWT_TOKEN_TIME') as StringValue;
export const FRONTEND_URL: string = getEnvVar('FRONTEND_URL');
export const COOKIE_DOMAIN: string = getEnvVar('COOKIE_DOMAIN');
export const NODE_ENV: string = getEnvVar('NODE_ENV');


