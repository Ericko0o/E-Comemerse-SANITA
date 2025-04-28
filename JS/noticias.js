const botonVerMas = document.getElementById('ver-mas-btn');
const noticiasOcultas = document.querySelectorAll('.noticia-item.hidden');

botonVerMas.addEventListener('click', function(e) {
  e.preventDefault();
  noticiasOcultas.forEach(function(noticia) {
    noticia.classList.remove('hidden');
  });
  botonVerMas.style.display = 'none'; // Ocultar el botón después
});