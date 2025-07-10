$(function () {
  // Função para buscar livros pela API do Google Books e popular a seção correspondente
  function buscarLivros(query, secaoId) {
    return $.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`)
      .done(data => {
        const livros = data.items || [];
        const container = $(`#${secaoId} .book-carousel`);
        container.empty();

        livros.forEach(item => {
          const titulo = item.volumeInfo.title || 'Título indisponível';
          const capa = item.volumeInfo.imageLinks?.thumbnail || '../img/placeholder.png';

          const card = $(`
            <div class="book-card">
              <img src="${capa}" alt="${titulo}">
              <p>${titulo}</p>
            </div>
          `);

          container.append(card);
        });
      })
      .fail(err => console.error('Erro ao buscar livros:', err));
  }

  // Mapeamento de categorias para cada seção do site
  const categorias = {
    featured: 'bestsellers',
    recent: 'novidades',
    suggested: 'romance',
    sagas: 'sagas',
    'brazilian-books': 'brasil literatura',
    'top-10-world': 'top books',
    'read-again': 'autoajuda',
    'continue-reading': 'mistério',
    bestsellers: 'livros recomendados',
    'my-list': 'fantasia'
  };

  // Busca livros para todas as seções em paralelo e aguarda para depois verificar seções vazias
  const promessasBusca = Object.entries(categorias).map(([secao, query]) => buscarLivros(query, secao));

  $.when(...promessasBusca).always(() => {
    // Seções que podem estar vazias e precisam ser escondidas
    ['my-list', 'continue-reading', 'read-again'].forEach(id => {
      const secao = $(`#${id}`);
      const livros = secao.find('.book-card');
      livros.length === 0 ? secao.hide() : secao.show();
    });
  });

  // Variáveis para controle dos elementos de UI
  const $menuToggle = $('.menu-toggle');
  const $sidebarMenu = $('.sidebar-menu');
  const $searchWrapper = $('.search-wrapper');
  const $searchInput = $('.search-input');
  const $searchButton = $('.search-button');

  // Abrir e fechar menu hamburguer
  $menuToggle.on('click', e => {
    e.preventDefault();
    e.stopPropagation();

    // Fecha barra de busca antes para não ter sobreposição
    $searchWrapper.removeClass('active');
    $searchInput.blur();

    $sidebarMenu.toggleClass('open');
  });

  // Abrir e fechar barra de pesquisa ao clicar na lupa
  $searchButton.on('click', e => {
    e.preventDefault();
    e.stopPropagation();

    // Fecha menu hamburguer para UX limpa
    $sidebarMenu.removeClass('open');

    $searchWrapper.toggleClass('active');

    if ($searchWrapper.hasClass('active')) {
      $searchInput.focus();

      // Se tiver texto, faz a busca
      const query = $searchInput.val().trim();
      if (query) buscarLivros(query, 'featured');
    }
  });

  // Buscar também ao apertar Enter no input da pesquisa
  $searchInput.on('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = $searchInput.val().trim();
      if (query) buscarLivros(query, 'featured');
    }
  });

  // Fecha menu e barra de busca ao clicar fora deles
  $(document).on('click', e => {
    const $target = $(e.target);

    if (!$target.closest('.sidebar-menu, .menu-toggle').length) {
      $sidebarMenu.removeClass('open');
    }
    if (!$target.closest('.search-wrapper, .search-button').length) {
      $searchWrapper.removeClass('active');
      $searchInput.blur();
    }
  });

  // Controle de scroll horizontal das carousels pelas setas
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
