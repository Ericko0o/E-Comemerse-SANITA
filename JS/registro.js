async function registrarUsuario() {
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const imagen = document.getElementById("imagen").value.trim() || "img/usuario.png";
  const codigoRol = document.getElementById("codigo-rol").value.trim().toLowerCase();
  const status = document.getElementById("status-msg");

  status.textContent = "";

  if (!nombre || !correo || !contrasena) {
    status.textContent = "Por favor completa todos los campos requeridos.";
    return;
  }

  try {
    const res = await fetch('/registrar', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, contrasena, imagen, codigoRol })
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
}