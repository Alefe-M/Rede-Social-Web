// --- 1. IMPORTAÇÕES ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Adicione esta linha
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Força o caminho real

const app = express();

// --- 2. MIDDLEWARES (Configurações de Meio de Campo) ---
app.use(cors());         // Liberta o acesso para o pessoal do Front-end
app.use(express.json()); // Diz ao servidor para entender mensagens em formato JSON

// --- 3. CONEXÃO AO BANCO DE DADOS ---
// Usamos o process.env para esconder a senha do banco
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log("✅ Conexão estabelecida: SpotS está ligada ao MongoDB Atlas!");
    
    // O servidor só começa a "ouvir" depois que o banco ligar
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor a correr na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro crítico ao ligar ao banco de dados:", err.message);
  });

// --- 4. ROTA DE TESTE INICIAL ---
app.get('/api/status', (req, res) => {
  res.json({ status: "online", message: "API da SpotS pronta para receber dados." });
});


//Colocando no servidor
const postRoutes = require('./routes/postRoutes');

app.use('/api/posts', postRoutes);