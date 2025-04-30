// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

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

// Crear o abrir base de datos
const db = new sqlite3.Database('./sanitadatabase.db');

// Crear tabla productos si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    precio REAL,
    imagen TEXT,
    categoria TEXT
  )`);
});

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

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
