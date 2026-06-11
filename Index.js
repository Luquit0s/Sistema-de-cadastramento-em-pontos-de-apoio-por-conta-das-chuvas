require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors'); // Evita erros de bloqueio no navegador 
const { createClient } = require('@supabase/supabase-js'); // Importa o Supabase
const path = require('path');

const app = express();
const PORT = 3000; 

// Inicialização do Supabase usando os dados do .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares obrigatórios
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Servir os arquivos estáticos do front-end (HTML, CSS, Imagens)
app.use(express.static(path.join(__dirname, 'Site-Pojeto-Abrigo-main'), { index: 'gov.html' }));

// Rota de teste: Quando acessar http://localhost:3000/api/status vai ver essa mensagem
app.get('/api/status', (req, res) => {
  res.json({
    status: "Back-end rodando perfeitamente!",
    mensagem: "Pronto para iniciar o site"
  });
});

// ==========================================
// ROTAS DO CRUD (CENTROS DE APOIO)
// ==========================================

// 1. ROTA PARA CADASTRAR UM CENTRO (CREATE)
app.post('/api/abrigos', async (req, res) => { 
  const { nome, endereco, capacidade } = req.body;

  const { data, error } = await supabase
    .from('abrigo') 
    .insert([{ nome, endereco, capacidade }])
    .select();

  if (error) {
    return res.status(400).json({ erro: error.message });
  }

  res.status(201).json({ mensagem: "Centro cadastrado com sucesso!", dados: data });
});

// 2. ROTA PARA LISTAR TODOS OS CENTROS (READ)
app.get('/api/abrigos', async (req, res) => {
  const { data, error } = await supabase
    .from('abrigo')
    .select('*');

  if (error) {
    return res.status(400).json({ erro: error.message });
  }

  res.json(data);
});

// ==========================================
// Inicialização do servidor
// ==========================================
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor online e pronto o site de cadastramento pode ser acessado agora!`);
  console.log(`🌍 Rodando na porta: ${PORT}`);
  console.log(`🔗 Link direto do site: http://localhost:${PORT}`);
  console.log(`===============================================`);
});