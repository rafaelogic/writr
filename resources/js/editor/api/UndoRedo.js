/**
 * UndoRedo - Implementation of EditorJS Undo/Redo functionality
 * 
 * Provides undo/redo capabilities with keyboard shortcuts:
 * - Ctrl+Z / Cmd+Z for undo
 * - Ctrl+Y / Cmd+Shift+Z for redo
 * - State management and change tracking
 * 
 * @see https://editorjs.io/
 */

export class UndoRedo {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.isEnabled = true;
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
        this.isUndoRedo = false;
        this.debounceTimeout = null;
        this.debounceDelay = 300; // ms
        
        // Bind methods
        this.init = this.init.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.saveState = this.saveState.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Initialize undo/redo functionality
     * @param {object} config - Undo/redo configuration
     * @returns {UndoRedo} This instance for chaining
     */
    init(config = {}) {
        this.config = {
            enabled: config.enabled !== false,
            maxHistorySize: config.maxHistorySize || 50,
            debounceDelay: config.debounceDelay || 300,
            shortcuts: {
                undo: config.shortcuts?.undo || ['Ctrl+KeyZ', 'Cmd+KeyZ'],
                redo: config.shortcuts?.redo || ['Ctrl+KeyY', 'Ctrl+Shift+KeyZ', 'Cmd+Shift+KeyZ']
            },
            ...config
        };
        
        this.maxHistorySize = this.config.maxHistorySize;
        this.debounceDelay = this.config.debounceDelay;
        
        if (this.config.enabled) {
            this.setupEventHandlers();
            this.setupReadyHandler();
        }
        
        return this;
    }

    /**
     * Setup event handlers for undo/redo
     * @private
     */
    setupEventHandlers() {
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Listen for editor changes
        this.editor.on('change', this.handleChange);
        
        // Listen for block events
        this.editor.on('block-added', () => this.debouncedSaveState());
        this.editor.on('block-removed', () => this.debouncedSaveState());
        this.editor.on('block-moved', () => this.debouncedSaveState());
        this.editor.on('block-changed', () => this.debouncedSaveState());
    }

    /**
     * Setup ready handler to save initial state when editor is ready
     * @private
     */
    setupReadyHandler() {
        if (this.editor.isReady) {
            // Editor is already ready, save initial state immediately
            this.saveInitialState();
        } else {
            // Wait for editor to be ready
            this.editor.once('ready', () => {
                this.saveInitialState();
            });
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     * @private
     */
    handleKeyDown(event) {
        if (!this.isEnabled || this.isUndoRedo) return;
        
        const { ctrlKey, metaKey, shiftKey, code } = event;
        const isCtrlOrCmd = ctrlKey || metaKey;
        
        // Check for undo shortcuts
        const undoShortcuts = this.config.shortcuts.undo;
        for (const shortcut of undoShortcuts) {
            if (this.matchesShortcut(event, shortcut)) {
                event.preventDefault();
                this.undo();
                return;
            }
        }
        
        // Check for redo shortcuts
        const redoShortcuts = this.config.shortcuts.redo;
        for (const shortcut of redoShortcuts) {
            if (this.matchesShortcut(event, shortcut)) {
                event.preventDefault();
                this.redo();
                return;
            }
        }
    }

    /**
     * Check if event matches a keyboard shortcut
     * @param {KeyboardEvent} event - Keyboard event
     * @param {string} shortcut - Shortcut string (e.g., 'Ctrl+KeyZ')
     * @returns {boolean} Whether the event matches the shortcut
     * @private
     */
    matchesShortcut(event, shortcut) {
        const parts = shortcut.split('+');
        const keyCode = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1);
        
        // Check key code
        if (event.code !== keyCode) return false;
        
        // Check modifiers
        const hasCtrl = modifiers.includes('Ctrl') && event.ctrlKey;
        const hasCmd = modifiers.includes('Cmd') && event.metaKey;
        const hasShift = modifiers.includes('Shift') && event.shiftKey;
        const hasAlt = modifiers.includes('Alt') && event.altKey;
        
        const requiredCtrlOrCmd = modifiers.includes('Ctrl') || modifiers.includes('Cmd');
        const requiredShift = modifiers.includes('Shift');
        const requiredAlt = modifiers.includes('Alt');
        
        return (
            (!requiredCtrlOrCmd || hasCtrl || hasCmd) &&
            (!requiredShift || hasShift) &&
            (!requiredAlt || hasAlt) &&
            // Ensure we don't have extra modifiers
            event.ctrlKey === (modifiers.includes('Ctrl') || (modifiers.includes('Cmd') && !event.metaKey)) &&
            event.metaKey === (modifiers.includes('Cmd') || (modifiers.includes('Ctrl') && !event.ctrlKey)) &&
            event.shiftKey === requiredShift &&
            event.altKey === requiredAlt
        );
    }

    /**
     * Handle editor change events
     * @param {object} api - EditorJS API
     * @param {object} event - Change event
     * @private
     */
    handleChange(api, event) {
        if (!this.isEnabled || this.isUndoRedo) return;
        
        // Debounce state saving to avoid too frequent saves
        this.debouncedSaveState();
    }

    /**
     * Debounced state saving
     * @private
     */
    debouncedSaveState() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            this.saveState();
        }, this.debounceDelay);
    }

    /**
     * Save the initial state
     * @private
     */
    async saveInitialState() {
        try {
            // Double-check that editor is ready
            if (!this.editor.isReady) {
                console.warn('Editor not ready yet, waiting...');
                // Wait a bit and try again
                setTimeout(() => this.saveInitialState(), 100);
                return;
            }
            
            const data = await this.editor.save();
            this.history = [data];
            this.currentIndex = 0;
            
            console.log('Initial undo/redo state saved');
        } catch (error) {
            console.error('Error saving initial state:', error);
            // Try again after a short delay if editor wasn't ready
            if (error.message.includes('not ready')) {
                setTimeout(() => this.saveInitialState(), 200);
            }
        }
    }

    /**
     * Save current editor state to history
     * @returns {UndoRedo} This instance for chaining
     */
    async saveState() {
        if (!this.isEnabled || this.isUndoRedo) return this;
        
        try {
            const data = await this.editor.save();
            
            // Don't save if state hasn't changed
            if (this.currentIndex >= 0 && this.isSameState(data, this.history[this.currentIndex])) {
                return this;
            }
            
            // Remove any future history (when adding new state after undo)
            this.history = this.history.slice(0, this.currentIndex + 1);
            
            // Add new state
            this.history.push(data);
            this.currentIndex++;
            
            // Limit history size
            if (this.history.length > this.maxHistorySize) {
                this.history = this.history.slice(-this.maxHistorySize);
                this.currentIndex = this.history.length - 1;
            }
            
            // Emit state change event
            this.editor.emit('undoRedo:stateChanged', {
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                historySize: this.history.length,
                currentIndex: this.currentIndex
            });
            
        } catch (error) {
            console.error('Error saving state:', error);
        }
        
        return this;
    }

    /**
     * Perform undo operation
     * @returns {Promise<boolean>} Whether undo was successful
     */
    async undo() {
        if (!this.canUndo()) return false;
        
        this.isUndoRedo = true;
        
        try {
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            
            // Use the WritrEditor's load method which handles validation and rendering
            await this.editor.load(state);
            
            // Emit undo event
            this.editor.emit('undoRedo:undo', {
                state,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            });
            
            return true;
            
        } catch (error) {
            console.error('Error during undo:', error);
            this.currentIndex++; // Revert index change
            return false;
        } finally {
            this.isUndoRedo = false;
        }
    }

    /**
     * Perform redo operation
     * @returns {Promise<boolean>} Whether redo was successful
     */
    async redo() {
        if (!this.canRedo()) return false;
        
        this.isUndoRedo = true;
        
        try {
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            
            // Use the WritrEditor's load method which handles validation and rendering
            await this.editor.load(state);
            
            // Emit redo event
            this.editor.emit('undoRedo:redo', {
                state,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            });
            
            return true;
            
        } catch (error) {
            console.error('Error during redo:', error);
            this.currentIndex--; // Revert index change
            return false;
        } finally {
            this.isUndoRedo = false;
        }
    }

    /**
     * Check if undo is possible
     * @returns {boolean} Whether undo is possible
     */
    canUndo() {
        return this.isEnabled && this.currentIndex > 0;
    }

    /**
     * Check if redo is possible
     * @returns {boolean} Whether redo is possible
     */
    canRedo() {
        return this.isEnabled && this.currentIndex < this.history.length - 1;
    }

    /**
     * Compare two states for equality
     * @param {object} state1 - First state
     * @param {object} state2 - Second state
     * @returns {boolean} Whether states are the same
     * @private
     */
    isSameState(state1, state2) {
        try {
            return JSON.stringify(state1) === JSON.stringify(state2);
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear history
     * @returns {UndoRedo} This instance for chaining
     */
    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
        
        // Emit clear event
        this.editor.emit('undoRedo:historyCleared');
        
        return this;
    }

    /**
     * Get history information
     * @returns {object} History information
     */
    getHistoryInfo() {
        return {
            size: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            maxSize: this.maxHistorySize
        };
    }

    /**
     * Enable undo/redo functionality
     * @returns {UndoRedo} This instance for chaining
     */
    enable() {
        this.isEnabled = true;
        return this;
    }

    /**
     * Disable undo/redo functionality
     * @returns {UndoRedo} This instance for chaining
     */
    disable() {
        this.isEnabled = false;
        return this;
    }

    /**
     * Get current configuration
     * @returns {object} Current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update configuration
     * @param {object} newConfig - New configuration
     * @returns {UndoRedo} This instance for chaining
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (newConfig.maxHistorySize) {
            this.maxHistorySize = newConfig.maxHistorySize;
            
            // Trim history if necessary
            if (this.history.length > this.maxHistorySize) {
                const trimAmount = this.history.length - this.maxHistorySize;
                this.history = this.history.slice(trimAmount);
                this.currentIndex = Math.max(0, this.currentIndex - trimAmount);
            }
        }
        
        if (newConfig.debounceDelay) {
            this.debounceDelay = newConfig.debounceDelay;
        }
        
        return this;
    }

    /**
     * Destroy undo/redo functionality
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        this.editor.off('change', this.handleChange);
        
        // Clear timeouts
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        // Clear history
        this.clearHistory();
        
        // Reset state
        this.isEnabled = false;
        this.isUndoRedo = false;
        
        // Emit destroyed event
        this.editor.emit('undoRedo:destroyed');
    }
}
