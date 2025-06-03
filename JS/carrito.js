// Renderiza todo el carrito al cargar la página o tras actualizaciones
async function renderizarCarrito() {
  try {
    const res = await fetch("/carrito", { credentials: 'include' });
    const carrito = await res.json();

    const contenedor = document.getElementById("items-carrito");
    const subtotalSpan = document.getElementById("subtotal");
    const totalSpan = document.getElementById("total");
    let subtotal = 0;

    contenedor.innerHTML = ""; // Limpiar filas previas

    if (Array.isArray(carrito) && carrito.length > 0) {
      carrito.forEach(item => {
        const precio = parseFloat(item.precio);
        const cantidad = parseInt(item.cantidad) || 1;
        const total = precio * cantidad;
        subtotal += total;

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${item.nombre}</td>
          <td>S/. ${precio.toFixed(2)}</td>
          <td>
            <input 
              type="number" 
              min="1" 
              value="${cantidad}" 
              onchange="actualizarCantidad(${item.carrito_id}, this.value)"
              style="width: 60px; text-align: center;"
            >
          </td>
          <td>S/. ${total.toFixed(2)}</td>
          <td>
            <button onclick="eliminarDelCarrito(${item.carrito_id})" style="padding: 6px 10px; border-radius: 6px; background-color: #e74c3c; color: white; border: none; cursor: pointer;">
              Eliminar
            </button>
          </td>
        `;
        contenedor.appendChild(fila);
      });
    } else {
      contenedor.innerHTML = "<tr><td colspan='5'>Tu carrito está vacío.</td></tr>";
    }

    subtotalSpan.textContent = `S/. ${subtotal.toFixed(2)}`;
    totalSpan.textContent = `S/. ${subtotal.toFixed(2)}`;
  } catch (err) {
    console.error("Error cargando el carrito:", err);
  }
}

// Elimina un producto del carrito
async function eliminarDelCarrito(carritoId) {
  try {
    await fetch(`/carrito/${carritoId}`, {
      method: "DELETE",
      credentials: 'include'
    });
    renderizarCarrito();
  } catch (err) {
    console.error("Error al eliminar producto:", err);
  }
}

// Actualiza la cantidad de un producto
async function actualizarCantidad(carritoId, nuevaCantidad) {
  try {
    const cantidad = parseInt(nuevaCantidad, 10);
    if (isNaN(cantidad) || cantidad < 1) return;

    await fetch(`/carrito/${carritoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ cantidad })
    });

    renderizarCarrito();
  } catch (err) {
    console.error("Error actualizando cantidad:", err);
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", renderizarCarrito);
