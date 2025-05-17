"""
Local development entry point for SQLite version
Use this file when running the app locally
"""
import logging
import os
import secrets
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Define base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize extensions
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

# Create the app
app = Flask(__name__)

# Configure the app with SQLite settings
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///resume_builder.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "dev_secret_key_123"  # Fixed secret key for local development
app.config["WTF_CSRF_SECRET_KEY"] = "dev_csrf_key_123"  # Fixed CSRF key for local development
app.config["SESSION_TYPE"] = "filesystem"
app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 24 * 30  # 30 days
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True
}

# Initialize extensions with app
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

# Run the app
if __name__ == "__main__":
    # Import after app is created to avoid circular imports
    from local_models import User, Resume
    from local_routes import *
    
    # Ensure instance folder exists
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
    
    # Create database tables within app context
    with app.app_context():
        try:
            db.create_all()
            print("Database initialized successfully!")
        except Exception as e:
            print(f"Error initializing database: {e}")
            raise
    
    # Run the app with settings to handle Python 3.13 socketserver issue
    import platform
    import sys
    
    # Special handling for Python 3.13+ on Windows to fix socket errors
    if sys.version_info >= (3, 13) and platform.system() == 'Windows':
        from werkzeug.serving import run_simple
        print(f"Running with Python {sys.version_info.major}.{sys.version_info.minor} on {platform.system()} - using custom server...")
        run_simple('0.0.0.0', 5000, app, use_reloader=True, use_debugger=True)
    else:
        # Default Flask development server for other platforms/versions
        app.run(host="0.0.0.0", port=5000, debug=True)