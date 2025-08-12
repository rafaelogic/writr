/**
 * Content Capture Utilities for Writr Editor
 * 
 * Ensures all editor content is properly captured in hidden inputs
 * without interfering with form submission handling
 * @version 1.0.0
 */

/**
 * ContentCaptureHandler class
 * Manages content capture for editors without handling form submissions
 */
class ContentCaptureHandler {
    constructor() {
        this.editors = new Map();
        this.setupAutoSave();
    }

    /**
     * Register an editor instance for content capture
     * @param {string} editorId - The editor ID
     * @param {WritrEditor} editor - The editor instance
     * @param {string} inputId - The hidden input ID
     */
    registerEditor(editorId, editor, inputId) {
        this.editors.set(editorId, {
            editor,
            inputId,
            lastSaved: null,
            hasUnsavedChanges: false
        });

        // Set up editor-specific listeners
        this.setupEditorListeners(editorId, editor);
    }

    /**
     * Setup editor-specific event listeners
     * @param {string} editorId - The editor ID
     * @param {WritrEditor} editor - The editor instance
     */
    setupEditorListeners(editorId, editor) {
        const editorData = this.editors.get(editorId);
        if (!editorData) return;

        // Listen for content changes
        editor.on('change', async (data) => {
            editorData.hasUnsavedChanges = true;
            await this.updateHiddenInput(editorId, data);
        });

        // Listen for manual saves
        editor.on('save', async (data) => {
            editorData.lastSaved = Date.now();
            editorData.hasUnsavedChanges = false;
            await this.updateHiddenInput(editorId, data);
        });

        // Listen for focus/blur events to ensure content is captured
        editor.on('blur', async () => {
            await this.captureEditorContent(editorId);
        });
    }

    /**
     * Setup auto-save functionality (non-intrusive)
     */
    setupAutoSave() {
        // Periodically capture editor content to hidden inputs
        setInterval(() => {
            this.captureAllEditorContent();
        }, 10000); // Capture every 10 seconds
    }

    /**
     * Capture content for a specific editor
     * @param {string} editorId - The editor ID
     */
    async captureEditorContent(editorId) {
        const editorData = this.editors.get(editorId);
        if (!editorData) return;

        try {
            const content = await editorData.editor.save();
            await this.updateHiddenInput(editorId, content);
            
            editorData.lastSaved = Date.now();
            editorData.hasUnsavedChanges = false;
            
        } catch (error) {
            console.error(`Error capturing content for editor ${editorId}:`, error);
            // Don't throw - we don't want to interrupt user workflow
        }
    }

    /**
     * Update the hidden input field with editor content
     * @param {string} editorId - The editor ID
     * @param {Object} content - The editor content
     */
    async updateHiddenInput(editorId, content) {
        const editorData = this.editors.get(editorId);
        if (!editorData) return;

        const hiddenInput = document.getElementById(editorData.inputId);
        if (!hiddenInput) {
            console.warn(`Hidden input not found for editor ${editorId}`);
            return;
        }

        try {
            // Ensure content is valid JSON
            const jsonContent = typeof content === 'string' ? content : JSON.stringify(content);
            
            // Validate that it's proper JSON
            JSON.parse(jsonContent);
            
            // Update the hidden input
            hiddenInput.value = jsonContent;
            
            // Trigger change event for any listeners
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
            
        } catch (error) {
            console.error(`Error updating hidden input for editor ${editorId}:`, error);
        }
    }

    /**
     * Capture content for all editors
     */
    async captureAllEditorContent() {
        for (const [editorId, editorData] of this.editors) {
            if (editorData.hasUnsavedChanges) {
                await this.captureEditorContent(editorId);
            }
        }
    }

    /**
     * Force capture content for all editors (useful before AJAX submissions)
     */
    async forceCapturAllEditors() {
        const capturePromises = Array.from(this.editors.keys()).map(editorId => 
            this.captureEditorContent(editorId)
        );
        
        await Promise.all(capturePromises);
    }

    /**
     * Get editor content without affecting hidden input
     * @param {string} editorId - The editor ID
     * @returns {Object|null} Editor content or null if not found
     */
    async getEditorContent(editorId) {
        const editorData = this.editors.get(editorId);
        if (!editorData) return null;

        try {
            return await editorData.editor.save();
        } catch (error) {
            console.error(`Error getting content for editor ${editorId}:`, error);
            return null;
        }
    }

    /**
     * Get all editor contents
     * @returns {Object} Object with editor IDs as keys and content as values
     */
    async getAllEditorContents() {
        const contents = {};
        
        for (const [editorId] of this.editors) {
            contents[editorId] = await this.getEditorContent(editorId);
        }
        
        return contents;
    }

    /**
     * Check if any editor has unsaved changes
     * @returns {boolean} True if there are unsaved changes
     */
    hasUnsavedChanges() {
        for (const [, editorData] of this.editors) {
            if (editorData.hasUnsavedChanges) {
                return true;
            }
        }
        return false;
    }

    /**
     * Remove an editor from tracking
     * @param {string} editorId - The editor ID
     */
    unregisterEditor(editorId) {
        this.editors.delete(editorId);
    }

    /**
     * Clear all registered editors
     */
    clearAllEditors() {
        this.editors.clear();
    }

    /**
     * Get list of registered editor IDs
     * @returns {Array} Array of editor IDs
     */
    getRegisteredEditorIds() {
        return Array.from(this.editors.keys());
    }

    /**
     * Check if an editor is registered
     * @param {string} editorId - The editor ID
     * @returns {boolean} True if editor is registered
     */
    isEditorRegistered(editorId) {
        return this.editors.has(editorId);
    }
}

// Create global instance
const contentCaptureHandler = new ContentCaptureHandler();

// Export for module usage
export default ContentCaptureHandler;
export { ContentCaptureHandler, contentCaptureHandler };

// Make available globally
if (typeof window !== 'undefined') {
    window.WritrContentCaptureHandler = ContentCaptureHandler;
    window.writrContentCaptureHandler = contentCaptureHandler;
}
