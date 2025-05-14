const campoFecha = document.getElementById("fecha-exp");

const campoTarjeta = document.getElementById("numero-tarjeta");

campoTarjeta.addEventListener("input", function (e) {
  let valor = e.target.value.replace(/\D/g, ""); // Solo dígitos

  // Limita a 18 dígitos
  if (valor.length > 18) {
    valor = valor.slice(0, 18);
  }

  // Inserta un espacio cada 4 dígitos
  const formateado = valor.match(/.{1,4}/g)?.join(" ") ?? "";

  e.target.value = formateado;

  // Validación personalizada
  if (valor.length < 13) {
    e.target.setCustomValidity("El número debe tener al menos 13 dígitos");
  } else {
    e.target.setCustomValidity("");
  }
});

campoFecha.addEventListener("input", function (e) {
  let input = e.target.value.replace(/[^\d]/g, ""); // quitar caracteres no numéricos

  if (input.length >= 3) {
    const mes = input.substring(0, 2);
    const anio = input.substring(2, 4);

    // Validar si el mes es mayor a 12
    if (parseInt(mes) > 12) {
      e.target.setCustomValidity("El mes debe estar entre 01 y 12");
    } else {
      e.target.setCustomValidity("");
    }

    e.target.value = mes + "/" + anio;
  } else {
    e.target.value = input;
    e.target.setCustomValidity("");
  }
});

document.getElementById("pago-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  document.getElementById("mensaje-pago").textContent = "Procesando pago...";

  // Simulación de procesamiento
  setTimeout(async () => {
    await fetch("/vaciar-carrito", { method: "DELETE" });

    document.getElementById("mensaje-pago").innerHTML = `
      <h2>¡Gracias por tu compra!</h2>
      <p>Tu pedido ha sido registrado correctamente.</p>
      <a href="/catalogo.html" class="volver-catalogo">Volver al catálogo</a>
    `;
  }, 2000);
});