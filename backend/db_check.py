import os, psycopg2
from dotenv import load_dotenv

load_dotenv('e:/College/MU_PROJECTS/Computer Vision PROJECT/Visual-Password-Authentication-System-v2/backend/.env')
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

print("Schema of users:")
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';")
print(cur.fetchall())

print("Schema of auth_logs:")
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'auth_logs';")
print(cur.fetchall())

cur.close()
conn.close()
