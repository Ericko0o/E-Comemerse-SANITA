document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/usuario");
    const data = await res.json();

    if (!data.logueado) {
      window.location.href = "login.html";
      return;
    }

    const { nombre, correo, imagen } = data.usuario;

    let imagenUrl = imagen || "img/usuario.png";
    if (!imagenUrl.startsWith("http") && !imagenUrl.startsWith("/")) {
      imagenUrl = "img/" + imagenUrl.replace(/^img[\/\\]/, '');
    }

    document.getElementById("nombre").value = nombre;
    document.getElementById("correo").value = correo;
    document.getElementById("imagen").value = imagen;
    document.getElementById("imagen-perfil").src = imagenUrl;
  } catch (err) {
    console.error("Error al cargar perfil:", err);
  }
});

async function actualizarPerfil() {
  const nombre = document.getElementById("nombre").value.trim();
  const imagen = document.getElementById("imagen").value.trim();
  const status = document.getElementById("status-msg");

  status.textContent = "";

  try {
    const res = await fetch("/usuario/actualizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, imagen })
    });

    const data = await res.json();

    if (res.ok) {
      status.style.color = "lightgreen";
      status.textContent = "Datos actualizados correctamente.";

      let imagenUrl = imagen || "img/usuario.png";
      if (!imagenUrl.startsWith("http") && !imagenUrl.startsWith("/")) {
        imagenUrl = "img/" + imagenUrl.replace(/^img[\/\\]/, '');
      }

      document.getElementById("imagen-perfil").src = imagenUrl;
    } else {
      status.style.color = "salmon";
      status.textContent = data.error || "Error al actualizar.";
    }
  } catch (err) {
    console.error("Error de red:", err);
    status.textContent = "Error de red.";
  }
}
