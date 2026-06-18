-- Script para crear el rol Administrador y otorgárselo al usuario principal

-- 1. Insertar el rol ADM si no existe
INSERT INTO roles_usuario (cod_rol, nombre_rol, descripcion, estado)
VALUES ('ADM', 'Administrador', 'Control total de usuarios y visualización de métricas y telemetría', 'ACT')
ON CONFLICT (cod_rol) DO NOTHING;

-- 2. Promover la cuenta a Administrador
UPDATE usuarios
SET id_rol = (SELECT id_rol FROM roles_usuario WHERE cod_rol = 'ADM')
WHERE correo = 'matiriveraam84@gmail.com';

-- Si la cuenta existía, el comando UPDATE mostrará 'UPDATE 1'. 
-- Si no existía, asegúrate de registrarte primero en la aplicación con ese correo y vuelve a ejecutar la línea 8.
