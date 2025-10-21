document.addEventListener('DOMContentLoaded', async () => {
  const favoritosContainer = document.getElementById('favoritosContainer');
  const avaliacoesContainer = document.getElementById('avaliacoesContainer');
  const downloadsContainer = document.getElementById('downloadsContainer');
  const breadcrumb = document.getElementById('breadcrumb');

  // ---------- Breadcrumb ----------
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="../home/home.html" class="hover:underline">Home</a>
      <span>/</span>
      <span>Minha Lista</span>
    `;
  }

  // ---------- Carregar modal ----------
  await fetch("../modalAbrirModal/modalLivro.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("modal-container").innerHTML = html;
      const script = document.createElement("script");
      script.src = "../modalAbrirModal/modalLivro.js";
      document.body.appendChild(script);
    });

  // ---------- Mock API ----------
  async function pegarLivrosMock(query = 'livros', maxResults = 10) {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}`);
      const data = await res.json();
      return (data.items || []).map(volume => ({
        capa: volume.volumeInfo.imageLinks?.thumbnail || 'https://i.ibb.co/1YPzMMTN/placeholder.jpg',
        titulo: volume.volumeInfo.title || 'Sem título',
        autor: volume.volumeInfo.authors?.join(", ") || 'Autor desconhecido',
        genero: volume.volumeInfo.categories?.[0] || 'Sem gênero',
        data: volume.volumeInfo.publishedDate || 'Data não informada',
        nota: Math.floor(Math.random() * 5) + 1, // mock das estrelinhas
        formato: ['PDF', 'EPUB', 'MOBI'][Math.floor(Math.random() * 3)],
        sinopse: volume.volumeInfo.description || 'Sem descrição disponível.'
      }));
    } catch (err) {
      console.error('Erro ao puxar livros da API', err);
      return [];
    }
  }

  // ---------- Função para limitar texto ----------
  function limitarTexto(texto, limite = 40) {
    if (!texto) return '';
    return texto.length > limite ? texto.substring(0, limite).trim() + '...' : texto;
  }

  // ---------- Render cards ----------
  function renderCards(container, livros, tipo) {
    if (!container) return;
    container.innerHTML = '';

    livros.forEach(livro => {
      const card = document.createElement('div');
      card.className = "book-card w-44 md:w-48 h-92 bg-white rounded-lg p-3 shadow hover:scale-[1.03] transition-transform flex-shrink-0 cursor-pointer";

      // conteúdo do card
      let extraInfo = '';
      if (tipo === 'avaliacoes') {
        extraInfo = `<p class="text-xs text-gray-500 truncate">Avaliação: ${'★'.repeat(livro.nota)}</p>`;
      } else if (tipo === 'downloads') {
        extraInfo = `<p class="text-xs text-gray-500 truncate">Formato: ${livro.formato}</p>`;
      }

      card.innerHTML = `
        <img src="${livro.capa}" alt="${livro.titulo}" class="w-full h-56 object-cover rounded-md mb-2">
        <h3 class="text-sm font-semibold">${limitarTexto(livro.titulo, 40)}</h3>
        ${extraInfo}
      `;

      // evento de abrir modal
      card.addEventListener('click', () => {
        if (typeof abrirModalLivro === "function") {
          abrirModalLivro(livro);
        } else {
          console.warn("Modal ainda não carregado!");
        }
      });

      container.appendChild(card);
    });
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
  const livrosFavoritos = await pegarLivrosMock('romance');
  const livrosAvaliacoes = await pegarLivrosMock('fantasia');
  const livrosDownloads = await pegarLivrosMock('autoajuda');

  renderCards(favoritosContainer, livrosFavoritos, 'favoritos');
  renderCards(avaliacoesContainer, livrosAvaliacoes, 'avaliacoes');
  renderCards(downloadsContainer, livrosDownloads, 'downloads');

  initCarousel();
});
