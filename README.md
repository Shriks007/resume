# Online Resume Builder

A web-based Resume Builder with multiple templates, real-time editing, and PDF export.

## Setup Instructions for Local Development

### 1. Install Required Packages
```
pip install -r local_requirements.txt
```

### 2. Run the Application

#### Windows:
```
run_local.bat
```

#### Mac/Linux:
```
./run_local.sh
```

The app will be available at http://localhost:5000

### 3. Notes for Python 3.13 Users
If you're using Python 3.13+ on Windows, this application includes fixes for socket errors that may occur with the Flask development server. The fixes are automatically applied when running with the provided scripts.

### 4. Database
- The application uses SQLite for local development
- A database file (`resume_builder.db`) will be created automatically on first run
- No additional database setup is required

## Features
- User authentication with "Remember Me" functionality
- Multiple professional resume templates
- Real-time editing with autosave
- PDF generation and download
- Resume sharing via unique links
- Mobile-responsive design

## File Structure
- `local_*.py` files - For local SQLite development
- `templates/` - HTML templates
- `static/` - CSS, JavaScript, and other static assets
- `run_local.bat/sh` - Scripts to run the application locally