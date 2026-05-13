"""
Brújula Futura — Motor de Cálculo RIASEC
Procesa las respuestas del test y devuelve el perfil vocacional.
Basado en el modelo de John Holland (1959).
"""
from typing import List


# Mapeo de preguntas a áreas RIASEC por su orden (1-18)
# Preguntas 1-3: R, 4-6: I, 7-9: A, 10-12: S, 13-15: E, 16-18: C
AREA_POR_ORDEN = {
    1: "R", 2: "R", 3: "R",
    4: "I", 5: "I", 6: "I",
    7: "A", 8: "A", 9: "A",
    10: "S", 11: "S", 12: "S",
    13: "E", 14: "E", 15: "E",
    16: "C", 17: "C", 18: "C",
}


def calcular_perfil_riasec(
    respuestas: list,
    opciones_seleccionadas: list,
    preguntas: list,
    areas: list,
) -> List[dict]:
    """
    Calcula los puntajes RIASEC basándose en las respuestas del estudiante.

    Args:
        respuestas: Lista de RespuestaTestRequest (id_pregunta, id_opcion)
        opciones_seleccionadas: Lista de modelos OpcionTest
        preguntas: Lista de modelos PreguntaTest
        areas: Lista de modelos AreaVocacional

    Returns:
        Lista de diccionarios con puntaje y porcentaje por cada área RIASEC.
    """
    # Mapear opciones por ID para acceso rápido
    opciones_map = {o.id_opcion: o for o in opciones_seleccionadas}

    # Mapear preguntas por ID
    preguntas_map = {p.id_pregunta: p for p in preguntas}

    # Inicializar puntajes por área
    puntajes = {"R": 0.0, "I": 0.0, "A": 0.0, "S": 0.0, "E": 0.0, "C": 0.0}
    max_por_area = {"R": 0.0, "I": 0.0, "A": 0.0, "S": 0.0, "E": 0.0, "C": 0.0}

    # Calcular puntaje máximo posible por área (3 preguntas x 3.0 puntos = 9.0)
    for orden, area_code in AREA_POR_ORDEN.items():
        max_por_area[area_code] += 3.0  # Puntaje máximo por pregunta

    # Sumar puntajes según las respuestas
    for resp in respuestas:
        opcion = opciones_map.get(resp.id_opcion)
        pregunta = preguntas_map.get(resp.id_pregunta)

        if opcion and pregunta:
            # Determinar el área por el orden de la pregunta
            area_code = AREA_POR_ORDEN.get(pregunta.orden)
            if area_code:
                puntajes[area_code] += float(opcion.valor_puntaje)

    # Construir los resultados con porcentajes
    areas_map = {a.codigo_area.strip(): a.nombre_area for a in areas}

    resultado = []
    for code in ["R", "I", "A", "S", "E", "C"]:
        puntaje = puntajes[code]
        maximo = max_por_area[code]
        porcentaje = round((puntaje / maximo) * 100, 2) if maximo > 0 else 0.0

        resultado.append({
            "codigo_area": code,
            "nombre_area": areas_map.get(code, code),
            "puntaje": round(puntaje, 2),
            "porcentaje": porcentaje,
        })

    # Ordenar de mayor a menor puntaje
    resultado.sort(key=lambda x: x["puntaje"], reverse=True)

    return resultado
