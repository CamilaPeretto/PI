document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Configs ---------- */
  const PAGE_SIZE = 40; // máximo de livros exibidos

  /* ---------- Variáveis do HTML ---------- */
  const searchInput = document.getElementById('searchInput');
  const searchBtnDesktop = document.getElementById('searchBtnDesktop');
  const searchToggleMobile = document.getElementById('searchToggleMobile');
  const mobileSearchBox = document.getElementById('mobileSearchBox');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const mobileSearchSubmit = document.getElementById('mobileSearchSubmit');
  const searchResults = document.getElementById('searchResults');
  const searchTitle = document.getElementById('searchTitle');
  const breadcrumb = document.getElementById('breadcrumb');

  /* ---------- Helpers ---------- */
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function limitarTexto(nodeList, limite = 40) {
    if (!nodeList) return;
    nodeList.forEach(el => {
      const txt = (el.textContent || '').trim();
      if (txt.length > limite) el.textContent = txt.substring(0, limite).trim() + '...';
    });
  }

  function atualizarBreadcrumb(termo) {
    if (!breadcrumb) return;
    breadcrumb.innerHTML = `
      <a href="../home/home.html" class="hover:underline">Home</a>
      <span>/</span>
      <span>Pesquisa</span>
    `;
  }

  /* ---------- Buscar livros na API ---------- */
  async function buscarLivros(query) {
    if (!query) return [];
    if (searchResults) {
      searchResults.innerHTML = `
        <div class="col-span-full flex justify-center items-center gap-3 text-gray-500">
          <div class="w-6 h-6 border-4 border-gray-300 border-t-[#1B4965] rounded-full animate-spin"></div>
          <span>Carregando livros...</span>
        </div>
      `;
    }

    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${PAGE_SIZE}`);
      const data = await res.json();
      let livros = (data.items || []).filter(item => item.volumeInfo?.title);
      return livros;
    } catch (err) {
      console.warn('Erro ao buscar livros:', err);
      if (searchResults) searchResults.innerHTML = `<p class="text-red-500 text-center">Erro ao carregar livros.</p>`;
      return [];
    }
  }

  /* ---------- Filtrar livros relevantes ---------- */
  function filtrarLivrosRelevantes(livros, termo) {
    const t = termo.toLowerCase();
    return livros
      .map(item => {
        const info = item.volumeInfo || {};
        const titulo = (info.title || '').toLowerCase();
        const autores = (info.authors || []).join(' ').toLowerCase();
        const score = (titulo.includes(t) ? 3 : 0) + (autores.includes(t) ? 2 : 0);
        return { item, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);
  }

  /* ---------- Renderizar livros ---------- */
  function renderLivros(livros) {
    if (!searchResults) return;
    searchResults.innerHTML = '';

    if (!livros.length) {
      searchResults.innerHTML = '<p class="text-[#1B4965] text-center">Nenhum livro encontrado.</p>';
      return;
    }

    const vistos = new Set();

    livros.forEach(item => {
      const info = item.volumeInfo || {};
      const id = item.id || info.title;
      if (vistos.has(id)) return;
      vistos.add(id);

      const img = info.imageLinks?.thumbnail || 'https://i.ibb.co/1YPzMMTN/placeholder.jpg';
      const titulo = info.title || 'Sem título';
      const autor = (info.authors || []).join(', ') || 'Autor desconhecido';

      const card = document.createElement('div');
      card.className = 'book-card w-44 md:w-48 h-72 bg-white rounded-lg p-3 shadow hover:scale-[1.03] transition-transform flex-shrink-0 cursor-pointer';
      card.innerHTML = `
        <img src="${img}" alt="${titulo}" class="w-full h-56 object-cover rounded-md mb-2">
        <h4 class="text-sm font-semibold truncate">${titulo}</h4>
        <p class="text-xs text-gray-500 truncate">${autor}</p>
      `;
      card.addEventListener('click', () => {
        abrirModalLivro({
          capa: info.imageLinks?.thumbnail || 'https://i.ibb.co/1YPzMMTN/placeholder.jpg',
          titulo: info.title || 'Sem título',
          autor: info.authors?.join(", ") || 'Autor desconhecido',
          genero: info.categories?.[0] || 'Sem gênero',
          data: info.publishedDate || 'Data não informada',
          nota: info.averageRating || Math.floor(Math.random() * 5) + 1, // nota aleatória se não houver
          totalAvaliacoes: info.ratingsCount || Math.floor(Math.random() * 1000), // avaliações aleatórias
          sinopse: info.description || 'Sem descrição disponível.'
        });
      });
      searchResults.appendChild(card);
    });

    limitarTexto(searchResults.querySelectorAll('h4'), 40);
    limitarTexto(searchResults.querySelectorAll('p'), 30);
  }
  
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

  /* ---------- Inicialização ---------- */
  async function init() {
    const termo = getQueryParam('q');
    if (!termo) return;
    if (searchTitle) searchTitle.textContent = `Resultados para: "${termo}"`;
    atualizarBreadcrumb(termo);

    const livros = await buscarLivros(termo);
    const filtrados = filtrarLivrosRelevantes(livros, termo);
    renderLivros(filtrados);
  }

  /* ---------- Eventos de busca ---------- */
  function setupSearch(input, btn) {
    btn.addEventListener('click', () => {
      const termo = input.value.trim();
      if (!termo) return;
      window.location.href = `pesquisa.html?q=${encodeURIComponent(termo)}`;
    });
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') { e.preventDefault(); btn.click(); }
    });
  }

  if (searchInput && searchBtnDesktop) setupSearch(searchInput, searchBtnDesktop);
  if (mobileSearchInput && mobileSearchSubmit) setupSearch(mobileSearchInput, mobileSearchSubmit);

  // Toggle mobile search
  if (searchToggleMobile && mobileSearchBox && mobileSearchInput) {
    searchToggleMobile.addEventListener('click', () => {
      mobileSearchBox.classList.toggle('hidden');
      if (!mobileSearchBox.classList.contains('hidden')) mobileSearchInput.focus();
    });
    document.addEventListener('click', ev => {
      if (!ev.target.closest('#mobileSearchBox') && !ev.target.closest('#searchToggleMobile')) {
        mobileSearchBox.classList.add('hidden');
      }
    });
  }
const logoutBtn = document.getElementById("logoutBtn");
     logoutBtn.addEventListener("click", () => {
    if (confirm("Deseja realmente sair?")) {
      localStorage.removeItem("adminLogado");
      window.location.href = "../login/login.html";
    }
  });
  /* ---------- Rodar ---------- */
  init();

});
