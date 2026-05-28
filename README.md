# Brujula Futura

> Herramienta de orientacion vocacional para estudiantes de bachillerato en Ecuador.

[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![License](https://img.shields.io/badge/licencia-MIT-green)](LICENSE)

---

## Descripcion

**Brujula Futura** es una herramienta de orientacion vocacional para estudiantes de bachillerato (15-18 anos), especialmente de colegios Fe y Alegria en Ecuador. Su objetivo es ayudar a explorar intereses, conocer carreras tradicionales y emergentes, y revisar opciones universitarias reales, de forma mas clara, visual y guiada.

La hipotesis del proyecto: muchos estudiantes no tienen claridad sobre que estudiar porque la orientacion que reciben es muy general. Brujula Futura propone una experiencia breve, interactiva y util para explorar el futuro.

---

## Integrantes y roles

| Nombre | Rol |
|--------|-----|
| [Nombre] | Product Owner |
| [Nombre] | Scrum Master |
| [Nombre] | Developer |
| [Nombre] | Developer |

---

## Stack tecnico

| Capa | Tecnologia |
|------|-----------|
| Frontend Web | React 19 + Vite 8 |
| Estilos | Vanilla CSS (design system propio) |
| App Android | Kotlin |
| Diseno UI | Figma |
| Repositorio | GitHub |
| Deploy | Vercel |

---

## Estructura del proyecto

```
g8-brujula-futura-puce-2025/
├── src/
│   ├── App.jsx          # Componente principal con las 7 secciones del PMV
│   ├── App.css          # Estilos de componentes y secciones
│   ├── index.css        # Design system: tokens, tipografia, reset
│   └── main.jsx         # Punto de entrada de React
├── docs/                # Documentacion y capturas de pantalla
├── tests/               # Pruebas
├── public/              # Archivos estaticos
├── .env.example         # Variables de entorno de ejemplo
├── vite.config.js       # Configuracion de Vite
└── README.md            # Documentacion principal
```

---

## Instalacion y uso

```bash
# 1. Clonar el repositorio
git clone https://github.com/floressemily/Br-jula-Futura.git
cd Br-jula-Futura

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:5173
```

---

## Flujo del PMV

El producto minimo viable sigue este flujo de 7 pasos:

1. **Bienvenida** - Hero visual con propuesta de valor clara
2. **Intereses visuales** - Chips interactivos para seleccionar areas de interes
3. **Vive una carrera** - Tarjetas inmersivas con descripcion real de 3 carreras
4. **Descubre carreras nuevas** - Opciones emergentes con etiquetas de demanda
5. **Resultados / carreras afines** - Recomendaciones con porcentaje de compatibilidad
6. **Universidades y opciones reales** - Instituciones ecuatorianas con datos concretos
7. **Ruta final** - Resumen personalizado del proceso de exploracion

---

## URL de deploy

Pendiente de configuracion en Vercel.

---

## Credenciales de prueba

No aplica por el momento. El MVP es de acceso abierto, sin autenticacion.

---
<!-- Mantenimiento técnico del repositorio sin cambios funcionales -->
## Definition of Done

Una funcionalidad se considera **terminada** cuando cumple todos estos criterios:

- [ ] Esta disenada en Figma con aprobacion del equipo
- [ ] Esta implementada en codigo y funciona correctamente
- [ ] Ha sido probada manualmente en Chrome y mobile
- [ ] El codigo fue revisado mediante Pull Request
- [ ] Fue subida al repositorio en la rama correspondiente
- [ ] Esta desplegada y visible en la URL de produccion

---

## Licencia

MIT 2025 - Grupo 8, PUCE - Brujula Futura
