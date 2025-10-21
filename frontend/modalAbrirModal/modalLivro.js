function abrirModalLivro(info = {}) {
  const overlay = document.getElementById('modal-overlay') || document.getElementById('modal-container'); // fallback
  const box = document.getElementById('modal-box');
  const capa = document.getElementById('modalCapa');
  const titulo = document.getElementById('modalTitulo');
  const autor = document.getElementById('modalAutor');
  const genero = document.getElementById('modalGenero');
  const data = document.getElementById('modalData');
  const sinopse = document.getElementById('modalSinopse');
  const sinopseContainer = document.getElementById('modalSinopseContainer');
  const estrelasEl = document.getElementById('modalEstrelas');
  const notaEl = document.getElementById('modalNota');
  const btnFavorito = document.getElementById('btnFavorito');
  const avaliarWrapper = document.getElementById('modalAvaliar'); // area onde o user avalia
  const btnFechar = document.getElementById('fecharModalLivro');

  if (!overlay || !box) {
    console.warn('Modal HTML não encontrado. Verifique IDs.');
    return;
  }

  // --- Função utilitária para escolher melhor imagem disponível ---
  function escolherMelhorCapa(urlOrInfo) {
    // se info for um objeto com imageLinks:
    if (urlOrInfo && typeof urlOrInfo === 'object') {
      const v = urlOrInfo;
      return v.extraLarge || v.large || v.medium || v.small || v.thumbnail || v.smallThumbnail || null;
    }
    // se for string
    let url = urlOrInfo || '';
    if (!url) return null;
    // forçar https
    url = url.replace(/^http:/, 'https:');
    // tentar ajustar zoom param (Google Books)
    try {
      url = url.replace('zoom=1', 'zoom=2');
      url = url.replace('zoom=1', 'zoom=2'); // duas tentativas seguras
    } catch(e){}
    return url;
  }

  // Melhor capa: se info.capa for um URL simples, usa; se receber volume.volumeInfo.imageLinks, usa isso caso disponível
  const melhor = escolherMelhorCapa(info.capa) || escolherMelhorCapa(info.imageLinks) || escolherMelhorCapa(info.imageLinks?.thumbnail) || 'https://i.ibb.co/1YPzMMTN/placeholder.jpg';

  // aplicar valores com fallback seguro
  capa.src = melhor;
  // garantir que imagem não distorça/encha a tela: classe css já cuida (object-contain e max-height)
  titulo.textContent = (info.titulo || 'Título desconhecido').toString().trim();
  autor.textContent = info.autor ? `por ${info.autor}` : 'Autor desconhecido';
  genero.textContent = info.genero ? `Gênero: ${info.genero}` : 'Gênero não informado';
  data.textContent = info.data ? `Publicado em: ${info.data}` : 'Data não informada';
  sinopse.textContent = (info.sinopse || 'Nenhuma descrição disponível.').toString().trim();

  // avaliações: se não houver, preencher randomicamente (mas coerente)
  let nota = Number(info.nota);
  let total = Number(info.totalAvaliacoes);
  if (!Number.isFinite(nota) || nota <= 0) {
    nota = +(Math.random() * 2 + 3).toFixed(1); // nota entre 3.0 e 5.0 se faltante
  }
  if (!Number.isFinite(total) || total <= 0) {
    total = Math.floor(Math.random() * 800) + 1; // entre 1 e 800
  }

  // renderiza estrelas visuais (cheio/meio/vazio opcional - usarei só cheios + parcial via CSS)
  if (estrelasEl) {
    estrelasEl.innerHTML = ''; // limpar
    const fullStars = Math.floor(nota);
    for (let i=0;i<5;i++){
      const s = document.createElement('span');
      s.className = 'star text-2xl';
      if (i < fullStars) s.textContent = '★';
      else s.textContent = '☆';
      estrelasEl.appendChild(s);
    }
  }
  if (notaEl) notaEl.textContent = `${nota.toFixed(1)} • ${total} avaliações`;

  // limpar e preparar área de avaliação do usuário (interactive)
  if (avaliarWrapper) {
    avaliarWrapper.innerHTML = ''; // vamos criar 5 estrelas clicáveis
    for (let i=1;i<=5;i++){
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'text-2xl cursor-pointer px-1 select-none';
      star.dataset.value = i;
      star.textContent = '☆';
      // highlight ao hover/click
      star.addEventListener('mouseenter', () => {
        Array.from(avaliarWrapper.children).forEach((el, idx) => { el.textContent = (idx < i ? '★' : '☆'); });
      });
      star.addEventListener('mouseleave', () => {
        // se usuário já tiver avaliado, manter; caso contrário zerar visual
        const saved = Number(avaliarWrapper.dataset.userRating) || 0;
        Array.from(avaliarWrapper.children).forEach((el, idx) => { el.textContent = (idx < saved ? '★' : '☆'); });
      });
      star.addEventListener('click', () => {
        const val = Number(star.dataset.value);
        // salvar localStorage como exemplo (você pode integrar com backend)
        const key = 'minhasAvaliacoes';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        // evita duplicação - usa título como chave simples
        const existingIndex = arr.findIndex(x => x.titulo === info.titulo);
        if (existingIndex >= 0) arr[existingIndex].avaliacao = val;
        else arr.push({ titulo: info.titulo, capa: melhor, avaliacao: val, timestamp: Date.now() });
        localStorage.setItem(key, JSON.stringify(arr));

        // fixa visual das estrelas de avaliação
        avaliarWrapper.dataset.userRating = val;
        Array.from(avaliarWrapper.children).forEach((el, idx) => { el.textContent = (idx < val ? '★' : '☆'); });
      });
      avaliarWrapper.appendChild(star);
    }
    // se já avaliado antes, mostra
    const userArr = JSON.parse(localStorage.getItem('minhasAvaliacoes') || '[]');
    const prev = userArr.find(x => x.titulo === info.titulo);
    if (prev) {
      avaliarWrapper.dataset.userRating = prev.avaliacao;
      Array.from(avaliarWrapper.children).forEach((el, idx) => { el.textContent = (idx < prev.avaliacao ? '★' : '☆'); });
    } else {
      avaliarWrapper.dataset.userRating = 0;
      Array.from(avaliarWrapper.children).forEach(el => el.textContent = '☆');
    }
  }

  // favorito: estado salvo no localStorage 'favoritos' (array de objetos)
  if (btnFavorito) {
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
    const isFav = favs.some(f => f.titulo === info.titulo);
    btnFavorito.textContent = isFav ? '❤' : '♡';
    btnFavorito.style.color = isFav ? 'red' : '#666';
    btnFavorito.onclick = () => {
      let arr = JSON.parse(localStorage.getItem('favoritos') || '[]');
      const idx = arr.findIndex(x => x.titulo === info.titulo);
      if (idx >= 0) {
        arr.splice(idx, 1);
        btnFavorito.textContent = '♡';
        btnFavorito.style.color = '#666';
      } else {
        arr.push({ titulo: info.titulo, capa: melhor, autor: info.autor });
        btnFavorito.textContent = '❤';
        btnFavorito.style.color = 'red';
      }
      localStorage.setItem('favoritos', JSON.stringify(arr));
    };
  }

  // mostrar overlay/modal
  overlay.style.display = 'flex';
  box.style.display = 'flex';
  box.setAttribute('tabindex', '-1');
  box.focus();

  // fechar se clicar fora da caixa ou apertar ESC
  function fecharModal() {
    overlay.style.display = 'none';
    box.style.display = 'none';
    document.removeEventListener('keydown', onKey);
    overlay.removeEventListener('click', onOverlayClick);
  }

  // Fechar ao clicar no botão X
  if (btnFechar) {
    btnFechar.onclick = fecharModal;
  }

  // Fechar ao clicar fora do box
  function onOverlayClick(e) {
    if (e.target === overlay) fecharModal();
  }

  // Fechar com ESC
  function onKey(e) {
    if (e.key === 'Escape') fecharModal();
  }

  overlay.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onKey);

}
