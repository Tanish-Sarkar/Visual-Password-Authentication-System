import os, psycopg2
from dotenv import load_dotenv

load_dotenv('e:/College/MU_PROJECTS/Computer Vision PROJECT/Visual-Password-Authentication-System-v2/backend/.env')
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

try:
    print("Altering users table to add display_name...")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) DEFAULT 'User' NOT NULL;")
    conn.commit()
    print("Successfully added display_name column!")
except Exception as e:
    print(f"Error altering table: {e}")

cur.close()
conn.close()
