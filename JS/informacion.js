document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.querySelector('.info-contenedor').innerHTML = '<p>Error: ID de planta no especificado.</p>';
    return;
  }

  fetch(`/api/plantas/${id}`)
    .then(res => {
      if (!res.ok) throw new Error("No se pudo cargar la información.");
      return res.json();
    })
    .then(data => {
      document.getElementById('planta-nombre').textContent = data.nombre;
      document.getElementById('planta-descripcion').textContent = data.descripcion;
      document.getElementById('planta-beneficios').textContent = data.beneficios;
      document.getElementById('planta-uso').textContent = data.uso;
      document.getElementById('planta-imagen').src = data.imagen;
      document.getElementById('planta-imagen').alt = data.nombre;
    })
    .catch(err => {
      document.querySelector('.info-contenedor').innerHTML = '<p>Error al cargar la información de la planta.</p>';
      console.error(err);
    });
});
