import psycopg2

try:
    conn = psycopg2.connect("postgresql://postgres.kmyspqpqtbofpetnwmaj:Matiloco123.@aws-1-sa-east-1.pooler.supabase.com:6543/postgres")
    print("Conexión exitosa a Supabase usando Pooler!")
    
    # Check if tables exist
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = cur.fetchall()
    if tables:
        print("Tablas encontradas:", [t[0] for t in tables])
    else:
        print("Conexión exitosa, pero la base de datos pública está vacía.")
        
    cur.close()
    conn.close()
except Exception as e:
    print("Error de conexión:", str(e))
