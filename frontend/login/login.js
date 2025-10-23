// =======================
// FUNÇÕES DE ABRIR MODAIS
// =======================
function openRegisterModal() {
  document.getElementById('registerModal').classList.remove('hidden');
}

function openModal() {
  document.getElementById('forgotPasswordModal').classList.remove('hidden');
}

// =======================
// FUNÇÕES DE FECHAR MODAIS
// =======================
function closeModal(modalId, clearInputs = true) {
  const modal = document.getElementById(modalId);
  modal.classList.add('hidden');

  if (clearInputs) {
    modal.querySelectorAll('input').forEach(input => input.value = '');
    modal.querySelectorAll('.message').forEach(msg => msg.textContent = '');
  }

  if (modalId === 'forgotPasswordModal') {
    document.getElementById('initialForm').classList.remove('hidden');
    document.getElementById('newPasswordForm').classList.add('hidden');
  }
}

// =======================
// CADASTRO DE USUÁRIO
// =======================
document.getElementById('submitRegister').addEventListener('click', () => {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const cpf = document.getElementById('registerCPF').value.trim();
  const birthdate = document.getElementById('registerBirthdate').value;
  const password = document.getElementById('registerPassword').value;
  const messageEl = document.getElementById('registerMessage');

  if (!name || !email || !cpf || !birthdate || !password) {
    messageEl.textContent = 'Por favor, preencha todos os campos.';
    messageEl.style.color = 'red';
    return;
  }

  if (cpf.length !== 11 || !email.includes('@') || password.length < 6) {
    messageEl.textContent = 'Verifique se os dados estão corretos.';
    messageEl.style.color = 'red';
    return;
  }

  messageEl.textContent = 'Cadastro realizado com sucesso!';
  messageEl.style.color = 'green';

  setTimeout(() => closeModal('registerModal'), 2000);
});

// Máscara de CPF
document.getElementById('registerCPF').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

// =======================
// RECUPERAÇÃO DE SENHA
// =======================

// Botão "Verificar Dados" (simulação)
document.getElementById('verifyData').addEventListener('click', () => {
  const email = document.getElementById('modalEmail').value.trim();
  const messageEl = document.getElementById('statusMessage');

  if (!email || !email.includes('@')) {
    messageEl.textContent = 'Digite um e-mail válido';
    messageEl.style.color = 'red';
    return;
  }

  // Simulação: mostra o formulário de nova senha
  document.getElementById('initialForm').classList.add('hidden');
  document.getElementById('newPasswordForm').classList.remove('hidden');
  messageEl.textContent = '';
});

// Botão "Alterar Senha"
document.getElementById('changePassword').addEventListener('click', () => {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const messageEl = document.getElementById('statusMessage');

  if (newPassword.length < 6) {
    messageEl.textContent = 'A senha deve ter pelo menos 6 caracteres';
    messageEl.style.color = 'red';
    return;
  }

  if (newPassword !== confirmPassword) {
    messageEl.textContent = 'As senhas não coincidem';
    messageEl.style.color = 'red';
    return;
  }

  setTimeout(() => {
    messageEl.textContent = 'Senha alterada com sucesso! Você será redirecionado para o login.';
    messageEl.style.color = 'green';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  }, 1000);
});

// =======================
// LOGIN DE USUÁRIO
// =======================

const loginButton = document.getElementById('loginButton');

loginButton.addEventListener('click', (e) => {
  e.preventDefault(); // evita que o formulário faça submit e recarregue a página

  // Pega os valores dos inputs
  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senha').value;

  // Elemento para mensagens
  const messageEl = document.getElementById('loginMessage') || document.createElement('div');
  messageEl.id = 'loginMessage';
  loginButton.parentNode.appendChild(messageEl);

  messageEl.style.textAlign = 'center';

  // Validações básicas
  if (!email || !senha) {
    messageEl.textContent = 'Por favor, preencha todos os campos.';
    messageEl.style.color = 'red';
    return;
  }

  if (!email.includes('@') || senha.length < 6) {
    messageEl.textContent = 'E-mail ou senha inválidos.';
    messageEl.style.color = 'red';
    return;
  }

  // Se passou na validação
  messageEl.textContent = 'Login realizado com sucesso!';
  messageEl.style.color = 'green';

});


// =======================
// BOTÕES DE FECHAR MODAIS
// =======================
document.getElementById('closeRegisterModal').addEventListener('click', () => closeModal('registerModal'));
document.getElementById('closeModal').addEventListener('click', () => closeModal('forgotPasswordModal'));
