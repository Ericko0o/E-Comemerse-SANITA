/* 
Descripción: Este archivo configura un servidor Express que sirve archivos HTML, CSS y JS, y 
establece una conexión a una base de datos SQLite. También define un endpoint para obtener 
productos desde la base de datos y los envía como respuesta en formato JSON. 
*/


//------------------------------------------------------------------------

// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

//------------------------------------------------------------------------

// Middleware de sesión (Asegurarse de instalar express-session: npm install express-session)

const session = require('express-session');

app.use(session({
  secret: 'sanita_clave_secreta', // cambia esto en producción
  resave: false,
  saveUninitialized: true,
}));


//------------------------------------------------------------------------

// Configurar servidor para aceptar JSON
app.use(express.json());


// Servir archivos estáticos (CSS, JS, img)
app.use('/CSS', express.static(path.join(__dirname, '../CSS')));
app.use('/JS', express.static(path.join(__dirname, '../JS')));
app.use('/img', express.static(path.join(__dirname, '../img')));


// Servir archivos HTML directamente

app.get('/inicio.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../inicio.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/registro.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../registro.html'));
});

app.get('/perfil.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../perfil.html'));
});

app.get('/catalogo.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../catalogo.html'));
});

app.get('/carrito.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../carrito.html'));
});

app.get('/comunidad.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../comunidad.html'));
});

app.get('/noticias.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../noticias.html'));
});

app.get('/producto.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../producto.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../inicio.html'));
});


//------------------------------------------------------------------------
// Configurar base de datos SQLite

// Crear o abrir base de datos
const db = new sqlite3.Database('./sanitadatabase.db');


// --------------------- USUARIOS ---------------------
// Endpoint para inicio de sesión

//Registro de usuario
app.post('/registrar', (req, res) => {
  const { nombre, correo, contrasena, imagen } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  const imagenFinal = imagen && imagen.trim() !== "" ? imagen : "img/usuario.png";

  db.run(
    "INSERT INTO usuarios (nombre, correo, contrasena, imagen) VALUES (?, ?, ?, ?)",
    [nombre, correo, contrasena, imagenFinal],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "El correo ya está registrado." });
        }
        return res.status(500).json({ error: err.message });
      }

      // Opcional: si estás usando express-session
      req.session.usuarioId = this.lastID;

      res.json({ mensaje: "Registro exitoso" });
    }
  );
});


//Login de usuario
app.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;
  db.get("SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?",
    [correo, contrasena], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: 'Credenciales inválidas' });

      req.session.usuarioId = row.id;
      res.json({ mensaje: 'Inicio de sesión exitoso', usuario: row.nombre });
    });
});

//Verificar sesion
app.get('/usuario', (req, res) => {
  if (!req.session.usuarioId) {
    return res.json({ logueado: false });
  }

  db.get("SELECT id, nombre, correo, imagen FROM usuarios WHERE id = ?", [req.session.usuarioId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ logueado: true, usuario: row });
  });
});

app.post('/usuario/actualizar', (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { nombre, imagen } = req.body;

  db.run(
    "UPDATE usuarios SET nombre = ?, imagen = ? WHERE id = ?",
    [nombre, imagen, req.session.usuarioId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ mensaje: 'Datos actualizados correctamente' });
    }
  );
});

//Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ mensaje: 'Sesión cerrada' });
});


// ---------------------- CARRITO ---------------------

// Obtener productos del carrito del usuario logueado

app.get('/carrito', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  const sql = `
    SELECT carrito.id AS carrito_id, productos.*
    FROM carrito
    JOIN productos ON carrito.producto_id = productos.id
    WHERE carrito.usuario_id = ?
  `;

  db.all(sql, [req.session.usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Agregar producto al carrito
app.post('/carrito', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  const { producto_id } = req.body;
  if (!producto_id) return res.status(400).json({ error: "Falta producto_id" });

  // Evitar duplicados
  db.get(
    "SELECT id FROM carrito WHERE usuario_id = ? AND producto_id = ?",
    [req.session.usuarioId, producto_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        return res.json({ mensaje: "Producto ya está en el carrito" });
      } else {
        db.run(
          "INSERT INTO carrito (usuario_id, producto_id) VALUES (?, ?)",
          [req.session.usuarioId, producto_id],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: "Producto agregado", id: this.lastID });
          }
        );
      }
    }
  );
});

// Eliminar un producto del carrito
app.delete('/carrito/:id', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  const carritoId = req.params.id;

  db.run(
    "DELETE FROM carrito WHERE id = ? AND usuario_id = ?",
    [carritoId, req.session.usuarioId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "No encontrado" });
      res.json({ mensaje: "Producto eliminado del carrito" });
    }
  );
});


// --------------------- PRODUCTOS ---------------------

// Endpoint para obtener todos los productos
app.get('/api/productos', (req, res) => {
  db.all('SELECT * FROM productos', (err, rows) => {
    if (err) {
      console.error('Error obteniendo productos:', err.message);
      res.status(500).send("Error al obtener productos");
    } else {
      res.json(rows);
    }
  });
});


//------------------------------------------------------------------------

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
