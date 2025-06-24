// --- Funciones globales ---
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

// ✅ Función global para obtener el rol del usuario actual
window.obtenerRolUsuario = async function () {
  try {
    const res = await fetch('/usuario');
    const data = await res.json();
    if (data.logueado && data.usuario.rol) {
      return data.usuario.rol;
    }
    return "normal";
  } catch (e) {
    console.error("Error obteniendo rol:", e);
    return "normal";
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("navbar-placeholder");

  // Detectar si hay sesión activa
  let logueado = false;
  let nombre = '';
  let imagen = '';
  let rol = '';

  try {
    const res = await fetch('/usuario');
    const data = await res.json();
    if (data.logueado) {
      logueado = true;
      nombre = data.usuario.nombre;
      imagen = data.usuario.imagen || 'img/usuario.jpg';
      rol = data.usuario.rol || 'normal';
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

      <div class="menu-toggle" id="menu-toggle">☰</div>

      <nav>
        <ul class="nav-links" id="nav-links">
          <li><a href="inicio.html" class="${window.location.pathname.includes('inicio.html') ? 'active' : ''}">Inicio</a></li>
          <li><a href="catalogo.html" class="${window.location.pathname.includes('catalogo.html') ? 'active' : ''}">Catálogo</a></li>
          <li><a href="comunidad.html" class="${window.location.pathname.includes('comunidad.html') ? 'active' : ''}">Comunidad</a></li>
          <li><a href="noticias.html" class="${window.location.pathname.includes('noticias.html') ? 'active' : ''}">Noticias</a></li>
          ${userHTML}
        </ul>
      </nav>
    </header>
  `;

  // Activar evento para mostrar/ocultar menú responsive
  const toggleButton = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  toggleButton.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  document.dispatchEvent(new Event("navbar-ready"));
});

// --- Búsqueda de plantas ---
document.addEventListener('navbar-ready', () => {
  const input = document.querySelector('.search-box');
  if (!input) return;

  const resultBox = document.createElement('div');
  resultBox.className = 'search-results';
  document.body.appendChild(resultBox);

  input.addEventListener('input', async () => {
    const q = input.value.trim();
    if (q.length === 0) {
      resultBox.innerHTML = '';
      resultBox.style.display = 'none';
      return;
    }

    try {
      const res = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      resultBox.innerHTML = data.map(planta => `
        <div class="search-item" onclick="window.location.href='informacion.html?id=${planta.id}'">
          <img src="${planta.imagen}" alt="${planta.nombre}" />
          <span>${planta.nombre}</span>
        </div>
      `).join('');

      resultBox.style.display = 'block';
      const rect = input.getBoundingClientRect();
      resultBox.style.left = `${rect.left}px`;
      resultBox.style.top = `${rect.bottom + window.scrollY}px`;
      resultBox.style.width = `${input.offsetWidth}px`;
    } catch (e) {
      console.error('Error en la búsqueda:', e);
      resultBox.innerHTML = '';
      resultBox.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!resultBox.contains(e.target) && e.target !== input) {
      resultBox.style.display = 'none';
    }
  });
});
