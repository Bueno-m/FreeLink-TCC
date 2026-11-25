/**
 * ====================================================================
 * FREELINK - SISTEMA DE GERENCIAMENTO DE PROJETOS E FREELANCERS (TCC)
 * JavaScript Vanilla puro (sem dependências ou frameworks)
 * ====================================================================
 * 
 * Módulos:
 * 1. Chaves de Armazenamento & Base Seed (freelink_user, freelink_projects, freelink_users)
 * 2. Helpers de Autenticação e Guarda de Rotas (Route Guards)
 * 3. Sistema de Notificações Flutuantes (Toasts) & Mensagens Flash
 * 4. Sistema de Temas (Modo Escuro / Modo Claro)
 * 5. Navbar Dinâmica & Menu Mobile Hambúrguer
 * 6. Controle da Página Inicial (Landing Page Vitrine vs Feed Autenticado)
 * 7. Formulário de Cadastro (registro.html) & Validações
 * 8. Formulário de Login (login.html) & Feedback de Erro
 * 9. Publicação de Projetos (postar-trabalho.html)
 * 10. Detalhes do Projeto & Envio de Proposta (detalhes-projeto.html)
 * 11. Tela de Configurações (configuracoes.html)
 * 12. Inicialização Global
 */

// ====================================================================
// 1. CHAVES DE ARMAZENAMENTO & BASE SEED
// ====================================================================

// Redireciona automaticamente caso a página seja aberta pelo Live Server (127.0.0.1:5500) ou file://,
// garantindo que sempre rode em http://localhost:3000 (exigido pelo Google OAuth e pelas rotas /api/*).
(function garantirOrigemServidor() {
  try {
    const loc = window.location;
    if (loc.hostname === '127.0.0.1' || (loc.hostname === 'localhost' && loc.port && loc.port !== '3000')) {
      const caminho = loc.pathname.replace(/^\/Freelink(?=\/)/i, '');
      loc.replace('http://localhost:3000' + caminho + loc.search + loc.hash);
    }
  } catch (e) {}
})();

const STORAGE_KEYS = {
  USER: 'freelink_user',
  PROJECTS: 'freelink_projects',
  USERS: 'freelink_users',
  THEME: 'freelink_tema',
  LOCATION: 'freelink_localizacao',
  NOTIFICATIONS: 'freelink_notificacoes',
  CHATS: 'freelink_chats',
  // Legado para compatibilidade retroativa
  LEGACY_USER: 'freelink_usuario_logado',
  LEGACY_PROJECTS: 'freelink_trabalhos',
  LEGACY_USERS: 'freelink_usuarios'
};

// Seed de Usuários Padrão para Demonstração no TCC
const USUARIOS_SEED = [
  {
    id: "user_freelancer_1",
    nome: "Lucas Desenvolvedor",
    email: "lucas@freelink.com",
    senha: "123456",
    tipo: "freelancer",
    foto: "",
    especialidade: "Desenvolvedor Front-End & UI/UX",
    localizacao: "São Paulo - SP (Remoto)",
    taxaHoraria: "85,00",
    disponibilidade: "30-40 horas/semana",
    tempoResposta: "< 1 hora",
    bio: "Desenvolvedor Front-End especializado na criação de interfaces web modernas, responsivas e de alta conversão. Ampla experiência em HTML5 semântico, CSS3 e JavaScript Vanilla de alta performance.",
    habilidades: "HTML5, CSS3, JavaScript Vanilla, UI/UX Design, Figma, Mobile First, Performance Web, Git",
    idiomas: "Português (Nativo)\nInglês (Avançado)",
    certificações: "Certificação Frontend Web Expert - 2024\nUI/UX Specialist Certificate - 2023",
    experienciaTexto: "Engenheiro Front-End Pleno\nTechLabs Soluções\n2022 - Atual\nDesenvolvimento de interfaces SaaS e landing pages com foco em Core Web Vitals.\n\nDesenvolvedor Web Jr\nAgência Criativa Alpha\n2020 - 2022\nCriação de websites responsivos e manutenção de aplicações web para clientes de e-commerce.",
    portfolioTexto: "Plataforma SaaS de Gestão Financeira\nDashboard moderna desenvolvida com foco em alta usabilidade e performance.\nHTML5, CSS3, JavaScript, Charts\n\nLanding Page de Alta Conversão\nPágina de lançamento para produto digital com taxa de conversão superior a 14%.\nMobile First, SEO, CSS Grid, A/B Testing",
    avaliacoes: [
      {
        id: "aval_seed_1",
        autor: "TechStart Soluções",
        projeto: "Desenvolvimento de Landing Page",
        estrelas: 5,
        comentario: "Excelente profissional! Entregou antes do prazo com fidelidade visual perfeita e código extremamente limpo.",
        tags: ["Pontualidade", "Qualidade Técnica", "Comunicação Clara"],
        data: "Há 2 semanas"
      },
      {
        id: "aval_seed_2",
        autor: "Studio Criativo Digital",
        projeto: "Interface Web Responsiva",
        estrelas: 5,
        comentario: "Muito prestativo, comunicação ágil e trabalho impecável. Recomendo com certeza!",
        tags: ["Proatividade", "Qualidade Técnica", "Recomendo"],
        data: "Há 1 mês"
      }
    ]
  },
  {
    id: "user_freelancer_2",
    nome: "Aluno TCC FreeLink",
    email: "aluno@freelink.com",
    senha: "123456",
    tipo: "freelancer",
    foto: "",
    especialidade: "Desenvolvedor Full Stack & Mobile",
    localizacao: "Brasil (Remoto)",
    taxaHoraria: "70,00",
    disponibilidade: "20-30 horas/semana",
    tempoResposta: "< 2 horas",
    bio: "Estudante e entusiasta de tecnologia focado em desenvolvimento web moderno, modular e acessível. Comprometido com padrões web limpos e soluções práticas.",
    habilidades: "HTML5, CSS3, JavaScript, Node.js, Banco de Dados, Git, APIs REST",
    idiomas: "Português (Nativo)\nInglês (Intermediário)",
    certificações: "Bootcamp Full Stack Web - 2024",
    experienciaTexto: "Desenvolvedor de Software Freelancer\nAutônomo\n2023 - Atual\nDesenvolvimento de projetos acadêmicos e soluções web sob medida.",
    portfolioTexto: "Portal de Vagas e Marketplace Freelance\nSistema web completo desenvolvido com Vanilla JS e persistência local.\nHTML5, CSS3, JavaScript Vanilla",
    avaliacoes: [
      {
        id: "aval_seed_3",
        autor: "E-commerce Bem Estar",
        projeto: "Otimização de Página Web",
        estrelas: 5,
        comentario: "Excelente dedicação e pontualidade na entrega dos entregáveis.",
        tags: ["Pontualidade", "Comprometimento"],
        data: "Há 3 semanas"
      }
    ]
  },
  {
    id: "user_client_1",
    nome: "Admin FreeLink",
    email: "admin@freelink.com",
    senha: "admin",
    tipo: "contratante",
    foto: "",
    especialidade: "Gestor de Projetos",
    localizacao: "São Paulo - SP",
    taxaHoraria: "",
    disponibilidade: "Tempo Integral",
    tempoResposta: "< 1 hora",
    bio: "Administrador da plataforma e gestor de demandas corporativas.",
    habilidades: "Gestão Ágil, Scrum, Liderança de Equipes",
    avaliacoes: []
  },
  {
    id: "user_client_2",
    nome: "TechStart Soluções",
    email: "contato@techstart.com",
    senha: "123456",
    tipo: "contratante",
    foto: "",
    especialidade: "Empresa de Tecnologia & Inovação",
    localizacao: "São Paulo - SP",
    taxaHoraria: "",
    disponibilidade: "Horário Comercial",
    tempoResposta: "< 1 hora",
    bio: "Startup em rápido crescimento focada em soluções SaaS e inteligência digital para empresas.",
    habilidades: "Gestão de Projetos, Inovação, SaaS, Metodologias Ágeis",
    avaliacoes: [
      {
        id: "aval_seed_4",
        autor: "Lucas Desenvolvedor",
        projeto: "Landing Page Responsiva",
        estrelas: 5,
        comentario: "Cliente nota 10! Briefing detalhado, comunicação clara e suporte excelente durante o desenvolvimento.",
        tags: ["Briefing Claro", "Pagamento Pontual", "Boa Comunicação"],
        data: "Há 1 semana"
      }
    ]
  }
];

// Seed de Projetos Padrão com Tags de Habilidades e Propostas
const PROJETOS_SEED = [
  {
    id: "1",
    titulo: "Criação de Identidade Visual e Logotipo Moderno",
    categoria: "Design & UI/UX",
    empresa: "Studio Criativo Digital",
    localizacao: "Remoto / Rio de Janeiro",
    orcamento: "850,00",
    prazo: "10 dias",
    modalidade: "Remoto",
    habilidades: ["Figma", "Adobe Illustrator", "Identidade Visual", "Branding"],
    propostas: 14,
    listaPropostas: [],
    dataPublicacao: "Publicado há 2 dias",
    descricao: "Estamos buscando um designer gráfico experiente para desenvolver a nova identidade visual da nossa marca. O trabalho inclui logotipo principal, variações de cores para modo claro e escuro, tipografia oficial, paleta de cores hexadecimal e entrega dos arquivos editáveis vetoriais (.AI, .EPS, .SVG)."
  },
  {
    id: "2",
    titulo: "Desenvolvimento de Landing Page Responsiva",
    categoria: "Programação & Tecnologia",
    empresa: "TechStart Soluções",
    criadorId: "user_client_2",
    criadorEmail: "contato@techstart.com",
    statusContratacao: "aberto",
    freelancerContratado: null,
    localizacao: "Remoto / São Paulo",
    orcamento: "2.400,00",
    prazo: "15 dias",
    modalidade: "Remoto",
    habilidades: ["HTML5", "CSS3", "JavaScript Vanilla", "Mobile First", "UI/UX"],
    propostas: 2,
    listaPropostas: [
      {
        id: "prop_seed_1",
        usuarioId: "user_freelancer_1",
        usuarioNome: "Lucas Desenvolvedor",
        usuarioEmail: "lucas@freelink.com",
        usuarioFoto: "",
        valor: "2.200,00",
        prazo: "12 dias",
        mensagem: "Olá equipe TechStart! Sou especialista em Front-end com foco em HTML5 semântico, CSS3 moderno e JS Vanilla. Tenho ampla experiência no desenvolvimento de Landing Pages de alta conversão, responsivas e otimizadas para SEO. Posso iniciar de imediato!",
        status: "pendente",
        data: "Hoje"
      },
      {
        id: "prop_seed_2",
        usuarioId: "user_freelancer_2",
        usuarioNome: "Aluno TCC FreeLink",
        usuarioEmail: "aluno@freelink.com",
        usuarioFoto: "",
        valor: "2.400,00",
        prazo: "15 dias",
        mensagem: "Olá! Possuo experiência completa em desenvolvimento Web e entrega de interfaces modernas. Posso garantir um código limpo, modular e de fácil manutenção para o seu SaaS.",
        status: "pendente",
        data: "Ontem"
      }
    ],
    dataPublicacao: "Publicado ontem",
    descricao: "Precisamos de um desenvolvedor front-end para criar uma Landing Page moderna de alta conversão para o lançamento do nosso novo produto SaaS. A página deve ser 100% responsiva (mobile, tablet e desktop), otimizada para SEO e velocidade de carregamento (Core Web Vitals), contendo formulário de captura e depoimentos."
  },
  {
    id: "3",
    titulo: "Edição e Motion Graphics para Vídeos de Redes Sociais",
    categoria: "Vídeo & Animação",
    empresa: "Agência Viraliza",
    localizacao: "Remoto / Minas Gerais",
    orcamento: "1.200,00",
    prazo: "7 dias",
    modalidade: "Remoto",
    habilidades: ["Premiere Pro", "After Effects", "Motion Graphics", "Reels", "TikTok"],
    propostas: 19,
    listaPropostas: [],
    dataPublicacao: "Publicado hoje",
    descricao: "Procuramos um editor de vídeo criativo para produzir um pacote de 10 vídeos curtos (Reels, TikTok e Shorts). Forneceremos as gravações brutas e os roteiros. O editor será responsável por cortes dinâmicos, legendas sincronizadas estilizadas, efeitos sonoros (SFX) e motion graphics."
  },
  {
    id: "4",
    titulo: "Redação de Artigos Especializados sobre Tecnologia e IA",
    categoria: "Redação & Tradução",
    empresa: "Portal Futuro Tech",
    localizacao: "Remoto / Curitiba",
    orcamento: "600,00",
    prazo: "5 dias",
    modalidade: "Remoto",
    habilidades: ["SEO", "Copywriting", "Inteligência Artificial", "Redação Web"],
    propostas: 6,
    listaPropostas: [],
    dataPublicacao: "Publicado há 3 dias",
    descricao: "Buscamos redator com excelente domínio da língua portuguesa e conhecimento em inteligência artificial para redigir 4 artigos aprofundados (cerca de 1.500 palavras cada) com foco em SEO, legibilidade e boas práticas editoriais para nosso portal de notícias."
  },
  {
    id: "5",
    titulo: "Campanha Completa de Tráfego Pago (Meta Ads & Google)",
    categoria: "Marketing Digital",
    empresa: "E-commerce Bem Estar",
    localizacao: "Remoto / São Paulo",
    orcamento: "1.800,00",
    prazo: "20 dias",
    modalidade: "Remoto",
    habilidades: ["Google Ads", "Meta Ads", "Tráfego Pago", "Copywriting", "Pixel"],
    propostas: 11,
    listaPropostas: [],
    dataPublicacao: "Publicado há 1 dia",
    descricao: "Estamos expandindo nossas operações de e-commerce e buscamos um gestor de tráfego qualificado para planejar, configurar e otimizar campanhas de conversão no Facebook Ads, Instagram Ads e Google Ads, visando maximizar o ROAS."
  }
];

/**
 * Inicializa a base mockada no LocalStorage caso ainda não exista
 */
function inicializarSeedBanco() {
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS) && !localStorage.getItem(STORAGE_KEYS.LEGACY_PROJECTS)) {
    salvarProjetos(PROJETOS_SEED);
  } else if (!localStorage.getItem(STORAGE_KEYS.PROJECTS) && localStorage.getItem(STORAGE_KEYS.LEGACY_PROJECTS)) {
    try {
      const leg = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEGACY_PROJECTS));
      salvarProjetos(leg);
    } catch (e) {
      salvarProjetos(PROJETOS_SEED);
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS) && !localStorage.getItem(STORAGE_KEYS.LEGACY_USERS)) {
    salvarUsuarios(USUARIOS_SEED);
  } else if (!localStorage.getItem(STORAGE_KEYS.USERS) && localStorage.getItem(STORAGE_KEYS.LEGACY_USERS)) {
    try {
      const legU = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEGACY_USERS));
      salvarUsuarios(legU);
    } catch (e) {
      salvarUsuarios(USUARIOS_SEED);
    }
  }
}

function obterProjetos() {
  const dados = localStorage.getItem(STORAGE_KEYS.PROJECTS) || localStorage.getItem(STORAGE_KEYS.LEGACY_PROJECTS);
  if (!dados) {
    salvarProjetos(PROJETOS_SEED);
    return PROJETOS_SEED;
  }
  try {
    const list = JSON.parse(dados);
    let mod = false;
    list.forEach(p => {
      if (!Array.isArray(p.listaPropostas)) {
        p.listaPropostas = [];
        mod = true;
      }
      if (String(p.id) === "2") {
        if (!p.criadorId) {
          p.criadorId = "user_client_2";
          p.criadorEmail = "contato@techstart.com";
          mod = true;
        }
        if (p.listaPropostas.length === 0) {
          p.listaPropostas = [
            {
              id: "prop_seed_1",
              usuarioId: "user_freelancer_1",
              usuarioNome: "Lucas Desenvolvedor",
              usuarioEmail: "lucas@freelink.com",
              usuarioFoto: "",
              valor: "2.200,00",
              prazo: "12 dias",
              mensagem: "Olá equipe TechStart! Sou especialista em Front-end com foco em HTML5 semântico, CSS3 moderno e JS Vanilla. Tenho ampla experiência no desenvolvimento de Landing Pages de alta conversão, responsivas e otimizadas para SEO. Posso iniciar de imediato!",
              status: "pendente",
              data: "Hoje"
            },
            {
              id: "prop_seed_2",
              usuarioId: "user_freelancer_2",
              usuarioNome: "Aluno TCC FreeLink",
              usuarioEmail: "aluno@freelink.com",
              usuarioFoto: "",
              valor: "2.400,00",
              prazo: "15 dias",
              mensagem: "Olá! Possuo experiência completa em desenvolvimento Web e entrega de interfaces modernas. Posso garantir um código limpo, modular e de fácil manutenção para o seu SaaS.",
              status: "pendente",
              data: "Ontem"
            }
          ];
          p.propostas = p.listaPropostas.length;
          mod = true;
        }
      }
    });
    if (mod) {
      salvarProjetos(list);
    }
    return list;
  } catch (e) {
    return PROJETOS_SEED;
  }
}

function salvarProjetos(projetos, projetoAlterado) {
  const json = JSON.stringify(projetos);
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, json);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_PROJECTS);
  } catch (e) {}
  if (projetoAlterado && projetoAlterado.id) {
    salvarProjetoNoServidor(projetoAlterado);
  }
}

async function salvarProjetoNoServidor(projeto) {
  if (!projeto || !projeto.id) return;
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('freelink_token');
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch('/api/projetos', {
      method: 'POST',
      headers,
      body: JSON.stringify({ projeto })
    });
    if (!res.ok) console.warn('Não foi possível sincronizar projeto com o servidor:', res.status);
  } catch (e) {
    console.warn('Não foi possível sincronizar projeto com o servidor:', e);
  }
}

async function sincronizarProjetosComServidor() {
  try {
    const res = await fetch('/api/projetos');
    if (!res.ok) return;
    const data = await res.json();
    let lista = Array.isArray(data.projetos) ? data.projetos : [];
    if (lista.length === 0) {
      await fetch('/api/projetos/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetos: PROJETOS_SEED })
      });
      lista = PROJETOS_SEED;
    }
    if (lista.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(lista));
      localStorage.removeItem(STORAGE_KEYS.LEGACY_PROJECTS);
      if (document.getElementById('vitrine-projetos-grid') && !isAuthenticated()) {
        renderizarVitrineProjetos();
      }
      if (document.getElementById('jobs-container') && isAuthenticated()) {
        const inputBusca = document.getElementById('search-input');
        const selCat = document.getElementById('search-category');
        const tabMeus = document.getElementById('tab-meus-projetos');
        const apenasMeus = Boolean(tabMeus && tabMeus.classList.contains('active'));
        renderizarTrabalhos(inputBusca ? inputBusca.value.trim() : '', selCat ? selCat.value : '', apenasMeus);
      }
      if (document.getElementById('detalhe-conteudo')) {
        carregarDetalhesProjeto();
      }
    }
  } catch (e) {}
}

function obterUsuarios() {
  const dados = localStorage.getItem(STORAGE_KEYS.USERS) || localStorage.getItem(STORAGE_KEYS.LEGACY_USERS);
  if (!dados) {
    salvarUsuarios(USUARIOS_SEED);
    return USUARIOS_SEED;
  }
  try {
    const list = JSON.parse(dados);
    let mod = false;
    USUARIOS_SEED.forEach(seedUser => {
      const idx = list.findIndex(u => (u.id && u.id === seedUser.id) || (u.email && u.email.toLowerCase() === seedUser.email.toLowerCase()));
      if (idx === -1) {
        list.push(seedUser);
        mod = true;
      } else {
        // Enriquecer dados de perfil se faltar bio, habilidades ou avaliações
        if (!list[idx].bio && seedUser.bio) {
          list[idx].bio = seedUser.bio;
          list[idx].taxaHoraria = list[idx].taxaHoraria || seedUser.taxaHoraria;
          list[idx].disponibilidade = list[idx].disponibilidade || seedUser.disponibilidade;
          list[idx].tempoResposta = list[idx].tempoResposta || seedUser.tempoResposta;
          list[idx].localizacao = list[idx].localizacao || seedUser.localizacao;
          list[idx].habilidades = list[idx].habilidades || seedUser.habilidades;
          list[idx].idiomas = list[idx].idiomas || seedUser.idiomas;
          list[idx].certificações = list[idx].certificações || seedUser.certificações;
          list[idx].experienciaTexto = list[idx].experienciaTexto || seedUser.experienciaTexto;
          list[idx].portfolioTexto = list[idx].portfolioTexto || seedUser.portfolioTexto;
          list[idx].avaliacoes = Array.isArray(list[idx].avaliacoes) && list[idx].avaliacoes.length > 0 ? list[idx].avaliacoes : seedUser.avaliacoes;
          mod = true;
        }
      }
    });
    if (mod) {
      salvarUsuarios(list);
    }
    return list;
  } catch (e) {
    return USUARIOS_SEED;
  }
}

// Remove chaves legadas duplicadas e imagens base64 pesadas caso o localStorage atinja o limite de 5 MB
function limparDuplicatasStorage() {
  localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
  localStorage.removeItem(STORAGE_KEYS.LEGACY_USERS);
  localStorage.removeItem(STORAGE_KEYS.LEGACY_PROJECTS);
}

function enxugarUsuarioParaStorage(u, removerMidiaPesada = false) {
  if (!u || typeof u !== 'object') return u;
  const copia = Object.assign({}, u);
  delete copia.senha;
  if (removerMidiaPesada) {
    if (typeof copia.banner === 'string' && copia.banner.startsWith('data:')) delete copia.banner;
    if (typeof copia.foto === 'string' && copia.foto.length > 150000) copia.foto = '';
    if (typeof copia.avatar === 'string' && copia.avatar.length > 150000) delete copia.avatar;
  }
  return copia;
}

function salvarUsuarios(usuarios) {
  limparDuplicatasStorage();
  try {
    const leves = (usuarios || []).map(u => {
      const c = Object.assign({}, u);
      // Na lista global não guardamos banner pesado em base64 (fica no banco PostgreSQL)
      if (typeof c.banner === 'string' && c.banner.length > 80000) delete c.banner;
      if (typeof c.foto === 'string' && c.foto.length > 150000) c.foto = '';
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(leves));
  } catch (e) {
    try {
      const minimos = (usuarios || []).map(u => enxugarUsuarioParaStorage(u, true));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(minimos));
    } catch (e2) {
      console.warn('Quota do localStorage atingida ao salvar lista de usuários:', e2);
    }
  }
}

// ====================================================================
// 2. HELPERS DE AUTENTICAÇÃO E GUARDA DE ROTAS (ROUTE GUARDS)
// ====================================================================

/**
 * Retorna se o usuário está autenticado na plataforma
 * @returns {boolean}
 */
function isAuthenticated() {
  const user = getCurrentUser();
  return user !== null && typeof user === 'object' && !!user.id;
}

/**
 * Retorna o usuário logado atual ou null
 * @returns {Object|null}
 */
function getCurrentUser() {
  const dados = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem(STORAGE_KEYS.LEGACY_USER);
  if (!dados) return null;
  try {
    return JSON.parse(dados);
  } catch (e) {
    return null;
  }
}

// Alias para compatibilidade com partes existentes
function obterUsuarioLogado() {
  return getCurrentUser();
}

/**
 * Registra a sessão do usuário no LocalStorage
 * @param {Object} user 
 */
function login(user) {
  limparDuplicatasStorage();
  let salvo = null;
  try {
    salvo = obterUsuarios().find(u =>
      (u.id && user.id && String(u.id) === String(user.id)) ||
      (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
    ) || null;
  } catch (e) {}

  const userObj = Object.assign({}, salvo || {}, user || {}, {
    id: (salvo && salvo.id) || user.id,
    nome: user.nome || (salvo && salvo.nome),
    email: user.email || (salvo && salvo.email),
    tipo: user.tipo || (salvo && salvo.tipo) || 'freelancer',
    foto: user.foto || (salvo && salvo.foto) || user.avatar || '',
    especialidade: user.especialidade || (salvo && salvo.especialidade) || ''
  });
  delete userObj.senha;

  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
  } catch (e) {
    // Se a foto/banner em base64 exceder a cota do localStorage, salva a sessão sem a mídia pesada (que continua salva no PostgreSQL)
    try {
      const enxuto = enxugarUsuarioParaStorage(userObj, true);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(enxuto));
    } catch (e2) {
      localStorage.removeItem(STORAGE_KEYS.USERS);
      const enxuto = enxugarUsuarioParaStorage(userObj, true);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(enxuto));
    }
  }
}

/**
 * Garante que uma conta autenticada no servidor exista na lista de usuários local,
 * onde o perfil editado é persistido. Retorna o usuário para ser passado ao login().
 * @param {Object} u Usuário devolvido pelo servidor
 */
function registrarUsuarioServidor(u, token) {
  limparDuplicatasStorage();
  const usuarios = obterUsuarios();
  const email = String(u.email || '').toLowerCase();
  let idx = usuarios.findIndex(x => x.email && x.email.toLowerCase() === email);
  const base = idx !== -1 ? usuarios[idx] : {
    id: 'db_' + u.id,
    nome: u.nome,
    email: email,
    tipo: u.tipo_usuario === 'CLIENTE' ? 'contratante' : 'freelancer',
    foto: u.foto_perfil || '',
    especialidade: ''
  };
  // O perfil salvo no banco de dados (PostgreSQL) tem prioridade sobre a cópia local
  const mesclado = Object.assign({}, base, u.perfil || {}, {
    dbId: u.id,
    googleId: u.id,
    email: email,
    nome: (u.perfil && u.perfil.nome) || u.nome || base.nome,
    tipo: u.tipo_usuario === 'CLIENTE' ? 'contratante' : (u.tipo_usuario === 'FREELANCER' ? 'freelancer' : base.tipo)
  });
  if (idx !== -1) usuarios[idx] = mesclado; else usuarios.push(mesclado);
  salvarUsuarios(usuarios);
  if (token) {
    try { localStorage.setItem('freelink_token', token); } catch (e) {}
  }
  return mesclado;
}

// Mantém alias para compatibilidade com registro.html e login.html
const registrarUsuarioGoogle = registrarUsuarioServidor;

/**
 * Envia o perfil do usuário logado para o servidor (PostgreSQL).
 * Atua em qualquer conta autenticada com token do servidor (Google ou E-mail/Senha).
 * @param {Object} usuario Perfil completo
 * @returns {Promise<boolean>} true se foi salvo no servidor
 */
async function salvarPerfilNoServidor(usuario) {
  const token = localStorage.getItem('freelink_token');
  if (!token || !usuario) return false;
  const perfil = Object.assign({}, usuario);
  ['id', 'senha', 'email', 'googleId', 'dbId'].forEach(k => delete perfil[k]);
  try {
    const res = await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ perfil })
    });
    if (res.status === 401) localStorage.removeItem('freelink_token');
    return res.ok;
  } catch (e) {
    console.error('Não foi possível salvar o perfil no servidor:', e);
    return false;
  }
}

/**
 * Sincroniza a sessão do usuário logado com os dados mais recentes do PostgreSQL
 * (garante que alterações feitas em outro PC apareçam em qualquer página).
 */
async function sincronizarSessaoComServidor() {
  const token = localStorage.getItem('freelink_token');
  if (!token) return;
  try {
    const res = await fetch('/api/perfil', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.status === 401) {
      localStorage.removeItem('freelink_token');
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    const atual = getCurrentUser();
    if (!atual || !data || !data.perfil) return;
    const mesclado = Object.assign({}, atual, data.perfil, {
      id: atual.id,
      email: (data.usuario && data.usuario.email) || atual.email,
      dbId: (data.usuario && data.usuario.id) || atual.dbId,
      googleId: (data.usuario && data.usuario.id) || atual.googleId
    });
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mesclado));
    } catch (e) {
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(enxugarUsuarioParaStorage(mesclado, true)));
      } catch (e2) {}
    }
    atualizarNavbarAutenticacao();
    verificarOnboardingBotPerfil();
  } catch (e) {}
}

/**
 * Realiza o logout do usuário e redireciona para a página inicial
 */
function logout() {
  pararPollingChat();
  pararPollingListaChats();
  localStorage.removeItem('freelink_token');
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
  setFlashMessage('Você saiu da sua conta. Até logo!', 'info');
  
  const isSubfolder = window.location.pathname.includes('/html/') || 
                      window.location.pathname.includes('\\html\\') ||
                      document.querySelector('link[href*="../css/"]');
  const target = isSubfolder ? 'index.html' : 'html/index.html';
  window.location.href = target;
}

/**
 * Guarda de Rotas (Route Guards)
 * Protege páginas privadas para usuários não autenticados
 * e impede que usuários já autenticados acessem login/registro.
 */
function verificarProtecaoRotas() {
  const autenticado = isAuthenticated();
  const path = window.location.pathname.toLowerCase();

  const rotasPrivadas = ['postar-trabalho.html', 'perfil.html'];
  const rotasAuth = ['login.html', 'registro.html'];

  const emRotaPrivada = rotasPrivadas.some(rota => path.includes(rota));
  const emRotaAuth = rotasAuth.some(rota => path.includes(rota));

  const isSubfolder = window.location.pathname.includes('/html/') || 
                      window.location.pathname.includes('\\html\\') ||
                      document.querySelector('link[href*="../css/"]');

  if (emRotaPrivada && !autenticado) {
    setFlashMessage('Acesso restrito: Faça login para acessar esta página.', 'info');
    const loginTarget = isSubfolder ? 'login.html' : 'html/login.html';
    window.location.replace(loginTarget);
    return;
  }

  if (emRotaAuth && autenticado) {
    setFlashMessage('Você já está conectado ao FreeLink.', 'info');
    const homeTarget = isSubfolder ? 'index.html' : 'html/index.html';
    window.location.replace(homeTarget);
    return;
  }
}

// ====================================================================
// 3. SISTEMA DE TOASTS (NOTIFICAÇÕES FLUTUANTES) & FLASH SYSTEM
// ====================================================================

/**
 * Dispara uma notificação flutuante elegante na tela
 * @param {string} message - Mensagem a ser exibida
 * @param {'success'|'error'|'info'} type - Tipo do Toast
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('freelink-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'freelink-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `freelink-toast toast-${type}`;

  let iconClass = 'fa-solid fa-circle-check';
  if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';
  if (type === 'info') iconClass = 'fa-solid fa-circle-info';

  toast.innerHTML = `
    <i class="${iconClass} freelink-toast-icon"></i>
    <div class="freelink-toast-message">${escapeHtml(message)}</div>
    <button type="button" class="freelink-toast-close" title="Fechar">&times;</button>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.freelink-toast-close');
  const removerToast = () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  };

  if (closeBtn) closeBtn.addEventListener('click', removerToast);

  // Auto-dismiss após 4 segundos
  setTimeout(removerToast, 4000);
}

/**
 * Registra uma mensagem flash no sessionStorage para ser exibida após redirecionamento
 */
function setFlashMessage(message, type = 'info') {
  try {
    sessionStorage.setItem('freelink_flash', JSON.stringify({ message, type }));
  } catch (e) {}
}

/**
 * Lê e exibe mensagem flash caso exista no sessionStorage
 */
function checkFlashMessage() {
  try {
    const flash = sessionStorage.getItem('freelink_flash');
    if (flash) {
      sessionStorage.removeItem('freelink_flash');
      const parsed = JSON.parse(flash);
      if (parsed && parsed.message) {
        setTimeout(() => {
          showToast(parsed.message, parsed.type || 'info');
        }, 150);
      }
    }
  } catch (e) {}
}

// ====================================================================
// 4. SISTEMA DE TEMAS (MODO ESCURO / MODO CLARO)
// ====================================================================

function atualizarLogosTema(tema) {
  const logos = document.querySelectorAll('.brand-logo');
  const isHtmlSubfolder = window.location.pathname.includes('/html/') || 
                          window.location.pathname.includes('\\html\\') ||
                          document.querySelector('link[href*="../css/"]');
  const prefix = isHtmlSubfolder ? '../' : '';
  const arquivoLogo = 'imagem.png';
  const novoSrc = `${prefix}img/${arquivoLogo}`;

  logos.forEach(logo => {
    if (logo.getAttribute('src') !== novoSrc) logo.src = novoSrc;
  });
}

function aplicarTema(tema) {
  if (tema === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    atualizarLogosTema('dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    atualizarLogosTema('light');
  }
  atualizarInterfaceTemaConfig();
}
window.aplicarTema = aplicarTema;

function carregarTemaSalvo() {
  const temaSalvo = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode');
    atualizarLogosTema('dark');
  } else {
    document.body.classList.remove('dark-mode');
    atualizarLogosTema('light');
  }
  atualizarInterfaceTemaConfig();
}

function atualizarInterfaceTemaConfig() {
  const btnClaro = document.getElementById('btn-tema-claro');
  const btnEscuro = document.getElementById('btn-tema-escuro');
  const temaAtual = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';

  if (btnClaro && btnEscuro) {
    const temaClaroAtivo = temaAtual !== 'dark';
    btnClaro.classList.toggle('is-selected', temaClaroAtivo);
    btnEscuro.classList.toggle('is-selected', !temaClaroAtivo);
    btnClaro.setAttribute('aria-pressed', String(temaClaroAtivo));
    btnEscuro.setAttribute('aria-pressed', String(!temaClaroAtivo));
  }
}

// ====================================================================
// 5. NAVBAR DINÂMICA & MENU MOBILE HAMBÚRGUER
// ====================================================================

function configurarNavbar() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    const novoToggle = navToggle.cloneNode(true);
    navToggle.parentNode.replaceChild(novoToggle, navToggle);

    novoToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !novoToggle.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }
}

/**
 * Atualiza o cabeçalho de acordo com o status de autenticação
 */
function atualizarNavbarAutenticacao() {
  const containerAuth = document.getElementById('auth-buttons-container') || document.querySelector('.auth-buttons');
  const navLinks = document.querySelector('.nav-links');
  const autenticado = isAuthenticated();
  const usuario = getCurrentUser();

  const isSubfolder = window.location.pathname.includes('/html/') || 
                      window.location.pathname.includes('\\html\\') ||
                      document.querySelector('link[href*="../css/"]');
  const prefix = isSubfolder ? '' : 'html/';

  if (navLinks && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/'))) {
    if (!autenticado) {
      navLinks.innerHTML = `
        <a href="#como-funciona">Como Funciona</a>
        <a href="#categorias">Categorias</a>
        <a href="#projetos-destaque">Vagas em Aberto</a>
        <a href="configuracoes.html">Configurações</a>
      `;
    } else {
      navLinks.innerHTML = `
        <a href="index.html" class="active">Início</a>
        <a href="${prefix}postar-trabalho.html">Postar Projeto</a>
        <a href="${prefix}perfil.html">Meu Perfil</a>
        <a href="${prefix}configuracoes.html">Configurações</a>
      `;
    }
  }

  if (containerAuth) {
    if (autenticado && usuario) {
      const primeiroNome = usuario.nome.split(' ')[0];
      const targetPerfil = `${prefix}perfil.html`;
      const fotoPerfil = usuario.foto || usuario.avatar;

      let avatarHtml = '';
      if (fotoPerfil && fotoPerfil.trim() !== '') {
        avatarHtml = `
          <a href="${targetPerfil}" title="Meu Perfil (${escapeHtml(usuario.nome)})" style="display: flex; align-items: center; text-decoration: none;">
            <img src="${fotoPerfil}" alt="${escapeHtml(usuario.nome)}" class="navbar-avatar" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">
          </a>
        `;
      } else {
        avatarHtml = `
          <a href="${targetPerfil}" title="Meu Perfil" style="text-decoration: none; color: var(--text-heading); display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600;">
            <i class="fa-regular fa-circle-user" style="color: var(--primary-color); font-size: 18px;"></i>
            <span>${escapeHtml(primeiroNome)}</span>
          </a>
        `;
      }

      containerAuth.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <button type="button" id="btn-navbar-chat" class="btn-navbar-chat" onclick="abrirListaConversas()" title="Minhas Conversas">
            <i class="fa-solid fa-comments" style="color: var(--primary-color);"></i>
            <span>Chat</span>
            <span id="navbar-chat-badge" class="navbar-chat-badge hidden">0</span>
          </button>
          ${avatarHtml}
          <button id="btn-logout-navbar" class="btn-register" style="padding: 7px 14px; font-size: 12.5px; cursor: pointer; border: none; background: #ef4444; border-radius: 8px; color: #fff; display: inline-flex; align-items: center; gap: 6px;" title="Encerrar sessão">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair
          </button>
        </div>
      `;

      const btnLogout = document.getElementById('btn-logout-navbar');
      if (btnLogout) {
        btnLogout.addEventListener('click', abrirModalConfirmacaoLogout);
      }
    } else {
      const loginUrl = `${prefix}login.html`;
      const regUrl = `${prefix}registro.html`;
      containerAuth.innerHTML = `
        <a href="${loginUrl}" class="btn-login">Entrar</a>
        <a href="${regUrl}" class="btn-register">Cadastrar</a>
      `;
    }
  }
}

/**
 * Modal de confirmação estilizado antes de deslogar
 */
function abrirModalConfirmacaoLogout() {
  let modal = document.getElementById('modal-confirm-logout');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-confirm-logout';
    modal.className = 'confirm-modal-overlay';
    modal.innerHTML = `
      <div class="confirm-modal-card" style="background: var(--bg-card); padding: 30px; border-radius: 18px; border: 1px solid var(--border-color); max-width: 400px; width: 90%; text-align: center; box-shadow: var(--shadow-card);">
        <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 14px;">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </div>
        <h3 style="color: var(--text-heading); font-size: 20px; margin-bottom: 8px;">Encerrar Sessão?</h3>
        <p style="color: var(--text-muted); font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Tem certeza de que deseja sair da sua conta no FreeLink?</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button type="button" id="btn-cancelar-logout" style="flex: 1; padding: 12px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-heading); font-weight: 600; cursor: pointer;">Cancelar</button>
          <button type="button" id="btn-confirmar-logout" style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: #ef4444; color: #fff; font-weight: 600; cursor: pointer;">Sim, Sair</button>
        </div>
      </div>
    `;
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 100000;
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    modal.querySelector('#btn-cancelar-logout').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.querySelector('#btn-confirmar-logout').addEventListener('click', () => {
      modal.style.display = 'none';
      logout();
    });
  }

  modal.style.display = 'flex';
}

// ====================================================================
// 6. PÁGINA INICIAL: LANDING PAGE VITRINE VS FEED AUTENTICADO
// ====================================================================

function inicializarIndexPage() {
  const landingVisitante = document.getElementById('landing-visitante');
  const feedAutenticado = document.getElementById('feed-autenticado');
  const heroAutenticado = document.getElementById('hero-autenticado');

  if (!landingVisitante && !feedAutenticado) return;

  configurarToggleCategorias();

  const autenticado = isAuthenticated();

  if (!autenticado) {
    if (landingVisitante) landingVisitante.style.display = 'block';
    if (feedAutenticado) feedAutenticado.style.display = 'none';
    if (heroAutenticado) heroAutenticado.style.display = 'none';

    renderizarVitrineProjetos();
  } else {
    if (landingVisitante) landingVisitante.style.display = 'none';
    if (feedAutenticado) feedAutenticado.style.display = 'block';
    if (heroAutenticado) heroAutenticado.style.display = 'block';

    renderizarTrabalhos();
    configurarBuscaIndex();
    configurarAbasTrabalhos();
  }
}

function obterUrlPerfilPublicador(projeto, usuariosDisponiveis) {
  if (!projeto) return '';

  const idProjeto = projeto.criadorId == null ? '' : String(projeto.criadorId).trim();
  const emailProjeto = String(projeto.criadorEmail || '').trim().toLowerCase();
  const normalizarId = id => String(id == null ? '' : id).replace(/^(db_|google_)/i, '');
  if (idProjeto && /^\d+$/.test(normalizarId(idProjeto))) {
    return `perfil.html?id=${encodeURIComponent(idProjeto)}`;
  }
  if (emailProjeto) {
    return `perfil.html?email=${encodeURIComponent(emailProjeto)}`;
  }

  const usuarios = Array.isArray(usuariosDisponiveis)
    ? usuariosDisponiveis
    : (typeof obterUsuarios === 'function' ? obterUsuarios() : []);
  let publicador = usuarios.find(usuario => {
    const idUsuario = normalizarId(usuario.id);
    const dbIdUsuario = normalizarId(usuario.dbId);
    const idAlvo = normalizarId(idProjeto);
    return idAlvo && (idUsuario === idAlvo || dbIdUsuario === idAlvo);
  });

  if (!publicador && !idProjeto && !emailProjeto && projeto.empresa) {
    const nomeEmpresa = String(projeto.empresa).trim().toLowerCase();
    const correspondencias = usuarios.filter(usuario =>
      String(usuario.empresa || usuario.nome || '').trim().toLowerCase() === nomeEmpresa
    );
    if (correspondencias.length === 1) publicador = correspondencias[0];
  }

  const idPublicador = idProjeto || (publicador && (publicador.dbId || publicador.id)) || '';
  const emailPublicador = (publicador && publicador.email) || '';
  if (idPublicador && /^\d+$/.test(normalizarId(idPublicador))) {
    return `perfil.html?id=${encodeURIComponent(idPublicador)}`;
  }
  if (emailPublicador) {
    return `perfil.html?email=${encodeURIComponent(emailPublicador)}`;
  }
  if (publicador && idPublicador) {
    return `perfil.html?id=${encodeURIComponent(idPublicador)}`;
  }
  return '';
}

/**
 * Renderiza os 3 ou 4 projetos em destaque na Landing Page Vitrine
 */
function renderizarVitrineProjetos() {
  const container = document.getElementById('vitrine-projetos-grid');
  if (!container) return;

  const projetos = obterProjetos().slice(0, 4);

  container.innerHTML = projetos.map(p => {
    const skills = Array.isArray(p.habilidades) ? p.habilidades : (p.habilidades ? p.habilidades.split(',') : []);
    const skillsHtml = skills.slice(0, 4).map(s => `<span class="skill-tag">${escapeHtml(s.trim())}</span>`).join('');

    return `
      <div class="vitrine-job-card">
        <div class="vitrine-job-header">
          <span class="vitrine-job-category">${escapeHtml(p.categoria)}</span>
          <span class="vitrine-job-price">R$ ${escapeHtml(p.orcamento)}</span>
        </div>
        <h3>${escapeHtml(p.titulo)}</h3>
        <p class="vitrine-job-desc">${escapeHtml(p.descricao)}</p>
        
        <div class="skills-tags-container">
          ${skillsHtml}
        </div>

        <div class="vitrine-job-footer">
          <div class="vitrine-job-meta">
            <span><i class="fa-regular fa-clock"></i> ${escapeHtml(p.prazo || 'A combinar')}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.localizacao || 'Remoto')}</span>
          </div>
          <button type="button" class="btn-proposta-vitrine" onclick="tratarCliquePropostaVisitante('${escapeHtml(p.id)}')">
            <i class="fa-solid fa-paper-plane"></i> Enviar Proposta
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.tratarCliquePropostaVisitante = function(idProjeto) {
  showToast('Cadastre-se gratuitamente ou faça login para enviar sua proposta!', 'info');
  setTimeout(() => {
    window.location.href = `login.html?redirect=detalhes-projeto.html?id=${encodeURIComponent(idProjeto)}`;
  }, 1200);
};

/**
 * Renderiza a lista de trabalhos no Feed Autenticado
 */
function renderizarTrabalhos(termoBusca = '', categoriaFiltro = '', apenasMeusProjetos = false) {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  const todosTrabalhos = obterProjetos();
  const usuarioLogado = getCurrentUser();
  const usuariosPublicadores = obterUsuarios();

  let lista = todosTrabalhos;

  if (apenasMeusProjetos) {
    if (!usuarioLogado) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-input); border-radius: 12px; border: 1px dashed var(--border-color);">
          <i class="fa-solid fa-lock" style="font-size: 36px; color: var(--primary-color); margin-bottom: 12px;"></i>
          <h3 style="color: var(--text-heading); margin-bottom: 6px;">Faça login para ver seus projetos</h3>
        </div>
      `;
      return;
    }
    lista = lista.filter(t => t.empresa === usuarioLogado.nome);
  }

  const trabalhosFiltrados = lista.filter(trabalho => {
    const correspondeTexto = !termoBusca || 
      trabalho.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      trabalho.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (trabalho.empresa && trabalho.empresa.toLowerCase().includes(termoBusca.toLowerCase()));

    const correspondeCategoria = !categoriaFiltro || 
      trabalho.categoria.toLowerCase() === categoriaFiltro.toLowerCase();

    return correspondeTexto && correspondeCategoria;
  });

  const badgeMeusProjetos = document.getElementById('contagem-meus-projetos');
  if (badgeMeusProjetos && usuarioLogado) {
    const totalMeus = todosTrabalhos.filter(t => t.empresa === usuarioLogado.nome).length;
    badgeMeusProjetos.textContent = totalMeus;
  }

  if (trabalhosFiltrados.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-input); border-radius: 12px; border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-folder-open" style="font-size: 36px; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h3 style="color: var(--text-heading); margin-bottom: 6px;">Nenhum projeto encontrado</h3>
        <p style="color: var(--text-muted); font-size: 14px;">${apenasMeusProjetos ? 'Você ainda não publicou nenhum projeto.' : 'Tente buscar com outros termos ou publique um novo projeto!'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = trabalhosFiltrados.map(trabalho => {
    const skills = Array.isArray(trabalho.habilidades) ? trabalho.habilidades : (trabalho.habilidades ? trabalho.habilidades.split(',') : []);
    const skillsHtml = skills.slice(0, 3).map(s => `<span class="skill-tag">${escapeHtml(s.trim())}</span>`).join('');
    const mostrarExcluir = apenasMeusProjetos && projetoPertenceAoUsuario(trabalho, usuarioLogado);
    const urlPerfilPublicador = obterUrlPerfilPublicador(trabalho, usuariosPublicadores);
    const nomePublicador = trabalho.empresa || 'Cliente FreeLink';
    const publicadorHtml = urlPerfilPublicador
      ? `<a class="project-publisher-link" data-owner-profile-link href="${escapeHtml(urlPerfilPublicador)}" title="Ver perfil de ${escapeHtml(nomePublicador)}" aria-label="Ver perfil de ${escapeHtml(nomePublicador)}">${escapeHtml(nomePublicador)} <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`
      : escapeHtml(nomePublicador);

    return `
      <div class="job-card" onclick="redirecionarParaDetalhes('${escapeHtml(trabalho.id)}')" style="cursor: pointer;" title="Clique para ver os detalhes do projeto">
        <h3>${escapeHtml(trabalho.titulo)}</h3>
        <p class="company"><i class="fa-regular fa-building" style="color: var(--primary-color); margin-right: 5px;"></i>${publicadorHtml}</p>
        <p class="location"><i class="fa-solid fa-location-dot" style="color: var(--primary-color); margin-right: 4px;"></i>${escapeHtml(trabalho.localizacao || 'Remoto')}</p>
        <p class="price">R$ ${escapeHtml(trabalho.orcamento)}</p>
        
        <div class="skills-tags-container" style="margin-bottom: 10px;">
          ${skillsHtml}
        </div>

        <hr>
        <div class="card-footer">
          <span><i class="fa-regular fa-clock"></i> ${escapeHtml(trabalho.prazo || 'A combinar')}</span>
          <span><i class="fa-regular fa-folder"></i> ${escapeHtml(trabalho.categoria)}</span>
        </div>
        ${mostrarExcluir ? `<button type="button" class="project-delete-button" data-project-delete="${escapeHtml(trabalho.id)}"><i class="fa-regular fa-trash-can"></i> Excluir projeto</button>` : ''}
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-owner-profile-link]').forEach(link => {
    link.addEventListener('click', event => event.stopPropagation());
  });

  container.querySelectorAll('[data-project-delete]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const projeto = trabalhosFiltrados.find(item => String(item.id) === button.dataset.projectDelete);
      if (projeto) abrirModalExclusaoProjeto(projeto);
    });
  });
}

function projetoPertenceAoUsuario(projeto, usuario) {
  if (!projeto || !usuario || projeto.criadorId == null) return false;
  const usuarioId = usuario.dbId || usuario.id;
  if (usuarioId == null) return false;
  const normalizarId = id => String(id).replace(/^db_/, '');
  return normalizarId(projeto.criadorId) === normalizarId(usuarioId);
}

function abrirModalExclusaoProjeto(projeto) {
  const modal = document.createElement('div');
  modal.className = 'confirm-modal-overlay';
  modal.innerHTML = `
    <div class="confirm-modal-card" role="dialog" aria-modal="true" aria-labelledby="confirmar-exclusao-titulo">
      <div class="confirm-modal-icon"><i class="fa-regular fa-trash-can"></i></div>
      <h3 class="confirm-modal-title" id="confirmar-exclusao-titulo">Excluir projeto?</h3>
      <p class="confirm-modal-desc">Tem certeza de que deseja excluir “${escapeHtml(projeto.titulo || 'este projeto')}”? Esta ação não pode ser desfeita.</p>
      <p class="project-delete-error" role="alert"></p>
      <div class="confirm-modal-actions">
        <button type="button" class="confirm-modal-btn-cancel">Cancelar</button>
        <button type="button" class="confirm-modal-btn-confirm">Excluir projeto</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  let excluindo = false;
  const fechar = () => {
    if (excluindo) return;
    document.removeEventListener('keydown', aoTeclar);
    modal.remove();
  };
  const aoTeclar = event => {
    if (event.key === 'Escape') fechar();
  };
  const cancelar = modal.querySelector('.confirm-modal-btn-cancel');
  const confirmar = modal.querySelector('.confirm-modal-btn-confirm');
  const erro = modal.querySelector('.project-delete-error');

  cancelar.addEventListener('click', fechar);
  modal.addEventListener('click', event => {
    if (event.target === modal) fechar();
  });
  document.addEventListener('keydown', aoTeclar);

  confirmar.addEventListener('click', async () => {
    excluindo = true;
    confirmar.disabled = true;
    cancelar.disabled = true;
    confirmar.textContent = 'Excluindo...';
    erro.textContent = '';

    try {
      const token = localStorage.getItem('freelink_token');
      if (!token) throw new Error('Sua sessão expirou. Entre novamente para excluir o projeto.');
      const res = await fetch(`/api/projetos/${encodeURIComponent(projeto.id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      let dados;
      try {
        dados = await res.json();
      } catch (error) {
        throw new Error('O servidor retornou uma resposta inválida.');
      }
      if (!res.ok) throw new Error(dados.erro || 'Não foi possível excluir o projeto.');

      salvarProjetos(obterProjetos().filter(item => String(item.id) !== String(projeto.id)));
      excluindo = false;
      fechar();
      renderizarTrabalhos('', '', true);
      showToast('Projeto excluído com sucesso.', 'success');
    } catch (error) {
      console.error('Não foi possível excluir o projeto:', error);
      excluindo = false;
      erro.textContent = error.message || 'Não foi possível excluir o projeto. Tente novamente.';
      confirmar.disabled = false;
      cancelar.disabled = false;
      confirmar.textContent = 'Excluir projeto';
    }
  });
}

function redirecionarParaDetalhes(id) {
  window.location.href = `detalhes-projeto.html?id=${encodeURIComponent(id)}`;
}

function configurarAbasTrabalhos() {
  const tabTodos = document.getElementById('tab-todos-trabalhos');
  const tabMeus = document.getElementById('tab-meus-projetos');
  const tabResultados = document.getElementById('tab-resultados-busca');

  const secaoTodos = document.getElementById('container-todos-trabalhos');
  const secaoResultados = document.getElementById('container-resultados-busca');

  if (tabTodos) {
    tabTodos.addEventListener('click', () => {
      tabTodos.classList.add('active');
      if (tabMeus) tabMeus.classList.remove('active');
      if (tabResultados) tabResultados.classList.remove('active');
      if (secaoTodos) secaoTodos.style.display = 'block';
      if (secaoResultados) secaoResultados.style.display = 'none';
      renderizarTrabalhos('', '', false);
    });
  }

  if (tabMeus) {
    tabMeus.addEventListener('click', () => {
      tabMeus.classList.add('active');
      if (tabTodos) tabTodos.classList.remove('active');
      if (tabResultados) tabResultados.classList.remove('active');
      if (secaoTodos) secaoTodos.style.display = 'block';
      if (secaoResultados) secaoResultados.style.display = 'none';
      renderizarTrabalhos('', '', true);
    });
  }

  if (tabResultados) {
    tabResultados.addEventListener('click', () => {
      tabResultados.classList.add('active');
      if (tabTodos) tabTodos.classList.remove('active');
      if (tabMeus) tabMeus.classList.remove('active');
      if (secaoTodos) secaoTodos.style.display = 'none';
      if (secaoResultados) secaoResultados.style.display = 'block';
    });
  }
}

function configurarToggleCategorias() {
  const toggleCategorias = document.getElementById('toggle-categories');
  const categoriasExtra = document.getElementById('categories-extra');
  if (!toggleCategorias || !categoriasExtra) return;

  toggleCategorias.addEventListener('click', () => {
    const expandido = toggleCategorias.getAttribute('aria-expanded') === 'true';
    toggleCategorias.setAttribute('aria-expanded', String(!expandido));
    categoriasExtra.hidden = expandido;
    toggleCategorias.textContent = expandido ? 'Ver todas as áreas' : 'Mostrar menos';
  });
}

function configurarBuscaIndex() {
  const inputBusca = document.getElementById('search-input');
  const selectCategoria = document.getElementById('search-category');
  const btnBuscar = document.getElementById('btn-search');
  const searchBar = document.querySelector('#hero-autenticado .search-bar') || document.querySelector('.search-bar');
  const heroSection = document.getElementById('hero-autenticado') || document.querySelector('.hero');

  // Cria o overlay de fundo desfocado caso ainda não exista no DOM
  let backdrop = document.getElementById('search-backdrop-overlay');
  if (!backdrop && searchBar) {
    backdrop = document.createElement('div');
    backdrop.id = 'search-backdrop-overlay';
    backdrop.className = 'search-backdrop-overlay';
    document.body.appendChild(backdrop);
  }

  function ativarFocoBusca() {
    if (!searchBar || !backdrop) return;
    if (heroSection) heroSection.classList.add('search-active');
    searchBar.classList.add('search-focused');
    backdrop.classList.add('active');
  }

  function desativarFocoBusca() {
    if (searchBar) searchBar.classList.remove('search-focused');
    if (backdrop) backdrop.classList.remove('active');
    if (heroSection) heroSection.classList.remove('search-active');
  }

  if (searchBar) {
    searchBar.addEventListener('click', ativarFocoBusca);
  }
  if (inputBusca) {
    inputBusca.addEventListener('focus', ativarFocoBusca);
  }
  if (selectCategoria) {
    selectCategoria.addEventListener('focus', ativarFocoBusca);
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      desativarFocoBusca();
      if (inputBusca) inputBusca.blur();
      if (selectCategoria) selectCategoria.blur();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('active')) {
      desativarFocoBusca();
      if (inputBusca) inputBusca.blur();
      if (selectCategoria) selectCategoria.blur();
    }
  });

  function dispararBusca() {
    const termo = inputBusca ? inputBusca.value.trim() : '';
    const categoria = selectCategoria ? selectCategoria.value : '';
    desativarFocoBusca();
    if (inputBusca) inputBusca.blur();
    if (selectCategoria) selectCategoria.blur();
    renderizarTrabalhos(termo, categoria);

    const secaoTrabalhos = document.getElementById('secao-trabalhos');
    if (secaoTrabalhos && (termo || categoria)) {
      secaoTrabalhos.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (btnBuscar) btnBuscar.addEventListener('click', dispararBusca);
  if (inputBusca) {
    inputBusca.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') dispararBusca();
    });
  }
  if (selectCategoria) selectCategoria.addEventListener('change', dispararBusca);

  const itensCategorias = document.querySelectorAll('.category-item');
  itensCategorias.forEach(item => {
    item.addEventListener('click', () => {
      const p = item.querySelector('p');
      if (p) {
        const catTexto = p.textContent.trim();
        if (selectCategoria) selectCategoria.value = catTexto;
        dispararBusca();
      }
    });
  });
}

// ====================================================================
// 7. FORMULÁRIO DE CADASTRO (registro.html) & VALIDAÇÕES
// ====================================================================

function validarCPF(valor) {
  const c = String(valor).replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(c[i]) * (t + 1 - i);
    const dv = ((soma * 10) % 11) % 10;
    if (dv !== Number(c[t])) return false;
  }
  return true;
}

function validarCNPJ(valor) {
  const c = String(valor).replace(/\D/g, '');
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const calc = (len) => {
    const pesos = len === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    let soma = 0;
    for (let i = 0; i < len; i++) soma += Number(c[i]) * pesos[i];
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(c[12]) && calc(13) === Number(c[13]);
}

function configurarRegistro() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const tipoParam = urlParams.get('tipo');

  const cardsTipo = document.querySelectorAll('.account-type-card');
  let tipoSelecionado = 'freelancer';

  if (tipoParam === 'contratante' || tipoParam === 'cliente') {
    tipoSelecionado = 'contratante';
  }

  function atualizarSeletorTipo(tipo) {
    tipoSelecionado = tipo;
    cardsTipo.forEach(card => {
      if (card.dataset.type === tipo) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
    const hiddenInput = document.getElementById('reg-tipo');
    if (hiddenInput) hiddenInput.value = tipo;

    // Exibe somente os campos do tipo de conta escolhido
    document.querySelectorAll('.campos-tipo').forEach(bloco => {
      bloco.style.display = bloco.dataset.tipo === tipo ? 'flex' : 'none';
    });

    // Login/cadastro com Google disponível apenas para freelancer (empresa precisa de CNPJ e demais dados)
    const blocoGoogle = document.getElementById('bloco-google');
    if (blocoGoogle) blocoGoogle.style.display = tipo === 'freelancer' ? '' : 'none';

    // Rótulos dos campos comuns: pessoa (freelancer) x empresa (contratante)
    const rotulos = tipo === 'contratante'
      ? { nome: 'Nome do Responsável *', nomePh: 'Nome completo do responsável pela conta', email: 'E-mail Corporativo *',
          telefone: 'Telefone Comercial *', cidade: 'Cidade da Sede *', estado: 'Estado da Sede (UF) *',
          nascimento: 'Data de Fundação da Empresa *', titulo: 'Contato e localização da empresa' }
      : { nome: 'Nome Completo *', nomePh: 'Seu nome completo', email: 'E-mail Profissional *',
          telefone: 'Telefone / WhatsApp *', cidade: 'Cidade *', estado: 'Estado (UF) *',
          nascimento: 'Data de Nascimento *', titulo: 'Dados de contato' };
    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setTxt('lbl-nome', rotulos.nome);
    setTxt('lbl-email', rotulos.email);
    setTxt('lbl-telefone', rotulos.telefone);
    setTxt('lbl-cidade', rotulos.cidade);
    setTxt('lbl-estado', rotulos.estado);
    setTxt('lbl-nascimento', rotulos.nascimento);
    setTxt('titulo-contato', rotulos.titulo);
    const inpNome = document.getElementById('reg-nome');
    if (inpNome) inpNome.placeholder = rotulos.nomePh;
  }

  const inputDocumento = document.getElementById('reg-documento');

  // Máscaras de digitação
  const mascara = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { el.value = fn(el.value); });
  };
  mascara('reg-telefone', v => {
    v = v.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    if (v.length > 2) return v.replace(/^(\d{2})(\d*)/, '($1) $2');
    return v;
  });
  const mascaraCPF = v => v.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
  const mascaraCNPJ = v => v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
  mascara('reg-cpf', mascaraCPF);
  mascara('reg-documento', mascaraCNPJ);

  cardsTipo.forEach(card => {
    card.addEventListener('click', () => {
      const t = card.dataset.type;
      if (t) atualizarSeletorTipo(t);
    });
  });

  atualizarSeletorTipo(tipoSelecionado);

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const senha = document.getElementById('reg-senha').value;
    const confirmaSenha = document.getElementById('reg-confirma-senha').value;

    const alertContainer = document.getElementById('registro-alert') || criarAlertContainer(form);

    if (!nome || !email || !senha || !confirmaSenha) {
      exibirAlertaFormulario(alertContainer, 'Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      exibirAlertaFormulario(alertContainer, 'Por favor, informe um formato de e-mail válido!');
      return;
    }

    if (senha.length < 6) {
      exibirAlertaFormulario(alertContainer, 'A senha deve conter no mínimo 6 caracteres!');
      return;
    }

    if (senha !== confirmaSenha) {
      exibirAlertaFormulario(alertContainer, 'As senhas digitadas não coincidem!');
      return;
    }

    // ---- Campos extras (comuns) ----
    const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const telefone = val('reg-telefone');
    const cidade = val('reg-cidade');
    const estado = val('reg-estado');
    const nascimento = val('reg-nascimento');

    if (telefone.replace(/\D/g, '').length < 10) {
      exibirAlertaFormulario(alertContainer, 'Informe um telefone válido com DDD.');
      return;
    }
    if (!cidade || !estado) {
      exibirAlertaFormulario(alertContainer, 'Informe sua cidade e estado.');
      return;
    }
    if (!nascimento || new Date(nascimento) > new Date()) {
      exibirAlertaFormulario(alertContainer, 'Informe uma data válida (não pode ser no futuro).');
      return;
    }

    const exigeMaioridade = tipoSelecionado === 'freelancer';
    if (exigeMaioridade) {
      const nasc = new Date(nascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
      if (idade < 18) {
        exibirAlertaFormulario(alertContainer, 'É necessário ter 18 anos ou mais para criar a conta.');
        return;
      }
    }

    // ---- Campos exclusivos do tipo selecionado ----
    const blocoAtivo = document.getElementById('campos-' + tipoSelecionado);
    const faltando = Array.from(blocoAtivo.querySelectorAll('[data-obrig]'))
      .filter(el => el.offsetParent !== null && !el.value.trim());
    if (faltando.length) {
      exibirAlertaFormulario(alertContainer, 'Preencha todos os campos obrigatórios do seu perfil.');
      faltando[0].focus();
      return;
    }

    let dadosPerfil;
    if (tipoSelecionado === 'freelancer') {
      const cpf = val('reg-cpf');
      if (!validarCPF(cpf)) {
        exibirAlertaFormulario(alertContainer, 'CPF inválido. Verifique os números digitados.');
        return;
      }
      dadosPerfil = {
        cpf: cpf,
        especialidade: val('reg-area'),
        nivelExperiencia: val('reg-nivel'),
        taxaHoraria: Number(val('reg-valor-hora')).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        habilidades: val('reg-habilidades'),
        disponibilidade: val('reg-disponibilidade'),
        portfolioLink: val('reg-portfolio'),
        bio: val('reg-bio-freelancer')
      };
    } else {
      const documento = val('reg-documento');
      if (!validarCNPJ(documento)) {
        exibirAlertaFormulario(alertContainer, 'CNPJ inválido. Verifique os números digitados.');
        return;
      }
      dadosPerfil = {
        tipoPessoa: 'PJ',
        cnpj: documento,
        documento: documento,
        razaoSocial: val('reg-empresa'),
        empresa: val('reg-fantasia'),
        responsavel: nome,
        cargoResponsavel: val('reg-cargo'),
        setor: val('reg-setor'),
        porte: val('reg-porte'),
        orcamentoMedio: val('reg-orcamento'),
        site: val('reg-site'),
        redeSocial: val('reg-rede-social'),
        sobreEmpresa: val('reg-sobre-empresa'),
        bio: val('reg-sobre-empresa'),
        servicosContratados: val('reg-bio-contratante'),
        especialidade: 'Empresa · ' + val('reg-setor')
      };
    }

    const nomeExibido = tipoSelecionado === 'contratante' ? dadosPerfil.empresa : nome;
    const perfilCompleto = {
      nome: nomeExibido,
      foto: "",
      telefone: telefone,
      cidade: cidade,
      estado: estado,
      localizacao: `${cidade} - ${estado}`,
      ...(tipoSelecionado === 'contratante' ? { dataFundacao: nascimento } : { dataNascimento: nascimento }),
      ...dadosPerfil
    };

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeExibido,
          email: email,
          senha: senha,
          tipo: tipoSelecionado,
          perfil: perfilCompleto
        })
      });
      const dados = await res.json();
      if (!res.ok) {
        exibirAlertaFormulario(alertContainer, dados.erro || 'Erro ao cadastrar conta.');
        return;
      }
      const usuarioSincronizado = registrarUsuarioServidor(dados.usuario, dados.token);
      login(usuarioSincronizado);
      marcarContaRecemCriada(usuarioSincronizado.email);
      setFlashMessage(`🎉 Bem-vindo(a), ${nomeExibido}! Sua conta de ${tipoSelecionado} foi criada no banco de dados.`, 'success');
      window.location.href = 'index.html';
    } catch (erro) {
      console.error('Erro de conexão no cadastro:', erro);
      exibirAlertaFormulario(alertContainer, 'Não foi possível conectar ao servidor para salvar sua conta.');
    }
  });
}

// ====================================================================
// 8. FORMULÁRIO DE LOGIN (login.html) & FEEDBACK DE ERRO
// ====================================================================

function configurarLogin() {
  const form = document.getElementById('form-login');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = document.getElementById('login-senha').value;
    const alertContainer = document.getElementById('login-alert') || criarAlertContainer(form);

    if (!email || !senha) {
      exibirAlertaFormulario(alertContainer, 'Por favor, informe seu e-mail e senha.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      if (res.ok) {
        const dados = await res.json();
        const usuarioSincronizado = registrarUsuarioServidor(dados.usuario, dados.token);
        login(usuarioSincronizado);
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        setFlashMessage(`👋 Olá, ${usuarioSincronizado.nome}! Você está conectado.`, 'success');
        window.location.href = redirectUrl ? redirectUrl : 'index.html';
        return;
      }
      if (res.status === 401) {
        const errDados = await res.json().catch(() => ({}));
        if (errDados.erro && errDados.erro.includes('Google')) {
          exibirAlertaFormulario(alertContainer, errDados.erro);
          showToast(errDados.erro, 'error');
          return;
        }
      }
    } catch (e) {
      console.warn('Servidor indisponível, tentando login nas contas demo locais:', e);
    }

    // Fallback para contas de demonstração (USUARIOS_SEED)
    const usuarios = obterUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuarioEncontrado) {
      exibirAlertaFormulario(alertContainer, '❌ E-mail ou senha incorretos!');
      showToast('E-mail ou senha incorretos!', 'error');

      const card = document.querySelector('.login-card');
      if (card) {
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = 'shakeAlert 0.4s ease';
      }
      return;
    }

    login(usuarioEncontrado);

    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    setFlashMessage(`👋 Olá, ${usuarioEncontrado.nome}! Você está conectado.`, 'success');
    window.location.href = redirectUrl ? redirectUrl : 'index.html';
  });
}

function criarAlertContainer(form) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'form-alert-error';
  alertDiv.style.display = 'none';
  alertDiv.style.marginBottom = '16px';
  form.insertBefore(alertDiv, form.firstChild);
  return alertDiv;
}

function exibirAlertaFormulario(container, mensagem) {
  if (!container) return;
  container.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${escapeHtml(mensagem)}</span>`;
  container.style.display = 'flex';
}

// ====================================================================
// 9. PUBLICAÇÃO DE PROJETOS (postar-trabalho.html)
// ====================================================================

function configurarFormularioPostagem() {
  const form = document.getElementById('form-postar-trabalho');
  if (!form) return;

  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const orcamento = document.getElementById('orcamento').value.trim();
    const prazo = document.getElementById('prazo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    
    const habilidadesInput = document.getElementById('habilidades');
    const habilidadesStr = habilidadesInput ? habilidadesInput.value.trim() : '';

    const modalidadeInput = document.getElementById('modalidade');
    const modalidade = modalidadeInput ? modalidadeInput.value : 'Remoto';

    const cidadeEstadoInput = document.getElementById('cidade-estado');
    const localizacao = cidadeEstadoInput && cidadeEstadoInput.value.trim() ? cidadeEstadoInput.value.trim() : 'Remoto';

    if (!titulo || !categoria || !orcamento || !prazo || !descricao) {
      showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
      return;
    }

    const usuarioLogado = getCurrentUser();
    const nomeEmpresa = usuarioLogado ? usuarioLogado.nome : "Cliente FreeLink";

    const habilidadesArray = habilidadesStr 
      ? habilidadesStr.split(',').map(s => s.trim()).filter(Boolean)
      : ['Geral', categoria];

    const novoProjeto = {
      id: Date.now().toString(),
      titulo: titulo,
      categoria: categoria,
      empresa: nomeEmpresa,
      criadorId: usuarioLogado ? usuarioLogado.id : null,
      criadorEmail: usuarioLogado ? usuarioLogado.email : null,
      statusContratacao: 'aberto',
      freelancerContratado: null,
      localizacao: localizacao,
      modalidade: modalidade,
      orcamento: orcamento.replace(/^R\$\s*/i, '').trim(),
      prazo: prazo,
      habilidades: habilidadesArray,
      propostas: 0,
      listaPropostas: [],
      dataPublicacao: "Publicado recentemente",
      descricao: descricao
    };

    const projetos = obterProjetos();
    projetos.unshift(novoProjeto);
    salvarProjetos(projetos);
    await salvarProjetoNoServidor(novoProjeto);

    setFlashMessage('🎉 Projeto publicado com sucesso!', 'success');
    window.location.href = `detalhes-projeto.html?id=${novoProjeto.id}`;
  });
}

// ====================================================================
// 10. DETALHES DO PROJETO & ENVIO DE PROPOSTA (detalhes-projeto.html)
// ====================================================================

function carregarDetalhesProjeto() {
  const detalheContainer = document.getElementById('detalhe-conteudo');
  if (!detalheContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  let idProjeto = urlParams.get('id');

  const projetos = obterProjetos();
  if (!idProjeto && projetos && projetos.length > 0) {
    const projPadrao = projetos.find(p => String(p.id) === "2") || projetos[0];
    idProjeto = projPadrao ? projPadrao.id : "2";
  }

  const projeto = projetos.find(t => String(t.id) === String(idProjeto));

  if (!projeto) {
    exibirErroProjetoNaoEncontrado("O projeto solicitado não existe ou foi removido.");
    return;
  }

  const elemTitulo = document.getElementById('detalhe-titulo');
  const elemCategoria = document.getElementById('detalhe-categoria');
  const elemOrcamento = document.getElementById('detalhe-orcamento');
  const elemPrazo = document.getElementById('detalhe-prazo');
  const elemEmpresa = document.getElementById('detalhe-empresa');
  const elemPerfilPublicador = document.getElementById('detalhe-perfil-publicador');
  const elemLocalizacao = document.getElementById('detalhe-localizacao');
  const elemData = document.getElementById('detalhe-data');
  const elemDescricao = document.getElementById('detalhe-descricao');
  const elemPropostas = document.getElementById('detalhe-propostas');
  const containerHabilidades = document.getElementById('detalhe-habilidades');

  if (elemTitulo) elemTitulo.textContent = projeto.titulo;
  if (elemCategoria) elemCategoria.textContent = projeto.categoria;
  const orcLimpo = String(projeto.orcamento || '0,00').replace(/^R\$\s*/i, '').trim();
  if (elemOrcamento) elemOrcamento.textContent = `R$ ${orcLimpo}`;
  if (elemPrazo) elemPrazo.textContent = projeto.prazo;
  if (elemEmpresa) elemEmpresa.textContent = projeto.empresa || 'Cliente FreeLink';
  if (elemPerfilPublicador) {
    const urlPerfilPublicador = obterUrlPerfilPublicador(projeto);
    if (urlPerfilPublicador) {
      elemPerfilPublicador.href = urlPerfilPublicador;
      elemPerfilPublicador.setAttribute('aria-label', `Ver perfil de ${projeto.empresa || 'quem publicou o projeto'}`);
      elemPerfilPublicador.classList.remove('hidden');
    } else {
      elemPerfilPublicador.removeAttribute('href');
      elemPerfilPublicador.classList.add('hidden');
    }
  }
  if (elemLocalizacao) elemLocalizacao.textContent = projeto.localizacao || 'Remoto';
  if (elemData) elemData.textContent = projeto.dataPublicacao || 'Publicado recentemente';
  if (elemDescricao) elemDescricao.textContent = projeto.descricao;
  if (elemPropostas) elemPropostas.textContent = `${projeto.propostas || 0} propostas recebidas`;

  if (containerHabilidades) {
    const skills = Array.isArray(projeto.habilidades) ? projeto.habilidades : (projeto.habilidades ? projeto.habilidades.split(',') : []);
    if (skills.length > 0) {
      containerHabilidades.innerHTML = skills.map(s => `<span class="skill-tag" style="font-size: 13px; padding: 5px 12px;">${escapeHtml(s.trim())}</span>`).join('');
    } else {
      containerHabilidades.innerHTML = `<span style="color: var(--text-muted); font-size: 13px;">Habilidades não especificadas.</span>`;
    }
  }

  configurarEnvioProposta(projeto);
}

function exibirErroProjetoNaoEncontrado(mensagem) {
  const detalheContainer = document.getElementById('detalhe-conteudo');
  if (!detalheContainer) return;

  detalheContainer.innerHTML = `
    <div style="text-align: center; padding: 60px 20px;">
      <i class="fa-solid fa-triangle-exclamation" style="font-size: 50px; color: #f59e0b; margin-bottom: 20px;"></i>
      <h2 style="color: var(--text-color); margin-bottom: 12px;">Projeto Não Encontrado</h2>
      <p style="color: var(--text-muted); font-size: 16px; margin-bottom: 25px;">${escapeHtml(mensagem)}</p>
      <a href="index.html" class="login-btn" style="display: inline-block; text-decoration: none;">
        <i class="fa-solid fa-arrow-left"></i> Voltar para a Página Inicial
      </a>
    </div>
  `;
}

function configurarEnvioProposta(projeto) {
  const containerAcao = document.getElementById('container-acao-propostas');
  if (!containerAcao) return;

  const usuarioLogado = getCurrentUser();
  const isDono = Boolean(usuarioLogado && (
    (projeto.criadorId != null && usuarioLogado.id != null && String(projeto.criadorId) === String(usuarioLogado.id)) ||
    (projeto.criadorEmail && usuarioLogado.email && projeto.criadorEmail.trim().toLowerCase() === usuarioLogado.email.trim().toLowerCase()) ||
    (projeto.empresa && usuarioLogado.nome && projeto.empresa.trim().toLowerCase() === usuarioLogado.nome.trim().toLowerCase())
  ));
  const bloquearPropostaDoCriador = () => {
    if (!isDono) return false;
    showToast('Você não pode enviar proposta para um projeto que publicou.', 'error');
    return true;
  };

  const propostas = Array.isArray(projeto.listaPropostas) ? projeto.listaPropostas : [];

  let bannerConcluidoHtml = '';
  if (projeto.statusContratacao === 'concluido') {
    let reviewsHtml = '';
    if (projeto.avaliacaoContratante) {
      reviewsHtml += `
        <div class="completed-review-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 13.5px; font-weight: 700; color: var(--text-heading);">
              <i class="fa-solid fa-building" style="color: var(--primary-color);"></i> Avaliação do Contratante (${escapeHtml(projeto.avaliacaoContratante.autor)})
            </span>
            <span style="color: #f59e0b; font-size: 13px;">${'<i class="fa-solid fa-star"></i>'.repeat(projeto.avaliacaoContratante.estrelas || 5)}</span>
          </div>
          <p style="font-size: 13.5px; color: var(--text-color); margin: 0 0 8px 0; font-style: italic;">"${escapeHtml(projeto.avaliacaoContratante.comentario)}"</p>
          ${projeto.avaliacaoContratante.tags && projeto.avaliacaoContratante.tags.length ? `
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${projeto.avaliacaoContratante.tags.map(t => `<span class="cpm-skill-pill" style="font-size: 11px; padding: 2px 8px;">${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }
    if (projeto.avaliacaoFreelancer) {
      reviewsHtml += `
        <div class="completed-review-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 13.5px; font-weight: 700; color: var(--text-heading);">
              <i class="fa-solid fa-user-tie" style="color: var(--primary-color);"></i> Avaliação do Freelancer (${escapeHtml(projeto.avaliacaoFreelancer.autor)})
            </span>
            <span style="color: #f59e0b; font-size: 13px;">${'<i class="fa-solid fa-star"></i>'.repeat(projeto.avaliacaoFreelancer.estrelas || 5)}</span>
          </div>
          <p style="font-size: 13.5px; color: var(--text-color); margin: 0 0 8px 0; font-style: italic;">"${escapeHtml(projeto.avaliacaoFreelancer.comentario)}"</p>
          ${projeto.avaliacaoFreelancer.tags && projeto.avaliacaoFreelancer.tags.length ? `
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${projeto.avaliacaoFreelancer.tags.map(t => `<span class="cpm-skill-pill" style="font-size: 11px; padding: 2px 8px;">${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    bannerConcluidoHtml = `
      <div class="completed-project-banner">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 12px;">
          <div>
            <span class="badge-projeto-concluido">
              <i class="fa-solid fa-trophy" style="color: #f59e0b;"></i> Projeto Finalizado com Sucesso
            </span>
            <h3 style="font-size: 19px; font-weight: 800; color: var(--text-heading); margin: 6px 0 2px;">
              Parceria Concluída &amp; Avaliada
            </h3>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 0;">
              Contratante: <strong>${escapeHtml(projeto.empresa)}</strong> | Freelancer: <strong>${escapeHtml(projeto.freelancerContratado || 'Contratado')}</strong>
            </p>
          </div>
        </div>
        ${reviewsHtml}
      </div>
    `;
  }

  if (isDono) {
    // --- MODO CONTRATANTE: Painel de Propostas Recebidas ---
    let propostasHtml = '';
    if (propostas.length === 0) {
      propostasHtml = `
        <div class="empty-state-clean" style="padding: 35px 20px; background: var(--bg-card); border-radius: 14px; border: 1.5px dashed var(--border-color); text-align: center;">
          <i class="fa-solid fa-folder-open empty-state-icon" style="font-size: 32px; color: var(--text-muted); margin-bottom: 10px; display: block;"></i>
          <h4 style="font-size: 16px; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">Nenhuma proposta recebida ainda</h4>
          <p style="font-size: 13.5px; color: var(--text-muted); max-width: 480px; margin: 0 auto;">
            Quando um freelancer enviar uma proposta, ela aparecerá aqui para você avaliar.
          </p>
        </div>
      `;
    } else {
      propostasHtml = `
        <div class="proposals-list">
          ${propostas.map(prop => {
            const status = prop.status || 'pendente';
            const isAceita = status === 'aceita';
            const isRecusada = status === 'recusada';

            let statusBadge = `<span class="proposal-status-badge status-pendente"><i class="fa-solid fa-hourglass-half"></i> Aguardando Aprovação</span>`;
            if (isAceita) {
              statusBadge = `<span class="proposal-status-badge status-aceita"><i class="fa-solid fa-circle-check"></i> Proposta Aceita</span>`;
            } else if (isRecusada) {
              statusBadge = `<span class="proposal-status-badge status-recusada"><i class="fa-solid fa-circle-xmark"></i> Recusada</span>`;
            }

            let acoes = `
              <button type="button" class="btn-view-profile" onclick="abrirPerfilModal('${prop.usuarioId || ''}', '${escapeHtml(prop.usuarioEmail || '')}')">
                <i class="fa-solid fa-id-card"></i> Ver Perfil Completo
              </button>
            `;

            if (status === 'pendente') {
              acoes += `
                <button type="button" class="btn-accept-proposal" onclick="aceitarProposta('${projeto.id}', '${prop.id}')">
                  <i class="fa-solid fa-check"></i> Aceitar Proposta
                </button>
                <button type="button" class="btn-reject-proposal" onclick="recusarProposta('${projeto.id}', '${prop.id}')">
                  <i class="fa-solid fa-xmark"></i> Recusar
                </button>
              `;
            } else if (isAceita) {
              acoes += `
                <button type="button" class="btn-open-chat" onclick="abrirChatProjeto('${projeto.id}', '${prop.id}')">
                  <i class="fa-solid fa-comments"></i> Conversar no Chat
                </button>
              `;

              if (projeto.statusContratacao === 'em_andamento') {
                acoes += `
                  <button type="button" class="btn-finish-project" onclick="abrirModalAvaliacao('${projeto.id}', 'contratante')">
                    <i class="fa-solid fa-star"></i> Finalizar Projeto &amp; Avaliar
                  </button>
                `;
              } else if (projeto.statusContratacao === 'concluido') {
                acoes += `
                  <button type="button" class="btn-finish-project" style="background: var(--bg-card); color: #f59e0b !important; border: 1.5px solid #f59e0b;" onclick="abrirModalAvaliacao('${projeto.id}', 'contratante')">
                    <i class="fa-solid fa-star"></i> Ver Avaliação
                  </button>
                `;
              }
            }

            const avatarLetra = (prop.usuarioNome || 'F').charAt(0).toUpperCase();
            const avatarHtml = (prop.usuarioFoto && prop.usuarioFoto.trim() !== '') 
              ? `<img src="${prop.usuarioFoto}" alt="${escapeHtml(prop.usuarioNome)}" class="proposal-avatar">`
              : `<div class="proposal-avatar"><span>${avatarLetra}</span></div>`;

            return `
              <div class="proposal-item-card ${isAceita ? 'is-accepted' : ''}">
                <div class="proposal-card-header">
                  <div class="proposal-freelancer-info" style="cursor: pointer;" onclick="abrirPerfilModal('${prop.usuarioId || ''}', '${escapeHtml(prop.usuarioEmail || '')}')" title="Clique para ver o perfil completo">
                    ${avatarHtml}
                    <div>
                      <div class="proposal-freelancer-name" style="text-decoration: underline; text-decoration-color: transparent; transition: text-decoration-color 0.2s;">
                        ${escapeHtml(prop.usuarioNome)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 11px; margin-left: 4px; opacity: 0.6;"></i>
                      </div>
                      <div class="proposal-freelancer-date"><i class="fa-regular fa-calendar"></i> Enviada em ${escapeHtml(prop.data || 'Hoje')}</div>
                    </div>
                  </div>

                  <div class="proposal-metrics-group">
                    <span class="proposal-val-badge">R$ ${escapeHtml(prop.valor)}</span>
                    <span class="proposal-time-badge"><i class="fa-regular fa-clock"></i> ${escapeHtml(prop.prazo)}</span>
                    ${statusBadge}
                  </div>
                </div>

                <div class="proposal-msg-content">${escapeHtml(prop.mensagem)}</div>

                ${acoes ? `<div class="proposal-actions-row">${acoes}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    containerAcao.innerHTML = `
      ${bannerConcluidoHtml}

      <div class="contractor-proposals-panel">
        <div class="panel-header-proposals">
          <div>
            <h2>
              <i class="fa-solid fa-users-gear" style="color: var(--primary-color);"></i>
              Painel do Contratante: Candidatos &amp; Propostas
            </h2>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              Você publicou este projeto. Acompanhe as propostas recebidas e confira os perfis dos candidatos; não é possível enviar proposta para o próprio projeto.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span class="proposals-count-badge">
              ${propostas.length} ${propostas.length === 1 ? 'proposta recebida' : 'propostas recebidas'}
            </span>
          </div>
        </div>
        ${propostasHtml}
      </div>
    `;
  } else {
    // --- MODO VISITANTE / FREELANCER ---
    const minhaProposta = usuarioLogado ? propostas.find(p => p.usuarioId === usuarioLogado.id || (p.usuarioEmail && p.usuarioEmail === usuarioLogado.email)) : null;

    if (minhaProposta) {
      if (minhaProposta.status === 'aceita') {
        const isConcluido = projeto.statusContratacao === 'concluido';
        const jaAvaliou = Boolean(projeto.avaliacaoFreelancer);

        containerAcao.innerHTML = `
          ${bannerConcluidoHtml}

          <div style="background: var(--primary-light); border: 2px solid var(--primary-color); padding: 25px 30px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: var(--shadow-sm);">
            <div>
              <h3 style="font-size: 18px; color: var(--text-heading); margin-bottom: 4px; font-weight: 700;">
                <i class="fa-solid ${isConcluido ? 'fa-trophy' : 'fa-circle-check'}" style="color: ${isConcluido ? '#f59e0b' : 'var(--primary-color)'};"></i> 
                ${isConcluido ? 'Projeto Concluído com Sucesso!' : 'Parabéns! Sua proposta foi ACEITA pelo cliente!'}
              </h3>
              <p style="color: var(--text-muted); font-size: 14px;">
                ${isConcluido 
                  ? 'A parceria foi finalizada e os registros de avaliação estão arquivados.' 
                  : `Valor acordado: <strong>R$ ${escapeHtml(minhaProposta.valor)}</strong> | Prazo: <strong>${escapeHtml(minhaProposta.prazo)}</strong>. O canal de chat direto está liberado para vocês alinharem o freela.`}
              </p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn-open-chat" onclick="abrirChatProjeto('${projeto.id}', '${minhaProposta.id}')">
                <i class="fa-solid fa-comments"></i> ${isConcluido ? 'Ver Chat' : 'Abrir Chat com o Contratante'}
              </button>
              ${isConcluido 
                ? `<button type="button" class="btn-finish-project" onclick="abrirModalAvaliacao('${projeto.id}', 'freelancer')"><i class="fa-solid fa-star"></i> ${jaAvaliou ? 'Ver Avaliação' : 'Avaliar Contratante'}</button>`
                : `<button type="button" class="btn-finish-project" onclick="abrirModalAvaliacao('${projeto.id}', 'freelancer')"><i class="fa-solid fa-star"></i> Concluir &amp; Avaliar Cliente</button>`
              }
            </div>
          </div>
        `;
        return;
      } else if (minhaProposta.status === 'recusada') {
        containerAcao.innerHTML = `
          <div style="background: var(--bg-card); border: 1.5px solid var(--border-color); padding: 22px 28px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
              <h4 style="font-size: 16px; color: var(--text-heading); margin-bottom: 4px;">Proposta Encerrada</h4>
              <p style="font-size: 13.5px; color: var(--text-muted);">O contratante optou por outro profissional para esta oportunidade.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="proposal-status-badge status-recusada"><i class="fa-solid fa-circle-xmark"></i> Não Selecionado</span>
              <button type="button" class="login-btn btn-trigger-proposta" style="padding: 8px 16px; font-size: 13px; cursor: pointer;">
                <i class="fa-solid fa-paper-plane"></i> Tentar Novamente
              </button>
            </div>
          </div>
        `;
      } else {
        containerAcao.innerHTML = `
          <div style="background: var(--bg-card); border: 1.5px solid var(--primary-border); padding: 22px 28px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
              <h3 style="font-size: 17px; color: var(--text-heading); margin-bottom: 4px;">
                <i class="fa-solid fa-paper-plane" style="color: var(--primary-color);"></i> Sua proposta já foi enviada!
              </h3>
              <p style="color: var(--text-muted); font-size: 13.5px;">
                Valor proposto: <strong>R$ ${escapeHtml(minhaProposta.valor)}</strong> em <strong>${escapeHtml(minhaProposta.prazo)}</strong>.
              </p>
            </div>
            <span class="proposal-status-badge status-pendente" style="padding: 7px 15px; font-size: 13px;">
              <i class="fa-solid fa-hourglass-half"></i> Em análise pelo contratante
            </span>
          </div>
        `;
        return;
      }
    } else {
      // Se não enviou proposta ainda, exibe o botão padrão de envio
      containerAcao.innerHTML = `
        ${bannerConcluidoHtml}

        <div style="background: var(--bg-card); border: 1.5px solid var(--primary-border); padding: 25px 30px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: var(--shadow-sm);">
          <div>
            <h3 style="font-size: 18px; color: var(--text-heading); margin-bottom: 4px; font-weight: 700;">Interessado nesta oportunidade?</h3>
            <p style="color: var(--text-muted); font-size: 14px;">
              <i class="fa-solid fa-user-check" style="color: var(--primary-color); margin-right: 4px;"></i> <span>${propostas.length} ${propostas.length === 1 ? 'proposta recebida' : 'propostas recebidas'} até o momento.</span>
            </p>
          </div>

          <button id="btn-enviar-proposta" class="login-btn btn-trigger-proposta" onclick="abrirModalProposta()" style="padding: 14px 28px; font-size: 15px; display: inline-flex; align-items: center; gap: 10px; cursor: pointer;">
            <i class="fa-solid fa-paper-plane"></i> Enviar Proposta
          </button>
        </div>
      `;
    }
  }

  // Configura os botões de abertura do modal de envio
  const btnsEnviar = document.querySelectorAll('#btn-enviar-proposta, .btn-trigger-proposta');
  const modalProposta = document.getElementById('modal-proposta');
  const formProposta = document.getElementById('form-proposta-envio');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const btnCancelarModal = document.getElementById('btn-cancelar-modal');

  window.abrirModalProposta = function() {
    if (bloquearPropostaDoCriador()) return;
    const modal = document.getElementById('modal-proposta');
    if (modal) modal.style.display = 'flex';
  };

  window.fecharModalProposta = function() {
    const modal = document.getElementById('modal-proposta');
    if (modal) modal.style.display = 'none';
  };

  btnsEnviar.forEach(btn => {
    btn.onclick = function(e) {
      if (e) e.preventDefault();
      window.abrirModalProposta();
    };
  });

  if (btnFecharModal) {
    btnFecharModal.onclick = window.fecharModalProposta;
  }

  if (btnCancelarModal) {
    btnCancelarModal.onclick = window.fecharModalProposta;
  }

  if (modalProposta) {
    modalProposta.onclick = function(e) {
      if (e.target === modalProposta) window.fecharModalProposta();
    };
  }

  if (formProposta && modalProposta) {
    formProposta.onsubmit = function(e) {
      e.preventDefault();
      if (bloquearPropostaDoCriador()) {
        modalProposta.style.display = 'none';
        return;
      }

      const inputValor = document.getElementById('proposta-valor');
      const inputPrazo = document.getElementById('proposta-prazo');
      const inputMensagem = document.getElementById('proposta-mensagem');

      const valor = inputValor ? inputValor.value.trim() : '';
      const prazo = inputPrazo ? inputPrazo.value.trim() : '';
      const mensagem = inputMensagem ? inputMensagem.value.trim() : '';
      const agora = new Date();

      if (!valor || !prazo || !mensagem) {
        showToast('Por favor, preencha todos os campos da proposta.', 'error');
        return;
      }

      let usuarioAtual = getCurrentUser();
      if (!usuarioAtual) {
        usuarioAtual = {
          id: `user_freelancer_${Date.now()}`,
          nome: "Freelancer Visitante",
          email: "candidato@freelink.com",
          tipo: "freelancer",
          foto: "",
          especialidade: "Desenvolvedor Freelancer"
        };
        login(usuarioAtual);
        if (typeof atualizarNavbarAutenticacao === 'function') {
          atualizarNavbarAutenticacao();
        }
      }

      const novaProposta = {
        id: `prop_${Date.now()}`,
        usuarioId: usuarioAtual ? usuarioAtual.id : 'anon',
        usuarioNome: usuarioAtual ? usuarioAtual.nome : 'Freelancer',
        usuarioEmail: usuarioAtual ? usuarioAtual.email : '',
        usuarioFoto: usuarioAtual ? (usuarioAtual.foto || usuarioAtual.avatar || '') : '',
        valor: valor.replace(/^R\$\s*/i, '').trim(),
        prazo: prazo,
        mensagem: mensagem,
        status: 'pendente',
        data: agora.toLocaleDateString('pt-BR'),
        criadaEm: agora.toISOString()
      };

      const projetos = obterProjetos();
      const idx = projetos.findIndex(p => String(p.id) === String(projeto.id));
      if (idx !== -1) {
        if (!Array.isArray(projetos[idx].listaPropostas)) {
          projetos[idx].listaPropostas = [];
        }
        projetos[idx].listaPropostas.push(novaProposta);
        projetos[idx].propostas = projetos[idx].listaPropostas.length;
        salvarProjetos(projetos, projetos[idx]);
        projeto.listaPropostas = projetos[idx].listaPropostas;
        projeto.propostas = projetos[idx].propostas;
      }

      modalProposta.style.display = 'none';
      formProposta.reset();

      const elemPropostas = document.getElementById('detalhe-propostas');
      if (elemPropostas) {
        elemPropostas.textContent = `${projeto.propostas} propostas recebidas`;
      }

      showToast(`🎉 Proposta de R$ ${novaProposta.valor} enviada com sucesso!`, 'success');
      configurarEnvioProposta(projeto);
    };
  }
}

// ====================================================================
// AÇÕES DO CONTRATANTE: ACEITAR E RECUSAR PROPOSTAS
// ====================================================================

window.aceitarProposta = function(projetoId, propostaId) {
  const projetos = obterProjetos();
  const proj = projetos.find(p => String(p.id) === String(projetoId));
  if (!proj || !Array.isArray(proj.listaPropostas)) return;

  const prop = proj.listaPropostas.find(p => String(p.id) === String(propostaId));
  if (!prop) return;

  prop.status = 'aceita';
  proj.statusContratacao = 'em_andamento';
  proj.freelancerContratado = prop.usuarioNome;
  proj.freelancerContratadoId = prop.usuarioId;
  proj.freelancerContratadoEmail = prop.usuarioEmail || '';
  proj.propostaAceitaId = prop.id;
  salvarProjetos(projetos, proj);

  const chatId = `chat_${projetoId}_${propostaId}`;
  const msgSistemaAceite = `🎉 Proposta aceita! O canal de comunicação entre ${proj.empresa} e ${prop.usuarioNome} está aberto para o projeto "${proj.titulo}".`;
  const chats = obterChats();
  if (!chats[chatId]) {
    chats[chatId] = {
      id: chatId,
      projetoId: projetoId,
      projetoTitulo: proj.titulo,
      clienteNome: proj.empresa,
      clienteEmail: proj.criadorEmail || '',
      freelancerId: prop.usuarioId,
      freelancerNome: prop.usuarioNome,
      freelancerEmail: prop.usuarioEmail || '',
      mensagens: [
        {
          id: `msg_sys_1`,
          remetenteId: 'sistema',
          remetenteNome: 'FreeLink',
          texto: msgSistemaAceite,
          criadoEm: new Date().toISOString(),
          dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    salvarChats(chats);
  }

  const token = localStorage.getItem('freelink_token');
  if (token) {
    const outroEmail = resolverEmailUsuario({ email: prop.usuarioEmail, id: prop.usuarioId, nome: prop.usuarioNome });
    fetch('/api/chats/abrir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        idSala: chatId,
        titulo: proj.titulo,
        projetoId,
        propostaId,
        outroEmail,
        outroNome: prop.usuarioNome,
        mensagemSistema: msgSistemaAceite
      })
    }).catch(() => {});
  }

  showToast(`🎉 Proposta de ${prop.usuarioNome} aceita! Abrindo canal de chat...`, 'success');
  carregarDetalhesProjeto();

  setTimeout(() => {
    abrirChatProjeto(projetoId, propostaId);
  }, 600);
};

// ====================================================================
// MODAL DE VISUALIZAÇÃO DE PERFIL DO CANDIDATO
// ====================================================================

window.abrirPerfilModal = async function(usuarioId, usuarioEmail) {
  const usuarios = obterUsuarios();
  let user = null;
  if (usuarioId) user = usuarios.find(u => String(u.id) === String(usuarioId));
  if (!user && usuarioEmail) user = usuarios.find(u => u.email && u.email.toLowerCase() === usuarioEmail.toLowerCase());

  // Busca sempre a versão mais recente do servidor (PostgreSQL), útil entre PCs diferentes
  if (usuarioId || usuarioEmail) {
    try {
      const qs = new URLSearchParams();
      if (usuarioId) qs.set('id', usuarioId);
      if (usuarioEmail) qs.set('email', usuarioEmail);
      const res = await fetch('/api/usuarios/perfil?' + qs.toString());
      if (res.ok) {
        const data = await res.json();
        if (data && data.usuario) {
          user = Object.assign({}, user || {}, data.usuario);
        }
      }
    } catch (e) {}
  }

  if (!user) {
    user = {
      nome: 'Freelancer FreeLink',
      especialidade: 'Profissional Cadastrado',
      localizacao: 'Remoto',
      taxaHoraria: 'A combinar',
      disponibilidade: 'Disponível',
      tempoResposta: '< 2 horas',
      bio: 'Perfil cadastrado na plataforma FreeLink.',
      habilidades: 'Desenvolvimento Web, Front-End, UI/UX, Dedicação',
      avaliacoes: []
    };
  }

  const modal = document.getElementById('modal-perfil-candidato');
  if (!modal) return;

  const elemName = document.getElementById('cpmName');
  const elemSpec = document.getElementById('cpmSpecialty');
  const elemLoc = document.getElementById('cpmLocationText');
  const elemAvatarWrap = document.getElementById('cpmAvatarWrap');
  const elemBio = document.getElementById('cpmBio');
  const elemRating = document.getElementById('cpmRating');
  const elemRate = document.getElementById('cpmRate');
  const elemAvail = document.getElementById('cpmAvailability');
  const elemResp = document.getElementById('cpmResponse');
  const elemSkills = document.getElementById('cpmSkills');
  const elemExpText = document.getElementById('cpmExperienceText');
  const elemPortText = document.getElementById('cpmPortfolioText');
  const elemExpSection = document.getElementById('cpmExpSection');
  const elemPortSection = document.getElementById('cpmPortSection');
  const elemReviewsList = document.getElementById('cpmReviewsList');
  const elemLinkFull = document.getElementById('cpmLinkPaginaCompleta');

  if (elemName) elemName.textContent = user.nome || 'Freelancer';
  if (elemSpec) elemSpec.textContent = user.especialidade || 'Especialista FreeLink';
  if (elemLoc) elemLoc.textContent = user.localizacao || 'Remoto';

  // Avatar
  if (elemAvatarWrap) {
    const foto = user.foto || user.avatar;
    if (foto && foto.trim() !== '') {
      elemAvatarWrap.innerHTML = `<img src="${foto}" alt="${escapeHtml(user.nome)}" class="cpm-avatar-img">`;
    } else {
      const inicial = (user.nome && user.nome.trim() !== '') ? user.nome.charAt(0).toUpperCase() : 'F';
      elemAvatarWrap.innerHTML = `<span style="font-size: 32px; font-weight: 800; color: var(--primary-color);">${inicial}</span>`;
    }
  }

  // Métricas
  const avals = Array.isArray(user.avaliacoes) ? user.avaliacoes : [];
  if (elemRating) {
    if (avals.length > 0) {
      const media = (avals.reduce((acc, cur) => acc + (cur.estrelas || 5), 0) / avals.length).toFixed(1);
      elemRating.innerHTML = `<i class="fa-solid fa-star" style="color: #f59e0b;"></i> ${media} (${avals.length})`;
    } else {
      elemRating.innerHTML = `<i class="fa-solid fa-star" style="color: #f59e0b;"></i> 5.0 (Novo)`;
    }
  }

  if (elemRate) {
    elemRate.textContent = user.taxaHoraria ? (user.taxaHoraria.startsWith('R$') ? user.taxaHoraria : `R$ ${user.taxaHoraria}/h`) : 'A combinar';
  }
  if (elemAvail) elemAvail.textContent = user.disponibilidade || 'Disponível';
  if (elemResp) elemResp.textContent = user.tempoResposta || '< 2 horas';

  // Bio
  if (elemBio) {
    elemBio.textContent = user.bio || 'Este freelancer ainda não adicionou uma apresentação detalhada ao perfil.';
  }

  // Habilidades
  if (elemSkills) {
    const tags = (user.habilidades || 'Geral, Front-End, Dedicação').split(',').map(s => s.trim()).filter(Boolean);
    elemSkills.innerHTML = tags.map(t => `<span class="cpm-skill-pill">${escapeHtml(t)}</span>`).join('');
  }

  // Experiência
  if (elemExpSection && elemExpText) {
    if (user.experienciaTexto && user.experienciaTexto.trim() !== '') {
      elemExpText.textContent = user.experienciaTexto;
      elemExpSection.style.display = 'block';
    } else {
      elemExpSection.style.display = 'none';
    }
  }

  // Portfólio
  if (elemPortSection && elemPortText) {
    if (user.portfolioTexto && user.portfolioTexto.trim() !== '') {
      elemPortText.textContent = user.portfolioTexto;
      elemPortSection.style.display = 'block';
    } else {
      elemPortSection.style.display = 'none';
    }
  }

  // Avaliações
  if (elemReviewsList) {
    if (avals.length > 0) {
      elemReviewsList.innerHTML = avals.map(av => `
        <div class="cpm-review-card">
          <div class="cpm-review-top">
            <span class="cpm-reviewer-name">${escapeHtml(av.autor || 'Cliente')}</span>
            <span class="cpm-review-stars">${'<i class="fa-solid fa-star"></i>'.repeat(av.estrelas || 5)}</span>
          </div>
          <p class="cpm-review-text">"${escapeHtml(av.comentario || '')}"</p>
        </div>
      `).join('');
    } else {
      elemReviewsList.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); font-style: italic;">Ainda não há avaliações anteriores registradas para este profissional.</p>`;
    }
  }

  // Link para página completa
  if (elemLinkFull) {
    const qsFull = new URLSearchParams();
    if (user.id) qsFull.set('id', user.id);
    if (user.email) qsFull.set('email', user.email);
    elemLinkFull.href = `perfil.html?${qsFull.toString()}`;
  }

  modal.style.display = 'flex';
};

window.fecharPerfilModal = function() {
  const modal = document.getElementById('modal-perfil-candidato');
  if (modal) modal.style.display = 'none';
};

// ====================================================================
// MODAL DE FINALIZAÇÃO DE PROJETO & AVALIAÇÃO MÚTUA
// ====================================================================

window.avaliacaoAtiva = {
  projetoId: null,
  papel: 'contratante',
  nota: 5,
  tagsSelecionadas: []
};

window.abrirModalAvaliacao = function(projetoId, papel = 'contratante') {
  const projetos = obterProjetos();
  const proj = projetos.find(p => String(p.id) === String(projetoId));
  if (!proj) return;

  const modal = document.getElementById('modal-avaliacao');
  if (!modal) return;

  window.avaliacaoAtiva = {
    projetoId: projetoId,
    papel: papel,
    nota: 5,
    tagsSelecionadas: papel === 'contratante' ? ['Pontualidade', 'Qualidade Técnica'] : ['Briefing Claro', 'Pagamento Pontual']
  };

  const elemTitulo = document.getElementById('modalAvaliacaoTitulo');
  const elemSub = document.getElementById('modalAvaliacaoSubtitulo');
  const tagsContainer = document.getElementById('reviewTagsContainer');
  const inputComentario = document.getElementById('avaliacao-comentario');

  const outroNome = papel === 'contratante' ? (proj.freelancerContratado || 'Freelancer') : (proj.empresa || 'Cliente');

  if (elemTitulo) {
    elemTitulo.textContent = papel === 'contratante' 
      ? `Finalizar & Avaliar ${outroNome}` 
      : `Concluir Freela & Avaliar ${outroNome}`;
  }
  if (elemSub) {
    elemSub.textContent = `Projeto: "${proj.titulo}"`;
  }

  selecionarEstrelaAvaliacao(5);

  const tagsDisponiveis = papel === 'contratante'
    ? ['Pontualidade', 'Qualidade Técnica', 'Comunicação Clara', 'Proatividade', 'Recomendo']
    : ['Briefing Claro', 'Pagamento Pontual', 'Boa Comunicação', 'Respeito aos Prazos', 'Recomendo'];

  if (tagsContainer) {
    tagsContainer.innerHTML = tagsDisponiveis.map(tag => {
      const isSel = window.avaliacaoAtiva.tagsSelecionadas.includes(tag);
      return `<button type="button" class="review-tag-chip ${isSel ? 'selected' : ''}" onclick="toggleTagAvaliacao(this, '${escapeHtml(tag)}')">${escapeHtml(tag)}</button>`;
    }).join('');
  }

  if (inputComentario) {
    inputComentario.value = papel === 'contratante'
      ? 'Excelente profissional! Entregou antes do prazo com ótima qualidade técnica e comunicação ágil.'
      : 'Ótima experiência! Cliente forneceu orientações claras e suporte contínuo durante o freela.';
  }

  modal.style.display = 'flex';
};

window.fecharModalAvaliacao = function() {
  const modal = document.getElementById('modal-avaliacao');
  if (modal) modal.style.display = 'none';
};

window.selecionarEstrelaAvaliacao = function(nota) {
  window.avaliacaoAtiva.nota = nota;
  const botoes = document.querySelectorAll('#starRatingRow .star-icon-btn');
  botoes.forEach(btn => {
    const starVal = parseInt(btn.getAttribute('data-star'), 10);
    if (starVal <= nota) {
      btn.classList.add('filled');
    } else {
      btn.classList.remove('filled');
    }
  });

  const display = document.getElementById('ratingLabelDisplay');
  if (display) {
    const rotulos = {
      1: '⭐ 1.0 - Insatisfatório',
      2: '⭐⭐ 2.0 - Regular',
      3: '⭐⭐⭐ 3.0 - Bom trabalho',
      4: '⭐⭐⭐⭐ 4.0 - Muito bom!',
      5: '⭐⭐⭐⭐⭐ 5.0 - Excelente trabalho!'
    };
    display.textContent = rotulos[nota] || `⭐ ${nota}.0`;
  }
};

window.toggleTagAvaliacao = function(btn, tag) {
  const idx = window.avaliacaoAtiva.tagsSelecionadas.indexOf(tag);
  if (idx !== -1) {
    window.avaliacaoAtiva.tagsSelecionadas.splice(idx, 1);
    btn.classList.remove('selected');
  } else {
    window.avaliacaoAtiva.tagsSelecionadas.push(tag);
    btn.classList.add('selected');
  }
};

window.submeterAvaliacao = function() {
  if (!window.avaliacaoAtiva || !window.avaliacaoAtiva.projetoId) return;

  const { projetoId, papel, nota, tagsSelecionadas } = window.avaliacaoAtiva;
  const inputComentario = document.getElementById('avaliacao-comentario');
  const comentario = inputComentario ? inputComentario.value.trim() : '';

  if (!comentario) {
    showToast('Por favor, escreva um breve comentário sobre a experiência.', 'error');
    return;
  }

  const projetos = obterProjetos();
  const proj = projetos.find(p => String(p.id) === String(projetoId));
  if (!proj) return;

  const usuarioLogado = getCurrentUser();
  const meuNome = usuarioLogado ? usuarioLogado.nome : (papel === 'contratante' ? proj.empresa : 'Freelancer');

  const novaAvaliacao = {
    id: `aval_${Date.now()}`,
    autor: meuNome,
    projeto: proj.titulo,
    estrelas: nota,
    comentario: comentario,
    tags: tagsSelecionadas,
    data: new Date().toLocaleDateString('pt-BR')
  };

  // Marca projeto como concluído
  proj.statusContratacao = 'concluido';
  if (papel === 'contratante') {
    proj.avaliacaoContratante = novaAvaliacao;
  } else {
    proj.avaliacaoFreelancer = novaAvaliacao;
  }
  salvarProjetos(projetos, proj);

  // Adiciona a avaliação ao usuário avaliado na base global de usuários
  const usuarios = obterUsuarios();
  let usuarioAlvo = null;
  if (papel === 'contratante') {
    usuarioAlvo = usuarios.find(u => (proj.freelancerContratadoId && u.id === proj.freelancerContratadoId) || (proj.freelancerContratado && u.nome && u.nome.toLowerCase() === proj.freelancerContratado.toLowerCase()));
  } else {
    usuarioAlvo = usuarios.find(u => (proj.criadorId && u.id === proj.criadorId) || (proj.criadorEmail && u.email === proj.criadorEmail) || (proj.empresa && u.nome && u.nome.toLowerCase() === proj.empresa.toLowerCase()));
  }

  if (usuarioAlvo) {
    if (!Array.isArray(usuarioAlvo.avaliacoes)) {
      usuarioAlvo.avaliacoes = [];
    }
    usuarioAlvo.avaliacoes.unshift(novaAvaliacao);
    salvarUsuarios(usuarios);
  }

  // Notificação no Chat (servidor + local)
  const msgFim = `🏆 Projeto finalizado com sucesso! ${meuNome} avaliou a parceria com ${nota} estrelas: "${comentario}"`;
  const token = localStorage.getItem('freelink_token');
  if (token && proj.propostaAceitaId) {
    fetch(`/api/chats/${encodeURIComponent(`chat_${projetoId}_${proj.propostaAceitaId}`)}/mensagens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ texto: msgFim, sistema: true })
    }).catch(() => {});
  }

  const chats = obterChats();
  Object.keys(chats).forEach(k => {
    if (chats[k].projetoId === String(projetoId)) {
      chats[k].mensagens.push({
        id: `msg_finish_${Date.now()}`,
        remetenteId: 'sistema',
        remetenteNome: 'FreeLink',
        texto: msgFim,
        criadoEm: new Date().toISOString(),
        dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
      salvarChats(chats);
      if (window.chatAtivo && window.chatAtivo.chatId === k) {
        renderizarMensagensChat(chats[k]);
      }
    }
  });

  fecharModalAvaliacao();
  showToast(`⭐ Avaliação enviada e projeto finalizado com sucesso!`, 'success');
  carregarDetalhesProjeto();
};

window.recusarProposta = function(projetoId, propostaId) {
  if (!confirm('Deseja realmente recusar esta proposta?')) return;

  const projetos = obterProjetos();
  const proj = projetos.find(p => String(p.id) === String(projetoId));
  if (!proj || !Array.isArray(proj.listaPropostas)) return;

  const prop = proj.listaPropostas.find(p => String(p.id) === String(propostaId));
  if (!prop) return;

  prop.status = 'recusada';
  salvarProjetos(projetos, proj);

  showToast('Proposta recusada.', 'info');
  carregarDetalhesProjeto();
};

// ====================================================================
// SISTEMA DE CHAT EM TEMPO REAL (FREELINK CHAT - POSTGRESQL + TEMPO REAL)
// ====================================================================

let chatPollingTimer = null;
let chatsListaPollingTimer = null;
let ultimaPromessaAbrirSala = Promise.resolve();
let chatDrawerClickOutsideRegistrado = false;

function resolverEmailUsuario({ email, id, nome }) {
  if (email && String(email).trim()) return String(email).trim().toLowerCase();
  const usuarios = obterUsuarios();
  const encontrado = usuarios.find(u =>
    (id && u.id && String(u.id) === String(id)) ||
    (nome && u.nome && u.nome.toLowerCase() === String(nome).toLowerCase())
  );
  return encontrado && encontrado.email ? String(encontrado.email).trim().toLowerCase() : '';
}

function obterContatosComPropostasAceitas(usuarioLogado) {
  if (!usuarioLogado) return [];

  const meuId = usuarioLogado.id == null ? '' : String(usuarioLogado.id);
  const meuEmail = String(usuarioLogado.email || '').trim().toLowerCase();
  const meuNome = String(usuarioLogado.nome || '').trim().toLowerCase();
  const tipoUsuario = String(usuarioLogado.tipo || usuarioLogado.tipo_usuario || '').trim().toLowerCase();
  const souContratante = tipoUsuario === 'contratante' || tipoUsuario === 'cliente';
  const souFreelancer = tipoUsuario === 'freelancer';
  if (!souContratante && !souFreelancer) return [];

  const contatos = new Map();
  const projetos = obterProjetos();

  const souCriadorDoProjeto = projeto =>
    (projeto.criadorId != null && meuId && String(projeto.criadorId) === meuId) ||
    (projeto.criadorEmail && meuEmail && String(projeto.criadorEmail).trim().toLowerCase() === meuEmail) ||
    (projeto.empresa && meuNome && String(projeto.empresa).trim().toLowerCase() === meuNome);

  const propostaEhMinha = proposta =>
    (proposta.usuarioId != null && meuId && String(proposta.usuarioId) === meuId) ||
    (proposta.usuarioEmail && meuEmail && String(proposta.usuarioEmail).trim().toLowerCase() === meuEmail);

  const adicionarContato = (projeto, proposta, contato, tipo) => {
    const email = resolverEmailUsuario(contato);
    if (!email || email === meuEmail) return;

    const projetoId = String(projeto.id || '');
    const propostaId = String(proposta.id || '');
    const chave = `${projetoId}:${propostaId || email}`;
    if (contatos.has(chave)) return;

    contatos.set(chave, {
      email,
      nome: contato.nome || email,
      tipo,
      projetoId,
      propostaId,
      projetoTitulo: projeto.titulo || 'Projeto'
    });
  };

  projetos.forEach(projeto => {
    const propostasAceitas = (Array.isArray(projeto.listaPropostas) ? projeto.listaPropostas : [])
      .filter(proposta => String(proposta.status || '').toLowerCase() === 'aceita');

    if (souContratante && souCriadorDoProjeto(projeto)) {
      propostasAceitas.forEach(proposta => {
        adicionarContato(projeto, proposta, {
          email: proposta.usuarioEmail,
          id: proposta.usuarioId,
          nome: proposta.usuarioNome
        }, 'Freelancer');
      });
    } else if (souFreelancer) {
      propostasAceitas.filter(propostaEhMinha).forEach(proposta => {
        adicionarContato(projeto, proposta, {
          email: projeto.criadorEmail,
          id: projeto.criadorId,
          nome: projeto.empresa
        }, 'Empresa');
      });
    }
  });

  return Array.from(contatos.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR') || a.projetoTitulo.localeCompare(b.projetoTitulo, 'pt-BR')
  );
}

function obterVistosChat() {
  try {
    return JSON.parse(localStorage.getItem('freelink_chat_vistos') || '{}') || {};
  } catch (e) {
    return {};
  }
}

function marcarChatComoVisto(chatId, ultimoId) {
  if (!chatId || !ultimoId) return;
  try {
    const vistos = obterVistosChat();
    if (Number(ultimoId) > Number(vistos[chatId] || 0)) {
      vistos[chatId] = Number(ultimoId);
      localStorage.setItem('freelink_chat_vistos', JSON.stringify(vistos));
    }
  } catch (e) {}
}

function atualizarBadgeChatsNavbar(salas) {
  const badge = document.getElementById('navbar-chat-badge');
  if (!badge) return;
  const usuarioLogado = getCurrentUser();
  const meuEmail = usuarioLogado && usuarioLogado.email ? String(usuarioLogado.email).toLowerCase() : '';
  const vistos = obterVistosChat();
  let naoLidas = 0;

  (salas || []).forEach(s => {
    const ultimoId = Number(s.ultimo_id_mensagem || 0);
    const remetenteEmail = String(s.ultimo_remetente_email || '').toLowerCase();
    const salaAtiva = window.chatAtivo && window.chatAtivo.chatId === s.id_sala;
    const chatBox = document.getElementById('freelink-chat-box');
    const janelaAberta = salaAtiva && chatBox && !chatBox.classList.contains('hidden');

    if (janelaAberta && ultimoId) {
      marcarChatComoVisto(s.id_sala, ultimoId);
      return;
    }
    if (ultimoId > Number(vistos[s.id_sala] || 0) && remetenteEmail && remetenteEmail !== meuEmail) {
      naoLidas++;
    }
  });

  if (naoLidas > 0) {
    badge.textContent = naoLidas > 9 ? '9+' : String(naoLidas);
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function pararPollingListaChats() {
  if (chatsListaPollingTimer) {
    clearInterval(chatsListaPollingTimer);
    chatsListaPollingTimer = null;
  }
}

async function verificarConversasServidor() {
  const token = localStorage.getItem('freelink_token');
  if (!token || !isAuthenticated()) return;
  try {
    const res = await fetch('/api/chats', { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) return;
    const data = await res.json();
    const salas = Array.isArray(data.chats) ? data.chats : [];
    atualizarBadgeChatsNavbar(salas);
    const drawer = document.getElementById('freelink-chats-drawer');
    if (drawer && !drawer.classList.contains('hidden')) {
      renderizarListaConversasDrawer(salas, null);
    }
  } catch (e) {}
}

function iniciarPollingListaChats() {
  pararPollingListaChats();
  const token = localStorage.getItem('freelink_token');
  if (!token || !isAuthenticated()) return;
  verificarConversasServidor();
  chatsListaPollingTimer = setInterval(verificarConversasServidor, 5000);
}

function obterChats() {
  try {
    const dados = localStorage.getItem(STORAGE_KEYS.CHATS);
    return dados ? JSON.parse(dados) : {};
  } catch(e) {
    return {};
  }
}

function formatarHorarioMensagemChat(mensagem) {
  const instante = mensagem && (mensagem.criadoEm || mensagem.criado_em);
  if (instante) {
    const data = new Date(instante);
    if (Number.isFinite(data.getTime())) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  }
  return String(mensagem && mensagem.dataHora || '');
}

function salvarChats(chats) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  } catch (e) {}
}

function pararPollingChat() {
  if (chatPollingTimer) {
    clearInterval(chatPollingTimer);
    chatPollingTimer = null;
  }
}

function iniciarPollingChat(chatId) {
  pararPollingChat();
  const token = localStorage.getItem('freelink_token');
  if (!token || !chatId) return;

  chatPollingTimer = setInterval(async () => {
    if (!window.chatAtivo || window.chatAtivo.chatId !== chatId) return;
    const chatBox = document.getElementById('freelink-chat-box');
    if (!chatBox || chatBox.classList.contains('hidden')) return;
    await buscarMensagensChatServidor(chatId);
  }, 2000);
}

async function buscarMensagensChatServidor(chatId) {
  const token = localStorage.getItem('freelink_token');
  if (!token || !chatId) return;
  try {
    const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/mensagens`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) return;
    const data = await res.json();
    const msgs = Array.isArray(data.mensagens) ? data.mensagens : [];

    const ultimoIdNovo = msgs.length ? msgs[msgs.length - 1].id : null;
    if (ultimoIdNovo && window.chatAtivo && window.chatAtivo.chatId === chatId) {
      marcarChatComoVisto(chatId, ultimoIdNovo);
    }

    const chats = obterChats();
    const anterior = chats[chatId] || { id: chatId, mensagens: [] };
    const ultimoIdAnterior = anterior.mensagens && anterior.mensagens.length ? anterior.mensagens[anterior.mensagens.length - 1].id : null;

    if (msgs.length !== (anterior.mensagens ? anterior.mensagens.length : 0) || ultimoIdAnterior !== ultimoIdNovo) {
      anterior.mensagens = msgs;
      chats[chatId] = anterior;
      salvarChats(chats);
      if (window.chatAtivo && window.chatAtivo.chatId === chatId) {
        renderizarMensagensChat(anterior);
      }
    }
  } catch (e) {}
}

async function abrirSalaChat({ chatId, titulo, outroNome, outroEmail, projetoId, propostaId, mensagemSistema, mensagemBot }) {
  const usuarioLogado = getCurrentUser();
  if (!usuarioLogado) {
    showToast('Faça login para conversar no chat.', 'info');
    return;
  }

  let chatBox = document.getElementById('freelink-chat-box');
  if (!chatBox) {
    chatBox = garantirElementoChat();
  }

  const drawer = document.getElementById('freelink-chats-drawer');
  if (drawer) drawer.classList.add('hidden');

  const isSalaBot = String(chatId || '').startsWith('bot_');
  window.chatAtivo = {
    projetoId: projetoId || null,
    propostaId: propostaId || null,
    chatId,
    titulo: titulo || (isSalaBot ? 'Assistente de Perfil' : 'Conversa FreeLink'),
    outroEmail: outroEmail || (isSalaBot ? 'bot@freelink.com' : ''),
    outroNome: outroNome || (isSalaBot ? 'Assistente FreeLink' : 'Contato')
  };

  const elemNome = document.getElementById('chatHeaderName');
  const elemAvatar = document.getElementById('chatHeaderAvatar');
  const elemTitulo = document.getElementById('chatHeaderProjectTitle');
  const quickBox = chatBox.querySelector('.chat-quick-suggestions');

  if (elemNome) elemNome.textContent = window.chatAtivo.outroNome;
  if (elemAvatar) {
    elemAvatar.innerHTML = isSalaBot
      ? '<i class="fa-solid fa-robot"></i>'
      : escapeHtml((window.chatAtivo.outroNome || 'U').charAt(0).toUpperCase());
  }
  if (elemTitulo) elemTitulo.textContent = titulo || (isSalaBot ? 'Assistente de Perfil' : 'Chat Direto');
  if (quickBox) {
    quickBox.innerHTML = isSalaBot
      ? `
        <button type="button" class="chat-quick-chip" onclick="irParaCompletarPerfil()"><i class="fa-solid fa-wand-magic-sparkles"></i> Completar Perfil Agora</button>
        <button type="button" class="chat-quick-chip" onclick="inserirSugestaoChat('O que falta no meu perfil?')">O que falta?</button>
        <button type="button" class="chat-quick-chip" onclick="inserirSugestaoChat('Como edito meu perfil?')">Como editar?</button>
      `
      : `
        <button type="button" class="chat-quick-chip" onclick="inserirSugestaoChat('Olá! Quando podemos iniciar o trabalho?')">Quando começamos?</button>
        <button type="button" class="chat-quick-chip" onclick="inserirSugestaoChat('Estou disponível para tirar dúvidas sobre o projeto.')">Tirar dúvidas</button>
        <button type="button" class="chat-quick-chip" onclick="inserirSugestaoChat('Perfeito! Vou iniciar a primeira etapa.')">Iniciando etapa</button>
      `;
  }

  const chats = obterChats();
  if (!chats[chatId]) {
    const msgInicialTexto = mensagemBot || mensagemSistema;
    chats[chatId] = {
      id: chatId,
      projetoId: projetoId || null,
      projetoTitulo: window.chatAtivo.titulo,
      mensagens: msgInicialTexto ? [{
        id: isSalaBot ? `msg_bot_${Date.now()}` : `msg_sys_${Date.now()}`,
        remetenteId: isSalaBot ? 'bot' : 'sistema',
        remetenteEmail: isSalaBot ? 'bot@freelink.com' : '',
        remetenteNome: isSalaBot ? 'Assistente FreeLink' : 'FreeLink',
        texto: msgInicialTexto,
        criadoEm: new Date().toISOString(),
        dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }] : []
    };
    salvarChats(chats);
  }

  renderizarMensagensChat(chats[chatId]);
  chatBox.classList.remove('hidden');

  const inputMsg = document.getElementById('chatInputMessage');
  if (inputMsg) setTimeout(() => inputMsg.focus(), 150);

  const token = localStorage.getItem('freelink_token');
  if (token) {
    ultimaPromessaAbrirSala = (async () => {
      try {
        const res = await fetch('/api/chats/abrir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({
            idSala: chatId,
            titulo: window.chatAtivo.titulo,
            projetoId: projetoId || null,
            propostaId: propostaId || null,
            outroEmail: window.chatAtivo.outroEmail,
            outroNome: window.chatAtivo.outroNome,
            mensagemSistema: mensagemSistema || '',
            mensagemBot: mensagemBot || ''
          })
        });
        if (res.ok) {
          const data = await res.json();
          const msgs = Array.isArray(data.mensagens) ? data.mensagens : [];
          chats[chatId].mensagens = msgs;
          salvarChats(chats);
          if (msgs.length) marcarChatComoVisto(chatId, msgs[msgs.length - 1].id);
          if (window.chatAtivo && window.chatAtivo.chatId === chatId) {
            renderizarMensagensChat(chats[chatId]);
          }
          verificarConversasServidor();
        }
      } catch (e) {}
    })();
    await ultimaPromessaAbrirSala;
    iniciarPollingChat(chatId);
  }
}

window.abrirChatProjeto = function(projetoId, propostaId) {
  const projetos = obterProjetos();
  const proj = projetos.find(p => String(p.id) === String(projetoId));
  if (!proj) return;

  const prop = Array.isArray(proj.listaPropostas) ? proj.listaPropostas.find(p => String(p.id) === String(propostaId)) : null;
  const usuarioLogado = getCurrentUser();
  const chatId = `chat_${projetoId}_${propostaId}`;

  const isCliente = usuarioLogado && (
    (proj.criadorId != null && usuarioLogado.id != null && String(proj.criadorId) === String(usuarioLogado.id)) ||
    (proj.criadorEmail && usuarioLogado.email && String(proj.criadorEmail).trim().toLowerCase() === String(usuarioLogado.email).trim().toLowerCase()) ||
    (proj.empresa && usuarioLogado.nome && String(proj.empresa).trim().toLowerCase() === String(usuarioLogado.nome).trim().toLowerCase())
  );

  const outroNome = isCliente ? (prop ? prop.usuarioNome : 'Freelancer') : proj.empresa;
  const outroEmail = isCliente
    ? resolverEmailUsuario({ email: prop && prop.usuarioEmail, id: prop && prop.usuarioId, nome: prop && prop.usuarioNome })
    : resolverEmailUsuario({ email: proj.criadorEmail, id: proj.criadorId, nome: proj.empresa });

  abrirSalaChat({
    chatId,
    titulo: proj.titulo,
    outroNome,
    outroEmail,
    projetoId,
    propostaId,
    mensagemSistema: `🎉 Proposta aceita! O canal de comunicação para o projeto "${proj.titulo}" está ativo.`
  });
};

window.abrirChatDireto = function(outroEmail, outroNome, tituloOpcional) {
  const usuarioLogado = getCurrentUser();
  if (!usuarioLogado) {
    showToast('Faça login para conversar no chat.', 'info');
    return;
  }
  const emailA = String(usuarioLogado.email || '').trim().toLowerCase();
  const emailB = String(outroEmail || '').trim().toLowerCase();
  if (!emailA) {
    showToast('Sua conta precisa de um e-mail válido para usar o chat.', 'error');
    return;
  }
  if (!emailB) {
    showToast('Contato sem e-mail identificado para chat.', 'error');
    return;
  }
  if (emailA === emailB) {
    showToast('Você está visualizando seu próprio perfil.', 'info');
    return;
  }
  const ordenado = [emailA, emailB].sort();
  // Gera identificador determinístico curto para caber em VARCHAR(120)
  let hash = 0;
  const chave = ordenado.join('|');
  for (let i = 0; i < chave.length; i++) {
    hash = ((hash << 5) - hash + chave.charCodeAt(i)) | 0;
  }
  const chatId = `dm_${Math.abs(hash).toString(36)}_${ordenado[0].slice(0, 20)}_${ordenado[1].slice(0, 20)}`.replace(/[^a-zA-Z0-9_@.-]/g, '').slice(0, 115);

  abrirSalaChat({
    chatId,
    titulo: tituloOpcional || 'Conversa Direta',
    outroNome: outroNome || emailB,
    outroEmail: emailB,
    mensagemSistema: `💬 Canal direto aberto entre ${usuarioLogado.nome} e ${outroNome || emailB}.`
  });
};

function renderizarListaConversasDrawer(salas, erroSessaoMsg) {
  const listEl = document.getElementById('chatsDrawerList');
  if (!listEl) return;

  const usuarioLogado = getCurrentUser();
  const meuEmail = usuarioLogado && usuarioLogado.email ? String(usuarioLogado.email).toLowerCase() : '';
  const meuNome = usuarioLogado && usuarioLogado.nome ? String(usuarioLogado.nome).toLowerCase() : '';
  const vistos = obterVistosChat();

  if (erroSessaoMsg && !salas.length) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 22px 14px; color: var(--text-muted); font-size: 13px;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 26px; color: #f59e0b; display: block; margin-bottom: 8px;"></i>
        ${escapeHtml(erroSessaoMsg)}
      </div>
    `;
    return;
  }

  if (!salas.length) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 26px 14px; color: var(--text-muted); font-size: 13px;">
        <i class="fa-regular fa-comment-dots" style="font-size: 28px; display: block; margin-bottom: 8px; opacity: 0.6;"></i>
        Nenhuma conversa ainda.<br>Aceite uma proposta recebida ou aguarde a aprovação da sua proposta para iniciar uma conversa.
      </div>
    `;
    return;
  }

  listEl.innerHTML = salas.map(s => {
    const p1Email = String(s.participante1_email || '').toLowerCase();
    const p2Email = String(s.participante2_email || '').toLowerCase();
    const p1Nome = String(s.participante1_nome || '').toLowerCase();
    const souP1 = (meuEmail && p1Email) ? (p1Email === meuEmail) : (meuNome && p1Nome === meuNome);

    const nomeOutro = souP1 ? (s.participante2_nome || s.participante2_email || 'Contato') : (s.participante1_nome || s.participante1_email || 'Contato');
    const emailOutro = souP1 ? (p2Email || '') : (p1Email || '');
    const inicial = (nomeOutro || 'C').charAt(0).toUpperCase();
    const preview = s.ultima_mensagem ? escapeHtml(s.ultima_mensagem) : escapeHtml(s.titulo || 'Abrir conversa');

    const ultimoId = Number(s.ultimo_id_mensagem || 0);
    const remetenteEmail = String(s.ultimo_remetente_email || '').toLowerCase();
    const naoLida = ultimoId > Number(vistos[s.id_sala] || 0) && remetenteEmail && remetenteEmail !== meuEmail;

    return `
      <button type="button" class="chats-drawer-item ${naoLida ? 'is-unread' : ''}" data-sala="${escapeHtml(s.id_sala)}" data-titulo="${escapeHtml(s.titulo || 'Conversa')}" data-nome="${escapeHtml(nomeOutro)}" data-email="${escapeHtml(emailOutro)}" data-proj="${escapeHtml(s.projeto_id || '')}" data-prop="${escapeHtml(s.proposta_id || '')}" data-ultimo-id="${ultimoId}">
        <div class="chats-drawer-avatar">${escapeHtml(inicial)}</div>
        <div class="chats-drawer-meta">
          <div class="chats-drawer-name">${escapeHtml(nomeOutro)} <span style="font-weight: 500; font-size: 11px; color: var(--primary-color);">· ${escapeHtml(s.titulo || 'Chat')}</span></div>
          <div class="chats-drawer-sub">${preview}</div>
        </div>
        ${naoLida ? '<span class="chats-drawer-unread-dot" title="Nova mensagem"></span>' : ''}
      </button>
    `;
  }).join('');

  listEl.querySelectorAll('.chats-drawer-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const uId = Number(btn.getAttribute('data-ultimo-id') || 0);
      const sId = btn.getAttribute('data-sala');
      if (uId) marcarChatComoVisto(sId, uId);
      abrirSalaChat({
        chatId: sId,
        titulo: btn.getAttribute('data-titulo'),
        outroNome: btn.getAttribute('data-nome'),
        outroEmail: btn.getAttribute('data-email'),
        projetoId: btn.getAttribute('data-proj') || null,
        propostaId: btn.getAttribute('data-prop') || null
      });
    });
  });
}

window.abrirListaConversas = async function() {
  const usuarioLogado = getCurrentUser();
  if (!usuarioLogado) {
    showToast('Faça login para acessar suas conversas.', 'info');
    return;
  }

  let drawer = document.getElementById('freelink-chats-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'freelink-chats-drawer';
    drawer.className = 'freelink-chats-drawer hidden';
    drawer.innerHTML = `
      <div class="chats-drawer-header">
        <h4><i class="fa-solid fa-comments" style="color: var(--primary-color);"></i> Minhas Conversas</h4>
        <button type="button" class="chat-header-close" onclick="document.getElementById('freelink-chats-drawer').classList.add('hidden')" title="Fechar">&times;</button>
      </div>
      <div class="chats-drawer-list" id="chatsDrawerList">
        <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">Carregando conversas...</div>
      </div>
      <div class="chats-drawer-new">
        <select id="chatsDrawerContatoSelect">
          <option value="">Iniciar nova conversa com...</option>
        </select>
        <button type="button" id="btnIniciarNovaConversa" class="btn-navbar-chat" style="background: var(--primary-color); color: #fff; border: none;">
          <i class="fa-solid fa-paper-plane"></i> Abrir
        </button>
      </div>
    `;
    document.body.appendChild(drawer);

    drawer.querySelector('#btnIniciarNovaConversa').addEventListener('click', () => {
      const sel = document.getElementById('chatsDrawerContatoSelect');
      if (!sel || !sel.value) {
        showToast('Selecione uma pessoa para iniciar a conversa.', 'info');
        return;
      }
      const opt = sel.options[sel.selectedIndex];
      const projetoId = opt.getAttribute('data-projeto-id');
      const propostaId = opt.getAttribute('data-proposta-id');
      if (projetoId && propostaId) {
        abrirChatProjeto(projetoId, propostaId);
      } else {
        abrirChatDireto(sel.value, opt.getAttribute('data-nome') || sel.value, 'Conversa Direta');
      }
    });

    if (!chatDrawerClickOutsideRegistrado) {
      chatDrawerClickOutsideRegistrado = true;
      document.addEventListener('click', (e) => {
        const drw = document.getElementById('freelink-chats-drawer');
        const btnNav = document.getElementById('btn-navbar-chat');
        if (!drw || drw.classList.contains('hidden')) return;
        if (drw.contains(e.target) || (btnNav && btnNav.contains(e.target))) return;
        drw.classList.add('hidden');
      });
    }
  }

  if (!drawer.classList.contains('hidden')) {
    drawer.classList.add('hidden');
    return;
  }
  drawer.classList.remove('hidden');

  const selEl = document.getElementById('chatsDrawerContatoSelect');
  const token = localStorage.getItem('freelink_token');

  // Só mostra contatos ligados a propostas aceitas nos projetos do usuário.
  if (selEl) {
    const contatos = obterContatosComPropostasAceitas(usuarioLogado);
    const placeholder = contatos.length
      ? 'Iniciar nova conversa com...'
      : 'Sem propostas aceitas para conversar';
    selEl.innerHTML = `<option value="">${placeholder}</option>` +
      contatos.map(contato =>
        `<option value="${escapeHtml(contato.email)}" data-nome="${escapeHtml(contato.nome)}" data-projeto-id="${escapeHtml(contato.projetoId)}" data-proposta-id="${escapeHtml(contato.propostaId)}">${escapeHtml(contato.nome)} (${contato.tipo}) — ${escapeHtml(contato.projetoTitulo)}</option>`
      ).join('');
    const btnIniciar = drawer.querySelector('#btnIniciarNovaConversa');
    if (btnIniciar) btnIniciar.disabled = contatos.length === 0;
  }

  // Carrega salas do servidor
  let salas = [];
  let erroSessaoMsg = '';
  if (token) {
    try {
      const resC = await fetch('/api/chats', { headers: { 'Authorization': 'Bearer ' + token } });
      if (resC.ok) {
        const dataC = await resC.json();
        salas = Array.isArray(dataC.chats) ? dataC.chats : [];
        atualizarBadgeChatsNavbar(salas);
      } else if (resC.status === 401) {
        erroSessaoMsg = 'Sua sessão no servidor expirou. Faça login novamente para sincronizar as conversas.';
      }
    } catch (e) {}
  } else {
    erroSessaoMsg = 'Entre novamente para sincronizar suas conversas em tempo real.';
  }

  if (!salas.length) {
    const locais = Object.values(obterChats());
    if (locais.length) {
      salas = locais.map(c => ({
        id_sala: c.id,
        titulo: c.projetoTitulo || 'Conversa',
        projeto_id: c.projetoId,
        proposta_id: null,
        participante1_email: c.clienteEmail || '',
        participante1_nome: c.clienteNome || '',
        participante2_email: c.freelancerEmail || '',
        participante2_nome: c.freelancerNome || '',
        ultima_mensagem: (c.mensagens && c.mensagens.length) ? c.mensagens[c.mensagens.length - 1].texto : ''
      }));
    }
  }

  renderizarListaConversasDrawer(salas, erroSessaoMsg);
};

window.fecharChatProjeto = function() {
  pararPollingChat();
  const chatBox = document.getElementById('freelink-chat-box');
  if (chatBox) chatBox.classList.add('hidden');
};

window.inserirSugestaoChat = function(texto) {
  const inputMsg = document.getElementById('chatInputMessage');
  if (inputMsg) {
    inputMsg.value = texto;
    inputMsg.focus();
  }
};

function renderizarMensagensChat(chat) {
  const container = document.getElementById('chatMessagesContainer');
  if (!container || !chat) return;

  const usuarioLogado = getCurrentUser();
  const meuId = usuarioLogado ? usuarioLogado.id : 'meu_usuario';
  const meuEmail = usuarioLogado && usuarioLogado.email ? usuarioLogado.email.toLowerCase() : '';
  const isSalaBot = window.chatAtivo && String(window.chatAtivo.chatId || '').startsWith('bot_');

  const msgs = Array.isArray(chat.mensagens) ? chat.mensagens : [];

  container.innerHTML = msgs.map(m => {
    if (m.remetenteId === 'sistema') {
      return `
        <div class="chat-bubble chat-bubble-system">
          <i class="fa-solid fa-circle-check" style="color: var(--primary-color); margin-right: 4px;"></i>
          ${escapeHtml(m.texto)}
          <span class="chat-msg-time">${escapeHtml(formatarHorarioMensagemChat(m))}</span>
        </div>
      `;
    }

    const emailMsg = m.remetenteEmail ? m.remetenteEmail.toLowerCase() : '';
    const isBotMsg = m.remetenteId === 'bot' || emailMsg === 'bot@freelink.com';
    const isMinha = !isBotMsg && ((meuEmail && emailMsg)
      ? (emailMsg === meuEmail)
      : (m.remetenteId === meuId || (usuarioLogado && m.remetenteNome === usuarioLogado.nome)));
    const bubbleClass = isMinha ? 'chat-bubble-me' : 'chat-bubble-other';

    let botaoBotHtml = '';
    if (isBotMsg && isSalaBot) {
      const analise = avaliarCompletudePerfil(usuarioLogado);
      if (analise.faltando.length > 0) {
        botaoBotHtml = `
          <button type="button" class="chat-bot-action-btn" onclick="irParaCompletarPerfil()">
            <i class="fa-solid fa-user-pen"></i> Completar Meu Perfil Agora (${analise.percentual}%)
          </button>
        `;
      }
    }

    return `
      <div class="chat-bubble ${bubbleClass}">
        ${!isMinha ? `<div style="font-size: 11px; font-weight: 700; color: var(--primary-color); margin-bottom: 2px;">${isBotMsg ? '<i class="fa-solid fa-robot" style="margin-right: 4px;"></i>' : ''}${escapeHtml(m.remetenteNome || '')}</div>` : ''}
        <div style="white-space: pre-line;">${escapeHtml(m.texto)}</div>
        ${botaoBotHtml}
        <span class="chat-msg-time">${escapeHtml(formatarHorarioMensagemChat(m))}</span>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

window.enviarMensagemChat = async function() {
  if (!window.chatAtivo) return;

  const input = document.getElementById('chatInputMessage');
  if (!input) return;

  const texto = input.value.trim();
  if (!texto) return;
  if (!window.FreeLinkChatModeration) {
    console.error('O filtro de conteúdo do chat não foi carregado.');
    showToast('Não foi possível verificar a mensagem. Recarregue a página e tente novamente.', 'error');
    return;
  }
  if (window.FreeLinkChatModeration.contemTermoExplicito(texto)) {
    showToast('A mensagem contém termos impróprios. Revise o texto antes de enviar.', 'error');
    return;
  }

  const { chatId, titulo, projetoId, propostaId, outroEmail, outroNome } = window.chatAtivo;
  const isSalaBot = String(chatId || '').startsWith('bot_');
  const usuarioLogado = getCurrentUser();
  if (!usuarioLogado) {
    showToast('Faça login para enviar mensagens.', 'error');
    return;
  }

  const token = localStorage.getItem('freelink_token');
  input.value = '';

  if (token) {
    try {
      await ultimaPromessaAbrirSala;
      const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ texto, titulo, projetoId, propostaId, outroEmail, outroNome })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.erro || 'Erro ao enviar mensagem.', 'error');
        input.value = texto;
        return;
      }
      await buscarMensagensChatServidor(chatId);
      if (isSalaBot) {
        await responderBotOnboardingNoChat(chatId, texto);
      }
      verificarConversasServidor();
      return;
    } catch (e) {
      showToast('Falha de conexão ao enviar mensagem.', 'error');
      input.value = texto;
      return;
    }
  }

  // Fallback local apenas para contas demo sem token no banco
  const chats = obterChats();
  const chat = chats[chatId] || { id: chatId, mensagens: [] };
  chat.mensagens.push({
    id: `msg_${Date.now()}`,
    remetenteId: usuarioLogado.id,
    remetenteEmail: usuarioLogado.email || '',
    remetenteNome: usuarioLogado.nome || 'Você',
    texto: texto,
    criadoEm: new Date().toISOString(),
    dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });
  chats[chatId] = chat;
  salvarChats(chats);
  renderizarMensagensChat(chat);

  if (isSalaBot) {
    await responderBotOnboardingNoChat(chatId, texto);
  }
};

// ====================================================================
// BOT ASSISTENTE DE PERFIL + NOTIFICAÇÃO GRANDE EM DESTAQUE
// ====================================================================

window.marcarContaRecemCriada = function(email) {
  if (!email) return;
  try {
    localStorage.setItem('freelink_conta_nova_' + String(email).trim().toLowerCase(), '1');
  } catch (e) {}
};

function limparContaRecemCriada(email) {
  if (!email) return;
  try {
    localStorage.removeItem('freelink_conta_nova_' + String(email).trim().toLowerCase());
  } catch (e) {}
}

function obterIdSalaBotUsuario(email) {
  const e = String(email || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < e.length; i++) {
    hash = ((hash << 5) - hash + e.charCodeAt(i)) | 0;
  }
  return `bot_onboarding_${Math.abs(hash).toString(36)}_${e.slice(0, 30)}`.replace(/[^a-zA-Z0-9_@.-]/g, '').slice(0, 115);
}

window.avaliarCompletudePerfil = function(usuario) {
  const u = usuario || getCurrentUser();
  if (!u || !u.email) {
    return { percentual: 100, completo: true, precisaAtencao: false, faltando: [], primeiraAba: 'pane-identificacao', primeiroCampo: 'editSpecialty', novaConta: false };
  }

  const email = String(u.email).trim().toLowerCase();
  const novaConta = localStorage.getItem('freelink_conta_nova_' + email) === '1';
  const tipoConta = String(u.tipo || u.tipo_usuario || '').toLowerCase();
  const isContratante = tipoConta === 'contratante' || tipoConta === 'cliente' || tipoConta === 'empresa' ||
    String(u.tipoPessoa || '').toUpperCase() === 'PJ';
  const tem = (v) => Boolean(v && String(v).trim() !== '');

  const setorPerfil = u.setor || String(u.especialidade || '').replace(/^Empresa\s*[·-]\s*/i, '');
  const itens = isContratante ? [
    { chave: 'razaoSocial', label: 'Razão social', aba: 'pane-company', campo: 'editCompanyLegalName', obrigatorio: true, ok: tem(u.razaoSocial) },
    { chave: 'setor', label: 'Setor de atuação', aba: 'pane-company', campo: 'editCompanySector', obrigatorio: true, ok: tem(setorPerfil) },
    { chave: 'localizacao', label: 'Localização da empresa', aba: 'pane-identificacao', campo: 'editLocation', obrigatorio: true, ok: tem(u.localizacao) },
    { chave: 'sobreEmpresa', label: 'Apresentação da empresa', aba: 'pane-company', campo: 'editCompanyAbout', obrigatorio: true, ok: tem(u.sobreEmpresa || u.bio) },
    { chave: 'servicosContratados', label: 'Serviços que contrata', aba: 'pane-company', campo: 'editCompanyServices', obrigatorio: true, ok: tem(u.servicosContratados) },
    { chave: 'foto', label: 'Foto de Perfil', aba: 'pane-midia', campo: 'editAvatar', obrigatorio: false, ok: tem(u.foto || u.avatar) }
  ] : [
    { chave: 'especialidade', label: 'Especialidade / Título', aba: 'pane-identificacao', campo: 'editSpecialty', obrigatorio: true, ok: tem(u.especialidade) },
    { chave: 'localizacao', label: 'Cidade / Localização', aba: 'pane-identificacao', campo: 'editLocation', obrigatorio: true, ok: tem(u.localizacao) },
    { chave: 'bio', label: 'Apresentação (Sobre Mim)', aba: 'pane-sobre', campo: 'editBio', obrigatorio: true, ok: tem(u.bio) },
    { chave: 'habilidades', label: 'Habilidades / Competências', aba: 'pane-skills', campo: 'editSkills', obrigatorio: true, ok: tem(u.habilidades) },
    { chave: 'foto', label: 'Foto de Perfil', aba: 'pane-midia', campo: 'editAvatar', obrigatorio: false, ok: tem(u.foto || u.avatar) }
  ];

  if (!isContratante) {
    itens.push(
      { chave: 'taxaHoraria', label: 'Taxa Horária', aba: 'pane-condicoes', campo: 'editHourlyRate', obrigatorio: false, ok: tem(u.taxaHoraria) },
      { chave: 'experienciaTexto', label: 'Experiência Profissional', aba: 'pane-experiencia', campo: 'editExperience', obrigatorio: false, ok: tem(u.experienciaTexto) },
      { chave: 'portfolioTexto', label: 'Portfólio de Trabalhos', aba: 'pane-experiencia', campo: 'editPortfolio', obrigatorio: false, ok: tem(u.portfolioTexto || u.portfolio) }
    );
  }

  const preenchidos = itens.filter(i => i.ok).length;
  const percentual = Math.round((preenchidos / itens.length) * 100);
  const faltando = itens.filter(i => !i.ok);
  const faltamObrigatorios = faltando.some(i => i.obrigatorio);
  const completo = faltando.length === 0;
  const precisaAtencao = faltamObrigatorios || (novaConta && faltando.length > 0) || percentual < 60;

  return {
    percentual,
    completo,
    precisaAtencao,
    faltando,
    primeiraAba: faltando[0] ? faltando[0].aba : 'pane-identificacao',
    primeiroCampo: faltando[0] ? faltando[0].campo : 'editSpecialty',
    novaConta
  };
};

function montarMensagemBotOnboarding(usuario, analise) {
  const tipoConta = String(usuario && (usuario.tipo || usuario.tipo_usuario || '')).toLowerCase();
  const ehEmpresa = tipoConta === 'contratante' || tipoConta === 'cliente' || tipoConta === 'empresa' ||
    String(usuario && usuario.tipoPessoa || '').toUpperCase() === 'PJ';
  const nome = usuario && (ehEmpresa ? (usuario.empresa || usuario.nome) : usuario.nome);
  const primeiroNome = nome ? nome.split(' ')[0] : (ehEmpresa ? 'Empresa' : 'Freelancer');
  const lista = analise.faltando.map(f => `• ${f.label}`).join('\n');
  return `Olá, ${primeiroNome}! 🤖 Eu sou o Assistente FreeLink.\n\nSeu perfil está em ${analise.percentual}%. Para aparecer melhor nas buscas e transmitir confiança, ainda falta preencher:\n${lista}\n\nClique no botão abaixo para completar seu perfil em menos de 2 minutos!`;
}

window.irParaCompletarPerfil = function(aba, campo) {
  const overlay = document.getElementById('freelink-bot-spotlight');
  if (overlay) overlay.classList.add('hidden');

  const usuario = getCurrentUser();
  const analise = avaliarCompletudePerfil(usuario);
  const abaAlvo = aba || analise.primeiraAba;
  const campoAlvo = campo || analise.primeiroCampo;

  const isPerfilPage = window.location.pathname.toLowerCase().includes('perfil.html');
  if (isPerfilPage && typeof window.openEditModal === 'function') {
    window.openEditModal(campoAlvo, abaAlvo);
    return;
  }

  const isSubfolder = window.location.pathname.includes('/html/') ||
                      window.location.pathname.includes('\\html\\') ||
                      document.querySelector('link[href*="../css/"]');
  const prefix = isSubfolder ? '' : 'html/';
  const qs = new URLSearchParams({ completar: '1', tab: abaAlvo, campo: campoAlvo });
  window.location.href = `${prefix}perfil.html?${qs.toString()}`;
};

window.abrirChatComBot = async function() {
  const overlay = document.getElementById('freelink-bot-spotlight');
  if (overlay) overlay.classList.add('hidden');

  const usuario = getCurrentUser();
  if (!usuario || !usuario.email) return;

  const analise = avaliarCompletudePerfil(usuario);
  const chatId = obterIdSalaBotUsuario(usuario.email);
  const msgInicial = analise.faltando.length > 0
    ? montarMensagemBotOnboarding(usuario, analise)
    : `Olá, ${usuario.nome.split(' ')[0]}! 🤖 Seu perfil está 100% completo e pronto para receber oportunidades no FreeLink!`;

  await abrirSalaChat({
    chatId,
    titulo: 'Assistente de Perfil',
    outroNome: 'Assistente FreeLink',
    outroEmail: 'bot@freelink.com',
    mensagemBot: msgInicial
  });
};

async function responderBotOnboardingNoChat(chatId, textoUsuario) {
  const usuario = getCurrentUser();
  if (!usuario) return;
  const analise = avaliarCompletudePerfil(usuario);
  const msgLower = String(textoUsuario || '').toLowerCase();

  let resposta = '';
  if (analise.faltando.length === 0) {
    resposta = '🎉 Seu perfil já está 100% completo! Agora você pode enviar propostas ou publicar projetos normalmente.';
  } else if (msgLower.includes('ok') || msgLower.includes('obrigad') || msgLower.includes('valeu')) {
    resposta = `Por nada! 😊 Quando quiser finalizar (${analise.faltando.map(f => f.label).join(', ')}), clique no botão abaixo para ir direto ao editor de perfil.`;
  } else {
    resposta = `Analisei seu perfil agora (${analise.percentual}% completo). Ainda falta preencher:\n` +
      analise.faltando.map(f => `• ${f.label}`).join('\n') +
      `\n\nClique em "Completar Meu Perfil Agora" abaixo para preencher diretamente!`;
  }

  const token = localStorage.getItem('freelink_token');
  if (token) {
    try {
      await fetch(`/api/chats/${encodeURIComponent(chatId)}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ texto: resposta, bot: true })
      });
      await buscarMensagensChatServidor(chatId);
      return;
    } catch (e) {}
  }

  const chats = obterChats();
  const chat = chats[chatId] || { id: chatId, mensagens: [] };
  chat.mensagens.push({
    id: `msg_bot_${Date.now()}`,
    remetenteId: 'bot',
    remetenteEmail: 'bot@freelink.com',
    remetenteNome: 'Assistente FreeLink',
    texto: resposta,
    criadoEm: new Date().toISOString(),
    dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });
  chats[chatId] = chat;
  salvarChats(chats);
  renderizarMensagensChat(chat);
}

async function garantirChatBotOnboarding(usuario, analise) {
  if (!usuario || !usuario.email || !analise.precisaAtencao) return;
  const email = String(usuario.email).trim().toLowerCase();
  const chatId = obterIdSalaBotUsuario(email);
  const msgInicial = montarMensagemBotOnboarding(usuario, analise);

  const chats = obterChats();
  if (!chats[chatId]) {
    chats[chatId] = {
      id: chatId,
      projetoTitulo: 'Assistente de Perfil',
      clienteEmail: email,
      clienteNome: usuario.nome,
      freelancerEmail: 'bot@freelink.com',
      freelancerNome: 'Assistente FreeLink',
      mensagens: [{
        id: `msg_bot_${Date.now()}`,
        remetenteId: 'bot',
        remetenteEmail: 'bot@freelink.com',
        remetenteNome: 'Assistente FreeLink',
        texto: msgInicial,
        criadoEm: new Date().toISOString(),
        dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]
    };
    salvarChats(chats);
  }

  const token = localStorage.getItem('freelink_token');
  const chaveSync = 'freelink_bot_sync_' + email;
  if (token && !sessionStorage.getItem(chaveSync)) {
    sessionStorage.setItem(chaveSync, '1');
    try {
      await fetch('/api/chats/abrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          idSala: chatId,
          titulo: 'Assistente de Perfil',
          outroEmail: 'bot@freelink.com',
          outroNome: 'Assistente FreeLink',
          mensagemBot: msgInicial
        })
      });
      verificarConversasServidor();
    } catch (e) {}
  }
}

function exibirNotificacaoBotGrande(usuario, analise) {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('login.html') || path.includes('registro.html')) return;
  if (path.includes('perfil.html') && window.location.search.includes('completar=1')) return;

  const email = String(usuario.email || '').trim().toLowerCase();
  const chaveAdiado = 'freelink_bot_adiado_' + email;
  if (!analise.novaConta && sessionStorage.getItem(chaveAdiado) === '1') return;

  let overlay = document.getElementById('freelink-bot-spotlight');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'freelink-bot-spotlight';
    overlay.className = 'freelink-bot-spotlight-overlay hidden';
    document.body.appendChild(overlay);
  }

  const tipoConta = String(usuario.tipo || usuario.tipo_usuario || '').toLowerCase();
  const ehEmpresa = tipoConta === 'contratante' || tipoConta === 'cliente' || tipoConta === 'empresa' ||
    String(usuario.tipoPessoa || '').toUpperCase() === 'PJ';
  const nomeExibicao = ehEmpresa ? (usuario.empresa || usuario.nome || 'Empresa') : (usuario.nome || 'Olá');
  const primeiroNome = nomeExibicao.split(' ')[0];
  const tituloCard = analise.novaConta
    ? `Bem-vindo(a), ${primeiroNome}! Termine seu perfil`
    : `${primeiroNome}, seu perfil ainda está incompleto`;

  const pillsHtml = analise.faltando.map(item => `
    <button type="button" class="bot-missing-pill" onclick="irParaCompletarPerfil('${escapeHtml(item.aba)}', '${escapeHtml(item.campo)}')">
      <i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(item.label)}
    </button>
  `).join('');

  overlay.innerHTML = `
    <div class="freelink-bot-spotlight-card" role="dialog" aria-modal="true" aria-labelledby="botSpotlightTitle">
      <div class="bot-spotlight-header">
        <div class="bot-spotlight-identity">
          <div class="bot-spotlight-avatar"><i class="fa-solid fa-robot"></i></div>
          <div>
            <div class="bot-spotlight-badge">
              <span class="chat-online-dot" style="background:#fff;"></span> Assistente FreeLink · Mensagem no Chat
            </div>
            <h3 id="botSpotlightTitle">${escapeHtml(tituloCard)}</h3>
          </div>
        </div>
        <button type="button" class="bot-spotlight-close" id="btnFecharBotSpotlight" title="Lembrar mais tarde">&times;</button>
      </div>

      <div class="bot-spotlight-body">
        <div class="bot-spotlight-progress-wrap">
          <div class="bot-spotlight-progress-top">
            <span>Progresso do seu perfil</span>
            <span style="color: var(--primary-color);">${analise.percentual}% completo</span>
          </div>
          <div class="bot-progress-track">
            <div class="bot-progress-fill" style="width: ${analise.percentual}%;"></div>
          </div>
        </div>

        <div class="bot-spotlight-bubble">
          <strong>🤖 Assistente FreeLink diz:</strong><br>
          Percebi que você ainda não terminou de montar seu perfil! Completar suas informações faz seu perfil aparecer primeiro e passa muito mais confiança para fechar trabalhos.
        </div>

        <div class="bot-missing-title">O que falta preencher (clique para ir direto):</div>
        <div class="bot-missing-pills">${pillsHtml}</div>

        <div class="bot-spotlight-actions">
          <button type="button" class="bot-cta-primary" onclick="irParaCompletarPerfil()">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Completar Meu Perfil Agora
          </button>
          <button type="button" class="bot-cta-secondary" onclick="abrirChatComBot()">
            <i class="fa-solid fa-comments"></i> Falar com o Bot no Chat
          </button>
        </div>

        <div class="bot-spotlight-later">
          <button type="button" id="btnAdiarBotSpotlight">Fazer isso mais tarde</button>
        </div>
      </div>
    </div>
  `;

  const fecharAdiar = () => {
    overlay.classList.add('hidden');
    sessionStorage.setItem(chaveAdiado, '1');
    limparContaRecemCriada(email);
  };

  overlay.querySelector('#btnFecharBotSpotlight').addEventListener('click', fecharAdiar);
  overlay.querySelector('#btnAdiarBotSpotlight').addEventListener('click', fecharAdiar);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fecharAdiar();
  });

  overlay.classList.remove('hidden');
}

function verificarOnboardingBotPerfil() {
  if (!isAuthenticated()) return;
  const usuario = getCurrentUser();
  if (!usuario || !usuario.email) return;

  const analise = avaliarCompletudePerfil(usuario);
  if (!analise.precisaAtencao) {
    limparContaRecemCriada(usuario.email);
    const overlay = document.getElementById('freelink-bot-spotlight');
    if (overlay) overlay.classList.add('hidden');
    return;
  }

  garantirChatBotOnboarding(usuario, analise);
  exibirNotificacaoBotGrande(usuario, analise);
}

window.aoAtualizarPerfilOnboarding = async function(usuarioAtualizado) {
  const u = usuarioAtualizado || getCurrentUser();
  if (!u || !u.email) return;
  limparContaRecemCriada(u.email);
  const analise = avaliarCompletudePerfil(u);
  if (!analise.precisaAtencao) {
    const overlay = document.getElementById('freelink-bot-spotlight');
    if (overlay) overlay.classList.add('hidden');
    const chatId = obterIdSalaBotUsuario(u.email);
    const token = localStorage.getItem('freelink_token');
    const msgParabens = '🎉 Parabéns! Seu perfil está completo e pronto para receber oportunidades no FreeLink!';
    if (token) {
      fetch(`/api/chats/${encodeURIComponent(chatId)}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ texto: msgParabens, bot: true })
      }).catch(() => {});
    }
  }
};

function garantirElementoChat() {
  let chatBox = document.getElementById('freelink-chat-box');
  if (!chatBox) {
    chatBox = document.createElement('div');
    chatBox.id = 'freelink-chat-box';
    chatBox.className = 'freelink-chat-window hidden';
    chatBox.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-user">
          <div class="chat-header-avatar" id="chatHeaderAvatar">FL</div>
          <div class="chat-header-details">
            <h4 id="chatHeaderName">Nome do Interlocutor</h4>
            <span class="chat-header-status"><span class="chat-online-dot"></span> Online no Freela</span>
          </div>
        </div>
        <button type="button" class="chat-header-close" onclick="fecharChatProjeto()" title="Fechar Chat">&times;</button>
      </div>

      <div class="chat-project-badge-bar">
        <span><i class="fa-solid fa-briefcase"></i> Projeto: <strong id="chatHeaderProjectTitle">-</strong></span>
        <span style="color: var(--primary-color); font-weight: 700;"><i class="fa-solid fa-shield-halved"></i> Chat Seguro</span>
      </div>

      <div class="chat-messages-container" id="chatMessagesContainer"></div>

      <div class="chat-quick-suggestions">
        <button type="button" class="chat-quick-chip" onclick="inserirSugestaoChat('Olá! Quando podemos iniciar o trabalho?')">Quando começamos?</button>
        <button type="button" class="chat-quick-chip" onclick="inserirSugestaoChat('Estou disponível para tirar dúvidas sobre o projeto.')">Tirar dúvidas</button>
        <button type="button" class="chat-quick-chip" onclick="inserirSugestaoChat('Perfeito! Vou iniciar a primeira etapa.')">Iniciando etapa</button>
      </div>

      <form id="chatForm" class="chat-input-row" onsubmit="event.preventDefault(); enviarMensagemChat();">
        <input type="text" id="chatInputMessage" class="chat-input-field" placeholder="Digite uma mensagem para alinhar o freela..." autocomplete="off">
        <button type="submit" class="chat-send-btn" title="Enviar Mensagem">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    `;
    document.body.appendChild(chatBox);
  }
  return chatBox;
}

// ====================================================================
// 11. TELA DE CONFIGURAÇÕES (configuracoes.html)
// ====================================================================

window.restaurarPreferencias = function() {
  if (!confirm('Restaurar o tema, a localização e os avisos para o padrão? Os dados da sua conta não serão apagados.')) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.THEME);
    localStorage.removeItem(STORAGE_KEYS.LOCATION);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    document.body.classList.remove('dark-mode');
    atualizarLogosTema('light');
    atualizarInterfaceTemaConfig();

    const inputLocalizacao = document.getElementById('input-localizacao');
    const statusLocalizacao = document.getElementById('status-localizacao');
    const checkProjetos = document.getElementById('check-notif-projetos');
    const checkPropostas = document.getElementById('check-notif-propostas');
    const statusNotificacoes = document.getElementById('status-notificacoes');

    if (inputLocalizacao) inputLocalizacao.value = '';
    if (statusLocalizacao) statusLocalizacao.textContent = 'Nenhuma localização salva neste navegador.';
    if (checkProjetos) checkProjetos.checked = true;
    if (checkPropostas) checkPropostas.checked = true;
    if (statusNotificacoes) statusNotificacoes.textContent = 'Preferências restauradas para o padrão.';
    showToast('Preferências restauradas. Os dados da sua conta foram mantidos.', 'success');
  } catch (error) {
    console.error('Erro ao restaurar preferências:', error);
    showToast('Não foi possível restaurar as preferências neste navegador.', 'error');
  }
};

window.dispararNotificacaoTeste = function() {
  if (typeof window.Notification === 'undefined' || window.Notification.permission !== 'granted') {
    showToast('O aviso interno está funcionando. Ative as notificações do navegador para testar um aviso do sistema.', 'info');
    return;
  }

  try {
    new window.Notification('FreeLink', {
      body: 'As notificações do navegador estão funcionando.'
    });
  } catch (error) {
    console.error('Erro ao exibir notificação de teste:', error);
    showToast('Não foi possível exibir a notificação de teste.', 'error');
  }
};

function atualizarStatusPermissaoNotificacoes() {
  const status = document.getElementById('status-permissao-notificacoes');
  const botao = document.getElementById('btn-permitir-notificacoes');
  if (!status || !botao) return;

  if (typeof window.Notification === 'undefined') {
    status.textContent = 'Este navegador não oferece suporte a notificações do sistema.';
    botao.disabled = true;
    return;
  }

  if (window.Notification.permission === 'granted') {
    status.textContent = 'Permissão concedida. O aviso de teste poderá ser exibido pelo navegador.';
    botao.disabled = true;
    botao.innerHTML = '<i class="fa-solid fa-check"></i> Ativado';
  } else if (window.Notification.permission === 'denied') {
    status.textContent = 'Permissão bloqueada pelo navegador. Altere-a nas permissões do site.';
    botao.disabled = true;
  } else {
    status.textContent = 'Permita avisos do navegador para testar uma notificação do sistema.';
  }
}

window.solicitarPermissaoNotificacoes = async function() {
  if (typeof window.Notification === 'undefined') {
    showToast('Este navegador não oferece suporte a notificações do sistema.', 'error');
    atualizarStatusPermissaoNotificacoes();
    return;
  }

  try {
    const permissao = await window.Notification.requestPermission();
    atualizarStatusPermissaoNotificacoes();
    if (permissao === 'granted') {
      showToast('Permissão para notificações concedida.', 'success');
    } else if (permissao === 'denied') {
      showToast('A permissão foi negada. Você pode alterá-la nas configurações do navegador.', 'info');
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão para notificações:', error);
    showToast('Não foi possível solicitar permissão para notificações.', 'error');
  }
};

function pareceLocalizacaoEmCoordenadas(valor) {
  return /^\s*lat(?:itude)?\s*:\s*[-+]?\d+(?:\.\d+)?\s*,\s*long(?:itude)?\s*:\s*[-+]?\d+(?:\.\d+)?\s*$/i.test(String(valor || ''));
}

function formatarCidadeRegiao(dados) {
  const cidade = String(dados.city || dados.locality || '').trim();
  const subdivision = String(dados.principalSubdivision || '').trim();
  const subdivisionCode = String(dados.principalSubdivisionCode || '').trim();
  const codigoUf = subdivisionCode.match(/^BR-([A-Z]{2})$/i);
  const regiao = codigoUf ? codigoUf[1].toUpperCase() : subdivision;

  if (cidade && regiao && cidade.toLocaleLowerCase('pt-BR') !== regiao.toLocaleLowerCase('pt-BR')) {
    return `${cidade}, ${regiao}`;
  }
  return cidade || regiao;
}

async function obterCidadeRegiao(latitude, longitude) {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('localityLanguage', 'pt');

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`O serviço de localização respondeu com HTTP ${response.status}.`);
  }

  const dados = await response.json();
  const localidade = formatarCidadeRegiao(dados);
  if (!localidade) {
    throw new Error('O serviço não identificou uma cidade ou região para esta posição.');
  }
  return localidade;
}

window.detectarLocalizacao = function() {
  const statusLocalizacao = document.getElementById('status-localizacao');
  const inputLocalizacao = document.getElementById('input-localizacao');
  const btnLocalizacao = document.getElementById('btn-obter-localizacao');
  if (!navigator.geolocation) {
    if (statusLocalizacao) statusLocalizacao.textContent = 'Este navegador não oferece suporte à localização. Informe uma cidade manualmente.';
    showToast('Geolocalização não é suportada neste navegador.', 'error');
    return;
  }

  if (btnLocalizacao) btnLocalizacao.disabled = true;
  if (statusLocalizacao) {
    statusLocalizacao.textContent = 'Solicitando a localização do dispositivo...';
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        if (statusLocalizacao) statusLocalizacao.textContent = 'Identificando cidade ou região...';
        const locString = await obterCidadeRegiao(pos.coords.latitude, pos.coords.longitude);
        localStorage.setItem(STORAGE_KEYS.LOCATION, locString);
        if (inputLocalizacao) inputLocalizacao.value = locString;
        if (statusLocalizacao) statusLocalizacao.textContent = `Localização aproximada salva neste navegador: ${locString}`;
        showToast(`Cidade ou região detectada: ${locString}`, 'success');
      } catch (error) {
        console.error('Não foi possível identificar ou salvar a cidade/região:', error);
        const mensagem = error instanceof Error
          ? error.message
          : 'Não foi possível identificar a cidade ou região. Informe-a manualmente.';
        if (statusLocalizacao) statusLocalizacao.textContent = `${mensagem} Você também pode informar a cidade manualmente.`;
        showToast('Não foi possível identificar a cidade ou região.', 'error');
      } finally {
        if (btnLocalizacao) btnLocalizacao.disabled = false;
      }
    },
    (err) => {
      console.warn('Erro de geolocalização:', err);
      const mensagens = {
        1: 'Permissão negada. Você pode informar uma cidade manualmente.',
        2: 'Não foi possível determinar sua localização. Tente novamente ou informe uma cidade.',
        3: 'A solicitação expirou. Tente novamente ou informe uma cidade.'
      };
      const mensagem = mensagens[err.code] || 'Não foi possível obter sua localização. Informe uma cidade manualmente.';
      if (statusLocalizacao) statusLocalizacao.textContent = mensagem;
      showToast(mensagem, 'error');
      if (btnLocalizacao) btnLocalizacao.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
};

function configurarTelaConfiguracoes() {
  const btnClaro = document.getElementById('btn-tema-claro');
  const btnEscuro = document.getElementById('btn-tema-escuro');
  const btnRestaurarPreferencias = document.getElementById('btn-resetar-preferencias');
  const btnTestarNotif = document.getElementById('btn-testar-notificacao');
  const btnPermitirNotif = document.getElementById('btn-permitir-notificacoes');
  const usuario = getCurrentUser();

  const contaAutenticada = document.getElementById('config-account-authenticated');
  const contaVisitante = document.getElementById('config-account-guest');
  const eyebrow = document.getElementById('config-page-eyebrow');
  const descricao = document.getElementById('config-page-description');
  const autenticado = isAuthenticated();
  if (contaAutenticada) contaAutenticada.hidden = !autenticado;
  if (contaVisitante) contaVisitante.hidden = autenticado;
  if (!autenticado && eyebrow) eyebrow.textContent = 'Preferências do navegador';
  if (!autenticado && descricao) {
    descricao.textContent = 'Personalize a plataforma sem entrar. As preferências ficam salvas neste navegador.';
  }

  const nomeUsuario = document.getElementById('config-nome-usuario');
  const emailUsuario = document.getElementById('config-email-usuario');
  const tipoUsuario = document.getElementById('config-tipo-usuario');
  if (nomeUsuario) nomeUsuario.textContent = usuario && usuario.nome ? usuario.nome : 'Usuário FreeLink';
  if (emailUsuario) emailUsuario.textContent = usuario && usuario.email ? usuario.email : '';
  if (tipoUsuario) {
    const tipo = String(usuario && (usuario.tipo || usuario.tipo_usuario) || '').toLowerCase();
    tipoUsuario.textContent = tipo === 'freelancer' ? 'Freelancer' : (tipo ? 'Contratante' : 'Conta FreeLink');
  }

  const btnLogout = document.getElementById('btn-logout-settings');
  if (btnLogout) btnLogout.addEventListener('click', abrirModalConfirmacaoLogout);

  if (btnClaro) btnClaro.addEventListener('click', () => aplicarTema('light'));
  if (btnEscuro) btnEscuro.addEventListener('click', () => aplicarTema('dark'));
  atualizarInterfaceTemaConfig();

  if (btnRestaurarPreferencias) {
    btnRestaurarPreferencias.addEventListener('click', window.restaurarPreferencias);
  }

  if (btnTestarNotif) {
    btnTestarNotif.addEventListener('click', window.dispararNotificacaoTeste);
  }
  if (btnPermitirNotif) {
    btnPermitirNotif.addEventListener('click', window.solicitarPermissaoNotificacoes);
  }
  atualizarStatusPermissaoNotificacoes();

  const btnLocalizacao = document.getElementById('btn-obter-localizacao');
  const btnSalvarLocalizacao = document.getElementById('btn-salvar-localizacao');
  const btnLimparLocalizacao = document.getElementById('btn-limpar-localizacao');
  const inputLocalizacao = document.getElementById('input-localizacao');
  const statusLocalizacao = document.getElementById('status-localizacao');
  const locSalva = localStorage.getItem(STORAGE_KEYS.LOCATION);
  if (locSalva) {
    if (pareceLocalizacaoEmCoordenadas(locSalva)) {
      localStorage.removeItem(STORAGE_KEYS.LOCATION);
      if (statusLocalizacao) {
        statusLocalizacao.textContent = 'A localização antiga estava salva como coordenadas e foi removida. Use Detectar para obter sua cidade ou região.';
      }
    } else {
      if (inputLocalizacao) inputLocalizacao.value = locSalva;
      if (statusLocalizacao) statusLocalizacao.textContent = `Localização salva neste navegador: ${locSalva}`;
    }
  }

  if (btnLocalizacao) {
    btnLocalizacao.addEventListener('click', window.detectarLocalizacao);
  }
  if (btnSalvarLocalizacao) {
    btnSalvarLocalizacao.addEventListener('click', () => {
      const valor = inputLocalizacao ? inputLocalizacao.value.trim() : '';
      if (!valor) {
        showToast('Informe uma cidade ou use a opção de detecção.', 'info');
        if (inputLocalizacao) inputLocalizacao.focus();
        return;
      }
      if (pareceLocalizacaoEmCoordenadas(valor)) {
        showToast('Informe uma cidade ou região, ou use Detectar para identificá-la.', 'info');
        if (inputLocalizacao) inputLocalizacao.focus();
        return;
      }
      try {
        localStorage.setItem(STORAGE_KEYS.LOCATION, valor);
        if (statusLocalizacao) statusLocalizacao.textContent = `Localização salva neste navegador: ${valor}`;
        showToast('Preferência de localização salva.', 'success');
      } catch (error) {
        console.error('Erro ao salvar localização:', error);
        showToast('Não foi possível salvar a localização neste navegador.', 'error');
      }
    });
  }
  if (btnLimparLocalizacao) {
    btnLimparLocalizacao.addEventListener('click', () => {
      try {
        localStorage.removeItem(STORAGE_KEYS.LOCATION);
        if (inputLocalizacao) inputLocalizacao.value = '';
        if (statusLocalizacao) statusLocalizacao.textContent = 'Nenhuma localização salva neste navegador.';
        showToast('Preferência de localização removida.', 'success');
      } catch (error) {
        console.error('Erro ao remover localização:', error);
        showToast('Não foi possível remover a localização salva.', 'error');
      }
    });
  }

  const checkProjetos = document.getElementById('check-notif-projetos');
  const checkPropostas = document.getElementById('check-notif-propostas');
  const statusNotificacoes = document.getElementById('status-notificacoes');

  try {
    const notifsSalvas = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '{}');
    if (checkProjetos) checkProjetos.checked = typeof notifsSalvas.projetos === 'boolean' ? notifsSalvas.projetos : true;
    if (checkPropostas) checkPropostas.checked = typeof notifsSalvas.propostas === 'boolean' ? notifsSalvas.propostas : true;
  } catch (error) {
    console.warn('Não foi possível carregar as preferências de notificação:', error);
    if (checkProjetos) checkProjetos.checked = true;
    if (checkPropostas) checkPropostas.checked = true;
    if (statusNotificacoes) statusNotificacoes.textContent = 'Não foi possível carregar as preferências salvas.';
  }

  function salvarNotificacoes() {
    try {
      const prefs = {
        projetos: checkProjetos ? checkProjetos.checked : true,
        propostas: checkPropostas ? checkPropostas.checked : true
      };
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(prefs));
      if (statusNotificacoes) statusNotificacoes.textContent = 'Preferências salvas neste navegador.';
    } catch (error) {
      console.error('Erro ao salvar preferências de notificação:', error);
      if (statusNotificacoes) statusNotificacoes.textContent = 'Não foi possível salvar as preferências.';
      showToast('Não foi possível salvar as preferências de notificação.', 'error');
    }
  }

  if (checkProjetos) checkProjetos.addEventListener('change', salvarNotificacoes);
  if (checkPropostas) checkPropostas.addEventListener('change', salvarNotificacoes);
}

// ====================================================================
// 12. UTILITÁRIOS E INICIALIZAÇÃO GERAL
// ====================================================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function executarInicializacaoGeral() {
  inicializarSeedBanco();
  carregarTemaSalvo();
  verificarProtecaoRotas();
  checkFlashMessage();
  configurarNavbar();
  atualizarNavbarAutenticacao();

  inicializarIndexPage();
  configurarRegistro();
  configurarLogin();
  configurarFormularioPostagem();
  carregarDetalhesProjeto();
  configurarTelaConfiguracoes();

  sincronizarSessaoComServidor();
  sincronizarProjetosComServidor();
  iniciarPollingListaChats();
  verificarOnboardingBotPerfil();
}

carregarTemaSalvo();
verificarProtecaoRotas();

document.addEventListener('DOMContentLoaded', () => {
  executarInicializacaoGeral();
});

async function carregarServicos() {
    const container = document.getElementById('lista-servicos');
    if (!container) return;
    try {
        const resposta = await fetch('/api/servicos');
        const servicos = await resposta.json();
        container.innerHTML = '';

        servicos.forEach(servico => {
            const card = document.createElement('div');
            card.className = 'card-servico';
            card.innerHTML = `
                <h3>${escapeHtml(servico.titulo)}</h3>
                <p>${escapeHtml(servico.descricao)}</p>
                <span>Categoria: ${escapeHtml(servico.categoria)}</span>
                <strong>R$ ${escapeHtml(servico.valor_sugerido)}</strong>
            `;
            container.appendChild(card);
        });
    } catch (erro) {
        console.error('Erro ao carregar os serviços:', erro);
    }
}