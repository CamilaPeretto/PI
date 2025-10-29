// backend/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./services/logger.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contatoRoutes from "./routes/contatoRoutes.js";
import solicitacaoRoutes from "./routes/solicitacaoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import livrosRoutes from "./routes/Livrosroutes.js";
import jwt from "jsonwebtoken";
import events from "./services/events.js";
import Livro from "./models/Livros.js";

const app = express();
const PORT = Number(env.PORT);

app.use(cors());
app.use(express.json());
// Servir arquivos estáticos de uploads (capas e PDFs)
app.use("/uploads", express.static("uploads"));

await connectDB(); // conecta ao MongoDB

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contato", contatoRoutes);
app.use("/api/solicitacao-livro", solicitacaoRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/livros", livrosRoutes);

// SSE para admin: atualiza totalDownloads em tempo real
app.get("/api/admin/stream", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(401).end();

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(403).end();
    }
    if (decoded.role !== "admin") return res.status(403).end();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const send = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Envia valor inicial
    try {
      const agg = await Livro.aggregate([
        { $match: { ativo: true } },
        { $group: { _id: null, total: { $sum: "$downloads" } } }
      ]);
      send({ totalDownloads: agg[0]?.total || 0 });
    } catch {}

    const handler = (payload) => {
      send(payload);
    };
    events.on("downloadsUpdated", handler);

    req.on("close", () => {
      events.off("downloadsUpdated", handler);
      res.end();
    });
  } catch {
    res.end();
  }
});

app.get("/", (req, res) => res.send("API InBook rodando"));

// 404 e erros
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => logger.info(`🚀 Servidor rodando na porta ${PORT}`));
