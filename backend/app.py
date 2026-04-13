import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from database import init_db

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app) # allow cross-origin requests

    # Use the SECRET_KEY from the environment
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_secret')

    # Ensure DB tables exist on startup
    try:
        init_db()
    except Exception as e:
        print(f"Error initializing DB: {e}")

    # Register blueprints (routes will be added shortly)
    from routes.auth import auth_bp
    from routes.pages import pages_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(pages_bp, url_prefix='/api/pages')

    @app.route('/')
    def index():
         return {"message": "Welcome to the API Setup."}, 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
