$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const tipoOriginal = params.get('tipo') || 'romance';
  let pagina = parseInt(params.get('pagina')) || 1;

  const generoMapeado = normalizarGenero(tipoOriginal);
  const livrosPorPagina = 40;
  const startIndex = (pagina - 1) * livrosPorPagina;

  // Mapa dos limites fixos de página por gênero
  const limitesGenero = {
    'action': 5,
    'self-help': 5,
    'adventure': 5,
    'biography': 5,
    'classics': 5,
    'short stories': 1,
    'drama': 5,
    'fantasy': 4,
    'science fiction': 8,
    'history': 5,
    'children': 1,
    'mystery': 5,
    'poetry': 5,
    'crime': 5,
    'psychology': 5,
    'religion': 5,
    'romance': 5,
    'suspense': 5,
    'horror': 5,
    'thriller': 5
  };

  function corrigirTituloGenero(genero) {
    const mapa = {
      'acao': 'Ação',
      'misterio': 'Mistério',
      'ficcao cientifica': 'Ficção Científica',
      'classicos': 'Clássicos',
      'contos': 'Contos',
      'religiao': 'Religião',
      'trhilher': 'Thriller'
      // adicione mais conforme precisar
    };
    const generoMinusculo = genero.toLowerCase();
    return mapa[generoMinusculo] || capitalizar(genero);
  }

  $('#titulo-genero').text(`Gênero: ${corrigirTituloGenero(tipoOriginal)}`);

  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(generoMapeado)}&maxResults=${livrosPorPagina}&startIndex=${startIndex}`;

  $.get(url)
    .done(res => {
      $('#livros-grade').empty();

      if (res.items && res.items.length > 0) {
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

        // Limite fixo para esse gênero
        const limitePagina = limitesGenero[generoMapeado] || 5;

        // Atualiza texto da página
        $('#pagina-atual').text(`Página ${pagina} de ${limitePagina}`);

        // Controla desabilitação dos botões
        $('#prev').prop('disabled', pagina <= 1);
        $('#next').prop('disabled', pagina >= limitePagina);
      } else {
        $('#livros-grade').html('<p>Nenhum livro encontrado.</p>');
        $('#pagina-atual').text('');
        $('#prev').prop('disabled', true);
        $('#next').prop('disabled', true);
      }
    })
    .fail(err => {
      console.error('Erro ao carregar livros da API:', err);
      $('#livros-grade').html('<p>Erro ao carregar livros. Recarregue a página.</p>');
      $('#pagina-atual').text('');
      $('#prev').prop('disabled', true);
      $('#next').prop('disabled', true);
    });

  // Eventos de clique dos botões de paginação
  $('#prev').click(function () {
    if (pagina > 1) {
      alterarPagina(pagina - 1);
    }
  });

  $('#next').click(function () {
    alterarPagina(pagina + 1);
  });

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
      'biografia': 'biography',
      'classicos': 'classics',
      'contos': 'short stories',
      'policial': 'crime',
      'poesia': 'poetry',
      'religiao': 'religion',
      'religião': 'religion',
      'drama': 'drama',
      'historia': 'history',
      'infantil': 'children',
      'psicologia': 'psychology',
      'suspense': 'suspense',
      'trhilher': 'thriller'  // corrigir o typo no mapa tbm
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

