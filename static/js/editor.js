/**
 * Resume Editor JavaScript
 * Handles the interactive resume editing functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get resume data and template ID
    const resumeDataElement = document.getElementById('resumeData');
    if (!resumeDataElement) return;

    const resumeId = resumeDataElement.dataset.resumeId;
    let templateId = resumeDataElement.dataset.templateId;

    // Initialize preview update handler
    function updatePreviewOnChange() {
        // Update preview immediately
        updateResumePreview();
        // Save data
        saveResumeData();
    }

    // Add event listeners to all form inputs
    document.querySelectorAll('.card input, .card textarea, .card select').forEach(input => {
        ['input', 'change', 'blur'].forEach(eventType => {
            input.addEventListener(eventType, updatePreviewOnChange);
        });
    });

    // Initial preview update
    setTimeout(updateResumePreview, 500);

    // Resume data object to hold all content
    let resumeData = {
        personal: {},
        summary: '',
        experience: [],
        education: [],
        skills: '',
        languages: [],
        certifications: '',
        interests: ''
    };

    // DOM elements
    const resumePreview = document.getElementById('resumePreview');
    const personalForm = document.getElementById('personalInfoForm');
    const summaryForm = document.getElementById('summaryForm');
    const skillsForm = document.getElementById('skillsForm');
    const experienceItems = document.getElementById('experienceItems');
    const educationItems = document.getElementById('educationItems');
    const languageItems = document.getElementById('languageItems');

    // Buttons
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    const addEducationBtn = document.getElementById('addEducationBtn');
    const addLanguageBtn = document.getElementById('addLanguageBtn');
    const editTitleBtn = document.getElementById('edit-title-btn');
    const saveTitleBtn = document.getElementById('saveTitleBtn');
    const resumeTitleElement = document.getElementById('resume-title');
    const resumeTitleInput = document.getElementById('resumeTitleInput');
    const changeTemplateBtn = document.getElementById('change-template-btn');
    const confirmTemplateBtn = document.getElementById('confirmTemplateBtn');

    // Templates
    const experienceTemplate = document.getElementById('experienceItemTemplate');
    const educationTemplate = document.getElementById('educationItemTemplate');
    const languageTemplate = document.getElementById('languageItemTemplate');

    // Modal for editing title
    const editTitleModal = new bootstrap.Modal(document.getElementById('editTitleModal'));

    // Load resume data
    fetchResumeData();

    // Add event listeners

    // Personal Information
    if (personalForm) {
        const personalInputs = personalForm.querySelectorAll('input');
        personalInputs.forEach(input => {
            input.addEventListener('input', handlePersonalInfoChange);
        });
    }

    // Summary
    if (summaryForm) {
        const summaryText = document.getElementById('summary');
        if (summaryText) {
            summaryText.addEventListener('input', handleSummaryChange);
        }
    }

    // Skills
    if (skillsForm) {
        const skillsText = document.getElementById('skills');
        if (skillsText) {
            skillsText.addEventListener('input', handleSkillsChange);
        }
    }

    // Additional sections
    const certificationsText = document.getElementById('certifications');
    const interestsText = document.getElementById('interests');

    if (certificationsText) {
        certificationsText.addEventListener('input', function() {
            resumeData.certifications = this.value;
            updateResumePreview();
            saveResumeData();
        });
    }

    if (interestsText) {
        interestsText.addEventListener('input', function() {
            resumeData.interests = this.value;
            updateResumePreview();
            saveResumeData();
        });
    }

    // Add new experience button
    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', addExperienceItem);
    }

    // Add new education button
    if (addEducationBtn) {
        addEducationBtn.addEventListener('click', addEducationItem);
    }

    // Add new language button
    if (addLanguageBtn) {
        addLanguageBtn.addEventListener('click', addLanguageItem);
    }

    // Edit title
    if (editTitleBtn) {
        editTitleBtn.addEventListener('click', function() {
            resumeTitleInput.value = resumeTitleElement.textContent;
            editTitleModal.show();
        });
    }

    // Save edited title
    if (saveTitleBtn) {
        saveTitleBtn.addEventListener('click', function() {
            const newTitle = resumeTitleInput.value.trim();
            if (newTitle) {
                resumeTitleElement.textContent = newTitle;
                editTitleModal.hide();

                // Save to server
                fetch(`/api/resume/${resumeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: newTitle
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification('Resume title updated successfully!', 'success');
                    } else {
                        showNotification('Failed to update resume title', 'danger');
                    }
                })
                .catch(error => {
                    console.error('Error details:', error.message, error.stack);
                    showNotification('An error occurred while updating the title', 'danger');
                });
            }
        });
    }

    // Template selection
    if (document.querySelectorAll('.template-card').length > 0) {
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }

    // Confirm template change
    if (confirmTemplateBtn) {
        confirmTemplateBtn.addEventListener('click', function() {
            const selectedTemplate = document.querySelector('.template-card.selected');
            if (!selectedTemplate) return;

            // Update preview immediately when template changes
            templateId = selectedTemplate.dataset.template;
            updateResumePreview();

            const newTemplateId = selectedTemplate.dataset.template;

            // Update the template
            fetch(`/api/resume/${resumeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    template_id: newTemplateId
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the template ID in the page
                    resumeDataElement.dataset.templateId = newTemplateId;
                    templateId = newTemplateId; // Update the template ID variable used in updateResumePreview
                    document.getElementById('template-name').textContent = `Template: ${capitalizeFirstLetter(newTemplateId)}`;

                    // Update the preview
                    updateResumePreview();
                    showNotification('Template updated successfully!', 'success');
                } else {
                    showNotification('Failed to update template', 'danger');
                }
            })
            .catch(error => {
                console.error('Error details:', error.message, error.stack);
                showNotification(`Error updating template: ${error.message}`, 'danger');
            });
        });
    }

    /**
     * Fetch resume data from the server
     */
    function fetchResumeData() {
        fetch(`/api/resume/${resumeId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load resume data: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Parse the content JSON
                const content = data.content || {};
                resumeData = {
                    personal: content.personal || {},
                    summary: content.summary || '',
                    experience: content.experience || [],
                    education: content.education || [],
                    skills: content.skills || '',
                    languages: content.languages || [],
                    certifications: content.certifications || '',
                    interests: content.interests || ''
                };

                // Populate form fields
                populateFormFields();

                // Update preview
                updateResumePreview();
            })
            .catch(error => {
                console.error('Error details:', error.message, error.stack);
                showNotification('Failed to load resume data: ' + error.message, 'danger');
            });
    }

    /**
     * Populate form fields with resume data
     */
    function populateFormFields() {
        // Personal info
        if (personalForm) {
            personalForm.fullName.value = resumeData.personal.fullName || '';
            personalForm.jobTitle.value = resumeData.personal.jobTitle || '';
            personalForm.email.value = resumeData.personal.email || '';
            personalForm.phone.value = resumeData.personal.phone || '';
            personalForm.address.value = resumeData.personal.address || '';
            personalForm.website.value = resumeData.personal.website || '';
        }

        // Summary
        if (summaryForm) {
            summaryForm.summary.value = resumeData.summary || '';
        }

        // Skills
        if (skillsForm) {
            skillsForm.skills.value = resumeData.skills || '';
        }

        // Additional sections
        if (certificationsText) {
            certificationsText.value = resumeData.certifications || '';
        }

        if (interestsText) {
            interestsText.value = resumeData.interests || '';
        }

        // Experience
        if (experienceItems) {
            experienceItems.innerHTML = '';
            if (resumeData.experience && resumeData.experience.length > 0) {
                resumeData.experience.forEach(exp => addExperienceItem(exp));
            }
        }

        // Education
        if (educationItems) {
            educationItems.innerHTML = '';
            if (resumeData.education && resumeData.education.length > 0) {
                resumeData.education.forEach(edu => addEducationItem(edu));
            }
        }

        // Languages
        if (languageItems) {
            languageItems.innerHTML = '';
            if (resumeData.languages && resumeData.languages.length > 0) {
                resumeData.languages.forEach(lang => addLanguageItem(lang));
            }
        }
    }

    /**
     * Update the resume preview with current data
     */
    function updateResumePreview() {
        if (resumePreview) {
            try {
                const previewHTML = generateResumeHTML(templateId, resumeData);
                if (previewHTML) {
                    resumePreview.innerHTML = previewHTML;
                } else {
                    resumePreview.innerHTML = '<div class="alert alert-warning">No preview data available</div>';
                }
            } catch (error) {
                console.error('Preview generation error:', error);
                resumePreview.innerHTML = '<div class="alert alert-danger">Error generating preview</div>';
            }
        }
    }

    /**
     * Save resume data to the server
     */
    function saveResumeData() {
        // Trigger autosave functionality which is defined in autosave.js
        if (typeof triggerAutosave === 'function') {
            triggerAutosave(resumeId, resumeData);
        }
    }

    /**
     * Handle personal information changes
     */
    function handlePersonalInfoChange() {
        resumeData.personal = {
            fullName: personalForm.fullName.value,
            jobTitle: personalForm.jobTitle.value,
            email: personalForm.email.value,
            phone: personalForm.phone.value,
            address: personalForm.address.value,
            website: personalForm.website.value
        };

        updateResumePreview();
        saveResumeData();
    }

    /**
     * Handle summary changes
     */
    function handleSummaryChange() {
        resumeData.summary = document.getElementById('summary').value;
        updateResumePreview();
        saveResumeData();
    }

    /**
     * Handle skills changes
     */
    function handleSkillsChange() {
        resumeData.skills = document.getElementById('skills').value;
        updateResumePreview();
        saveResumeData();
    }

    /**
     * Add a new experience item
     * @param {Object} data - Optional data to populate the item with
     */
    function addExperienceItem(data = null) {
        if (!experienceTemplate || !experienceItems) return;

        const clone = document.importNode(experienceTemplate.content, true);
        const expItem = clone.querySelector('.experience-item');

        // Populate fields if data provided
        if (data && typeof data === 'object') {
            clone.querySelector('.exp-job-title').value = data.jobTitle || '';
            clone.querySelector('.exp-company').value = data.company || '';
            clone.querySelector('.exp-start-date').value = data.startDate || '';
            clone.querySelector('.exp-end-date').value = data.endDate || '';
            clone.querySelector('.exp-current').checked = data.current || false;
            clone.querySelector('.exp-description').value = data.description || '';

            // Disable end date if current position
            if (data.current) {
                clone.querySelector('.exp-end-date').disabled = true;
            }
        }

        // Add event listeners to the new experience item

        // Remove button
        clone.querySelector('.remove-item').addEventListener('click', function() {
            expItem.remove();
            updateExperienceData();
        });

        // Input fields
        clone.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateExperienceData);
        });

        // Current position checkbox
        clone.querySelector('.exp-current').addEventListener('change', function() {
            const endDateInput = this.closest('.experience-item').querySelector('.exp-end-date');
            endDateInput.disabled = this.checked;
            if (this.checked) {
                endDateInput.value = '';
            }
            updateExperienceData();
        });

        // Add to DOM
        experienceItems.appendChild(clone);

        // Update data
        updateExperienceData();
    }

    /**
     * Add a new education item
     * @param {Object} data - Optional data to populate the item with
     */
    function addEducationItem(data = null) {
        if (!educationTemplate || !educationItems) return;

        const clone = document.importNode(educationTemplate.content, true);
        const eduItem = clone.querySelector('.education-item');

        // Populate fields if data provided
        if (data && typeof data === 'object') {
            clone.querySelector('.edu-degree').value = data.degree || '';
            clone.querySelector('.edu-institution').value = data.institution || '';
            clone.querySelector('.edu-start-year').value = data.startYear || '';
            clone.querySelector('.edu-end-year').value = data.endYear || '';
            clone.querySelector('.edu-current').checked = data.current || false;
            clone.querySelector('.edu-description').value = data.description || '';

            // Disable end year if currently studying
            if (data.current) {
                clone.querySelector('.edu-end-year').disabled = true;
            }
        }

        // Add event listeners to the new education item

        // Remove button
        clone.querySelector('.remove-item').addEventListener('click', function() {
            eduItem.remove();
            updateEducationData();
        });

        // Input fields
        clone.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateEducationData);
        });

        // Current studying checkbox
        clone.querySelector('.edu-current').addEventListener('change', function() {
            const endYearInput = this.closest('.education-item').querySelector('.edu-end-year');
            endYearInput.disabled = this.checked;
            if (this.checked) {
                endYearInput.value = '';
            }
            updateEducationData();
        });

        // Add to DOM
        educationItems.appendChild(clone);

        // Update data
        updateEducationData();
    }

    /**
     * Add a new language item
     * @param {Object} data - Optional data to populate the item with
     */
    function addLanguageItem(data = null) {
        if (!languageTemplate || !languageItems) return;

        const clone = document.importNode(languageTemplate.content, true);
        const langItem = clone.querySelector('.language-item');

        // Populate fields if data provided
        if (data && typeof data === 'object') {
            clone.querySelector('.lang-name').value = data.name || '';
            clone.querySelector('.lang-level').value = data.level || 'Intermediate';
        }

        // Add event listeners to the new language item

        // Remove button
        clone.querySelector('.remove-lang').addEventListener('click', function() {
            langItem.remove();
            updateLanguageData();
        });

        // Input fields
        clone.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', updateLanguageData);
        });

        // Add to DOM
        languageItems.appendChild(clone);

        // Update data
        updateLanguageData();
    }

    /**
     * Update experience data from form fields
     */
    function updateExperienceData() {
        const expItems = document.querySelectorAll('.experience-item');
        resumeData.experience = [];

        expItems.forEach(item => {
            resumeData.experience.push({
                jobTitle: item.querySelector('.exp-job-title').value,
                company: item.querySelector('.exp-company').value,
                startDate: item.querySelector('.exp-start-date').value,
                endDate: item.querySelector('.exp-end-date').value,
                current: item.querySelector('.exp-current').checked,
                description: item.querySelector('.exp-description').value
            });
        });

        updateResumePreview();
        saveResumeData();
    }

    /**
     * Update education data from form fields
     */
    function updateEducationData() {
        const eduItems = document.querySelectorAll('.education-item');
        resumeData.education = [];

        eduItems.forEach(item => {
            const degree = item.querySelector('.edu-degree');
            const institution = item.querySelector('.edu-institution');
            const startYear = item.querySelector('.edu-start-year');
            const endYear = item.querySelector('.edu-end-year');
            const current = item.querySelector('.edu-current');
            const description = item.querySelector('.edu-description');

            if (degree && institution && startYear && endYear && current && description) {
                resumeData.education.push({
                    degree: degree.value,
                    institution: institution.value,
                    startYear: startYear.value,
                    endYear: endYear.value,
                    current: current.checked,
                    description: description.value
                });
            }
        });

        updateResumePreview();
        saveResumeData();
    }

    /**
     * Update language data from form fields
     */
    function updateLanguageData() {
        const langItems = document.querySelectorAll('.language-item');
        resumeData.languages = [];

        langItems.forEach(item => {
            resumeData.languages.push({
                name: item.querySelector('.lang-name').value,
                level: item.querySelector('.lang-level').value
            });
        });

        updateResumePreview();
        saveResumeData();
    }

    /**
     * Capitalize the first letter of a string
     * @param {string} string - The string to capitalize
     * @returns {string} The capitalized string
     */
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});