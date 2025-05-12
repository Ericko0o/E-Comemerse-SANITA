document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/carrito");
    const carrito = await res.json();

    const contenedor = document.getElementById("items-carrito");
    const subtotalSpan = document.getElementById("subtotal");
    const totalSpan = document.getElementById("total");
    let subtotal = 0;

    if (Array.isArray(carrito) && carrito.length > 0) {
      carrito.forEach(item => {
        const precio = parseFloat(item.precio);
        const cantidad = item.cantidad || 1;
        const total = precio * cantidad;
        subtotal += total;

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${item.nombre}</td>
          <td>S/. ${precio.toFixed(2)}</td>
          <td>
            <input type="number" min="1" value="${cantidad}" onchange="actualizarCantidad(${item.carrito_id}, this.value)">
          </td>
          <td>S/. ${total.toFixed(2)}</td>
          <td><button onclick="eliminarDelCarrito(${item.carrito_id})">Eliminar</button></td>
        `;
        contenedor.appendChild(fila);
      });
    } else {
      contenedor.innerHTML = "<tr><td colspan='5'>Tu carrito está vacío.</td></tr>";
    }

    subtotalSpan.textContent = `S/${subtotal.toFixed(2)}`;
    totalSpan.textContent = `S/${subtotal.toFixed(2)}`;
  } catch (err) {
    console.error("Error cargando el carrito:", err);
  }
});

async function eliminarDelCarrito(carritoId) {
  try {
    await fetch(`/carrito/${carritoId}`, { method: "DELETE" });
    location.reload();
  } catch (err) {
    console.error("Error al eliminar producto:", err);
  }
}

async function actualizarCantidad(carritoId, nuevaCantidad) {
  try {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad < 1) return;

    await fetch(`/carrito/${carritoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad })
    });

    location.reload();
  } catch (err) {
    console.error("Error actualizando cantidad:", err);
  }
}
