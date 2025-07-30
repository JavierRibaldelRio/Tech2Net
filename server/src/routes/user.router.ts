import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { getUserData } from "../controllers/user.controller";

const userRouter = Router();

// Forces all users to be authentificated
userRouter.use(authenticate);

userRouter.get("/data", getUserData);

export default userRouter;
