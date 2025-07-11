$(function () {

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
      const img = volume.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=Sem+Capa';
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
  }

  // 🔍 Faz a busca de livros pela API
  function buscarLivros(query, sectionId) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40`;

    return $.get(url)
      .done(response => {
        if (response.items && response.items.length > 0) {
          renderLivros(response.items, sectionId);
        } else {
          console.warn(`Nenhum livro encontrado para: ${query}`);
        }
      })
      .fail(err => {
        console.error('Erro ao buscar livros:', err);
      });
  }

  // 📚 Seções com categorias mapeadas
  const categorias = {
    featured: 'bestsellers',
    recent: 'novidades',
    suggested: 'romance',
    sagas: 'sagas',
    'brazilian-books': 'brasil literatura',
    'top-10-world': 'top books',
    bestsellers: 'livros recomendados'
  };

  // 🚀 Busca inicial para todas as seções
  const promessasBusca = Object.entries(categorias).map(([secao, query]) => buscarLivros(query, secao));

  // 👻 Verifica seções vazias (esconde)
  $.when(...promessasBusca).always(() => {
    ['my-list', 'continue-reading', 'read-again'].forEach(id => {
      const secao = $(`#${id}`);
      const livros = secao.find('.book-card');
      livros.length === 0 ? secao.hide() : secao.show();
    });
  });

  // 🔗 Elementos de UI
  const $searchWrapper = $('.search-wrapper');
  const $searchInput = $('.search-input');
  const $searchButton = $('.search-button');

  // 🔍 Busca ao clicar na lupa
  $searchButton.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    $('.dropdown-menu').hide();
    $('.arrow-icone').removeClass('arrow-rotated');

    $searchWrapper.toggleClass('active');
    if ($searchWrapper.hasClass('active')) {
      $searchInput.focus();
      const query = $searchInput.val().trim();
      if (query) buscarLivros(query, 'featured');
    }
  });

  // Busca ao pressionar Enter
  $searchInput.on('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = $searchInput.val().trim();
      if (query) buscarLivros(query, 'featured');
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
