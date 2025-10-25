// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ mensagem: "Token não fornecido." });

  const token = authHeader.split(" ")[1]; // "Bearer token"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id, email, role
    next();
  } catch {
    res.status(403).json({ mensagem: "Token inválido ou expirado." });
  }
}

// Middleware opcional para roles
export function verificarAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ mensagem: "Acesso negado: admin somente." });
  next();
}
