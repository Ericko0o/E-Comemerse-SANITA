document.addEventListener('DOMContentLoaded', () => {
    const gridDestacadas = document.querySelector('.grid-noticias-destacadas');
    const gridOtrasNoticias = document.querySelector('.grid-noticias');

    // Verificar si es moderador para mostrar botón
    mostrarBotonAgregarNoticiaSiModerador();

    // Fetch todas las noticias para luego dividirlas
    fetch('/api/noticias')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            const noticiasCompletas = data;

            // Tomar las primeras 5 noticias para la sección destacada
            const noticiasDestacadas = noticiasCompletas.slice(0, 5);
            // El resto de las noticias para la sección "Otras Noticias"
            const otrasNoticias = noticiasCompletas.slice(5);

            renderNoticiasDestacadas(noticiasDestacadas);
            renderOtrasNoticias(otrasNoticias);
        })
        .catch(err => {
            console.error('Error al cargar las noticias:', err);
            gridDestacadas.innerHTML = '<p>Error al cargar las noticias destacadas.</p>';
            gridOtrasNoticias.innerHTML = '<p>Error al cargar otras noticias.</p>';
        });
});

function renderNoticiasDestacadas(noticias) {
    const gridDestacadas = document.querySelector('.grid-noticias-destacadas');
    if (!gridDestacadas || !noticias || noticias.length === 0) {
        gridDestacadas.innerHTML = '<p>No hay noticias destacadas para mostrar.</p>';
        return;
    }

    gridDestacadas.innerHTML = ''; // Limpia el grid

    noticias.forEach((noticia, index) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-destacada';
        tarjeta.style.backgroundImage = `url('${noticia.imagen}')`;
        tarjeta.setAttribute('data-id', noticia.id);

        if (index === 0) {
            tarjeta.classList.add('main-featured-item');
        } else {
            tarjeta.classList.add('secondary-featured-item');
        }

        tarjeta.innerHTML = `
            <div class="tarjeta-destacada-overlay">
                <div class="tarjeta-texto">
                    <h4>${noticia.titulo}</h4>
                    <p>${noticia.fecha}</p>
                </div>
            </div>
        `;
        gridDestacadas.appendChild(tarjeta);
    });

    document.querySelectorAll('.grid-noticias-destacadas .tarjeta-destacada').forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
            const id = tarjeta.getAttribute('data-id');
            localStorage.setItem('noticiaSeleccionada', id);
            window.location.href = 'noticia.html';
        });
    });
}

function renderOtrasNoticias(noticias) {
    const gridOtrasNoticias = document.querySelector('.grid-noticias');
    if (!gridOtrasNoticias || !noticias || noticias.length === 0) {
        gridOtrasNoticias.innerHTML = '<p>No hay otras noticias disponibles.</p>';
        return;
    }

    gridOtrasNoticias.innerHTML = '';

    noticias.forEach(noticia => {
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
        gridOtrasNoticias.appendChild(tarjeta);
    });

    document.querySelectorAll('.grid-noticias .tarjeta').forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
            const id = tarjeta.getAttribute('data-id');
            localStorage.setItem('noticiaSeleccionada', id);
            window.location.href = 'noticia.html';
        });
    });
}

// ✅ Mostrar botón si es moderador
async function mostrarBotonAgregarNoticiaSiModerador() {
    const rol = await window.obtenerRolUsuario?.();
    if (rol === 'moderador') {
        const contenedor = document.getElementById("boton-agregar-noticia");
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="btn-agregar-noticia-wrapper"> <button onclick="window.location.href='agregar-noticia.html'" class="btn-agregar-noticia">
                        ➕ Agregar Noticia
                    </button>
                </div>`;
        }
    }
}