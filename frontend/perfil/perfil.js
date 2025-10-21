document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-link");
    const contents = document.querySelectorAll(".tab-content");
  
    tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        tabs.forEach(b => b.classList.remove("active"));
        contents.forEach(c => c.classList.remove("active"));
  
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
      });
    });
  
    // Salvar dados (exemplo usando localStorage)
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
  
      formDados.addEventListener("submit", e => {
        e.preventDefault();
        const novo = {
          nome: nome.value,
          email: email.value,
          telefone: telefone.value,
          senha: senha.value
        };
        localStorage.setItem("perfilUsuario", JSON.stringify(novo));
        alert("Dados atualizados com sucesso!");
      });
    }
  
    // Forms fale conosco e solicitação (simulação de envio)
    document.querySelectorAll("#formFale, #formSolicitacao").forEach(form => {
      form.addEventListener("submit", e => {
        e.preventDefault();
        alert("Mensagem enviada com sucesso!");
        form.reset();
      });
    });
  });
  