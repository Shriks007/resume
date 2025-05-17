/**
 * PDF Generator JavaScript
 * Handles the generation of resume PDFs for download
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    
    // Set up the download button
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', generateResumePDF);
    }
    
    /**
     * Generate and download a PDF of the resume
     */
    function generateResumePDF() {
        // Show loading state
        const originalBtnText = downloadPdfBtn.innerHTML;
        downloadPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Generating PDF...';
        downloadPdfBtn.disabled = true;
        
        // Get the resume element
        const resumeElement = document.getElementById('resumePreview');
        
        if (!resumeElement) {
            showNotification('No resume content found', 'danger');
            resetButton();
            return;
        }
        
        // Get resume title for the filename
        let title = 'resume';
        const titleElement = document.querySelector('h1.h3') || document.getElementById('resume-title');
        if (titleElement) {
            title = titleElement.textContent.trim().toLowerCase().replace(/\s+/g, '_');
        }
        
        // Use html2canvas to capture the resume as an image
        html2canvas(resumeElement, {
            scale: 2, // Increase quality
            useCORS: true,
            logging: false,
            backgroundColor: '#FFFFFF'
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // Determine page dimensions and orientation
            let orientation = 'portrait';
            let format = 'a4';
            
            // Create PDF with proper dimensions
            const pdf = new jsPDF(orientation, 'pt', format);
            
            // Get page dimensions (in points)
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate image dimensions to fit in the page
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            
            const imgWidthScaled = imgWidth * ratio;
            const imgHeightScaled = imgHeight * ratio;
            
            // Center image on page
            const x = (pageWidth - imgWidthScaled) / 2;
            const y = 0; // Top aligned
            
            // Add image to PDF
            pdf.addImage(imgData, 'JPEG', x, y, imgWidthScaled, imgHeightScaled);
            
            // Handle multi-page resumes if needed
            if (imgHeightScaled > pageHeight) {
                let remainingHeight = imgHeightScaled;
                let currentPosition = 0;
                
                // First page already added
                remainingHeight -= pageHeight;
                currentPosition += pageHeight;
                
                // Add additional pages as needed
                while (remainingHeight > 0) {
                    // Add new page
                    pdf.addPage();
                    
                    // Add image to new page, shifted upward
                    pdf.addImage(
                        imgData, 'JPEG', 
                        x, // Same x position
                        -currentPosition, // Shift upward to show next portion
                        imgWidthScaled, imgHeightScaled
                    );
                    
                    // Update for next page
                    remainingHeight -= pageHeight;
                    currentPosition += pageHeight;
                }
            }
            
            // Save the PDF
            pdf.save(`${title}.pdf`);
            
            // Reset button state
            resetButton();
            
            // Show success message
            showNotification('Resume downloaded successfully!', 'success');
        }).catch(error => {
            console.error('Error generating PDF:', error);
            showNotification('Failed to generate PDF', 'danger');
            resetButton();
        });
        
        /**
         * Reset button to original state
         */
        function resetButton() {
            downloadPdfBtn.innerHTML = originalBtnText;
            downloadPdfBtn.disabled = false;
        }
    }
    
    /**
     * Alternative PDF generation method using direct DOM rendering
     * This is a fallback in case html2canvas method fails
     */
    function generatePdfAlternative() {
        // Get the resume element
        const resumeElement = document.getElementById('resumePreview');
        
        if (!resumeElement) {
            showNotification('No resume content found', 'danger');
            return;
        }
        
        // Get resume data
        const resumeId = document.getElementById('resumeData').dataset.resumeId;
        const templateId = document.getElementById('resumeData').dataset.templateId;
        
        // Get resume title for the filename
        let title = 'resume';
        const titleElement = document.querySelector('h1.h3') || document.getElementById('resume-title');
        if (titleElement) {
            title = titleElement.textContent.trim().toLowerCase().replace(/\s+/g, '_');
        }
        
        // Show loading notification
        showNotification('Generating PDF...', 'info', 5000);
        
        // Fetch resume data
        fetch(`/api/resume/${resumeId}`)
            .then(response => response.json())
            .then(data => {
                // Create a new jsPDF instance
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('portrait', 'pt', 'a4');
                
                // Clone the resume DOM to avoid modifying the displayed version
                const clonedResume = resumeElement.cloneNode(true);
                document.body.appendChild(clonedResume);
                clonedResume.style.position = 'absolute';
                clonedResume.style.left = '-9999px';
                
                // Apply print styles
                clonedResume.classList.add('for-pdf');
                
                // Generate PDF from the element
                pdf.html(clonedResume, {
                    callback: function(pdf) {
                        // Save PDF
                        pdf.save(`${title}.pdf`);
                        
                        // Remove the cloned element
                        document.body.removeChild(clonedResume);
                        
                        // Show success message
                        showNotification('Resume downloaded successfully!', 'success');
                    },
                    margin: [10, 10, 10, 10],
                    autoPaging: 'text',
                    width: 550,
                    windowWidth: 800
                });
            })
            .catch(error => {
                console.error('Error generating PDF:', error);
                showNotification('Failed to generate PDF', 'danger');
            });
    }
});
