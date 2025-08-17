import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import parseParamAsInt from "../utils/parseParamAsInt";
import prisma from "../prisma/client";

/**
 * Extends Express Request interface to include eventId property.
 */
declare module 'express-serve-static-core' {
    interface Request {
        eventId: number;
    }
}

/**
 * Middleware to verify the existence of an event and ownership by the current user.
 * 
 * - Parses eventId from request parameters.
 * - Checks if the event exists in the database.
 * - Checks if the requesting user is the owner of the event.
 * - Attaches eventId to the request object if verification passes.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {HttpError} 404 if event is not found
 * @throws {HttpError} 403 if user is not the owner of the event
 */
const verificateEvent = async (req: Request, res: Response, next: NextFunction) => {
    const eventId = parseParamAsInt(req.params.eventId);

    // Checks if the event exists
    const exists = await prisma.event.findUnique({
        where: { id: eventId }
    });

    if (!exists) {
        throw createHttpError(404, "Event not found");
    }

    // Checks if the user is the owner of the event
    if (exists.userId !== req.userId) {
        throw createHttpError(403, "You are not the owner of this event");
    }

    req.eventId = eventId;

    next();
}

export default verificateEvent;