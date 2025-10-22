document.addEventListener("DOMContentLoaded", () => {
  // === Controle das abas ===
  const tabs = document.querySelectorAll(".tab-link");
  const contents = document.querySelectorAll(".tab-content");

  // Função pra ativar uma aba específica
  function ativarAba(tabId) {
    tabs.forEach(b => b.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add("active");
    document.getElementById(tabId)?.classList.add("active");
  }

  // Ao clicar em uma aba
  tabs.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const tabId = btn.dataset.tab;
      ativarAba(tabId);
    });
  });

  // Sempre que a página carregar ou recarregar, ativa "Meus Dados"
  ativarAba("dados");

  // === Form de Meus Dados ===
  const formDados = document.getElementById("formDados");
  if (formDados) {
    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const telefone = document.getElementById("telefone");
    const senha = document.getElementById("senha");

    // carregar dados salvos
    const user = JSON.parse(localStorage.getItem("perfilUsuario")) || {};
    nome.value = user.nome || "";
    email.value = user.email || "";
    telefone.value = user.telefone || "";
    senha.value = user.senha || "";

    // salvar alterações
    formDados.addEventListener("submit", e => {
      e.preventDefault();

      const novoNome = nome.value.trim();
      const novoEmail = email.value.trim();
      const novoTelefone = telefone.value.trim();
      const novaSenha = senha.value.trim();

      if (novoNome) user.nome = novoNome;
      if (novoEmail) user.email = novoEmail;
      if (novoTelefone) user.telefone = novoTelefone;
      if (novaSenha) user.senha = novaSenha;

      localStorage.setItem("perfilUsuario", JSON.stringify(user));
      
    });
  }

  // === Forms de Fale Conosco e Solicitação de Livro ===
  document.querySelectorAll("#formFale, #formSolicitacao").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      
      form.reset();
    });
  });
});
