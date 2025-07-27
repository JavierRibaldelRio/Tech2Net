import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { FRONTEND_URL } from './config';

// Routers
import authRouter from './auth/auth.router';

// Error
import { errorHandler } from './middleware/error.middleware';

const PORT = 3001;


const app = express();
app.use(express.json());

app.use(cookieParser());


app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));


// Routes
app.use('/api/auth', authRouter);

//TODO
// app.use('/api/user') routes related that requires token

app.use('/', (req: Request, res: Response) => { res.send("Hola") });

// Error Handler
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Servidor backend en http://localhost:${PORT}`);
});