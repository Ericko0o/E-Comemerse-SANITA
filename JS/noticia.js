document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('noticiaSeleccionada');
    const contenedor = document.getElementById('noticia-container');

    if (!id) {
        contenedor.innerHTML = '<p>No se seleccionó ninguna noticia para mostrar.</p>';
        return;
    }

    fetch(`/api/noticia/${id}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(noticia => {
            contenedor.innerHTML = `
                <div class="noticia-cabecera">
                    <img class="noticia-principal-img" src="${noticia.imagen}" alt="${noticia.titulo}">
                    <div class="titulo-fecha-overlay">
                        <h1>${noticia.titulo}</h1>
                        <p class="noticia-fecha">${noticia.fecha}</p>
                    </div>
                </div>
                <div class="noticia-cuerpo">
                    <p>${noticia.contenido}</p>
                    <div id="galeria-placeholder"></div>
                </div>
            `;

            // Si tiene imágenes extra (opcional)
            if (noticia.imagenesExtra) {
                try {
                    const imagenes = JSON.parse(noticia.imagenesExtra);
                    if (Array.isArray(imagenes) && imagenes.length > 0) {
                        const galeria = document.createElement('div');
                        galeria.className = 'galeria-imagenes';
                        imagenes.forEach(img => {
                            const div = document.createElement('div');
                            div.className = 'imagen-extra';
                            div.style.backgroundImage = `url('${img}')`;
                            galeria.appendChild(div);
                        });
                        // Insertar la galería en el lugar correcto dentro del cuerpo
                        document.getElementById('galeria-placeholder').appendChild(galeria);
                    }
                } catch (e) {
                    console.warn('No se pudo parsear imagenesExtra:', e);
                }
            }
        })
        .catch(err => {
            console.error('Error al cargar la noticia completa:', err);
            contenedor.innerHTML = '<p>Error al cargar la noticia. Por favor, intente de nuevo.</p>';
        });
});