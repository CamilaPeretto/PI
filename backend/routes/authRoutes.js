import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { register, login } from "../controllers/authController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register & Login
router.post("/register", register);
router.post("/login", login);

// Perfil
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-senha");
    if (!user) return res.status(404).json({ success: false, message: "Usuário não encontrado" });

    // Retorna campos usados no frontend
    res.json({
      success: true,
      user: {
        nome: user.nome,
        email: user.email,
        cpf: user.cpf || "",
        daataNascimento: user.dataNascimento || "",
      }
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ success: false, message: "Erro interno ao buscar usuário" });
  }
});

// Update
router.put("/update", verificarToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const camposPermitidos = ["nome", "email", "senha"];
    const updates = {};

    camposPermitidos.forEach(campo => {
      if (req.body[campo]) updates[campo] = req.body[campo];
    });

    if (updates.senha) {
      const salt = await bcrypt.genSalt(10);
      updates.senha = await bcrypt.hash(updates.senha, salt);
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-senha");
    res.json({ success: true, user });
  } catch (error) {
    console.error("Erro /update:", error);
    res.status(500).json({ success: false, message: "Erro ao atualizar perfil" });
  }
});

export default router;
