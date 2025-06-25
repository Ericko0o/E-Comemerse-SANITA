// Obtener producto por ID
async function obtenerProductoPorId(id) {
  try {
    const res = await fetch(`/api/productos/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error("Producto no encontrado");
    return await res.json();
  } catch (err) {
    console.error("Error al obtener producto:", err);
    return null;
  }
}

// Obtener info adicional por nombre
async function obtenerInfoPorNombre(nombre) {
  try {
    const res = await fetch(`/api/informacion?nombre=${encodeURIComponent(nombre)}`, { credentials: 'include' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error al obtener info adicional:", err);
    return null;
  }
}

// Verificar sesión de usuario
async function verificarUsuario() {
  try {
    const res = await fetch("/usuario", { credentials: 'include' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Agregar producto al carrito
async function agregarAlCarrito(idProducto) {
  const usuario = await verificarUsuario();
  if (!usuario || !usuario.logueado) {
    alert("Debe iniciar sesión para agregar productos.");
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

    const data = await res.json();
    if (res.ok) {
      alert(data.mensaje || "Producto agregado");
      actualizarCantidadVisual(data.cantidad || 1);
    } else {
      alert(data.error || "Error al agregar producto");
    }
  } catch (err) {
    console.error("Error al agregar producto:", err);
  }
}

// Modificar cantidad desde botones +/–
async function modificarCantidad(cambio) {
  const cantidadElem = document.getElementById("cantidad");
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  const operacion = cambio > 0 ? "mas" : "menos";

  try {
    const res = await fetch("/carrito/cantidad", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ producto_id: id, operacion })
    });
    const data = await res.json();
    if (res.ok) {
      actualizarCantidadVisual(data.nuevaCantidad);
    } else {
      alert(data.error || "Error al modificar cantidad");
    }
  } catch (err) {
    console.error("Error modificando cantidad:", err);
  }
}

// Mostrar cantidad visualmente
function actualizarCantidadVisual(cantidad) {
  const cantidadElem = document.getElementById("cantidad");
  if (cantidadElem) cantidadElem.textContent = cantidad;
}

// Renderizar detalle del producto
function renderProducto(producto, info) {
  const cont = document.getElementById("producto-detalle");
  const descripcion = info?.descripcion || producto.descripcion || "Sin descripción.";
  const linkInfo = info ? `<p><a href="/informacion.html?id=${info.id}" class="info-planta">Ver más sobre esta planta</a></p>` : "";

  cont.innerHTML = `
    <div class="detalle-imagen">
      <img src="/img/${producto.imagen.split("/").pop()}" alt="${producto.nombre}">
    </div>
    <div class="detalle-info">
      <a href="/carrito.html" class="carrito-integrado" title="Ir al carrito">
        <img src="/img/Carrito.png" alt="Carrito" class="carrito-img">
      </a>
      <h2>${producto.nombre}</h2>
      <div class="precio-detalle">S/. ${producto.precio}</div>
      <p>${descripcion}</p>
      <div class="botones-container">
        <button class="boton-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
        <div class="cantidad-container">
          <button class="btn-cantidad" onclick="modificarCantidad(-1)">–</button>
          <span id="cantidad">0</span>
          <button class="btn-cantidad" onclick="modificarCantidad(1)">+</button>
        </div>
      </div>
      ${linkInfo}
    </div>
  `;
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(window.location.search).get("id");
  const contenedor = document.getElementById("producto-detalle");

  if (!id) {
    contenedor.textContent = "Producto no especificado.";
    return;
  }

  const producto = await obtenerProductoPorId(id);
  if (!producto) {
    contenedor.textContent = "Producto no encontrado.";
    return;
  }

  const info = await obtenerInfoPorNombre(producto.nombre);

  // Renderizar primero
  renderProducto(producto, info);

  // Luego de renderizar, cargar cantidad real desde base de datos
  try {
    const res = await fetch(`/carrito/cantidad/${id}`, { credentials: 'include' });
    const data = await res.json();
    actualizarCantidadVisual(data.cantidad || 0);
  } catch (err) {
    console.error("Error obteniendo cantidad:", err);
  }
});