import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "./auth.controller";
import { authenticate } from "./auth.middleware";

const authRouter = Router();


authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

// You must be authentificated to be able to log out
authRouter.post("/logout", authenticate, logoutUser);


export default authRouter