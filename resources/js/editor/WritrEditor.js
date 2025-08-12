/**
 * WritrEditor - A modern block-based editor built on top of EditorJS
 * 
 * Following EditorJS best practices and clean architecture principles
 * @version 2.0.0
 * @author Writr Team
 */

import EditorJS from '@editorjs/editorjs';
import { EventEmitter } from './utils/EventEmitter.js';
import { WritrConfig } from './utils/WritrConfig.js';
import { WritrValidator } from './utils/WritrValidator.js';
import { ToolRegistry } from './utils/ToolRegistry.js';
import { BlockAPI } from './api/BlockAPI.js';
import { MenuConfig } from './api/MenuConfig.js';
import { InlineToolbar } from './api/InlineToolbar.js';
import { PasteSubstitutions } from './api/PasteSubstitutions.js';
import { BlockSettings } from './api/BlockSettings.js';
import { UndoRedo } from './api/UndoRedo.js';

/**
 * Main WritrEditor class
 * 
 * Core principles:
 * 1. Clean data output (JSON, not HTML)
 * 2. Block-based architecture
 * 3. API-driven extensibility
 * 4. Modular tool system
 */
export class WritrEditor extends EventEmitter {
    constructor(options = {}) {
        super();
        
        // Validate options using WritrValidator
        this.options = WritrValidator.validateConfig(options);
        
        // Initialize core properties
        this.editor = null;
        this.isReady = false;
        this.holder = this.options.holder;
        this.config = new WritrConfig(this.options);
        this.toolRegistry = new ToolRegistry();
        
        // Initialize metadata tracking
        this.metadata = {
            pasteSubstitutions: [],
            blockOperations: [],
            version: '1.0.0',
            created: new Date().toISOString()
        };
        
        // Initialize APIs
        this.blockAPI = new BlockAPI(this);
        this.menuConfig = new MenuConfig(this);
        this.inlineToolbar = new InlineToolbar(this);
        this.pasteSubstitutions = new PasteSubstitutions(this);
        this.blockSettings = new BlockSettings(this);
        this.undoRedo = new UndoRedo(this);
        
        // Bind methods to preserve context
        this.handleReady = this.handleReady.bind(this);
        this.handleChange = this.handleChange.bind(this);
        
        // Initialize APIs with configuration
        this.menuConfig.init(this.options.menu || {});
        this.inlineToolbar.init(this.options.inlineToolbar || {});
        this.pasteSubstitutions.init(this.options.pasteSubstitutions || {});
        this.blockSettings.init(this.options.blockSettings || {});
        this.undoRedo.init(this.options.undoRedo || {});
        
        // Initialize editor
        this.init();
    }

    /**
     * Initialize the EditorJS instance
     * Following the official EditorJS initialization pattern
     */
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Ensure holder element exists
            const holderElement = this.getHolderElement();
            if (!holderElement) {
                throw new Error(`Holder element "${this.holder}" not found`);
            }

            // Get registered tools
            const tools = this.toolRegistry.getTools(this.options.tools);

            // Get menu configuration for EditorJS
            const menuConfiguration = this.menuConfig.exportForEditorJS();

            // Create EditorJS configuration
            const editorConfig = {
                holder: this.holder,
                tools: tools,
                data: this.options.data || this.getDefaultData(),
                
                // Editor behavior
                placeholder: this.options.placeholder || 'Start writing or press "/" to add blocks...',
                autofocus: this.options.autofocus || false,
                readOnly: this.options.readOnly || false,
                minHeight: this.options.minHeight || 300,
                
                // Menu configurations
                ...menuConfiguration,
                
                // Callbacks
                onReady: this.handleReady,
                onChange: this.handleChange,
                
                // Sanitizer configuration
                sanitizer: this.config.getSanitizerConfig(),
                
                // Toolbar configuration (merge with menu config)
                toolbar: {
                    ...this.config.getToolbarConfig(),
                    ...menuConfiguration.toolbar
                },
                
                // Other configurations
                logLevel: this.options.logLevel || 'WARN'
            };

            // Initialize EditorJS
            this.editor = new EditorJS(editorConfig);

            // Wait for editor to be ready
            await this.editor.isReady;
            this.isReady = true;

            this.emit('ready', this);

        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Handle editor ready event
     */
    handleReady() {
        console.log('WritrEditor is ready');
        this.isReady = true;
        
        // Initialize APIs with editor instance
        this.blockAPI.init(this.editor);
        
        // Set up metadata tracking event listeners
        this.setupMetadataTracking();
        
        this.emit('ready', this);
    }

    /**
     * Setup metadata tracking for paste substitutions and other operations
     * @private
     */
    setupMetadataTracking() {
        // Track paste substitutions
        this.on('pasteSubstitution', (data) => {
            this.metadata.pasteSubstitutions.push({
                ...data,
                timestamp: new Date().toISOString(),
                blockIndex: this.editor.blocks.getCurrentBlockIndex()
            });
        });
        
        // Track block operations
        this.on('blockInserted', (data) => {
            this.metadata.blockOperations.push({
                type: 'insert',
                ...data,
                timestamp: new Date().toISOString()
            });
        });
        
        this.on('blockRemoved', (data) => {
            this.metadata.blockOperations.push({
                type: 'remove',
                ...data,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Handle editor change event
     */
    async handleChange(api, event) {
        try {
            const data = await api.saver.save();
            this.emit('change', data, event);
        } catch (error) {
            this.emit('error', error);
        }
    }

    /**
     * Get holder element
     */
    getHolderElement() {
        if (typeof this.holder === 'string') {
            return document.getElementById(this.holder) || document.querySelector(this.holder);
        }
        return this.holder;
    }

    /**
     * Get default empty data structure
     */
    getDefaultData() {
        return {
            time: Date.now(),
            blocks: [],
            version: EditorJS.version || '2.28.0'
        };
    }

    // =====================================================
    // Public API Methods
    // =====================================================

    /**
     * Get the Block API instance
     * @returns {BlockAPI} Block API instance
     */
    get blocks() {
        return this.blockAPI;
    }

    /**
     * Get the Menu Configuration instance
     * @returns {MenuConfig} Menu configuration instance
     */
    get menu() {
        return this.menuConfig;
    }

    /**
     * Get the native EditorJS API
     * @returns {object|null} EditorJS API or null if not ready
     */
    get api() {
        return this.editor || null;
    }

    // ===========================================
    // Public API Methods (following EditorJS patterns)
    // ===========================================

    /**
     * Save editor content
     * Returns clean JSON data with optional metadata
     * @param {object} options - Save options
     * @param {boolean} options.includeMetadata - Whether to include paste substitution metadata
     * @returns {object} Editor data with optional metadata
     */
    async save(options = {}) {
        if (!this.isReady || !this.editor) {
            throw new Error('Editor is not ready');
        }

        try {
            const data = await this.editor.save();
            
            // Include metadata if requested
            if (options.includeMetadata) {
                data.metadata = {
                    ...this.metadata,
                    saved: new Date().toISOString()
                };
            }
            
            this.emit('save', data);
            return data;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Save editor content with metadata included
     * @returns {object} Editor data with metadata
     */
    async saveWithMetadata() {
        return await this.save({ includeMetadata: true });
    }

    /**
     * Get current metadata
     * @returns {object} Current metadata
     */
    getMetadata() {
        return {
            ...this.metadata,
            current: new Date().toISOString()
        };
    }

    /**
     * Clear metadata
     * @param {string} type - Type of metadata to clear ('pasteSubstitutions', 'blockOperations', 'all')
     */
    clearMetadata(type = 'all') {
        if (type === 'all') {
            this.metadata.pasteSubstitutions = [];
            this.metadata.blockOperations = [];
        } else if (type === 'pasteSubstitutions') {
            this.metadata.pasteSubstitutions = [];
        } else if (type === 'blockOperations') {
            this.metadata.blockOperations = [];
        }
    }

    /**
     * Load data into editor
     */
    async load(data) {
        if (!this.isReady || !this.editor) {
            throw new Error('Editor is not ready');
        }

        try {
            // Validate data structure
            const validatedData = WritrValidator.validateData(data);
            await this.editor.render(validatedData);
            this.emit('load', validatedData);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Clear all content
     */
    async clear() {
        if (!this.isReady || !this.editor) {
            throw new Error('Editor is not ready');
        }

        try {
            this.editor.clear();
            this.emit('clear');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Focus the editor
     */
    focus() {
        if (this.isReady && this.editor && this.editor.focus) {
            this.editor.focus();
        }
    }

    /**
     * Get current block count
     */
    getBlocksCount() {
        if (!this.isReady || !this.editor) {
            return 0;
        }
        return this.editor.blocks.getBlocksCount();
    }

    /**
     * Get current block index
     */
    getCurrentBlockIndex() {
        if (!this.isReady || !this.editor) {
            return -1;
        }
        return this.editor.blocks.getCurrentBlockIndex();
    }

    /**
     * Insert new block
     */
    insertBlock(type = 'paragraph', data = {}, config = {}, index = null, needToFocus = true) {
        if (!this.isReady || !this.editor) {
            throw new Error('Editor is not ready');
        }

        return this.editor.blocks.insert(type, data, config, index, needToFocus);
    }

    /**
     * Delete block by index
     */
    deleteBlock(index = null) {
        if (!this.isReady || !this.editor) {
            throw new Error('Editor is not ready');
        }

        this.editor.blocks.delete(index);
    }

    /**
     * Move block to new position
     */
    moveBlock(toIndex, fromIndex = null) {
        if (!this.isReady || !this.editor) {
            throw new Error('Editor is not ready');
        }

        this.editor.blocks.move(toIndex, fromIndex);
    }

    /**
     * Get block by index
     */
    getBlockByIndex(index) {
        if (!this.isReady || !this.editor) {
            return null;
        }

        return this.editor.blocks.getBlockByIndex(index);
    }

    /**
     * Enable/disable read-only mode
     */
    setReadOnly(state) {
        if (!this.isReady || !this.editor) {
            throw new Error('Editor is not ready');
        }

        return this.editor.readOnly.toggle(state);
    }

    /**
     * Check if editor is in read-only mode
     */
    isReadOnly() {
        if (!this.isReady || !this.editor) {
            return false;
        }

        return this.editor.readOnly.isEnabled;
    }

    // ===========================================
    // Toolbar API Methods
    // ===========================================

    /**
     * Open toolbar
     */
    openToolbar(needToFocus = true) {
        if (this.isReady && this.editor && this.editor.toolbar) {
            this.editor.toolbar.open(needToFocus);
        }
    }

    /**
     * Close toolbar
     */
    closeToolbar() {
        if (this.isReady && this.editor && this.editor.toolbar) {
            this.editor.toolbar.close();
        }
    }

    /**
     * Check if toolbar is open
     */
    isToolbarOpen() {
        if (!this.isReady || !this.editor || !this.editor.toolbar) {
            return false;
        }
        
        return this.editor.toolbar.opened || false;
    }

    // ===========================================
    // Utility Methods
    // ===========================================

    /**
     * Register a custom tool
     */
    registerTool(name, tool) {
        this.toolRegistry.register(name, tool);
    }

    /**
     * Get editor configuration
     */
    getConfig() {
        return this.config.getConfig();
    }

    /**
     * Get editor instance (for advanced usage)
     */
    getEditorInstance() {
        return this.editor;
    }

    /**
     * Check if editor is ready
     */
    ready() {
        return this.isReady;
    }

    /**
     * Get Block API
     */
    getBlockAPI() {
        return this.blockAPI;
    }

    /**
     * Get Menu Config API
     */
    getMenuConfig() {
        return this.menuConfig;
    }

    /**
     * Get Inline Toolbar API
     */
    getInlineToolbar() {
        return this.inlineToolbar;
    }

    /**
     * Get Paste Substitutions API
     */
    getPasteSubstitutions() {
        return this.pasteSubstitutions;
    }

    /**
     * Get Block Settings API
     */
    getBlockSettings() {
        return this.blockSettings;
    }

    /**
     * Get Undo/Redo API
     */
    getUndoRedo() {
        return this.undoRedo;
    }

    /**
     * Perform undo operation
     */
    async undo() {
        return await this.undoRedo.undo();
    }

    /**
     * Perform redo operation
     */
    async redo() {
        return await this.undoRedo.redo();
    }

    /**
     * Enable/disable inline toolbar
     */
    toggleInlineToolbar(enabled = null) {
        if (enabled === null) {
            return this.inlineToolbar.isEnabled ? this.inlineToolbar.disable() : this.inlineToolbar.enable();
        }
        return enabled ? this.inlineToolbar.enable() : this.inlineToolbar.disable();
    }

    /**
     * Enable/disable paste substitutions
     */
    togglePasteSubstitutions(enabled = null) {
        if (enabled === null) {
            return this.pasteSubstitutions.isEnabled ? this.pasteSubstitutions.disable() : this.pasteSubstitutions.enable();
        }
        return enabled ? this.pasteSubstitutions.enable() : this.pasteSubstitutions.disable();
    }

    /**
     * Enable/disable block settings
     */
    toggleBlockSettings(enabled = null) {
        if (enabled === null) {
            return this.blockSettings.isEnabled ? this.blockSettings.disable() : this.blockSettings.enable();
        }
        return enabled ? this.blockSettings.enable() : this.blockSettings.disable();
    }

    /**
     * Enable/disable undo/redo functionality
     */
    toggleUndoRedo(enabled = null) {
        if (enabled === null) {
            return this.undoRedo.isEnabled ? this.undoRedo.disable() : this.undoRedo.enable();
        }
        return enabled ? this.undoRedo.enable() : this.undoRedo.disable();
    }

    /**
     * Add custom inline tool
     */
    addInlineTool(name, toolConfig) {
        return this.inlineToolbar.addTool(name, toolConfig);
    }

    /**
     * Add custom paste pattern
     */
    addPastePattern(name, patternConfig) {
        return this.pasteSubstitutions.addPattern(name, patternConfig);
    }

    /**
     * Add custom block settings
     */
    addBlockSettings(blockType, settingsConfig) {
        return this.blockSettings.addBlockSettings(blockType, settingsConfig);
    }

    /**
     * Show block settings for specific block
     */
    showBlockSettings(block) {
        return this.blockSettings.showSettings(block);
    }

    /**
     * Hide block settings panel
     */
    hideBlockSettings() {
        return this.blockSettings.hideSettings();
    }

    /**
     * Destroy editor instance
     */
    async destroy() {
        try {
            this.emit('beforeDestroy');

            if (this.editor && typeof this.editor.destroy === 'function') {
                await this.editor.destroy();
            }

            // Destroy APIs
            if (this.inlineToolbar) this.inlineToolbar.destroy();
            if (this.pasteSubstitutions) this.pasteSubstitutions.destroy();
            if (this.blockSettings) this.blockSettings.destroy();
            if (this.undoRedo) this.undoRedo.destroy();

            this.editor = null;
            this.isReady = false;
            this.removeAllListeners();

            this.emit('destroyed');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}

// Export for global usage
export default WritrEditor;
