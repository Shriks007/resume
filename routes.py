import os
import uuid
import json
from datetime import datetime
from flask import render_template, url_for, flash, redirect, request, jsonify, abort, send_file, session
from flask_login import login_user, current_user, logout_user, login_required
from app import app, db
from forms import RegistrationForm, LoginForm, NewResumeForm, ShareResumeForm
from models import User, Resume

# Home route
@app.route('/')
def index():
    return render_template('index.html', title='Online Resume Builder')

# User authentication routes
@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Your account has been created! You can now log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    form = LoginForm()
    if request.method == 'POST':
        if form.validate_on_submit():
            user = User.query.filter_by(email=form.email.data).first()
            if user and user.check_password(form.password.data):
                session.permanent = form.remember.data  # Only make permanent if remember is checked
                login_user(user, remember=form.remember.data)
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('dashboard'))
            else:
                flash('Login unsuccessful. Please check email and password.', 'danger')
        else:
            # If form didn't validate, show a general error
            flash('Please correct the errors in the form below.', 'danger')
    return render_template('login.html', title='Login', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

# Dashboard route
@app.route('/dashboard')
@login_required
def dashboard():
    resumes = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.updated_at.desc()).all()
    return render_template('dashboard.html', title='Dashboard', resumes=resumes)

# Resume creation and editing routes
@app.route('/resume/new', methods=['GET', 'POST'])
@login_required
def new_resume():
    form = NewResumeForm()
    if form.validate_on_submit():
        resume = Resume(
            title=form.title.data,
            template_id=form.template_id.data,
            user_id=current_user.id,
            share_token=str(uuid.uuid4()).replace('-', '')
        )
        db.session.add(resume)
        db.session.commit()
        flash('Resume created successfully!', 'success')
        return redirect(url_for('edit_resume', resume_id=resume.id))
    return render_template('new_resume.html', title='New Resume', form=form)

@app.route('/resume/<int:resume_id>/edit')
@login_required
def edit_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        abort(403)
    return render_template('editor.html', title=f'Edit {resume.title}', resume=resume)

# Resume data API routes for AJAX interaction
@app.route('/api/resume/<int:resume_id>', methods=['GET'])
@login_required
def get_resume_data(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify({
        'id': resume.id,
        'title': resume.title,
        'template_id': resume.template_id,
        'content': resume.get_content()
    })

@app.route('/api/resume/<int:resume_id>', methods=['POST'])
@login_required
def update_resume_data(resume_id):
    try:
        resume = Resume.query.get_or_404(resume_id)
        if resume.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        if data is None:
            return jsonify({'success': False, 'error': 'Invalid JSON data'}), 400
            
        if 'title' in data:
            resume.title = data['title']
        if 'template_id' in data:
            resume.template_id = data['template_id']
        if 'content' in data:
            resume.set_content(data['content'])
        
        resume.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Resume updated successfully'})
    except Exception as e:
        import traceback
        print(f"Error updating resume: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

# Resume preview and PDF generation routes
@app.route('/resume/<int:resume_id>/preview')
@login_required
def preview_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        abort(403)
    return render_template('preview.html', title=f'Preview {resume.title}', resume=resume)

# Sharing and public resume routes
@app.route('/resume/<int:resume_id>/share', methods=['GET', 'POST'])
@login_required
def share_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        abort(403)
    
    form = ShareResumeForm()
    if form.validate_on_submit():
        resume.is_public = form.is_public.data
        db.session.commit()
        flash('Sharing settings updated successfully!', 'success')
        return redirect(url_for('share_resume', resume_id=resume.id))
    
    form.is_public.data = resume.is_public
    share_url = url_for('public_resume', token=resume.share_token, _external=True)
    
    return render_template('share.html', title='Share Resume', resume=resume, form=form, share_url=share_url)

@app.route('/r/<token>')
def public_resume(token):
    resume = Resume.query.filter_by(share_token=token).first_or_404()
    if not resume.is_public:
        abort(404)
    return render_template('preview.html', title=resume.title, resume=resume, public=True)

# Delete resume route
@app.route('/resume/<int:resume_id>/delete', methods=['POST'])
@login_required
def delete_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        abort(403)
    
    resume_title = resume.title
    db.session.delete(resume)
    db.session.commit()
    flash(f'Resume "{resume_title}" has been deleted!', 'success')
    return redirect(url_for('dashboard'))

# Download resume as PDF (server-side redirect to preview page)
@app.route('/resume/<int:resume_id>/download')
@login_required
def download_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        abort(403)
    # Redirect to preview page with a query parameter to trigger PDF download via JavaScript
    return redirect(url_for('preview_resume', resume_id=resume_id, download=True))

# Error handling routes
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(403)
def forbidden(e):
    return render_template('403.html'), 403

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500
