# Prompt para ChatGPT Plus (Copiar y Pegar)

Por favor, copia el siguiente texto y pégalo en tu sesión de ChatGPT Plus con acceso a internet. El resultado que te devuelva guárdalo en un archivo de texto o compártemelo directamente aquí para que yo me encargue de cargarlo a Supabase.

***

**[INICIO DEL PROMPT PARA CHATGPT]**

Actúa como un experto en extracción de datos web y psicología vocacional. Necesito que busques información real y actualizada en internet para poblar una base de datos relacional de orientación vocacional enfocada en Ecuador (o Latinoamérica en general). 

Tu objetivo es generar **3 bloques de datos en formato JSON** estructurado, listo para ser consumido por un script de Python.

**REGLAS ESTRICTAS:**
- NO me des explicaciones largas. Solo devuelve los bloques de código JSON.
- Asegúrate de que las propiedades del JSON coincidan exactamente con las que te pido.
- La información debe ser verídica e investigada en la web.

### Bloque 1: Test Vocacional (Modelo RIASEC)
Investiga y redacta un test vocacional de 18 preguntas (3 por cada área del modelo RIASEC de John Holland: Realista, Investigador, Artístico, Social, Emprendedor, Convencional).
**Formato esperado (JSON):**
```json
{
  "preguntas": [
    {
      "codigo_area": "R",
      "texto_pregunta": "¿Disfrutas armar o reparar equipos electrónicos o mecánicos?",
      "opciones": [
        {"texto": "Me encanta", "puntaje": 3.0},
        {"texto": "Me es indiferente", "puntaje": 1.0},
        {"texto": "No me gusta", "puntaje": 0.0}
      ]
    }
  ]
}
```
*(Genera las 18 preguntas siguiendo esta estructura)*

### Bloque 2: Universidades e Institutos
Busca 10 universidades o institutos reales y representativos (preferiblemente de Ecuador, como USFQ, PUCE, EPN, etc.).
**Formato esperado (JSON):**
```json
{
  "universidades": [
    {
      "codigo_universidad": "USFQ01",
      "nombre": "Universidad San Francisco de Quito",
      "tipo": "PRI", 
      "provincia": "Pichincha",
      "ciudad": "Quito",
      "sitio_web": "https://www.usfq.edu.ec"
    }
  ]
}
```
*(Nota: tipo debe ser PUB, PRI, TEC o INS)*

### Bloque 3: Carreras y Oferta Académica (El Versus)
Investiga 15 carreras de alta demanda. Asigna a qué área RIASEC (R, I, A, S, E, o C) pertenece cada una principalmente. Luego, simula la oferta de estas carreras en las universidades del Bloque 2.
**Formato esperado (JSON):**
```json
{
  "carreras": [
    {
      "codigo_carrera": "INGSOFT",
      "codigo_area_riasec": "I",
      "nombre": "Ingeniería en Software",
      "tipo_opcion": "UNI",
      "duracion_meses": 48,
      "salida_laboral": "Alta demanda en empresas tecnológicas, startups y remoto.",
      "perfil_recomendado": "Gusto por la lógica, matemáticas y resolución de problemas.",
      "oferta_universitaria": [
        {
          "codigo_universidad": "USFQ01",
          "modalidad": "PRE",
          "jornada": "MAT",
          "costo_referencial_semestre": 4500.00
        }
      ]
    }
  ]
}
```
*(Nota: tipo_opcion debe ser UNI, TEC, OFI o CUR. Modalidad: PRE, VIR, HIB. Jornada: MAT, VES, NOC, MIX. Genera 15 carreras distintas y asócialas a 1 o 2 universidades cada una).*

**[FIN DEL PROMPT PARA CHATGPT]**
