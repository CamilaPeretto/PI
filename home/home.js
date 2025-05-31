$(document).ready(function () {
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
    }
  
    function buscarLivros(query, sectionId) {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
  
      $.get(url)
        .done(response => {
          if (response.items && response.items.length > 0) {
            renderLivros(response.items, sectionId);
          } else {
            console.warn('Nenhum livro encontrado.');
          }
        })
        .fail(err => {
          console.error('Erro ao buscar livros:', err);
        });
    }
  
    // Busca padrão ao carregar a página
    buscarLivros('bestsellers', 'featured');
    buscarLivros('novidades', 'recent');
    buscarLivros('romance', 'suggested');
    buscarLivros('sagas', 'sagas');
    buscarLivros('brasil literatura', 'brazilian-books');
    buscarLivros('top books', 'top-10-world');
    buscarLivros('autoajuda', 'read-again');
    buscarLivros('mistério', 'continue-reading');
    buscarLivros('livros recomendados', 'bestsellers');
  
    // Minha lista: simulando favoritos do usuário
    buscarLivros('fantasia', 'my-list');
  
    // Evento de busca
    $('.search-button').click(function () {
      const query = $('.search-input').val().trim();
      if (query) {
        buscarLivros(query, 'featured'); // pode alterar pra mostrar em uma seção específica
      }
    });
  });

  function buscarLivrosGoogleBooks(termo, sectionId) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termo)}&maxResults=10`;
  
    $.getJSON(url, function(data) {
      if (!data.items) {
        console.warn('Nenhum livro encontrado');
        return;
      }
  
      data.items.forEach(item => {
        const info = item.volumeInfo;
        const titulo = info.title || 'Sem título';
        const autores = info.authors ? info.authors.join(', ') : 'Autor desconhecido';
        const imagem = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x195?text=Sem+Imagem';
  
        const card = `
          <div class="book-card">
            <img src="${imagem}" alt="${titulo}">
            <h4>${titulo}</h4>
            <p>${autores}</p>
          </div>
        `;
        $(`#${sectionId} .book-carousel`).append(card);
      });
    });
  }
  
  $(document).ready(function() {
    buscarLivrosGoogleBooks('romance', 'suggested');
    buscarLivrosGoogleBooks('fantasia', 'featured');
    buscarLivrosGoogleBooks('thriller', 'recent');
    // etc... você pode mapear gêneros ou categorias como quiser!
  });
  