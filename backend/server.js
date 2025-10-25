// backend/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5500", credentials: true }));
app.use(express.json());

await connectDB(); // conecta ao MongoDB

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("API InBook rodando"));

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
