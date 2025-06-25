document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/pedido/estado', { credentials: 'include' });
    const data = await res.json();
    const estado = data.estado;

    // Si el pedido ya fue recibido, mostrar mensaje y salir
    if (estado === "recibido") {
      document.querySelector("main").innerHTML = "<h2>Tu pedido ha sido recogido</h2>";
      return;
    }

    const hoy = new Date();
    const fechaCamino = new Date(hoy);
    fechaCamino.setDate(hoy.getDate() + 1);
    const fechaDestino = new Date(hoy);
    fechaDestino.setDate(hoy.getDate() + 2);
    const ahora = new Date();

   /* const hoy = new Date("2024-01-01");
    const fechaCamino = new Date("2024-01-02");
    const fechaDestino = new Date("2024-01-03");

    // Simula hoy como si fuera 3 de enero de 2024:
    const ahora = new Date("2024-01-03");*/

    const format = (fecha) =>
      fecha.toLocaleDateString("es-PE", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

    document.getElementById("fecha-origen").textContent = format(hoy);
    document.getElementById("fecha-camino").textContent = format(fechaCamino);
    document.getElementById("fecha-destino").textContent = format(fechaDestino);


    if (ahora >= hoy) {
      document.getElementById("origen").classList.add("activo");
    }
    if (ahora >= fechaCamino) {
      document.getElementById("camino").classList.add("activo");
    }
    if (ahora >= fechaDestino) {
      document.getElementById("destino").classList.add("activo");
    }

    // Botón "Ya lo recogí"
    document.getElementById("btn-recibido").addEventListener("click", async () => {
      await fetch('/pedido/estado', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: "recibido" })
      });

      window.location.href = "/catalogo.html";
    });

  } catch (err) {
    console.error("Error cargando estado del pedido:", err);
    document.querySelector("main").innerHTML = "<h2>Error al cargar el seguimiento del pedido.</h2>";
  }
});