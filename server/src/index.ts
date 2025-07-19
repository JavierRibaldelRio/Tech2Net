import express, { Request, Response } from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());


// ! TEMPORARY: INSTALLING CORS IS MISSING
// Middleware para habilitar CORS manualmente
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Permite solo tu frontend
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos permitidos
    res.header('Access-Control-Allow-Headers', 'Content-Type'); // Cabeceras permitidas
    next();
});


// Ruta de ejemplo
app.get('/api/data', (req: Request, res: Response) => {
    res.json({ message: "Hola desde Express + TypeScript!" + "¡Ding dong!: son las " + new Date().toLocaleTimeString() });
});

app.listen(PORT, () => {
    console.log(`Servidor backend en http://localhost:${PORT}`);
});