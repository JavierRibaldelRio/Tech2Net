import type { StringValue } from 'ms';

//Dotenv configuration
import dotenv from 'dotenv';
dotenv.config();


/**
 * Retrieves the value of an environment variable.
 * Throws an error if the variable is not defined.
 * 
 * @param {string} name - The name of the environment variable
 * @returns {string} The value of the environment variable
 * @throws {Error} If the environment variable is not defined
 */
function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not defined`);
    }
    return value;
}

// Get the JWT secret from environment variables
/**
 * JWT secret used for signing tokens.
 * @type {string}
 */
export const JWT_SECRET: string = getEnvVar('JWT_SECRET');

/**
 * JWT token expiration time (e.g., "24h").
 * @type {StringValue}
 */
export const JWT_TOKEN_TIME: StringValue = getEnvVar('JWT_TOKEN_TIME') as StringValue;

/**
 * Frontend URL for CORS and redirects.
 * @type {string}
 */
export const FRONTEND_URL: string = getEnvVar('FRONTEND_URL');

/**
 * Domain for setting cookies.
 * @type {string}
 */
export const COOKIE_DOMAIN: string = getEnvVar('COOKIE_DOMAIN');

/**
 * Node environment (e.g., "development", "production").
 * @type {string}
 */
export const NODE_ENV: string = getEnvVar('NODE_ENV');


