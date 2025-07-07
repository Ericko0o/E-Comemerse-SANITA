// ------------------ producto.js (Ultra Optimizado) ------------------ //

async function obtenerProductoPorId(id) {
  const res = await fetch(`/api/productos/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error("Producto no encontrado");
  return await res.json();
}

async function obtenerInfoPorNombre(nombre) {
  try {
    const res = await fetch(`/api/informacion?nombre=${encodeURIComponent(nombre)}`, { credentials: 'include' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function verificarUsuario() {
  try {
    const res = await fetch("/usuario", { credentials: 'include' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function agregarAlCarrito(idProducto) {
  const usuario = await verificarUsuario();
  if (!usuario || !usuario.logueado) {
    alert("Debe iniciar sesión para agregar productos.");
    localStorage.setItem("ruta-previa", window.location.href);
    return window.location.href = "/login.html";
  }

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
}

async function modificarCantidad(cambio) {
  const cantidadElem = document.getElementById("cantidad");
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  const operacion = cambio > 0 ? "mas" : "menos";

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
}

function actualizarCantidadVisual(cantidad) {
  const cantidadElem = document.getElementById("cantidad");
  if (cantidadElem) cantidadElem.textContent = cantidad;
}

function renderProducto(producto, descripcion = "Sin descripción.", linkInfo = "") {
  const cont = document.getElementById("producto-detalle");
  if (!cont) return;

  cont.innerHTML = `
    <div class="detalle-imagen">
      <img src="${producto.imagen.startsWith('http') ? producto.imagen : '/' + producto.imagen}" alt="${producto.nombre}">
    </div>

    <div class="detalle-info">
      <a href="/carrito.html" class="carrito-integrado" title="Ir al carrito">
        <img src="/img/Carrito.png" alt="Carrito" class="carrito-img">
      </a>
      <h2>${producto.nombre}</h2>
      <div class="precio-detalle">S/. ${producto.precio}</div>
      <p id="descripcion">${descripcion}</p>
      <div class="botones-container">
        <button class="boton-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
        <div class="cantidad-container">
          <button class="btn-cantidad" onclick="modificarCantidad(-1)">–</button>
          <span id="cantidad">0</span>
          <button class="btn-cantidad" onclick="modificarCantidad(1)">+</button>
        </div>
      </div>
      <div id="info-extra">${linkInfo}</div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(window.location.search).get("id");
  const contenedor = document.getElementById("producto-detalle");

  if (!id) {
    contenedor.textContent = "Producto no especificado.";
    return;
  }

  // ⏳ Mostrar mensaje de carga
  contenedor.innerHTML = "<div class='loader'>Cargando producto...</div>";

  try {
    const producto = await obtenerProductoPorId(id);
    renderProducto(producto); // render básico de inmediato

    // Paralelo: obtener info adicional y cantidad actual
    const [info, cantidadRes] = await Promise.all([
      obtenerInfoPorNombre(producto.nombre),
      fetch(`/carrito/cantidad/${id}`, { credentials: 'include' })
        .then(res => res.json())
        .catch(() => ({ cantidad: 0 }))
    ]);

    if (cantidadRes?.cantidad != null) {
      actualizarCantidadVisual(cantidadRes.cantidad);
    }

    if (info?.descripcion) {
      document.getElementById("descripcion").textContent = info.descripcion;
    }

    if (info?.id) {
      document.getElementById("info-extra").innerHTML = `
        <p><a href="/informacion.html?id=${info.id}" class="info-planta">Ver más sobre esta planta</a></p>
      `;
    }

  } catch (err) {
    contenedor.innerHTML = "<p>Error al cargar el producto.</p>";
    console.error(err);
  }
});