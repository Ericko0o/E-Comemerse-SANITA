document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/carrito");
  const carrito = await res.json();
  const contenedor = document.getElementById("carrito-items");
  const totalSpan = document.getElementById("total-precio");
  let total = 0;

  if (Array.isArray(carrito) && carrito.length > 0) {
    carrito.forEach(item => {
      total += parseFloat(item.precio);
      const div = document.createElement("div");
      div.className = "item-carrito";
      div.innerHTML = `
        <img src="/img/${item.imagen.split("/").pop()}" alt="${item.nombre}">
        <div class="item-info">
          <h4>${item.nombre}</h4>
          <p>S/. ${item.precio}</p>
        </div>
        <button onclick="eliminarDelCarrito(${item.carrito_id})">Eliminar</button>
      `;
      contenedor.appendChild(div);
    });
  } else {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
  }

  totalSpan.textContent = total.toFixed(2);
});

async function eliminarDelCarrito(carritoId) {
  await fetch(`/carrito/${carritoId}`, {
    method: "DELETE"
  });
  location.reload();
}

document.getElementById("pagar-btn").addEventListener("click", () => {
  window.location.href = "/pago.html";
});