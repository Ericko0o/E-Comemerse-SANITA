document.getElementById('form-nueva-planta').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const precioInput = form.querySelector('input[name="precio"]');
  const precio = parseFloat(precioInput.value);

  if (isNaN(precio) || precio < 1) {
    alert("El precio debe ser un número mayor o igual a 1.");
    precioInput.classList.add("input-error");
    return;
  }

  precioInput.classList.remove("input-error");

  const formData = new FormData(form);

  try {
    const res = await fetch('/api/subir-planta', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      alert('Planta registrada con éxito');
      window.location.href = 'catalogo.html';
    } else {
      alert('Error al registrar planta: ' + data.error);
    }
  } catch (err) {
    alert('Error al conectar con el servidor');
    console.error(err);
  }
});
