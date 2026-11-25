# Migração MySQL → PostgreSQL — FreeLink

Este documento detalha todas as alterações realizadas para migrar o projeto **FreeLink** do banco de dados **MySQL** para o **PostgreSQL**.

---

## Resumo das Alterações

| Arquivo | O que mudou |
|---|---|
| `package.json` | Dependência `mysql2` removida, `pg` adicionada |
| `.env` | Porta alterada de `3306` para `5432`, usuário de `root` para `postgres` |
| `.vscode/settings.json` | Driver SQLTools alterado de `MySQL` para `PostgreSQL` |
| `db.js` | Reescrito: de `mysql2.createPool` para `pg.Pool` |
| `freelink_db.sql` | Schema inteiro convertido para sintaxe PostgreSQL |
| `server.js` | Todas as queries convertidas (placeholders, async/await, RETURNING) |
| `js/main.js` | Comentários atualizados (referências a "MySQL" → "PostgreSQL") |
| `html/perfil.html` | Comentários atualizados (referências a "MySQL" → "PostgreSQL") |

---

## 1. Dependências (`package.json`)

- **Removido:** `mysql2` (driver MySQL para Node.js)
- **Adicionado:** `pg` (driver PostgreSQL para Node.js)

```diff
- "mysql2": "^3.24.5"
+ "pg": "^8.23.1"
```

---

## 2. Configuração do Ambiente (`.env`)

| Variável | Antes (MySQL) | Depois (PostgreSQL) |
|---|---|---|
| `DB_USER` | `root` | `postgres` |
| `DB_PORT` | `3306` | `5432` |

> As demais variáveis (`DB_HOST`, `DB_PASS`, `DB_NAME`) permanecem iguais.  
> O novo `db.js` também aceita `DATABASE_URL` (connection string) para facilitar deploy em plataformas como Render, Railway e Supabase.

---

## 3. Conexão com o Banco (`db.js`)

**Antes (MySQL):**
```js
const mysql = require('mysql2');
const pool = mysql.createPool({ ... });
pool.getConnection((erro, conexao) => { ... });
module.exports = pool;
```

**Depois (PostgreSQL):**
```js
const { Pool } = require('pg');
const pool = new Pool({ ... });
pool.connect((erro, client, release) => { ... });
module.exports = pool;
```

### Principais diferenças:
- O `pg.Pool` usa `max` em vez de `connectionLimit`
- O callback de teste recebe `(erro, client, release)` ao invés de `(erro, conexao)`
- Suporte a `DATABASE_URL` (connection string) para ambientes de produção

---

## 4. Schema do Banco (`freelink_db.sql`)

### 4.1 `AUTO_INCREMENT` → `SERIAL`
O PostgreSQL usa o tipo `SERIAL` para colunas auto-incrementais.

```diff
- id_usuario INT AUTO_INCREMENT PRIMARY KEY
+ id_usuario SERIAL PRIMARY KEY
```

### 4.2 `ENUM(...)` → `VARCHAR + CHECK`
O PostgreSQL não aceita `ENUM` inline na definição de coluna. Foi substituído por `VARCHAR` com constraint `CHECK`.

```diff
- tipo_usuario ENUM('CLIENTE', 'FREELANCER') NOT NULL
+ tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('CLIENTE', 'FREELANCER'))
```

### 4.3 `TINYINT` → `SMALLINT`
O PostgreSQL não possui `TINYINT`. Foi substituído por `SMALLINT`.

```diff
- nota TINYINT NOT NULL
+ nota SMALLINT NOT NULL
```

### 4.4 `DATETIME` → `TIMESTAMP`
O tipo `DATETIME` do MySQL foi substituído por `TIMESTAMP` no PostgreSQL.

```diff
- data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP
+ data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 4.5 `LONGTEXT` → `TEXT`
O PostgreSQL não possui `LONGTEXT`; `TEXT` já aceita tamanho ilimitado.

```diff
- perfil_json LONGTEXT NULL
+ perfil_json TEXT
```

### 4.6 `ON UPDATE CURRENT_TIMESTAMP` → Trigger
O PostgreSQL não suporta `ON UPDATE CURRENT_TIMESTAMP` nativamente. Foi criada uma **função + trigger** para reproduzir o comportamento:

```sql
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_plataforma_projeto_atualizado_em
    BEFORE UPDATE ON PLATAFORMA_PROJETO
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();
```

### 4.7 `ADD COLUMN ... AFTER` removido
O PostgreSQL não suporta a cláusula `AFTER` no `ALTER TABLE ADD COLUMN`. A tabela `USUARIO` foi reescrita com todas as colunas já na definição inicial (incluindo `google_id`, `biografia`, `link_portfolio`, `perfil_json`), eliminando a necessidade do `ALTER TABLE` separado.

### 4.8 `COMMENT` em colunas
O MySQL usa `COMMENT 'texto'` inline. No PostgreSQL, foi substituído por:

```sql
COMMENT ON COLUMN USUARIO.biografia IS 'Resumo profissional do freelancer';
```

### 4.9 `INDEX` inline → `CREATE INDEX`
O MySQL permite `INDEX idx_nome (colunas)` dentro do `CREATE TABLE`. No PostgreSQL:

```diff
- INDEX idx_chat_sala (id_sala, id_mensagem)
+ CREATE INDEX IF NOT EXISTS idx_chat_sala ON CHAT_MENSAGEM (id_sala, id_mensagem);
```

### 4.10 `CREATE DATABASE` / `USE` removidos
O PostgreSQL usa `createdb` via linha de comando e não aceita `USE`. O script agora deve ser executado já conectado ao banco `freelink_db`.

---

## 5. Queries no Backend (`server.js`)

### 5.1 Placeholders: `?` → `$1, $2, ...`
O driver `pg` usa placeholders numerados em vez de `?`.

```diff
- 'SELECT * FROM USUARIO WHERE email = ?'
+ 'SELECT * FROM USUARIO WHERE email = $1'
```

### 5.2 Callbacks → `async/await`
Todas as rotas foram convertidas de callbacks (`db.query(sql, params, callback)`) para `async/await` (`const { rows } = await db.query(sql, params)`), tornando o código mais legível e robusto.

```diff
- db.query(sql, (erro, resultados) => {
-     if (erro) return res.status(500).json(...)
-     res.json(resultados);
- });
+ try {
+     const { rows } = await db.query(sql);
+     res.json(rows);
+ } catch (erro) {
+     return res.status(500).json(...)
+ }
```

### 5.3 `result.insertId` → `RETURNING id_*`
O MySQL devolve `insertId` automaticamente. No PostgreSQL, é necessário usar `RETURNING`:

```diff
- db.query('INSERT INTO USUARIO (...) VALUES (?,...)', params, (err, result) => {
-     const id = result.insertId;
- });
+ const result = await db.query('INSERT INTO USUARIO (...) VALUES ($1,...) RETURNING id_usuario', params);
+ const id = result.rows[0].id_usuario;
```

### 5.4 `result.affectedRows` → `result.rowCount`
```diff
- if (!r.affectedRows) return res.status(404).json(...)
+ if (!r.rowCount) return res.status(404).json(...)
```

### 5.5 `INSERT IGNORE` → `ON CONFLICT ... DO NOTHING`
```diff
- INSERT IGNORE INTO USUARIO (...)
+ INSERT INTO USUARIO (...) ON CONFLICT (email) DO NOTHING
```

### 5.6 `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO UPDATE`
```diff
- INSERT INTO PLATAFORMA_PROJETO (id, dados_json) VALUES (?, ?)
-   ON DUPLICATE KEY UPDATE dados_json = VALUES(dados_json)
+ INSERT INTO PLATAFORMA_PROJETO (id, dados_json) VALUES ($1, $2)
+   ON CONFLICT (id) DO UPDATE SET dados_json = EXCLUDED.dados_json, atualizado_em = CURRENT_TIMESTAMP
```

### 5.7 `TIMESTAMPDIFF()` → `EXTRACT(EPOCH FROM ...)`
A função de cálculo de horas entre datas foi convertida:

```diff
- TIMESTAMPDIFF(MINUTE, s.data_publicacao, MIN(p.data_proposta)) / 60 AS h
+ EXTRACT(EPOCH FROM (MIN(p.data_proposta) - s.data_publicacao)) / 3600.0 AS h
```

### 5.8 `INSERT ... VALUES ?` (batch) → `UNNEST`
O seed de projetos em batch foi convertido:

```diff
- db.query('INSERT IGNORE INTO PLATAFORMA_PROJETO (id, dados_json) VALUES ?', [values])
+ db.query(
+     'INSERT INTO PLATAFORMA_PROJETO (id, dados_json) SELECT * FROM UNNEST($1::varchar[], $2::text[]) ON CONFLICT (id) DO NOTHING',
+     [ids, jsons]
+ )
```

### 5.9 Código de erro de duplicata
```diff
- if (erroInsert.code === 'ER_DUP_ENTRY')
+ if (erro.code === '23505')
```

### 5.10 Aspas em strings SQL
Strings com aspas duplas dentro de SQL foram convertidas para aspas simples (padrão SQL):

```diff
- 'SELECT * FROM SERVICO WHERE status = "ABERTO"'
+ "SELECT * FROM SERVICO WHERE status = 'ABERTO'"
```

---

## 6. Comentários no Frontend

Todos os comentários em `js/main.js` e `html/perfil.html` que mencionavam "MySQL" foram atualizados para "PostgreSQL". São apenas comentários — nenhuma lógica de frontend foi alterada, pois o frontend se comunica apenas via API REST.

---

## 7. Como executar após a migração

### 7.1 Instalar o PostgreSQL
Se ainda não estiver instalado, baixe em [postgresql.org](https://www.postgresql.org/download/).

### 7.2 Criar o banco e as tabelas
```bash
createdb -U postgres freelink_db
psql -U postgres -d freelink_db -f freelink_db.sql
```

### 7.3 Instalar as dependências
```bash
npm install
```

### 7.4 Configurar o `.env`
Verifique se as credenciais no `.env` estão corretas para o seu PostgreSQL local:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=sua_senha_aqui
DB_PORT=5432
DB_NAME=freelink_db
```

### 7.5 Iniciar o servidor
```bash
node server.js
```

---

## 8. Observações

- O servidor também cria automaticamente as tabelas `PLATAFORMA_PROJETO`, `CHAT_SALA` e `CHAT_MENSAGEM` via código (função `garantirTabelasExtra`), então mesmo sem rodar o SQL completo, essas tabelas serão criadas ao iniciar.
- A função `semearUsuariosDemo()` insere os mesmos 4 usuários de demonstração que existiam antes.
- O frontend **não foi alterado em lógica** — apenas comentários. Todas as mudanças de banco são transparentes para o cliente, pois a comunicação é feita via API REST.
