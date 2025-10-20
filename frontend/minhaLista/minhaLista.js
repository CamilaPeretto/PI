document.addEventListener('DOMContentLoaded', () => {
  const favoritosContainer = document.getElementById('favoritosContainer');
  const avaliacoesContainer = document.getElementById('avaliacoesContainer');
  const downloadsContainer = document.getElementById('downloadsContainer'); // nome padronizado
  const breadcrumb = document.getElementById('breadcrumb');

  // ---------- Breadcrumb ----------
  function atualizarBreadcrumb() {
    if (!breadcrumb) return;
    breadcrumb.innerHTML = `
      <a href="../home/home.html" class="hover:underline">Home</a>
      <span>/</span>
      <span>Minha Lista</span>
    `;
  }
  atualizarBreadcrumb();

  // ---------- Limitar texto ----------
  function limitarTexto(nodeList, limite = 40) {
    if (!nodeList) return;
    nodeList.forEach(el => {
      const txt = (el.textContent || '').trim();
      if (txt.length > limite) el.textContent = txt.substring(0, limite).trim() + '...';
    });
  }

  // ---------- Mock API - pegar 10 livros ----------
  async function pegarLivrosMock(query = 'livros', maxResults = 10) {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}`);
      const data = await res.json();
      return (data.items || []).map(item => ({
        titulo: item.volumeInfo.title || 'Sem título',
        capa: item.volumeInfo.imageLinks?.thumbnail || '../img/placeholder.png',
        avaliacao: Math.floor(Math.random() * 5) + 1,
        formato: ['PDF', 'EPUB', 'MOBI'][Math.floor(Math.random() * 3)]
      }));
    } catch (err) {
      console.error('Erro ao puxar livros da API', err);
      return [];
    }
  }

  // ---------- Render cards ----------
  function renderCards(container, livros, tipo) {
    container.innerHTML = '';
    livros.forEach(livro => {
      const card = document.createElement('div');
      card.className = "book-card w-44 md:w-48 h-92 bg-white rounded-lg p-3 shadow hover:scale-[1.03] transition-transform flex-shrink-0 cursor-pointer";
      card.innerHTML = `
        <img src="${livro.capa}" alt="${livro.titulo}" class="w-full h-56 object-cover rounded-md mb-2">
        <h3 class="text-sm font-semibold truncate">${livro.titulo}</h3>
        ${tipo === 'avaliacoes' ? `<p class="text-xs text-gray-500 truncate">Avaliação: ${'★'.repeat(livro.avaliacao)}</p>` : ''}
        ${tipo === 'downloads' ? `<p class="text-xs text-gray-500 truncate">Formato: ${livro.formato}</p>` : ''}
      `;
      card.addEventListener('click', () => abrirModal(livro));
      container.appendChild(card);
    });
  }

  // ---------- Modal ----------
  function abrirModal(livro) {
    let modal = document.getElementById('modal-livro');
    
    // cria modal se não existir
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-livro';
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-80 md:w-96 relative">
          <button id="fecharModal" class="absolute top-2 right-2 text-gray-700 hover:text-gray-900 font-bold">&times;</button>
          <img class="modal-capa w-full h-60 object-cover rounded-md mb-4" src="" alt="">
          <h2 class="modal-titulo text-lg font-bold text-[#1B4965] mb-2"></h2>
          <p class="modal-descricao text-gray-600 text-sm">Descrição não disponível.</p>
        </div>
      `;
      document.body.appendChild(modal);

      // fechar modal
      modal.querySelector('#fecharModal').addEventListener('click', () => modal.classList.remove('show'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
      });
    }

    modal.querySelector('.modal-titulo').textContent = livro.titulo;
    modal.querySelector('.modal-capa').src = livro.capa;
    modal.classList.add('show');
    modal.classList.remove('hidden');
  }

  // ---------- Inicializar carrossel ----------
  function initCarousel() {
    document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
      const left = wrapper.querySelector('.arrow.left');
      const right = wrapper.querySelector('.arrow.right');
      const container = wrapper.querySelector('.book-carousel');

      if (left) left.addEventListener('click', () => container.scrollBy({ left: -300, behavior: 'smooth' }));
      if (right) right.addEventListener('click', () => container.scrollBy({ left: 300, behavior: 'smooth' }));
    });
  }

  // ---------- Main ----------
  (async function init() {
    const livrosFavoritos = await pegarLivrosMock('romance');
    const livrosAvaliacoes = await pegarLivrosMock('fantasia');
    const livrosDownloads = await pegarLivrosMock('autoajuda');

    renderCards(favoritosContainer, livrosFavoritos, 'favoritos');
    renderCards(avaliacoesContainer, livrosAvaliacoes, 'avaliacoes');
    renderCards(downloadsContainer, livrosDownloads, 'downloads');

    initCarousel();
  })();
});

