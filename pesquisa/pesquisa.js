document.addEventListener('DOMContentLoaded', () => {

    const searchContainer = document.getElementById('searchResults');
    const searchTitle = document.getElementById('searchTitle');
    const PAGE_SIZE = 12;
  
    /* ---------- Helpers ---------- */
    function getQueryParam(name) {
      const params = new URLSearchParams(window.location.search);
      return params.get(name) || '';
    }
  
    function safeJsonParse(str) {
      try { return JSON.parse(str); } catch(e) { return null; }
    }
  
    function limitarTexto(nodeList, limite = 40) {
      if (!nodeList) return;
      nodeList.forEach(el => {
        const txt = (el.textContent || '').trim();
        if (txt.length > limite) el.textContent = txt.substring(0, limite).trim() + '...';
      });
    }
  
    /* ---------- Buscar livros ---------- */
    async function buscarLivros(query, startIndex = 0, maxResults = PAGE_SIZE) {
      if (!query) return [];
      query = query.trim();
      const formattedQuery = `intitle:${query} OR inauthor:${query}`;
      try {
        let res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(formattedQuery)}&startIndex=${startIndex}&maxResults=${maxResults}`);
        let json = await res.json();
        let livros = json.items || [];
        if (!livros.length) {
          res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}`);
          json = await res.json();
          livros = json.items || [];
        }
        return livros;
      } catch (err) {
        console.warn('Erro ao buscar livros:', err);
        return [];
      }
    }
  
    /* ---------- Render livros ---------- */
    function renderLivros(livros) {
      if (!searchContainer) return;
      searchContainer.innerHTML = '';
  
      if (!Array.isArray(livros) || livros.length === 0) {
        searchContainer.innerHTML = '<p class="text-[#1B4965]">Nenhum livro encontrado.</p>';
        return;
      }
  
      livros.forEach(item => {
        const volume = item.volumeInfo || item;
        const img = volume.imageLinks?.thumbnail || volume.image || 'https://i.ibb.co/1YPzMMTN/placeholder.jpg';
        const titulo = volume.title || 'Sem título';
        const autor = (volume.authors && volume.authors.join) ? volume.authors.join(', ') : (volume.author || 'Autor desconhecido');
  
        const card = document.createElement('div');
        card.className = 'book-card w-44 md:w-48 h-72 bg-white rounded-lg p-3 shadow hover:scale-[1.03] transition-transform';
        card.innerHTML = `
          <img src="${img}" alt="${titulo}" class="w-full h-56 object-cover rounded-md mb-2">
          <h4 class="text-sm font-semibold truncate">${titulo}</h4>
          <p class="text-xs text-gray-500 truncate">${autor}</p>
        `;
        searchContainer.appendChild(card);
      });
  
      limitarTexto(searchContainer.querySelectorAll('h4'), 40);
      limitarTexto(searchContainer.querySelectorAll('p'), 30);
    }
  
    /* ---------- Inicialização ---------- */
    async function init() {
      const termo = getQueryParam('q');
      if (!termo) return;
  
      if (searchTitle) searchTitle.textContent = `Resultados para: "${termo}"`;
  
      const livros = await buscarLivros(termo, 0, PAGE_SIZE);
      renderLivros(livros);
    }
  
    init();
  
  });
  