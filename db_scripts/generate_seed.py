import json

with open('seed_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

sql = "-- =========================================================\n"
sql += "-- SCRIPT DE POBLACIÓN DE DATOS (SEED) PARA SUPABASE\n"
sql += "-- =========================================================\n\n"

# 1. Universidades
sql += "-- Inserción de Universidades\n"
for u in data.get('universidades', []):
    sql += f"INSERT INTO universidades (codigo_universidad, nombre_universidad, tipo_universidad, provincia, ciudad, sitio_web)\n"
    sql += f"VALUES ('{u['codigo_universidad']}', '{u['nombre']}', '{u['tipo']}', '{u['provincia']}', '{u['ciudad']}', '{u['sitio_web']}')\n"
    sql += "ON CONFLICT (codigo_universidad) DO NOTHING;\n\n"

# 2. Carreras
sql += "-- Inserción de Carreras\n"
for c in data.get('carreras', []):
    area = c['codigo_area_riasec']
    sql += f"INSERT INTO carreras (id_area, codigo_carrera, nombre_carrera, tipo_opcion, duracion_meses, salida_laboral, perfil_recomendado)\n"
    sql += f"SELECT id_area, '{c['codigo_carrera']}', '{c['nombre']}', '{c['tipo_opcion']}', {c['duracion_meses']}, '{c['salida_laboral']}', '{c['perfil_recomendado']}'\n"
    sql += f"FROM areas_vocacionales WHERE codigo_area = '{area}'\n"
    sql += "ON CONFLICT (codigo_carrera) DO NOTHING;\n\n"

# 3. Oferta Universitaria (Carrera - Universidad)
sql += "-- Inserción de Oferta Universitaria\n"
for c in data.get('carreras', []):
    cod_carrera = c['codigo_carrera']
    for o in c.get('oferta_universitaria', []):
        cod_uni = o['codigo_universidad']
        mod = o['modalidad']
        jor = o['jornada']
        costo = o['costo_referencial_semestre']
        # we need to get id_carrera and id_universidad
        sql += f"INSERT INTO carrera_universidad (id_carrera, id_universidad, nombre_programa, modalidad, jornada, costo_matricula)\n"
        sql += f"SELECT c.id_carrera, u.id_universidad, c.nombre_carrera, '{mod}', '{jor}', {costo}\n"
        sql += f"FROM carreras c, universidades u\n"
        sql += f"WHERE c.codigo_carrera = '{cod_carrera}' AND u.codigo_universidad = '{cod_uni}'\n"
        # No ON CONFLICT DO NOTHING here because we don't have a unique constraint that easily handles it dynamically without a DO UPDATE.
        # But we added UNIQUE (id_carrera, id_universidad, nombre_programa) in the schema.
        sql += "ON CONFLICT (id_carrera, id_universidad, nombre_programa) DO NOTHING;\n\n"


# 4. Preguntas y Opciones RIASEC
sql += "-- Inserción de Preguntas y Opciones del Test RIASEC\n"
pregunta_idx = 1
opcion_idx = 1
for i, p in enumerate(data.get('preguntas', [])):
    cod_area = p['codigo_area']
    texto_preg = p['texto_pregunta']
    cod_preg = f"PREG_{str(i+1).zfill(3)}"
    
    # Insert question
    sql += f"INSERT INTO preguntas_test (codigo_pregunta, texto_pregunta, tipo_pregunta, orden)\n"
    sql += f"VALUES ('{cod_preg}', '{texto_preg}', 'PER', {i+1})\n"
    sql += "ON CONFLICT (codigo_pregunta) DO NOTHING;\n\n"
    
    # Insert options mapping it to the question just created
    for j, opt in enumerate(p.get('opciones', [])):
        texto_opt = opt['texto']
        puntaje = opt['puntaje']
        
        sql += f"INSERT INTO opciones_test (id_pregunta, texto_opcion, valor_puntaje, orden)\n"
        sql += f"SELECT id_pregunta, '{texto_opt}', {puntaje}, {j+1}\n"
        sql += f"FROM preguntas_test WHERE codigo_pregunta = '{cod_preg}';\n\n"

with open('02_brujula_futura_seed.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print("Seed file '02_brujula_futura_seed.sql' generated successfully.")
