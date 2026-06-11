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

// =================================================================================
// ROTA DE DIAGNÓSTICO        -   CODIGO UTILIZADO PARA IDENTIFICAÇÃO
//=================================================================================
app.get('/api/onde-estou', (req, res) => {
  const fs = require('fs');
  try {
    const arquivosNaRaiz = fs.readdirSync(__dirname);
    res.json({
      pasta_atual_do_servidor: __dirname,
      arquivos_que_o_node_ve_aqui: arquivosNaRaiz
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}); // Essa parte em si não é crucial para o projeto, mas é utilizado para identificar quais arquivos o Node estaria visualizando
    // " http://localhost:3000/api/onde-estou " Digitando esse comando no navegador você vai ser redirecionado a uma região que estaria mostrando quais arquivos o Node acessa

// ==========================================
// ROTAS DO CRUD (CENTROS DE APOIO)
// ==========================================

// 1. ROTA PARA CADASTRAR UM CENTRO (CREATE)
app.post('/api/centros', async (req, res) => {
  const { nome, endereco, capacidade } = req.body;

  const { data, error } = await supabase
    .from('centros_apoio') // Nome exato da tabela no Supabase
    .insert([{ nome, endereco, capacidade }])
    .select();

  if (error) {
    return res.status(400).json({ erro: error.message });
  }

  res.status(201).json({ mensagem: "Centro cadastrado com sucesso!", dados: data });
});

// 2. ROTA PARA LISTAR TODOS OS CENTROS (READ)
app.get('/api/centros', async (req, res) => {
  const { data, error } = await supabase
    .from('centros_apoio')
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