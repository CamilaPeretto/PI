$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const tipoOriginal = params.get('tipo') || 'romance';
  const pagina = parseInt(params.get('pagina')) || 1;

  const generoMapeado = normalizarGenero(tipoOriginal);
  const livrosPorPagina = 40; // Limite da API do Google Books
  const startIndex = (pagina - 1) * livrosPorPagina;

  $('#titulo-genero').text(`Gênero: ${capitalizar(tipoOriginal)}`);

  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(generoMapeado)}&maxResults=${livrosPorPagina}&startIndex=${startIndex}`;

  $.get(url)
    .done(res => {
      if (res.items && res.items.length > 0) {
        $('#livros-grade').empty();
        res.items.forEach(livro => {
          const info = livro.volumeInfo;
          const img = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=Sem+Capa';
          const titulo = info.title || 'Sem título';
          const autor = info.authors?.join(', ') || 'Autor desconhecido';

          const card = `
            <div class="book-card">
              <img src="${img}" alt="${titulo}">
              <h4>${titulo}</h4>
              <p>${autor}</p>
            </div>
          `;
          $('#livros-grade').append(card);
        });
      } else {
        $('#livros-grade').html('<p>Nenhum livro encontrado.</p>');
      }
    })
    .fail(err => {
      console.error('Erro ao carregar livros da API:', err);
      $('#livros-grade').html('<p>Erro ao carregar livros.</p>');
    });

  // Paginação
  $('#prev').click(function () {
    if (pagina > 1) {
      alterarPagina(pagina - 1);
    }
  });

  $('#next').click(function () {
    alterarPagina(pagina + 1);
  });

  $('#pagina-atual').text(`Página ${pagina}`);

  function alterarPagina(novaPagina) {
    const urlAtualizada = new URL(window.location.href);
    urlAtualizada.searchParams.set('pagina', novaPagina);
    history.pushState({}, '', urlAtualizada.toString());
    location.reload();
  }

  function normalizarGenero(genero) {
    const mapa = {
      'acao': 'action',
      'ação': 'action',
      'romance': 'romance',
      'fantasia': 'fantasy',
      'misterio': 'mystery',
      'mistério': 'mystery',
      'terror': 'horror',
      'autoajuda': 'self-help',
      'ficcao cientifica': 'science fiction',
      'ficção científica': 'science fiction',
      'aventura': 'adventure',
      'biografia': 'biography'
    };
    const generoSemAcento = removerAcentos(genero.toLowerCase());
    return mapa[generoSemAcento] || generoSemAcento;
  }  

  function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function capitalizar(txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }
});
