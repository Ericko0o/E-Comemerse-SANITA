let todosLosProductos = [];

async function obtenerProductos() {
  try {
    const respuesta = await fetch('/api/productos');
    todosLosProductos = await respuesta.json();

    // Usamos el primer tab como default si no hay ninguno activo
    const tabActiva = document.querySelector(".tab.active") || document.querySelector(".tab");
    const categoriaInicial = tabActiva?.dataset.categoria || 'cicatrizantes';
    mostrarCategoria(categoriaInicial, tabActiva);
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
}

function mostrarCategoria(categoria, tabElement) {
  console.log("Mostrando categoría:", categoria);

  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";

  const productosFiltrados = todosLosProductos.filter(prod => prod.categoria === categoria);

  productosFiltrados.forEach(prod => {
    contenedor.innerHTML += `
      <a href="/producto.html?id=${prod.id}" class="producto">
        <img src="/img/${prod.imagen.split('/').pop()}" alt="${prod.nombre}">
        <div class="producto-info">
          ${prod.nombre}
          <span class="precio">S/.${prod.precio}</span>
        </div>
      </a>`;
  });

  // Actualizar el estilo de la pestaña activa
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  if (tabElement) {
    tabElement.classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Asignar eventos a las pestañas
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const categoria = tab.dataset.categoria;
      mostrarCategoria(categoria, tab);
    });
  });

  obtenerProductos();
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/usuario');
    const data = await res.json();

    if (data.logueado && data.usuario.rol === 'proveedor') {
      document.getElementById('boton-agregar-planta').style.display = 'block';
    }
  } catch (e) {
    console.error("Error verificando rol de usuario:", e);
  }
});
