import { Request, Response, NextFunction } from "express";

import createHttpError from "http-errors";
import { EventBackendSchema } from '../../../common/schemas/event.schema';
import parseParamAsInt from "../utils/parseParamAsInt";
import prisma from "../prisma/client";

declare module 'express-serve-static-core' {
    interface Request {
        eventId: number;
    }
}

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