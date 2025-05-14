// Formateo automático y validación del número de tarjeta
const numeroTarjetaInput = document.getElementById('numero-tarjeta');
numeroTarjetaInput.addEventListener('input', function (e) {
  let v = e.target.value.replace(/\D/g, '');         // sólo dígitos
  if (v.length > 18) v = v.slice(0, 18);             // máximo 18 dígitos
  e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 '); // espacio cada 4 cifras

  // Valida longitud mínima
  if (v.length < 13) {
    e.target.setCustomValidity("El número debe tener al menos 13 dígitos");
  } else {
    e.target.setCustomValidity("");
  }
});

// Formateo y validación de fecha MM/AA
const campoFecha = document.getElementById('fecha-exp');
campoFecha.addEventListener('input', function (e) {
  let v = e.target.value.replace(/[^\d]/g, '');     // sólo dígitos
  if (v.length > 4) v = v.slice(0, 4);               // máximo 4 dígitos
  if (v.length >= 3) {
    const mm = v.slice(0,2);
    const aa = v.slice(2,4);
    e.target.value = mm + '/' + aa;
  } else {
    e.target.value = v;
  }
  e.target.setCustomValidity(''); // limpia mensajes anteriores
});

// Envío del formulario con validaciones finales
document.getElementById("pago-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validar fecha final (formato y año > 25)
  const fechaInput = campoFecha.value;
  const [mes, anio] = fechaInput.split('/');
  if (
    !/^(0[1-9]|1[0-2])\/\d{2}$/.test(fechaInput) ||  // formato inválido
    parseInt(anio, 10) <= 25                         // año <= 25
  ) {
    alert("La fecha de expiración debe ser válida y posterior al año 2025.");
    campoFecha.classList.add('input-error');
    return;
  } else {
    campoFecha.classList.remove('input-error');
  }

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