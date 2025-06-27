// ---------------------- DEPENDENCIAS ---------------------- //
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const multer = require('multer');
const builder = require('xmlbuilder');

const app = express();
const port = process.env.PORT || 3000;

// ---------------------- CONEXIÓN POSTGRES ---------------------- //
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sanita',
  password: 'erick2006',
  port: 5000,
});

// ---------------------- CONFIGURACIÓN GENERAL ---------------------- //
app.use(express.static(__dirname));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use(express.json());
app.use(session({
  secret: 'sanita_clave_secreta',
  resave: false,
  saveUninitialized: true,
}));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'inicio.html');
  res.sendFile(filePath);
});

// ---------------------- SUBIDA DE IMÁGENES ---------------------- //
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'img/'),
  filename: (req, file, cb) => {
    const nombre = req.body.nombre || 'planta';
    const ext = path.extname(file.originalname);
    const limpio = nombre.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    cb(null, limpio + ext);
  },
});
const upload = multer({ storage });

// ---------------------- USUARIOS ---------------------- //
app.post('/registrar', async (req, res) => {
  const { nombre, correo, contrasena, imagen, codigoRol } = req.body;
  if (!nombre || !correo || !contrasena) return res.status(400).json({ error: "Faltan campos obligatorios." });

  const imagenFinal = imagen?.trim() ? imagen : "img/usuario.png";
  let rol = 'normal';
  if (codigoRol === 'proveedor2024') rol = 'proveedor';
  else if (codigoRol === 'moderador2024') rol = 'moderador';

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, imagen, rol)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombre, correo, contrasena, imagenFinal, rol]
    );
    req.session.usuarioId = result.rows[0].id;
    res.json({ mensaje: "Registro exitoso" });
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      return res.status(400).json({ error: "El correo ya está registrado." });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1 AND contrasena = $2",
      [correo, contrasena]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    req.session.usuarioId = user.id;
    req.session.usuarioRol = user.rol;
    res.json({ mensaje: 'Inicio de sesión exitoso', usuario: user.nombre, rol: user.rol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/usuario', async (req, res) => {
  if (!req.session.usuarioId) return res.json({ logueado: false });
  try {
    const result = await pool.query(
      "SELECT id, nombre, correo, imagen, rol FROM usuarios WHERE id = $1",
      [req.session.usuarioId]
    );
    res.json({ logueado: true, usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/usuario/actualizar', async (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: 'No autenticado' });
  const { nombre, imagen } = req.body;
  try {
    await pool.query(
      "UPDATE usuarios SET nombre = $1, imagen = $2 WHERE id = $3",
      [nombre, imagen, req.session.usuarioId]
    );
    res.json({ mensaje: 'Datos actualizados correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ mensaje: 'Sesión cerrada' });
});

// ---------------------- AQUI CONTINUAMOS ---------------------- //
// ---------------------- CARRITO ---------------------- //
app.post('/carrito/agregar', async (req, res) => {
  const uid = req.session.usuarioId;
  const { planta_id, cantidad } = req.body;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    const existe = await pool.query(
      `SELECT id, cantidad FROM carrito WHERE usuario_id = $1 AND planta_id = $2`,
      [uid, planta_id]
    );
    if (existe.rows.length > 0) {
      const nueva = existe.rows[0].cantidad + cantidad;
      await pool.query(
        `UPDATE carrito SET cantidad = $1 WHERE id = $2`,
        [nueva, existe.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO carrito (usuario_id, planta_id, cantidad) VALUES ($1, $2, $3)`,
        [uid, planta_id, cantidad]
      );
    }
    res.json({ mensaje: "Producto agregado al carrito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/carrito', async (req, res) => {
  const uid = req.session.usuarioId;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    const result = await pool.query(`
      SELECT c.id, c.cantidad, p.id AS planta_id, p.nombre, p.precio, p.imagen
      FROM carrito c
      JOIN plantas p ON c.planta_id = p.id
      WHERE c.usuario_id = $1
    `, [uid]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/carrito/:id', async (req, res) => {
  const uid = req.session.usuarioId;
  const id = req.params.id;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    await pool.query(`DELETE FROM carrito WHERE id = $1 AND usuario_id = $2`, [id, uid]);
    res.json({ mensaje: "Producto eliminado del carrito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- HISTORIAL PEDIDOS ---------------------- //
app.post('/pedido', async (req, res) => {
  const uid = req.session.usuarioId;
  if (!uid) return res.status(401).json({ error: "No autenticado" });
  try {
    const result = await pool.query(
      `INSERT INTO historial_pedidos (usuario_id) VALUES ($1) RETURNING id`,
      [uid]
    );
    res.json({ mensaje: "Pedido registrado", pedido_id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/pedido/estado', async (req, res) => {
  const uid = req.session.usuarioId;
  const { estado } = req.body;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    await pool.query(`
      UPDATE historial_pedidos SET estado = $1
      WHERE usuario_id = $2 AND id = (
        SELECT id FROM historial_pedidos WHERE usuario_id = $2
        ORDER BY fecha DESC LIMIT 1
      )
    `, [estado, uid]);
    res.json({ mensaje: "Estado actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/pedido/estado', async (req, res) => {
  const uid = req.session.usuarioId;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    const result = await pool.query(`
      SELECT estado FROM historial_pedidos
      WHERE usuario_id = $1
      ORDER BY fecha DESC LIMIT 1
    `, [uid]);
    if (result.rows.length === 0) return res.json({ estado: null });
    res.json({ estado: result.rows[0].estado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ PLANTAS DESTACADAS ------------------

app.get('/api/plantas', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, imagen FROM plantas ORDER BY id LIMIT 20'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener plantas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// ---------------------- RDF/XML ---------------------- //
app.get('/rdf/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const planta = await pool.query(
      `SELECT id, nombre, descripcion, imagen FROM plantas WHERE id = $1`,
      [id]
    );
    if (planta.rows.length === 0) return res.status(404).send("Planta no encontrada");

    const beneficios = await pool.query(
      `SELECT beneficio AS value FROM beneficios WHERE planta_id = $1`,
      [id]
    );
    const usos = await pool.query(
      `SELECT uso AS value FROM usos WHERE planta_id = $1`,
      [id]
    );

    const rdf = builder.create('rdf:RDF', { encoding: 'UTF-8' })
      .att('xmlns:rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
      .att('xmlns:rdfs', 'http://www.w3.org/2000/01/rdf-schema#')
      .att('xmlns:dc', 'http://purl.org/dc/elements/1.1/')
      .att('xmlns:sn', 'https://sanita.org/ontology#');

    const p = planta.rows[0];
    const node = rdf.ele('rdf:Description', {
      'rdf:about': `https://sanita.org/planta/${id}`
    });
    node.ele('rdfs:label', p.nombre);
    node.ele('dc:description', p.descripcion);
    beneficios.rows.forEach(b => node.ele('sn:beneficio', b.value));
    usos.rows.forEach(u => node.ele('sn:uso', u.value));
    node.ele('sn:imagen', p.imagen);

    res.set('Content-Type', 'application/rdf+xml');
    res.send(rdf.end({ pretty: true }));
  } catch (err) {
    res.status(500).send("Error interno");
  }
});

// ---------------------- RESUMEN INICIO ---------------------- //
app.get('/api/resumen-inicio', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.tipo, r.referencia_id,
             n.titulo AS noticia_titulo, n.imagen AS noticia_imagen,
             p.titulo AS pub_titulo, u.imagen AS usuario_imagen
      FROM resumen_inicio r
      LEFT JOIN noticias n ON r.tipo = 'noticia' AND n.id = r.referencia_id
      LEFT JOIN publicaciones p ON r.tipo = 'publicacion' AND p.id = r.referencia_id
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY r.id DESC
      LIMIT 10
    `);
    const formateado = result.rows.map(r => ({
      tipo: r.tipo,
      titulo: r.tipo === 'noticia' ? r.noticia_titulo : r.pub_titulo,
      imagen: r.tipo === 'noticia' ? r.noticia_imagen : r.usuario_imagen
    }));
    res.json(formateado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- INICIAR SERVIDOR ---------------------- //
console.log("Valor de process.env.PORT:", process.env.PORT);
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Error al iniciar el servidor:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
