let todosLosProductos = [];

async function obtenerProductos() {
  try {
    const respuesta = await fetch('/api/productos');
    todosLosProductos = await respuesta.json();
    mostrarCategoria('cicatrizantes', document.querySelector(".tab.active"));
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
}

function mostrarCategoria(categoria, tabElement) {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";

  const productosFiltrados = todosLosProductos.filter(prod => prod.categoria === categoria);

  productosFiltrados.forEach(prod => {
    contenedor.innerHTML += `
      <div class="producto">
        <img src="/img/${prod.imagen.split('/').pop()}" alt="${prod.nombre}">
        <div class="producto-info">
          ${prod.nombre}
          <span class="precio">S/.${prod.precio}</span>
        </div>
      </div>`;
  });

  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  tabElement.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  obtenerProductos();
});
