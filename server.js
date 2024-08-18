const express = require('express'); // Framework para criação de servidores web
const sql = require('mssql'); // Módulo para conectar ao SQL Server
const bodyParser = require('body-parser'); // Middleware para processar JSON
const bcrypt = require('bcrypt'); // Biblioteca para hashing de senhas
const jwt = require('jsonwebtoken'); // Biblioteca para criar tokens JWT
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

const app = express(); // Criação de uma instância do Express

app.use(bodyParser.json()); // Configura o Express para usar o body-parser

// Configurações de conexão com o banco de dados SQL Server
const dbConfig = {
    user: 'DESKTOP-BCV6MOE\\Adriano',  // Nome de usuário completo
    password: '',                      // Senha vazia, já que não foi configurada uma senha
    server: 'localhost\\SQLEXPRESS',   // Endereço do servidor SQL com a instância
    database: 'UserAuth',              // Nome do banco de dados
    options: {
        encrypt: true,                 // Usa criptografia para a conexão
        trustServerCertificate: true   // Configuração de segurança para desenvolvimento
    },
    connectionTimeout: 30000,
    port: 1433
};

// Conecta ao banco de dados SQL Server
sql.connect(dbConfig, err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        process.exit(1); // Encerra o processo em caso de erro
    }
    console.log('Conectado ao banco de dados');
});

// Rota para registro de usuário
app.post('/register', async (req, res) => {
    const { username, password, email, telefone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash da senha
        await sql.query`INSERT INTO users (username, password, email, telefone) VALUES (${username}, ${hashedPassword}, ${email}, ${telefone})`; // Insere o usuário no banco de dados
        res.status(201).send('Usuário cadastrado com sucesso');
    } catch (err) {
        console.error('Erro ao processar registro:', err);
        res.status(500).send('Erro ao processar registro');
    }
});

// Rota para login de usuário
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await sql.query`SELECT * FROM users WHERE username = ${username}`; // Consulta usuário no banco de dados
        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const match = await bcrypt.compare(password, user.password); // Verifica se a senha corresponde
            if (match) {
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Cria um token JWT
                res.json({ token });
            } else {
                res.status(401).send('Senha incorreta');
            }
        } else {
            res.status(404).send('Usuário não encontrado');
        }
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).send('Erro ao fazer login');
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000; // Porta definida no arquivo .env ou padrão 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use(express.static('public')); // Serve arquivos estáticos da pasta 'public'
