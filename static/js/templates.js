/**
 * Templates JavaScript
 * Defines the HTML generation for each resume template
 */

/**
 * Generate resume HTML based on template and data
 * @param {string} templateId - The template ID (template1, template2, template3)
 * @param {Object} data - The resume data object
 * @returns {string} HTML for the resume
 */
function generateResumeHTML(templateId, data) {
    // Default to template1 if invalid template ID
    if (!['template1', 'template2', 'template3'].includes(templateId)) {
        templateId = 'template1';
    }
    
    // Call the appropriate template generator
    switch (templateId) {
        case 'template1':
            return generateProfessionalTemplate(data);
        case 'template2':
            return generateCreativeTemplate(data);
        case 'template3':
            return generateSimpleTemplate(data);
        default:
            return generateProfessionalTemplate(data);
    }
}

/**
 * Generate HTML for the Professional template (template1)
 * @param {Object} data - The resume data
 * @returns {string} The HTML for the resume
 */
function generateProfessionalTemplate(data) {
    const personal = data.personal || {};
    
    // Format skills as an array
    const skillsArray = formatSkillsToArray(data.skills);
    
    // Generate HTML for experience items
    const experienceHTML = generateExperienceHTML(data.experience);
    
    // Generate HTML for education items
    const educationHTML = generateEducationHTML(data.education);
    
    // Generate HTML for language items
    const languagesHTML = generateLanguagesHTML(data.languages);
    
    return `
        <div class="template1">
            <header class="header">
                <h1>${escapeHTML(personal.fullName || 'Your Name')}</h1>
                <p>${escapeHTML(personal.jobTitle || 'Professional Title')}</p>
            </header>
            
            <div class="contact-info">
                ${personal.email ? `<span><i class="fas fa-envelope"></i> ${escapeHTML(personal.email)}</span>` : ''}
                ${personal.phone ? `<span><i class="fas fa-phone"></i> ${escapeHTML(personal.phone)}</span>` : ''}
                ${personal.address ? `<span><i class="fas fa-map-marker-alt"></i> ${escapeHTML(personal.address)}</span>` : ''}
                ${personal.website ? `<span><i class="fas fa-globe"></i> ${escapeHTML(personal.website)}</span>` : ''}
            </div>
            
            ${data.summary ? `
                <section class="summary">
                    <h2 class="section-title">Professional Summary</h2>
                    <p>${escapeHTML(data.summary)}</p>
                </section>
            ` : ''}
            
            ${data.experience && data.experience.length > 0 ? `
                <section class="experience">
                    <h2 class="section-title">Work Experience</h2>
                    ${experienceHTML}
                </section>
            ` : ''}
            
            ${data.education && data.education.length > 0 ? `
                <section class="education">
                    <h2 class="section-title">Education</h2>
                    ${educationHTML}
                </section>
            ` : ''}
            
            ${skillsArray.length > 0 ? `
                <section class="skills">
                    <h2 class="section-title">Skills</h2>
                    <ul class="skills-list">
                        ${skillsArray.map(skill => `<li>${escapeHTML(skill)}</li>`).join('')}
                    </ul>
                </section>
            ` : ''}
            
            ${data.languages && data.languages.length > 0 ? `
                <section class="languages">
                    <h2 class="section-title">Languages</h2>
                    ${languagesHTML}
                </section>
            ` : ''}
            
            ${data.certifications ? `
                <section class="certifications">
                    <h2 class="section-title">Certifications</h2>
                    <p>${escapeHTML(data.certifications)}</p>
                </section>
            ` : ''}
            
            ${data.interests ? `
                <section class="interests">
                    <h2 class="section-title">Interests</h2>
                    <p>${escapeHTML(data.interests)}</p>
                </section>
            ` : ''}
        </div>
    `;
}

/**
 * Generate HTML for the Creative template (template2)
 * @param {Object} data - The resume data
 * @returns {string} The HTML for the resume
 */
function generateCreativeTemplate(data) {
    const personal = data.personal || {};
    
    // Format skills as an array
    const skillsArray = formatSkillsToArray(data.skills);
    
    // Generate HTML for experience items
    const experienceHTML = generateExperienceHTML(data.experience);
    
    // Generate HTML for education items
    const educationHTML = generateEducationHTML(data.education);
    
    // Generate HTML for language items
    const languagesHTML = generateLanguagesHTML(data.languages);
    
    // Get initials for profile image placeholder
    const initials = getInitials(personal.fullName);
    
    return `
        <div class="template2">
            <div class="sidebar">
                <div class="profile-image">${initials}</div>
                
                <div class="sidebar-section">
                    <h3 class="sidebar-title">Contact</h3>
                    <div class="contact-info">
                        ${personal.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${escapeHTML(personal.email)}</div>` : ''}
                        ${personal.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${escapeHTML(personal.phone)}</div>` : ''}
                        ${personal.address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${escapeHTML(personal.address)}</div>` : ''}
                        ${personal.website ? `<div class="contact-item"><i class="fas fa-globe"></i> ${escapeHTML(personal.website)}</div>` : ''}
                    </div>
                </div>
                
                ${skillsArray.length > 0 ? `
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Skills</h3>
                        <ul class="skills-list">
                            ${skillsArray.map(skill => `<li>${escapeHTML(skill)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${data.languages && data.languages.length > 0 ? `
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Languages</h3>
                        ${data.languages.map(lang => `
                            <div class="language-item">
                                <span>${escapeHTML(lang.name || '')}</span>
                                <span class="language-level">${escapeHTML(lang.level || '')}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${data.interests ? `
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Interests</h3>
                        <p>${escapeHTML(data.interests)}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="main-content">
                <div class="main-header">
                    <h1 class="name">${escapeHTML(personal.fullName || 'Your Name')}</h1>
                    <p class="job-title">${escapeHTML(personal.jobTitle || 'Professional Title')}</p>
                </div>
                
                ${data.summary ? `
                    <div class="main-section">
                        <h2 class="main-section-title">Professional Summary</h2>
                        <p>${escapeHTML(data.summary)}</p>
                    </div>
                ` : ''}
                
                ${data.experience && data.experience.length > 0 ? `
                    <div class="main-section">
                        <h2 class="main-section-title">Work Experience</h2>
                        ${experienceHTML}
                    </div>
                ` : ''}
                
                ${data.education && data.education.length > 0 ? `
                    <div class="main-section">
                        <h2 class="main-section-title">Education</h2>
                        ${educationHTML}
                    </div>
                ` : ''}
                
                ${data.certifications ? `
                    <div class="main-section">
                        <h2 class="main-section-title">Certifications</h2>
                        <p>${escapeHTML(data.certifications)}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Generate HTML for the Simple template (template3)
 * @param {Object} data - The resume data
 * @returns {string} The HTML for the resume
 */
function generateSimpleTemplate(data) {
    const personal = data.personal || {};
    
    // Format skills as an array
    const skillsArray = formatSkillsToArray(data.skills);
    
    // Generate HTML for experience items
    const experienceHTML = generateExperienceHTMLSimple(data.experience);
    
    // Generate HTML for education items
    const educationHTML = generateEducationHTMLSimple(data.education);
    
    // Get initials for profile image placeholder
    const initials = getInitials(personal.fullName);
    
    return `
        <div class="template3">
            <div class="header">
                <div class="profile-image">${initials}</div>
                <div class="profile-name">
                    <h1>${escapeHTML(personal.fullName || 'Your Name')}</h1>
                    <p>${escapeHTML(personal.jobTitle || 'Professional Title')}</p>
                </div>
            </div>
            
            <div class="contact-info">
                <div class="contact-row">
                    ${personal.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${escapeHTML(personal.email)}</div>` : ''}
                    ${personal.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${escapeHTML(personal.phone)}</div>` : ''}
                    ${personal.address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${escapeHTML(personal.address)}</div>` : ''}
                    ${personal.website ? `<div class="contact-item"><i class="fas fa-globe"></i> ${escapeHTML(personal.website)}</div>` : ''}
                </div>
            </div>
            
            ${data.summary ? `
                <div class="section">
                    <h2 class="section-title">Profile</h2>
                    <p>${escapeHTML(data.summary)}</p>
                </div>
                <hr>
            ` : ''}
            
            ${data.experience && data.experience.length > 0 ? `
                <div class="section">
                    <h2 class="section-title">Work Experience</h2>
                    ${experienceHTML}
                </div>
                <hr>
            ` : ''}
            
            ${data.education && data.education.length > 0 ? `
                <div class="section">
                    <h2 class="section-title">Education</h2>
                    ${educationHTML}
                </div>
                <hr>
            ` : ''}
            
            ${skillsArray.length > 0 ? `
                <div class="section">
                    <h2 class="section-title">Skills</h2>
                    <div class="skills-container">
                        ${skillsArray.map(skill => `<div class="skill-category">${escapeHTML(skill)}</div>`).join('')}
                    </div>
                </div>
                <hr>
            ` : ''}
            
            <div class="section">
                ${data.languages && data.languages.length > 0 ? `
                    <div class="additional-info">
                        <h2 class="section-title">Languages</h2>
                        <p>
                            ${data.languages.map(lang => `${escapeHTML(lang.name || '')} (${escapeHTML(lang.level || '')})`).join(', ')}
                        </p>
                    </div>
                ` : ''}
                
                ${data.certifications ? `
                    <div class="additional-info">
                        <h2 class="section-title">Certifications</h2>
                        <p>${escapeHTML(data.certifications)}</p>
                    </div>
                ` : ''}
                
                ${data.interests ? `
                    <div class="additional-info">
                        <h2 class="section-title">Interests</h2>
                        <p>${escapeHTML(data.interests)}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Generate HTML for experience items
 * @param {Array} experiences - Array of experience objects
 * @returns {string} HTML for experience section
 */
function generateExperienceHTML(experiences) {
    if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
        return '';
    }
    
    return experiences.map(exp => {
        // Format dates
        const startDate = formatDate(exp.startDate);
        const endDate = exp.current ? 'Present' : formatDate(exp.endDate);
        const dateRange = startDate && (endDate || exp.current) ? `${startDate} - ${endDate}` : '';
        
        return `
            <div class="experience-item">
                <div class="experience-title">${escapeHTML(exp.jobTitle || '')}</div>
                <div class="experience-company">${escapeHTML(exp.company || '')}</div>
                ${dateRange ? `<div class="experience-date">${dateRange}</div>` : ''}
                ${exp.description ? `<div class="experience-description">${escapeHTML(exp.description)}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Generate HTML for experience items in simple format
 * @param {Array} experiences - Array of experience objects
 * @returns {string} HTML for experience section
 */
function generateExperienceHTMLSimple(experiences) {
    if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
        return '';
    }
    
    return experiences.map(exp => {
        // Format dates
        const startDate = formatDate(exp.startDate);
        const endDate = exp.current ? 'Present' : formatDate(exp.endDate);
        const dateRange = startDate && (endDate || exp.current) ? `${startDate} - ${endDate}` : '';
        
        return `
            <div class="experience-item">
                <div class="item-header">
                    <div class="item-title">${escapeHTML(exp.jobTitle || '')}</div>
                    ${dateRange ? `<div class="item-date">${dateRange}</div>` : ''}
                </div>
                <div class="item-subtitle">${escapeHTML(exp.company || '')}</div>
                ${exp.description ? `<div class="item-description">${escapeHTML(exp.description)}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Generate HTML for education items
 * @param {Array} educations - Array of education objects
 * @returns {string} HTML for education section
 */
function generateEducationHTML(educations) {
    if (!educations || !Array.isArray(educations) || educations.length === 0) {
        return '';
    }
    
    return educations.map(edu => {
        // Format years
        const startYear = edu.startYear || '';
        const endYear = edu.current ? 'Present' : (edu.endYear || '');
        const yearRange = startYear && (endYear || edu.current) ? `${startYear} - ${endYear}` : '';
        
        return `
            <div class="education-item">
                <div class="education-title">${escapeHTML(edu.degree || '')}</div>
                <div class="education-institution">${escapeHTML(edu.institution || '')}</div>
                ${yearRange ? `<div class="education-date">${yearRange}</div>` : ''}
                ${edu.description ? `<div class="education-description">${escapeHTML(edu.description)}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Generate HTML for education items in simple format
 * @param {Array} educations - Array of education objects
 * @returns {string} HTML for education section
 */
function generateEducationHTMLSimple(educations) {
    if (!educations || !Array.isArray(educations) || educations.length === 0) {
        return '';
    }
    
    return educations.map(edu => {
        // Format years
        const startYear = edu.startYear || '';
        const endYear = edu.current ? 'Present' : (edu.endYear || '');
        const yearRange = startYear && (endYear || edu.current) ? `${startYear} - ${endYear}` : '';
        
        return `
            <div class="education-item">
                <div class="item-header">
                    <div class="item-title">${escapeHTML(edu.degree || '')}</div>
                    ${yearRange ? `<div class="item-date">${yearRange}</div>` : ''}
                </div>
                <div class="item-subtitle">${escapeHTML(edu.institution || '')}</div>
                ${edu.description ? `<div class="item-description">${escapeHTML(edu.description)}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Generate HTML for language items
 * @param {Array} languages - Array of language objects
 * @returns {string} HTML for languages section
 */
function generateLanguagesHTML(languages) {
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
        return '';
    }
    
    return languages.map(lang => {
        return `
            <div class="language-item">
                <span class="language-name">${escapeHTML(lang.name || '')}</span>
                <span class="language-level">${escapeHTML(lang.level || '')}</span>
            </div>
        `;
    }).join('');
}

/**
 * Format a date string to a more readable format
 * @param {string} dateStr - Date string in format YYYY-MM
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'short' 
        }).format(date);
    } catch (e) {
        return dateStr;
    }
}

/**
 * Format skills string to an array
 * @param {string} skillsStr - Skills as a comma-separated string
 * @returns {Array} Array of skills
 */
function formatSkillsToArray(skillsStr) {
    if (!skillsStr) return [];
    
    return skillsStr.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitials(name) {
    if (!name) return '';
    
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
    if (!str) return '';
    
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
