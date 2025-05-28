document.addEventListener("DOMContentLoaded", async () => {
  const track = document.querySelector(".carousel-track");

  // Obtener contenido del resumen desde el servidor
  try {
    const res = await fetch("/api/resumen-inicio");
    const data = await res.json();

    if (Array.isArray(data)) {
      // Limpiar track y generar recuadros dinámicamente
      track.innerHTML = "";

      data.forEach(item => {
        const card = document.createElement("a");
        card.classList.add("carousel-card");
        card.href = item.tipo === "noticia" ? "noticias.html" : "comunidad.html";

        card.innerHTML = `
          <img src="${item.imagen}" alt="${item.titulo}" class="carousel-card-image">
          <div class="carousel-card-text">${item.titulo}</div>
        `;

        track.appendChild(card);
      });

      // Duplicar para animación infinita
      track.innerHTML += track.innerHTML;
      track.dataset.duplicated = "true";

      const cards = document.querySelectorAll(".carousel-card");

      cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
          track.style.animationPlayState = "paused";
        });
        card.addEventListener("mouseleave", () => {
          track.style.animationPlayState = "running";
        });
      });
    }
  } catch (err) {
    console.error("Error al cargar resumen de inicio:", err);
  }

  // Cargar plantas destacadas en sección "Información sobre Plantas"
  try {
    const res = await fetch("/api/plantas");
    const data = await res.json();
    const contenedor = document.getElementById("plantas-row");

    if (contenedor && Array.isArray(data)) {
      const plantas = data.slice(0, 4); // Solo mostrar 4
      contenedor.innerHTML = "";

      plantas.forEach(planta => {
        const div = document.createElement("div");
        div.className = "planta-card";
        div.onclick = () => {
          window.location.href = `informacion.html?id=${planta.id}`;
        };
        div.innerHTML = `
          <img src="${planta.imagen}" alt="${planta.nombre}">
          <div class="planta-card-name">${planta.nombre}</div>
        `;
        contenedor.appendChild(div);
      });
    }
  } catch (err) {
    console.error("Error al cargar plantas destacadas:", err);
  }
});

fetch("/datos/sanita.rdf")
  .then(resRdf => {
    if (resRdf.ok) {
      console.log("Archivo RDF accesible y servido correctamente.");
    } else {
      console.warn("Archivo RDF no encontrado o error al cargar:", resRdf.status);
    }
  })
  .catch(error => {
    console.error("Error al intentar cargar el archivo RDF:", error);
  });
