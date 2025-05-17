/**
 * Main JavaScript file for the Resume Builder application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Enable tooltips everywhere
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Enable popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Fade out alert messages after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert:not(.alert-persistent)');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
});

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, danger, warning, info)
 * @param {number} duration - How long to show the message in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show notification-alert`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Style the notification
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1050';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
    
    // Add to DOM
    document.body.appendChild(alertDiv);
    
    // Remove after duration
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            alertDiv.remove();
        }, 150);
    }, duration);
}

/**
 * Format a date string
 * @param {string} dateStr - Date string in format YYYY-MM
 * @param {boolean} current - Whether this is a current position
 * @returns {string} Formatted date string
 */
function formatDate(dateStr, current = false) {
    if (!dateStr && !current) return '';
    
    if (current) {
        return 'Present';
    }
    
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'short'
        }).format(date);
    } catch (e) {
        return dateStr;
    }
}

/**
 * Helper function to safely access nested object properties
 * @param {Object} obj - The object to access
 * @param {string} path - The property path (e.g. 'personal.name')
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} The property value or default value
 */
function getNestedValue(obj, path, defaultValue = '') {
    try {
        const value = path.split('.').reduce((o, p) => o[p], obj);
        return value !== undefined ? value : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Create a debounced function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} The debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
