document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Configs ---------- */
  const CACHE_KEY = 'livrosCache';
  const CACHE_EXPIRACAO = 24 * 60 * 60 * 1000;
  const categorias = {
    suggested: 'popular fiction OR young adult OR romance bestsellers',
    featured: 'fantasy OR sci-fi OR adventure',
    recent: 'new releases OR 2024 OR 2025',
    bestsellers: 'bestsellers OR action',
    'brazilian-books': 'literatura brasileira OR autores brasileiros OR romance brasileiro',
  };
  const userSections = [];

  /* ---------- Helpers ---------- */
  function safeJsonParse(str) {
    try { return JSON.parse(str); } catch(e) { return null; }
  }

  function limitarTexto(nodeList, limite = 40) {
    if (!nodeList) return;
    nodeList.forEach(el => {
      const txt = (el.textContent || '').trim();
      if (txt.length > limite) el.textContent = txt.substring(0, limite).trim() + '...';
    });
  }

  function filtrarAdultos(livros) {
    return livros.filter(item => {
      const rating = item.volumeInfo?.maturityRating || 'NOT_MATURE';
      const isMature = rating === 'MATURE';
      if (isMature) {
        console.log(`🔞 Livro adulto filtrado:`, item.volumeInfo?.title || item.titulo);
      }
      return !isMature;
    });
  }

  /* ---------- Render livros ---------- */
  function renderLivros(livros, sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const container = section.querySelector('.book-carousel');
    if (!container) return;
    container.innerHTML = '';

    console.log(`🔍 [${sectionId}] Recebeu ${livros.length} livros antes do filtro`);
    
    const livrosFiltrados = filtrarAdultos(livros);
    
    console.log(`🔍 [${sectionId}] ${livrosFiltrados.length} livros após filtro de adultos`);

    if (!Array.isArray(livrosFiltrados) || livrosFiltrados.length === 0) {
      container.innerHTML = '<p class="sem-resultados text-[#1B4965]">Nenhum livro encontrado.</p>';
      return;
    }

    const vistos = new Set();
    const titulosVistos = new Set(); // 🔹 Controle de duplicatas por título

    livrosFiltrados.forEach(item => {
      const volume = item.volumeInfo || item;
      
      // 🔹 Normaliza o título para comparação (remove espaços extras, lowercase)
      const tituloNormalizado = (volume.title || item.titulo || '').trim().toLowerCase();
      
      if (titulosVistos.has(tituloNormalizado)) {
        console.log(`⚠️ [${sectionId}] Livro duplicado ignorado (mesmo título): ${volume.title || item.titulo}`);
        return;
      }
      titulosVistos.add(tituloNormalizado);
      
      // 🔹 Cria um ID único que diferencia livros do banco vs API
      const isBanco = !!item._id;
      const baseId = isBanco 
        ? `banco_${item._id}` 
        : `api_${item.id || volume.id || tituloNormalizado}`;
      
      if (vistos.has(baseId)) {
        console.log(`⚠️ [${sectionId}] Livro duplicado ignorado (mesmo ID): ${volume.title || item.titulo}`);
        return;
      }
      vistos.add(baseId);

      const img = volume.imageLinks?.thumbnail || volume.image || item.capa?.url || 'https://i.ibb.co/1YPzMMTN/placeholder.jpg';
      const titulo = volume.title || item.titulo || 'Sem título';
      const autor = (volume.authors && volume.authors.join)
        ? volume.authors.join(', ')
        : (volume.autor || 'Autor desconhecido');

      const card = document.createElement('div');
      card.className = 'book-card w-44 md:w-48 h-72 bg-white rounded-lg p-3 shadow hover:scale-[1.03] transition-transform flex-shrink-0';
      card.innerHTML = `
        <img src="${img}" alt="${titulo}" class="w-full h-56 object-cover rounded-md mb-2">
        <h4 class="text-sm font-semibold truncate">${titulo}</h4>
        <p class="text-xs text-gray-500 truncate">${autor}</p>
      `;

      card.addEventListener('click', () => {
        abrirModalLivro({
          capa: volume.imageLinks?.thumbnail || item.capa?.url,
          titulo: volume.title || item.titulo,
          autor: (volume.authors||[]).join(', ') || item.autor,
          genero: volume.categories?.[0] || item.genero,
          data: volume.publishedDate || item.dataPublicacao,
          nota: volume.averageRating,
          totalAvaliacoes: volume.ratingsCount,
          sinopse: volume.description || item.sinopse
        });
      });

      container.appendChild(card);
    });

    console.log(`✅ [${sectionId}] Renderizou ${vistos.size} livros únicos`);
    
    limitarTexto(container.querySelectorAll('h4'), 40);
    limitarTexto(container.querySelectorAll('p'), 30);
    section.classList.remove('hidden');
  }


  /* ---------- Buscar na API ---------- */
  async function buscarLivros(query) {
    if (!query) return [];
    query = query.trim();
    const formattedQuery = `intitle:${query} OR inauthor:${query}`;
    try {
      let res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(formattedQuery)}&maxResults=18`);
      let json = await res.json();
      let livros = json.items || [];
      if (!livros.length) {
        res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=18`);
        json = await res.json();
        livros = json.items || [];
      }
      return livros;
    } catch (err) {
      console.warn('Erro ao buscar livros:', err);
      return [];
    }
  }

 /* ---------- Buscar no Banco ---------- */
async function buscarLivrosBanco() {
  try {
    const res = await fetch("http://localhost:5000/api/livros");
    if (!res.ok) throw new Error("Erro ao buscar livros do banco");
    const data = await res.json();
    console.log(`🗄️ Banco retornou ${Array.isArray(data) ? data.length : 0} livros`, data);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Erro ao carregar livros do banco:", e);
    return [];
  }
}

  /* ---------- Cache ---------- */
  function temCacheValido() {
    const cache = safeJsonParse(localStorage.getItem(CACHE_KEY));
    return cache && (Date.now() - (cache.timestamp || 0)) < CACHE_EXPIRACAO;
  }

  function carregarDoCache() {
    const cache = safeJsonParse(localStorage.getItem(CACHE_KEY));
    if (!cache || !cache.data) return;
    Object.entries(cache.data).forEach(([secao, livros]) => {
      if (document.getElementById(secao)) renderLivros(livros, secao);
    });
  }

  /* ---------- Atualizado: carregarAtualizado() ---------- */
  async function carregarAtualizado() {
    const dados = {};
    
    for (const [secao, query] of Object.entries(categorias)) {
      if (!document.getElementById(secao)) continue;

      let livros = [];
      
      // 🔹 Apenas na primeira seção (suggested): mistura livros do banco + API
      if (secao === 'suggested') {
        const [livrosBanco, livrosGoogle] = await Promise.all([
          buscarLivrosBanco(),
          buscarLivros(query)
        ]);
        
        // Pega TODOS os livros do banco + até 15 da API
        livros = [...livrosBanco, ...livrosGoogle.slice(0, 15)];
        
        console.log(`📚 Seção ${secao}: ${livrosBanco.length} do banco + ${livrosGoogle.slice(0, 15).length} da API`);
      } else {
        // Outras seções: apenas API
        livros = await buscarLivros(query);
      }

      renderLivros(livros, secao);
      dados[secao] = livros;
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: dados }));
    } catch (e) {
      console.warn('Cache write failed', e);
    }
  }

  /* ---------- Seções do usuário ---------- */
  function exibirSecoesDoUsuario() {
    userSections.forEach(id => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const livros = safeJsonParse(localStorage.getItem(id)) || [];
      if (Array.isArray(livros) && livros.length > 0) {
        renderLivros(livros, id);
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });
  }

  /* ---------- Setas (delegação) ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.arrow');
    if (!btn) return;
    const wrapper = btn.closest('.carousel-wrapper');
    if (!wrapper) return;
    const carousel = wrapper.querySelector('.book-carousel');
    if (!carousel) return;
    const scrollAmount = Math.floor(carousel.offsetWidth * 0.8);
    if (btn.classList.contains('left')) carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    else carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  /* ---------- Dropdown ---------- */
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const menu = toggle.nextElementSibling;
      const arrow = toggle.querySelector('.arrow-icone');
      document.querySelectorAll('.dropdown-menu').forEach(m => { if (m !== menu) m.classList.add('hidden'); });
      document.querySelectorAll('.arrow-icone').forEach(a => { if (a !== arrow) a.classList.remove('arrow-rotated'); });
      menu?.classList.toggle('hidden');
      arrow?.classList.toggle('arrow-rotated');
    });
  });

  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
      document.querySelectorAll('.arrow-icone').forEach(a => a.classList.remove('arrow-rotated'));
    }
  });

  /* ---------- SEARCH REDIRECT ---------- */
  const searchInput = document.getElementById('searchInput');
  const searchBtnDesktop = document.getElementById('searchBtnDesktop');
  const searchToggleMobile = document.getElementById('searchToggleMobile');
  const mobileSearchBox = document.getElementById('mobileSearchBox');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const mobileSearchSubmit = document.getElementById('mobileSearchSubmit');

  if (searchBtnDesktop && searchInput) {
    searchBtnDesktop.addEventListener('click', () => {
      const termo = searchInput.value.trim();
      if (!termo) return;
      window.location.href = `../pesquisa/pesquisa.html?q=${encodeURIComponent(termo)}`;
    });
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); searchBtnDesktop.click(); }
    });
  }

  if (searchToggleMobile && mobileSearchBox && mobileSearchInput && mobileSearchSubmit) {
    searchToggleMobile.addEventListener('click', () => {
      mobileSearchBox.classList.toggle('hidden');
      if (!mobileSearchBox.classList.contains('hidden')) mobileSearchInput.focus();
    });
    mobileSearchSubmit.addEventListener('click', () => {
      const termo = mobileSearchInput.value.trim();
      if (!termo) return;
      window.location.href = `../pesquisa/pesquisa.html?q=${encodeURIComponent(termo)}`;
    });
    mobileSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); mobileSearchSubmit.click(); }
    });
    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('#mobileSearchBox') && !ev.target.closest('#searchToggleMobile')) {
        mobileSearchBox.classList.add('hidden');
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      alert("Logout realizado com sucesso!");
      window.location.href = "../login/login.html";
    });
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você precisa estar logado para acessar esta página!");
    window.location.href = "../login/login.html";
    return;
  }

  fetch("http://localhost:5000/api/auth/perfil", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "../login/login.html";
      } else {
        console.log("Usuário autenticado:", data.user.nome);
      }
    })
    .catch(() => {
      alert("Erro ao validar login. Tente novamente.");
      localStorage.removeItem("token");
      window.location.href = "../login/login.html";
    });

  /* ---------- Inicialização ---------- */
  exibirSecoesDoUsuario();

  if (temCacheValido()) {
    carregarDoCache();
    carregarAtualizado();
  } else {
    carregarAtualizado();
  }

  window.__inbookDebug = { renderLivros, buscarLivros, carregarAtualizado, carregarDoCache, exibirSecoesDoUsuario };

}); // DOMContentLoaded
