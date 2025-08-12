/**
 * Writr Helper Utilities
 * 
 * Utility functions to help developers integrate Writr editors with their forms
 * @version 1.0.0
 */

/**
 * Capture all Writr editor content in the current page
 * Useful before AJAX form submissions
 * 
 * @returns {Promise<boolean>} True if all content was captured successfully
 */
export async function captureAllWritrContent() {
    if (typeof window === 'undefined' || !window.writrContentCaptureHandler) {
        console.warn('Writr content capture handler not available');
        return false;
    }

    try {
        await window.writrContentCaptureHandler.forceCapturAllEditors();
        return true;
    } catch (error) {
        console.error('Error capturing Writr editor content:', error);
        return false;
    }
}

/**
 * Capture content for a specific Writr editor
 * 
 * @param {string} editorId - The ID of the editor
 * @returns {Promise<boolean>} True if content was captured successfully
 */
export async function captureWritrContent(editorId) {
    if (typeof window === 'undefined' || !window.writrContentCaptureHandler) {
        console.warn('Writr content capture handler not available');
        return false;
    }

    if (!window.writrContentCaptureHandler.isEditorRegistered(editorId)) {
        console.warn(`Editor ${editorId} is not registered with content capture handler`);
        return false;
    }

    try {
        await window.writrContentCaptureHandler.captureEditorContent(editorId);
        return true;
    } catch (error) {
        console.error(`Error capturing content for editor ${editorId}:`, error);
        return false;
    }
}

/**
 * Get content from all Writr editors
 * 
 * @returns {Promise<Object>} Object with editor IDs as keys and content as values
 */
export async function getAllWritrContent() {
    if (typeof window === 'undefined' || !window.writrContentCaptureHandler) {
        console.warn('Writr content capture handler not available');
        return {};
    }

    try {
        return await window.writrContentCaptureHandler.getAllEditorContents();
    } catch (error) {
        console.error('Error getting all Writr editor content:', error);
        return {};
    }
}

/**
 * Get content from a specific Writr editor
 * 
 * @param {string} editorId - The ID of the editor
 * @returns {Promise<Object|null>} Editor content or null if not found
 */
export async function getWritrContent(editorId) {
    if (typeof window === 'undefined' || !window.writrContentCaptureHandler) {
        console.warn('Writr content capture handler not available');
        return null;
    }

    try {
        return await window.writrContentCaptureHandler.getEditorContent(editorId);
    } catch (error) {
        console.error(`Error getting content for editor ${editorId}:`, error);
        return null;
    }
}

/**
 * Check if any Writr editor has unsaved changes
 * 
 * @returns {boolean} True if there are unsaved changes
 */
export function hasUnsavedWritrChanges() {
    if (typeof window === 'undefined' || !window.writrContentCaptureHandler) {
        return false;
    }

    return window.writrContentCaptureHandler.hasUnsavedChanges();
}

/**
 * Get list of all registered Writr editor IDs
 * 
 * @returns {Array} Array of editor IDs
 */
export function getRegisteredWritrEditors() {
    if (typeof window === 'undefined' || !window.writrContentCaptureHandler) {
        return [];
    }

    return window.writrContentCaptureHandler.getRegisteredEditorIds();
}

/**
 * Capture Writr content for editors within a specific form
 * 
 * @param {HTMLFormElement|string} form - Form element or selector
 * @returns {Promise<boolean>} True if all content was captured successfully
 */
export async function captureWritrContentInForm(form) {
    if (typeof window === 'undefined' || !window.writrContentCaptureHandler) {
        console.warn('Writr content capture handler not available');
        return false;
    }

    // Get form element
    const formElement = typeof form === 'string' ? document.querySelector(form) : form;
    if (!formElement) {
        console.warn('Form element not found');
        return false;
    }

    try {
        const registeredEditors = window.writrContentCaptureHandler.getRegisteredEditorIds();
        const editorsInForm = [];

        // Find editors within this form
        for (const editorId of registeredEditors) {
            const hiddenInput = document.getElementById(`${editorId}-input`);
            if (hiddenInput && formElement.contains(hiddenInput)) {
                editorsInForm.push(editorId);
            }
        }

        // Capture content for all editors in this form
        const capturePromises = editorsInForm.map(editorId => 
            window.writrContentCaptureHandler.captureEditorContent(editorId)
        );

        await Promise.all(capturePromises);
        return true;

    } catch (error) {
        console.error('Error capturing Writr content in form:', error);
        return false;
    }
}

/**
 * Enhanced AJAX form submission helper that captures Writr content
 * 
 * @param {HTMLFormElement|string} form - Form element or selector
 * @param {Object} options - AJAX options (url, method, headers, etc.)
 * @returns {Promise<Response>} Fetch response
 */
export async function submitFormWithWritr(form, options = {}) {
    // Get form element
    const formElement = typeof form === 'string' ? document.querySelector(form) : form;
    if (!formElement) {
        throw new Error('Form element not found');
    }

    // Capture Writr content first
    await captureWritrContentInForm(formElement);

    // Get form data
    const formData = new FormData(formElement);

    // Prepare fetch options
    const fetchOptions = {
        method: options.method || formElement.method || 'POST',
        body: formData,
        headers: options.headers || {},
        ...options
    };

    // Get URL
    const url = options.url || formElement.action || window.location.href;

    // Submit with fetch
    return fetch(url, fetchOptions);
}

// Make helpers available globally
if (typeof window !== 'undefined') {
    window.WritrHelpers = {
        captureAllWritrContent,
        captureWritrContent,
        getAllWritrContent,
        getWritrContent,
        hasUnsavedWritrChanges,
        getRegisteredWritrEditors,
        captureWritrContentInForm,
        submitFormWithWritr
    };
}
