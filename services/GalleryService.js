import express from "express";
import cors from "cors";
import commentsRoutes from "./routes/comments.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/comments", commentsRoutes);

// Servidor
const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
