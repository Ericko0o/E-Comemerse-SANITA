document.getElementById("pago-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  document.getElementById("mensaje-pago").textContent = "Procesando pago...";

  // Simulación de procesamiento
  setTimeout(async () => {
    await fetch("/vaciar-carrito", { method: "DELETE" });

    document.getElementById("mensaje-pago").innerHTML = `
      <h2>¡Gracias por tu compra!</h2>
      <p>Tu pedido ha sido registrado correctamente.</p>
      <a href="/catalogo.html">Volver al catálogo</a>
    `;
  }, 2000);
});