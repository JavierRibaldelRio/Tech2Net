import express, { Request, Response } from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

// Ruta de ejemplo
app.get('/api/data', (req: Request, res: Response) => {
    res.json({ message: "Hola desde Express + TypeScript!" });
});

app.listen(PORT, () => {
    console.log(`Servidor backend en http://localhost:${PORT}`);
});