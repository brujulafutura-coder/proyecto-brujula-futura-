-- =========================================================
-- SCRIPT DE POBLACIÓN DE DATOS (SEED) PARA SUPABASE
-- =========================================================

-- =========================================================
-- 1. Inserción de Universidades
-- =========================================================
INSERT INTO universidades (codigo_universidad, nombre_universidad, tipo_universidad, provincia, ciudad, sitio_web) VALUES
('USFQ01', 'Universidad San Francisco de Quito', 'PRI', 'Pichincha', 'Quito', 'https://www.usfq.edu.ec'),
('PUCE01', 'Pontificia Universidad Católica del Ecuador', 'PRI', 'Pichincha', 'Quito', 'https://www.puce.edu.ec'),
('EPN001', 'Escuela Politécnica Nacional', 'PUB', 'Pichincha', 'Quito', 'https://www.epn.edu.ec'),
('UCE001', 'Universidad Central del Ecuador', 'PUB', 'Pichincha', 'Quito', 'https://www.uce.edu.ec'),
('ESPOL01', 'Escuela Superior Politécnica del Litoral', 'PUB', 'Guayas', 'Guayaquil', 'https://www.espol.edu.ec'),
('UCU001', 'Universidad de Cuenca', 'PUB', 'Azuay', 'Cuenca', 'https://www.ucuenca.edu.ec'),
('UG001', 'Universidad de Guayaquil', 'PUB', 'Guayas', 'Guayaquil', 'https://www.ug.edu.ec'),
('UPS001', 'Universidad Politécnica Salesiana', 'PRI', 'Pichincha', 'Quito', 'https://www.ups.edu.ec'),
('UTPL01', 'Universidad Técnica Particular de Loja', 'PRI', 'Loja', 'Loja', 'https://www.utpl.edu.ec'),
('YAV001', 'Instituto Superior Tecnológico Yavirac', 'TEC', 'Pichincha', 'Quito', 'https://yavirac.edu.ec')
ON CONFLICT (codigo_universidad) DO NOTHING;

-- =========================================================
-- 2. Inserción de Carreras
-- =========================================================
INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'INGSOFT', 'Ingeniería en Software', 'UNI', 48, 'Alta demanda en empresas tecnológicas, desarrollo web y móvil, automatización, banca digital, startups, software empresarial y trabajo remoto.', 'Gusto por la lógica, programación, matemáticas, resolución de problemas, aprendizaje constante y trabajo con tecnologías digitales.' FROM areas_vocacionales WHERE codigo_area = 'I'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'CIEDATOS', 'Ciencia de Datos e Inteligencia Artificial', 'UNI', 48, 'Alta demanda en análisis de datos, inteligencia artificial, business intelligence, fintech, investigación aplicada y transformación digital.', 'Interés por estadística, programación, análisis, modelos predictivos, inteligencia artificial y toma de decisiones basada en datos.' FROM areas_vocacionales WHERE codigo_area = 'I'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'MEDIC', 'Medicina', 'UNI', 72, 'Demanda sostenida en hospitales, clínicas, centros de salud, medicina comunitaria, especialidades médicas e investigación biomédica.', 'Alta vocación de servicio, disciplina, interés científico, tolerancia a la presión, memoria, análisis clínico y responsabilidad ética.' FROM areas_vocacionales WHERE codigo_area = 'I'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'ENFERM', 'Enfermería', 'UNI', 48, 'Alta demanda en hospitales, clínicas, atención primaria, salud comunitaria, emergencias, cuidado adulto mayor y programas preventivos.', 'Vocación de ayuda, empatía, responsabilidad, comunicación clara, resistencia emocional y capacidad para trabajar en equipos de salud.' FROM areas_vocacionales WHERE codigo_area = 'S'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'PSICO', 'Psicología', 'UNI', 48, 'Oportunidades en salud mental, educación, talento humano, intervención social, orientación familiar, investigación y bienestar organizacional.', 'Interés por comprender la conducta humana, escucha activa, empatía, análisis, ética profesional y habilidades de comunicación.' FROM areas_vocacionales WHERE codigo_area = 'S'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'EDUINI', 'Educación Inicial', 'UNI', 48, 'Demanda en instituciones educativas, centros infantiles, proyectos de estimulación temprana, inclusión educativa y acompañamiento pedagógico.', 'Paciencia, creatividad, vocación de enseñanza, comunicación afectiva, interés por la niñez y habilidades para planificar actividades educativas.' FROM areas_vocacionales WHERE codigo_area = 'S'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'DERECHO', 'Derecho', 'UNI', 54, 'Salida en estudios jurídicos, sector público, asesoría legal, mediación, cumplimiento normativo, derecho empresarial y defensa de derechos.', 'Habilidad argumentativa, lectura crítica, liderazgo, comunicación oral, análisis normativo, ética y capacidad para negociar o defender posturas.' FROM areas_vocacionales WHERE codigo_area = 'E'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'ADMEMP', 'Administración de Empresas', 'UNI', 48, 'Alta demanda en empresas privadas, emprendimientos, bancos, retail, logística, gestión comercial, operaciones y dirección de proyectos.', 'Interés por liderazgo, negocios, planificación, toma de decisiones, manejo de equipos, finanzas básicas y visión estratégica.' FROM areas_vocacionales WHERE codigo_area = 'E'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'MARKDIG', 'Marketing Digital', 'TEC', 24, 'Demanda en comercio electrónico, agencias digitales, gestión de redes sociales, analítica web, publicidad pagada, branding y ventas online.', 'Creatividad comercial, comunicación persuasiva, análisis de métricas, interés por redes sociales, negocios digitales y comportamiento del consumidor.' FROM areas_vocacionales WHERE codigo_area = 'E'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'CONTAUD', 'Contabilidad y Auditoría', 'UNI', 48, 'Demanda en contabilidad empresarial, auditoría interna y externa, tributación, control financiero, banca, consultoría y sector público.', 'Orden, precisión, gusto por números, normas tributarias, registros financieros, control documental y análisis de información económica.' FROM areas_vocacionales WHERE codigo_area = 'C'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'INGCIV', 'Ingeniería Civil', 'UNI', 54, 'Demanda en construcción, infraestructura vial, fiscalización de obras, diseño estructural, gestión de proyectos y consultoría técnica.', 'Interés por construcción, matemáticas, física, dibujo técnico, trabajo de campo, gestión de obras y solución práctica de problemas.' FROM areas_vocacionales WHERE codigo_area = 'R'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'ELECT', 'Electricidad y Automatización', 'UNI', 48, 'Oportunidades en energía, automatización industrial, mantenimiento eléctrico, telecomunicaciones, manufactura, sistemas de control y proyectos técnicos.', 'Gusto por circuitos, máquinas, instalaciones, tecnología industrial, diagnóstico de fallas, trabajo técnico y razonamiento matemático aplicado.' FROM areas_vocacionales WHERE codigo_area = 'R'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'ARQUIT', 'Arquitectura', 'UNI', 60, 'Salida en diseño arquitectónico, planificación urbana, construcción, interiorismo, patrimonio, visualización 3D y gestión de proyectos inmobiliarios.', 'Creatividad espacial, dibujo, sensibilidad estética, interés por construcción, urbanismo, sostenibilidad, diseño y resolución visual de problemas.' FROM areas_vocacionales WHERE codigo_area = 'A'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'DISGRA', 'Diseño Gráfico', 'UNI', 48, 'Demanda en agencias creativas, branding, diseño editorial, UX/UI, comunicación visual, publicidad, emprendimientos y contenido digital.', 'Creatividad, manejo visual, interés por tecnología, composición, identidad gráfica, comunicación, diseño digital y solución estética de problemas.' FROM areas_vocacionales WHERE codigo_area = 'A'
ON CONFLICT (codigo_carrera) DO NOTHING;

INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)
SELECT id_area, 'TURHOS', 'Turismo y Hospitalidad', 'UNI', 48, 'Oportunidades en hoteles, agencias de viaje, turismo local, gestión de experiencias, emprendimientos turísticos, eventos y atención al cliente.', 'Gusto por tratar con personas, idiomas, cultura, organización de servicios, comunicación, hospitalidad, viajes y promoción de destinos.' FROM areas_vocacionales WHERE codigo_area = 'S'
ON CONFLICT (codigo_carrera) DO NOTHING;


-- =========================================================
-- 3. Inserción de Oferta Universitaria (Carrera - Universidad)
-- =========================================================
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MIX', 2200.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'INGSOFT' AND u.codigo_universidad = 'UPS001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'VES', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'INGSOFT' AND u.codigo_universidad = 'YAV001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'HIB', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'CIEDATOS' AND u.codigo_universidad = 'ESPOL01' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'VIR', 'MIX', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'CIEDATOS' AND u.codigo_universidad = 'UG001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'MEDIC' AND u.codigo_universidad = 'UCE001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 2750.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'MEDIC' AND u.codigo_universidad = 'PUCE01' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'ENFERM' AND u.codigo_universidad = 'UG001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MIX', 2100.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'ENFERM' AND u.codigo_universidad = 'UPS001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 1975.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'PSICO' AND u.codigo_universidad = 'PUCE01' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'PSICO' AND u.codigo_universidad = 'UCU001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 1975.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'EDUINI' AND u.codigo_universidad = 'PUCE01' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'EDUINI' AND u.codigo_universidad = 'UCU001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MIX', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'DERECHO' AND u.codigo_universidad = 'UCE001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 1975.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'DERECHO' AND u.codigo_universidad = 'PUCE01' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'ADMEMP' AND u.codigo_universidad = 'ESPOL01' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 1975.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'ADMEMP' AND u.codigo_universidad = 'PUCE01' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'VES', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'MARKDIG' AND u.codigo_universidad = 'YAV001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 1975.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'MARKDIG' AND u.codigo_universidad = 'PUCE01' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 1975.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'CONTAUD' AND u.codigo_universidad = 'PUCE01' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'HIB', 'MIX', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'CONTAUD' AND u.codigo_universidad = 'UG001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'INGCIV' AND u.codigo_universidad = 'EPN001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'INGCIV' AND u.codigo_universidad = 'UCU001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'ELECT' AND u.codigo_universidad = 'EPN001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MIX', 2200.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'ELECT' AND u.codigo_universidad = 'UPS001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'ARQUIT' AND u.codigo_universidad = 'UCE001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MIX', 2300.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'ARQUIT' AND u.codigo_universidad = 'UPS001' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'DISGRA' AND u.codigo_universidad = 'UCU001' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'DISGRA' AND u.codigo_universidad = 'ESPOL01' ON CONFLICT DO NOTHING;

INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 1975.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'TURHOS' AND u.codigo_universidad = 'PUCE01' ON CONFLICT DO NOTHING;
INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)
SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, 'PRE', 'MAT', 0.00 FROM carreras c, universidades u WHERE c.codigo_carrera = 'TURHOS' AND u.codigo_universidad = 'UCU001' ON CONFLICT DO NOTHING;


-- =========================================================
-- 4. Inserción de Preguntas RIASEC y Opciones
-- =========================================================

-- Pregunta 1
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_001', '¿Disfrutas armar, reparar o mantener equipos mecánicos, eléctricos o tecnológicos?', 'PER', 1) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_001';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_001';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_001';

-- Pregunta 2
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_002', '¿Te interesa trabajar con herramientas, máquinas, vehículos, instalaciones o materiales físicos?', 'PER', 2) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_002';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_002';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_002';

-- Pregunta 3
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_003', '¿Prefieres actividades prácticas donde puedas construir, operar o transformar algo concreto?', 'PER', 3) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_003';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_003';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_003';

-- Pregunta 4
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_004', '¿Te gusta investigar causas, analizar datos o resolver problemas usando lógica y evidencia?', 'PER', 4) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_004';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_004';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_004';

-- Pregunta 5
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_005', '¿Disfrutas aprender sobre ciencia, tecnología, salud, matemáticas o fenómenos naturales?', 'PER', 5) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_005';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_005';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_005';

-- Pregunta 6
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_006', '¿Te motiva encontrar soluciones nuevas a problemas complejos mediante observación y análisis?', 'PER', 6) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_006';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_006';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_006';

-- Pregunta 7
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_007', '¿Disfrutas crear diseños, dibujos, música, videos, historias, fotografías o piezas visuales?', 'PER', 7) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_007';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_007';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_007';

-- Pregunta 8
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_008', '¿Te gusta expresar ideas de forma original, estética o creativa sin seguir siempre reglas rígidas?', 'PER', 8) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_008';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_008';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_008';

-- Pregunta 9
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_009', '¿Te atraen carreras relacionadas con comunicación visual, arquitectura, arte, moda, cine o diseño?', 'PER', 9) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_009';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_009';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_009';

-- Pregunta 10
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_010', '¿Te gusta ayudar, enseñar, orientar o acompañar a otras personas en sus problemas o aprendizajes?', 'PER', 10) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_010';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_010';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_010';

-- Pregunta 11
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_011', '¿Te sientes cómodo trabajando con niños, jóvenes, pacientes, comunidades o grupos humanos?', 'PER', 11) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_011';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_011';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_011';

-- Pregunta 12
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_012', '¿Te interesa contribuir al bienestar, salud, educación o desarrollo social de las personas?', 'PER', 12) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_012';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_012';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_012';

-- Pregunta 13
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_013', '¿Te gusta liderar equipos, convencer personas, negociar o presentar ideas frente a otros?', 'PER', 13) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_013';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_013';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_013';

-- Pregunta 14
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_014', '¿Te motiva crear negocios, vender productos, dirigir proyectos o tomar decisiones estratégicas?', 'PER', 14) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_014';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_014';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_014';

-- Pregunta 15
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_015', '¿Te interesa trabajar en administración, marketing, derecho, emprendimiento, comercio o gestión?', 'PER', 15) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_015';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_015';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_015';

-- Pregunta 16
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_016', '¿Te gusta organizar información, registrar datos, revisar documentos o seguir procesos claros?', 'PER', 16) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_016';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_016';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_016';

-- Pregunta 17
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_017', '¿Te sientes cómodo trabajando con números, archivos, normas, presupuestos o reportes administrativos?', 'PER', 17) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_017';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_017';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_017';

-- Pregunta 18
INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden) VALUES ('PREG_018', '¿Prefieres tareas estructuradas donde haya orden, precisión, control y cumplimiento de reglas?', 'PER', 18) ON CONFLICT DO NOTHING;
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me encanta', 3.0, 1 FROM preguntas_test WHERE codigo_pregunta = 'PREG_018';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'Me es indiferente', 1.0, 2 FROM preguntas_test WHERE codigo_pregunta = 'PREG_018';
INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden) SELECT id_pregunta, 'No me gusta', 0.0, 3 FROM preguntas_test WHERE codigo_pregunta = 'PREG_018';

-- ¡Fin del Seed!
