document.getElementById('form-nueva-planta').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  try {
    const res = await fetch('/api/plantas', {
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
