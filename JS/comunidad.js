document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.querySelector(".posts");
  contenedor.innerHTML = "";

  const publicaciones = await fetch('/api/publicaciones').then(r => r.json());

  for (const pub of publicaciones) {
    const pubDiv = document.createElement("div");
    pubDiv.className = "post";
    pubDiv.innerHTML = `
      <div class="post-header">
        <img src="${pub.imagen}" class="avatar" />
        <div>
          <h2>${pub.nombre}</h2>
          <small>${formatearAntiguedad(pub.fecha)}</small>
        </div>
      </div>
      <p>${pub.contenido}</p>
      <p><strong>${pub.titulo}</strong></p>
      <button class="mostrar-comentarios">+</button>
      <div class="area-comentarios" style="display:none;"></div>
    `;
    contenedor.appendChild(pubDiv);

    const boton = pubDiv.querySelector(".mostrar-comentarios");
    const area = pubDiv.querySelector(".area-comentarios");

    boton.addEventListener("click", async () => {
      if (area.dataset.loaded !== "true") {
        const hilos = await fetch(`/api/hilos/${pub.id}`).then(r => r.json());
        hilos.forEach(hilo => {
          const div = document.createElement("div");
          div.className = "comentario";
          div.innerHTML = `<img src="${hilo.imagen}" class="avatar" style="width:30px;"> <strong>${hilo.nombre}:</strong> ${hilo.contenido}`;
          area.appendChild(div);
        });

        const input = document.createElement("input");
        input.placeholder = "Añadir comentario...";
        const btn = document.createElement("button");
        btn.textContent = "Enviar";

        btn.addEventListener("click", async () => {
          const texto = input.value.trim();
          if (!texto) return;
          const res = await fetch(`/api/hilos/${pub.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contenido: texto })
          });

          if (res.ok) {
            location.reload(); // O volver a cargar los comentarios
          }
        });

        area.append(input, btn);
        area.dataset.loaded = "true";
      }

      area.style.display = area.style.display === "none" ? "block" : "none";
    });
  }
});

function formatearAntiguedad(fechaStr) {
  const f = new Date(fechaStr);
  const hoy = new Date();
  const dias = Math.floor((hoy - f) / (1000 * 60 * 60 * 24));
  if (dias === 0) return "Publicado hoy";
  if (dias === 1) return "Publicado hace 1 día";
  return `Publicado hace ${dias} días`;
}
