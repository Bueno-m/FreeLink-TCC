// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors()); // Permite que seu frontend converse com este backend
app.use(express.json({ limit: '10mb' })); // Permite receber dados em formato JSON (inclui foto em base64)

// --- Sessão: token assinado com HMAC (validade de 30 dias) ---
const crypto = require('crypto');
const SEGREDO = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.AUTH_SECRET) console.warn('AVISO: defina AUTH_SECRET no .env para manter as sessões após reiniciar o servidor.');

function gerarTokenSessao(idUsuario) {
    const corpo = Buffer.from(JSON.stringify({ id: idUsuario, exp: Date.now() + 30 * 24 * 3600 * 1000 })).toString('base64url');
    const assinatura = crypto.createHmac('sha256', SEGREDO).update(corpo).digest('base64url');
    return corpo + '.' + assinatura;
}

function autenticar(req, res, next) {
    const [tipo, token] = (req.headers.authorization || '').split(' ');
    if (tipo !== 'Bearer' || !token || !token.includes('.')) return res.status(401).json({ erro: 'Não autenticado' });
    const [corpo, assinatura] = token.split('.');
    const esperada = crypto.createHmac('sha256', SEGREDO).update(corpo).digest('base64url');
    const a = Buffer.from(assinatura), b = Buffer.from(esperada);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ erro: 'Sessão inválida' });
    try {
        const dados = JSON.parse(Buffer.from(corpo, 'base64url').toString());
        if (!dados.id || dados.exp < Date.now()) return res.status(401).json({ erro: 'Sessão expirada' });
        req.idUsuario = dados.id;
        next();
    } catch (e) {
        res.status(401).json({ erro: 'Sessão inválida' });
    }
}

function lerPerfil(json) {
    try { return json ? JSON.parse(json) : {}; } catch (e) { return {}; }
}
const path = require('path');
app.use((req, res, next) => { res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups'); next(); });
app.use(express.static(path.join(__dirname, 'html'))); // Serve a pasta html/ (index.html) na raiz http://localhost:3000/
app.use(express.static(__dirname)); // Serve html/, css/, js/, img/ em http://localhost:3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Rota de exemplo: Buscar todos os serviços disponíveis
app.get('/api/servicos', async (req, res) => {
    try {
        const sql = "SELECT * FROM SERVICO WHERE status = 'ABERTO'";
        const { rows } = await db.query(sql);
        res.json(rows);
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao buscar serviços' });
    }
});

// Métricas reais da plataforma (tela inicial)
app.get('/api/metricas', async (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM SERVICO WHERE status = 'CONCLUIDO') AS projetos_concluidos,
            (SELECT COUNT(*) FROM USUARIO WHERE tipo_usuario = 'FREELANCER') AS profissionais,
            (SELECT AVG(nota) FROM AVALIACAO) AS media_avaliacoes,
            (SELECT COUNT(*) FROM AVALIACAO) AS total_avaliacoes,
            (SELECT COALESCE(SUM(valor), 0) FROM PAGAMENTO WHERE status = 'CONCLUIDO') AS total_repassado,
            (SELECT AVG(h) FROM (
                SELECT EXTRACT(EPOCH FROM (MIN(p.data_proposta) - s.data_publicacao)) / 3600.0 AS h
                FROM SERVICO s JOIN PROPOSTA p ON p.id_servico = s.id_servico
                GROUP BY s.id_servico, s.data_publicacao
            ) t) AS horas_primeira_proposta
    `;
    try {
        const { rows } = await db.query(sql);
        const r = rows[0];
        res.json({
            projetos_concluidos: Number(r.projetos_concluidos),
            profissionais: Number(r.profissionais),
            media_avaliacoes: r.media_avaliacoes === null ? null : Number(r.media_avaliacoes),
            total_avaliacoes: Number(r.total_avaliacoes),
            total_repassado: Number(r.total_repassado),
            horas_primeira_proposta: r.horas_primeira_proposta === null ? null : Number(r.horas_primeira_proposta)
        });
    } catch (erro) {
        console.error('Erro ao calcular métricas:', erro.message);
        return res.status(500).json({ erro: 'Erro ao buscar métricas' });
    }
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Decodifica o payload de um JWT do Google (usado como fallback local quando verifyIdToken falha por rede/relógio)
function decodificarJwtGoogle(token) {
    if (!token || typeof token !== 'string') return null;
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    try {
        const payload = JSON.parse(Buffer.from(partes[1], 'base64url').toString('utf8'));
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (clientId && payload.aud !== clientId) return null;
        if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) return null;
        if (!payload.email || !payload.sub) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

// Rota para Cadastro/Login com Google
app.post('/api/auth/google', async (req, res) => {
    const { token, tipo_usuario } = req.body || {}; // Recebe o token do Google e o tipo (Cliente/Freelancer)

    let payload = null;
    try {
        // 1. Verifica se o token é real e foi gerado pelo Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (errVerify) {
        console.warn('Aviso: verifyIdToken falhou (' + errVerify.message + '), usando decodificação local do JWT.');
        payload = decodificarJwtGoogle(token);
    }

    if (!payload || !payload.email) {
        return res.status(401).json({ erro: 'Token do Google inválido ou expirado.' });
    }

    // 2. Verifica se o usuário já existe no banco
    let resultados;
    try {
        const resBusca = await db.query('SELECT * FROM USUARIO WHERE LOWER(email) = LOWER($1)', [payload.email]);
        resultados = resBusca.rows;
    } catch (erro) {
        console.error('Erro no banco ao buscar usuário Google:', erro.message);
        return res.status(500).json({ erro: 'Erro no banco de dados: ' + erro.message });
    }

    if (resultados.length > 0) {
        // Usuário já existe, faz o login e devolve o perfil salvo no banco
        const u = resultados[0];
        if (!u.google_id && payload.sub) {
            try {
                await db.query('UPDATE USUARIO SET google_id = $1 WHERE id_usuario = $2', [payload.sub, u.id_usuario]);
            } catch (errUpd) {
                console.error('Erro ao atualizar google_id:', errUpd.message);
            }
        }
        const perfilSalvo = lerPerfil(u.perfil_json);
        if (perfilSalvo.foto === undefined && (u.foto_perfil || payload.picture)) {
            perfilSalvo.foto = u.foto_perfil || payload.picture;
        }
        return res.json({
            mensagem: 'Login realizado com sucesso',
            token: gerarTokenSessao(u.id_usuario),
            usuario: {
                id: u.id_usuario,
                nome: (perfilSalvo && perfilSalvo.nome) || u.nome,
                email: u.email,
                tipo_usuario: u.tipo_usuario,
                foto_perfil: u.foto_perfil || payload.picture || '',
                perfil: perfilSalvo
            }
        });
    } else {
        // Usuário ainda não existe no banco: cadastra automaticamente como FREELANCER (padrão para Google)
        const tipo = ['CLIENTE', 'FREELANCER'].includes(tipo_usuario) ? tipo_usuario : 'FREELANCER';

        const sqlCadastro = `
            INSERT INTO USUARIO (google_id, nome, email, foto_perfil, tipo_usuario) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_usuario
        `;

        try {
            const resultadoInsert = await db.query(sqlCadastro, [payload.sub, payload.name, payload.email, payload.picture, tipo]);
            const idUsuario = resultadoInsert.rows[0].id_usuario;
            res.json({
                mensagem: 'Conta conectada via Google!',
                novo_usuario: true,
                token: gerarTokenSessao(idUsuario),
                usuario: {
                    id: idUsuario,
                    nome: payload.name,
                    email: payload.email,
                    tipo_usuario: tipo,
                    foto_perfil: payload.picture || '',
                    perfil: {}
                }
            });
        } catch (erroInsert) {
            console.error('Erro ao cadastrar via Google:', erroInsert.message);
            return res.status(500).json({ erro: 'Erro ao cadastrar: ' + erroInsert.message });
        }
    }
});

// --- Hash e verificação de senha (scrypt nativo do Node.js) ---
function hashSenha(senha) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(String(senha), salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
}

function verificarSenha(senhaDigitada, senhaBanco) {
    if (!senhaBanco) return false;
    const str = String(senhaBanco);
    if (str.startsWith('scrypt:')) {
        const [, salt, hashHex] = str.split(':');
        if (!salt || !hashHex) return false;
        const hashTentativa = crypto.scryptSync(String(senhaDigitada), salt, 64);
        const hashSalvo = Buffer.from(hashHex, 'hex');
        return hashTentativa.length === hashSalvo.length && crypto.timingSafeEqual(hashTentativa, hashSalvo);
    }
    // Compatibilidade caso exista senha antiga em texto puro no banco
    return str === String(senhaDigitada);
}

// Rota para Cadastro com E-mail e Senha (Freelancer e Contratante/Empresa)
app.post('/api/auth/registro', async (req, res) => {
    const { nome, email, senha, tipo, perfil } = req.body || {};
    const emailLimpo = String(email || '').trim().toLowerCase();
    const nomeLimpo = String(nome || '').trim();

    if (!nomeLimpo || !emailLimpo || !senha || String(senha).length < 6) {
        return res.status(400).json({ erro: 'Nome, e-mail e senha (mín. 6 caracteres) são obrigatórios.' });
    }

    const tipoBanco = tipo === 'contratante' || tipo === 'CLIENTE' ? 'CLIENTE' : 'FREELANCER';
    const dadosPerfil = (perfil && typeof perfil === 'object' && !Array.isArray(perfil)) ? Object.assign({}, perfil) : {};
    ['id', 'senha', 'email', 'googleId', 'tipo', 'dbId'].forEach(k => delete dadosPerfil[k]);

    const telefoneDigitos = String(dadosPerfil.telefone || '').replace(/\D/g, '').slice(0, 11) || null;
    const cpfDigitos = tipoBanco === 'FREELANCER'
        ? (String(dadosPerfil.cpf || '').replace(/\D/g, '').slice(0, 11) || null)
        : null;
    const dataNasc = (dadosPerfil.dataNascimento || dadosPerfil.dataFundacao || '').slice(0, 10) || null;
    const bio = dadosPerfil.bio || dadosPerfil.sobreEmpresa || null;
    const linkPortfolio = (dadosPerfil.portfolioLink || dadosPerfil.site || '').slice(0, 255) || null;

    try {
        const { rows: existentes } = await db.query('SELECT id_usuario FROM USUARIO WHERE email = $1', [emailLimpo]);
        if (existentes.length > 0) {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado no FreeLink!' });
        }

        const senhaHash = hashSenha(senha);
        const sqlInsert = `
            INSERT INTO USUARIO (nome, email, senha, telefone, cpf, data_nasc, tipo_usuario, biografia, link_portfolio, perfil_json)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id_usuario
        `;
        const params = [
            nomeLimpo,
            emailLimpo,
            senhaHash,
            telefoneDigitos,
            cpfDigitos,
            dataNasc,
            tipoBanco,
            bio,
            linkPortfolio,
            JSON.stringify(dadosPerfil)
        ];

        const resultado = await db.query(sqlInsert, params);
        const idUsuario = resultado.rows[0].id_usuario;

        return res.status(201).json({
            mensagem: 'Cadastro realizado com sucesso!',
            novo_usuario: true,
            token: gerarTokenSessao(idUsuario),
            usuario: {
                id: idUsuario,
                nome: nomeLimpo,
                email: emailLimpo,
                tipo_usuario: tipoBanco,
                foto_perfil: '',
                perfil: dadosPerfil
            }
        });
    } catch (erro) {
        console.error('Erro ao cadastrar usuário:', erro.message);
        if (erro.code === '23505') {
            return res.status(409).json({ erro: 'E-mail ou CPF já cadastrado no sistema.' });
        }
        return res.status(500).json({ erro: 'Erro ao cadastrar usuário no banco de dados.' });
    }
});

// Rota para Login com E-mail e Senha
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body || {};
    const emailLimpo = String(email || '').trim().toLowerCase();

    if (!emailLimpo || !senha) {
        return res.status(400).json({ erro: 'Informe seu e-mail e senha.' });
    }

    try {
        const { rows: resultados } = await db.query('SELECT * FROM USUARIO WHERE email = $1', [emailLimpo]);
        if (!resultados.length) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const u = resultados[0];
        if (!u.senha) {
            return res.status(401).json({ erro: 'Esta conta foi criada com o Google. Use o botão "Continuar com Google" para entrar.' });
        }
        if (!verificarSenha(senha, u.senha)) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        return res.json({
            mensagem: 'Login realizado com sucesso!',
            token: gerarTokenSessao(u.id_usuario),
            usuario: {
                id: u.id_usuario,
                nome: u.nome,
                email: u.email,
                tipo_usuario: u.tipo_usuario,
                foto_perfil: u.foto_perfil || '',
                perfil: lerPerfil(u.perfil_json)
            }
        });
    } catch (erro) {
        console.error('Erro ao buscar usuário no login:', erro.message);
        return res.status(500).json({ erro: 'Erro no servidor.' });
    }
});

// Perfil do usuário logado (salvo no PostgreSQL, coluna USUARIO.perfil_json)
app.get('/api/perfil', autenticar, async (req, res) => {
    try {
        const { rows: r } = await db.query(
            'SELECT id_usuario, nome, email, tipo_usuario, foto_perfil, biografia, link_portfolio, perfil_json FROM USUARIO WHERE id_usuario = $1',
            [req.idUsuario]
        );
        if (!r.length) return res.status(404).json({ erro: 'Usuário não encontrado' });
        const u = r[0];
        const perfil = lerPerfil(u.perfil_json);
        if (!perfil.nome && u.nome) perfil.nome = u.nome;
        if (!perfil.bio && u.biografia) perfil.bio = u.biografia;
        if (!perfil.portfolioLink && u.link_portfolio) perfil.portfolioLink = u.link_portfolio;
        if (perfil.foto === undefined && u.foto_perfil) perfil.foto = u.foto_perfil;
        perfil.tipo = u.tipo_usuario === 'CLIENTE' ? 'contratante' : 'freelancer';
        res.json({
            perfil,
            usuario: {
                id: u.id_usuario,
                nome: perfil.nome || u.nome,
                email: u.email,
                tipo_usuario: u.tipo_usuario,
                foto_perfil: u.foto_perfil || ''
            }
        });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao buscar perfil' });
    }
});

app.put('/api/perfil', autenticar, async (req, res) => {
    const perfil = req.body && req.body.perfil;
    if (!perfil || typeof perfil !== 'object' || Array.isArray(perfil)) {
        return res.status(400).json({ erro: 'Perfil inválido' });
    }
    const tipoInformado = perfil.tipo === 'contratante' ? 'CLIENTE' : (perfil.tipo === 'freelancer' ? 'FREELANCER' : null);
    // Campos de identidade/segurança nunca são sobrescritos pelo cliente
    ['id', 'senha', 'email', 'googleId', 'dbId'].forEach(k => delete perfil[k]);

    const nomeNovo = String(perfil.nome || '').trim();
    const bioNova = perfil.bio !== undefined ? String(perfil.bio) : null;
    const linkNovo = perfil.portfolioLink || perfil.site || null;
    const fotoCurta = (typeof perfil.foto === 'string' && !perfil.foto.startsWith('data:') && perfil.foto.length <= 255)
        ? perfil.foto
        : null;

    const sql = `
        UPDATE USUARIO
        SET perfil_json = $1,
            nome = COALESCE(NULLIF($2, ''), nome),
            biografia = COALESCE($3, biografia),
            link_portfolio = COALESCE($4, link_portfolio),
            tipo_usuario = COALESCE($5, tipo_usuario),
            foto_perfil = COALESCE($6, foto_perfil)
        WHERE id_usuario = $7
    `;
    const params = [
        JSON.stringify(perfil),
        nomeNovo,
        bioNova,
        linkNovo ? String(linkNovo).slice(0, 255) : null,
        tipoInformado,
        fotoCurta,
        req.idUsuario
    ];

    try {
        const r = await db.query(sql, params);
        if (!r.rowCount) return res.status(404).json({ erro: 'Usuário não encontrado' });
        res.json({ mensagem: 'Perfil salvo', perfil });
    } catch (erro) {
        console.error('Erro ao salvar perfil:', erro.message);
        return res.status(500).json({ erro: 'Erro ao salvar perfil' });
    }
});

// ====================================================================
// USUÁRIOS PÚBLICOS (para abrir perfil em qualquer PC e listar contatos no chat)
// ====================================================================
function formatarUsuarioPublico(u) {
    const p = lerPerfil(u.perfil_json);
    return Object.assign({}, p, {
        id: 'db_' + u.id_usuario,
        dbId: u.id_usuario,
        nome: p.nome || u.nome,
        email: u.email,
        tipo: u.tipo_usuario === 'CLIENTE' ? 'contratante' : 'freelancer',
        foto: p.foto !== undefined ? p.foto : (u.foto_perfil || ''),
        bio: p.bio !== undefined ? p.bio : (u.biografia || ''),
        portfolioLink: p.portfolioLink || u.link_portfolio || ''
    });
}

app.get('/api/usuarios', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id_usuario, nome, email, tipo_usuario, foto_perfil, biografia, link_portfolio, perfil_json FROM USUARIO ORDER BY id_usuario DESC');
        res.json({ usuarios: rows.map(formatarUsuarioPublico) });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao listar usuários' });
    }
});

app.get('/api/usuarios/perfil', async (req, res) => {
    const rawId = String(req.query.id || '').trim();
    const email = String(req.query.email || '').trim().toLowerCase();
    const idNum = rawId.replace(/^(db_|google_)/, '');

    let sql = '';
    let param = '';
    if (email) {
        sql = 'SELECT id_usuario, nome, email, tipo_usuario, foto_perfil, biografia, link_portfolio, perfil_json FROM USUARIO WHERE email = $1';
        param = email;
    } else if (/^\d+$/.test(idNum)) {
        sql = 'SELECT id_usuario, nome, email, tipo_usuario, foto_perfil, biografia, link_portfolio, perfil_json FROM USUARIO WHERE id_usuario = $1';
        param = Number(idNum);
    } else {
        return res.status(400).json({ erro: 'Informe id ou email.' });
    }

    try {
        const { rows } = await db.query(sql, [param]);
        if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });
        res.json({ usuario: formatarUsuarioPublico(rows[0]) });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao buscar perfil' });
    }
});

// ====================================================================
// PROJETOS & PROPOSTAS NO POSTGRESQL (sincronizado entre navegadores/PCs)
// ====================================================================
app.get('/api/projetos', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT dados_json FROM PLATAFORMA_PROJETO ORDER BY criado_em DESC, id DESC');
        const projetos = rows.map(r => lerPerfil(r.dados_json)).filter(p => p && p.id);
        res.json({ projetos });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao buscar projetos' });
    }
});

app.post('/api/projetos/seed', async (req, res) => {
    const projetos = Array.isArray(req.body && req.body.projetos) ? req.body.projetos : [];
    if (!projetos.length) return res.json({ inseridos: 0 });
    try {
        const { rows: r } = await db.query('SELECT COUNT(*) AS total FROM PLATAFORMA_PROJETO');
        if (Number(r[0].total) > 0) return res.json({ inseridos: 0 });
        const ids = projetos.map(p => String(p.id));
        const jsons = projetos.map(p => JSON.stringify(p));
        await db.query(
            'INSERT INTO PLATAFORMA_PROJETO (id, dados_json) SELECT * FROM UNNEST($1::varchar[], $2::text[]) ON CONFLICT (id) DO NOTHING',
            [ids, jsons]
        );
        res.json({ inseridos: projetos.length });
    } catch (err) {
        return res.status(500).json({ erro: 'Erro ao semear projetos' });
    }
});

app.post('/api/projetos', async (req, res) => {
    const projeto = req.body && req.body.projeto;
    if (!projeto || !projeto.id) return res.status(400).json({ erro: 'Projeto inválido' });
    const sql = `
        INSERT INTO PLATAFORMA_PROJETO (id, dados_json)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET dados_json = EXCLUDED.dados_json, atualizado_em = CURRENT_TIMESTAMP
    `;
    try {
        await db.query(sql, [String(projeto.id), JSON.stringify(projeto)]);
        res.json({ mensagem: 'Projeto salvo', projeto });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao salvar projeto' });
    }
});

// ====================================================================
// CHAT DE CONVERSA REAL NO POSTGRESQL
// ====================================================================
async function garantirTabelasExtra() {
    const comandos = [
        `CREATE OR REPLACE FUNCTION atualizar_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.atualizado_em = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql`,
        `CREATE TABLE IF NOT EXISTS PLATAFORMA_PROJETO (
            id VARCHAR(80) PRIMARY KEY,
            dados_json TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `DROP TRIGGER IF EXISTS trg_plataforma_projeto_atualizado_em ON PLATAFORMA_PROJETO`,
        `CREATE TRIGGER trg_plataforma_projeto_atualizado_em
            BEFORE UPDATE ON PLATAFORMA_PROJETO
            FOR EACH ROW
            EXECUTE FUNCTION atualizar_timestamp()`,
        `CREATE TABLE IF NOT EXISTS CHAT_SALA (
            id_sala VARCHAR(120) PRIMARY KEY,
            titulo VARCHAR(200),
            projeto_id VARCHAR(80),
            proposta_id VARCHAR(80),
            participante1_email VARCHAR(150),
            participante1_nome VARCHAR(150),
            participante2_email VARCHAR(150),
            participante2_nome VARCHAR(150),
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `DROP TRIGGER IF EXISTS trg_chat_sala_atualizado_em ON CHAT_SALA`,
        `CREATE TRIGGER trg_chat_sala_atualizado_em
            BEFORE UPDATE ON CHAT_SALA
            FOR EACH ROW
            EXECUTE FUNCTION atualizar_timestamp()`,
        `CREATE TABLE IF NOT EXISTS CHAT_MENSAGEM (
            id_mensagem SERIAL PRIMARY KEY,
            id_sala VARCHAR(120) NOT NULL,
            remetente_id VARCHAR(80),
            remetente_email VARCHAR(150),
            remetente_nome VARCHAR(150) NOT NULL,
            conteudo TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS idx_chat_sala ON CHAT_MENSAGEM (id_sala, id_mensagem)`
    ];
    for (const sql of comandos) {
        try {
            await db.query(sql);
        } catch (err) {
            console.error('Erro ao criar tabela/trigger auxiliar:', err.message);
        }
    }
    await semearUsuariosDemo();
}

async function semearUsuariosDemo() {
    const demos = [
        {
            nome: 'Lucas Desenvolvedor',
            email: 'lucas@freelink.com',
            senha: '123456',
            tipo: 'FREELANCER',
            perfil: {
                nome: 'Lucas Desenvolvedor',
                especialidade: 'Desenvolvedor Front-End & UI/UX',
                localizacao: 'São Paulo - SP (Remoto)',
                taxaHoraria: '85,00',
                disponibilidade: '30-40 horas/semana',
                tempoResposta: '< 1 hora',
                bio: 'Desenvolvedor Front-End especializado na criação de interfaces web modernas, responsivas e de alta conversão.',
                habilidades: 'HTML5, CSS3, JavaScript Vanilla, UI/UX Design, Figma, Mobile First, Performance Web, Git',
                experienciaTexto: 'Engenheiro Front-End Pleno\nTechLabs Soluções\n2022 - Atual\nDesenvolvimento de interfaces SaaS e landing pages com foco em Core Web Vitals.',
                portfolioTexto: 'Plataforma SaaS de Gestão Financeira\nDashboard moderna desenvolvida com foco em alta usabilidade e performance.\nHTML5, CSS3, JavaScript, Charts'
            }
        },
        {
            nome: 'Aluno TCC FreeLink',
            email: 'aluno@freelink.com',
            senha: '123456',
            tipo: 'FREELANCER',
            perfil: {
                nome: 'Aluno TCC FreeLink',
                especialidade: 'Desenvolvedor Full Stack & Mobile',
                localizacao: 'Brasil (Remoto)',
                taxaHoraria: '70,00',
                disponibilidade: '20-30 horas/semana',
                tempoResposta: '< 2 horas',
                bio: 'Estudante e entusiasta de tecnologia focado em desenvolvimento web moderno, modular e acessível.',
                habilidades: 'HTML5, CSS3, JavaScript, Node.js, Banco de Dados, Git, APIs REST',
                experienciaTexto: 'Desenvolvedor de Software Freelancer\nAutônomo\n2023 - Atual\nDesenvolvimento de projetos acadêmicos e soluções web sob medida.',
                portfolioTexto: 'Portal de Vagas e Marketplace Freelance\nSistema web completo desenvolvido com Vanilla JS e PostgreSQL.\nHTML5, CSS3, JavaScript, Node.js'
            }
        },
        {
            nome: 'Admin FreeLink',
            email: 'admin@freelink.com',
            senha: 'admin',
            tipo: 'CLIENTE',
            perfil: {
                nome: 'Admin FreeLink',
                especialidade: 'Gestor de Projetos',
                localizacao: 'São Paulo - SP',
                disponibilidade: 'Tempo Integral',
                tempoResposta: '< 1 hora',
                bio: 'Administrador da plataforma e gestor de demandas corporativas.',
                habilidades: 'Gestão Ágil, Scrum, Liderança de Equipes'
            }
        },
        {
            nome: 'TechStart Soluções',
            email: 'contato@techstart.com',
            senha: '123456',
            tipo: 'CLIENTE',
            perfil: {
                nome: 'TechStart Soluções',
                especialidade: 'Empresa de Tecnologia & Inovação',
                localizacao: 'São Paulo - SP',
                disponibilidade: 'Horário Comercial',
                tempoResposta: '< 1 hora',
                bio: 'Startup em rápido crescimento focada em soluções SaaS e inteligência digital para empresas.',
                habilidades: 'Gestão de Projetos, Inovação, SaaS, Metodologias Ágeis'
            }
        }
    ];

    for (const d of demos) {
        try {
            const { rows } = await db.query('SELECT id_usuario FROM USUARIO WHERE LOWER(email) = $1', [d.email]);
            if (rows && rows.length > 0) continue;
            const senhaHash = hashSenha(d.senha);
            await db.query(
                'INSERT INTO USUARIO (nome, email, senha, tipo_usuario, biografia, perfil_json) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
                [d.nome, d.email, senhaHash, d.tipo, d.perfil.bio, JSON.stringify(d.perfil)]
            );
        } catch (err) {
            console.error('Erro ao semear usuário demo:', err.message);
        }
    }
}
garantirTabelasExtra();

function formatarMsgChat(m) {
    const d = m.criado_em ? new Date(m.criado_em) : new Date();
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return {
        id: m.id_mensagem,
        remetenteId: m.remetente_id,
        remetenteEmail: m.remetente_email || '',
        remetenteNome: m.remetente_nome,
        texto: m.conteudo,
        dataHora: hora,
        criadoEm: m.criado_em
    };
}

// Lista conversas do usuário autenticado
app.get('/api/chats', autenticar, async (req, res) => {
    try {
        const { rows: rowsU } = await db.query('SELECT email FROM USUARIO WHERE id_usuario = $1', [req.idUsuario]);
        if (!rowsU.length) return res.status(401).json({ erro: 'Usuário inválido' });
        const email = String(rowsU[0].email || '').toLowerCase();
        const sql = `
            SELECT * FROM (
                SELECT s.*,
                       (SELECT m.id_mensagem FROM CHAT_MENSAGEM m WHERE m.id_sala = s.id_sala ORDER BY m.id_mensagem DESC LIMIT 1) AS ultimo_id_mensagem,
                       (SELECT m.conteudo FROM CHAT_MENSAGEM m WHERE m.id_sala = s.id_sala ORDER BY m.id_mensagem DESC LIMIT 1) AS ultima_mensagem,
                       (SELECT m.remetente_nome FROM CHAT_MENSAGEM m WHERE m.id_sala = s.id_sala ORDER BY m.id_mensagem DESC LIMIT 1) AS ultimo_remetente,
                       (SELECT m.remetente_email FROM CHAT_MENSAGEM m WHERE m.id_sala = s.id_sala ORDER BY m.id_mensagem DESC LIMIT 1) AS ultimo_remetente_email,
                       (SELECT m.criado_em FROM CHAT_MENSAGEM m WHERE m.id_sala = s.id_sala ORDER BY m.id_mensagem DESC LIMIT 1) AS ultima_data
                FROM CHAT_SALA s
                WHERE LOWER(s.participante1_email) = $1 OR LOWER(s.participante2_email) = $1
            ) AS conversas
            ORDER BY COALESCE(conversas.ultima_data, conversas.atualizado_em) DESC
        `;
        const { rows: salas } = await db.query(sql, [email]);
        res.json({ chats: salas });
    } catch (erro) {
        console.error('Erro ao buscar conversas:', erro.message);
        return res.status(500).json({ erro: 'Erro ao buscar conversas' });
    }
});

// Abre ou cria uma sala de chat e retorna suas mensagens
app.post('/api/chats/abrir', autenticar, async (req, res) => {
    const { idSala, titulo, projetoId, propostaId, outroEmail, outroNome, mensagemSistema, mensagemBot } = req.body || {};
    if (!idSala) return res.status(400).json({ erro: 'idSala obrigatório' });
    const salaId = String(idSala).slice(0, 120);
    const isSalaBot = salaId.startsWith('bot_');

    try {
        const { rows: rowsU } = await db.query('SELECT id_usuario, nome, email, perfil_json FROM USUARIO WHERE id_usuario = $1', [req.idUsuario]);
        if (!rowsU.length) return res.status(401).json({ erro: 'Usuário inválido' });
        const eu = rowsU[0];
        const meuPerfil = lerPerfil(eu.perfil_json);
        const meuNome = meuPerfil.nome || eu.nome;
        const meuEmail = String(eu.email || '').toLowerCase();
        const emailOutro = isSalaBot ? 'bot@freelink.com' : String(outroEmail || '').trim().toLowerCase();
        const nomeOutro = isSalaBot ? 'Assistente FreeLink' : String(outroNome || '').slice(0, 150);
        const tituloSala = String(titulo || (isSalaBot ? 'Assistente de Perfil' : 'Conversa FreeLink')).slice(0, 200);

        const { rows: rowsSala } = await db.query('SELECT * FROM CHAT_SALA WHERE id_sala = $1', [salaId]);

        if (!rowsSala.length) {
            const sqlInsert = `
                INSERT INTO CHAT_SALA (id_sala, titulo, projeto_id, proposta_id, participante1_email, participante1_nome, participante2_email, participante2_nome)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id_sala) DO NOTHING
            `;
            await db.query(
                sqlInsert,
                [salaId, tituloSala, projetoId ? String(projetoId).slice(0, 80) : null, propostaId ? String(propostaId).slice(0, 80) : null, meuEmail, meuNome, emailOutro, nomeOutro]
            );
        } else {
            const atual = rowsSala[0];
            let p1Email = String(atual.participante1_email || '').toLowerCase();
            let p1Nome = atual.participante1_nome || '';
            let p2Email = String(atual.participante2_email || '').toLowerCase();
            let p2Nome = atual.participante2_nome || '';

            if (p1Email === meuEmail) {
                p1Nome = meuNome || p1Nome;
                if (!p2Email && emailOutro && emailOutro !== meuEmail) p2Email = emailOutro;
                if (!p2Nome && nomeOutro) p2Nome = nomeOutro;
            } else if (p2Email === meuEmail) {
                p2Nome = meuNome || p2Nome;
                if (!p1Email && emailOutro && emailOutro !== meuEmail) p1Email = emailOutro;
                if (!p1Nome && nomeOutro) p1Nome = nomeOutro;
            } else if (!p1Email) {
                p1Email = meuEmail;
                p1Nome = meuNome;
            } else if (!p2Email) {
                p2Email = meuEmail;
                p2Nome = meuNome;
            }

            await db.query(
                "UPDATE CHAT_SALA SET titulo = COALESCE(NULLIF($1, ''), titulo), participante1_email = $2, participante1_nome = $3, participante2_email = $4, participante2_nome = $5, atualizado_em = CURRENT_TIMESTAMP WHERE id_sala = $6",
                [titulo ? tituloSala : '', p1Email, p1Nome, p2Email, p2Nome, salaId]
            );
        }

        const { rows: msgs } = await db.query('SELECT * FROM CHAT_MENSAGEM WHERE id_sala = $1 ORDER BY id_mensagem ASC', [salaId]);
        const textoInicial = mensagemBot || mensagemSistema;
        if (msgs.length === 0 && textoInicial) {
            const remId = mensagemBot ? 'bot' : 'sistema';
            const remEmail = mensagemBot ? 'bot@freelink.com' : '';
            const remNome = mensagemBot ? 'Assistente FreeLink' : 'FreeLink';
            try {
                const resSys = await db.query(
                    'INSERT INTO CHAT_MENSAGEM (id_sala, remetente_id, remetente_email, remetente_nome, conteudo) VALUES ($1, $2, $3, $4, $5) RETURNING id_mensagem',
                    [salaId, remId, remEmail, remNome, String(textoInicial)]
                );
                return res.json({
                    mensagens: [{
                        id: resSys.rows[0].id_mensagem,
                        remetenteId: remId,
                        remetenteEmail: remEmail,
                        remetenteNome: remNome,
                        texto: String(textoInicial),
                        dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    }]
                });
            } catch (erroSys) {
                return res.json({ mensagens: [] });
            }
        }
        return res.json({ mensagens: msgs.map(formatarMsgChat) });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao abrir sala de chat' });
    }
});

// Busca mensagens de uma sala (para atualização em tempo real / polling)
app.get('/api/chats/:chatId/mensagens', autenticar, async (req, res) => {
    const chatId = String(req.params.chatId || '');
    const aposId = Number(req.query.apos || 0);
    const sql = aposId > 0
        ? 'SELECT * FROM CHAT_MENSAGEM WHERE id_sala = $1 AND id_mensagem > $2 ORDER BY id_mensagem ASC'
        : 'SELECT * FROM CHAT_MENSAGEM WHERE id_sala = $1 ORDER BY id_mensagem ASC';
    const params = aposId > 0 ? [chatId, aposId] : [chatId];

    try {
        const { rows: msgs } = await db.query(sql, params);
        res.json({ mensagens: msgs.map(formatarMsgChat) });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao buscar mensagens' });
    }
});

// Envia uma nova mensagem real na sala
app.post('/api/chats/:chatId/mensagens', autenticar, async (req, res) => {
    const chatId = String(req.params.chatId || '').slice(0, 120);
    const { texto, sistema, bot, titulo, projetoId, propostaId, outroEmail, outroNome } = req.body || {};
    const conteudo = String(texto || '').trim();
    if (!conteudo) return res.status(400).json({ erro: 'Mensagem vazia' });
    const isMsgBot = Boolean(bot && chatId.startsWith('bot_'));

    try {
        const { rows: rowsU } = await db.query('SELECT id_usuario, nome, email, perfil_json FROM USUARIO WHERE id_usuario = $1', [req.idUsuario]);
        if (!rowsU.length) return res.status(401).json({ erro: 'Usuário inválido' });
        const eu = rowsU[0];
        const meuPerfil = lerPerfil(eu.perfil_json);
        const meuNome = meuPerfil.nome || eu.nome;
        const meuEmail = String(eu.email || '').toLowerCase();
        const remetenteId = isMsgBot ? 'bot' : (sistema ? 'sistema' : ('db_' + eu.id_usuario));
        const remetenteEmail = isMsgBot ? 'bot@freelink.com' : (sistema ? '' : meuEmail);
        const remetenteNome = isMsgBot ? 'Assistente FreeLink' : (sistema ? 'FreeLink' : meuNome);

        // Garante que a sala exista mesmo se a mensagem for enviada antes de /api/chats/abrir responder
        await db.query(
            'INSERT INTO CHAT_SALA (id_sala, titulo, projeto_id, proposta_id, participante1_email, participante1_nome, participante2_email, participante2_nome) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id_sala) DO NOTHING',
            [
                chatId,
                String(titulo || 'Conversa FreeLink').slice(0, 200),
                projetoId ? String(projetoId).slice(0, 80) : null,
                propostaId ? String(propostaId).slice(0, 80) : null,
                meuEmail,
                meuNome,
                String(outroEmail || '').trim().toLowerCase(),
                String(outroNome || '').slice(0, 150)
            ]
        );

        const rIns = await db.query(
            'INSERT INTO CHAT_MENSAGEM (id_sala, remetente_id, remetente_email, remetente_nome, conteudo) VALUES ($1, $2, $3, $4, $5) RETURNING id_mensagem',
            [chatId, remetenteId, remetenteEmail, remetenteNome, conteudo]
        );

        await db.query('UPDATE CHAT_SALA SET atualizado_em = CURRENT_TIMESTAMP WHERE id_sala = $1', [chatId]);

        res.status(201).json({
            mensagem: {
                id: rIns.rows[0].id_mensagem,
                remetenteId,
                remetenteEmail,
                remetenteNome,
                texto: conteudo,
                dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }
        });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao enviar mensagem' });
    }
});
