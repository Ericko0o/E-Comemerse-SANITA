// ------------------ catalogo.js (corregido y limpio) ------------------ //

async function mostrarCategoria(categoria, tabElement) {
  try {
    console.log("📦 Mostrando categoría:", categoria);

    const res = await fetch(`/api/productos/categoria/${categoria}`);
    const productos = await res.json();

    const contenedor = document.getElementById("productos-container");
    contenedor.innerHTML = "";

    if (productos.length === 0) {
      contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
      return;
    }

    productos.forEach(prod => {
      contenedor.innerHTML += `
        <a href="/producto.html?id=${prod.id}" class="producto">
          <img src="/img/${prod.imagen.split('/').pop()}" alt="${prod.nombre}">
          <div class="producto-info">
            ${prod.nombre}
            <span class="precio">S/.${prod.precio}</span>
          </div>
        </a>`;
    });

    // Actualizar tab activa
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    if (tabElement) tabElement.classList.add("active");

  } catch (error) {
    console.error("Error mostrando categoría:", error);
  }
}

// Verificar si es proveedor
async function verificarProveedor() {
  try {
    const res = await fetch('/usuario');
    const data = await res.json();

    if (data.logueado && data.usuario.rol === 'proveedor') {
      const boton = document.getElementById('boton-agregar-planta');
      if (boton) boton.style.display = 'block';
    }
  } catch (e) {
    console.error("Error verificando rol:", e);
  }
}

// Inicialización al cargar
document.addEventListener("DOMContentLoaded", () => {
  // Evento tabs
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const categoria = tab.dataset.categoria;
      mostrarCategoria(categoria, tab);
    });
  });

  // Cargar primera categoría
  const tabActiva = document.querySelector(".tab.active") || document.querySelector(".tab");
  const categoriaInicial = tabActiva?.dataset.categoria || 'cicatrizantes';
  mostrarCategoria(categoriaInicial, tabActiva);

  verificarProveedor();
});