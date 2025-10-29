import express from "express";
import Livro from "../models/Livros.js";
import path from "path";
import fs from "fs";
import events from "../services/events.js";

const router = express.Router();

// 👉 Rota para listar todos os livros
router.get("/", async (req, res) => {
  try {
    const livros = await Livro.find({ ativo: true }).sort({ createdAt: -1 });
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
    const livros = await Livro.find({ ativo: true, genero: { $regex: new RegExp(genero, "i") } });
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
      ativo: true,
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

// 👉 Download de PDF e incremento de downloads
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const livro = await Livro.findById(id);
    if (!livro || !livro.ativo) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    if (!livro.arquivo || !livro.arquivo.path) {
      return res.status(400).json({ message: 'Arquivo não disponível para download' });
    }

    // Apenas PDFs são suportados para download
    const filePath = path.resolve(livro.arquivo.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado no servidor' });
    }

    // Incrementa contador de downloads
    await Livro.updateOne({ _id: id }, { $inc: { downloads: 1 } });

    // Agrega total atualizado e emite evento SSE
    try {
      const agg = await Livro.aggregate([
        { $match: { ativo: true } },
        { $group: { _id: null, total: { $sum: "$downloads" } } }
      ]);
      events.emit('downloadsUpdated', { totalDownloads: agg[0]?.total || 0 });
    } catch {}

    // Força download
    const downloadName = livro.arquivo.originalName || `${livro.titulo}.pdf`;
    return res.download(filePath, downloadName);
  } catch (error) {
    console.error('Erro no download:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID inválido' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});
