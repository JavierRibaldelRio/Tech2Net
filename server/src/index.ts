import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { FRONTEND_URL } from './config';

// Routers
import authRouter from './auth/auth.router';
import userRouter from './routes/user.router';

// Error
import { errorHandler } from './middleware/error.middleware';
import eventRouter from './routes/events.router';

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
app.use('/api/auth', authRouter);               // Auth
app.use('/api/user', userRouter);               // User settings and data
app.use('/api/events', eventRouter);            // Events

app.use('/', (req: Request, res: Response) => { res.send("Ding dong: " + (new Date()).toString()) });

// Error Handler
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Servidor backend en http://localhost:${PORT}`);
});