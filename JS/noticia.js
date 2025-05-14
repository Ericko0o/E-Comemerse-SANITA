document.addEventListener('DOMContentLoaded', () => {
 const id = localStorage.getItem('noticiaSeleccionada');


 if (!id) {
   document.getElementById('noticia-container').innerHTML = '<p>No se seleccionó ninguna noticia.</p>';
   return;
 }


 fetch(`/api/noticia/${id}`)
   .then(res => res.json())
   .then(noticia => {
     const contenedor = document.getElementById('noticia-container');
     contenedor.innerHTML = `
       <h2>${noticia.titulo}</h2>
       <h4>${noticia.fecha}</h4>
       <div class="noticia-img" style="background-image: url('${noticia.imagen}'); height: 300px;"></div>
       <p>${noticia.contenido}</p>
     `;


     // Si tiene imágenes extra (opcional)
     if (noticia.imagenesExtra) {
       try {
         const imagenes = JSON.parse(noticia.imagenesExtra);
         if (Array.isArray(imagenes) && imagenes.length > 0) {
           const galeria = document.createElement('div');
           galeria.className = 'galeria-imagenes';
           imagenes.forEach(img => {
             const div = document.createElement('div');
             div.className = 'imagen-extra';
             div.style.backgroundImage = `url('${img}')`;
             galeria.appendChild(div);
           });
           contenedor.appendChild(galeria);
         }
       } catch (e) {
         console.warn('No se pudo parsear imagenesExtra:', e);
       }
     }
   })
   .catch(err => {
     console.error('Error al cargar la noticia:', err);
     document.getElementById('noticia-container').innerHTML = '<p>Error al cargar la noticia.</p>';
   });
});