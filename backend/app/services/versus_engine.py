"""
Brújula Futura — Motor de Análisis "Versus"
Usa Pandas para comparar carreras y generar conclusiones.
"""
import pandas as pd
from typing import List


def analizar_versus(items: list) -> dict:
    """
    Recibe una lista de VersusCarreraItem y genera un análisis comparativo
    usando Pandas.

    Returns:
        Diccionario con conclusiones y métricas de comparación.
    """
    # Construir DataFrame
    data = []
    for item in items:
        data.append({
            "nombre": item.nombre_carrera,
            "tipo": item.tipo_opcion,
            "duracion_meses": item.duracion_meses or 0,
            "costo_promedio": item.costo_promedio or 0,
            "universidades": item.universidades_disponibles,
            "area": item.area_nombre or "N/A",
        })

    df = pd.DataFrame(data)

    # Análisis básico
    analisis = {}

    # 1. Carrera más corta
    if not df.empty and df["duracion_meses"].sum() > 0:
        idx_corta = df["duracion_meses"].idxmin()
        analisis["mas_corta"] = {
            "nombre": df.loc[idx_corta, "nombre"],
            "duracion_meses": int(df.loc[idx_corta, "duracion_meses"]),
        }

    # 2. Carrera más económica
    df_con_costo = df[df["costo_promedio"] > 0]
    if not df_con_costo.empty:
        idx_barata = df_con_costo["costo_promedio"].idxmin()
        analisis["mas_economica"] = {
            "nombre": df.loc[idx_barata, "nombre"],
            "costo_promedio": float(df.loc[idx_barata, "costo_promedio"]),
        }

    # 3. Carrera con más opciones universitarias
    if not df.empty:
        idx_mas_unis = df["universidades"].idxmax()
        analisis["mas_opciones"] = {
            "nombre": df.loc[idx_mas_unis, "nombre"],
            "universidades": int(df.loc[idx_mas_unis, "universidades"]),
        }

    # 4. Resumen estadístico
    analisis["resumen"] = {
        "duracion_promedio_meses": round(float(df["duracion_meses"].mean()), 1) if not df.empty else 0,
        "costo_promedio_general": round(float(df_con_costo["costo_promedio"].mean()), 2) if not df_con_costo.empty else 0,
        "total_universidades": int(df["universidades"].sum()) if not df.empty else 0,
    }

    # 5. Carreras gratuitas disponibles
    gratuitas = df[df["costo_promedio"] == 0]
    if not gratuitas.empty:
        analisis["opciones_gratuitas"] = gratuitas["nombre"].tolist()

    return analisis
