import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://brujula-futura-api.onrender.com/api/auth/registro', 
    data=json.dumps({"nombres": "Test", "apellidos": "User", "correo": "test4@test.com", "clave": "123456"}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print("Error code:", e.code)
    print("Error body:", e.read().decode())
except Exception as e:
    print("Exception:", str(e))
