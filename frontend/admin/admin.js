document.addEventListener("DOMContentLoaded", async () => {
  lucide.createIcons();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Acesso negado! Faça login primeiro.");
    window.location.href = "../login/login.html";
    return;
  }

  // ==============================
  // ELEMENTOS
  // ==============================
const tabelaLivros = document.getElementById("tabelaLivros");
  const carregarMais = document.getElementById("carregarMais");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const modalAdicionar = document.getElementById("modalAdicionar");
  const fecharModalAdicionar = document.getElementById("fecharModalAdicionar");
  const formAdicionar = document.getElementById("formAdicionar");

  const modalDetalhes = document.getElementById("modalDetalhes");
  const fecharModalDetalhes = document.getElementById("fecharModalDetalhes");
  const btnEditarLivro = document.getElementById("editarLivro");
  const btnSalvarEdicao = document.getElementById("salvarEdicao");
  const btnExcluirLivro = document.getElementById("deletarLivro");
  const dataAddDetalhe = document.getElementById("dataAddDetalhe");
  const tituloDetalhe = document.getElementById("tituloDetalhe");
  const autorDetalhe = document.getElementById("autorDetalhe");
  const dataPubDetalhe = document.getElementById("dataPubDetalhe");
  const generoDetalhe = document.getElementById("generoDetalhe");
  const formatoDetalhe = document.getElementById("formatoDetalhe");
  const sinopseDetalhe = document.getElementById("sinopseDetalhe");
  // ==============================
  // CONFIGURAÇÃO GLOBAL
  // ==============================
  const API_URL = "http://localhost:5000/api/admin/livros";

  let totalLivros = 0;
  let paginaAtual = 1;
  let limite = 10;
  let filtrosAtuais = {};

  // ================= DASHBOARD =================
async function carregarDadosDashboard() {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado.");

    // ====== 1️⃣ Buscar dados gerais (downloads e livros) ======
    const response = await fetch("http://localhost:5000/api/admin/dados", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Erro ao buscar dados do dashboard");
    const dados = await response.json();

    document.getElementById("totalDownloads").textContent = dados.totalDownloads || 0;
    document.getElementById("totalLivros").textContent = dados.totalLivros || 0;

    // ====== 2️⃣ Buscar total de usuários direto do banco ======
    const responseUsuarios = await fetch("http://localhost:5000/api/usuarios/count");
    if (!responseUsuarios.ok) throw new Error("Erro ao buscar total de usuários");

    const dataUsuarios = await responseUsuarios.json();
    document.getElementById("totalUsuarios").textContent = dataUsuarios.total || 0;

  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
}

// Chama assim que a página carrega
await carregarDadosDashboard();

// ====== Função principal para carregar livros ======
let temMaisLivros = true;

async function carregarLivros(filtros = {}, limparTabela = false) {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado.");

    const params = new URLSearchParams({
      page: paginaAtual,
      limit: 10,
      ...filtros
    });

    const response = await fetch(`http://localhost:5000/api/admin/livros?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Erro ao buscar livros.");
    const data = await response.json();

    const tabela = document.getElementById("tabelaLivros");
    if (!tabela) throw new Error("Elemento #tabelaLivros não encontrado.");

    if (limparTabela) tabela.innerHTML = ""; // limpa antes de aplicar filtros

    const livros = data.livros || [];

    // Renderizar as linhas
    livros.forEach(livro => {
      const tr = document.createElement("tr");
      tr.classList.add("border-b", "hover:bg-gray-50", "transition");

      tr.innerHTML = `
        <td class="p-3">${livro.titulo}</td>
        <td class="p-3">${livro.autor}</td>
        <td class="p-3">${livro.dataPub || "-"}</td>
        <td class="p-3">${livro.genero}</td>
        <td class="p-3">${livro.formato}</td>
      `;

      tabela.appendChild(tr);
    });

    // Controle do botão "Carregar mais"
    const btnCarregar = document.getElementById("carregarMais");
    if (data.pagination.hasNext) {
      btnCarregar.classList.remove("hidden");
      temMaisLivros = true;
    } else {
      btnCarregar.classList.add("hidden");
      temMaisLivros = false;

      
    }

  } catch (error) {
    console.error("Erro em carregarLivros:", error);
  }
}

// Filtros
document.getElementById("btnFiltrar").addEventListener("click", async () => {
  const filtros = {
    titulo: document.getElementById("filtroTitulo").value,
    autor: document.getElementById("filtroAutor").value,
    genero: document.getElementById("filtroGenero").value,
    formato: document.getElementById("filtroFormato").value,
    dataPubDe: document.getElementById("dataPubDe").value,
    dataPubAte: document.getElementById("dataPubAte").value,
  };

  paginaAtual = 1;
  await carregarLivros(filtros, true);
});

document.getElementById("btnLimpar").addEventListener("click", async () => {
  document.getElementById("filtroTitulo").value = "";
  document.getElementById("filtroAutor").value = "";
  document.getElementById("filtroGenero").value = "";
  document.getElementById("filtroFormato").value = "";
  document.getElementById("dataPubDe").value = "";
  document.getElementById("dataPubAte").value = "";

  paginaAtual = 1;
  await carregarLivros({}, true);
});

// Botão "Carregar mais"
document.getElementById("carregarMais").addEventListener("click", async () => {
  if (temMaisLivros) {
    paginaAtual++;
    await carregarLivros();
  }
});

// Carregar ao iniciar
document.addEventListener("DOMContentLoaded", () => carregarLivros());

  // ==============================
  // RENDERIZAR TABELA
  // ==============================
  function renderizarTabela(livros) {
    const tbody = tabelaLivros;
    if (!tbody) return;

    livros.forEach((livro) => {
      const tr = document.createElement("tr");
      tr.classList.add("cursor-pointer", "hover:bg-gray-100");

      tr.innerHTML = `
        <td class="p-3">${livro.titulo}</td>
        <td class="p-3">${livro.autor}</td>
        <td class="p-3">${livro.dataPub || ""}</td>
        <td class="p-3">${livro.genero || ""}</td>
        <td class="p-3">${livro.formato || ""}</td>
      `;

      tr.addEventListener("click", () => abrirModalDetalhes(livro));
      tbody.appendChild(tr);
    });
  }

  // ==============================
  // ADICIONAR LIVRO
  // ==============================
  formAdicionar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formAdicionar);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao adicionar livro");

      alert("✅ Livro adicionado com sucesso!");
      modalAdicionar.classList.add("hidden");
      formAdicionar.reset();

      tabelaLivros.innerHTML = ""; // limpa antes de recarregar
      paginaAtual = 1;
      await carregarLivros();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao salvar o livro no banco.");
    }
  });

  // ==============================
  // MODAL DETALHES
  // ==============================
  function abrirModalDetalhes(livro) {
    livroSelecionado = livro;
    tituloDetalhe.value = livro.titulo;
    autorDetalhe.value = livro.autor;
    dataPubDetalhe.value = livro.dataPublicacao?.split("T")[0] || livro.dataPub || "";
    generoDetalhe.value = livro.genero || "";
    formatoDetalhe.value = livro.formato || "";
    sinopseDetalhe.value = livro.sinopse || "";

    desabilitarEdicao();
    modalDetalhes.classList.remove("hidden");

    // Mostra os nomes dos arquivos e preview da capa
    if (livro.capa?.originalName) {
      document.getElementById("labelCapaDetalhe").textContent = ` ${livro.capa.originalName}`;
      previewCapaDetalhe.src = `http://localhost:5000/${livro.capa.path}`;

      
    } else {
      document.getElementById("labelCapaDetalhe").textContent = "Selecionar imagem...";
      document.getElementById("previewCapaDetalhe").classList.add("hidden");
    }

    if (livro.arquivo?.originalName) {
      document.getElementById("labelArquivoDetalhe").textContent = ` ${livro.arquivo.originalName}`;
    } else {
      document.getElementById("labelArquivoDetalhe").textContent = "Selecionar arquivo (.pdf, .epub, .mobi)...";
    }
  }

  function habilitarEdicao() {
    [tituloDetalhe, autorDetalhe, dataPubDetalhe, generoDetalhe, formatoDetalhe, sinopseDetalhe].forEach(
      (el) => (el.disabled = false)
    );
    btnEditarLivro.classList.add("hidden");
    btnSalvarEdicao.classList.remove("hidden");
  }

  function desabilitarEdicao() {
    [tituloDetalhe, autorDetalhe, dataPubDetalhe, generoDetalhe, formatoDetalhe, sinopseDetalhe].forEach(
      (el) => (el.disabled = true)
    );
    btnEditarLivro.classList.remove("hidden");
    btnSalvarEdicao.classList.add("hidden");
  }

  btnEditarLivro.addEventListener("click", habilitarEdicao);

  // ==============================
  // SALVAR EDIÇÃO
  // ==============================
  btnSalvarEdicao.addEventListener("click", async () => {
    if (!livroSelecionado) return;

    const livroAtualizado = {
      titulo: tituloDetalhe.value,
      autor: autorDetalhe.value,
      dataPublicacao: dataPubDetalhe.value,
      genero: generoDetalhe.value,
      formato: formatoDetalhe.value,
      sinopse: sinopseDetalhe.value,
    };

    try {
      const res = await fetch(`${API_URL}/${livroSelecionado._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(livroAtualizado),
      });

      if (!res.ok) throw new Error("Erro ao salvar edição");

      alert("✅ Alterações salvas com sucesso!");
      modalDetalhes.classList.add("hidden");
      tabelaLivros.innerHTML = "";
      paginaAtual = 1;
      await carregarLivros();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao atualizar o livro.");
    }
  });

  // ==============================
  // EXCLUIR LIVRO
  // ==============================
  btnExcluirLivro.addEventListener("click", async () => {
    if (!livroSelecionado) return;

    if (!confirm(`Tem certeza que deseja excluir "${livroSelecionado.titulo}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/${livroSelecionado._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao excluir livro");

      alert("🗑️ Livro removido com sucesso!");
      modalDetalhes.classList.add("hidden");
      tabelaLivros.innerHTML = "";
      paginaAtual = 1;
      await carregarLivros();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao excluir o livro.");
    }
  });

  // ==============================
  // BOTÕES E MODAIS
  // ==============================
  btnAdicionar.addEventListener("click", () => modalAdicionar.classList.remove("hidden"));
  fecharModalAdicionar.addEventListener("click", () => modalAdicionar.classList.add("hidden"));
  fecharModalDetalhes.addEventListener("click", () => modalDetalhes.classList.add("hidden"));

  if (carregarMais) carregarMais.addEventListener("click", carregarLivros);

  // ==============================
  // LOGOUT
  // ==============================
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login/login.html";
  });
// ============================== NOMES DE ARQUIVOS E PREVIEW CAPA ==============================
  // Modal Adicionar
  const inputCapaAdd = document.getElementById("uploadCapaAdd");
  const inputArquivoAdd = document.getElementById("uploadArquivoAdd");
  const labelArquivoAdd = document.getElementById("labelArquivo");
  const nomeArquivoAdd = document.getElementById("nomeArquivo");

  if (inputCapaAdd) {
    inputCapaAdd.addEventListener("change", () => {
      if (inputCapaAdd.files.length > 0) {
        const nome = inputCapaAdd.files[0].name;
        nomeArquivoAdd.textContent = ` ${nome}`;
      } else nomeArquivoAdd.textContent = "";
    });
  }

  if (inputArquivoAdd) {
    inputArquivoAdd.addEventListener("change", () => {
      if (inputArquivoAdd.files.length > 0) {
        const nome = inputArquivoAdd.files[0].name;
        labelArquivoAdd.textContent = ` ${nome}`;
      } else labelArquivoAdd.textContent = "Selecionar arquivo (.pdf, .epub, .mobi)...";
    });
  }

  
  
  
  // ==============================
  // INICIALIZAÇÃO
  // ==============================
  await carregarLivros();
});

