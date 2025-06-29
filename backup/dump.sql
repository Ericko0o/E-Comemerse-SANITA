-- Adaptado completamente de dump.sql para PostgreSQL
-- Configuración inicial
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- DROP TABLES para desarrollo local (opcional)
DROP TABLE IF EXISTS historial_pedidos, resumen_inicio, publicaciones, carrito, usos, beneficios, categorias, plantas, noticias, hilos, items, usuarios;

-- TABLAS
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name TEXT
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre TEXT,
  correo TEXT UNIQUE,
  contrasena TEXT,
  imagen TEXT,
  rol TEXT DEFAULT 'normal'
);

CREATE TABLE publicaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  titulo TEXT,
  contenido TEXT,
  fecha TEXT
);

CREATE TABLE hilos (
  id SERIAL PRIMARY KEY,
  publicacion_id INTEGER REFERENCES publicaciones(id),
  usuario_id INTEGER REFERENCES usuarios(id),
  contenido TEXT,
  fecha TEXT
);

CREATE TABLE noticias (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL UNIQUE,
  contenido TEXT NOT NULL,
  fecha TEXT NOT NULL,
  imagen TEXT NOT NULL
);

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL
);

CREATE TABLE plantas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio REAL,
  imagen TEXT,
  descripcion TEXT,
  categoria_id INTEGER REFERENCES categorias(id)
);

CREATE TABLE beneficios (
  id SERIAL PRIMARY KEY,
  planta_id INTEGER NOT NULL REFERENCES plantas(id) ON DELETE CASCADE,
  beneficio TEXT NOT NULL
);

CREATE TABLE usos (
  id SERIAL PRIMARY KEY,
  planta_id INTEGER NOT NULL REFERENCES plantas(id) ON DELETE CASCADE,
  uso TEXT NOT NULL
);

CREATE TABLE carrito (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  planta_id INTEGER NOT NULL REFERENCES plantas(id),
  cantidad INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE resumen_inicio (
  id SERIAL PRIMARY KEY,
  tipo TEXT,
  referencia_id INTEGER
);

CREATE TABLE historial_pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado TEXT DEFAULT 'origen'
);

-- INSERTS

INSERT INTO categorias (id, nombre) VALUES
(1, 'cicatrizantes'),
(2, 'inmunologico');

INSERT INTO plantas (id, nombre, precio, imagen, descripcion, categoria_id) VALUES
(1,'Ayahuasca',15.0,'img/ayahuasca.jpeg','Planta ancestral usada tradicionalmente en rituales chamánicos.',2),
(2,'Chilca',20.0,'img/chilca.jpg','Planta medicinal nativa usada en baños medicinales y en infusión.',1),
(3,'Chuchuhuasi',20.0,'img/chuchuhuasi.jpg','Corteza de árbol amazónico de uso medicinal tradicional.',2),
(4,'Flor de Arena',25.0,'img/sandflower.jpg','Hierba andina reconocida por sus propiedades desinflamantes.',1),
(5,'Llanten',25.0,'img/llanten.jpg','Hierba usada para afecciones respiratorias y heridas.',1),
(6,'Matico',15.0,'img/matico.jpeg','Planta medicinal usada en la medicina tradicional andina.',1),
(7,'Muña',25.0,'img/muna.jpg','Planta andina con aroma mentolado usada para digestión.',2),
(8,'Sacha Inchi',25.0,'img/sacha-inchi.jpg','Semilla amazónica rica en omega 3, 6 y 9.',2),
(9,'Sangre de Grado',20.0,'img/sangre-de-grado.jpg','Resina cicatrizante extraída del árbol Croton lechleri.',1),
(10,'Uña de Gato',20.0,'img/una-de-gato.jpg','Liana amazónica conocida por fortalecer el sistema inmunológico.',2);

INSERT INTO beneficios (id, planta_id, beneficio) VALUES
(1,9,'Regeneración celular'),
(2,9,'Antiséptico'),
(3,9,'Cicatrizante rápido.'),
(7,6,'Antiinflamatorio'),
(8,6,'Digestivo'),
(9,6,'Cicatrizante.'),
(13,1,'Potente depurador físico y espiritual.'),
(15,2,'Cicatrizante'),
(16,2,'Desinfectante'),
(17,2,'Alivia reumatismo y dolores musculares.'),
(21,7,'Alivia gases'),
(22,7,'Náuseas y mejora respiración.'),
(25,3,'Alivia reumatismo'),
(26,3,'Dolores musculares'),
(27,3,'Estimula el sistema inmune.'),
(31,4,'Alivia problemas digestivos'),
(32,4,'Úlceras'),
(33,4,'E inflamación estomacal.'),
(37,5,'Descongestionante'),
(38,5,'Cicatrizante'),
(39,5,'Antibacteriano.'),
(43,8,'Reduce colesterol'),
(44,8,'Mejora piel y circulación.'),
(47,10,'Antiinflamatoria'),
(48,10,'Antiviral'),
(49,10,'Estimula defensas.');

INSERT INTO usos (id, planta_id, uso) VALUES
(1,9,'Aplicación tópica directa en heridas.'),
(3,6,'Infusión para problemas digestivos y lavado de heridas.'),
(5,1,'Sólo bajo supervisión'),
(6,1,'No recomendada para uso libre.'),
(9,2,'Aplicación en cataplasmas o infusión para uso interno.'),
(11,7,'Tomada en infusión o en vapor.'),
(13,3,'Macerado en licor o cocción.'),
(15,4,'En infusión después de las comidas o como remedio estomacal.'),
(17,5,'En infusión o emplasto sobre heridas.'),
(19,8,'Consumido como aceite o tostado en snacks.'),
(21,10,'En cápsulas o infusión para consumo regular.');

INSERT INTO usuarios (id, nombre, correo, contrasena, imagen, rol) VALUES
(1,'Erick','eriqo@sanita.com','12345','https://i.pinimg.com/736x/39/5e/c9/395ec9cae765faff8a2cdc5d481a671b.jpg','normal'),
(2,'Jose','josesito@gmail.com','jose123','https://wallpapers.com/images/hd/discord-profile-pictures-jktaycg4bu6l4s89.jpg','normal'),
(3,'Shantall23','s.sullaotazu@gmail.com','9283746510.jk','https://garajedelrock.com/wp-content/uploads/2020/07/gustavo-1024x634.jpg','proveedor'),
(4,'regina','rticona','123456789','https://garajedelrock.com/wp-content/uploads/2020/07/gustavo-1024x634.jpg','normal'),
(5,'Panela','panelita@gmail.com','panela','img/usuario.png','moderador'),
(6,'proveedor1','proveedor1@sanita.com','proveedor2025','img/usuario.png','proveedor');

INSERT INTO publicaciones (id, usuario_id, titulo, contenido, fecha) VALUES
(1,3,'Mi experiencia con el llantén','Utilicé llantén para una quemadura leve y me ayudó a sanar en pocos días.','2024-03-05'),
(2,4,'ghgjhh','hhh','2025-05-14');

INSERT INTO hilos (id, publicacion_id, usuario_id, contenido, fecha) VALUES
(1,1,1,'Gracias por compartir, yo también he tenido buenos resultados con el llantén.','2024-03-06'),
(2,1,1,'aea','2025-05-14'),
(3,1,3,'yo no puse eso','2025-05-14'),
(4,1,4,'fffff','2025-05-14');

INSERT INTO noticias (id, titulo, contenido, fecha, imagen) VALUES
(1,'Beneficios de la Uña de Gato','La uña de gato tiene propiedades antiinflamatorias y estimula el sistema inmunológico.','2024-01-20','img/una-de-gato.jpg'),
(2,'Plantas cicatrizantes en la medicina andina','El llantén y el matico son reconocidos por su efectividad para curar heridas.','2024-02-10','img/matico.jpeg'),
(3,'Propiedades del eucalipto en la medicina natural','El eucalipto es utilizado para aliviar problemas respiratorios gracias a su efecto descongestionante.','2025-01-15','img/eucalipto.jpeg'),
(4,'El poder calmante de la valeriana','La valeriana es conocida por sus efectos sedantes, ideal para tratar el insomnio y la ansiedad.','2025-01-28','img/valeriana.jpeg'),
(5,'Muña: alivia dolores estomacales','La muña ayuda con la digestión y alivia cólicos estomacales, siendo tradicional en la sierra peruana.','2025-02-05','img/muna.jpg'),
(6,'Kion (jengibre): potente antiinflamatorio','El jengibre ayuda a reducir la inflamación y mejorar la circulación sanguínea.','2025-02-18','img/kion.jpg'),
(7,'Toronjil para calmar los nervios','El toronjil se usa para relajar los nervios y tratar problemas de ansiedad.','2025-03-01','img/toronjil.jpeg'),
(8,'Beneficios de la hierba luisa','La hierba luisa es excelente para problemas digestivos y tiene un aroma muy agradable.','2025-03-15','img/hierba_luisa.jpeg'),
(9,'La menta y su frescura medicinal','La menta ayuda a la digestión y también combate dolores de cabeza.','2025-04-01','img/menta.jpeg');

INSERT INTO resumen_inicio (id, tipo, referencia_id) VALUES
(1,'noticia',1),
(2,'noticia',2),
(3,'publicacion',1);

INSERT INTO carrito (id, usuario_id, planta_id, cantidad) VALUES
(9,1,1,1),
(10,1,3,1),
(12,2,5,1),
(14,2,3,1),
(15,2,8,1);

INSERT INTO historial_pedidos (id, usuario_id, fecha, estado) VALUES
(1,3,'2025-06-25 06:38:33','recibido');
