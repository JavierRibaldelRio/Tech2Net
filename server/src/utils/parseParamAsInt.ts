import createHttpError from "http-errors";

/**
 * Parses a string as an integer. Throws an HTTP 400 error if the input is not a valid integer.
 *
 * @param {string} n - The string to parse as an integer.
 * @returns {number} The parsed integer.
 * @throws {HttpError} If the input is not a valid integer.
 */
const parseParamAsInt = (n: string): number => {

    const parsed = Number(n);

    // If it's not a valid integer
    if (isNaN(parsed) || !Number.isInteger(parsed)) {
        throw createHttpError(400, 'Invalid input: expected an integer');
    }

    return parsed;
};

export default parseParamAsInt;