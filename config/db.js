const { MongoClient, ServerApiVersion } = require('mongodb');

// Sua URI de conexão MongoDB (não se esqueça de substituir <senha> pela sua senha real)
const uri = "mongodb+srv://guisouza2009:hRvpnY2pu2YYMhwe@cluster0.igwv9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Criando a instância do MongoClient com a versão estável da API
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Função assíncrona para conectar ao MongoDB
async function connectDB() {
  try {
    // Conectar ao cliente
    await client.connect();
    console.log("Conectado ao MongoDB com sucesso!");

    // Pode fazer uma operação de ping para verificar a conexão
    await client.db("admin").command({ ping: 1 });
    console.log("Pingado com sucesso! Você está conectado ao MongoDB.");
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

module.exports = { connectDB, client };
