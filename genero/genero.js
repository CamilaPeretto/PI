/* ---------- Parâmetros da URL ---------- */
const params = new URLSearchParams(window.location.search);
const tipoOriginal = params.get('tipo') || 'romance';
let pagina = parseInt(params.get('pagina')) || 1;

/* ---------- Normalização do gênero ---------- */
function normalizarGenero(genero) {
  const mapa = {
    'acao': 'action', 'ação': 'action', 'romance': 'romance', 'fantasia': 'fantasy',
    'misterio': 'mystery', 'mistério': 'mystery', 'terror': 'horror',
    'autoajuda': 'self-help', 'ficcao cientifica': 'science fiction', 'ficção científica': 'science fiction',
    'aventura': 'adventure', 'biografia': 'biography', 'classicos': 'classics',
    'contos': 'short stories', 'policial': 'crime', 'poesia': 'poetry',
    'religiao': 'religion', 'religião': 'religion', 'drama': 'drama',
    'historia': 'history', 'infantil': 'children', 'psicologia': 'psychology',
    'suspense': 'suspense', 'trhilher': 'thriller'
  };
  const generoSemAcento = removerAcentos(genero.toLowerCase());
  return mapa[generoSemAcento] || generoSemAcento;
}

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const generoMapeado = normalizarGenero(tipoOriginal);

/* ---------- Funções auxiliares ---------- */
function capitalizar(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function corrigirTituloGenero(genero) {
  const mapa = {
    'acao': 'Ação', 'misterio': 'Mistério', 'ficcao cientifica': 'Ficção Científica',
    'classicos': 'Clássicos', 'contos': 'Contos', 'religiao': 'Religião', 'trhilher': 'Thriller'
  };
  const generoMinusculo = genero.toLowerCase();
  return mapa[generoMinusculo] || capitalizar(genero);
}

/* ---------- Breadcrumb ---------- */
function atualizarBreadcrumb(genero) {
  const breadcrumb = document.getElementById("breadcrumb");
  const generoCorrigido = corrigirTituloGenero(genero);

  breadcrumb.innerHTML = `
    <a href="/home/home.html" class="hover:underline">Home</a>
    <span>/</span>
    <span class="font-bold">${generoCorrigido}</span>
  `;
}
atualizarBreadcrumb(tipoOriginal);

/* ---------- Configurações de paginação ---------- */
const livrosPorPagina = 40;
const startIndex = (pagina - 1) * livrosPorPagina;

const limitesGenero = {
  'action': 5, 'self-help': 5, 'adventure': 5, 'biography': 5, 'classics': 5,
  'short stories': 1, 'drama': 5, 'fantasy': 4, 'science fiction': 8, 'history': 5,
  'children': 1, 'mystery': 5, 'poetry': 5, 'crime': 5, 'psychology': 5,
  'religion': 5, 'romance': 5, 'suspense': 5, 'horror': 5, 'thriller': 5
};

/* ---------- Carregar livros ---------- */
async function carregarLivros() {
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(generoMapeado)}&maxResults=${livrosPorPagina}&startIndex=${startIndex}`;
  const grade = document.getElementById("livros-grade");
  const paginaAtual = document.getElementById("pagina-atual");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  grade.innerHTML = `<div class="col-span-full flex justify-center items-center gap-3 text-gray-500">
    <div class="w-6 h-6 border-4 border-gray-300 border-t-[#1B4965] rounded-full animate-spin"></div>
    <span>Carregando livros...</span>
  </div>`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    grade.innerHTML = "";

    if (data.items && data.items.length > 0) {
      data.items.forEach(livro => {
        const info = livro.volumeInfo;
        const img = info.imageLinks?.thumbnail || 'https://i.ibb.co/1YPzMMTN/placeholder.jpg';
        const titulo = info.title || "Sem título";
        const autor = info.authors?.join(", ") || "Autor desconhecido";

        const card = document.createElement("div");
        card.className = "bg-white rounded-lg shadow-md p-3 text-center hover:scale-105 hover:shadow-xl transition-transform duration-300 h-auto";

        card.innerHTML = `
          <img src="${img}" alt="${titulo}" class="w-full h-auto object-contain rounded-md mb-3">
          <h4 class="text-sm font-semibold truncate">${titulo}</h4>
          <p class="text-xs text-gray-600 truncate">${autor}</p>
        `;
        grade.appendChild(card);
      });

      const limitePagina = limitesGenero[generoMapeado] || 5;
      paginaAtual.textContent = `Página ${pagina} de ${limitePagina}`;

      prevBtn.disabled = pagina <= 1;
      nextBtn.disabled = pagina >= limitePagina;

    } else {
      grade.innerHTML = `<p class="col-span-full text-center text-gray-600">Nenhum livro encontrado.</p>`;
      paginaAtual.textContent = "";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }
  } catch (err) {
    console.error("Erro ao carregar livros:", err);
    grade.innerHTML = `<p class="col-span-full text-center text-red-500">Erro ao carregar livros. Recarregue a página.</p>`;
  }
}

/* ---------- Paginação ---------- */
function alterarPagina(novaPagina) {
  const urlAtualizada = new URL(window.location.href);
  urlAtualizada.searchParams.set("pagina", novaPagina);
  history.pushState({}, "", urlAtualizada.toString());
  location.reload();
}

document.getElementById("prev").addEventListener("click", () => {
  if (pagina > 1) alterarPagina(pagina - 1);
});

document.getElementById("next").addEventListener("click", () => {
  alterarPagina(pagina + 1);
});

/* ---------- Dropdown ---------- */
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const menu = toggle.nextElementSibling;
    const arrow = toggle.querySelector('.arrow-icone');
    document.querySelectorAll('.dropdown-menu').forEach(m => { if (m !== menu) m.classList.add('hidden'); });
    document.querySelectorAll('.arrow-icone').forEach(a => { if (a !== arrow) a.classList.remove('arrow-rotated'); });
    menu?.classList.toggle('hidden');
    arrow?.classList.toggle('arrow-rotated');
  });
});

document.addEventListener('click', (ev) => {
  if (!ev.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
    document.querySelectorAll('.arrow-icone').forEach(a => a.classList.remove('arrow-rotated'));
  }
});

/* ---------- Executar ---------- */
carregarLivros();
