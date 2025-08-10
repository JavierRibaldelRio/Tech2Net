import { Request, Response } from "express";
import createHttpError from "http-errors";

import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";

import { EventBackendSchema } from '../../../common/schemas/event.schema';
import { PresenterBasicData as Presenter } from "../../../common/schemas/presenter.schema";

import parseParamAsInt from "../utils/parseParamAsInt";


export const getEvents = async (req: Request, res: Response) => {

    const userId = req.userId;

    // Gets the name and the starting_time

    const results = await prisma.event.findMany({

        where: { userId: userId },
        orderBy: { eventStartTime: "desc" },
        select: {
            id: true,
            title: true,
            eventStartTime: true,
        }
    });

    res.status(200).json(results);
}

export const createEvent = async (req: Request, res: Response) => {

    const userId = req.userId;


    // Check if the input is correct
    let eventData = EventBackendSchema.parse(req.body);


    const now = new Date();

    // Creates the new event
    const newEvent = await prisma.event.create({

        data: {

            ...eventData,
            createdAt: now,
            updatedAt: now,
            userId: userId as number,
            eventSummaryData: {} as Prisma.JsonObject,
        },

    });

    // Returns that all was OK
    res.status(201).json({
        message: 'Event registered sucessfully',
    });

}

export const getPresenters = async (req: Request, res: Response) => {

    const userId = req.userId;


    // Gets the eventId and user Id
    const eventId = parseParamAsInt(req.params.eventId);

    // Checks if the event exists

    const exists = await prisma.event.findUnique({
        where: { id: eventId }
    });

    if (!exists) {
        throw createHttpError(404, "Event not found");
    }


    const results: Presenter[] = await prisma.presenters.findMany({
        where: {
            userId: userId,
            eventId: eventId
        },
        orderBy: { id: "asc" },
        select: {
            id: true,
            name: true,
            email: true,
            organization: true,
            description: true
        }
    });

    res.status(200).json(results);
}