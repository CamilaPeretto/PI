// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  try {
    const { nome, email, senha, cpf, dataNascimento } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, message: "nome, email e senha são obrigatórios." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "E-mail já cadastrado." });

    const hashedSenha = await bcrypt.hash(senha, 10);

    const newUser = new User({ nome, email, senha: hashedSenha, cpf, dataNascimento });
    await newUser.save();

    res.status(201).json({ success: true, message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro /register:", error);
    res.status(500).json({ success: false, message: "Erro no servidor", error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ success: false, message: "email e senha são obrigatórios." });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Usuário não encontrado." });

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) return res.status(401).json({ success: false, message: "Senha incorreta." });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({ success: true, token, role: user.role });
  } catch (error) {
    console.error("Erro /login:", error);
    res.status(500).json({ success: false, message: "Erro no servidor", error: error.message });
  }
}
