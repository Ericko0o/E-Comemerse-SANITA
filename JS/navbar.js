// navbar.js
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = false; // Esto se debe cambiar dinámicamente luego con fetch('/usuario')

const userHTML = `
<li class="user-menu">
  <img src="img/usuario.png" alt="Perfil" class="user-icon" onclick="toggleMenu()">
  <div id="user-dropdown" class="user-dropdown hidden">
    <div onclick="abrirPerfil()">👤 Perfil</div>
    <div onclick="cerrarSesion()">Cerrar sesión</div>
  </div>
</li>`;


  document.getElementById("navbar-placeholder").innerHTML = `
    <header class="navbar">
      <div class="logo">
        <img src="img/logo-rana.png" alt="Sanita Logo">
        <span>Sanita</span>
      </div>
      
      <div class="search-box-container">
        <input type="text" placeholder="🔍 Buscar plantas medicinales..." class="search-box"/>
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

window.toggleMenu = function () {
  document.getElementById("user-dropdown").classList.toggle("hidden");
};

window.abrirPerfil = function () {
  alert("Aquí abrirás el panel para cambiar nombre e imagen (lo agregamos en el siguiente paso).");
};

window.cerrarSesion = function () {
  fetch('/logout')
    .then(() => location.reload());
};