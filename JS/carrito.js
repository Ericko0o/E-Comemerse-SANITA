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
        subtotal += precio;

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${item.nombre}</td>
          <td>S/. ${precio.toFixed(2)}</td>
          <td>1</td>
          <td>S/. ${precio.toFixed(2)}</td>
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