document.addEventListener('DOMContentLoaded', () => {
  const id = localStorage.getItem('noticiaSeleccionada');
  const contenedor = document.getElementById('detalle-noticia');

  if (!id) {
    contenedor.innerHTML = '<h2>Noticia no encontrada</h2>';
    return;
  }

  fetch(`/api/noticias/${id}`)
    .then(res => res.json())
    .then(noticia => {
      contenedor.innerHTML = `
        <div class="noticia-img" style="background-image: url('${noticia.imagen}'); height: 300px;"></div>
        <h2>${noticia.titulo}</h2>
        <h4>${noticia.fecha}</h4>
        <p>${noticia.contenido}</p>
      `;
    })
    .catch(err => {
      console.error(err);
      contenedor.innerHTML = '<h2>Error al cargar la noticia</h2>';
    });
});