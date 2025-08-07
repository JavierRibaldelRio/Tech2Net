import { Request, Response } from "express";
import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";

import { EventBackendSchema } from '../../../common/schemas/event.schema'


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

    const newEvent = await prisma.event.create({

        data: {

            ...eventData,
            createdAt: now,
            updatedAt: now,
            userId: userId as number,
            eventSummaryData: {} as Prisma.JsonObject,
        },

    });

    res.status(201).json({
        message: 'Event registered sucessfully',
    });

}