//Login y Registro

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("loginForm")) {
    handleLoginForm();
  }

  if (document.getElementById("registerForm")) {
    handleRegisterForm();
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");

  togglePassword.addEventListener("click", function () {
    // Cambiar el tipo del campo de contraseña
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;

    // Cambiar el ícono del botón dependiendo del estado
    const icon = togglePassword.querySelector("i");
    if (type === "password") {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  });
});

function handleLoginForm() {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const correo = document.getElementById("correo").value;
    const contraseña = document.getElementById("password").value;

    if (!validateEmail(correo)) {
      displayMessage("registerMessage", "Por favor, ingresa un correo electrónico válido.");
      return;
    }
if(contraseña == null)
{
  displayMessage("registerMessage", "Por favor, ingresa una contraseña.");
}
    const data = { correo, contraseña };
    const result = await sendRequest("https://localhost:7113/api/usuarios/validar", data);
    console.log(result);
  if(result.idUsuario >= 1 && result.rol == 1)
  {
    displayMessage("registerMessage", "Bienvenido");
    localStorage.setItem("idUsuario", result.idUsuario);
    setTimeout(() => window.location.href = "../InterfazTareas/PanelUsuarios.html", 2000);
  }
    else if (result.idUsuario >= 1 && result.rol == 2 ) {
      displayMessage("registerMessage", "Bienvenido Admin");
      localStorage.setItem("idUsuario", result.idUsuario);
      setTimeout(() => window.location.href = "../InterfazTareas/PanelAdmin.html", 2000);
    } else {
      displayMessage("registerMessage", "Usuario o contraseña incorrectos.");
    }
  });
}

function handleRegisterForm() {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const nombre = document.getElementById("registerName").value;
    const correo = document.getElementById("registerCorreo").value;
    const contraseña = document.getElementById("registerPassword").value;
    const confirmClave = document.getElementById("confirmPassword").value;
    const rol = false;

    if (!validateEmail(correo)) {
      displayMessage("registerMessage", "Por favor, ingresa un correo electrónico válido.");
       // Desaparecer el mensaje después del tiempo especificado :)
  setTimeout(() => {
    element.innerText = '';
  }, duration)
      return;
    }

    if (!validatePassword(contraseña)) {
      displayMessage("registerMessage", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (contraseña !== confirmClave) {
      displayMessage("registerMessage", "Las contraseñas no coinciden.");
      return;
    }

    const data = {nombre, correo, contraseña, rol };
    const result = await sendRequest("https://localhost:7113/api/usuarios", data);

    if (result == 1) {
      alert("Registro exitoso");
      window.location.href = "Login.html";
    } else if (result == 2) {
      displayMessage("registerMessage", "Este correo ya está registrado.");
     
    } else {
      displayMessage("registerMessage", "Error al registrarse.");
    }
  });
}

function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailPattern.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

async function sendRequest(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return response.json();
}

function displayMessage(elementId, message, duration = 2000) {
  const element = document.getElementById(elementId);
  element.innerText = message;

  setTimeout(() => {
    element.innerText = '';
  }, duration);
}

