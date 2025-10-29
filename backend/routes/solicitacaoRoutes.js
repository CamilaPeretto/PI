import express from "express";
import { sendMail } from "../services/mailer.js";
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { titulo, autor, editora, ano } = req.body;
    if (!titulo || !autor)
      return res.status(400).json({ success: false, message: "Título e autor são obrigatórios." });

    await sendMail({
      to: process.env.SMTP_USER,
      subject: "Nova Solicitação de Livro",
      text: `Título: ${titulo}\nAutor: ${autor}\nEditora: ${editora || "Não informada"}\nAno: ${ano || "Não informado"}`,
      html: `<p><strong>Título:</strong> ${titulo}</p><p><strong>Autor:</strong> ${autor}</p><p><strong>Editora:</strong> ${editora || "Não informada"}</p><p><strong>Ano:</strong> ${ano || "Não informado"}</p>`
    });

    res.json({ success: true, message: "Solicitação enviada com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
});

export default router;
