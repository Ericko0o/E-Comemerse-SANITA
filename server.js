require('dotenv').config(); 
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

// ---------------------- CONEXIÓN POSTGRES (RAILWAY - con variables de entorno) ---------------------- //
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

// ------------------ PRODUCTOS (CATÁLOGO) - NUEVA RUTA ------------------
// En server.js, dentro de la ruta /api/productos
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.id,
         p.nombre,
         p.precio,
         p.imagen,
         c.nombre AS categoria  -- <--- Obtenemos el nombre de la categoría
       FROM
         plantas p
       JOIN
         categorias c ON p.categoria_id = c.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener productos del catálogo:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ------------------ OBTENER PRODUCTO POR ID - NUEVA RUTA ------------------
// Ruta para obtener un producto específico por su ID
app.get('/api/productos/:id', async (req, res) => {
  const id = req.params.id; // Captura el ID de la URL
  try {
    const result = await pool.query(
      // Consulta la tabla 'plantas' para encontrar el producto con el ID
      'SELECT id, nombre, precio, imagen, descripcion FROM plantas WHERE id = $1',
      [id]
    );

    const producto = result.rows[0]; // El primer (y único) resultado
    
    if (!producto) {
      // Si no se encuentra el producto, devuelve un 404
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Devuelve el producto encontrado
    res.json(producto);
  } catch (err) {
    console.error('Error al obtener producto por ID:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ------------------ OBTENER INFORMACIÓN ADICIONAL POR NOMBRE - CORREGIDA ------------------
// Esta ruta busca información extendida (descripción, beneficios, usos) de una planta por su nombre.
app.get('/api/informacion', async (req, res) => {
  const nombrePlanta = req.query.nombre; // Captura el parámetro 'nombre' de la URL
  
  if (!nombrePlanta) {
    return res.status(400).json({ error: "Falta el parámetro 'nombre'." });
  }
  
  try {
    // 1. Busca la planta por su nombre para obtener su ID y descripción
    const plantaResult = await pool.query(
      `SELECT id, descripcion FROM plantas WHERE nombre = $1`,
      [nombrePlanta]
    );
    
    const planta = plantaResult.rows[0];
    
    if (!planta) {
      return res.status(404).json({ error: "Información de planta no encontrada." });
    }
    
    const plantaId = planta.id;

    // 2. Busca los beneficios usando el ID de la planta
    const beneficiosResult = await pool.query(
      `SELECT beneficio FROM beneficios WHERE planta_id = $1`,
      [plantaId]
    );
    
    // 3. Busca los usos usando el ID de la planta
    const usosResult = await pool.query(
      `SELECT uso FROM usos WHERE planta_id = $1`,
      [plantaId]
    );
    
    // 4. Construye el objeto de respuesta combinando toda la información
    const infoAdicional = {
      id: plantaId,
      descripcion: planta.descripcion,
      beneficios: beneficiosResult.rows.map(row => row.beneficio).join('; '), // Unir con un separador
      uso: usosResult.rows.map(row => row.uso).join('; ') // Unir con un separador
    };
    
    res.json(infoAdicional);
  } catch (err) {
    console.error('Error al obtener info adicional:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ------------------ OBTENER INFORMACIÓN DE PLANTA POR ID - NUEVA RUTA ------------------
// Esta ruta es usada por informacion.js
app.get('/api/plantas/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const plantaResult = await pool.query(
      `SELECT id, nombre, descripcion, imagen FROM plantas WHERE id = $1`,
      [id]
    );
    const planta = plantaResult.rows[0];
    
    if (!planta) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }

    const beneficiosResult = await pool.query(
      `SELECT beneficio FROM beneficios WHERE planta_id = $1`,
      [id]
    );
    
    const usosResult = await pool.query(
      `SELECT uso FROM usos WHERE planta_id = $1`,
      [id]
    );
    
    // Combina toda la información en un solo objeto
    const data = {
      id: planta.id,
      nombre: planta.nombre,
      descripcion: planta.descripcion,
      imagen: planta.imagen,
      beneficios: beneficiosResult.rows.map(row => row.beneficio).join('\n'),
      uso: usosResult.rows.map(row => row.uso).join('\n')
    };

    res.json(data);
  } catch (err) {
    console.error('Error al obtener la información de la planta:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// ------------------ PUBLICACIONES (COMUNIDAD) - NUEVA RUTA ------------------
// Esta ruta es necesaria para cargar los datos en la página de la comunidad.
app.get('/api/publicaciones', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.titulo, p.contenido, p.fecha, u.nombre AS autor, u.imagen AS autor_imagen
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.fecha DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener publicaciones:', err);
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