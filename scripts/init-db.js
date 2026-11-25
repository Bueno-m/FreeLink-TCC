const fs = require('fs/promises');
const path = require('path');
const db = require('../db');

async function initializeDatabase() {
    try {
        const schema = await fs.readFile(path.join(__dirname, '..', 'freelink_db.sql'), 'utf8');
        await db.query(schema);
        console.log('Esquema do banco de dados aplicado com sucesso.');
    } finally {
        await db.end();
    }
}

initializeDatabase().catch((error) => {
    console.error('Erro ao aplicar o esquema do banco de dados:', error.message);
    process.exitCode = 1;
});
