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
            <li><a href="inicio.html" class="active">Inicio</a></li>
            <li><a href="catalogo.html">Catálogo</a></li>
            <li><a href="comunidad.html">Comunidad</a></li>
            <li><input type="text" placeholder="🔍 Search" class="search-box"/></li>
          </ul>
        </nav>
      </header>
    `;
  });
  