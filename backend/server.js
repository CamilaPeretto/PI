// backend/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contatoRoutes from "./routes/contatoRoutes.js";
import solicitacaoRoutes from "./routes/solicitacaoRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

await connectDB(); // conecta ao MongoDB

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contato", contatoRoutes);
app.use("/api/solicitacao-livro", solicitacaoRoutes);

app.get("/", (req, res) => res.send("API InBook rodando"));

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
