// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexão com o banco
connectDB();

// Rotas
app.use('/api/auth', authRoutes);

// Início do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});