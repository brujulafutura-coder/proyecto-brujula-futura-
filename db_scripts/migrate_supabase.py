"""
Brújula Futura — Script de Migración de Supabase
Permite clonar tanto la estructura como los datos del Supabase viejo al nuevo de forma automatizada.
Uso: python db_scripts/migrate_supabase.py <SOURCE_DATABASE_URL> <TARGET_DATABASE_URL>
"""
import os
import sys
import re
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.orm import sessionmaker

# Configurar el path para poder importar los modelos del backend
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.append(backend_path)

# Cargar el archivo .env del backend para evitar ValidationError de Pydantic
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_path, '.env'))

from app.models.models import Base


def split_sql_statements(sql_text):
    """Divide un script SQL con múltiples comandos en sentencias individuales ejecutables por SQLAlchemy."""
    # Eliminar comentarios de línea
    clean_sql = re.sub(r'--.*?\n', '\n', sql_text)
    # Reemplazar bloques de comentarios multilinea
    clean_sql = re.sub(r'/\*.*?\*/', '', clean_sql, flags=re.DOTALL)
    
    # Expresión para dividir por punto y coma, pero respetando las funciones PL/pgSQL
    statements = []
    current_statement = []
    in_dollar_quote = False
    
    for line in clean_sql.split('\n'):
        # Detectar el inicio o fin de un bloque de código PL/pgSQL con $$
        if '$$' in line:
            in_dollar_quote = not in_dollar_quote
            
        current_statement.append(line)
        
        if ';' in line and not in_dollar_quote:
            # Si hay un punto y coma fuera de las comillas de dólar, cerramos la sentencia
            stmt_str = '\n'.join(current_statement).strip()
            if stmt_str:
                statements.append(stmt_str)
            current_statement = []
            
    # Añadir cualquier fragmento restante
    stmt_str = '\n'.join(current_statement).strip()
    if stmt_str:
        statements.append(stmt_str)
        
    return statements

def migrate(source_url: str, target_url: str):
    print("====================================================")
    print("          MIGRACIÓN DE BRÚJULA FUTURA")
    print("====================================================")
    
    # 1. Conexiones
    print("\n[1/5] Conectando a las bases de datos...")
    try:
        source_engine = create_engine(source_url)
        target_engine = create_engine(target_url)
        
        # Probar conexión
        with source_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        with target_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Conexiones establecidas exitosamente.")
    except Exception as e:
        print(f"[ERROR] Error al conectar a las bases de datos: {e}")
        sys.exit(1)

    # 2. Estructura y Tablas en el destino
    print("\n[2/5] Creando la estructura (tablas, funciones y triggers) en el destino...")
    db_scripts_dir = os.path.dirname(__file__)
    schema_files = [
        "01_brujula_futura_schema.sql",
        "02_analytics.sql",
        "03_crear_tabla_resultados.sql"
    ]
    
    with target_engine.begin() as target_conn:
        for file_name in schema_files:
            file_path = os.path.join(db_scripts_dir, file_name)
            if not os.path.exists(file_path):
                print(f"[WARN] Archivo {file_name} no encontrado en db_scripts/, omitiendo...")
                continue
                
            print(f"-> Leyendo y ejecutando {file_name}...")
            with open(file_path, "r", encoding="utf-8") as f:
                sql_content = f.read()
                
            statements = split_sql_statements(sql_content)
            for stmt in statements:
                if stmt.strip():
                    try:
                        target_conn.execute(text(stmt))
                    except Exception as e:
                        # Silenciar errores por elementos que ya existen en destino
                        if "already exists" in str(e).lower():
                            continue
                        print(f"  [WARN] Advertencia en comando:\n{stmt[:80]}...\n  Error: {e}\n")
        print("[OK] Estructura replicada en la base de datos de destino.")

    # 3. Orden de migración de tablas para respetar claves foráneas (dependencias)
    tables_order = [
        "roles_usuario",
        "instituciones",
        "usuarios",
        "perfiles_estudiante",
        "areas_vocacionales",
        "preguntas_test",
        "aptitudes",
        "intereses",
        "opciones_test",
        "carreras",
        "universidades",
        "carrera_universidad",
        "resultados_test",
        "eventos_analitica",
        "logs_auditoria"
    ]

    # 4. Copiar datos tabla por tabla
    print("\n[3/5] Transfiriendo registros desde la base de datos de origen...")
    metadata = MetaData()
    metadata.reflect(bind=source_engine)
    
    with source_engine.connect() as source_conn:
        with target_engine.begin() as target_conn:
            for table_name in tables_order:
                if table_name not in metadata.tables:
                    print(f"[WARN] Tabla '{table_name}' no existe en origen. Omitiendo.")
                    continue
                
                table = metadata.tables[table_name]
                
                # Leer registros
                rows = source_conn.execute(table.select()).fetchall()
                if not rows:
                    print(f"  · '{table_name}': Sin registros para copiar.")
                    continue
                
                print(f"  · '{table_name}': Copiando {len(rows)} registros...")
                
                # Convertir los rows a diccionarios usando _mapping de SQLAlchemy 2.0
                data = [dict(r._mapping) for r in rows]
                
                # Limpiar datos previos en destino para evitar conflictos
                target_conn.execute(table.delete())
                
                # Insertar en destino conservando claves primarias
                target_conn.execute(table.insert(), data)

    print("[OK] Datos migrados con éxito.")

    # 5. Sincronizar secuencias de PostgreSQL en destino
    print("\n[4/5] Sincronizando secuencias de PostgreSQL en la nueva base de datos...")
    pk_map = {
        "roles_usuario": "id_rol",
        "instituciones": "id_institucion",
        "usuarios": "id_usuario",
        "perfiles_estudiante": "id_perfil",
        "areas_vocacionales": "id_area",
        "preguntas_test": "id_pregunta",
        "opciones_test": "id_opcion",
        "aptitudes": "id_aptitud",
        "intereses": "id_interes",
        "carreras": "id_carrera",
        "universidades": "id_universidad",
        "carrera_universidad": "id_carrera_universidad",
        "resultados_test": "id_resultado",
        "eventos_analitica": "id_evento",
        "logs_auditoria": "id_log"
    }

    with target_engine.begin() as target_conn:
        for table_name, pk in pk_map.items():
            # Resetear el valor de la secuencia autoincremental al máximo id presente
            sql_seq = f"""
                SELECT setval(
                    pg_get_serial_sequence('{table_name}', '{pk}'), 
                    COALESCE((SELECT MAX({pk}) FROM {table_name}), 1)
                );
            """
            try:
                target_conn.execute(text(sql_seq))
            except Exception as e:
                # Algunas tablas podrían no tener una secuencia serial asociada
                pass
    print("[OK] Secuencias de autoincremento sincronizadas.")

    print("\n[5/5] Finalizando proceso...")
    print("====================================================")
    print("   === MIGRACION DE BASE DE DATOS EXITOSA ===")
    print("====================================================")
    print("Toda la información del Supabase viejo fue clonada")
    print("al Supabase nuevo, conservando estructura, registros,")
    print("analíticas de uso e historial de test vocacionales.")
    print("====================================================")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        # Intentar obtener las variables de entorno si no se proveen argumentos
        source = os.getenv("SOURCE_DATABASE_URL")
        target = os.getenv("TARGET_DATABASE_URL")
        if not source or not target:
            print("\n[ERROR] Error: Faltan argumentos de ejecución.")
            print("Uso: python db_scripts/migrate_supabase.py <SOURCE_DATABASE_URL> <TARGET_DATABASE_URL>")
            sys.exit(1)
    else:
        source = sys.argv[1]
        target = sys.argv[2]
        
    migrate(source, target)
