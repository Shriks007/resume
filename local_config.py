"""
Local development configuration for SQLite
Import this file in the main app.py when running locally
"""
import os
import secrets

# Database configuration
SQLALCHEMY_DATABASE_URI = "sqlite:///resume_builder.db"
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Security
SECRET_KEY = os.environ.get("SECRET_KEY") or secrets.token_hex(16)