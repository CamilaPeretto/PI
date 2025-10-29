function abrirModalLivro(info = {}) {
  const overlay = document.getElementById("modal-overlay");
  const box = document.getElementById("modal-box");
  const capa = document.getElementById("modalCapa");
  const titulo = document.getElementById("modalTitulo");
  const autor = document.getElementById("modalAutor");
  const genero = document.getElementById("modalGenero");
  const data = document.getElementById("modalData");
  const sinopse = document.getElementById("modalSinopse");
  const estrelasEl = document.getElementById("modalEstrelas");
  const notaEl = document.getElementById("modalNota");
  const btnFechar = document.getElementById("fecharModalLivro");

  if (!overlay || !box) {
    console.warn("Modal HTML não encontrado. Verifique IDs.");
    return;
  }

  // === LOADING antes de carregar a imagem ===
  const loader = document.createElement("div");
  loader.id = "modalLoader";
  loader.className =
    "fixed inset-0 bg-black/70 flex items-center justify-center z-[99999]";
  loader.innerHTML =
    `<div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>`;
  document.body.appendChild(loader);

  // === Função utilitária para escolher melhor imagem disponível ===
  function escolherMelhorCapa(urlOrInfo) {
    if (urlOrInfo && typeof urlOrInfo === "object") {
      const v = urlOrInfo;
      return (
        v.extraLarge ||
        v.large ||
        v.medium ||
        v.small ||
        v.thumbnail ||
        v.smallThumbnail ||
        null
      );
    }
    let url = urlOrInfo || "";
    if (!url) return null;
    url = url.replace(/^http:/, "https:");
    try {
      url = url.replace("zoom=1", "zoom=2");
    } catch (e) {}
    return url;
  }

  const melhor =
    escolherMelhorCapa(info.capa) ||
    escolherMelhorCapa(info.imageLinks) ||
    "https://i.ibb.co/1YPzMMTN/placeholder.jpg";

  // === Preencher infos ===
  titulo.textContent = (info.titulo || "Título desconhecido").toString().trim();
  autor.textContent = info.autor
    ? `por ${info.autor}`
    : "Autor desconhecido";
  genero.textContent = info.genero
    ? `Gênero: ${info.genero}`
    : "Gênero não informado";
  data.textContent = info.data
    ? `Publicado em: ${info.data}`
    : "Data não informada";
  sinopse.textContent = (info.sinopse || "Nenhuma descrição disponível.")
    .toString()
    .trim();

  // === Avaliação aleatória (caso não exista) ===
  let nota = Number(info.nota);
  let total = Number(info.totalAvaliacoes);
  if (!Number.isFinite(nota) || nota <= 0) nota = +(Math.random() * 2 + 3).toFixed(1);
  if (!Number.isFinite(total) || total <= 0) total = Math.floor(Math.random() * 800) + 1;

  // Renderizar estrelas
  estrelasEl.innerHTML = "";
  const fullStars = Math.floor(nota);
  for (let i = 0; i < 5; i++) {
    const s = document.createElement("span");
    s.className = "text-2xl";
    s.textContent = i < fullStars ? "★" : "☆";
    estrelasEl.appendChild(s);
  }
  notaEl.textContent = `${nota.toFixed(1)} • ${total} avaliações`;

  // === Só abre o modal quando a imagem estiver carregada ===
  const imgTemp = new Image();
  imgTemp.src = melhor;
  imgTemp.onload = () => {
    capa.src = melhor;
    document.body.removeChild(loader);

    overlay.style.display = "flex";
    box.style.display = "flex";
    box.setAttribute("tabindex", "-1");
    box.focus();
  };
  imgTemp.onerror = () => {
    capa.src = "https://i.ibb.co/1YPzMMTN/placeholder.jpg";
    document.body.removeChild(loader);

    overlay.style.display = "flex";
    box.style.display = "flex";
    box.setAttribute("tabindex", "-1");
    box.focus();
  };

  // === Fechar modal ===
  function fecharModal() {
    overlay.style.display = "none";
    box.style.display = "none";
    document.removeEventListener("keydown", onKey);
    overlay.removeEventListener("click", onOverlayClick);
  }

  if (btnFechar) btnFechar.onclick = fecharModal;

  function onOverlayClick(e) {
    if (e.target === overlay) fecharModal();
  }

  function onKey(e) {
    if (e.key === "Escape") fecharModal();
  }

  overlay.addEventListener("click", onOverlayClick);
  document.addEventListener("keydown", onKey);

  // === Ações dos botões de formato ===
  const btnPdf = document.getElementById("btnPdf");
  const btnEpub = document.getElementById("btnEpub");
  const btnMobi = document.getElementById("btnMobi");

  function alertSolicitacao() {
    alert("Formato disponível apenas por solicitação. Acesse Perfil -> Solicitação de livros.");
  }

  if (btnPdf) {
    btnPdf.onclick = () => {
      if (info.isBanco && info.formato === 'PDF' && (info.downloadUrl || info.arquivoUrl)) {
        // Prefere endpoint que incrementa downloads
        const href = info.downloadUrl || info.arquivoUrl;
        const a = document.createElement('a');
        a.href = href;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alertSolicitacao();
      }
    };
  }

  if (btnEpub) {
    btnEpub.onclick = alertSolicitacao;
  }

  if (btnMobi) {
    btnMobi.onclick = alertSolicitacao;
  }
}
