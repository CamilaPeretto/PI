import express from "express";
import Livro from "../models/Livros.js";

const router = express.Router();

// 👉 Rota para listar todos os livros
router.get("/", async (req, res) => {
  try {
    const livros = await Livro.find().sort({ createdAt: -1 });
    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).json({ message: "Erro ao buscar livros." });
  }
});

// 👉 Rota para buscar por gênero
router.get("/genero/:genero", async (req, res) => {
  try {
    const { genero } = req.params;
    const livros = await Livro.find({ genero: { $regex: new RegExp(genero, "i") } });
    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros por gênero:", error);
    res.status(500).json({ message: "Erro ao buscar livros por gênero." });
  }
});

// 👉 Rota para buscar por nome ou autor
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const livros = await Livro.find({
      $or: [
        { titulo: { $regex: new RegExp(q, "i") } },
        { autor: { $regex: new RegExp(q, "i") } },
      ],
    });

    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).json({ message: "Erro ao buscar livros." });
  }
});

export default router;
