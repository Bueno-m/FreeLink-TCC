/**
 * ====================================================================
 * FREELINK - SISTEMA DE GERENCIAMENTO DE PROJETOS E FREELANCERS (TCC)
 * JavaScript Vanilla puro (sem dependências ou frameworks)
 * ====================================================================
 * 
 * Sumário dos Módulos:
 * 1. Sistema de Temas (Modo Escuro / Modo Claro) com Persistência
 * 2. Autenticação sem Backend (Login & Registro no LocalStorage)
 * 3. Gerenciamento de Projetos e Trabalhos (Mock Data + CRUD no LocalStorage)
 * 4. Renderização Dinâmica e Busca em Tempo Real (index.html)
 * 5. Publicação de Novos Projetos (postar-trabalho.html)
 * 6. Detalhes do Projeto e Envio de Propostas (detalhes-projeto.html)
 * 7. Tela de Configurações (Tema, Localização Própria e Notificações)
 * 8. Navbar Responsiva e Atualização de Sessão do Usuário
 */

// Chaves de armazenamento no LocalStorage
const STORAGE_KEYS = {
  TRABALHOS: 'freelink_trabalhos',
  USUARIOS: 'freelink_usuarios',
  USUARIO_LOGADO: 'freelink_usuario_logado',
  TEMA: 'freelink_tema',
  LOCALIZACAO: 'freelink_localizacao',
  NOTIFICACOES: 'freelink_notificacoes'
};

// ====================================================================
// 1. SISTEMA DE TEMAS (MODO ESCURO / MODO CLARO)
// ====================================================================

/**
 * Atualiza o logotipo (brand-logo) em todas as páginas para a versão correspondente ao tema
 * @param {string} tema - 'light' ou 'dark'
 */
function atualizarLogosTema(tema) {
  const logos = document.querySelectorAll('.brand-logo');
  const isHtmlSubfolder = window.location.pathname.includes('/html/') || 
                          window.location.pathname.includes('\\html\\') ||
                          document.querySelector('link[href*="../css/"]');
  const prefix = isHtmlSubfolder ? '../' : '';
  const novoSrc = tema === 'dark' ? `${prefix}logo-dark.svg` : `${prefix}logo-light.svg`;

  logos.forEach(logo => {
    logo.src = novoSrc;
  });
}

/**
 * Aplica o tema (claro ou escuro) e salva no localStorage
 * @param {string} tema - 'light' ou 'dark'
 */
function aplicarTema(tema) {
  if (tema === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem(STORAGE_KEYS.TEMA, 'dark');
    atualizarLogosTema('dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem(STORAGE_KEYS.TEMA, 'light');
    atualizarLogosTema('light');
  }
  atualizarInterfaceTemaConfig();
}

/**
 * Carrega a preferência de tema salva logo no início do carregamento
 */
function carregarTemaSalvo() {
  const temaSalvo = localStorage.getItem(STORAGE_KEYS.TEMA) || 'light';
  if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode');
    atualizarLogosTema('dark');
  } else {
    document.body.classList.remove('dark-mode');
    atualizarLogosTema('light');
  }
  atualizarInterfaceTemaConfig();
}

/**
 * Atualiza visualmente os botões de seleção de tema na tela de configurações
 */
function atualizarInterfaceTemaConfig() {
  const btnClaro = document.getElementById('btn-tema-claro');
  const btnEscuro = document.getElementById('btn-tema-escuro');
  const temaAtual = localStorage.getItem(STORAGE_KEYS.TEMA) || 'light';

  if (btnClaro && btnEscuro) {
    if (temaAtual === 'dark') {
      btnEscuro.style.borderColor = 'var(--primary-color)';
      btnEscuro.style.boxShadow = '0 0 0 2px var(--primary-color)';
      btnEscuro.style.backgroundColor = 'var(--bg-card)';
      btnClaro.style.borderColor = 'var(--border-color)';
      btnClaro.style.boxShadow = 'none';
      btnClaro.style.backgroundColor = 'var(--bg-input)';
    } else {
      btnClaro.style.borderColor = 'var(--primary-color)';
      btnClaro.style.boxShadow = '0 0 0 2px var(--primary-color)';
      btnClaro.style.backgroundColor = 'var(--bg-card)';
      btnEscuro.style.borderColor = 'var(--border-color)';
      btnEscuro.style.boxShadow = 'none';
      btnEscuro.style.backgroundColor = 'var(--bg-input)';
    }
  }
}

// ====================================================================
// 2. AUTENTICAÇÃO SEM BANCO DE DADOS (LOCALSTORAGE)
// ====================================================================

// Usuários iniciais mockados (garante conta padrão para testes no TCC)
const USUARIOS_PADRAO = [
  {
    id: "user_1",
    nome: "Aluno TCC FreeLink",
    email: "aluno@freelink.com",
    senha: "123456"
  },
  {
    id: "user_2",
    nome: "Admin FreeLink",
    email: "admin@freelink.com",
    senha: "admin"
  }
];

/**
 * Obtém os usuários salvos no localStorage
 * @returns {Array} Lista de usuários cadastrados
 */
function obterUsuarios() {
  const dados = localStorage.getItem(STORAGE_KEYS.USUARIOS);
  if (!dados) {
    salvarUsuarios(USUARIOS_PADRAO);
    return USUARIOS_PADRAO;
  }
  try {
    return JSON.parse(dados);
  } catch (e) {
    return USUARIOS_PADRAO;
  }
}

/**
 * Salva a lista de usuários no localStorage
 * @param {Array} usuarios 
 */
function salvarUsuarios(usuarios) {
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
}

/**
 * Retorna os dados do usuário atualmente logado ou null
 * @returns {Object|null}
 */
function obterUsuarioLogado() {
  const dados = localStorage.getItem(STORAGE_KEYS.USUARIO_LOGADO);
  if (!dados) return null;
  try {
    return JSON.parse(dados);
  } catch (e) {
    return null;
  }
}

/**
 * Realiza o logout e recarrega a página
 */
function fazerLogout() {
  localStorage.removeItem(STORAGE_KEYS.USUARIO_LOGADO);
  alert('Você saiu da sua conta.');
  window.location.reload();
}

/**
 * Configura o formulário de cadastro em registro.html
 */
function configurarRegistro() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const senha = document.getElementById('reg-senha').value;
    const confirmaSenha = document.getElementById('reg-confirma-senha').value;

    if (!nome || !email || !senha || !confirmaSenha) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    if (senha !== confirmaSenha) {
      alert('As senhas digitadas não coincidem!');
      return;
    }

    const usuarios = obterUsuarios();

    // Verifica se o e-mail já foi cadastrado
    const usuarioExistente = usuarios.find(u => u.email === email);
    if (usuarioExistente) {
      alert('Este e-mail já está cadastrado no FreeLink! Faça login ou use outro e-mail.');
      return;
    }

    // Cria novo usuário
    const novoUsuario = {
      id: `user_${Date.now()}`,
      nome: nome,
      email: email,
      senha: senha
    };

    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    // Realiza o login automático
    localStorage.setItem(STORAGE_KEYS.USUARIO_LOGADO, JSON.stringify({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email
    }));

    alert(`🎉 Conta criada com sucesso! Seja bem-vindo(a), ${nome}!`);
    window.location.href = 'index.html';
  });
}

/**
 * Configura o formulário de login em login.html
 */
function configurarLogin() {
  const form = document.getElementById('form-login');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
      alert('Por favor, preencha seu e-mail e senha!');
      return;
    }

    const usuarios = obterUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuarioEncontrado) {
      alert('❌ E-mail ou senha incorretos!\n\nDica para o TCC: Você pode cadastrar uma conta nova ou usar:\nE-mail: aluno@freelink.com | Senha: 123456');
      return;
    }

    // Salva a sessão do usuário no LocalStorage
    localStorage.setItem(STORAGE_KEYS.USUARIO_LOGADO, JSON.stringify({
      id: usuarioEncontrado.id,
      nome: usuarioEncontrado.nome,
      email: usuarioEncontrado.email
    }));

    alert(`👋 Olá, ${usuarioEncontrado.nome}! Login realizado com sucesso.`);
    window.location.href = 'index.html';
  });
}

/**
 * Atualiza o cabeçalho (Navbar) exibindo o nome do usuário e botão de logout se estiver logado
 */
function atualizarNavbarAutenticacao() {
  const container = document.getElementById('auth-buttons-container') || document.querySelector('.auth-buttons');
  if (!container) return;

  const usuario = obterUsuarioLogado();

  if (usuario) {
    const primeiroNome = usuario.nome.split(' ')[0];
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 13.5px; color: var(--text-color); font-weight: 500;">
          <i class="fa-regular fa-circle-user" style="color: var(--primary-color);"></i> Olá, <strong>${escapeHtml(primeiroNome)}</strong>
        </span>
        <button id="btn-logout-navbar" class="btn-register" style="padding: 6px 12px; font-size: 12px; cursor: pointer; border: none; background: #ef4444;" title="Encerrar sessão">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair
        </button>
      </div>
    `;

    const btnLogout = document.getElementById('btn-logout-navbar');
    if (btnLogout) {
      btnLogout.addEventListener('click', fazerLogout);
    }
  }
}

// ====================================================================
// 3. GERENCIAMENTO DE PROJETOS (LOCALSTORAGE)
// ====================================================================

const PROJETOS_INICIAIS = [
  {
    id: "1",
    titulo: "Criação de Identidade Visual e Logotipo Moderno",
    categoria: "Design & Multimídia",
    empresa: "Studio Criativo Digital",
    localizacao: "Remoto / Rio de Janeiro",
    orcamento: "850,00",
    prazo: "10 dias",
    propostas: 14,
    dataPublicacao: "Publicado há 2 dias",
    descricao: "Estamos buscando um designer gráfico talentoso para desenvolver a nova identidade visual da nossa marca. O trabalho inclui a criação do logotipo principal, variações de cores (modo claro e escuro), tipografia oficial, paleta de cores em formato hexadecimal e entrega dos arquivos vetoriais editáveis (.AI, .EPS, .SVG) e exportações em alta resolução (.PNG com fundo transparente)."
  },
  {
    id: "2",
    titulo: "Desenvolvimento de Landing Page Responsiva",
    categoria: "Programação & TI",
    empresa: "TechStart Soluções",
    localizacao: "Remoto / São Paulo",
    orcamento: "2.400,00",
    prazo: "15 dias",
    propostas: 8,
    dataPublicacao: "Publicado ontem",
    descricao: "Precisamos de um desenvolvedor front-end para criar uma Landing Page moderna de alta conversão para o lançamento do nosso novo produto SaaS. A página deve ser 100% responsiva (mobile, tablet e desktop), otimizada para SEO e velocidade de carregamento (Core Web Vitals), contendo formulário de captura de leads integrado e seções explicativas de planos e depoimentos."
  },
  {
    id: "3",
    titulo: "Edição e Motion Graphics para Vídeos de Redes Sociais",
    categoria: "Design & Multimídia",
    empresa: "Agência Viraliza",
    localizacao: "Remoto / Minas Gerais",
    orcamento: "1.200,00",
    prazo: "7 dias",
    propostas: 19,
    dataPublicacao: "Publicado hoje",
    descricao: "Procuramos um editor de vídeo criativo para produzir um pacote de 10 vídeos curtos (Reels, TikTok e Shorts). Forneceremos as gravações brutas e os roteiros. O editor será responsável por cortes dinâmicos, legendas sincronizadas estilizadas, efeitos sonoros (SFX), trilha sonora sem direitos autorais e inserção de animações de texto (motion graphics)."
  },
  {
    id: "4",
    titulo: "Redação de Artigos Especializados sobre Tecnologia e IA",
    categoria: "Redação & Tradução",
    empresa: "Portal Futuro Tech",
    localizacao: "Remoto / Curitiba",
    orcamento: "600,00",
    prazo: "5 dias",
    propostas: 6,
    dataPublicacao: "Publicado há 3 dias",
    descricao: "Buscamos redator com excelente domínio da língua portuguesa e conhecimento em inteligência artificial para redigir 4 artigos aprofundados (cerca de 1.500 palavras cada) com foco em SEO, legibilidade e boas práticas editoriais."
  }
];

function obterTrabalhos() {
  const dados = localStorage.getItem(STORAGE_KEYS.TRABALHOS);
  if (!dados) {
    salvarTrabalhos(PROJETOS_INICIAIS);
    return PROJETOS_INICIAIS;
  }
  try {
    return JSON.parse(dados);
  } catch (erro) {
    return PROJETOS_INICIAIS;
  }
}

function salvarTrabalhos(trabalhos) {
  localStorage.setItem(STORAGE_KEYS.TRABALHOS, JSON.stringify(trabalhos));
}

// ====================================================================
// 4. RENDERIZAÇÃO DINÂMICA NA TELA PRINCIPAL (index.html)
// ====================================================================

function renderizarTrabalhos(termoBusca = '', categoriaFiltro = '') {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  const todosTrabalhos = obterTrabalhos();

  const trabalhosFiltrados = todosTrabalhos.filter(trabalho => {
    const correspondeTexto = !termoBusca || 
      trabalho.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      trabalho.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (trabalho.empresa && trabalho.empresa.toLowerCase().includes(termoBusca.toLowerCase()));

    const correspondeCategoria = !categoriaFiltro || 
      trabalho.categoria.toLowerCase() === categoriaFiltro.toLowerCase();

    return correspondeTexto && correspondeCategoria;
  });

  if (trabalhosFiltrados.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-input); border-radius: 12px; border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-folder-open" style="font-size: 36px; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h3 style="color: var(--text-heading); margin-bottom: 6px;">Nenhum trabalho encontrado</h3>
        <p style="color: var(--text-muted); font-size: 14px;">Tente buscar com outros termos ou publique um novo projeto!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = trabalhosFiltrados.map(trabalho => `
    <div class="job-card" onclick="redirecionarParaDetalhes('${trabalho.id}')" style="cursor: pointer;" title="Clique para ver os detalhes do projeto">
      <h3>${escapeHtml(trabalho.titulo)}</h3>
      <p class="company">${escapeHtml(trabalho.empresa || 'Empresa Anônima')}</p>
      <p class="location">${escapeHtml(trabalho.localizacao || 'Remoto')}</p>
      <p class="price">R$ ${escapeHtml(trabalho.orcamento)}</p>
      <hr>
      <div class="card-footer">
        <span><i class="fa-regular fa-clock"></i> ${escapeHtml(trabalho.prazo || 'A combinar')}</span>
        <span><i class="fa-regular fa-folder"></i> ${escapeHtml(trabalho.categoria)}</span>
      </div>
    </div>
  `).join('');
}

function redirecionarParaDetalhes(id) {
  window.location.href = `detalhes-projeto.html?id=${encodeURIComponent(id)}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function configurarBuscaIndex() {
  const inputBusca = document.getElementById('search-input');
  const selectCategoria = document.getElementById('search-category');
  const btnBuscar = document.getElementById('btn-search');

  function executarBusca() {
    const termo = inputBusca ? inputBusca.value.trim() : '';
    const categoria = selectCategoria ? selectCategoria.value : '';
    renderizarTrabalhos(termo, categoria);
  }

  if (btnBuscar) {
    btnBuscar.addEventListener('click', (e) => {
      e.preventDefault();
      executarBusca();
    });
  }

  if (inputBusca) {
    inputBusca.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        executarBusca();
      }
    });
  }

  if (selectCategoria) {
    selectCategoria.addEventListener('change', executarBusca);
  }

  const itensCategorias = document.querySelectorAll('.category-item');
  itensCategorias.forEach(item => {
    item.addEventListener('click', () => {
      const p = item.querySelector('p');
      if (p && selectCategoria) {
        const catTexto = p.textContent.trim();
        selectCategoria.value = catTexto;
        const secaoTrabalhos = document.getElementById('secao-trabalhos');
        if (secaoTrabalhos) {
          secaoTrabalhos.scrollIntoView({ behavior: 'smooth' });
        }
        executarBusca();
      }
    });
  });
}

// ====================================================================
// 5. POSTAGEM DE PROJETOS (postar-trabalho.html)
// ====================================================================

function configurarFormularioPostagem() {
  const form = document.getElementById('form-postar-trabalho');
  if (!form) return;

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const orcamento = document.getElementById('orcamento').value.trim();
    const prazo = document.getElementById('prazo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();

    if (!titulo || !categoria || !orcamento || !prazo || !descricao) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const usuarioLogado = obterUsuarioLogado();
    const nomeEmpresa = usuarioLogado ? usuarioLogado.nome : "Cliente FreeLink";

    // Pega localização própria salva caso disponível
    const localizacaoSalva = localStorage.getItem(STORAGE_KEYS.LOCALIZACAO) || "Remoto / Brasil";

    const novoTrabalho = {
      id: Date.now().toString(),
      titulo: titulo,
      categoria: categoria,
      empresa: nomeEmpresa,
      localizacao: localizacaoSalva,
      orcamento: orcamento.replace(/^R\$\s?/, ''),
      prazo: prazo,
      propostas: 0,
      dataPublicacao: "Publicado recentemente",
      descricao: descricao
    };

    const trabalhos = obterTrabalhos();
    trabalhos.unshift(novoTrabalho);
    salvarTrabalhos(trabalhos);

    alert('🎉 Projeto publicado com sucesso! Redirecionando para a página principal...');
    window.location.href = 'index.html';
  });
}

// ====================================================================
// 6. DETALHES DO PROJETO & ENVIO DE PROPOSTA (detalhes-projeto.html)
// ====================================================================

function carregarDetalhesProjeto() {
  const detalheContainer = document.getElementById('detalhe-conteudo');
  if (!detalheContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const idProjeto = urlParams.get('id');

  if (!idProjeto) {
    exibirErroProjetoNaoEncontrado("Nenhum ID de projeto foi especificado.");
    return;
  }

  const trabalhos = obterTrabalhos();
  const projeto = trabalhos.find(t => String(t.id) === String(idProjeto));

  if (!projeto) {
    exibirErroProjetoNaoEncontrado("O projeto solicitado não existe ou foi removido.");
    return;
  }

  const elemTitulo = document.getElementById('detalhe-titulo');
  const elemCategoria = document.getElementById('detalhe-categoria');
  const elemOrcamento = document.getElementById('detalhe-orcamento');
  const elemPrazo = document.getElementById('detalhe-prazo');
  const elemEmpresa = document.getElementById('detalhe-empresa');
  const elemLocalizacao = document.getElementById('detalhe-localizacao');
  const elemData = document.getElementById('detalhe-data');
  const elemDescricao = document.getElementById('detalhe-descricao');
  const elemPropostas = document.getElementById('detalhe-propostas');

  if (elemTitulo) elemTitulo.textContent = projeto.titulo;
  if (elemCategoria) elemCategoria.textContent = projeto.categoria;
  if (elemOrcamento) elemOrcamento.textContent = `R$ ${projeto.orcamento}`;
  if (elemPrazo) elemPrazo.textContent = projeto.prazo;
  if (elemEmpresa) elemEmpresa.textContent = projeto.empresa || 'Cliente FreeLink';
  if (elemLocalizacao) elemLocalizacao.textContent = projeto.localizacao || 'Remoto';
  if (elemData) elemData.textContent = projeto.dataPublicacao || 'Publicado recentemente';
  if (elemDescricao) elemDescricao.textContent = projeto.descricao;
  if (elemPropostas) elemPropostas.textContent = `${projeto.propostas || 0} propostas recebidas`;

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
  const btnEnviar = document.getElementById('btn-enviar-proposta');
  const modalProposta = document.getElementById('modal-proposta');
  const formProposta = document.getElementById('form-proposta-envio');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const btnCancelarModal = document.getElementById('btn-cancelar-modal');

  if (btnEnviar) {
    btnEnviar.addEventListener('click', () => {
      if (modalProposta) {
        modalProposta.style.display = 'flex';
      }
    });
  }

  if (btnFecharModal && modalProposta) {
    btnFecharModal.addEventListener('click', () => {
      modalProposta.style.display = 'none';
    });
  }

  if (btnCancelarModal && modalProposta) {
    btnCancelarModal.addEventListener('click', () => {
      modalProposta.style.display = 'none';
    });
  }

  if (formProposta && modalProposta) {
    formProposta.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const valor = document.getElementById('proposta-valor') ? document.getElementById('proposta-valor').value : '';

      modalProposta.style.display = 'none';

      const elemPropostas = document.getElementById('detalhe-propostas');
      if (elemPropostas) {
        const totalAtual = (projeto.propostas || 0) + 1;
        elemPropostas.textContent = `${totalAtual} propostas recebidas`;
      }

      alert(`🎉 Parabéns! Sua proposta de R$ ${valor || projeto.orcamento} foi enviada com sucesso para o projeto "${projeto.titulo}". O cliente entrará em contato em breve!`);
    });
  }
}

// ====================================================================
// 7. TELA DE CONFIGURAÇÕES (configuracoes.html)
// ====================================================================

function configurarTelaConfiguracoes() {
  const btnClaro = document.getElementById('btn-tema-claro');
  const btnEscuro = document.getElementById('btn-tema-escuro');
  const btnLocalizacao = document.getElementById('btn-obter-localizacao');
  const statusLocalizacao = document.getElementById('status-localizacao');
  const btnTestarNotif = document.getElementById('btn-testar-notificacao');
  const btnResetarBanco = document.getElementById('btn-resetar-banco');

  // Alternar Tema Claro / Escuro
  if (btnClaro) {
    btnClaro.addEventListener('click', () => {
      aplicarTema('light');
    });
  }

  if (btnEscuro) {
    btnEscuro.addEventListener('click', () => {
      aplicarTema('dark');
    });
  }

  atualizarInterfaceTemaConfig();

  // Localização Própria
  if (statusLocalizacao) {
    const locSalva = localStorage.getItem(STORAGE_KEYS.LOCALIZACAO);
    if (locSalva) {
      statusLocalizacao.innerHTML = `<i class="fa-solid fa-check-circle" style="color: var(--primary-color);"></i> Localização ativa: <strong>${escapeHtml(locSalva)}</strong>`;
    }
  }

  if (btnLocalizacao) {
    btnLocalizacao.addEventListener('click', () => {
      if (statusLocalizacao) {
        statusLocalizacao.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Obtendo coordenadas do dispositivo...`;
      }

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locTexto = `Lat: ${position.coords.latitude.toFixed(2)}, Long: ${position.coords.longitude.toFixed(2)} (Brasil)`;
            localStorage.setItem(STORAGE_KEYS.LOCALIZACAO, locTexto);
            if (statusLocalizacao) {
              statusLocalizacao.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--primary-color);"></i> Localização detectada: <strong>${locTexto}</strong>`;
            }
            alert(`📍 Localização detectada com sucesso!\n${locTexto}`);
          },
          (error) => {
            // Simulação caso o navegador bloqueie ou em ambiente local
            const locSimulada = "São Paulo, SP - Brasil";
            localStorage.setItem(STORAGE_KEYS.LOCALIZACAO, locSimulada);
            if (statusLocalizacao) {
              statusLocalizacao.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--primary-color);"></i> Localização definida: <strong>${locSimulada}</strong>`;
            }
            alert(`📍 Localização definida como: ${locSimulada}`);
          },
          { timeout: 5000 }
        );
      } else {
        const locPadrao = "São Paulo, SP - Brasil";
        localStorage.setItem(STORAGE_KEYS.LOCALIZACAO, locPadrao);
        if (statusLocalizacao) {
          statusLocalizacao.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--primary-color);"></i> Localização: <strong>${locPadrao}</strong>`;
        }
      }
    });
  }

  // Notificações do Site
  if (btnTestarNotif) {
    btnTestarNotif.addEventListener('click', () => {
      // Solicita permissão se suportado
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("FreeLink | Notificação", {
            body: "🚀 Você recebeu 2 novas propostas no seu projeto publicado!",
            icon: "../logo.png"
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("FreeLink | Notificação", {
                body: "🚀 Notificações do FreeLink ativadas com sucesso!",
                icon: "../logo.png"
              });
            }
          });
        }
      }

      alert("🔔 [Notificação do FreeLink]\n\nNovo alerta: Você tem 2 novas propostas aguardando sua resposta no projeto!");
    });
  }

  // Reset de Dados para o TCC
  if (btnResetarBanco) {
    btnResetarBanco.addEventListener('click', () => {
      const confirmar = confirm("Deseja restaurar todos os dados mockados de trabalhos e usuários para o estado original do TCC?");
      if (confirmar) {
        localStorage.removeItem(STORAGE_KEYS.TRABALHOS);
        localStorage.removeItem(STORAGE_KEYS.USUARIOS);
        localStorage.removeItem(STORAGE_KEYS.USUARIO_LOGADO);
        salvarTrabalhos(PROJETOS_INICIAIS);
        salvarUsuarios(USUARIOS_PADRAO);
        alert("✅ Dados locais restaurados com sucesso para o padrão de demonstração!");
        window.location.reload();
      }
    });
  }
}

// ====================================================================
// 8. NAVBAR RESPONSIVA & EFEITOS
// ====================================================================

function configurarNavbar() {
  const navLinks = document.querySelector('.nav-links');
  const btnToggle = document.querySelector('.nav-toggle');

  if (btnToggle && navLinks) {
    btnToggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });
  }

  if (navLinks) {
    const links = navLinks.querySelectorAll('a');

    function atualizarBarra(link) {
      if (!link) return;
      const left = link.offsetLeft;
      const width = link.offsetWidth;
      navLinks.style.setProperty('--nav-left', left + 'px');
      navLinks.style.setProperty('--nav-width', width + 'px');
    }

    const linkAtivo = navLinks.querySelector('a.active');
    if (linkAtivo) {
      atualizarBarra(linkAtivo);
    }

    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        atualizarBarra(link);
      });
    });

    navLinks.addEventListener('mouseleave', () => {
      if (linkAtivo) {
        atualizarBarra(linkAtivo);
      }
    });
  }
}

// ====================================================================
// 9. INICIALIZAÇÃO GERAL (DOMContentLoaded)
// ====================================================================

// Aplica o tema salvo imediatamente
carregarTemaSalvo();

document.addEventListener('DOMContentLoaded', () => {
  carregarTemaSalvo();
  configurarNavbar();
  atualizarNavbarAutenticacao();
  
  // Execução de controladores por página
  renderizarTrabalhos();
  configurarBuscaIndex();
  configurarFormularioPostagem();
  carregarDetalhesProjeto();
  configurarLogin();
  configurarRegistro();
  configurarTelaConfiguracoes();
});
