$(document).ready(function () {
  function limitarTexto(selector, limite = 40) {
    $(selector).each(function () {
      const textoOriginal = $(this).text();
      if (textoOriginal.length > limite) {
        $(this).text(textoOriginal.substring(0, limite).trim() + '...');
      }
    });
  }

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

    // Aplica limite de texto depois que os livros forem adicionados
    limitarTexto(`#${sectionId} .book-card h4`, 40); // Título
    limitarTexto(`#${sectionId} .book-card p`, 30);  // Autor
  }

  function buscarLivros(query, sectionId) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40`;

    $.get(url)
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

  // Categorias mapeadas
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

  // Chamada para todas as seções
  for (const secao in categorias) {
    buscarLivros(categorias[secao], secao);
  }

  // Evento de busca
  $('.search-button').click(function () {
    const query = $('.search-input').val().trim();
    if (query) buscarLivros(query, 'featured');
  });

  // Scroll das setinhas
  $('.arrow').on('click', function () {
    const carousel = $(this).closest('.carousel-wrapper').find('.book-carousel');
    const scrollAmount = carousel.width() * 0.8;

    if ($(this).hasClass('left')) {
      carousel.animate({ scrollLeft: '-=' + scrollAmount }, 300);
    } else {
      carousel.animate({ scrollLeft: '+=' + scrollAmount }, 300);
    }
  });

  function verificarSeçõesVazias() {
    const secoesEscondiveis = ['my-list', 'continue-reading', 'read-again'];
  
    secoesEscondiveis.forEach(id => {
      const secao = $(`#${id}`);
      const livros = secao.find('.book-card');
  
      if (livros.length === 0) {
        secao.hide();
      } else {
        secao.show();
      }
    });
  }
  
  // Chamar essa função depois de tentar carregar os livros
  setTimeout(() => {
    verificarSeçõesVazias();
  }, 600); // Ajuste o tempo se necessário pra garantir que deu tempo de renderizar os livros
  
});

  