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
const port = process.env.PORT || 3000;;

//------------------------------------------------------------------------

// 
app.use(express.static(path.join(__dirname, '..')));


// Middleware de sesión (Asegurarse de instalar express-session: npm install express-session)

const session = require('express-session');

app.use(session({
  secret: 'sanita_clave_secreta', // cambia esto en producción
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));




//------------------------------------------------------------------------

// Configurar servidor para aceptar JSON
app.use(express.json());




//=========================================================================
// Endpoint para buscar plantas por nombre - Adaptado a la tabla 'plantas'

app.get('/api/buscar', (req, res) => {
  const q = req.query.q || '';
  const parametro = `%${q}%`;

  const sql = `
    SELECT
      p.id,
      p.nombre,
      p.precio,
      p.imagen,
      c.nombre AS categoria
    FROM plantas p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.nombre LIKE ?
  `;

  db.all(sql, [parametro], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

//=========================================================================


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

app.get('/informacion.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../informacion.html'));
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

app.get('/nueva-publicacion.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../nueva-publicacion.html'));
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



//-----------------------------------------------------

app.get('/api/noticia/:id', (req, res) => {
  db.get('SELECT * FROM noticias WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(row);
  });
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


// (Recreamos la tabla carrito apuntando ahora a plantas)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS carrito (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      planta_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (planta_id) REFERENCES plantas(id)
    )
  `);
});

app.get('/carrito', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  const sql = `
    SELECT
      c.id            AS carrito_id,
      c.cantidad,
      p.id            AS producto_id,
      p.nombre,
      p.precio,
      p.imagen
    FROM carrito c
    JOIN plantas p ON c.planta_id = p.id
    WHERE c.usuario_id = ?
  `;
  db.all(sql, [req.session.usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/carrito', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });
  const { producto_id } = req.body;
  if (!producto_id) return res.status(400).json({ error: "Falta producto_id" });

  // nota: renombramos internamente a planta_id
  db.get(
    "SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND planta_id = ?",
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
          "INSERT INTO carrito (usuario_id, planta_id, cantidad) VALUES (?, ?, ?)",
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

// Eliminar un producto del carrito
app.delete('/carrito/:id', (req, res) => {
  if (!req.session.usuarioId) 
    return res.status(401).json({ error: "No autenticado" });

  const carritoId = req.params.id;

  db.run(
    `DELETE FROM carrito 
     WHERE id = ? AND usuario_id = ?`,
    [carritoId, req.session.usuarioId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) 
        return res.status(404).json({ error: "No encontrado" });
      res.json({ mensaje: "Producto eliminado del carrito" });
    }
  );
});

// Vaciar todo el carrito del usuario logueado
app.delete('/vaciar-carrito', (req, res) => {
  if (!req.session.usuarioId) 
    return res.status(401).json({ error: "No autenticado" });

  db.run(
    `DELETE FROM carrito 
     WHERE usuario_id = ?`,
    [req.session.usuarioId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Carrito vaciado" });
    }
  );
});



// --------------------- PRODUCTOS (ahora plantas) ---------------------
// Endpoint para obtener todos los productos

// Obtener todos los productos (plantas) con su categoría
app.get('/api/productos', (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.nombre,
      p.precio,
      p.imagen,
      c.nombre AS categoria
    FROM plantas p
    LEFT JOIN categorias c
      ON p.categoria_id = c.id
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Error obteniendo productos:', err.message);
      return res.status(500).send("Error al obtener productos");
    }
    res.json(rows);
  });
});

// Obtener producto por ID → ahora planta
app.get('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  db.get(
    `SELECT id, nombre, precio, imagen, descripcion, categoria_id
     FROM plantas
     WHERE id = ?`,
    [id],
    (err, planta) => {
      if (err) {
        console.error('Error obteniendo producto:', err.message);
        return res.status(500).send("Error al obtener producto");
      }
      if (!planta) return res.status(404).send("Producto no encontrado");

      // opcional: incluir nombre de categoría
      db.get(
        `SELECT nombre AS categoria FROM categorias WHERE id = ?`,
        [planta.categoria_id],
        (err2, cat) => {
          if (err2) console.warn(err2);
          if (cat) planta.categoria = cat.categoria;
          res.json(planta);
        }
      );
    }
  );
});
// ----------------------NOTICIAS ---------------------------

// Obtener todas las noticias
app.get('/api/noticias', (req, res) => {
db.all('SELECT * FROM noticias', (err, rows) => {
  if (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  } else {
    console.log('Noticias encontradas:', rows); // <--- VERIFICA ESTO EN LA CONSOLA
    res.json(rows);
  }
});
});


// Obtener una sola noticia por ID
app.get('/api/noticia/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM noticias WHERE id = ?', [id], (err, row) => {
      if (err) {
          console.error('Error al obtener la noticia:', err);
          res.status(500).json({ error: 'Error del servidor' });
      } else if (!row) {
          res.status(404).json({ error: 'Noticia no encontrada' });
      } else {
          res.json(row);
      }
  });
});


// Obtener una noticia aleatoria
app.get('/api/noticias/aleatoria', (req, res) => {
 db.get('SELECT * FROM noticias ORDER BY RANDOM() LIMIT 1', (err, row) => {
   if (err) {
     console.error('Error al obtener noticia aleatoria:', err);
     res.status(500).json({ error: 'Error del servidor' });
   } else if (!row) {
     res.status(404).json({ error: 'No hay noticias disponibles' });
   } else {
     res.json(row);
   }
 });
});

// ------------------------------ COMUNIDAD ---------------------------------

const calcularFecha = () => new Date().toISOString().split('T')[0];

// Obtener publicaciones con info de usuario
app.get('/api/publicaciones', (req, res) => {
  const sql = `SELECT p.id, p.titulo, p.contenido, p.fecha, u.nombre, u.imagen 
               FROM publicaciones p 
               JOIN usuarios u ON p.usuario_id = u.id 
               ORDER BY p.fecha DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener hilos de una publicación
app.get('/api/hilos/:publicacionId', (req, res) => {
  const pubId = req.params.publicacionId;
  const sql = `SELECT h.contenido, h.fecha, u.nombre, u.imagen 
               FROM hilos h 
               JOIN usuarios u ON h.usuario_id = u.id 
               WHERE h.publicacion_id = ? 
               ORDER BY h.fecha ASC`;
  db.all(sql, [pubId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Agregar nueva publicación
app.post('/api/publicaciones', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: 'No autenticado' });
  const { titulo, contenido } = req.body;
  const fecha = calcularFecha();

  db.run(
    `INSERT INTO publicaciones (usuario_id, titulo, contenido, fecha) VALUES (?, ?, ?, ?)`,
    [req.session.usuarioId, titulo, contenido, fecha],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Publicación creada', id: this.lastID });
    }
  );
});

// Agregar nuevo comentario (hilo)
app.post('/api/hilos/:publicacionId', (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: 'No autenticado' });
  const { contenido } = req.body;
  const publicacionId = req.params.publicacionId;
  const fecha = calcularFecha();

  db.run(
    `INSERT INTO hilos (publicacion_id, usuario_id, contenido, fecha) VALUES (?, ?, ?, ?)`,
    [publicacionId, req.session.usuarioId, contenido, fecha],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Comentario agregado' });
    }
  );
});



//------------------------------ PLANTAS INFORMACION ----------------------------------

// Endpoint para obtener todas las plantas destacadas


// Listar plantas destacadas (antes de informacion)
app.get('/api/plantas', (req, res) => {
  db.all(
    `SELECT id, nombre, imagen
     FROM plantas`,
    [], (err, rows) => {
      if (err) {
        console.error('Error al obtener las plantas:', err.message);
        return res.status(500).json({ error: 'Error al obtener las plantas' });
      }
      res.json(rows);
    }
  );
});

// Obtener planta completa por ID (antes de informacion/:id)
app.get('/api/plantas/:id', (req, res) => {
  const id = req.params.id;
  db.get(
    `SELECT id, nombre, descripcion, imagen, categoria_id
     FROM plantas
     WHERE id = ?`,
    [id], (err, planta) => {
      if (err) {
        console.error('Error al obtener la planta:', err.message);
        return res.status(500).json({ error: 'Error al obtener la planta' });
      }
      if (!planta) return res.status(404).json({ error: 'Planta no encontrada' });

      // 1) nombre de la categoría
      db.get(
        `SELECT nombre FROM categorias WHERE id = ?`,
        [planta.categoria_id],
        (err2, cat) => {
          if (cat) planta.categoria = cat.nombre;

          // 2) beneficios
          db.all(
            `SELECT beneficio FROM beneficios WHERE planta_id = ?`,
            [id],
            (err3, benRows) => {
              planta.beneficios = benRows.map(b => b.beneficio);

              // 3) usos
              db.all(
                `SELECT uso FROM usos WHERE planta_id = ?`,
                [id],
                (err4, usoRows) => {
                  planta.usos = usoRows.map(u => u.uso);
                  res.json(planta);
                }
              );
            }
          );
        }
      );
    }
  );
});

// Búsqueda por nombre (antes /api/informacion?nombre=)
app.get('/api/informacion', (req, res) => {
  const nombre = req.query.nombre;
  if (!nombre) return res.status(400).json({ error: "Falta nombre" });

  db.get(
    `SELECT id FROM plantas WHERE nombre = ?`,
    [nombre],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Información no encontrada" });
      // redirigir internamente al endpoint de detalle
      res.redirect(`/api/plantas/${row.id}`);
    }
  );
});

//---------------------- BUSQUEDA ---------------------------


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

// ----------------------------------------
// RDF/XML GENERACIÓN DINÁMICA
// ----------------------------------------

// Endpoint /rdf sigue igual, sin tocar.

// Endpoint RDF por planta → ahora lee de plantas, beneficios y usos
app.get('/rdf/:id', (req, res) => {
  const id = req.params.id;
  db.get(
    `SELECT id, nombre, descripcion, imagen FROM plantas WHERE id = ?`,
    [id],
    (err, planta) => {
      if (err) return res.status(500).send("Error interno");
      if (!planta) return res.status(404).send("Planta no encontrada");

      // recoger beneficios y usos
      db.all(
        `SELECT beneficio AS value FROM beneficios WHERE planta_id = ?`,
        [id],
        (err2, bRows) => {
          db.all(
            `SELECT uso AS value FROM usos WHERE planta_id = ?`,
            [id],
            (err3, uRows) => {
              const builder = require('xmlbuilder');
              const rdf = builder.create('rdf:RDF', { encoding: 'UTF-8' })
                .att('xmlns:rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
                .att('xmlns:rdfs', 'http://www.w3.org/2000/01/rdf-schema#')
                .att('xmlns:dc', 'http://purl.org/dc/elements/1.1/')
                .att('xmlns:sn', 'https://sanita.org/ontology#');

              const node = rdf.ele('rdf:Description', {
                'rdf:about': `https://sanita.org/planta/${id}`
              });
              node.ele('rdfs:label', planta.nombre);
              node.ele('dc:description', planta.descripcion);
              bRows.forEach(b => node.ele('sn:beneficio', b.value));
              uRows.forEach(u => node.ele('sn:uso', u.value));
              node.ele('sn:imagen', planta.imagen);

              res.set('Content-Type', 'application/rdf+xml');
              res.send(rdf.end({ pretty: true }));
            }
          );
        }
      );
    }
  );
});




// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Error al iniciar el servidor:', err);
});