// Validación de número de tarjeta
const numeroTarjetaInput = document.getElementById('numero-tarjeta');
numeroTarjetaInput.addEventListener('input', function (e) {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 18) v = v.slice(0, 18);
  e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');

  if (v.length < 13) {
    e.target.setCustomValidity("El número debe tener al menos 13 dígitos");
  } else {
    e.target.setCustomValidity("");
  }
});

// Validación de fecha MM/AA
const campoFecha = document.getElementById('fecha-exp');
campoFecha.addEventListener('input', function (e) {
  let v = e.target.value.replace(/[^\d]/g, '');
  if (v.length > 4) v = v.slice(0, 4);
  if (v.length >= 3) {
    const mm = v.slice(0, 2);
    const aa = v.slice(2, 4);
    e.target.value = mm + '/' + aa;
  } else {
    e.target.value = v;
  }
  e.target.setCustomValidity('');
});

// Envío del formulario de pago
document.getElementById("pago-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fechaInput = campoFecha.value;
  const [mes, anio] = fechaInput.split('/');
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fechaInput) || parseInt(anio, 10) <= 25) {
    alert("La fecha de expiración debe ser válida y posterior al año 2025.");
    campoFecha.classList.add('input-error');
    return;
  } else {
    campoFecha.classList.remove('input-error');
  }

  document.getElementById("mensaje-pago").textContent = "Procesando pago...";

  setTimeout(async () => {
    // Vaciar carrito en el backend
    await fetch("/vaciar-carrito", {
      method: "DELETE",
      credentials: 'include'
    });

    // Mostrar formulario de envío
    document.getElementById("form-envio").style.display = "flex";
    document.getElementById("mensaje-pago").textContent = "Pago procesado. Completa los datos de envío.";

  }, 2000);
});

// Envío del formulario de dirección
// Envío del formulario de dirección
document.getElementById("form-envio").addEventListener("submit", async (e) => {
  e.preventDefault();

  const direccion = document.getElementById("direccion-envio").value.trim();
  const telefono = document.getElementById("telefono-envio").value.trim();
  const dni = document.getElementById("dni-envio").value.trim();

  if (!direccion || !telefono || !dni) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    //Llama al backend para registrar el pedido
    const resp = await fetch("/pedido", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        direccion,
        telefono,
        dni
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert("Error al registrar el pedido: " + (data?.error || "Desconocido"));
      return;
    }

    localStorage.setItem("envioEnCurso", "true");
    localStorage.removeItem("pedidoRecibido");

    // 👉 Redirige al seguimiento
    window.location.href = "/envio.html";

  } catch (err) {
    console.error("Error al registrar el pedido:", err);
    alert("No se pudo registrar el pedido.");
  }
});