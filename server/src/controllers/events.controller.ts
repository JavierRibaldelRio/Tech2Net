import { Request, Response } from "express";

import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";

import { EventBackendSchema } from '../../../common/schemas/event.schema';
import { PresenterBasicData as Presenter, PresentersDataToModifySchema } from "../../../common/schemas/presenter.schema";
import { PresentersDataToModify } from "../../../common/types/Presenter.type";


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

const getPresentersOfEvent = async (eventId: number, userId: number) => {

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

    return results;
}

export const getPresenters = async (req: Request, res: Response) => {
    // Gets the eventId and user Id
    const userId = req.userId;
    const eventId = req.eventId;

    const results = await getPresentersOfEvent(eventId, userId);

    res.status(200).json(results);
}

const addPresenters = async (newPresenters: Presenter[], userId: number, eventId: number) => {
    // Adds the new presenters to the database removing the temp ids
    await prisma.presenters.createMany({
        data: newPresenters.map(presenter => ({
            userId: userId,
            eventId: eventId,
            name: presenter.name,
            email: presenter.email,
            organization: presenter.organization,
            description: presenter.description
        }))
    });
}

const editPresenters = async (editedPresenters: Presenter[], userId: number, eventId: number) => {

    // Uses promises

    const promises = editedPresenters.map(presenter => prisma.presenters.update({
        where: {
            id: presenter.id,
            userId: userId,
            eventId: eventId
        },
        data: {
            name: presenter.name,
            email: presenter.email,
            organization: presenter.organization,
            description: presenter.description
        }
    }));

    await Promise.all(promises);
}

const removePresenters = async (removedPresenters: number[], userId: number, eventId: number) => {
    // Removes the presenters from the database
    await prisma.presenters.deleteMany({
        where: {
            id: { in: removedPresenters },
            userId: userId,
            eventId: eventId
        }
    });
}
// Modify Presenters
export const modifyPresenters = async (req: Request, res: Response) => {
    // Gets the eventId and user Id
    const userId = req.userId;
    const eventId = req.eventId;


    // Get presenters data

    const data = PresentersDataToModifySchema.parse(req.body);

    await addPresenters(data.newPresenters, userId, eventId);
    await editPresenters(data.editedPresenters, userId, eventId);
    await removePresenters(data.removedPresenters, userId, eventId);

    const updatedPresenters = await getPresentersOfEvent(eventId, userId);

    res.status(200).json({
        message: 'Presenters modified successfully',
        presenters: updatedPresenters
    });
}