document.getElementById("registro-formulario").addEventListener("submit", async function (e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const confirmar = document.getElementById("confirmar-contrasena").value.trim();
  const imagenFile = document.getElementById("imagen").files[0];
  const codigoRol = document.getElementById("codigo-rol").value.trim().toLowerCase();
  const status = document.getElementById("status-msg");

  status.textContent = "";
  status.style.color = "salmon";

  // Validación de campos obligatorios
  if (!nombre || !correo || !contrasena || !confirmar) {
    status.textContent = "Por favor completa todos los campos requeridos.";
    return;
  }

  // Validación de correo válido
  if (!validarCorreo(correo)) {
    status.textContent = "Correo no válido o dominio no reconocido.";
    return;
  }

  // Verificar si las contraseñas coinciden
  if (contrasena !== confirmar) {
    status.textContent = "Las contraseñas no coinciden.";
    return;
  }

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("correo", correo);
  formData.append("contrasena", contrasena);
  formData.append("codigoRol", codigoRol);
  if (imagenFile) {
    formData.append("imagen", imagenFile);
  }

  try {
    const res = await fetch('/registrar-con-imagen', {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      status.style.color = "lightgreen";
      status.textContent = "¡Registro exitoso! Redirigiendo...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      status.textContent = data.error || "Error al registrar.";
    }
  } catch (err) {
    console.error("Error de red:", err);
    status.textContent = "Error de red.";
  }
});

// Mostrar u ocultar contraseña
document.getElementById("toggle-visibility").addEventListener("click", () => {
  const pass1 = document.getElementById("contrasena");
  const pass2 = document.getElementById("confirmar-contrasena");
  const tipo = pass1.type === "password" ? "text" : "password";
  pass1.type = tipo;
  pass2.type = tipo;
});

// ✅ Función para validar formato y dominio del correo
function validarCorreo(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(correo)) return false;

  const dominio = correo.split('@')[1];
  const dominiosConocidos = [
    "gmail.com", "hotmail.com", "outlook.com",
    "yahoo.com", "icloud.com", "ucsp.edu.pe"
  ];
  return dominiosConocidos.includes(dominio.toLowerCase());
}
