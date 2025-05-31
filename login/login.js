  // ABRIR MODAL DE CADASTRO
  function openRegisterModal() {
    $('#registerModal').css('display', 'flex');
  }

  // ABRIR MODAL DE RECUPERAÇÃO DE SENHA
  function openModal() {
    $('#forgotPasswordModal').css('display', 'flex');
  }

  // ABRIR MODAL DE LOGIN ADMIN
  function openAdminModal() {
    $('#adminLoginModal').css('display', 'flex');
  }

  $(document).ready(function () {

    // 1. CADASTRO DE USUÁRIO

    // Fechar o modal de cadastro
    $('#closeRegisterModal').click(function () {
      $('#registerModal').hide();
      $('#registerMessage').text('');
    });

    // Máscara para CPF no cadastro
    $('#registerCPF').on('input', function () {
      this.value = this.value.replace(/\D/g, '');
    });

    // Validação e simulação de cadastro
    $('#submitRegister').click(function () {
      const name = $('#registerName').val().trim();
      const email = $('#registerEmail').val().trim();
      const cpf = $('#registerCPF').val().trim();
      const birthdate = $('#registerBirthdate').val();
      const password = $('#registerPassword').val();
      const $message = $('#registerMessage');

      if (!name || !email || !cpf || !birthdate || !password) {
        $message.text('Por favor, preencha todos os campos.').css('color', 'red');
        return;
      }

      if (cpf.length !== 11 || !email.includes('@') || password.length < 6) {
        $message.text('Verifique se os dados estão corretos.').css('color', 'red');
        return;
      }

      $message.text('Cadastro realizado com sucesso!').css('color', 'green');

      setTimeout(() => {
        $('#registerModal').hide();
      }, 2000);
    });

    // 2. RECUPERAÇÃO DE SENHA

    // Fechar o modal de recuperação de senha
    $('#closeModal').click(function () {
      $('#forgotPasswordModal').hide();
      $('#initialForm').show();
      $('#newPasswordForm').hide();
      $('#statusMessage').text('');
    });

    // Máscara para CPF no formulário
    $('#cpf').on('input', function () {
      this.value = this.value.replace(/\D/g, '');
    });

    // Verificar dados (e-mail + CPF)
    $('#verifyData').click(function () {
      const cpf = $('#cpf').val();
      const email = $('#modalEmail').val();
      const $message = $('#statusMessage');

      if (cpf.length !== 11 || !email.includes('@')) {
        $message.text('Por favor, preencha todos os campos corretamente').css('color', 'red');
        return;
      }

      setTimeout(function () {
        $('#initialForm').hide();
        $('#newPasswordForm').show();
        $message.text('Dados verificados com sucesso! Agora defina sua nova senha.').css('color', '#1B4965');
      }, 1000);
    });

    // Trocar a senha
    $('#changePassword').click(function () {
      const newPassword = $('#newPassword').val();
      const confirmPassword = $('#confirmPassword').val();
      const $message = $('#statusMessage');

      if (newPassword.length < 6) {
        $message.text('A senha deve ter pelo menos 6 caracteres').css('color', 'red');
        return;
      }

      if (newPassword !== confirmPassword) {
        $message.text('As senhas não coincidem').css('color', 'red');
        return;
      }

      setTimeout(function () {
        $message.text('Senha alterada com sucesso! Você será redirecionado para o login.').css('color', 'green');
        setTimeout(function () {
          window.location.href = 'login.html';
        }, 2000);
      }, 1000);
    });

    // 3. LOGIN DE ADMINISTRADOR

    // Fechar modal de admin
    $('#closeAdminModal').click(function () {
      $('#adminLoginModal').hide();
      $('#adminLoginMessage').text('');
    });

    // Validar login de admin
    $('#adminLoginBtn').click(function () {
      const email = $('#adminEmail').val().trim();
      const password = $('#adminPassword').val();
      const $message = $('#adminLoginMessage');

      if (!email || !password) {
        $message.text('Preencha todos os campos.').css('color', 'red');
        return;
      }

      if (!email.includes('@') || password.length < 6) {
        $message.text('E-mail ou senha inválidos.').css('color', 'red');
        return;
      }

      $message.text('Login realizado com sucesso!').css('color', 'green');

      setTimeout(() => {
        $('#adminLoginModal').hide();
        window.location.href = 'admin-dashboard.html'; // substitua conforme necessário
      }, 2000);
    });

  });