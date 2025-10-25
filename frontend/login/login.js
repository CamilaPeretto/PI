// frontend/login/login.js (trecho relevante)

// LOGIN
async function loginUser() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) { alert("Preencha todos os campos!"); return; }

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const data = await response.json();
    if (data.success) {
  localStorage.setItem('token', data.token);

  if (data.role === 'admin') {
    window.location.href = "../admin/admin.html";
  } else {
    window.location.href = "../home/home.html";
  }

    } else {
      alert(data.message || "Erro ao fazer login.");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro ao conectar ao servidor.");
  }
}

// REGISTER
async function registerUser() {
  const nome = document.getElementById("nomeCadastro").value.trim();
  const email = document.getElementById("emailCadastro").value.trim();
  const cpf = document.getElementById("cpfCadastro").value.trim();
  const nascimento = document.getElementById("dataNascimentoCadastro").value; // data ISO
  const senha = document.getElementById("senhaCadastro").value.trim();
  const confirmSenha = document.getElementById("confirmSenhaCadastro").value.trim();

  if (!nome || !email || !cpf || !nascimento || !senha || !confirmSenha) {
    alert("Preencha todos os campos!");
    return;
  }
  if (senha !== confirmSenha) { alert("As senhas não coincidem!"); return; }

  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, cpf, nascimento, senha }),
    });
    const data = await response.json();
    if (data.success) {
      alert("Cadastro realizado com sucesso!");
      closeRegisterModal();
    } else {
      alert(data.message || "Erro ao cadastrar usuário.");
    }
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao conectar ao servidor. Tente novamente mais tarde.");
  }
}

// modal helpers - coloque dentro de <script> ou no seu login.js

  const modal = document.getElementById("registerModal");
  const openBtn = document.querySelector('[onclick="openRegisterModal()"]'); // seu link que chama openRegisterModal()
  const closeBtn = document.getElementById("closeRegisterModal");

  window.openRegisterModal = function() {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    // opcional: lock scroll
    document.documentElement.style.overflow = "hidden";
  };

  window.closeRegisterModal = function() {
    modal.classList.add("hidden");
    modal.style.display = "none";
    document.documentElement.style.overflow = "";
  };

  if (closeBtn) closeBtn.addEventListener("click", closeRegisterModal);

  // fechar clicando no backdrop
  modal.addEventListener("click", (ev) => {
    if (ev.target === modal) closeRegisterModal();
  });

  // fechar com ESC
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeRegisterModal();
  });

