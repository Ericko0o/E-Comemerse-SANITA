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

// Operaciones en serie para evitar conflictos
db.serialize(() => {
  // Crear tabla items si no existe
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`);

  // Crear tabla productos si no existe
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    precio REAL,
    imagen TEXT,
    categoria TEXT
  )`);

  // Insertar productos si la tabla 'productos' está vacía
  db.get("SELECT COUNT(*) as count FROM productos", (err, row) => {
    if (err) {
      console.error('Error verificando productos:', err.message);
      return;
    }

    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO productos (nombre, precio, imagen, categoria) VALUES (?, ?, ?, ?)");

      // CICATRIZANTES
      stmt.run("Sangre de Grado", 20, "IMG/sangre-de-grado.jpg", "cicatrizantes");
      stmt.run("Matico", 15, "IMG/matico.jpeg", "cicatrizantes");
      stmt.run("Llanten", 25, "IMG/llanten.jpg", "cicatrizantes");
      stmt.run("Flor de Arena", 25, "IMG/flor-de-arena.jpg", "cicatrizantes");
      stmt.run("Chilca", 20, "IMG/chilca.jpg", "cicatrizantes");

      // INMUNOLÓGICO
      stmt.run("Uña de Gato", 20, "IMG/una-de-gato.jpg", "inmunologico");
      stmt.run("Ayahuasca", 15, "IMG/ayahuasca.jpeg", "inmunologico");
      stmt.run("Sacha Inchi", 25, "IMG/sacha-inchi.jpg", "inmunologico");
      stmt.run("Muña", 25, "IMG/muna.jpg", "inmunologico");
      stmt.run("Chuchuhuasi", 20, "IMG/chuchuhuasi.jpg", "inmunologico");

      stmt.finalize();
      console.log('Productos insertados automáticamente.');
    } else {
      console.log('Productos ya existentes, no se insertaron de nuevo.');
    }
  });
});

// Endpoint para obtener todos los items
app.get('/items', (req, res) => {
  db.all("SELECT * FROM items", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ items: rows });
  });
});

// Endpoint para agregar nuevo item
app.post('/add', (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO items (name) VALUES (?)", [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Item agregado', id: this.lastID });
  });
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
