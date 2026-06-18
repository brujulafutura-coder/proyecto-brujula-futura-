-- Script para crear la tabla de métricas de analítica de uso
-- Este script crea la tabla eventos_analitica para capturar la telemetría

CREATE TABLE IF NOT EXISTS eventos_analitica (
    id_evento BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    detalles JSONB,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para búsquedas rápidas en el futuro de reportes
CREATE INDEX IF NOT EXISTS idx_analitica_session ON eventos_analitica(session_id);
CREATE INDEX IF NOT EXISTS idx_analitica_tipo_evento ON eventos_analitica(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_analitica_fecha ON eventos_analitica(fecha_creacion);

-- Comentarios explicativos
COMMENT ON TABLE eventos_analitica IS 'Tabla para registro de métricas de telemetría (uso de la plataforma)';
COMMENT ON COLUMN eventos_analitica.session_id IS 'UUID de la sesión generado en el frontend';
COMMENT ON COLUMN eventos_analitica.tipo_evento IS 'Identificador del evento (TEST_START, CAREER_VIEW, etc)';
COMMENT ON COLUMN eventos_analitica.detalles IS 'Información variable estructurada (carrera_id, duración, etc)';
