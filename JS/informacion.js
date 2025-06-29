document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const contenedor = document.getElementById('info-contenedor');
  contenedor.innerHTML = '<p id="cargando">Cargando información...</p>';

  if (!id) {
    contenedor.innerHTML = '<p>Error: ID de planta no especificado.</p>';
    return;
  }

  try {
    const res = await fetch(`/api/plantas/${id}`);
    if (!res.ok) throw new Error("No se pudo cargar la información.");
    const data = await res.json();

    const beneficios = data.beneficios?.join(', ') || 'No especificado';
    const usos = data.usos?.join(', ') || 'No especificado';

    // URI semántica
    const baseUri = 'https://sanita.org/planta/';
    const fullUri = baseUri + encodeURIComponent(id);

    contenedor.innerHTML = `
      <img id="planta-imagen" src="${data.imagen}" alt="${data.nombre}" />
      <h1 id="planta-nombre">${data.nombre}</h1>
      <h3>Descripción</h3>
      <p id="planta-descripcion">${data.descripcion}</p>
      <h3>Beneficios</h3>
      <p id="planta-beneficios">${beneficios}</p>
      <h3>Uso</h3>
      <p id="planta-uso">${usos}</p>

      <section id="rdf-info">
        <h3>Datos semánticos</h3>
        <p><strong>URI:</strong> <span id="planta-uri">${fullUri}</span></p>
        <a id="rdf-link" href="/rdf/${id}" target="_blank">Ver RDF de esta planta</a>
      </section>
    `;
  } catch (err) {
    contenedor.innerHTML = '<p>Error al cargar la información de la planta.</p>';
    console.error(err);
  }
});