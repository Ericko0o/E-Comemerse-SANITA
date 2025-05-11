async function obtenerProductoPorId(id) {
  try {
    const res = await fetch(`/api/productos/${id}`);
    if (!res.ok) throw new Error("Producto no encontrado");
    return await res.json();
  } catch (err) {
    console.error("Error al obtener producto:", err);
    return null;
  }
}

async function verificarUsuario() {
  try {
    const res = await fetch("/api/usuario");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function agregarAlCarrito(idProducto) {
  const usuario = await verificarUsuario();
  if (!usuario) {
    alert("Debe iniciar sesión para agregar productos al carrito.");
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch("/api/carrito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: idProducto }),
    });

    if (res.ok) {
      alert("Producto agregado al carrito");
    } else {
      alert("Error al agregar producto al carrito");
    }
  } catch (err) {
    console.error(err);
    alert("Error de red");
  }
}

function renderProducto(producto) {
  const contenedor = document.getElementById("producto-detalle");
  contenedor.innerHTML = `
    <img src="/img/${producto.imagen.split("/").pop()}" alt="${producto.nombre}">
    <div class="detalle-info">
      <h2>${producto.nombre}</h2>
      <div class="precio-detalle">S/. ${producto.precio}</div>
      <p>${producto.descripcion || "Sin descripción disponible."}</p>
      <button class="boton-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.getElementById("producto-detalle").textContent = "Producto no especificado.";
    return;
  }

  const producto = await obtenerProductoPorId(id);
  if (producto) {
    renderProducto(producto);
  } else {
    document.getElementById("producto-detalle").textContent = "Producto no encontrado.";
  }
});