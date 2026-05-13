-- =========================================================
-- Brújula Futura — Tabla de Resultados del Test
-- Almacena el historial de tests realizados por cada usuario.
-- =========================================================

CREATE TABLE IF NOT EXISTS resultados_test (
    id_resultado    SERIAL PRIMARY KEY,
    id_usuario      INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    codigo_dominante VARCHAR(6) NOT NULL,
    nombre_dominante VARCHAR(80) NOT NULL,
    perfil_riasec   JSONB NOT NULL,
    carreras_recomendadas JSONB,
    fecha_realizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas por usuario
CREATE INDEX IF NOT EXISTS idx_resultados_usuario ON resultados_test(id_usuario);

-- Índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_resultados_fecha ON resultados_test(fecha_realizacion DESC);
