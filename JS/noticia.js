document.addEventListener('DOMContentLoaded', () => {
   const params = new URLSearchParams(window.location.search);
   const id = params.get('id');


   if (!id) {
       console.error('ID de noticia no especificado');
       return;
   }


   fetch(`/api/noticia/${id}`)
       .then(res => {
           if (!res.ok) {
               throw new Error(`No se pudo obtener la noticia (status: ${res.status})`);
           }
           return res.json();
       })
       .then(data => {
           console.log('Noticia recibida:', data);


           const titulo = document.getElementById('titulo');
           const contenido = document.getElementById('contenido');
           const imagen = document.getElementById('imagen');


           if (!titulo || !contenido || !imagen) {
               console.error('Elementos HTML no encontrados en la página');
               return;
           }


           titulo.textContent = data.titulo;
           contenido.textContent = data.contenido;
           imagen.src = data.imagen_url;
       })
       .catch(err => {
           console.error('Error al obtener la noticia:', err);
       });
});
