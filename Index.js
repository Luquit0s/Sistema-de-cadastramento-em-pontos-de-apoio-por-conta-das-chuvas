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

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({
    status: "Back-end rodando perfeitamente!",
    mensagem: "Pronto para iniciar o site"
  });
});

// ==========================================
// ROTAS DO CRUD (CENTROS DE APOIO)
// ==========================================

// 1. ROTA PARA CADASTRAR UM ABRIGO (CREATE)
app.post('/api/abrigos', async (req, res) => {
    const { nome, endereco, capacidade } = req.body;
    const capacidadInt = parseInt(capacidade) || 0;
    
    const { data, error } = await supabase
        .from('abrigo')
        .insert([{ 
            nome: nome, 
            endereco: endereco, 
            cidade: 'Recife',          
            bairro: 'Centro',          
            cep: '50000000',           
            cap_maxima: capacidadInt, 
            vagas_disp: capacidadInt  
        }])
        .select();

    if (error) {
        console.error("Erro detalhado do Supabase:", error);
        return res.status(400).json({ erro: error.message });
    }

    res.status(201).json({ mensagem: "Abrigo cadastrado com sucesso!", dados: data });
});

// 2. ROTA PARA LISTAR TODOS OS ABRIGOS (READ)
app.get('/api/abrigos', async (req, res) => {
    const { data, error } = await supabase
        .from('abrigo')
        .select('*');

    if (error) {
        return res.status(400).json({ erro: error.message });
    }

    res.json(data);
});

// 3. ROTA PARA DELETAR UM ABRIGO (DELETE)
app.delete('/api/abrigos/:nome', async (req, res) => {
    const { nome } = req.params;

    const { data, error } = await supabase
        .from('abrigo')
        .delete()
        .eq('nome', nome); 

    if (error) {
        console.error("Erro ao deletar no Supabase:", error);
        return res.status(400).json({ erro: error.message });
    }

    res.json({ mensagem: "Abrigo deletado com sucesso!", dados: data });
});

// ====================================================
// ROTA PARA LISTAR PEDIDOS DE ACOLHIMENTO (TRIAGEM)
// ====================================================
app.get('/api/pedidos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('triagem')
            .select(`
                id_triagem,
                prioridade,
                status,
                usuario (
                    nome,
                    cpf
                )
            `);

        if (error) throw error;

        const pedidosComDependentes = await Promise.all(data.map(async (pedido) => {
            if (!pedido.usuario) return null;

            const { count } = await supabase
                .from('dependente')
                .select('*', { count: 'exact', head: true })
                .eq('cpf_usuario', pedido.usuario.cpf);

            return {
                id: pedido.id_triagem,
                nome: pedido.usuario.nome,
                familiares: count || 0,
                prioridade: pedido.prioridade || 'Normal',
                status: pedido.status || 'Pendente'
            };
        }));

        res.json(pedidosComDependentes.filter(p => p !== null));

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ erro: error.message });
    }
});

// ====================================================
// ROTA PARA SALVAR O PEDIDO DE CADASTRO 
// ====================================================
app.post('/api/pedidos', async (req, res) => {
    const { nome, cpf, status, prioridade, id_abrigo } = req.body;
    
    console.log(`[Servidor] Tentando cadastrar: ${nome} - CPF: ${cpf} - Abrigo recebido: ${id_abrigo}`);

    try {
        // 1. Garante o vínculo do usuário na tabela 'usuario'
        const { error: errorUsuario } = await supabase
            .from('usuario')
            .insert([{ 
                cpf: cpf,
                nome: nome, 
                data_nasc: '1900-01-01', 
                id_regiao: 1             
            }]);

        if (errorUsuario && !errorUsuario.message.includes('unique constraint')) {
            throw errorUsuario;
        }

        const agora = new Date();
        
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        const formatoData = `${ano}-${mes}-${dia}`; 

        const formatoHora = agora.toTimeString().split(' ')[0]; 

        const abrigoIdValido = id_abrigo ? parseInt(id_abrigo, 10) : 5;
        const { data: dataTriagem, error: errorTriagem } = await supabase
            .from('triagem')
            .insert([{
                data: formatoData,               // Coluna 'data' DATE NOT NULL
                hora: formatoHora,               // Coluna 'hora' TIME NOT NULL
                prioridade: prioridade || 'Normal',
                status: status || 'Pendente',
                cpf_usuario: cpf,                // Coluna 'cpf_usuario' CHAR(11)
                id_abrigo: abrigoIdValido        // Coluna 'id_abrigo' INTEGER NOT NULL
            }])
            .select();

        if (errorTriagem) throw errorTriagem;

        res.status(201).json({ mensagem: "Cadastro efetuado com sucesso!", dados: dataTriagem });

    } catch (error) {
        console.error("Erro completo ao salvar pedido:", error);
        res.status(400).json({ erro: error.message });
    }
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