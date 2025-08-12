/**
 * ToolRegistry - Manages tool registration and configuration
 * Provides a centralized way to register and retrieve EditorJS tools
 */

// Import official EditorJS tools
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Table from '@editorjs/table';
import List from '@editorjs/list';
import Delimiter from '@editorjs/delimiter';
import Warning from '@editorjs/warning';
import Checklist from '@editorjs/checklist';
import LinkTool from '@editorjs/link';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';
import RawTool from '@editorjs/raw';
import AttachesTool from '@editorjs/attaches';
import Underline from '@editorjs/underline';

export class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.registerDefaultTools();
    }

    /**
     * Register default EditorJS tools
     */
    registerDefaultTools() {
        // Text tools - Paragraph is the default tool in EditorJS
        // We don't register it explicitly as it's always available
        
        this.register('header', {
            class: Header,
            inlineToolbar: true,
            config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
            }
        });

        // Formatting tools
        this.register('quote', {
            class: Quote,
            inlineToolbar: true,
            config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author'
            }
        });

        this.register('code', {
            class: CodeTool,
            inlineToolbar: true,
            config: {
                placeholder: 'Enter code...'
            }
        });

        // List tools
        this.register('list', {
            class: List,
            inlineToolbar: true,
            config: {
                defaultStyle: 'unordered'
            }
        });

        this.register('checklist', {
            class: Checklist,
            inlineToolbar: true
        });

        // Media tools
        this.register('table', {
            class: Table,
            inlineToolbar: true,
            config: {
                rows: 2,
                cols: 3,
                withHeadings: false
            }
        });

        this.register('image', {
            class: ImageTool,
            config: {
                endpoints: {
                    byFile: '/api/upload/image',
                    byUrl: '/api/fetch/image'
                },
                field: 'image',
                types: 'image/*',
                captionPlaceholder: 'Enter caption',
                buttonContent: 'Select an Image'
            }
        });

        this.register('embed', {
            class: Embed,
            config: {
                services: {
                    youtube: true,
                    twitter: true,
                    codepen: true,
                    instagram: true,
                    vimeo: true,
                    github: true
                }
            }
        });

        // Utility tools
        this.register('delimiter', {
            class: Delimiter
        });

        this.register('warning', {
            class: Warning,
            inlineToolbar: true,
            config: {
                titlePlaceholder: 'Title',
                messagePlaceholder: 'Message'
            }
        });

        this.register('raw', {
            class: RawTool,
            config: {
                placeholder: 'Enter raw HTML...'
            }
        });

        this.register('attaches', {
            class: AttachesTool,
            config: {
                endpoint: '/api/upload/file',
                field: 'file',
                types: '*',
                buttonText: 'Select file to upload'
            }
        });

        this.register('link', {
            class: LinkTool,
            config: {
                endpoint: '/api/fetch/url'
            }
        });

        // Inline formatting tools
        this.register('marker', {
            class: Marker,
            shortcut: 'CMD+SHIFT+M'
        });

        this.register('inlineCode', {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+C'
        });

        this.register('underline', {
            class: Underline,
            shortcut: 'CMD+U'
        });
    }

    /**
     * Register a tool
     */
    register(name, config) {
        if (!name || typeof name !== 'string') {
            throw new Error('Tool name must be a non-empty string');
        }

        if (!config) {
            throw new Error('Tool configuration is required');
        }

        this.tools.set(name, config);
        return this;
    }

    /**
     * Unregister a tool
     */
    unregister(name) {
        return this.tools.delete(name);
    }

    /**
     * Check if tool is registered
     */
    isRegistered(name) {
        return this.tools.has(name);
    }

    /**
     * Get tool configuration
     */
    getTool(name) {
        return this.tools.get(name);
    }

    /**
     * Get all registered tools
     */
    getAllTools() {
        const tools = {};
        for (const [name, config] of this.tools) {
            // Skip paragraph as it's the default tool in EditorJS
            if (name === 'paragraph') {
                continue;
            }
            tools[name] = config;
        }
        return tools;
    }

    /**
     * Get tools based on requested tool names
     */
    getTools(requestedTools = null) {
        // If no specific tools requested, return all registered tools
        if (!requestedTools || !Array.isArray(requestedTools)) {
            return this.getAllTools();
        }

        const tools = {};
        for (const toolName of requestedTools) {
            // Skip paragraph as it's the default tool in EditorJS
            if (toolName === 'paragraph') {
                continue;
            }
            
            if (this.isRegistered(toolName)) {
                tools[toolName] = this.getTool(toolName);
            } else {
                console.warn(`Tool "${toolName}" is not registered`);
            }
        }

        return tools;
    }

    /**
     * Get available tool names
     */
    getAvailableTools() {
        return Array.from(this.tools.keys());
    }

    /**
     * Clear all registered tools
     */
    clear() {
        this.tools.clear();
        return this;
    }

    /**
     * Register multiple tools at once
     */
    registerMultiple(toolsMap) {
        if (!toolsMap || typeof toolsMap !== 'object') {
            throw new Error('Tools map must be an object');
        }

        for (const [name, config] of Object.entries(toolsMap)) {
            this.register(name, config);
        }

        return this;
    }

    /**
     * Create a custom tool registry with specific tools
     */
    createSubRegistry(toolNames) {
        const subRegistry = new ToolRegistry();
        subRegistry.clear(); // Remove default tools

        for (const toolName of toolNames) {
            if (this.isRegistered(toolName)) {
                subRegistry.register(toolName, this.getTool(toolName));
            }
        }

        return subRegistry;
    }

    /**
     * Validate tool configuration
     */
    validateTool(name, config) {
        if (!name || typeof name !== 'string') {
            throw new Error('Tool name must be a non-empty string');
        }

        if (!config) {
            throw new Error('Tool configuration is required');
        }

        // Check if it's a class-based tool
        if (config.class && typeof config.class !== 'function') {
            throw new Error(`Tool "${name}" class must be a constructor function`);
        }

        // Validate inline tools
        if (config.class && config.class.isInline === true) {
            // Inline tools don't need save method
            return true;
        }

        // Block tools should have save method
        if (config.class && 
            !config.class.prototype.save && 
            typeof config.class.prototype.save !== 'function') {
            console.warn(`Block tool "${name}" should have a save method`);
        }

        return true;
    }
}
