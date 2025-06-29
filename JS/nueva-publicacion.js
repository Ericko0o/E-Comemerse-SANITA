document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-publicacion');
  const btn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const contenido = document.getElementById('contenido').value.trim();
    if (!titulo || !contenido) return alert('Completa todos los campos');

    btn.disabled = true;
    btn.textContent = "Publicando...";

    try {
      const res = await fetch('/api/publicaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo, contenido })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al publicar");
      }

      alert("¡Publicación creada!");
      window.location.href = 'comunidad.html';
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = "Publicar";
    }
  });
});