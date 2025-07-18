$(function () {

  $('#my-list, #continue-reading, #read-again').hide();

  const CACHE_KEY = 'livrosCache';
  const CACHE_EXPIRACAO = 24 * 60 * 60 * 1000;

  // ⚙️ Limita texto com "..."
  function limitarTexto(selector, limite = 40) {
    $(selector).each(function () {
      const textoOriginal = $(this).text();
      if (textoOriginal.length > limite) {
        $(this).text(textoOriginal.substring(0, limite).trim() + '...');
      }
    });
  }

  // 🎨 Renderiza livros em uma seção
  function renderLivros(livros, sectionId) {
    const container = $(`#${sectionId} .book-carousel`);
    container.empty();

    livros.forEach(item => {
      const volume = item.volumeInfo;
      const img = volume.imageLinks?.thumbnail ||  'https://i.ibb.co/1YPzMMTN/placeholder.jpg';
      const titulo = volume.title || 'Sem título';
      const autor = volume.authors?.join(', ') || 'Autor desconhecido';

      const card = `
        <div class="book-card">
          <img src="${img}" alt="${titulo}">
          <h4>${titulo}</h4>
          <p>${autor}</p>
        </div>
      `;

      container.append(card);
    });

    limitarTexto(`#${sectionId} .book-card h4`, 40);
    limitarTexto(`#${sectionId} .book-card p`, 30);

    if (livros.length === 0) {
      container.html('<p class="sem-resultados">Nenhum livro encontrado.</p>');
      return;
    }
  }

  // 🔍 Faz a busca de livros pela API
  function buscarLivros(query) {
    if (!query) return Promise.resolve([]);

    // Normaliza a query
    query = query.trim().toLowerCase();

    // Monta uma busca combinada por título e autor
    const formattedQuery = `intitle:${query} OR inauthor:${query}`;

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(formattedQuery)}&maxResults=18`;
 
    return $.get(url)
    .then(res => {
      const livros = res.items || [];
      if (livros.length === 0) {
        // Se não encontrar nada, busca sem filtro (plano B)
        const fallbackUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=18`;
        return $.get(fallbackUrl).then(res => res.items || []);
      }
      return livros;
    })
    .catch(() => []); // Qualquer erro = lista vazia, não crasha a página
}

  // 📚 Seções com categorias mapeadas
  const categorias = {
    suggested: 'livros recomendados',
    featured: 'action',
    recent: 'novidades',
    'top-10-world': 'top books',
    bestsellers: 'bestsellers',
    'brazilian-books': 'brasil literatura',
    sagas: 'sagas'
  };

  function temCacheValido() {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
    return cache && (Date.now() - cache.timestamp) < CACHE_EXPIRACAO;
  }

  function carregarDoCache() {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cache) {
      Object.entries(cache.data).forEach(([secao, livros]) => renderLivros(livros, secao));
    }
  }

  async function carregarAtualizado() {
    const dados = {};
    await Promise.all(
      Object.entries(categorias).map(async ([secao, query]) => {
        const livros = await buscarLivros(query);
        renderLivros(livros, secao);
        dados[secao] = livros;
      })
    );
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: dados }));
  }

  if (temCacheValido()) {
    carregarDoCache();
    carregarAtualizado();
  } else {
    carregarAtualizado();
  }

  // 🔗 Elementos de UI
  const $searchWrapper = $('.search-wrapper');
  const $searchInput = $('.search-input');
  const $searchButton = $('.search-button');

// 🔍 Busca ao clicar na lupa
$searchButton.on('click', function (e) {
  e.preventDefault();
  $('.dropdown-menu').hide();
  $('.arrow-icone').removeClass('arrow-rotated');

  $searchWrapper.addClass('active');
  $searchInput.focus();

  const query = $searchInput.val().trim();
  if (query) {
    buscarLivros(query).then(livros => {
      renderLivros(livros, 'featured');
      $('#featured').show();
    });
  }
});

// 🔍 Busca ao apertar ENTER
$searchInput.on('keypress', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const query = $(this).val().trim();
    if (query) {
      buscarLivros(query).then(livros => {
        renderLivros(livros, 'featured');
        $('#featured').show();
      });
    }
  }
});

 // ⬇️ Dropdowns com rotação da setinha
  $('.dropdown-toggle').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $menu = $(this).next('.dropdown-menu');
    const $arrow = $(this).find('.arrow-icone');

    $('.dropdown-menu').not($menu).hide();
    $('.arrow-icone').not($arrow).removeClass('arrow-rotated');

    $menu.toggle();
    $arrow.toggleClass('arrow-rotated');
  });

  // ❌ Fecha busca e dropdown ao clicar fora
  $(document).on('click', function (e) {
    const $target = $(e.target);

    if (!$target.closest('.search-wrapper, .search-button').length) {
      $searchWrapper.removeClass('active');
      $searchInput.blur();
    }

    if (!$target.closest('.dropdown').length) {
      $('.dropdown-menu').hide();
      $('.arrow-icone').removeClass('arrow-rotated');
    }
  });

  // ⏩ Scroll com setas
  $('.arrow').on('click', function () {
    const carousel = $(this).closest('.carousel-wrapper').find('.book-carousel');
    const scrollAmount = carousel.width() * 0.8;

    if ($(this).hasClass('left')) {
      carousel.animate({ scrollLeft: '-=' + scrollAmount }, 300);
    } else {
      carousel.animate({ scrollLeft: '+=' + scrollAmount }, 300);
    }
  });

});
