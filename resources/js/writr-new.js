/**
 * Writr Editor - Main entry point
 * 
 * A complete rebuild of the Writr editor following EditorJS best practices
 * 
 * Architecture:
 * - Clean separation of concerns
 * - Modular tool system
 * - Event-driven design
 * - Proper EditorJS API usage
 * 
 * @version 2.0.0
 */

// Core editor
import { WritrEditor } from './editor/WritrEditor.js';

// Custom tools
import { ParagraphTool } from './editor/tools/ParagraphTool.js';
import { TableTool } from './editor/tools/TableTool.js';
import { QuoteTool } from './editor/tools/QuoteTool.js';
import { CodeTool } from './editor/tools/CodeTool.js';
import { ListTool } from './editor/tools/ListTool.js';
import { HeaderTool } from './editor/tools/HeaderTool.js';
import { ImageTool } from './editor/tools/ImageTool.js';

// Utilities
import { WritrConfig } from './editor/utils/WritrConfig.js';
import { WritrValidator } from './editor/utils/WritrValidator.js';
import { ToolRegistry } from './editor/utils/ToolRegistry.js';
import { EventEmitter } from './editor/utils/EventEmitter.js';

/**
 * Main Writr class that provides the public API
 */
class Writr {
    /**
     * Create a new Writr editor instance
     * @param {Object} options - Editor configuration
     * @returns {WritrEditor} - Editor instance
     */
    static create(options = {}) {
        return new WritrEditor(options);
    }

    /**
     * Get Writr version
     */
    static get version() {
        return '2.0.0';
    }

    /**
     * Register a custom tool globally
     * @param {string} name - Tool name
     * @param {Function} tool - Tool class
     */
    static registerTool(name, tool) {
        if (!Writr._globalRegistry) {
            Writr._globalRegistry = new ToolRegistry();
        }
        Writr._globalRegistry.register(name, tool);
    }

    /**
     * Get all available tools
     */
    static getAvailableTools() {
        if (!Writr._globalRegistry) {
            Writr._globalRegistry = new ToolRegistry();
        }
        return Writr._globalRegistry.getAvailableTools();
    }

    /**
     * Validate editor data
     * @param {Object} data - Data to validate
     */
    static validateData(data) {
        return WritrValidator.validateData(data);
    }

    /**
     * Create configuration object
     * @param {Object} options - Configuration options
     */
    static createConfig(options = {}) {
        return new WritrConfig(options);
    }
}

// Register custom tools globally
Writr.registerTool('paragraph', {
    class: ParagraphTool,
    inlineToolbar: true
});

Writr.registerTool('table', {
    class: TableTool,
    inlineToolbar: true
});

Writr.registerTool('quote', {
    class: QuoteTool,
    inlineToolbar: true
});

Writr.registerTool('code', {
    class: CodeTool,
    inlineToolbar: true
});

Writr.registerTool('list', {
    class: ListTool,
    inlineToolbar: true
});

Writr.registerTool('header', {
    class: HeaderTool,
    inlineToolbar: true
});

Writr.registerTool('image', {
    class: ImageTool,
    inlineToolbar: false
});

// Export classes for advanced usage
Writr.WritrEditor = WritrEditor;
Writr.WritrConfig = WritrConfig;
Writr.WritrValidator = WritrValidator;
Writr.ToolRegistry = ToolRegistry;
Writr.EventEmitter = EventEmitter;

// Export tools
Writr.tools = {
    ParagraphTool,
    TableTool,
    QuoteTool,
    CodeTool,
    ListTool,
    HeaderTool,
    ImageTool
};

// Make available globally
if (typeof window !== 'undefined') {
    window.Writr = Writr;
    window.WritrEditor = WritrEditor;
    
    // Maintain compatibility with old API
    window.writrEditors = window.writrEditors || {};
    
    console.log('Writr Editor v2.0.0 loaded successfully');
}

// Export for ES modules
export default Writr;
export {
    WritrEditor,
    WritrConfig,
    WritrValidator,
    ToolRegistry,
    EventEmitter,
    ParagraphTool,
    TableTool,
    QuoteTool,
    CodeTool,
    ListTool,
    HeaderTool,
    ImageTool
};
