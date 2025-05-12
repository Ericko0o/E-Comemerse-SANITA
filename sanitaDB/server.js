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

app.get('/pago.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../pago.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../inicio.html'));
});


//------------------------------------------------------------------------
// Configurar base de datos SQLite

// Crear o abrir base de datos
const db = new sqlite3.Database('./sanitadatabase.db');


db.run(`CREATE TABLE IF NOT EXISTS noticias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT,
  contenido TEXT,
  fecha TEXT,
  imagen TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS publicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  titulo TEXT,
  contenido TEXT,
  fecha TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS hilos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publicacion_id INTEGER,
  usuario_id INTEGER,
  contenido TEXT,
  fecha TEXT,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS resumen_inicio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT, -- 'noticia' o 'publicacion'
  referencia_id INTEGER
)`);


db.get("SELECT COUNT(*) as count FROM noticias", (err, row) => {
  if (row.count === 0) {
    db.run("INSERT INTO noticias (titulo, contenido, fecha, imagen) VALUES (?, ?, ?, ?)", [
      "Beneficios de la Uña de Gato",
      "La uña de gato tiene propiedades antiinflamatorias y estimula el sistema inmunológico.",
      "2024-01-20",
      "img/una-de-gato.jpg"
    ]);

    db.run("INSERT INTO noticias (titulo, contenido, fecha, imagen) VALUES (?, ?, ?, ?)", [
      "Plantas cicatrizantes en la medicina andina",
      "El llantén y el matico son reconocidos por su efectividad para curar heridas.",
      "2024-02-10",
      "img/matico.jpeg"
    ]);
  }
});

db.get("SELECT COUNT(*) as count FROM publicaciones", (err, row) => {
  if (row.count === 0) {
    db.get("SELECT id FROM usuarios LIMIT 1", (err, usuario) => {
      if (usuario) {
        db.run("INSERT INTO publicaciones (usuario_id, titulo, contenido, fecha) VALUES (?, ?, ?, ?)", [
          usuario.id,
          "Mi experiencia con el llantén",
          "Utilicé llantén para una quemadura leve y me ayudó a sanar en pocos días.",
          "2024-03-05"
        ], function(err) {
          const publicacionId = this.lastID;
          db.run("INSERT INTO hilos (publicacion_id, usuario_id, contenido, fecha) VALUES (?, ?, ?, ?)", [
            publicacionId,
            usuario.id,
            "Gracias por compartir, yo también he tenido buenos resultados con el llantén.",
            "2024-03-06"
          ]);
        });
      }
    });
  }
});

db.get("SELECT COUNT(*) as count FROM resumen_inicio", (err, row) => {
  if (row.count === 0) {
    db.run("INSERT INTO resumen_inicio (tipo, referencia_id) VALUES ('noticia', 1)");
    db.run("INSERT INTO resumen_inicio (tipo, referencia_id) VALUES ('noticia', 2)");
    db.run("INSERT INTO resumen_inicio (tipo, referencia_id) VALUES ('publicacion', 1)");
  }
});




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
// CREAR TABLA CARRITO SI NO EXISTE (con cantidad)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS carrito (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )
  `);
});

app.get('/carrito', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  const sql = `
  SELECT carrito.id AS carrito_id, carrito.cantidad, productos.id AS producto_id, productos.nombre, productos.precio, productos.imagen
  FROM carrito
  JOIN productos ON carrito.producto_id = productos.id
  WHERE carrito.usuario_id = ?
`;

  db.all(sql, [req.session.usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Agregar producto al carrito (con cantidad)
app.post('/carrito', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  const { producto_id } = req.body;
  if (!producto_id) return res.status(400).json({ error: "Falta producto_id" });

  db.get(
    "SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?",
    [req.session.usuarioId, producto_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        const nuevaCantidad = row.cantidad + 1;
        db.run(
          "UPDATE carrito SET cantidad = ? WHERE id = ?",
          [nuevaCantidad, row.id],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: "Cantidad actualizada", cantidad: nuevaCantidad });
          }
        );
      } else {
        db.run(
          "INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)",
          [req.session.usuarioId, producto_id, 1],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: "Producto agregado", id: this.lastID });
          }
        );
      }
    }
  );
});

// Actualizar cantidad de producto en el carrito
app.put('/carrito/:id', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  const carritoId = req.params.id;
  const { cantidad } = req.body;

  if (cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  db.run(
    "UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?",
    [cantidad, carritoId, req.session.usuarioId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "No encontrado" });
      res.json({ mensaje: "Cantidad actualizada" });
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

// Actualizar cantidad de un producto en el carrito
app.put('/carrito/:id', (req, res) => {
  const { cantidad } = req.body;
  const carritoId = req.params.id;

  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  db.run(
    "UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?",
    [cantidad, carritoId, req.session.usuarioId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Cantidad actualizada" });
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
app.get('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error obteniendo producto:', err.message);
      res.status(500).send("Error al obtener producto");
    } else if (!row) {
      res.status(404).send("Producto no encontrado");
    } else {
      res.json(row);
    }
  });
});
// ----------------------NOTICIAS ---------------------------


// --------------------- PUBLICACIONES ----------------------


//--------------------- HILOS -------------------------------



// --------------------- RESUMEN INICIO ---------------------

app.get('/api/resumen-inicio', (req, res) => {
  const sql = `
    SELECT r.id, r.tipo, r.referencia_id,
           n.titulo AS noticia_titulo, n.imagen AS noticia_imagen,
           p.titulo AS pub_titulo, u.imagen AS usuario_imagen
    FROM resumen_inicio r
    LEFT JOIN noticias n ON r.tipo = 'noticia' AND n.id = r.referencia_id
    LEFT JOIN publicaciones p ON r.tipo = 'publicacion' AND p.id = r.referencia_id
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    ORDER BY r.id DESC
    LIMIT 10
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const formateado = rows.map(r => ({
        tipo: r.tipo,
        titulo: r.tipo === 'noticia' ? r.noticia_titulo : r.pub_titulo,
        imagen: r.tipo === 'noticia' ? r.noticia_imagen : r.usuario_imagen
      }));
      res.json(formateado);
    }
  });
});



//------------------------------------------------------------------------

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
