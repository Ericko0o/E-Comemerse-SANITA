let todosLosProductos = [];

async function obtenerProductos() {
  try {
    const respuesta = await fetch('/api/productos');
    todosLosProductos = await respuesta.json();

    inicializarTabs();
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
}

function inicializarTabs() {
  const tabs = document.querySelectorAll(".tab");
  let primeraTabActiva = null;

  tabs.forEach(tab => {
    if (tab.classList.contains("active")) {
      primeraTabActiva = tab;
    }

    tab.addEventListener("click", () => {
      mostrarCategoria(tab.dataset.categoria, tab);
    });
  });

  if (!primeraTabActiva && tabs.length > 0) {
    primeraTabActiva = tabs[0];
    primeraTabActiva.classList.add("active");
  }

  if (primeraTabActiva) {
    mostrarCategoria(primeraTabActiva.dataset.categoria, primeraTabActiva);
  }
}

function mostrarCategoria(categoria, tabElement) {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";

  const productosFiltrados = todosLosProductos.filter(prod => prod.categoria === categoria);

  const idsAgregados = new Set();

  productosFiltrados.forEach(prod => {
    if (!idsAgregados.has(prod.id)) {
      idsAgregados.add(prod.id);

      contenedor.innerHTML += `
        <a href="/producto.html?id=${prod.id}" class="producto">
          <img src="/img/${prod.imagen.split('/').pop()}" alt="${prod.nombre}">
          <div class="producto-info">
            ${prod.nombre}
            <span class="precio">S/.${prod.precio}</span>
          </div>
        </a>`;
    }
  });

  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  if (tabElement) tabElement.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  obtenerProductos();
});
