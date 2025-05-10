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
  const { nombre, correo, contrasena } = req.body;
  db.run("INSERT INTO usuarios (nombre, correo, contrasena, imagen) VALUES (?, ?, ?, ?)",
    [nombre, correo, contrasena, 'img/usuario.png'], // imagen por defecto
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      req.session.usuarioId = this.lastID;
      res.json({ mensaje: 'Registro exitoso' });
    });
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

//Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ mensaje: 'Sesión cerrada' });
});


// --------------------- CARRITO ---------------------



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
