--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-26 22:27:39

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 16482)
-- Name: beneficios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beneficios (
    id integer NOT NULL,
    planta_id integer NOT NULL,
    beneficio text NOT NULL
);


ALTER TABLE public.beneficios OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16481)
-- Name: beneficios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beneficios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beneficios_id_seq OWNER TO postgres;

--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 231
-- Name: beneficios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beneficios_id_seq OWNED BY public.beneficios.id;


--
-- TOC entry 236 (class 1259 OID 16510)
-- Name: carrito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrito (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    planta_id integer NOT NULL,
    cantidad integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.carrito OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16509)
-- Name: carrito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrito_id_seq OWNER TO postgres;

--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 235
-- Name: carrito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrito_id_seq OWNED BY public.carrito.id;


--
-- TOC entry 228 (class 1259 OID 16457)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16456)
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO postgres;

--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 227
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- TOC entry 224 (class 1259 OID 16427)
-- Name: hilos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hilos (
    id integer NOT NULL,
    publicacion_id integer,
    usuario_id integer,
    contenido text,
    fecha text
);


ALTER TABLE public.hilos OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16426)
-- Name: hilos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hilos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hilos_id_seq OWNER TO postgres;

--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 223
-- Name: hilos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hilos_id_seq OWNED BY public.hilos.id;


--
-- TOC entry 240 (class 1259 OID 16537)
-- Name: historial_pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_pedidos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado text DEFAULT 'origen'::text
);


ALTER TABLE public.historial_pedidos OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16536)
-- Name: historial_pedidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_pedidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_pedidos_id_seq OWNER TO postgres;

--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 239
-- Name: historial_pedidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_pedidos_id_seq OWNED BY public.historial_pedidos.id;


--
-- TOC entry 218 (class 1259 OID 16392)
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name text
);


ALTER TABLE public.items OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16391)
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 217
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- TOC entry 226 (class 1259 OID 16446)
-- Name: noticias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.noticias (
    id integer NOT NULL,
    titulo text NOT NULL,
    contenido text NOT NULL,
    fecha text NOT NULL,
    imagen text NOT NULL
);


ALTER TABLE public.noticias OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16445)
-- Name: noticias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.noticias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.noticias_id_seq OWNER TO postgres;

--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 225
-- Name: noticias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.noticias_id_seq OWNED BY public.noticias.id;


--
-- TOC entry 230 (class 1259 OID 16468)
-- Name: plantas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plantas (
    id integer NOT NULL,
    nombre text NOT NULL,
    precio real,
    imagen text,
    descripcion text,
    categoria_id integer
);


ALTER TABLE public.plantas OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16467)
-- Name: plantas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plantas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plantas_id_seq OWNER TO postgres;

--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 229
-- Name: plantas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plantas_id_seq OWNED BY public.plantas.id;


--
-- TOC entry 222 (class 1259 OID 16413)
-- Name: publicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publicaciones (
    id integer NOT NULL,
    usuario_id integer,
    titulo text,
    contenido text,
    fecha text
);


ALTER TABLE public.publicaciones OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16412)
-- Name: publicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.publicaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publicaciones_id_seq OWNER TO postgres;

--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 221
-- Name: publicaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.publicaciones_id_seq OWNED BY public.publicaciones.id;


--
-- TOC entry 238 (class 1259 OID 16528)
-- Name: resumen_inicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resumen_inicio (
    id integer NOT NULL,
    tipo text,
    referencia_id integer
);


ALTER TABLE public.resumen_inicio OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16527)
-- Name: resumen_inicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resumen_inicio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resumen_inicio_id_seq OWNER TO postgres;

--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 237
-- Name: resumen_inicio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resumen_inicio_id_seq OWNED BY public.resumen_inicio.id;


--
-- TOC entry 234 (class 1259 OID 16496)
-- Name: usos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usos (
    id integer NOT NULL,
    planta_id integer NOT NULL,
    uso text NOT NULL
);


ALTER TABLE public.usos OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16495)
-- Name: usos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usos_id_seq OWNER TO postgres;

--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 233
-- Name: usos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usos_id_seq OWNED BY public.usos.id;


--
-- TOC entry 220 (class 1259 OID 16401)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre text,
    correo text,
    contrasena text,
    imagen text,
    rol text DEFAULT 'normal'::text
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16400)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4805 (class 2604 OID 16485)
-- Name: beneficios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beneficios ALTER COLUMN id SET DEFAULT nextval('public.beneficios_id_seq'::regclass);


--
-- TOC entry 4807 (class 2604 OID 16513)
-- Name: carrito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito ALTER COLUMN id SET DEFAULT nextval('public.carrito_id_seq'::regclass);


--
-- TOC entry 4803 (class 2604 OID 16460)
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 16430)
-- Name: hilos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hilos ALTER COLUMN id SET DEFAULT nextval('public.hilos_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 16540)
-- Name: historial_pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_pedidos ALTER COLUMN id SET DEFAULT nextval('public.historial_pedidos_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 16395)
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 16449)
-- Name: noticias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.noticias ALTER COLUMN id SET DEFAULT nextval('public.noticias_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 16471)
-- Name: plantas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantas ALTER COLUMN id SET DEFAULT nextval('public.plantas_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 16416)
-- Name: publicaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicaciones ALTER COLUMN id SET DEFAULT nextval('public.publicaciones_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 16531)
-- Name: resumen_inicio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumen_inicio ALTER COLUMN id SET DEFAULT nextval('public.resumen_inicio_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 16499)
-- Name: usos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usos ALTER COLUMN id SET DEFAULT nextval('public.usos_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 16404)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5012 (class 0 OID 16482)
-- Dependencies: 232
-- Data for Name: beneficios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.beneficios (id, planta_id, beneficio) FROM stdin;
1	9	Regeneración celular
2	9	Antiséptico
3	9	Cicatrizante rápido.
7	6	Antiinflamatorio
8	6	Digestivo
9	6	Cicatrizante.
13	1	Potente depurador físico y espiritual.
15	2	Cicatrizante
16	2	Desinfectante
17	2	Alivia reumatismo y dolores musculares.
21	7	Alivia gases
22	7	Náuseas y mejora respiración.
25	3	Alivia reumatismo
26	3	Dolores musculares
27	3	Estimula el sistema inmune.
31	4	Alivia problemas digestivos
32	4	Úlceras
33	4	E inflamación estomacal.
37	5	Descongestionante
38	5	Cicatrizante
39	5	Antibacteriano.
43	8	Reduce colesterol
44	8	Mejora piel y circulación.
47	10	Antiinflamatoria
48	10	Antiviral
49	10	Estimula defensas.
\.


--
-- TOC entry 5016 (class 0 OID 16510)
-- Dependencies: 236
-- Data for Name: carrito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrito (id, usuario_id, planta_id, cantidad) FROM stdin;
9	1	1	1
10	1	3	1
12	2	5	1
14	2	3	1
15	2	8	1
\.


--
-- TOC entry 5008 (class 0 OID 16457)
-- Dependencies: 228
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre) FROM stdin;
1	cicatrizantes
2	inmunologico
\.


--
-- TOC entry 5004 (class 0 OID 16427)
-- Dependencies: 224
-- Data for Name: hilos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hilos (id, publicacion_id, usuario_id, contenido, fecha) FROM stdin;
1	1	1	Gracias por compartir, yo también he tenido buenos resultados con el llantén.	2024-03-06
2	1	1	aea	2025-05-14
3	1	3	yo no puse eso	2025-05-14
4	1	4	fffff	2025-05-14
\.


--
-- TOC entry 5020 (class 0 OID 16537)
-- Dependencies: 240
-- Data for Name: historial_pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_pedidos (id, usuario_id, fecha, estado) FROM stdin;
1	3	2025-06-25 06:38:33	recibido
\.


--
-- TOC entry 4998 (class 0 OID 16392)
-- Dependencies: 218
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, name) FROM stdin;
\.


--
-- TOC entry 5006 (class 0 OID 16446)
-- Dependencies: 226
-- Data for Name: noticias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.noticias (id, titulo, contenido, fecha, imagen) FROM stdin;
1	Beneficios de la Uña de Gato	La uña de gato tiene propiedades antiinflamatorias y estimula el sistema inmunológico.	2024-01-20	img/una-de-gato.jpg
2	Plantas cicatrizantes en la medicina andina	El llantén y el matico son reconocidos por su efectividad para curar heridas.	2024-02-10	img/matico.jpeg
3	Propiedades del eucalipto en la medicina natural	El eucalipto es utilizado para aliviar problemas respiratorios gracias a su efecto descongestionante.	2025-01-15	img/eucalipto.jpeg
4	El poder calmante de la valeriana	La valeriana es conocida por sus efectos sedantes, ideal para tratar el insomnio y la ansiedad.	2025-01-28	img/valeriana.jpeg
5	Muña: alivia dolores estomacales	La muña ayuda con la digestión y alivia cólicos estomacales, siendo tradicional en la sierra peruana.	2025-02-05	img/muna.jpg
6	Kion (jengibre): potente antiinflamatorio	El jengibre ayuda a reducir la inflamación y mejorar la circulación sanguínea.	2025-02-18	img/kion.jpg
7	Toronjil para calmar los nervios	El toronjil se usa para relajar los nervios y tratar problemas de ansiedad.	2025-03-01	img/toronjil.jpeg
8	Beneficios de la hierba luisa	La hierba luisa es excelente para problemas digestivos y tiene un aroma muy agradable.	2025-03-15	img/hierba_luisa.jpeg
9	La menta y su frescura medicinal	La menta ayuda a la digestión y también combate dolores de cabeza.	2025-04-01	img/menta.jpeg
\.


--
-- TOC entry 5010 (class 0 OID 16468)
-- Dependencies: 230
-- Data for Name: plantas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plantas (id, nombre, precio, imagen, descripcion, categoria_id) FROM stdin;
1	Ayahuasca	15	img/ayahuasca.jpeg	Planta ancestral usada tradicionalmente en rituales chamánicos.	2
2	Chilca	20	img/chilca.jpg	Planta medicinal nativa usada en baños medicinales y en infusión.	1
3	Chuchuhuasi	20	img/chuchuhuasi.jpg	Corteza de árbol amazónico de uso medicinal tradicional.	2
4	Flor de Arena	25	img/sandflower.jpg	Hierba andina reconocida por sus propiedades desinflamantes.	1
5	Llanten	25	img/llanten.jpg	Hierba usada para afecciones respiratorias y heridas.	1
6	Matico	15	img/matico.jpeg	Planta medicinal usada en la medicina tradicional andina.	1
7	Muña	25	img/muna.jpg	Planta andina con aroma mentolado usada para digestión.	2
8	Sacha Inchi	25	img/sacha-inchi.jpg	Semilla amazónica rica en omega 3, 6 y 9.	2
9	Sangre de Grado	20	img/sangre-de-grado.jpg	Resina cicatrizante extraída del árbol Croton lechleri.	1
10	Uña de Gato	20	img/una-de-gato.jpg	Liana amazónica conocida por fortalecer el sistema inmunológico.	2
\.


--
-- TOC entry 5002 (class 0 OID 16413)
-- Dependencies: 222
-- Data for Name: publicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publicaciones (id, usuario_id, titulo, contenido, fecha) FROM stdin;
1	3	Mi experiencia con el llantén	Utilicé llantén para una quemadura leve y me ayudó a sanar en pocos días.	2024-03-05
2	4	ghgjhh	hhh	2025-05-14
\.


--
-- TOC entry 5018 (class 0 OID 16528)
-- Dependencies: 238
-- Data for Name: resumen_inicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resumen_inicio (id, tipo, referencia_id) FROM stdin;
1	noticia	1
2	noticia	2
3	publicacion	1
\.


--
-- TOC entry 5014 (class 0 OID 16496)
-- Dependencies: 234
-- Data for Name: usos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usos (id, planta_id, uso) FROM stdin;
1	9	Aplicación tópica directa en heridas.
3	6	Infusión para problemas digestivos y lavado de heridas.
5	1	Sólo bajo supervisión
6	1	No recomendada para uso libre.
9	2	Aplicación en cataplasmas o infusión para uso interno.
11	7	Tomada en infusión o en vapor.
13	3	Macerado en licor o cocción.
15	4	En infusión después de las comidas o como remedio estomacal.
17	5	En infusión o emplasto sobre heridas.
19	8	Consumido como aceite o tostado en snacks.
21	10	En cápsulas o infusión para consumo regular.
\.


--
-- TOC entry 5000 (class 0 OID 16401)
-- Dependencies: 220
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, correo, contrasena, imagen, rol) FROM stdin;
1	Erick	eriqo@sanita.com	12345	https://i.pinimg.com/736x/39/5e/c9/395ec9cae765faff8a2cdc5d481a671b.jpg	normal
2	Jose	josesito@gmail.com	jose123	https://wallpapers.com/images/hd/discord-profile-pictures-jktaycg4bu6l4s89.jpg	normal
3	Shantall23	s.sullaotazu@gmail.com	9283746510.jk	https://garajedelrock.com/wp-content/uploads/2020/07/gustavo-1024x634.jpg	proveedor
4	regina	rticona	123456789	https://garajedelrock.com/wp-content/uploads/2020/07/gustavo-1024x634.jpg	normal
5	Panela	panelita@gmail.com	panela	img/usuario.png	moderador
6	proveedor1	proveedor1@sanita.com	proveedor2025	img/usuario.png	proveedor
\.


--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 231
-- Name: beneficios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.beneficios_id_seq', 1, false);


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 235
-- Name: carrito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrito_id_seq', 1, false);


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 227
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 1, false);


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 223
-- Name: hilos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hilos_id_seq', 1, false);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 239
-- Name: historial_pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_pedidos_id_seq', 1, false);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 217
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 1, false);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 225
-- Name: noticias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.noticias_id_seq', 1, false);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 229
-- Name: plantas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plantas_id_seq', 1, false);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 221
-- Name: publicaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.publicaciones_id_seq', 1, false);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 237
-- Name: resumen_inicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resumen_inicio_id_seq', 1, false);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 233
-- Name: usos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usos_id_seq', 1, false);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- TOC entry 4834 (class 2606 OID 16489)
-- Name: beneficios beneficios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beneficios
    ADD CONSTRAINT beneficios_pkey PRIMARY KEY (id);


--
-- TOC entry 4838 (class 2606 OID 16516)
-- Name: carrito carrito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 2606 OID 16466)
-- Name: categorias categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);


--
-- TOC entry 4830 (class 2606 OID 16464)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- TOC entry 4822 (class 2606 OID 16434)
-- Name: hilos hilos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hilos
    ADD CONSTRAINT hilos_pkey PRIMARY KEY (id);


--
-- TOC entry 4842 (class 2606 OID 16546)
-- Name: historial_pedidos historial_pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_pedidos
    ADD CONSTRAINT historial_pedidos_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 16399)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 16453)
-- Name: noticias noticias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT noticias_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 16455)
-- Name: noticias noticias_titulo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT noticias_titulo_key UNIQUE (titulo);


--
-- TOC entry 4832 (class 2606 OID 16475)
-- Name: plantas plantas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantas
    ADD CONSTRAINT plantas_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 16420)
-- Name: publicaciones publicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicaciones
    ADD CONSTRAINT publicaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4840 (class 2606 OID 16535)
-- Name: resumen_inicio resumen_inicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumen_inicio
    ADD CONSTRAINT resumen_inicio_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 2606 OID 16503)
-- Name: usos usos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usos
    ADD CONSTRAINT usos_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 16411)
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- TOC entry 4818 (class 2606 OID 16409)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4847 (class 2606 OID 16490)
-- Name: beneficios beneficios_planta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beneficios
    ADD CONSTRAINT beneficios_planta_id_fkey FOREIGN KEY (planta_id) REFERENCES public.plantas(id) ON DELETE CASCADE;


--
-- TOC entry 4849 (class 2606 OID 16522)
-- Name: carrito carrito_planta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_planta_id_fkey FOREIGN KEY (planta_id) REFERENCES public.plantas(id);


--
-- TOC entry 4850 (class 2606 OID 16517)
-- Name: carrito carrito_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4844 (class 2606 OID 16435)
-- Name: hilos hilos_publicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hilos
    ADD CONSTRAINT hilos_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicaciones(id);


--
-- TOC entry 4845 (class 2606 OID 16440)
-- Name: hilos hilos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hilos
    ADD CONSTRAINT hilos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4851 (class 2606 OID 16547)
-- Name: historial_pedidos historial_pedidos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_pedidos
    ADD CONSTRAINT historial_pedidos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4846 (class 2606 OID 16476)
-- Name: plantas plantas_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantas
    ADD CONSTRAINT plantas_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- TOC entry 4843 (class 2606 OID 16421)
-- Name: publicaciones publicaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicaciones
    ADD CONSTRAINT publicaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4848 (class 2606 OID 16504)
-- Name: usos usos_planta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usos
    ADD CONSTRAINT usos_planta_id_fkey FOREIGN KEY (planta_id) REFERENCES public.plantas(id) ON DELETE CASCADE;


-- Completed on 2025-06-26 22:27:39

--
-- PostgreSQL database dump complete
--

