// navbar.js
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("navbar-placeholder").innerHTML = `
      <header class="navbar">
        <div class="logo">
          <img src="img/logo-rana.png" alt="Sanita Logo">
          <span>Sanita</span>
        </div>
        <nav>
          <ul class="nav-links">
            <li><a href="inicio.html" class="${window.location.pathname.includes('inicio.html') ? 'active' : ''}">Inicio</a></li>
            <li><a href="catalogo.html" class="${window.location.pathname.includes('catalogo.html') ? 'active' : ''}">Catálogo</a></li>
            <li><a href="comunidad.html" class="${window.location.pathname.includes('comunidad.html') ? 'active' : ''}">Comunidad</a></li>
            <li><a href="noticias.html" class="${window.location.pathname.includes('noticias.html') ? 'active' : ''}">Noticias</a></li> <!-- Nueva pestaña de Noticias -->
            <li><input type="text" placeholder="🔍 Search" class="search-box"/></li>
          </ul>
        </nav>
      </header>
    `;
  });
  