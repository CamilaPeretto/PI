// backend/createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db"); // usa a mesma conexão
const Usuario = require("./models/User"); // modelo do usuário

// Função autoexecutável
(async () => {
  try {
    // Conecta ao banco usando o db.js
    await connectDB();

    // Verifica se o admin já existe
    const adminExistente = await Usuario.findOne({ email: "admin@email.com" });
    if (adminExistente) {
      console.log("⚠️ Admin já existe!");
      process.exit(0);
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash("admin123", 10);

    // Cria o novo admin
    const novoAdmin = new Usuario({
      nome: "Administrador",
      email: "admin@email.com",
      senha: senhaCriptografada,
      role: "admin", // define o papel de administrador
    });

    await novoAdmin.save();

    console.log("✅ Admin criado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
  } finally {
    mongoose.connection.close();
  }
})();
