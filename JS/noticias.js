document.addEventListener('DOMContentLoaded', () => {
    // Inserta la barra de navegación (asumiendo que navbar.js se encarga de esto)
    // Este código aquí es solo un recordatorio si necesitas verificar la inserción.
    // Si tu navbar.js ya lo hace, puedes ignorar o eliminar este comentario.
    // fetch('/navbar.html') // O la ruta a tu archivo HTML de la navbar
    //     .then(response => response.text())
    //     .then(html => {
    //         document.getElementById('navbar-placeholder').innerHTML = html;
    //     });

    const grid = document.querySelector('.grid-noticias');
    const contenedorPrincipal = document.querySelector('.noticia-principal');

    // Obtener noticia aleatoria para la principal
    fetch('/api/noticias/aleatoria')
        .then(res => {
            if (!res.ok) {
                // Si la respuesta no es 2xx, lanza un error para que el catch lo capture
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(noticiaPrincipal => {
            // Mostrar noticia principal
            contenedorPrincipal.innerHTML = `
                <div class="noticia-img" style="background-image: url('${noticiaPrincipal.imagen}');"></div>
                <div class="noticia-texto">
                    <h2>${noticiaPrincipal.titulo}</h2>
                    <h3>${noticiaPrincipal.fecha}</h3>
                    <p>${noticiaPrincipal.contenido_resumen || noticiaPrincipal.contenido.substring(0, 180) + '...'}</p>
                </div>
            `;
            // Agrega el evento de clic a la noticia principal
            contenedorPrincipal.addEventListener('click', () => {
                localStorage.setItem('noticiaSeleccionada', noticiaPrincipal.id);
                window.location.href = 'noticia.html';
            });

            // Guardar ID de la principal para evitar duplicarla
            const idPrincipal = noticiaPrincipal.id;

            // Ahora cargar el resto de las noticias
            fetch('/api/noticias')
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    grid.innerHTML = ''; // Limpia el grid

                    // Filtra para no repetir la principal (opcional)
                    const otrasNoticias = data.filter(n => n.id !== idPrincipal);
                    otrasNoticias.forEach(noticia => {
                        const tarjeta = document.createElement('div');
                        tarjeta.className = 'tarjeta'; // Asigna la clase 'tarjeta' al div principal
                        tarjeta.style.backgroundImage = `url('${noticia.imagen}')`;
                        tarjeta.setAttribute('data-id', noticia.id);
                        tarjeta.innerHTML = `
                            <div class="tarjeta-img-overlay">
                                <div class="tarjeta-texto">
                                    <h4>${noticia.titulo}</h4>
                                    <p>${noticia.fecha}</p>
                                </div>
                            </div>
                        `;
                        grid.appendChild(tarjeta);
                    });

                    // Eventos para redireccionar al hacer clic en las tarjetas de la cuadrícula
                    document.querySelectorAll('.grid-noticias .tarjeta').forEach(tarjeta => { // Más específico
                        tarjeta.addEventListener('click', () => {
                            const id = tarjeta.getAttribute('data-id');
                            localStorage.setItem('noticiaSeleccionada', id);
                            window.location.href = 'noticia.html';
                        });
                    });
                })
                .catch(err => {
                    console.error('Error al cargar otras noticias:', err);
                    grid.innerHTML = '<p>No se pudieron cargar otras noticias. Intente de nuevo más tarde.</p>';
                });
        })
        .catch(err => {
            console.error('Error al obtener noticia principal:', err);
            // Manejo de error si no se puede cargar la noticia principal
            contenedorPrincipal.innerHTML = '<p>Error al cargar la noticia principal. Intente de nuevo más tarde.</p>';
            // De igual manera, intenta cargar las otras noticias aunque no haya principal
            fetch('/api/noticias')
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    grid.innerHTML = '';
                    data.forEach(noticia => {
                        const tarjeta = document.createElement('div');
                        tarjeta.className = 'tarjeta';
                        tarjeta.style.backgroundImage = `url('${noticia.imagen}')`;
                        tarjeta.setAttribute('data-id', noticia.id);
                        tarjeta.innerHTML = `
                            <div class="tarjeta-img-overlay">
                                <div class="tarjeta-texto">
                                    <h4>${noticia.titulo}</h4>
                                    <p>${noticia.fecha}</p>
                                </div>
                            </div>
                        `;
                        grid.appendChild(tarjeta);
                    });
                    document.querySelectorAll('.grid-noticias .tarjeta').forEach(tarjeta => {
                        tarjeta.addEventListener('click', () => {
                            const id = tarjeta.getAttribute('data-id');
                            localStorage.setItem('noticiaSeleccionada', id);
                            window.location.href = 'noticia.html';
                        });
                    });
                })
                .catch(err => {
                    console.error('Error al cargar noticias alternativas (sin principal):', err);
                    grid.innerHTML = '<p>No se pudieron cargar las noticias.</p>';
                });
        });
});