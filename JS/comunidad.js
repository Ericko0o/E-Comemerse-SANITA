document.addEventListener("DOMContentLoaded", async () => {
  const contenedorPosts = document.querySelector(".posts");
  const contenedorDestacadas = document.querySelector(".publicaciones-destacadas");

  contenedorPosts.innerHTML = "<p>Cargando publicaciones...</p>";
  contenedorDestacadas.innerHTML = "<p>Cargando destacadas...</p>";

  try {
    const publicaciones = await fetch('/api/publicaciones').then(r => r.json());
    publicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const publicacionesRecientes = publicaciones.slice(0, 2);
    const restoPublicaciones = publicaciones.slice(2);

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
        const expanded = area.style.display === "block";
        area.style.display = expanded ? "none" : "block";
        boton.textContent = expanded ? "+" : "-";
        boton.setAttribute("aria-expanded", !expanded);

        if (!area.dataset.loaded && !expanded) {
          const hilos = await fetch(`/api/hilos/${pub.id}`).then(r => r.json());
          hilos.forEach(hilo => {
            const div = document.createElement("div");
            div.className = "comentario";
            div.innerHTML = `<img src="${hilo.imagen || 'img/usuario.jpg'}" class="avatar" alt="Avatar"> <div><strong>${hilo.nombre}:</strong> <span>${hilo.contenido}</span></div>`;
            area.appendChild(div);
          });

          const logueado = await estaLogueado();
          const commentInputArea = document.createElement("div");
          commentInputArea.className = "comment-input-area";

          const input = document.createElement("input");
          input.placeholder = "Añadir comentario...";

          const btn = document.createElement("button");
          btn.textContent = "Enviar";

          if (!logueado) {
            input.disabled = true;
            btn.disabled = true;
            const aviso = document.createElement("div");
            aviso.className = "aviso";
            aviso.innerHTML = `Debes <a href="login.html">iniciar sesión</a> para comentar.`;
            area.append(aviso);
          } else {
            btn.addEventListener("click", async () => {
              const texto = input.value.trim();
              if (!texto) return;
              const res = await fetch(`/api/hilos/${pub.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contenido: texto }),
              });
              if (res.ok) {
                const nuevo = document.createElement("div");
                nuevo.className = "comentario";
                nuevo.innerHTML = `<div><strong>Tú:</strong> <span>${texto}</span></div>`;
                area.insertBefore(nuevo, commentInputArea);
                input.value = '';
              } else {
                alert("Error al enviar comentario.");
              }
            });
          }

          commentInputArea.append(input, btn);
          area.append(commentInputArea);
          area.dataset.loaded = "true";
        }
      });
    };

    contenedorPosts.innerHTML = '';
    contenedorDestacadas.innerHTML = '';
    publicacionesRecientes.forEach(pub => renderizarPublicacion(pub, contenedorDestacadas));
    restoPublicaciones.forEach(pub => renderizarPublicacion(pub, contenedorPosts));
  } catch (err) {
    console.error('Error al cargar publicaciones:', err);
    contenedorPosts.innerHTML = '<p>No se pudieron cargar las publicaciones.</p>';
  }

  // Botones flotantes
  document.getElementById("btnNuevaPublicacion")?.addEventListener("click", async () => {
    const logueado = await estaLogueado();
    if (!logueado) {
      sessionStorage.setItem("redireccionPostLogin", location.href);
      location.href = "login.html";
    } else {
      location.href = "nueva-publicacion.html";
    }
  });

  document.getElementById("btnBuscar")?.addEventListener("click", () => {
    const termino = prompt("¿Qué deseas buscar?");
    if (termino) alert("Buscando: " + termino);
  });

  document.getElementById("btnSubir")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

async function estaLogueado() {
  const res = await fetch('/usuario');
  const data = await res.json();
  return data.logueado;
}

function formatearAntiguedad(fechaStr) {
  const f = new Date(fechaStr);
  const diffMs = new Date() - f;
  const minutos = Math.floor(diffMs / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  const meses = Math.floor(dias / 30);
  const años = Math.floor(dias / 365);

  if (años > 0) return `hace ${años} año${años > 1 ? 's' : ''}`;
  if (meses > 0) return `hace ${meses} mes${meses > 1 ? 'es' : ''}`;
  if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return "justo ahora";
}