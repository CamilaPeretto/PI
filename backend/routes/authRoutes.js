// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Cadastro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, cpf, nascimento, senha } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ error: 'Email já cadastrado' });

    const novoUsuario = new User({ nome, email, cpf, nascimento, senha });
    await novoUsuario.save();

    res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário', details: err });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.senha !== senha) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({ message: 'Login bem-sucedido', user: { nome: user.nome, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login', details: err });
  }
});

module.exports = router;
