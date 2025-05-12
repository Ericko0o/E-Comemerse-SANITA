document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/noticias')
    .then(res => res.json())
    .then(data => {
      const grid = document.querySelector('.grid-noticias');
      grid.innerHTML = '';

      data.forEach(noticia => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-blanca';
        tarjeta.innerHTML = `
          <div class="tarjeta" style="background-image: url('${noticia.imagen}');" data-id="${noticia.id}">
            <div class="tarjeta-texto">
              <h4>${noticia.titulo}</h4>
              <p>${noticia.fecha}</p>
            </div>
          </div>
        `;
        grid.appendChild(tarjeta);
      });

      // Ahora sí: después de crear las tarjetas, les agregas el evento
      document.querySelectorAll('.tarjeta').forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
          const id = tarjeta.getAttribute('data-id');
          console.log("Clic en tarjeta:", id);
          localStorage.setItem('noticiaSeleccionada', id);
          window.location.href = 'noticia.html';
        });
      });
    })
    .catch(err => {
      console.error('Error al cargar noticias:', err);
    });
});