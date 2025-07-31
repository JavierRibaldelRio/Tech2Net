import { Request, Response } from "express";
import prisma from "../prisma/client";


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


    res.send("");
}