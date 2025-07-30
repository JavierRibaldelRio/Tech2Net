import { Request, Response } from "express";

import prisma from '../prisma/client';
import { SafeUser } from "../types/UserSafe";


// Returns user data
export async function getUserData(req: Request, res: Response) {

    const userId = req.userId;

    const user: SafeUser | null = await prisma.user.findUnique({ where: { id: userId }, omit: { password: true } },);

    res.status(200).json(user);
}