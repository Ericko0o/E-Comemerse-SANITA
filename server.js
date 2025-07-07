require('dotenv').config(); 
// ---------------------- DEPENDENCIAS ---------------------- //
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const multer = require('multer');
const builder = require('xmlbuilder');
const compression = require('compression');
const NodeCache = require('node-cache'); 
const cloudinary = require('cloudinary').v2;

const { CloudinaryStorage } = require('multer-storage-cloudinary');


const app = express();
const port = process.env.PORT || 3000;

// ------------------------------------------Configuracion de variables de entorno----------------------------------------
// CONEXIÓN POSTGRES (RAILWAY - con variables de entorno)
console.log("Intentando conectar a la base de datos con las siguientes variables de entorno:");
console.log("PGHOST:", process.env.PGHOST);
console.log("PGPORT:", process.env.PGPORT);
console.log("PGUSER:", process.env.PGUSER);
console.log("PGPASSWORD:", process.env.PGPASSWORD ? '********' : 'undefined'); // No mostrar la contraseña real por seguridad
console.log("PGDATABASE:", process.env.PGDATABASE);

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const cache = new NodeCache({ stdTTL: 60 });

// AÑADE ESTE BLOQUE PARA MANEJAR ERRORES DE CONEXIÓN INICIAL
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error al intentar conectar a la base de datos:', err.stack);
    // Este `throw` detendrá el proceso de Node.js si la conexión inicial falla
    // para evitar que se quede atascado.
    throw err;
  } else {
    console.log('¡Conexión exitosa a la base de datos!');
    // Libera el cliente de la conexión
    done();
  }
});

// ---------------------- CLOUDINARY ---------------------- //
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// ---------------------- CONFIGURACIÓN GENERAL ---------------------- //
app.use(compression());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d' // cache por 7 días
}));
app.use(express.static(__dirname));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use(express.json());
app.use(session({
  secret: 'sanita_clave_secreta',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'inicio.html');
  res.sendFile(filePath);
});

// ---------------------- SUBIDA DE IMÁGENES A CLOUDINARY ---------------------- //
const storage = new CloudinaryStorage({

  cloudinary: cloudinary,
  params: async (req, file) => {
    const nombre = req.body.nombre || 'planta';
    const limpio = nombre.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    return {
      folder: 'sanita', // Puedes cambiar el nombre de la carpeta si deseas
      public_id: limpio,
      format: 'jpg',
      transformation: [{ width: 800, crop: 'limit' }]
    };
  }
});
const upload = multer({ storage });

// Agregar imagen
app.post('/api/subir-planta', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, descripcion, categoria_id } = req.body;
    const imageUrl = req.file.path; // URL de Cloudinary

    const query = `
      INSERT INTO plantas (nombre, precio, imagen, descripcion, categoria_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [nombre, precio, imageUrl, descripcion, categoria_id];

    const result = await pool.query(query, values);

    res.status(200).json({
      mensaje: 'Planta registrada correctamente',
      planta: result.rows[0]
    });
  } catch (error) {
    console.error('Error al subir planta:', error);
    res.status(500).json({ error: 'Error al registrar planta' });
  }
});


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
// Crear tabla carrito (solo ejecutar una vez o usar migraciones)
pool.query(`
  CREATE TABLE IF NOT EXISTS carrito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    planta_id INTEGER NOT NULL REFERENCES plantas(id),
    cantidad INTEGER NOT NULL DEFAULT 1
  )
`);

// Obtener todos los productos del carrito
app.get('/carrito', async (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: "No autenticado" });

  try {
    const { rows } = await pool.query(`
      SELECT c.id AS carrito_id, c.cantidad, p.id AS producto_id, p.nombre, p.precio, p.imagen
      FROM carrito c
      JOIN plantas p ON c.planta_id = p.id
      WHERE c.usuario_id = $1
    `, [req.session.usuarioId]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar producto al carrito o aumentar cantidad
app.post('/carrito', async (req, res) => {
  const { producto_id } = req.body;
  const uid = req.session.usuarioId;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    const { rows } = await pool.query(
      "SELECT id, cantidad FROM carrito WHERE usuario_id = $1 AND planta_id = $2",
      [uid, producto_id]
    );

    if (rows.length > 0) {
      await pool.query("UPDATE carrito SET cantidad = cantidad + 1 WHERE id = $1", [rows[0].id]);
      res.json({ mensaje: "Cantidad actualizada" });
    } else {
      const result = await pool.query(
        "INSERT INTO carrito (usuario_id, planta_id, cantidad) VALUES ($1, $2, 1) RETURNING id",
        [uid, producto_id]
      );
      res.json({ mensaje: "Producto agregado", id: result.rows[0].id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar cantidad con botones +/-
app.put('/carrito/cantidad', async (req, res) => {
  const { producto_id, operacion } = req.body;
  const uid = req.session.usuarioId;
  if (!uid || !producto_id || !['mas', 'menos'].includes(operacion))
    return res.status(400).json({ error: "Datos inválidos" });

  try {
    const { rows } = await pool.query(
      "SELECT id, cantidad FROM carrito WHERE usuario_id = $1 AND planta_id = $2",
      [uid, producto_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const nueva = operacion === 'mas' ? rows[0].cantidad + 1 : rows[0].cantidad - 1;

    if (nueva < 1) {
      await pool.query("DELETE FROM carrito WHERE id = $1", [rows[0].id]);
      res.json({ mensaje: "Producto eliminado", nuevaCantidad: 0 });
    } else {
      await pool.query("UPDATE carrito SET cantidad = $1 WHERE id = $2", [nueva, rows[0].id]);
      res.json({ mensaje: "Cantidad actualizada", nuevaCantidad: nueva });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar cantidad manual desde input
app.put('/carrito/:id', async (req, res) => {
  const { cantidad } = req.body;
  const uid = req.session.usuarioId;
  const id = req.params.id;
  if (!uid || isNaN(cantidad) || cantidad < 1)
    return res.status(400).json({ error: "Cantidad inválida" });

  try {
    const result = await pool.query(
      "UPDATE carrito SET cantidad = $1 WHERE id = $2 AND usuario_id = $3",
      [cantidad, id, uid]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Carrito no encontrado" });

    res.json({ mensaje: "Cantidad actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener cantidad actual de un producto
app.get('/carrito/cantidad/:idProducto', async (req, res) => {
  const uid = req.session.usuarioId;
  const idProd = req.params.idProducto;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    const { rows } = await pool.query(
      "SELECT cantidad FROM carrito WHERE usuario_id = $1 AND planta_id = $2",
      [uid, idProd]
    );
    res.json({ cantidad: rows.length > 0 ? rows[0].cantidad : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar producto del carrito
app.delete('/carrito/:id', async (req, res) => {
  const uid = req.session.usuarioId;
  const id = req.params.id;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    const result = await pool.query(
      "DELETE FROM carrito WHERE id = $1 AND usuario_id = $2",
      [id, uid]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "No encontrado" });

    res.json({ mensaje: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vaciar carrito completo
app.delete('/vaciar-carrito', async (req, res) => {
  const uid = req.session.usuarioId;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    await pool.query("DELETE FROM carrito WHERE usuario_id = $1", [uid]);
    res.json({ mensaje: "Carrito vaciado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- HISTORIAL DE PEDIDO ---------------------

// Crear la tabla una vez (opcional si ya la creaste desde pgAdmin)
pool.query(`
  CREATE TABLE IF NOT EXISTS historial_pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado TEXT DEFAULT 'origen'
  )
`);

// Registrar un nuevo pedido
app.post('/pedido', async (req, res) => {
  const uid = req.session.usuarioId;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    const result = await pool.query(
      "INSERT INTO historial_pedidos (usuario_id) VALUES ($1) RETURNING id",
      [uid]
    );
    res.json({ mensaje: "Pedido registrado", pedido_id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar el estado del pedido más reciente
app.put('/pedido/estado', async (req, res) => {
  const uid = req.session.usuarioId;
  const { estado } = req.body;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    await pool.query(`
      UPDATE historial_pedidos
      SET estado = $1
      WHERE usuario_id = $2 AND id = (
        SELECT id FROM historial_pedidos
        WHERE usuario_id = $2
        ORDER BY fecha DESC
        LIMIT 1
      )
    `, [estado, uid]);

    res.json({ mensaje: "Estado actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener estado del último pedido
app.get('/pedido/estado', async (req, res) => {
  const uid = req.session.usuarioId;
  if (!uid) return res.status(401).json({ error: "No autenticado" });

  try {
    const result = await pool.query(`
      SELECT estado FROM historial_pedidos
      WHERE usuario_id = $1
      ORDER BY fecha DESC
      LIMIT 1
    `, [uid]);

    if (result.rows.length === 0) {
      return res.json({ estado: null });
    }

    res.json({ estado: result.rows[0].estado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ CACHE ------------------
// Middleware para cache corto (ej. 1 min)
app.use('/api/resumen-inicio', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60'); // 1 min
  next();
});

app.use('/api/plantas', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=120'); // 2 mins
  next();
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

// ------------------ CARRUSEL INICIO ------------------
app.get('/api/resumen-inicio', async (req, res) => {
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

  try {
    const result = await pool.query(sql);
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

// ---------------------- BUSQUEDA DE PLANTAS ---------------------- //
app.get('/api/buscar', async (req, res) => {
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
    WHERE p.nombre ILIKE $1
  `;

  try {
    const result = await pool.query(sql, [parametro]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------- PRODUCTOS (ahora plantas) ---------------------

// Obtener todos los productos (plantas) con su categoría
app.get('/api/productos', async (req, res) => {
  const cached = cache.get('productos');
  if (cached) return res.json(cached);

  try {
    const result = await pool.query(`
      SELECT p.id, p.nombre, p.precio, p.imagen, c.nombre AS categoria
      FROM plantas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `);
    cache.set('productos', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo productos:', err.message);
    res.status(500).send("Error al obtener productos");
  }
});

// Obtener productos por categoría
app.get('/api/productos/categoria/:nombre', async (req, res) => {
  const categoria = req.params.nombre;
  try {
    const result = await pool.query(`
      SELECT p.id, p.nombre, p.precio, p.imagen, c.nombre AS categoria
      FROM plantas p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE LOWER(c.nombre) = LOWER($1)
    `, [categoria]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error filtrando productos por categoría:", err.message);
    res.status(500).json({ error: "Error al filtrar productos" });
  }
});

// Obtener producto por ID (ahora planta)
app.get('/api/productos/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { rows } = await pool.query(`
      SELECT id, nombre, precio, imagen, descripcion, categoria_id
      FROM plantas
      WHERE id = $1
    `, [id]);

    const planta = rows[0];

    if (!planta) return res.status(404).send("Producto no encontrado");

    // opcional: incluir nombre de categoría
    const catRes = await pool.query(`
      SELECT nombre AS categoria FROM categorias WHERE id = $1
    `, [planta.categoria_id]);

    if (catRes.rows.length > 0) {
      planta.categoria = catRes.rows[0].categoria;
    }

    res.json(planta);
  } catch (err) {
    console.error('Error obteniendo producto:', err.message);
    res.status(500).send("Error al obtener producto");
  }
});

// ------------------------------ PLANTAS INFORMACION ----------------------------------

// Listar todas las plantas destacadas
app.get('/api/plantas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, imagen FROM plantas
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las plantas:', err.message);
    res.status(500).json({ error: 'Error al obtener las plantas' });
  }
});

// Obtener planta completa por ID
app.get('/api/plantas/:id', async (req, res) => {
  const id = req.params.id;
  const cacheKey = `planta_${id}`;

  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const plantaRes = await pool.query(`
      SELECT id, nombre, descripcion, imagen, categoria_id
      FROM plantas
      WHERE id = $1
    `, [id]);

    const planta = plantaRes.rows[0];
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' });

    const catRes = await pool.query(`
      SELECT nombre FROM categorias WHERE id = $1
    `, [planta.categoria_id]);
    planta.categoria = catRes.rows[0]?.nombre || 'Sin categoría';

    const benRes = await pool.query(`
      SELECT beneficio FROM beneficios WHERE planta_id = $1
    `, [id]);
    planta.beneficios = benRes.rows.map(b => b.beneficio);

    const usoRes = await pool.query(`
      SELECT uso FROM usos WHERE planta_id = $1
    `, [id]);
    planta.usos = usoRes.rows.map(u => u.uso);

    cache.set(cacheKey, planta); // Guardar en caché
    res.json(planta);
  } catch (err) {
    console.error('Error al obtener la planta:', err.message);
    res.status(500).json({ error: 'Error al obtener la planta' });
  }
});

// Búsqueda por nombre
app.get('/api/informacion', async (req, res) => {
  const nombre = req.query.nombre;
  if (!nombre) return res.status(400).json({ error: "Falta nombre" });

  try {
    const result = await pool.query(`
      SELECT id FROM plantas WHERE nombre = $1
    `, [nombre]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Información no encontrada" });
    }

    const plantaId = result.rows[0].id;
    res.redirect(`/api/plantas/${plantaId}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subir imagenes desde producto para agregar nueva planta
app.post('/api/plantas', upload.single('imagen'), async (req, res) => {
  if (!req.session.usuarioId || req.session.usuarioRol !== 'proveedor') {
    return res.status(403).json({ error: 'Solo los proveedores pueden agregar plantas' });
  }

  const { nombre, precio, descripcion } = req.body;
  const imagen = req.file ? `img/${req.file.filename}` : null;

  if (!nombre || !precio || !descripcion || !imagen) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const categoria_id = 1; // Categoría por defecto (puedes hacer dinámica luego)

  try {
    const result = await pool.query(`
      INSERT INTO plantas (nombre, precio, imagen, descripcion, categoria_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [nombre, precio, imagen, descripcion, categoria_id]);

    res.json({ mensaje: 'Planta registrada', id: result.rows[0].id });
  } catch (err) {
    console.error('Error insertando planta:', err.message);
    res.status(500).json({ error: 'Error al guardar en base de datos' });
  }
});

// ------------------ PUBLICACIONES (COMUNIDAD) - NUEVA RUTA ------------------
// Esta ruta es necesaria para cargar los datos en la página de la comunidad.
const calcularFecha = () => new Date().toISOString().split('T')[0];

// Obtener publicaciones con info de usuario
app.get('/api/publicaciones', async (req, res) => {
  const cached = cache.get('publicaciones');
  if (cached) return res.json(cached);

  const sql = `
    SELECT p.id, p.titulo, p.contenido, p.fecha, u.nombre, u.imagen
    FROM publicaciones p
    JOIN usuarios u ON p.usuario_id = u.id
    ORDER BY p.fecha DESC
  `;
  try {
    const result = await pool.query(sql);
    cache.set('publicaciones', result.rows); // guardamos en caché
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener hilos de una publicación
app.get('/api/hilos/:publicacionId', async (req, res) => {
  const pubId = req.params.publicacionId;
  const cacheKey = `hilos_${pubId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const sql = `
    SELECT h.contenido, h.fecha, u.nombre, u.imagen
    FROM hilos h
    JOIN usuarios u ON h.usuario_id = u.id
    WHERE h.publicacion_id = $1
    ORDER BY h.fecha ASC
  `;
  try {
    const result = await pool.query(sql, [pubId]);
    cache.set(cacheKey, result.rows); // guardamos en caché
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar nueva publicación
app.post('/api/publicaciones', async (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: 'No autenticado' });

  const { titulo, contenido } = req.body;
  if (!titulo || !contenido || titulo.trim().length < 5 || contenido.trim().length < 10) {
    return res.status(400).json({ error: 'El título debe tener al menos 5 caracteres y el contenido al menos 10.' });
  }
  const fecha = calcularFecha();

  const sql = `
    INSERT INTO publicaciones (usuario_id, titulo, contenido, fecha)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  try {
    const result = await pool.query(sql, [req.session.usuarioId, titulo, contenido, fecha]);
    cache.del('publicaciones'); // Invalida el caché
    res.json({ mensaje: 'Publicación creada', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar nuevo comentario (hilo)
app.post('/api/hilos/:publicacionId', async (req, res) => {
  if (!req.session.usuarioId) return res.status(401).json({ error: 'No autenticado' });

  const { contenido } = req.body;
  if (!contenido || contenido.trim().length < 5) {
    return res.status(400).json({ error: 'El comentario debe tener al menos 5 caracteres.' });
  }
  const publicacionId = req.params.publicacionId;
  const fecha = calcularFecha();

  const sql = `
    INSERT INTO hilos (publicacion_id, usuario_id, contenido, fecha)
    VALUES ($1, $2, $3, $4)
  `;
  try {
    await pool.query(sql, [publicacionId, req.session.usuarioId, contenido, fecha]);
    cache.del(`hilos_${publicacionId}`); // Invalida el caché
    res.json({ mensaje: 'Comentario agregado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ NOTICIAS - NUEVA RUTA ------------------
// ---------------------- NOTICIAS ---------------------------

// Obtener todas las noticias
app.get('/api/noticias', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, titulo, contenido, imagen, fecha FROM noticias ORDER BY fecha DESC'
    );
    console.log('Noticias encontradas:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener noticias:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una sola noticia por ID
app.get('/api/noticia/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      'SELECT id, titulo, contenido, imagen, fecha FROM noticias WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Noticia no encontrada' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error al obtener la noticia:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener una noticia aleatoria
app.get('/api/noticias/aleatoria', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, titulo, contenido, imagen, fecha FROM noticias ORDER BY RANDOM() LIMIT 1'
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No hay noticias disponibles' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error al obtener noticia aleatoria:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ---------------------- RDF/XML ---------------------- //
app.get('/rdf/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // 1. Obtener planta
    const plantaResult = await pool.query(
      `SELECT id, nombre, descripcion, imagen FROM plantas WHERE id = $1`,
      [id]
    );

    const planta = plantaResult.rows[0];
    if (!planta) return res.status(404).send("Planta no encontrada");

    // 2. Obtener beneficios
    const beneficiosResult = await pool.query(
      `SELECT beneficio AS value FROM beneficios WHERE planta_id = $1`,
      [id]
    );

    // 3. Obtener usos
    const usosResult = await pool.query(
      `SELECT uso AS value FROM usos WHERE planta_id = $1`,
      [id]
    );

    // 4. Construir RDF/XML
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
    beneficiosResult.rows.forEach(b => node.ele('sn:beneficio', b.value));
    usosResult.rows.forEach(u => node.ele('sn:uso', u.value));
    node.ele('sn:imagen', planta.imagen);

    res.set('Content-Type', 'application/rdf+xml');
    res.send(rdf.end({ pretty: true }));

  } catch (err) {
    console.error("Error generando RDF:", err.message);
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