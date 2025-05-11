document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");

  if (track && !track.dataset.duplicated) {
    track.innerHTML += track.innerHTML; // Duplicar recuadros para bucle
    track.dataset.duplicated = "true";
  }

  const cards = document.querySelectorAll(".carousel-card");

  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      track.style.animationPlayState = "paused";
      card.classList.add("hovered");
    });

    card.addEventListener("mouseleave", () => {
      track.style.animationPlayState = "running";
      card.classList.remove("hovered");
    });

    card.addEventListener("click", () => {
      const href = card.getAttribute("data-link");
      if (href) window.location.href = href;
    });
  });
});
