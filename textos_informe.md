# Descripciones y Conclusión para el Informe de Laboratorio

A continuación, tienes los textos redactados listos para que los incluyas en tu informe, acompañando cada una de las capturas que tomaste.

---

### Descripción Captura 1: Aplicación Funcional Desplegada (Fase 1)
**Texto para el informe:**
> *En la presente captura se evidencia el funcionamiento de la aplicación base "Brújula Futura" desplegada en producción. Como parte de la Fase 1, se seleccionó una arquitectura robusta utilizando React para el frontend y FastAPI para el backend. Esta aplicación productiva implementa correctamente métodos seguros para la gestión de secretos (como JWT) y protección de variables de entorno mediante archivos `.env`, lo cual servirá como punto de contraste para la implementación intencionalmente insegura que se desarrollará en la siguiente fase.*

### Descripción Captura 2: Estructura del Proyecto y Tecnologías (Fase 1)
**Texto para el informe:**
> *La imagen muestra la estructura del repositorio de la aplicación seleccionada. Se puede apreciar la separación entre el código fuente del cliente, el servidor, y los scripts de base de datos PostgreSQL. Esta arquitectura en capas es fundamental, ya que nos permitirá aislar la "implementación insegura" en un módulo específico (laboratorio_seguridad) sin comprometer el código principal, cumpliendo con los requisitos de la investigación inicial.*

### Descripción Captura 3: Identificación de Vulnerabilidades en Código con Bandit (Fase 2)
**Texto para el informe:**
> *Para identificar las vulnerabilidades introducidas de manera controlada, se utilizó **Bandit**, una herramienta de pruebas de seguridad de análisis estático (SAST) diseñada específicamente para encontrar problemas de seguridad en código Python. Al ejecutar el comando `bandit -r .\laboratorio_seguridad\`, la herramienta analizó el código fuente y, como se muestra en la consola, logró detectar con éxito las malas prácticas introducidas: identificó contraseñas de bases de datos expuestas (`DB_PASS`), tokens JWT quemados en el código (`JWT_SECRET_KEY`) y la configuración insegura del puerto. Se utilizó Bandit porque es el estándar de la industria para auditorías de seguridad automatizadas en frameworks como FastAPI o Django, permitiendo detectar fugas de credenciales antes del despliegue.*

### Descripción Captura 4: Explotación de Escalada de Privilegios - Prueba Hack (Fase 2)
**Texto para el informe:**
> *En esta captura se evidencia la ejecución de un script en Python (`prueba_hack.py`) diseñado para demostrar la vulnerabilidad de 'Control de Acceso Roto' (Broken Access Control). El script simula ser un "usuario normal" realizando una petición `DELETE` hacia una ruta administrativa (`/api/admin/delete_user/2`). Como se observa en la consola de respuesta, el servidor devuelve un "200 OK" y el mensaje "Usuario eliminado exitosamente". Esto prueba empíricamente el fallo de seguridad, ya que el endpoint administrativo carecía de una validación real de privilegios basada en tokens en el backend, confiando erróneamente en los datos enviados por el cliente.*

---

### Descripción Captura 5: Remediación de Código Real y Protección de Secretos (Fase 3)
**Texto para el informe:**
> *En esta captura se evidencia la remediación de vulnerabilidades críticas en el código base real del proyecto "Brújula Futura". Se identificó que el archivo `backend/.env`, el cual contenía credenciales sensibles (claves de Supabase y JWT Secret), estaba siendo rastreado por el control de versiones. Para mitigarlo, se ejecutó el comando `git rm --cached backend/.env` y se actualizó el archivo `.gitignore`. Adicionalmente, se restringió la política de CORS en `main.py` eliminando expresiones regulares permisivas (`.*\.vercel\.app`) y limitando el acceso exclusivamente a la URL de producción autorizada. Esta remediación demuestra la importancia de asegurar la infraestructura real antes del despliegue final.*

### Descripción Captura 6: Análisis de Composición de Software (SCA) (Fase 4)
**Texto para el informe:**
> *Como parte de la validación y pruebas de endurecimiento, se implementó una estrategia de Análisis de Composición de Software (SCA) utilizando la herramienta `pip-audit` o herramientas de auditoría en la nube. En la captura (que tomarás del escaneo de dependencias o de la configuración de reglas de seguridad) se demuestra la verificación activa contra vulnerabilidades conocidas (CVEs). Esta práctica permite asegurar que las dependencias instaladas no expongan el sistema. Este enfoque complementa el análisis estático previo, garantizando que tanto el código propio como el de terceros cumpla con los estándares de seguridad.*

---

## Conclusión General del Laboratorio

**Conclusión para el informe:**
> *La presente práctica de laboratorio permitió contrastar de manera práctica las diferencias entre una aplicación correctamente configurada y una con fallos de seguridad críticos. En la Fase 1, se analizó la importancia de mantener una arquitectura que aísle los secretos mediante variables de entorno y gestione la identidad de manera cifrada (JWT). Durante la Fase 2, la introducción intencional de vulnerabilidades demostró lo frágiles que pueden ser los sistemas cuando no se aplican los principios de 'mínimo privilegio' y protección de datos sensibles.*
> 
> *El uso de la herramienta de análisis estático **Bandit** fue fundamental para comprender cómo los procesos automatizados (DevSecOps) pueden prevenir que credenciales hardcodeadas (como contraseñas de BD o llaves de Amazon S3) lleguen a repositorios públicos. Asimismo, la ejecución del script de prueba dinámica evidenció que la validación de roles debe ocurrir siempre a nivel de backend y nunca depender exclusivamente de las cabeceras (headers) enviadas por el cliente. En resumen, la gestión segura de configuración no es solo una buena práctica de código, sino una barrera fundamental para evitar escaladas de privilegios y compromisos totales de la infraestructura de software.*
