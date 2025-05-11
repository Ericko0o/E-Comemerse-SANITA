document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("navbar-placeholder");

  // Detectar si hay sesión activa
  let logueado = false;
  let nombre = '';
  let imagen = '';

  try {
    const res = await fetch('/usuario');
    const data = await res.json();
    if (data.logueado) {
      logueado = true;
      nombre = data.usuario.nombre;
      imagen = data.usuario.imagen || 'img/usuario.jpg';
    }
  } catch (err) {
    console.error('Error al verificar sesión:', err);
  }

  const userHTML = logueado
    ? `
    <li class="user-menu">
      <img src="${imagen}" alt="Perfil" class="user-icon" onclick="toggleMenu()">
      <div id="user-dropdown" class="user-dropdown hidden">
        <div onclick="irPerfil()">👤 Perfil</div>
        <div onclick="cerrarSesion()">Cerrar sesión</div>
      </div>
    </li>`
    : `<li><a href="login.html" onclick="guardarRutaActual()">Login</a></li>`;

  placeholder.innerHTML = `
    <header class="navbar">
      <div class="logo">
        <img src="img/logo-rana.png" alt="Sanita Logo">
        <span>Sanita</span>
      </div>

      <div class="search-box-container">
        <input type="text" placeholder="🔍 Buscar plantas..." class="search-box"/>
      </div>

      <nav>
        <ul class="nav-links">
          <li><a href="inicio.html" class="${window.location.pathname.includes('inicio.html') ? 'active' : ''}">Inicio</a></li>
          <li><a href="catalogo.html" class="${window.location.pathname.includes('catalogo.html') ? 'active' : ''}">Catálogo</a></li>
          <li><a href="comunidad.html" class="${window.location.pathname.includes('comunidad.html') ? 'active' : ''}">Comunidad</a></li>
          <li><a href="noticias.html" class="${window.location.pathname.includes('noticias.html') ? 'active' : ''}">Noticias</a></li>
          ${userHTML}
        </ul>
      </nav>
    </header>
  `;
});

// Funciones globales (usadas en HTML dinámico)
window.toggleMenu = function () {
  document.getElementById("user-dropdown").classList.toggle("hidden");
};

window.irPerfil = function () {
  window.location.href = "perfil.html";
};

window.cerrarSesion = function () {
  fetch('/logout')
    .then(() => {
      localStorage.removeItem('ruta-previa');
      window.location.href = window.location.pathname;
    });
};

window.guardarRutaActual = function () {
  localStorage.setItem("ruta-previa", window.location.pathname);
};
