// backend/routes/adminRoutes.js
import express from "express";
import { verificarToken, verificarAdmin } from "../middleware/authMiddleware.js";
import Livro from "../models/Livros.js";
import { upload, handleUploadErrors } from "../services/upload.js";

const router = express.Router();


// GET /api/admin/dados - Dashboard admin
router.get("/dados", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const totalLivros = await Livro.countDocuments({ ativo: true });
    const totalDownloads = await Livro.aggregate([
      { $match: { ativo: true } },
      { $group: { _id: null, total: { $sum: "$downloads" } } }
    ]);
    
    // Estatísticas por gênero
    const livrosPorGenero = await Livro.aggregate([
      { $match: { ativo: true } },
      { $group: { _id: "$genero", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Livros adicionados este mês
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const livrosEsteMes = await Livro.countDocuments({
      ativo: true,
      createdAt: { $gte: inicioMes }
    });

    res.json({
      totalLivros,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalUsuarios: 580, // Temporariamente fixo
      livrosPorGenero,
      livrosEsteMes
    });
  } catch (error) {
    console.error("Erro ao carregar dados do admin:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// GET /api/admin/livros - Listar livros com filtros
router.get("/livros", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const {
      titulo,
      autor,
      genero,
      formato,
      dataPubDe,
      dataPubAte,
      dataAddDe,
      dataAddAte,
      page = 1,
      limit = 10
    } = req.query;

    // Construir filtro
    const filter = { ativo: true };

    if (titulo) filter.titulo = { $regex: titulo, $options: "i" };
    if (autor) filter.autor = { $regex: autor, $options: "i" };
    if (genero) filter.genero = genero;
    if (formato) filter.formato = formato;

    // Filtros de data de publicação
    if (dataPubDe || dataPubAte) {
      filter.dataPublicacao = {};
      if (dataPubDe) filter.dataPublicacao.$gte = new Date(dataPubDe);
      if (dataPubAte) filter.dataPublicacao.$lte = new Date(dataPubAte);
    }

    // Filtros de data de adição
    if (dataAddDe || dataAddAte) {
      filter.createdAt = {};
      if (dataAddDe) filter.createdAt.$gte = new Date(dataAddDe + 'T00:00:00.000Z');
      if (dataAddAte) filter.createdAt.$lte = new Date(dataAddAte + 'T23:59:59.999Z');
    }

    const skip = (page - 1) * limit;

    const livros = await Livro.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('titulo autor dataPublicacao genero formato sinopse capa arquivo downloads createdAt')
      .lean();

    const total = await Livro.countDocuments(filter);

    // Formatar datas para exibição
    const livrosFormatados = livros.map(livro => ({
      ...livro,
      dataPub: livro.dataPublicacao.toISOString().split('T')[0],
      dataAdd: livro.createdAt.toISOString().split('T')[0],
      id: livro._id.toString()
    }));

    res.json({
      livros: livrosFormatados,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLivros: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// GET /api/admin/livros/:id - Buscar livro por ID
router.get("/livros/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const livro = await Livro.findById(req.params.id);
    
    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado" });
    }

    // Formatar resposta
    const livroFormatado = {
      id: livro._id,
      titulo: livro.titulo,
      autor: livro.autor,
      dataPublicacao: livro.dataPublicacao.toISOString().split('T')[0],
      dataAdicao: livro.createdAt.toISOString().split('T')[0],
      genero: livro.genero,
      formato: livro.formato,
      sinopse: livro.sinopse,
      capa: livro.capa,
      arquivo: livro.arquivo,
      downloads: livro.downloads
    };

    res.json(livroFormatado);
  } catch (error) {
    console.error("Erro ao buscar livro:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "ID do livro inválido" });
    }
    
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// POST /api/admin/livros - Adicionar novo livro
router.post("/livros", 
  verificarToken, 
  verificarAdmin, 
  upload.fields([
    { name: "capa", maxCount: 1 },
    { name: "arquivo", maxCount: 1 }
  ]),
  handleUploadErrors,
  async (req, res) => {
    try {
      const {
        titulo,
        autor,
        dataPublicacao,
        genero,
        formato,
        sinopse
      } = req.body;

      // Validar campos obrigatórios
      if (!titulo || !autor || !dataPublicacao || !genero || !formato) {
        return res.status(400).json({ 
          message: "Todos os campos obrigatórios devem ser preenchidos" 
        });
      }

      const livroData = {
        titulo: titulo.trim(),
        autor: autor.trim(),
        dataPublicacao: new Date(dataPublicacao),
        genero,
        formato,
        sinopse: (sinopse || "").trim(),
        criadoPor: req.user.id
      };

      // Processar arquivos de upload
      if (req.files) {
        if (req.files.capa) {
          const capa = req.files.capa[0];
          livroData.capa = {
            filename: capa.filename,
            originalName: capa.originalname,
            path: capa.path,
            mimetype: capa.mimetype
          };
        }

        if (req.files.arquivo) {
          const arquivo = req.files.arquivo[0];
          livroData.arquivo = {
            filename: arquivo.filename,
            originalName: arquivo.originalname,
            path: arquivo.path,
            mimetype: arquivo.mimetype,
            size: arquivo.size
          };
        }
      }

      const novoLivro = new Livro(livroData);
      await novoLivro.save();

      res.status(201).json({
        message: "Livro adicionado com sucesso",
        livro: novoLivro
      });
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors 
        });
      }
      
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);

// PUT /api/admin/livros/:id - Editar livro
router.put("/livros/:id",
  verificarToken,
  verificarAdmin,
  upload.fields([
    { name: "capa", maxCount: 1 },
    { name: "arquivo", maxCount: 1 }
  ]),
  handleUploadErrors,
  async (req, res) => {
    try {
      const {
        titulo,
        autor,
        dataPublicacao,
        genero,
        formato,
        sinopse
      } = req.body;

      const livro = await Livro.findById(req.params.id);
      
      if (!livro) {
        return res.status(404).json({ message: "Livro não encontrado" });
      }

      // Atualizar campos
      if (titulo) livro.titulo = titulo.trim();
      if (autor) livro.autor = autor.trim();
      if (dataPublicacao) livro.dataPublicacao = new Date(dataPublicacao);
      if (genero) livro.genero = genero;
      if (formato) livro.formato = formato;
      if (sinopse !== undefined) livro.sinopse = sinopse.trim();

      // Atualizar arquivos se fornecidos
      if (req.files) {
        if (req.files.capa) {
          // Remover capa antiga se existir
          if (livro.capa && livro.capa.path && fs.existsSync(livro.capa.path)) {
            fs.unlinkSync(livro.capa.path);
          }

          const capa = req.files.capa[0];
          livro.capa = {
            filename: capa.filename,
            originalName: capa.originalname,
            path: capa.path,
            mimetype: capa.mimetype
          };
        }

        if (req.files.arquivo) {
          // Remover arquivo antigo se existir
          if (livro.arquivo && livro.arquivo.path && fs.existsSync(livro.arquivo.path)) {
            fs.unlinkSync(livro.arquivo.path);
          }

          const arquivo = req.files.arquivo[0];
          livro.arquivo = {
            filename: arquivo.filename,
            originalName: arquivo.originalname,
            path: arquivo.path,
            mimetype: arquivo.mimetype,
            size: arquivo.size
          };
        }
      }

      await livro.save();

      res.json({
        message: "Livro atualizado com sucesso",
        livro
      });
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
      
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors 
        });
      }
      
      if (error.name === 'CastError') {
        return res.status(400).json({ message: "ID do livro inválido" });
      }
      
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);

// DELETE /api/admin/livros/:id - Excluir livro (soft delete)
router.delete("/livros/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const livro = await Livro.findById(req.params.id);
    
    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado" });
    }

    // Soft delete
    livro.ativo = false;
    await livro.save();

    res.json({ message: "Livro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir livro:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "ID do livro inválido" });
    }
    
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;