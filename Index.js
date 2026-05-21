const express = require('express');
const cors = require('cors'); // Evita erros de bloqueio no navegador da sua amiga
const app = express();
const PORT = 3000;

// Middlewares obrigatórios
app.use(cors());
app.use(express.json());

// Rota de teste: Quando ela acessar http://localhost:3000/api/status vai ver essa mensagem
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "Back-end rodando perfeitamente!",
    mensagem: "Pronto para receber o front-end!"
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`============================================`);
  console.log(`🚀 Servidor online e pronto para o combate!`);
  console.log(`🌍 Rodando na porta: ${PORT}`);
  console.log(`🔗 Teste no navegador: http://localhost:${PORT}/api/status`);
  console.log(`============================================`);
});