// src/routes/userRoutes.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Rota para contar usuários
router.get("/count", async (req, res) => {
  try {
    const totalUsuarios = await User.countDocuments();
    res.json({ total: totalUsuarios });
  } catch (error) {
    res.status(500).json({ message: "Erro ao contar usuários." });
  }
});

export default router;
