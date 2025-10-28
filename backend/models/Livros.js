// backend/models/Livro.js
import mongoose from "mongoose";

const livroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, "Título é obrigatório"],
    trim: true,
    maxlength: [200, "Título não pode ter mais de 200 caracteres"]
  },
  autor: {
    type: String,
    required: [true, "Autor é obrigatório"],
    trim: true,
    maxlength: [100, "Autor não pode ter mais de 100 caracteres"]
  },
  dataPublicacao: {
    type: Date,
    required: [true, "Data de publicação é obrigatória"]
  },
  genero: {
    type: String,
    required: [true, "Gênero é obrigatório"],
    enum: {
      values: [
        "Ação", "Autoajuda", "Aventura", "Biografia", "Clássicos", 
        "Drama", "Fantasia", "Ficção Científica", "História", 
        "Infantil", "Mistério", "Poesia", "Policial", "Psicologia", 
        "Religião", "Romance", "Suspense", "Terror", "Thriller"
      ],
      message: "Gênero {VALUE} não é suportado"
    }
  },
  formato: {
    type: String,
    required: [true, "Formato é obrigatório"],
    enum: {
      values: ["PDF", "EPUB", "MOBI"],
      message: "Formato {VALUE} não é suportado"
    }
  },
  sinopse: {
    type: String,
    maxlength: [2000, "Sinopse não pode ter mais de 2000 caracteres"],
    default: ""
  },
  capa: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    url: String
  },
  arquivo: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    url: String
  },
  downloads: {
    type: Number,
    default: 0
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
livroSchema.index({ titulo: 'text', autor: 'text' });
livroSchema.index({ genero: 1 });
livroSchema.index({ formato: 1 });
livroSchema.index({ dataPublicacao: 1 });
livroSchema.index({ ativo: 1 });
livroSchema.index({ createdAt: -1 });

// Middleware para gerar URLs antes de salvar
livroSchema.pre('save', function(next) {
  if (this.capa && this.capa.filename) {
    this.capa.url = `/uploads/capas/${this.capa.filename}`;
  }
  if (this.arquivo && this.arquivo.filename) {
    this.arquivo.url = `/uploads/livros/${this.arquivo.filename}`;
  }
  next();
});

export default mongoose.model("Livro", livroSchema);