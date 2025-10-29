// backend/createAdmin.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';

// Função autoexecutável
(async () => {
  try {
    await connectDB();

    // Verifica se o admin já existe
    const adminExistente = await User.findOne({ email: "admin@email.com" });
    if (adminExistente) {
      console.log("⚠️ Admin já existe!");
      process.exit(0);
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash("admin123", 10);

    // Cria o novo admin
    const novoAdmin = new User({
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
