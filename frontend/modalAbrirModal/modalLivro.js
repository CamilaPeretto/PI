function abrirModalLivro(info) {
    const modal = document.getElementById("livroModal");
    if (!modal) return;
  
    const capa = document.getElementById("modalCapa");
    const titulo = document.getElementById("modalTitulo");
    const autor = document.getElementById("modalAutor");
    const genero = document.getElementById("modalGenero");
    const data = document.getElementById("modalData");
    const sinopse = document.getElementById("modalSinopse");
    const estrelas = document.getElementById("modalEstrelas");
    const notaEl = document.getElementById("modalNota");
  
    // Preenche dados
    capa.src = info.capa || "https://i.ibb.co/1YPzMMTN/placeholder.jpg";
    titulo.textContent = info.titulo || "Título desconhecido";
    autor.textContent = info.autor ? `por ${info.autor}` : "Autor desconhecido";
    genero.textContent = info.genero ? `Gênero: ${info.genero}` : "";
    data.textContent = info.data ? `Publicado em: ${info.data}` : "";
    sinopse.textContent = info.sinopse || "Nenhuma descrição disponível.";
  
    // Se não tiver avaliação, gera uma aleatória
    const nota = info.nota || Math.round((Math.random() * 4 + 1) * 10) / 10;
    const total = info.totalAvaliacoes || Math.floor(Math.random() * 500) + 10;
  
    // Renderiza estrelas da avaliação do livro
    estrelas.innerHTML = "★".repeat(Math.floor(nota)) + "☆".repeat(5 - Math.floor(nota));
    notaEl.textContent = `${nota.toFixed(1)} (${total} avaliações)`;
  
    // Avaliação do usuário
    const estrelasUsuario = document.querySelectorAll("#modalAvaliar span");
    estrelasUsuario.forEach(star => {
      star.addEventListener("click", () => {
        const val = parseInt(star.dataset.star);
        estrelasUsuario.forEach((s, i) => {
          s.textContent = i < val ? "★" : "☆";
        });
        localStorage.setItem(`avaliacao_${info.titulo}`, val);
      });
  
      // Carregar avaliação anterior
      const salva = localStorage.getItem(`avaliacao_${info.titulo}`);
      if (salva) {
        estrelasUsuario.forEach((s, i) => {
          s.textContent = i < salva ? "★" : "☆";
        });
      }
    });
  
    // Favorito
    const btnFavorito = document.getElementById("btnFavorito");
    const favKey = `favorito_${info.titulo}`;
    let isFav = localStorage.getItem(favKey) === "true";
    atualizarCoracao();
  
    btnFavorito.onclick = () => {
      isFav = !isFav;
      localStorage.setItem(favKey, isFav);
      atualizarCoracao();
    };
  
    function atualizarCoracao() {
      btnFavorito.style.color = isFav ? "red" : "gray";
    }
  
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
  
  // Fechar modal
  document.addEventListener("click", e => {
    if (e.target.id === "fecharModalLivro" || e.target.id === "livroModal") {
      document.getElementById("livroModal").classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });
  