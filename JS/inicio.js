document.addEventListener("DOMContentLoaded", async () => {
  const track = document.querySelector(".carousel-track");

  // Obtener contenido del resumen desde el servidor
  try {
    const res = await fetch("/api/resumen-inicio");
    const data = await res.json();

    if (!Array.isArray(data)) return;

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
  } catch (err) {
    console.error("Error al cargar resumen de inicio:", err);
  }
});
