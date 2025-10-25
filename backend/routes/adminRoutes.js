// backend/routes/adminRoutes.js
import express from "express";
import { verificarToken, verificarAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apenas admins podem acessar
router.get("/dados", verificarToken, verificarAdmin, (req, res) => {
  res.json({
    totalLivros: 320,
    totalUsuarios: 580,
    downloads: 1248,
  });
});

export default router;
