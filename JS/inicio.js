document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");

  // Duplicar los recuadros solo una vez para asegurar el bucle
  if (track && !track.dataset.duplicated) {
    track.innerHTML += track.innerHTML; // Duplicar recuadros para bucle
    track.dataset.duplicated = "true";
  }

  const cards = document.querySelectorAll(".carousel-card");

  // Agregar eventos para el hover y hacer el efecto de pausa en la animación
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      track.style.animationPlayState = "paused";
      card.classList.add("hovered");
    });

    card.addEventListener("mouseleave", () => {
      track.style.animationPlayState = "running";
      card.classList.remove("hovered");
    });

    // Evento para redirigir al hacer clic en un recuadro
    card.addEventListener("click", () => {
      const href = card.getAttribute("data-link");
      if (href) window.location.href = href;
    });
  });
});
