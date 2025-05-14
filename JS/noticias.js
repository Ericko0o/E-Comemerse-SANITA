document.addEventListener('DOMContentLoaded', () => {
 const grid = document.querySelector('.grid-noticias');
 const contenedorPrincipal = document.querySelector('.noticia-principal');

 // Obtener noticia aleatoria para la principal
 fetch('/api/noticias/aleatoria')
   .then(res => res.json())
   .then(noticiaPrincipal => {
     // Mostrar noticia principal
     contenedorPrincipal.innerHTML = `
       <div class="noticia-img" style="background-image: url('${noticiaPrincipal.imagen}');"></div>
       <div class="noticia-texto">
         <h2>${noticiaPrincipal.titulo}</h2>
         <h3>${noticiaPrincipal.fecha}</h3>
         <p>${noticiaPrincipal.contenido}</p>
       </div>
     `;

     // Guardar ID de la principal para evitar duplicarla
     const idPrincipal = noticiaPrincipal.id;

     // Ahora cargar el resto de las noticias
     fetch('/api/noticias')
       .then(res => res.json())
       .then(data => {
         grid.innerHTML = ''; // Limpia el grid

         // Filtra para no repetir la principal (opcional)
         const otrasNoticias = data.filter(n => n.id !== idPrincipal);
         otrasNoticias.forEach(noticia => {
           const tarjeta = document.createElement('div');
           tarjeta.innerHTML = `
             <div class="tarjeta" style="background-image: url('${noticia.imagen}');" data-id="${noticia.id}">
               <div class="tarjeta-texto">
                 <h4>${noticia.titulo}</h4>
                 <p>${noticia.fecha}</p>
               </div>
             </div>
           `;
           grid.appendChild(tarjeta);
         });

         // Eventos para redireccionar al hacer clic
         document.querySelectorAll('.tarjeta').forEach(tarjeta => {
           tarjeta.addEventListener('click', () => {
             const id = tarjeta.getAttribute('data-id');
             localStorage.setItem('noticiaSeleccionada', id);
             window.location.href = 'noticia.html';
           });
         });
       })
       .catch(err => {
         console.error('Error al cargar noticias:', err);
       });
   })
   .catch(err => {
     console.error('Error al obtener noticia principal:', err);
   });
});