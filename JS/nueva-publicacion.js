document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-publicacion');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const contenido = document.getElementById('contenido').value.trim();

    if (!titulo || !contenido) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/publicaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 👈 envía cookie de sesión
        body: JSON.stringify({ titulo, contenido })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al publicar');
      }

      alert('¡Publicación creada con éxito!');
      window.location.href = 'comunidad.html';
    } catch (error) {
      console.error('Error:', error.message);
      alert('Hubo un problema al enviar tu publicación.');
    }
  });
});
