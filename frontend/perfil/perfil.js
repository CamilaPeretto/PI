document.addEventListener("DOMContentLoaded", () => {

  // ================== Abas ==================
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  function ativarAba(tabId) {
    if (!tabId) return;

    tabs.forEach(b => b.classList.remove("active", "text-[#1B4965]", "font-semibold"));
    contents.forEach(c => c.classList.remove("active", "block"));
    contents.forEach(c => c.classList.add("hidden"));

    const abaAtiva = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const conteudoAtivo = document.getElementById(tabId);

    if (abaAtiva && conteudoAtivo) {
      abaAtiva.classList.add("active", "text-[#1B4965]", "font-semibold");
      conteudoAtivo.classList.add("active", "block");
      conteudoAtivo.classList.remove("hidden");
    } else {
      console.warn(`⚠️ Aba ou conteúdo não encontrados para: ${tabId}`);
    }
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      ativarAba(tabId);
      localStorage.setItem("abaAtiva", tabId);
    });
  });

  const abaSalva = localStorage.getItem("abaAtiva");
  ativarAba(abaSalva && document.getElementById(abaSalva) ? abaSalva : "meus-dados");

  
  // ================== Meus Dados ==================
 async function carregarPerfil() {

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado. Faça login novamente.");
      window.location.href = "../login/login.html";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/perfil", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!data.success) {
        alert("Erro ao carregar perfil.");
        return;
      }

      const user = data.user;

      // Preenche os labels
      const nomeLabel = document.getElementById("nomeLabel");
      const emailLabel = document.getElementById("emailLabel");

      if (nomeLabel) nomeLabel.innerText = user.nome || "";
      if (emailLabel) emailLabel.innerText = user.email || "";

    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      alert("Erro interno no servidor.");
    }
  }

  // ================== ATUALIZAR CAMPO ==================
  async function atualizarCampo(campo, valor) {

    const token = localStorage.getItem("token");
    if (!token) return alert("Token ausente. Faça login novamente.");

    try {
      const response = await fetch("http://localhost:5000/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [campo]: valor }),
      });

      const data = await response.json();
      if (!data.success) {
        alert(data.message || "Erro ao atualizar campo.");
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  // ================== CONFIGURAR EDIÇÃO ==================
  function configurarEdicao(campo) {

    const label = document.getElementById(`${campo}Label`);
    const input = document.getElementById(`${campo}Input`);
    const botao = document.getElementById(`edit${campo.charAt(0).toUpperCase() + campo.slice(1)}`);



    if (!label || !input || !botao) {
      console.error("Algum elemento não encontrado para", campo);
      return;
    }

    const svgs = botao.querySelectorAll("svg");

    if (svgs.length !== 2) {
      console.warn("Esperado 2 SVGs, encontrado:", svgs.length);
    }
    const [iconeEditar, iconeSalvar] = svgs;

    botao.addEventListener("click", async () => {

      if (input.classList.contains("hidden")) {

        input.value = label.innerText;
        label.classList.add("hidden");
        input.classList.remove("hidden");
        iconeEditar?.classList.add("hidden");
        iconeSalvar?.classList.remove("hidden");
      } else {
        // Salvar
        const novoValor = input.value.trim();
        if (!novoValor) {
          alert("Campo não pode ficar vazio!");
          return;
        }

        await atualizarCampo(campo, novoValor);
        label.innerText = novoValor;
        input.classList.add("hidden");
        label.classList.remove("hidden");
        iconeSalvar?.classList.add("hidden");
        iconeEditar?.classList.remove("hidden");
      }
    });
  }

  // ================== INICIALIZAÇÃO ==================
  carregarPerfil();
  ["nome", "email", "senha"].forEach(campo => configurarEdicao(campo));

  // ================== DELETAR CONTA ==================
const btnDeletar = document.getElementById("btnDeletarConta");

btnDeletar.addEventListener("click", async () => {
  const confirmar = confirm("Tem certeza que deseja deletar sua conta? Essa ação não poderá ser desfeita.");
  if (!confirmar) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Usuário não autenticado. Faça login novamente.");
    window.location.href = "../login/login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/delete", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (data.success) {
      alert("Até logo 👋");
      localStorage.removeItem("token");
      window.location.href = "../telaInicial/tela.html";
    } else {
      alert(data.message || "Erro ao deletar conta.");
    }
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    alert("Erro ao conectar com o servidor.");
  }
});

  // ================== Fale Conosco ==================
  const formFale = document.getElementById("formFale");
  if (formFale) {
    formFale.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(formFale);
      const dados = {
        nome: formData.get("nome"),
        email: formData.get("email"),
        assunto: formData.get("assunto"),
        mensagem: formData.get("mensagem")
      };
      if (!dados.nome || !dados.email || !dados.assunto || !dados.mensagem) {
        mostrarMensagem("Preencha todos os campos.", "error");
        return;
      }

      try {
        mostrarLoading(formFale);
        const res = await fetch("http://localhost:5000/api/contato", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        });
        const result = await res.json();
        if (result.success) {
          mostrarMensagem(result.message, "success");
          formFale.reset();
        } else {
          mostrarMensagem(result.message || "Erro ao enviar.", "error");
        }
      } catch {
        mostrarMensagem("Erro de conexão.", "error");
      } finally {
        removerLoading(formFale);
      }
    });
  }

  // ================== Solicitação de Livro ==================
  const formSolicitacao = document.getElementById("formSolicitacao");
  if (formSolicitacao) {
    formSolicitacao.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(formSolicitacao);
      const dados = {
        titulo: formData.get("titulo"),
        autor: formData.get("autor"),
        editora: formData.get("editora"),
        ano: formData.get("ano")
      };
      if (!dados.titulo || !dados.autor) {
        mostrarMensagem("Título e autor são obrigatórios.", "error");
        return;
      }

      try {
        mostrarLoading(formSolicitacao);
        const res = await fetch("http://localhost:5000/api/solicitacao-livro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        });
        const result = await res.json();
        if (result.success) {
          mostrarMensagem(result.message, "success");
          formSolicitacao.reset();
        } else {
          mostrarMensagem(result.message || "Erro ao enviar.", "error");
        }
      } catch {
        mostrarMensagem("Erro de conexão.", "error");
      } finally {
        removerLoading(formSolicitacao);
      }
    });
  }

  // ================== Funções auxiliares ==================
  function mostrarMensagem(texto, tipo) {
    document.querySelectorAll(".mensagem-flutuante").forEach(m => m.remove());
    const div = document.createElement("div");
    div.className = `mensagem-flutuante fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      tipo === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    }`;
    div.textContent = texto;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }

  function mostrarLoading(form, texto = "Enviando...") {
    const botao = form.querySelector('button[type="submit"]');
    botao.dataset.originalText = botao.textContent;
    botao.innerHTML = `<div class="flex items-center justify-center gap-2">
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      ${texto}
    </div>`;
    botao.disabled = true;
  }

  function removerLoading(form) {
    const botao = form.querySelector('button[type="submit"]');
    botao.innerHTML = botao.dataset.originalText;
    botao.disabled = false;
  }
});
