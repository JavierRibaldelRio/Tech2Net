import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import verificateEvent from "../middleware/verificateEvent.middleware";
import {
    getEvents,
    getEvent,
    createEvent,
    getPresenters,
    modifyPresenters
} from "../controllers/events.controller";


const eventRouter = Router();

// Forces all users to be authentificated
eventRouter.use(authenticate);

// Get actual events
eventRouter.get("/get_events", getEvents);
eventRouter.get("/get_event/:eventId", verificateEvent, getEvent);

// Create a new event
eventRouter.post("/create_event", createEvent);



// Presenters

eventRouter.get("/get_presenters/:eventId", verificateEvent, getPresenters);
eventRouter.post("/modify_presenters/:eventId", verificateEvent, modifyPresenters);

export default eventRouter;
