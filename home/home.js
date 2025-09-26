document.addEventListener('DOMContentLoaded', () => {
  
  /* ---------- Configs ---------- */
  const CACHE_KEY = 'livrosCache';
  const CACHE_EXPIRACAO = 24 * 60 * 60 * 1000;
  const categorias = {
    suggested: 'livros recomendados',
    featured: 'action',
    recent: 'novidades',
    'top-10-world': 'top books',
    bestsellers: 'bestsellers',
    'brazilian-books': 'brasil literatura',
    sagas: 'sagas'
  };
  const userSections = ['my-list', 'continue-reading', 'read-again'];

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

  /* ---------- Render livros ---------- */
  function renderLivros(livros, sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const container = section.querySelector('.book-carousel');
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(livros) || livros.length === 0) {
      container.innerHTML = '<p class="sem-resultados text-[#1B4965]">Nenhum livro encontrado.</p>';
      return;
    }
    livros.forEach(item => {
      const volume = item.volumeInfo || item;
      const img = volume.imageLinks?.thumbnail || volume.image || 'https://i.ibb.co/1YPzMMTN/placeholder.jpg';
      const titulo = volume.title || 'Sem título';
      const autor = (volume.authors && volume.authors.join) ? volume.authors.join(', ') : (volume.author || 'Autor desconhecido');

      const card = document.createElement('div');
      card.className = 'book-card w-44 md:w-48 h-72 bg-white rounded-lg p-3 shadow hover:scale-[1.03] transition-transform flex-shrink-0';
      card.innerHTML = `
        <img src="${img}" alt="${titulo}" class="w-full h-56 object-cover rounded-md mb-2">
        <h4 class="text-sm font-semibold truncate">${titulo}</h4>
        <p class="text-xs text-gray-500 truncate">${autor}</p>
      `;
      container.appendChild(card);
    });
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
  async function carregarAtualizado() {
    const dados = {};
    for (const [secao, query] of Object.entries(categorias)) {
      if (!document.getElementById(secao)) continue;
      const livros = await buscarLivros(query);
      renderLivros(livros, secao);
      dados[secao] = livros;
    }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: dados })); } catch(e){ console.warn('Cache write failed', e); }
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
  const searchInput = document.getElementById('searchInput'); // desktop
  const searchBtnDesktop = document.getElementById('searchBtnDesktop');
  const searchToggleMobile = document.getElementById('searchToggleMobile');
  const mobileSearchBox = document.getElementById('mobileSearchBox');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const mobileSearchSubmit = document.getElementById('mobileSearchSubmit');

  // Desktop
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

  // Mobile
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

    // fecha mobile search ao clicar fora
    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('#mobileSearchBox') && !ev.target.closest('#searchToggleMobile')) {
        mobileSearchBox.classList.add('hidden');
      }
    });
  }

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
