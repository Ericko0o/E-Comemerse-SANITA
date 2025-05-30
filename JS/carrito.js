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
            >
          </td>
          <td>S/. ${total.toFixed(2)}</td>
          <td><button onclick="eliminarDelCarrito(${item.carrito_id})">Eliminar</button></td>
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
// 🛠️ Endpoint PUT /carrito/:id para actualizar la cantidad
app.put('/carrito/:id', (req, res) => {
  if (!req.session.usuarioId)
    return res.status(401).json({ error: "No autenticado" });

  const carritoId = req.params.id;
  const { cantidad } = req.body;

  if (!cantidad || cantidad < 1)
    return res.status(400).json({ error: "Cantidad inválida" });

  // Verifica que el ítem pertenezca al usuario antes de actualizar
  db.run(
    'UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?',
    [cantidad, carritoId, req.session.usuarioId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "Producto no encontrado en el carrito" });

      res.json({ mensaje: "Cantidad actualizada" });
    }
  );
});


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
    if (cantidad < 1) return;

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