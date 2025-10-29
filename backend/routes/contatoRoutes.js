import express from "express";
import { sendMail } from "../services/mailer.js";
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;
    if (!nome || !email || !assunto || !mensagem)
      return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });

    // Email para admin
    await sendMail({
      to: process.env.SMTP_USER,
      subject: `Contato via Site: ${assunto}`,
      text: `Nome: ${nome}\nEmail: ${email}\nAssunto: ${assunto}\nMensagem: ${mensagem}`,
      html: `<p><strong>Nome:</strong> ${nome}</p><p><strong>Email:</strong> ${email}</p><p><strong>Assunto:</strong> ${assunto}</p><p>${mensagem}</p>`
    });

    // Email de confirmação para usuário
    await sendMail({
      to: email,
      subject: "Confirmação de contato - InBook",
      text: `Olá ${nome},\nRecebemos sua mensagem sobre "${assunto}". Responderemos em breve.`
    });

    res.json({ success: true, message: "Mensagem enviada com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
});

export default router;
