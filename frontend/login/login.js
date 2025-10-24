// ======================= LOGIN =======================
async function loginUser() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Login realizado com sucesso!");
      window.location.href = "./home/home.html"; // redireciona
    } else {
      alert(data.message || "E-mail ou senha incorretos!");
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao conectar ao servidor. Tente novamente mais tarde.");
  }
}

// ======================= CADASTRO =======================
async function registerUser() {
  const nome = document.getElementById("nomeCadastro").value.trim();
  const email = document.getElementById("emailCadastro").value.trim();
  const senha = document.getElementById("senhaCadastro").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Cadastro realizado com sucesso!");
      closeRegisterModal(); // fecha modal após cadastro
    } else {
      alert(data.message || "Erro ao cadastrar usuário.");
    }
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao conectar ao servidor. Tente novamente mais tarde.");
  }
}

// ======================= MODAL =======================
function openRegisterModal() {
  document.getElementById("registerModal").style.display = "flex";
}

function closeRegisterModal() {
  document.getElementById("registerModal").style.display = "none";
}
