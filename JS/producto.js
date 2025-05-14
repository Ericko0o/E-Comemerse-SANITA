//Obtener producto por ID
async function obtenerProductoPorId(id) {
  try {
    const res = await fetch(`/api/productos/${id}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error("Producto no encontrado");
    return await res.json();
  } catch (err) {
    console.error("Error al obtener producto:", err);
    return null;
  }
}

//Obtener info adicional por nombre de planta
async function obtenerInfoPorNombre(nombre) {
  try {
    const res = await fetch(
      `/api/informacion?nombre=${encodeURIComponent(nombre)}`,
      { credentials: 'include' }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error al obtener info adicional:", err);
    return null;
  }
}

//Verificar usuario para carrito
async function verificarUsuario() {
  try {
    const res = await fetch("/usuario", { credentials: 'include' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Agregar al carrito
async function agregarAlCarrito(idProducto) {
  const usuario = await verificarUsuario();
  if (!usuario || !usuario.logueado) {
    alert("Debe iniciar sesión para agregar productos al carrito.");
    localStorage.setItem("ruta-previa", window.location.href);
    return window.location.href = "/login.html";
  }
  try {
    const res = await fetch("/carrito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ producto_id: idProducto })
    });
    if (res.ok) {
      const data = await res.json();
      alert(data.mensaje || "Producto agregado al carrito");
    } else if (res.status === 401) {
      alert("Debe iniciar sesión.");
      window.location.href = "/login.html";
    } else {
      const err = await res.json();
      alert(err.error || "Error al agregar producto");
    }
  } catch (err) {
    console.error(err);
    alert("Error de red");
  }
}

//renderizar el producto, descripción y enlace a información
function renderProducto(producto, info) {
  const cont = document.getElementById("producto-detalle");

  // Escoger descripción: primero la de info, luego producto, luego placeholder
  const descripcion = info?.descripcion || producto.descripcion || "Sin descripción disponible.";
  // Si hay info, construye el link a informacion.html?id=info.id
  const linkInfo = info
    ? `<p>
        <a href="/informacion.html?id=${info.id}" class="info-planta">
          Ver más sobre esta planta
        </a>
      </p>`
    : "";

  cont.innerHTML = `
    <img src="/img/${producto.imagen.split("/").pop()}" alt="${producto.nombre}">
    <div class="detalle-info">
      <h2>${producto.nombre}</h2>
      <div class="precio-detalle">S/. ${producto.precio}</div>
      <p>${descripcion}</p>
      <button class="boton-agregar" onclick="agregarAlCarrito(${producto.id})">
        Agregar al carrito
      </button>
      ${linkInfo}
    </div>
  `;
}

//Al cargar la página, unir todo
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    document.getElementById("producto-detalle").textContent = "Producto no especificado.";
    return;
  }

  const producto = await obtenerProductoPorId(id);
  if (!producto) {
    document.getElementById("producto-detalle").textContent = "Producto no encontrado.";
    return;
  }

  // Obtener info extra por nombre
  const info = await obtenerInfoPorNombre(producto.nombre);

  // Renderizar con o sin info
  renderProducto(producto, info);
});