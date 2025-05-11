async function iniciarSesion() {
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const errorMsg = document.getElementById("error-msg");

  errorMsg.textContent = "";

  if (!correo || !contrasena) {
    errorMsg.textContent = "Todos los campos son obligatorios.";
    return;
  }

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    const data = await res.json();

    if (res.ok) {
      const volverA = localStorage.getItem("ruta-previa") || "inicio.html";
      localStorage.removeItem("ruta-previa");
      window.location.href = volverA;
    } else {
      errorMsg.textContent = data.error || "Error al iniciar sesión.";
    }

  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    errorMsg.textContent = "Error de red. Intenta de nuevo.";
  }
}
