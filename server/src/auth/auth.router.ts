import { Router } from "express";
import { registerUser, loginUser } from "./auth.controller";
import { authenticate } from "./auth.middleware";

const authRouter = Router();


authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);


authRouter.get("/test", authenticate, (req: any, res: any) => {

    console.log("LLegó")

    res.json({ lino: "Sea bienvenido usario secreto" });
});


export default authRouter