// backend/config/db.js
import mongoose from "mongoose";

mongoose.set("strictQuery", true);

export default async function connectDB() {
  const { DB_USER, DB_PASS, DB_NAME } = process.env;
  if (!DB_USER || !DB_PASS || !DB_NAME) throw new Error("Variáveis de ambiente do DB não definidas");

  const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.ims9asr.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
  try {
    console.log("🔄 Conectando ao MongoDB...");
    await mongoose.connect(uri);
    console.log(`✅ Conectado ao MongoDB: ${DB_NAME}`);
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    throw error;
  }
}
