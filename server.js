const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let pool;

// Inicializar banco
async function initDb() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Testa a conexão
  const connection = await pool.getConnection();
  console.log('Conectado ao MySQL!');
  connection.release();
}

// Listar todos os produtos
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products ORDER BY id DESC'
    );

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({
      error: 'Erro ao listar produtos'
    });
  }
});

// Inserir produto
// Body: { name, description, price }
app.post('/api/products', async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({
      error: 'name e price são obrigatórios'
    });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO products (name, description, price)
      VALUES (?, ?, ?)
      `,
      [name, description || null, price]
    );

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao inserir produto:', err);

    res.status(500).json({
      error: 'Erro ao inserir produto'
    });
  }
});

// Consultar produto por ID
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado'
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao consultar produto:', err);

    res.status(500).json({
      error: 'Erro ao consultar produto'
    });
  }
});

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando!'
  });
});

// Inicializar servidor
async function startServer() {
  try {
    await initDb();

    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err);
    process.exit(1);
  }
}

// Erros não tratados
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

startServer();
