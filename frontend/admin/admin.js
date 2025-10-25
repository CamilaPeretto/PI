document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Inicialização dos ícones Lucide
  // =========================
  lucide.createIcons();
 const token = localStorage.getItem("token");

  if (!token) {
    alert("Acesso negado! Faça login primeiro.");
    window.location.href = "../login/login.html";
    return;
  }

  // Tenta validar o token com o backend
  fetch("http://localhost:5000/api/admin/dados", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Token inválido");
      return res.json();
    })
    .then(data => {
      console.log("✅ Dados carregados:", data);
      // Aqui você pode preencher os cards com dados reais
    })
    .catch(() => {
      alert("Sessão expirada. Faça login novamente.");
      localStorage.removeItem("token");
      window.location.href = "../login/login.html";
    });
  // =========================
  // Seletores principais
  // =========================
  const tabelaLivros = document.getElementById("tabelaLivros");
  const btnCarregarMais = document.getElementById("carregarMais");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const modalAdicionar = document.getElementById("modalAdicionar");
  const fecharModalAdicionar = document.getElementById("fecharModalAdicionar");
  const formAdicionar = document.getElementById("formAdicionar");
  const modalDetalhes = document.getElementById("modalDetalhes");
  const fecharModalDetalhes = document.getElementById("fecharModalDetalhes");
  const btnFiltrar = document.getElementById("btnFiltrar");
  const btnLimpar = document.getElementById("btnLimpar");
  const logoutBtn = document.getElementById("logoutBtn");

  // Modal de detalhes
  const formDetalhes = document.getElementById("formDetalhes");
  const tituloDetalhe = document.getElementById("tituloDetalhe");
  const autorDetalhe = document.getElementById("autorDetalhe");
  const dataPubDetalhe = document.getElementById("dataPubDetalhe");
  const generoDetalhe = document.getElementById("generoDetalhe");
  const formatoDetalhe = document.getElementById("formatoDetalhe");
  const sinopseDetalhe = document.getElementById("sinopseDetalhe");
  const capaDetalhe = document.getElementById("uploadCapaDetalhe");
  const labelCapaDetalhe = document.getElementById("labelCapaDetalhe");
  const previewCapaDetalhe = document.getElementById("previewCapaDetalhe");
  const arquivoDetalhe = document.getElementById("uploadArquivoDetalhe");
  const labelArquivoDetalhe = document.getElementById("labelArquivoDetalhe");
  const dataPubInfo = document.getElementById("dataPubInfo");
  const dataAddInfo = document.getElementById("dataAddInfo");
  const btnEditarLivro = document.getElementById("editarLivro");
  const btnSalvarEdicao = document.getElementById("salvarEdicao");
  const btnExcluirLivro = document.getElementById("deletarLivro");

  // =========================
  // Dados iniciais
  // =========================
  const generos = ["Romance", "Ficção", "Aventura", "Fantasia", "Terror"];
  const formatos = ["PDF", "EPUB", "MOBI"];

  let livros = Array.from({ length: 20 }, (_, i) => ({
    id: crypto.randomUUID(),
    titulo: `Livro ${i + 1}`,
    autor: `Autor ${i + 1}`,
    dataPub: gerarDataAleatoria(2010, 2023),
    dataAdd: gerarDataAleatoria(2024, 2025),
    genero: generos[Math.floor(Math.random() * generos.length)],
    formato: formatos[Math.floor(Math.random() * formatos.length)],
    sinopse: `Sinopse do Livro ${i + 1} — Lorem ipsum dolor sit amet.`,
    capa: "",
    arquivo: ""
  }));

  let livrosFiltrados = [...livros];
  let limite = 10;
  let livroSelecionado = null;

  // =========================
  // Funções utilitárias
  // =========================
  function gerarDataAleatoria(anoInicio, anoFim) {
    const ano = Math.floor(Math.random() * (anoFim - anoInicio + 1)) + anoInicio;
    const mes = String(Math.ceil(Math.random() * 12)).padStart(2, "0");
    const dia = String(Math.ceil(Math.random() * 28)).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  function renderizarTabela(lista) {
    tabelaLivros.innerHTML = "";
    const visiveis = lista.slice(0, limite);
    visiveis.forEach((livro) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50 cursor-pointer transition";
      tr.innerHTML = `
        <td class="p-3">${livro.titulo}</td>
        <td class="p-3">${livro.autor}</td>
        <td class="p-3">${livro.dataPub}</td>
        <td class="p-3">${livro.dataAdd}</td>
        <td class="p-3">${livro.genero}</td>
        <td class="p-3">${livro.formato}</td>
      `;
      tr.addEventListener("click", () => abrirModalDetalhes(livro));
      tabelaLivros.appendChild(tr);
    });
    btnCarregarMais.classList.toggle("hidden", lista.length <= limite);
  }

  // =========================
  // MODAL DETALHES
  // =========================
  function abrirModalDetalhes(livro) {
    livroSelecionado = livro;

    tituloDetalhe.value = livro.titulo;
    autorDetalhe.value = livro.autor;
    dataPubDetalhe.value = livro.dataPub;
    generoDetalhe.value = livro.genero;
    formatoDetalhe.value = livro.formato;
    sinopseDetalhe.value = livro.sinopse;

    capaDetalhe.value = "";
    previewCapaDetalhe.src = livro.capa || "";
    previewCapaDetalhe.classList.toggle("hidden", !livro.capa);

    arquivoDetalhe.value = "";

    dataPubInfo.textContent = `Publicação: ${livro.dataPub}`;
    dataAddInfo.textContent = `Adicionado: ${livro.dataAdd}`;

    desabilitarEdicao();
    modalDetalhes.classList.remove("hidden");
  }

  function habilitarEdicao() {
  const container = document.getElementById('detalhesLivro');
  if (!container) return; // previne erros
  container.querySelectorAll("input, select, textarea").forEach(el => el.disabled = false);
  btnSalvarEdicao.classList.remove("hidden");
  btnEditarLivro.classList.add("hidden");
}

function desabilitarEdicao() {
  const container = document.getElementById('detalhesLivro');
  if (!container) return;
  container.querySelectorAll("input, select, textarea").forEach(el => el.disabled = true);
  btnSalvarEdicao.classList.add("hidden");
  btnEditarLivro.classList.remove("hidden");
}

  // Preview da capa (detalhes)
  if (capaDetalhe) {
    capaDetalhe.addEventListener("change", () => {
      const file = capaDetalhe.files[0];
      if (file) {
        labelCapaDetalhe.textContent = file.name;
        const reader = new FileReader();
        reader.onload = e => {
          previewCapaDetalhe.src = e.target.result;
          previewCapaDetalhe.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Preview do arquivo (detalhes)
  if (arquivoDetalhe) {
    arquivoDetalhe.addEventListener("change", () => {
      const file = arquivoDetalhe.files[0];
      if (file) labelArquivoDetalhe.textContent = file.name;
    });
  }

  // Editar livro
  btnEditarLivro.addEventListener("click", habilitarEdicao);

  // Salvar edição
  btnSalvarEdicao.addEventListener("click", () => {
    livroSelecionado.titulo = tituloDetalhe.value;
    livroSelecionado.autor = autorDetalhe.value;
    livroSelecionado.dataPub = dataPubDetalhe.value;
    livroSelecionado.genero = generoDetalhe.value;
    livroSelecionado.formato = formatoDetalhe.value;
    livroSelecionado.sinopse = sinopseDetalhe.value;

    if (capaDetalhe.files[0]) {
      const reader = new FileReader();
      reader.onload = e => livroSelecionado.capa = e.target.result;
      reader.readAsDataURL(capaDetalhe.files[0]);
    }

    if (arquivoDetalhe.files[0]) {
      livroSelecionado.arquivo = arquivoDetalhe.files[0].name;
    }

    desabilitarEdicao();
    renderizarTabela(livrosFiltrados);
    alert("Livro atualizado com sucesso!");
  });
  

  // Excluir livro
  btnExcluirLivro.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja excluir este livro?")) {
      livros = livros.filter(l => l.id !== livroSelecionado.id);
      livrosFiltrados = [...livros];
      renderizarTabela(livrosFiltrados);
      fecharModal(modalDetalhes);
      alert("Livro excluído com sucesso!");
    }
    
  });

  // =========================
  // ADICIONAR NOVO LIVRO
  // =========================
  formAdicionar.addEventListener("submit", (e) => {
    e.preventDefault();
    const novoLivro = {
      id: crypto.randomUUID(),
      titulo: document.getElementById("tituloAdd").value.trim(),
      autor: document.getElementById("autorAdd").value.trim(),
      dataPub: document.getElementById("dataPubAdd").value,
      dataAdd: new Date().toISOString().split("T")[0],
      genero: document.getElementById("generoAdd").value,
      formato: document.getElementById("formatoAdd").value,
      sinopse: document.getElementById("sinopseAdd")?.value || "",
      capa: "",
      arquivo: ""
    };

    livros.unshift(novoLivro);
    livrosFiltrados = [...livros];
    formAdicionar.reset();
    fecharModal(modalAdicionar);
    renderizarTabela(livrosFiltrados);
  });

  // =========================
  // FILTROS
  // =========================
  btnFiltrar.addEventListener("click", () => {
    const titulo = document.getElementById("filtroTitulo").value.toLowerCase();
    const autor = document.getElementById("filtroAutor").value.toLowerCase();
    const genero = document.getElementById("filtroGenero").value;
    const formato = document.getElementById("filtroFormato").value;
    const dataPubDe = document.getElementById("dataPubDe").value;
    const dataPubAte = document.getElementById("dataPubAte").value;
    const dataAddDe = document.getElementById("dataAddDe").value;
    const dataAddAte = document.getElementById("dataAddAte").value;

    livrosFiltrados = livros.filter(livro => {
      const matchTitulo = !titulo || livro.titulo.toLowerCase().includes(titulo);
      const matchAutor = !autor || livro.autor.toLowerCase().includes(autor);
      const matchGenero = !genero || livro.genero === genero;
      const matchFormato = !formato || livro.formato === formato;
      const matchDataPub = (!dataPubDe || livro.dataPub >= dataPubDe) && (!dataPubAte || livro.dataPub <= dataPubAte);
      const matchDataAdd = (!dataAddDe || livro.dataAdd >= dataAddDe) && (!dataAddAte || livro.dataAdd <= dataAddAte);
      return matchTitulo && matchAutor && matchGenero && matchFormato && matchDataPub && matchDataAdd;
    });

    limite = 10;
    renderizarTabela(livrosFiltrados);
  });

  btnLimpar.addEventListener("click", () => {
    document.querySelectorAll("#filtroTitulo, #filtroAutor, #filtroGenero, #filtroFormato, #dataPubDe, #dataPubAte, #dataAddDe, #dataAddAte").forEach(el => el.value = "");
    livrosFiltrados = [...livros];
    renderizarTabela(livrosFiltrados);
  });

  // =========================
  // EVENTOS GERAIS
  // =========================
  btnCarregarMais.addEventListener("click", () => {
    limite += 10;
    renderizarTabela(livrosFiltrados);
  });

  btnAdicionar.addEventListener("click", () => modalAdicionar.classList.remove("hidden"));
  fecharModalAdicionar.addEventListener("click", () => fecharModal(modalAdicionar));
  fecharModalDetalhes.addEventListener("click", () => fecharModal(modalDetalhes));

  logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../login/login.html";
});
  

  // =========================
  // Fechar modal genérico
  // =========================
  function fecharModal(modal) {
    modal.classList.add("hidden");
    if (modal === modalDetalhes) desabilitarEdicao();
  }

  // =========================
  // Inicialização
  // =========================
  renderizarTabela(livros);
});
