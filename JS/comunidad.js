document.addEventListener("DOMContentLoaded", async () => {
    const contenedorPosts = document.querySelector(".posts");
    const contenedorDestacadas = document.querySelector(".publicaciones-destacadas");

    contenedorPosts.innerHTML = "";
    contenedorDestacadas.innerHTML = "";

    try {
        const publicaciones = await fetch('/api/publicaciones').then(r => r.json());

        publicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const numDestacadas = 2;
        const publicacionesRecientes = publicaciones.slice(0, numDestacadas);
        const restoPublicaciones = publicaciones.slice(numDestacadas);

        const renderizarPublicacion = (pub, contenedor) => {
            const pubDiv = document.createElement("div");
            pubDiv.className = "post";
            pubDiv.innerHTML = `
                <div class="post-header">
                    <img src="${pub.imagen || 'img/usuario.jpg'}" class="avatar" alt="Avatar de ${pub.nombre}" />
                    <div>
                        <h2>${pub.nombre}</h2>
                        <small>${formatearAntiguedad(pub.fecha)}</small>
                    </div>
                </div>
                <h3>${pub.titulo}</h3>
                <p>${pub.contenido}</p>
                <button class="mostrar-comentarios" aria-expanded="false" aria-controls="comentarios-${pub.id}">+</button>
                <div id="comentarios-${pub.id}" class="area-comentarios" style="display:none;"></div>
            `;
            contenedor.appendChild(pubDiv);

            const boton = pubDiv.querySelector(".mostrar-comentarios");
            const area = pubDiv.querySelector(".area-comentarios");

            boton.addEventListener("click", async () => {
                const isExpanded = area.style.display === "block";
                area.style.display = isExpanded ? "none" : "block";
                boton.textContent = isExpanded ? "+" : "-";
                boton.setAttribute("aria-expanded", !isExpanded);

                if (!area.dataset.loaded && !isExpanded) {
                    area.innerHTML = '';
                    const hilos = await fetch(`/api/hilos/${pub.id}`).then(r => r.json());
                    hilos.forEach(hilo => {
                        const div = document.createElement("div");
                        div.className = "comentario";
                        div.innerHTML = `<img src="${hilo.imagen || 'img/usuario.jpg'}" class="avatar" alt="Avatar de ${hilo.nombre}"> <div><strong>${hilo.nombre}:</strong> <span>${hilo.contenido}</span></div>`;
                        area.appendChild(div);
                    });

                    const commentInputArea = document.createElement("div");
                    commentInputArea.className = "comment-input-area";

                    const input = document.createElement("input");
                    input.placeholder = "Añadir comentario...";
                    input.setAttribute("aria-label", "Añadir comentario");

                    const btn = document.createElement("button");
                    btn.textContent = "Enviar";
                    btn.setAttribute("aria-label", "Enviar comentario");

                    const logueado = await estaLogueado();
                    if (!logueado) {
                        input.disabled = true;
                        btn.disabled = true;

                        const aviso = document.createElement("div");
                        aviso.className = "aviso";
                        aviso.innerHTML = `Debes <a href="login.html">iniciar sesión</a> para comentar.`;
                        area.append(aviso);

                        input.addEventListener("focus", () => {
                            sessionStorage.setItem("redireccionPostLogin", location.href);
                            location.href = "login.html";
                        });
                        btn.addEventListener("click", () => {
                            sessionStorage.setItem("redireccionPostLogin", location.href);
                            location.href = "login.html";
                        });
                    } else {
                        btn.addEventListener("click", async () => {
                            const texto = input.value.trim();
                            if (!texto) return;
                            const res = await fetch(`/api/hilos/${pub.id}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ contenido: texto })
                            });

                            if (res.ok) {
                                location.reload();
                            } else {
                                console.error('Error al enviar comentario');
                                alert('Error al enviar comentario. Inténtalo de nuevo.');
                            }
                        });
                    }
                    commentInputArea.append(input, btn);
                    area.append(commentInputArea);
                    area.dataset.loaded = "true";
                }
            });
        };

        publicacionesRecientes.forEach(pub => renderizarPublicacion(pub, contenedorDestacadas));
        restoPublicaciones.forEach(pub => renderizarPublicacion(pub, contenedorPosts));

    } catch (err) {
        console.error('Error al cargar publicaciones:', err);
        contenedorPosts.innerHTML = '<p>No se pudieron cargar las publicaciones en este momento.</p>';
    }

    // Lógica para los botones flotantes existentes
    const btnNuevaPublicacion = document.getElementById("btnNuevaPublicacion");
    const btnBuscar = document.getElementById("btnBuscar");
    const btnSubir = document.getElementById("btnSubir"); // Nuevo botón "Subir"

    if (btnNuevaPublicacion) {
        btnNuevaPublicacion.addEventListener("click", async () => {
            const logueado = await estaLogueado();
            if (!logueado) {
                sessionStorage.setItem("redireccionPostLogin", location.href);
                location.href = "login.html";
            } else {
                location.href = "nueva-publicacion.html";
            }
        });
    }

    if (btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            const termino = prompt("¿Qué deseas buscar?");
            if (termino) {
                alert("Buscando: " + termino);
                // Aquí podrías añadir la lógica real de búsqueda,
                // como filtrar las publicaciones mostradas o hacer una llamada al servidor.
            }
        });
    }

    // Nueva lógica para el botón "Subir"
    if (btnSubir) {
        btnSubir.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Desplazamiento suave
            });
        });
    }

    // **********************************************
    // INICIO DEL CÓDIGO AÑADIDO PARA EL COMPORTAMIENTO DE SCROLL DE LOS BOTONES
    // **********************************************
    const accionesFlotantes = document.querySelector('.acciones-laterales-flotantes');
    const comunidadSection = document.querySelector('.comunidad');
    const navbarHeight = 80; // La altura de tu navbar, ajusta si es diferente
    const marginBelowNavbar = 20; // Margen entre el navbar y el top de los botones

    function ajustarPosicionAcciones() {
        if (!accionesFlotantes || !comunidadSection) return;

        const comunidadRect = comunidadSection.getBoundingClientRect();
        const windowScrollTop = window.scrollY; // Cuánto ha scrolleado la ventana desde arriba

        // Calcula la posición superior inicial deseada (ej. 150px desde el top de la ventana)
        // O más bien, el top al que deberían "pegarse" después de pasar el navbar
        const idealFixedTop = navbarHeight + marginBelowNavbar;

        // La parte superior real de la sección comunidad en relación con la ventana
        const comunidadTopInView = comunidadRect.top;

        // La parte inferior real de la sección comunidad en relación con la ventana
        const comunidadBottomInView = comunidadRect.bottom;

        // Altura total de los botones flotantes
        const buttonGroupHeight = accionesFlotantes.offsetHeight;

        let newTop = idealFixedTop; // Por defecto, se comportan como fixed a esta altura

        // Condición 1: Si la sección de la comunidad no ha llegado a la parte superior de la ventana
        // (es decir, aún está por debajo del navbar y nuestro "idealFixedTop")
        // los botones se posicionan relativamente a la parte superior de la sección comunidad.
        if (comunidadTopInView > idealFixedTop) {
            newTop = comunidadTopInView + marginBelowNavbar; // Mantener un margen desde el top de la comunidad
        }

        // Condición 2: Si la sección de la comunidad se está desplazando hacia arriba
        // y los botones fixed irían más allá del final de la sección comunidad
        // entonces los "pegamos" al final de la sección comunidad.
        // Calculamos dónde terminarían los botones si siguieran fixed
        const currentButtonsBottom = newTop + buttonGroupHeight;
        
        // Si los botones están a punto de salirse por abajo de la sección comunidad
        if (currentButtonsBottom > comunidadBottomInView - marginBelowNavbar) {
            newTop = comunidadBottomInView - buttonGroupHeight - marginBelowNavbar;
        }

        // Asegurarse de que newTop no sea menor que idealFixedTop cuando la comunidad ya está visible
        // para evitar que los botones suban demasiado si la comunidad empieza muy arriba.
        // Y también, que no baje más de lo que la comunidad permite.
        accionesFlotantes.style.top = `${Math.max(idealFixedTop, newTop)}px`;
    }

    // Ejecutar al cargar la página y en cada scroll
    window.addEventListener('scroll', ajustarPosicionAcciones);
    window.addEventListener('resize', ajustarPosicionAcciones);
    ajustarPosicionAcciones(); // Llama una vez al cargar para establecer la posición inicial
    // **********************************************
    // FIN DEL CÓDIGO AÑADIDO PARA EL COMPORTAMIENTO DE SCROLL DE LOS BOTONES
    // **********************************************
});

async function estaLogueado() {
    const res = await fetch('/usuario');
    const data = await res.json();
    return data.logueado;
}

function formatearAntiguedad(fechaStr) {
    const f = new Date(fechaStr);
    const hoy = new Date();
    const diffMs = hoy - f;

    const segundos = Math.floor(diffMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    if (años > 0) return `Publicado hace ${años} año${años > 1 ? 's' : ''}`;
    if (meses > 0) return `Publicado hace ${meses} mes${meses > 1 ? 'es' : ''}`;
    if (dias > 0) return `Publicado hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `Publicado hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `Publicado hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (segundos > 0) return `Publicado hace ${segundos} segundo${segundos > 1 ? 's' : ''}`;
    return "Publicado ahora mismo";
}