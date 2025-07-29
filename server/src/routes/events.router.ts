import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { createEvent } from "../controllers/events.controller";

const eventRouter = Router();

// Forces all users to be authentificated
eventRouter.use(authenticate);

eventRouter.post("/create_event", createEvent);

export default eventRouter;
