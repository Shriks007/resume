/**
 * Autosave JavaScript
 * Handles automatic saving of resume data during editing
 */

// Global variables for autosave functionality
let saveTimeout = null;
let isSaving = false;
let pendingSave = false;
let lastSavedData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Get resume data reference
    const resumeDataElement = document.getElementById('resumeData');
    if (!resumeDataElement) return;
    
    const resumeId = resumeDataElement.dataset.resumeId;
    
    // Initialize the autosave status indicator
    const autoSaveStatus = document.getElementById('auto-save-status');
    
    /**
     * Trigger autosave with the provided data
     * @param {number} resumeId - The ID of the resume to save
     * @param {Object} data - The resume data to save
     */
    window.triggerAutosave = function(resumeId, data) {
        updateSaveStatus('saving');
        
        // Clear any existing timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        // Compare with previously saved data to avoid unnecessary saves
        const dataString = JSON.stringify(data);
        if (lastSavedData === dataString) {
            updateSaveStatus('saved');
            return;
        }
        
        // Set a timeout before saving to avoid too many requests
        saveTimeout = setTimeout(function() {
            saveResumeData(resumeId, data);
        }, 1000);
    };
    
    /**
     * Save resume data to the server
     * @param {number} resumeId - The ID of the resume to save
     * @param {Object} data - The resume data to save
     */
    function saveResumeData(resumeId, data) {
        // If already saving, mark as pending and return
        if (isSaving) {
            pendingSave = true;
            return;
        }
        
        isSaving = true;
        
        // Save the current data string to compare next time
        lastSavedData = JSON.stringify(data);
        
        fetch(`/api/resume/${resumeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: data
            }),
        })
        .then(response => response.json())
        .then(result => {
            isSaving = false;
            
            if (result.success) {
                updateSaveStatus('saved');
                
                // If there's a pending save, trigger it now
                if (pendingSave) {
                    pendingSave = false;
                    const resumeDataElm = document.getElementById('resumeData');
                    if (resumeDataElm && window.resumeData) {
                        triggerAutosave(resumeId, window.resumeData);
                    }
                }
            } else {
                updateSaveStatus('error');
                console.error('Save error:', result);
            }
        })
        .catch(error => {
            isSaving = false;
            updateSaveStatus('error');
            console.error('Save error:', error);
        });
    }
    
    /**
     * Update the save status indicator
     * @param {string} status - The current save status ('saving', 'saved', or 'error')
     */
    function updateSaveStatus(status) {
        if (!autoSaveStatus) return;
        
        // Remove all status classes
        autoSaveStatus.classList.remove('auto-save-active', 'auto-save-success', 'auto-save-error');
        
        // Update UI based on status
        switch (status) {
            case 'saving':
                autoSaveStatus.innerHTML = '<i class="fas fa-sync-alt fa-spin me-1"></i><span>Saving...</span>';
                autoSaveStatus.classList.add('auto-save-active');
                break;
                
            case 'saved':
                autoSaveStatus.innerHTML = '<i class="fas fa-check me-1"></i><span>Saved</span>';
                autoSaveStatus.classList.add('auto-save-success');
                
                // Revert to normal state after 3 seconds
                setTimeout(function() {
                    if (autoSaveStatus.querySelector('span').textContent === 'Saved') {
                        autoSaveStatus.innerHTML = '<i class="fas fa-save me-1"></i><span>Saved</span>';
                        autoSaveStatus.classList.remove('auto-save-success');
                    }
                }, 3000);
                break;
                
            case 'error':
                autoSaveStatus.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i><span>Save failed</span>';
                autoSaveStatus.classList.add('auto-save-error');
                break;
        }
    }
    
    // Initialize with "Saved" status
    updateSaveStatus('saved');
});
