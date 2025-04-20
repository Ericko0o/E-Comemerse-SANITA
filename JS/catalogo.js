const productos = {
    cicatrizantes: [
      { nombre: "Sangre de Grado", precio: 20, imagen: "IMG/sangre-de-grado.jpg" },
      { nombre: "Matico", precio: 15, imagen: "IMG/matico.jpeg" },
      { nombre: "Llanten", precio: 25, imagen: "IMG/llanten.jpg" },
      { nombre: "Flor de Arena", precio: 25, imagen: "IMG/flor-de-arena.jpg" },
      { nombre: "Chilca", precio: 20, imagen: "IMG/chilca.jpg" }
    ],
    inmunologico: [
      { nombre: "Uña de Gato", precio: 20, imagen: "IMG/una-de-gato.jpg" },
      { nombre: "Ayahuasca", precio: 15, imagen: "IMG/ayahuasca.jpeg" },
      { nombre: "Sacha Inchi", precio: 25, imagen: "IMG/sacha-inchi.jpg" },
      { nombre: "Muña", precio: 25, imagen: "IMG/muna.jpg" },
      { nombre: "Chuchuhuasi", precio: 20, imagen: "IMG/chuchuhuasi.jpg" }
    ]
  };
  
  function mostrarCategoria(categoria, tabElement) {
    const contenedor = document.getElementById("productos-container");
    contenedor.innerHTML = "";
  
    productos[categoria].forEach(prod => {
      contenedor.innerHTML += `
        <div class="producto">
          <img src="${prod.imagen}" alt="${prod.nombre}">
          <div class="producto-info">
            ${prod.nombre}
            <span class="precio">S/.${prod.precio}</span>
          </div>
        </div>`;
    });
  
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    tabElement.classList.add("active");
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    mostrarCategoria('cicatrizantes', document.querySelector(".tab.active"));
  });  