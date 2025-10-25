// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cpf: String,
  dataNascimento: Date,
  role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
