// ------------------ carrito.js (Optimizado) ------------------ //

async function renderizarCarrito() {
  try {
    const res = await fetch("/carrito", { credentials: 'include' });
    const carrito = await res.json();

    const contenedor = document.getElementById("items-carrito");
    const subtotalSpan = document.getElementById("subtotal");
    const totalSpan = document.getElementById("total");
    let subtotal = 0;

    contenedor.innerHTML = "";

    if (Array.isArray(carrito) && carrito.length > 0) {
      const fragment = document.createDocumentFragment();

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
            <button onclick="eliminarDelCarrito(${item.carrito_id})"
              style="padding: 6px 10px; border-radius: 6px; background-color: #e74c3c; color: white; border: none; cursor: pointer;">
              Eliminar
            </button>
          </td>
        `;
        fragment.appendChild(fila);
      });

      contenedor.appendChild(fragment);
    } else {
      const filaVacia = document.createElement("tr");
      filaVacia.innerHTML = `<td colspan="5" style="text-align: center;">Tu carrito está vacío.</td>`;
      contenedor.appendChild(filaVacia);
    }

    subtotalSpan.textContent = `S/. ${subtotal.toFixed(2)}`;
    totalSpan.textContent = `S/. ${subtotal.toFixed(2)}`;
  } catch (err) {
    console.error("Error cargando el carrito:", err);
  }
}

async function eliminarDelCarrito(carritoId) {
  if (!carritoId) return;
  try {
    const res = await fetch(`/carrito/${carritoId}`, {
      method: "DELETE",
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      renderizarCarrito();
    } else {
      alert(data.error || "Error al eliminar el producto");
    }
  } catch (err) {
    console.error("Error al eliminar producto:", err);
  }
}

async function actualizarCantidad(carritoId, nuevaCantidad) {
  const cantidad = parseInt(nuevaCantidad, 10);
  if (!carritoId || isNaN(cantidad) || cantidad < 1) return;

  try {
    const res = await fetch(`/carrito/${carritoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ cantidad })
    });

    const data = await res.json();
    if (res.ok) {
      renderizarCarrito();
    } else {
      alert(data.error || "Error al actualizar cantidad");
    }
  } catch (err) {
    console.error("Error actualizando cantidad:", err);
  }
}

document.addEventListener("DOMContentLoaded", renderizarCarrito);