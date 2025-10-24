 // Importa o módulo mongoose para interagir com o banco de dados MongoDB
const mongoose = require("mongoose");

// Carrega variáveis de ambiente a partir do arquivo .env
require("dotenv").config();

// Configura o mongoose para permitir consultas "strictQuery"
mongoose.set("strictQuery", true);

// Obtém credenciais do ambiente
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const dbName = process.env.DB_NAME //|| "InBook_Login";

// Valida se as credenciais existem
if (!dbUser || !dbPassword) {
  console.error("❌ Erro: DB_USER ou DB_PASS não definidos nas variáveis de ambiente");
  process.exit(1);
}

// Função assíncrona para conectar ao banco de dados
async function main() {
  try {
    // Constrói a URI de conexão
    //const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.ims9asr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.ims9asr.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
    
    console.log("🔄 Conectando ao banco de dados...");
    
    await mongoose.connect(uri);
    
    console.log("✅ Conectado ao MongoDB com sucesso!");
    console.log(`📊 Banco de dados: ${dbName}`);
    
  } catch (error) {
    console.error("❌ Erro ao conectar com o MongoDB:", error.message);
    throw error; // Propaga o erro para ser tratado pelo catch externo
  }
}

// Chama a função main e trata erros
main().catch((err) => {
  console.error("💥 Falha na conexão com o banco de dados:");
  console.error(err);
  process.exit(1); // Encerra o processo em caso de erro crítico
});

// Exporta a função 'main' para ser utilizada em outras partes do código
module.exports = main;