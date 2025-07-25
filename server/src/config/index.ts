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

