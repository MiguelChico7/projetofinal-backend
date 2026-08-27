const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configuração do MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "Backend do Projeto Final funcionando!"
  });
});

// Teste da conexão com o banco
app.get("/api/teste-db", async (req, res) => {
  try {
    const [resultado] = await db.query("SELECT 1 AS teste");

    res.json({
      sucesso: true,
      mensagem: "Conexão com o MySQL funcionando!",
      resultado
    });

  } catch (erro) {
    console.error("Erro ao conectar ao MySQL:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao conectar ao banco de dados.",
      erro: erro.message
    });
  }
});

// Exemplo para listar usuários
app.get("/api/usuarios", async (req, res) => {
  try {
    const [usuarios] = await db.query("SELECT * FROM usuarios");

    res.json({
      sucesso: true,
      usuarios
    });

  } catch (erro) {
    console.error("Erro ao buscar usuários:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar usuários.",
      erro: erro.message
    });
  }
});

// Criar usuário
app.post("/api/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome, email e senha são obrigatórios."
      });
    }

    const [resultado] = await db.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senha]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: "Usuário criado com sucesso!",
      id: resultado.insertId
    });

  } catch (erro) {
    console.error("Erro ao criar usuário:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar usuário.",
      erro: erro.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
