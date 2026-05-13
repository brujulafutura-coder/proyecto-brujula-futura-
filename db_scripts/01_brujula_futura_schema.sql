-- =========================================================
-- BASE DE DATOS: BRÚJULA FUTURA (VERSIÓN SUPABASE / POSTGRESQL)
-- Incluye:
-- 1. Tablas y relaciones adaptadas a PostgreSQL.
-- 2. Soporte nativo para gen_random_uuid().
-- 3. Tabla de Auditoría para trazabilidad.
-- 4. Preparación para integraciones externas (codigo_origen).
-- 5. Triggers en PL/pgSQL para validaciones y auditoría.
-- =========================================================

-- Extensión necesaria para UUIDs si usamos gen_random_uuid (incorporada en PG 13+)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función genérica para actualizar timestamps
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- TABLA: roles_usuario
-- =========================================================
CREATE TABLE roles_usuario (
    id_rol SERIAL PRIMARY KEY,
    cod_rol CHAR(3) NOT NULL UNIQUE,
    nombre_rol VARCHAR(40) NOT NULL,
    descripcion VARCHAR(200) NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

COMMENT ON TABLE roles_usuario IS 'Catálogo de roles del sistema';

-- =========================================================
-- TABLA: instituciones
-- =========================================================
CREATE TABLE instituciones (
    id_institucion SERIAL PRIMARY KEY,
    codigo_institucion CHAR(10) NOT NULL UNIQUE,
    nombre_institucion VARCHAR(120) NOT NULL,
    tipo_institucion CHAR(3) NOT NULL CHECK (tipo_institucion IN ('COL','FUN','UNI')),
    provincia VARCHAR(80) NULL,
    ciudad VARCHAR(80) NULL,
    direccion VARCHAR(150) NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

-- =========================================================
-- TABLA: usuarios
-- =========================================================
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INTEGER NOT NULL REFERENCES roles_usuario(id_rol),
    id_institucion INTEGER NULL REFERENCES instituciones(id_institucion),
    nombres VARCHAR(80) NULL,
    apellidos VARCHAR(80) NULL,
    alias_usuario VARCHAR(50) NULL,
    correo VARCHAR(120) NULL UNIQUE,
    clave_hash VARCHAR(255) NULL, -- Generado en Backend (Bcrypt)
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA')),
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NULL
);

CREATE TRIGGER trg_usuarios_actualizacion
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();

-- =========================================================
-- TABLA: sesiones_mvp
-- =========================================================
CREATE TABLE sesiones_mvp (
    id_sesion BIGSERIAL PRIMARY KEY,
    id_usuario INTEGER NULL REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    codigo_sesion UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    canal_acceso VARCHAR(40) NULL,
    dispositivo VARCHAR(80) NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ABI' CHECK (estado IN ('ABI','CER'))
);

-- =========================================================
-- TABLA: perfiles_estudiante
-- =========================================================
CREATE TABLE perfiles_estudiante (
    id_perfil SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    edad SMALLINT NULL CHECK (edad IS NULL OR (edad >= 12 AND edad <= 25)),
    nivel_educativo CHAR(3) NOT NULL CHECK (nivel_educativo IN ('BAS','BAC')),
    curso VARCHAR(30) NULL,
    estado_decision CHAR(3) NOT NULL DEFAULT 'IND' CHECK (estado_decision IN ('IND','DEC','DUD')),
    objetivo_principal VARCHAR(150) NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: areas_vocacionales (Modelo RIASEC)
-- =========================================================
CREATE TABLE areas_vocacionales (
    id_area SERIAL PRIMARY KEY,
    codigo_area CHAR(6) NOT NULL UNIQUE,
    nombre_area VARCHAR(80) NOT NULL,
    descripcion TEXT NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

-- =========================================================
-- TABLA: intereses
-- =========================================================
CREATE TABLE intereses (
    id_interes SERIAL PRIMARY KEY,
    id_area INTEGER NOT NULL REFERENCES areas_vocacionales(id_area),
    codigo_interes CHAR(8) NOT NULL UNIQUE,
    nombre_interes VARCHAR(100) NOT NULL,
    descripcion VARCHAR(250) NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

-- =========================================================
-- TABLA: aptitudes
-- =========================================================
CREATE TABLE aptitudes (
    id_aptitud SERIAL PRIMARY KEY,
    codigo_aptitud CHAR(8) NOT NULL UNIQUE,
    nombre_aptitud VARCHAR(100) NOT NULL,
    descripcion VARCHAR(250) NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

-- =========================================================
-- TABLA: preguntas_test
-- =========================================================
CREATE TABLE preguntas_test (
    id_pregunta SERIAL PRIMARY KEY,
    codigo_pregunta CHAR(10) NOT NULL UNIQUE,
    texto_pregunta VARCHAR(300) NOT NULL,
    tipo_pregunta CHAR(3) NOT NULL CHECK (tipo_pregunta IN ('APT','INT','PER')),
    orden SMALLINT NOT NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

-- =========================================================
-- TABLA: opciones_test
-- =========================================================
CREATE TABLE opciones_test (
    id_opcion SERIAL PRIMARY KEY,
    id_pregunta INTEGER NOT NULL REFERENCES preguntas_test(id_pregunta) ON DELETE CASCADE,
    id_aptitud INTEGER NULL REFERENCES aptitudes(id_aptitud) ON DELETE SET NULL,
    id_interes INTEGER NULL REFERENCES intereses(id_interes) ON DELETE SET NULL,
    texto_opcion VARCHAR(250) NOT NULL,
    valor_puntaje DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    orden SMALLINT NOT NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

-- =========================================================
-- TABLA: respuestas_test
-- =========================================================
CREATE TABLE respuestas_test (
    id_respuesta BIGSERIAL PRIMARY KEY,
    id_sesion BIGINT NOT NULL REFERENCES sesiones_mvp(id_sesion) ON DELETE CASCADE,
    id_usuario INTEGER NULL REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    id_pregunta INTEGER NOT NULL REFERENCES preguntas_test(id_pregunta),
    id_opcion INTEGER NOT NULL REFERENCES opciones_test(id_opcion),
    fecha_respuesta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (id_sesion, id_pregunta)
);

-- =========================================================
-- TABLA: resultados_test
-- =========================================================
CREATE TABLE resultados_test (
    id_resultado BIGSERIAL PRIMARY KEY,
    id_sesion BIGINT NOT NULL REFERENCES sesiones_mvp(id_sesion) ON DELETE CASCADE,
    id_usuario INTEGER NULL REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    id_aptitud INTEGER NOT NULL REFERENCES aptitudes(id_aptitud),
    puntaje_obtenido DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (porcentaje >= 0 AND porcentaje <= 100),
    nivel CHAR(3) NOT NULL CHECK (nivel IN ('BAJ','MED','ALT')),
    fecha_calculo TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: carreras (Preparada para integración externa)
-- =========================================================
CREATE TABLE carreras (
    id_carrera SERIAL PRIMARY KEY,
    id_area INTEGER NOT NULL REFERENCES areas_vocacionales(id_area),
    codigo_carrera CHAR(10) NOT NULL UNIQUE,
    codigo_origen VARCHAR(100) NULL UNIQUE, -- Código desde API externa
    nombre_carrera VARCHAR(120) NOT NULL,
    tipo_opcion CHAR(3) NOT NULL CHECK (tipo_opcion IN ('UNI','TEC','OFI','CUR')),
    descripcion TEXT NULL,
    duracion_meses SMALLINT NULL,
    modalidad CHAR(3) NULL CHECK (modalidad IS NULL OR modalidad IN ('PRE','VIR','HIB')),
    salida_laboral TEXT NULL,
    perfil_recomendado TEXT NULL,
    costo_referencial DECIMAL(10,2) NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

-- =========================================================
-- TABLA: universidades (Preparada para integración externa)
-- =========================================================
CREATE TABLE universidades (
    id_universidad SERIAL PRIMARY KEY,
    codigo_universidad CHAR(10) NOT NULL UNIQUE,
    codigo_origen VARCHAR(100) NULL UNIQUE, -- Código desde API externa
    nombre_universidad VARCHAR(150) NOT NULL,
    tipo_universidad CHAR(3) NOT NULL CHECK (tipo_universidad IN ('PUB','PRI','TEC','INS')),
    provincia VARCHAR(80) NULL,
    ciudad VARCHAR(80) NULL,
    sitio_web VARCHAR(255) NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA'))
);

-- =========================================================
-- TABLA: carrera_universidad (Preparada para integración externa)
-- =========================================================
CREATE TABLE carrera_universidad (
    id_carrera_universidad SERIAL PRIMARY KEY,
    id_carrera INTEGER NOT NULL REFERENCES carreras(id_carrera) ON DELETE CASCADE,
    id_universidad INTEGER NOT NULL REFERENCES universidades(id_universidad) ON DELETE CASCADE,
    codigo_origen VARCHAR(100) NULL UNIQUE, -- Código desde API externa
    nombre_programa VARCHAR(150) NOT NULL,
    modalidad CHAR(3) NULL CHECK (modalidad IS NULL OR modalidad IN ('PRE','VIR','HIB')),
    jornada CHAR(3) NULL CHECK (jornada IS NULL OR jornada IN ('MAT','VES','NOC','MIX')),
    costo_matricula DECIMAL(10,2) NULL,
    url_informacion VARCHAR(255) NULL,
    estado CHAR(3) NOT NULL DEFAULT 'ACT' CHECK (estado IN ('ACT','INA')),
    UNIQUE (id_carrera, id_universidad, nombre_programa)
);

-- =========================================================
-- TABLA: logs_auditoria
-- =========================================================
CREATE TABLE logs_auditoria (
    id_log BIGSERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(80) NOT NULL,
    accion CHAR(6) NOT NULL CHECK (accion IN ('INSERT','UPDATE','DELETE')),
    id_registro VARCHAR(50) NOT NULL,
    usuario_db VARCHAR(100) NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    detalles JSONB NULL
);

-- =========================================================
-- DATOS BASE MÍNIMOS
-- =========================================================
INSERT INTO roles_usuario (cod_rol, nombre_rol, descripcion) VALUES
('EST', 'Estudiante', 'Usuario que usa la orientación vocacional'),
('ORI', 'Orientador', 'Usuario que acompaña el proceso vocacional'),
('ADM', 'Administrador', 'Usuario que administra el sistema');

INSERT INTO instituciones (codigo_institucion, nombre_institucion, tipo_institucion, provincia, ciudad, estado) VALUES
('FYA001', 'Fe y Alegría', 'FUN', 'Pichincha', 'Quito', 'ACT');

INSERT INTO areas_vocacionales (codigo_area, nombre_area, descripcion) VALUES
('R', 'Realista', 'Preferencia por actividades prácticas, uso de herramientas, máquinas y trabajo al aire libre o físico.'),
('I', 'Investigador', 'Inclinación por el análisis, curiosidad científica, matemáticas y resolución de problemas teóricos.'),
('A', 'Artístico', 'Valoración de la creatividad, expresión emocional, diseño, música, artes visuales y entornos libres.'),
('S', 'Social', 'Interés en ayudar, curar, enseñar, informar o desarrollar a otras personas. Fuerte empatía.'),
('E', 'Emprendedor', 'Capacidad de liderazgo, persuasión, gestión de negocios y logro de metas organizacionales/económicas.'),
('C', 'Convencional', 'Preferencia por entornos estructurados, orden, manejo de datos, administración y finanzas.');

-- Fin del script PostgreSQL (Supabase)
