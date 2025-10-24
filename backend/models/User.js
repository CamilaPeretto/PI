// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, required: true, unique: true },
  cpf: String,
  nascimento: String,
  senha: String,
  dataRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema, 'teste');
