document.addEventListener("DOMContentLoaded", async () => {
    const contenedorPosts = document.querySelector(".posts"); // Contenedor para el resto de hilos
    const contenedorDestacadas = document.querySelector(".publicaciones-destacadas"); // Contenedor para las publicaciones destacadas

    contenedorPosts.innerHTML = "";
    contenedorDestacadas.innerHTML = "";

    try {
        const publicaciones = await fetch('/api/publicaciones').then(r => r.json());

        // Ordenar publicaciones por fecha de más reciente a más antigua
        // (Aunque el endpoint ya lo hace con ORDER BY p.fecha DESC, lo reconfirmamos aquí)
        publicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const numDestacadas = 2; // Número de publicaciones más nuevas a destacar
        const publicacionesRecientes = publicaciones.slice(0, numDestacadas);
        const restoPublicaciones = publicaciones.slice(numDestacadas);

        // Función para renderizar una publicación en un contenedor dado
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
                <h3>${pub.titulo}</h3> <p>${pub.contenido}</p>
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

                if (!area.dataset.loaded && !isExpanded) { // Cargar comentarios solo la primera vez que se abre
                    area.innerHTML = ''; // Limpiar antes de cargar por si acaso
                    const hilos = await fetch(`/api/hilos/${pub.id}`).then(r => r.json());
                    hilos.forEach(hilo => {
                        const div = document.createElement("div");
                        div.className = "comentario";
                        div.innerHTML = `<img src="${hilo.imagen || 'img/usuario.jpg'}" class="avatar" alt="Avatar de ${hilo.nombre}"> <div><strong>${hilo.nombre}:</strong> <span>${hilo.contenido}</span></div>`;
                        area.appendChild(div);
                    });

                    // Área para el input y botón de comentario
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
                                // Idealmente, se recargan solo los comentarios o se añade el nuevo dinámicamente
                                // Para simplificar, recargamos la página
                                location.reload();
                            } else {
                                console.error('Error al enviar comentario');
                                alert('Error al enviar comentario. Inténtalo de nuevo.');
                            }
                        });
                    }
                    commentInputArea.append(input, btn);
                    area.append(commentInputArea); // Añadir el nuevo contenedor al área de comentarios
                    area.dataset.loaded = "true";
                }
            });
        };

        // Renderizar publicaciones destacadas
        publicacionesRecientes.forEach(pub => renderizarPublicacion(pub, contenedorDestacadas));

        // Renderizar el resto de publicaciones
        restoPublicaciones.forEach(pub => renderizarPublicacion(pub, contenedorPosts));

    } catch (err) {
        console.error('Error al cargar publicaciones:', err);
        contenedorPosts.innerHTML = '<p>No se pudieron cargar las publicaciones en este momento.</p>';
    }

    // ✅ Redirección protegida al hacer clic en el botón ➕
    const btnNueva = document.getElementById("btnNuevaPublicacion");
    if (btnNueva) {
        btnNueva.addEventListener("click", async () => {
            const logueado = await estaLogueado();
            if (!logueado) {
                sessionStorage.setItem("redireccionPostLogin", location.href);
                location.href = "login.html";
            } else {
                location.href = "nueva-publicacion.html";
            }
        });
    }
});

async function estaLogueado() {
    const res = await fetch('/usuario');
    const data = await res.json();
    return data.logueado;
}

function formatearAntiguedad(fechaStr) {
    const f = new Date(fechaStr);
    const hoy = new Date();
    const diffMs = hoy - f; // Diferencia en milisegundos

    const segundos = Math.floor(diffMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30); // Aproximado
    const años = Math.floor(dias / 365);

    if (años > 0) return `Publicado hace ${años} año${años > 1 ? 's' : ''}`;
    if (meses > 0) return `Publicado hace ${meses} mes${meses > 1 ? 'es' : ''}`;
    if (dias > 0) return `Publicado hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `Publicado hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `Publicado hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (segundos > 0) return `Publicado hace ${segundos} segundo${segundos > 1 ? 's' : ''}`;
    return "Publicado ahora mismo";
}