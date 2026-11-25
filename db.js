// db.js
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const { Pool } = require('pg');

// Criar um Pool de conexões PostgreSQL (ideal para hospedagens)
const poolConfig = process.env.DATABASE_URL
    ? {
          connectionString: process.env.DATABASE_URL,
          max: 10
      }
    : {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASS || '',
          database: process.env.DB_NAME || 'freelink_db',
          port: Number(process.env.DB_PORT) || 5432,
          max: 10 // Limite de conexões simultâneas
      };

const pool = new Pool(poolConfig);

// Testar a conexão
pool.connect((erro, client, release) => {
    if (erro) {
        console.error('Erro ao conectar ao banco de dados PostgreSQL:', erro.code || erro.message);
        return;
    }
    console.log('Conexão com o banco de dados PostgreSQL FreeLink estabelecida com sucesso!');
    release(); // Libera a conexão de volta para o pool
});

module.exports = pool;
