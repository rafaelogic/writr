/**
 * InlineToolbar - Implementation of EditorJS Inline Toolbar
 * 
 * Provides inline text formatting tools that appear when text is selected:
 * - Bold, Italic, Underline formatting
 * - Link creation and editing
 * - Code formatting
 * - Custom inline tools
 * 
 * @see https://editorjs.io/enable-inline-toolbar/
 */

export class InlineToolbar {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.isEnabled = true;
        this.tools = new Map();
        this.shortcuts = new Map();
        this.toolbar = null;
        this.isVisible = false;
        
        // Default inline tools configuration
        this.defaultTools = {
            bold: {
                class: BoldInlineTool,
                shortcut: 'CMD+B'
            },
            italic: {
                class: ItalicInlineTool,
                shortcut: 'CMD+I'
            },
            link: {
                class: LinkInlineTool,
                shortcut: 'CMD+K'
            },
            code: {
                class: InlineCodeTool,
                shortcut: 'CMD+SHIFT+C'
            },
            underline: {
                class: UnderlineInlineTool,
                shortcut: 'CMD+U'
            }
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.addTool = this.addTool.bind(this);
        this.removeTool = this.removeTool.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
    }

    /**
     * Initialize inline toolbar
     * @param {object} config - Inline toolbar configuration
     * @returns {InlineToolbar} This instance for chaining
     */
    init(config = {}) {
        this.config = {
            enabled: config.enabled !== false,
            tools: config.tools || Object.keys(this.defaultTools),
            shortcuts: config.shortcuts || {},
            holder: config.holder || this.createDefaultHolder(),
            ...config
        };
        
        if (this.config.enabled) {
            this.setupTools();
            this.setupEventHandlers();
        }
        
        return this;
    }

    /**
     * Create default toolbar holder
     * @returns {HTMLElement} Toolbar holder element
     * @private
     */
    createDefaultHolder() {
        const holder = document.createElement('div');
        holder.className = 'writr-inline-toolbar';
        holder.style.cssText = `
            position: absolute;
            z-index: 1000;
            display: none;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            padding: 4px;
            white-space: nowrap;
        `;
        
        document.body.appendChild(holder);
        return holder;
    }

    /**
     * Setup inline tools
     * @private
     */
    setupTools() {
        this.tools.clear();
        
        // Register default tools
        for (const [name, toolConfig] of Object.entries(this.defaultTools)) {
            if (this.config.tools.includes(name)) {
                this.addTool(name, toolConfig);
            }
        }
        
        // Register custom tools from config
        if (this.config.customTools) {
            for (const [name, toolConfig] of Object.entries(this.config.customTools)) {
                this.addTool(name, toolConfig);
            }
        }
        
        this.renderToolbar();
    }

    /**
     * Setup event handlers for inline toolbar
     * @private
     */
    setupEventHandlers() {
        // Listen for text selection
        document.addEventListener('selectionchange', this.handleSelection);
        
        // Hide toolbar on click outside
        document.addEventListener('click', (event) => {
            if (!this.toolbar.contains(event.target) && this.isVisible) {
                this.hide();
            }
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleShortcuts(event);
        });
    }

    /**
     * Handle text selection changes
     * @param {Event} event - Selection change event
     * @private
     */
    handleSelection(event) {
        if (!this.isEnabled) return;
        
        const selection = window.getSelection();
        
        // Hide toolbar if no selection or collapsed selection
        if (!selection.rangeCount || selection.isCollapsed) {
            this.hide();
            return;
        }
        
        // Check if selection is within editor
        const editorElement = this.editor.getHolderElement();
        if (!editorElement) return;
        
        const range = selection.getRangeAt(0);
        const isWithinEditor = editorElement.contains(range.commonAncestorContainer);
        
        if (isWithinEditor && selection.toString().trim().length > 0) {
            this.show(range);
        } else {
            this.hide();
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     * @private
     */
    handleShortcuts(event) {
        if (!this.isEnabled) return;
        
        const shortcutKey = this.getShortcutKey(event);
        const tool = this.shortcuts.get(shortcutKey);
        
        if (tool) {
            event.preventDefault();
            this.activateTool(tool.name);
        }
    }

    /**
     * Get shortcut key string from keyboard event
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {string} Shortcut key string
     * @private
     */
    getShortcutKey(event) {
        const parts = [];
        
        if (event.ctrlKey || event.metaKey) parts.push('CMD');
        if (event.shiftKey) parts.push('SHIFT');
        if (event.altKey) parts.push('ALT');
        
        parts.push(event.key.toUpperCase());
        
        return parts.join('+');
    }

    /**
     * Add inline tool
     * @param {string} name - Tool name
     * @param {object} toolConfig - Tool configuration
     * @returns {InlineToolbar} This instance for chaining
     */
    addTool(name, toolConfig) {
        const tool = {
            name,
            class: toolConfig.class,
            shortcut: toolConfig.shortcut,
            title: toolConfig.title || name,
            icon: toolConfig.icon,
            action: toolConfig.action || this.createDefaultAction(toolConfig.class),
            isActive: toolConfig.isActive || (() => false),
            ...toolConfig
        };
        
        this.tools.set(name, tool);
        
        // Register shortcut if provided
        if (tool.shortcut) {
            this.shortcuts.set(tool.shortcut, tool);
        }
        
        // Re-render toolbar if it exists
        if (this.toolbar) {
            this.renderToolbar();
        }
        
        return this;
    }

    /**
     * Remove inline tool
     * @param {string} name - Tool name to remove
     * @returns {InlineToolbar} This instance for chaining
     */
    removeTool(name) {
        const tool = this.tools.get(name);
        if (tool) {
            this.tools.delete(name);
            
            // Remove shortcut
            if (tool.shortcut) {
                this.shortcuts.delete(tool.shortcut);
            }
            
            // Re-render toolbar
            if (this.toolbar) {
                this.renderToolbar();
            }
        }
        
        return this;
    }

    /**
     * Create default action for inline tool class
     * @param {Function} ToolClass - Inline tool class
     * @returns {Function} Default action function
     * @private
     */
    createDefaultAction(ToolClass) {
        return () => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const tool = new ToolClass({ range, selection });
            
            if (typeof tool.surround === 'function') {
                tool.surround(range);
            }
        };
    }

    /**
     * Render toolbar with all tools
     * @private
     */
    renderToolbar() {
        if (!this.toolbar) {
            this.toolbar = this.config.holder || this.createDefaultHolder();
        }
        
        // Clear existing content
        this.toolbar.innerHTML = '';
        
        // Add tools
        for (const [name, tool] of this.tools) {
            const button = this.createToolButton(tool);
            this.toolbar.appendChild(button);
        }
    }

    /**
     * Create button for inline tool
     * @param {object} tool - Tool configuration
     * @returns {HTMLElement} Tool button element
     * @private
     */
    createToolButton(tool) {
        const button = document.createElement('button');
        button.className = 'writr-inline-tool-button';
        button.title = tool.title;
        button.setAttribute('data-tool', tool.name);
        
        button.style.cssText = `
            border: none;
            background: transparent;
            padding: 8px;
            margin: 2px;
            border-radius: 4px;
            cursor: pointer;
            color: #374151;
            font-size: 14px;
            transition: all 0.15s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 32px;
            height: 32px;
        `;
        
        // Add icon or text
        if (tool.icon) {
            button.innerHTML = tool.icon;
        } else {
            button.textContent = tool.name.charAt(0).toUpperCase();
        }
        
        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#f3f4f6';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'transparent';
        });
        
        // Add click handler
        button.addEventListener('click', (event) => {
            event.preventDefault();
            this.activateTool(tool.name);
        });
        
        return button;
    }

    /**
     * Activate inline tool
     * @param {string} toolName - Name of tool to activate
     * @returns {boolean} Success status
     */
    activateTool(toolName) {
        const tool = this.tools.get(toolName);
        if (!tool) return false;
        
        try {
            if (typeof tool.action === 'function') {
                tool.action();
            }
            
            // Update button state
            this.updateToolStates();
            
            // Emit tool activated event
            this.editor.emit('inlineToolActivated', { tool: toolName });
            
            return true;
        } catch (error) {
            console.error('Error activating inline tool:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Update active states of all tool buttons
     * @private
     */
    updateToolStates() {
        if (!this.toolbar) return;
        
        const buttons = this.toolbar.querySelectorAll('.writr-inline-tool-button');
        
        buttons.forEach(button => {
            const toolName = button.getAttribute('data-tool');
            const tool = this.tools.get(toolName);
            
            if (tool && typeof tool.isActive === 'function') {
                const isActive = tool.isActive();
                
                if (isActive) {
                    button.style.backgroundColor = '#3b82f6';
                    button.style.color = 'white';
                } else {
                    button.style.backgroundColor = 'transparent';
                    button.style.color = '#374151';
                }
            }
        });
    }

    /**
     * Show inline toolbar at selection
     * @param {Range} range - Text selection range
     */
    show(range) {
        if (!this.toolbar || this.isVisible) return;
        
        // Get selection rectangle
        const rect = range.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Position toolbar above selection
        const toolbarRect = this.toolbar.getBoundingClientRect();
        const left = rect.left + scrollLeft + (rect.width / 2) - (toolbarRect.width / 2);
        const top = rect.top + scrollTop - toolbarRect.height - 10;
        
        // Ensure toolbar stays within viewport
        const maxLeft = window.innerWidth - toolbarRect.width - 10;
        const finalLeft = Math.max(10, Math.min(left, maxLeft));
        const finalTop = Math.max(10, top);
        
        this.toolbar.style.left = `${finalLeft}px`;
        this.toolbar.style.top = `${finalTop}px`;
        this.toolbar.style.display = 'block';
        
        this.isVisible = true;
        this.updateToolStates();
        
        // Emit toolbar shown event
        this.editor.emit('inlineToolbarShown', { range, position: { left: finalLeft, top: finalTop } });
    }

    /**
     * Hide inline toolbar
     */
    hide() {
        if (!this.toolbar || !this.isVisible) return;
        
        this.toolbar.style.display = 'none';
        this.isVisible = false;
        
        // Emit toolbar hidden event
        this.editor.emit('inlineToolbarHidden');
    }

    /**
     * Enable inline toolbar
     * @returns {InlineToolbar} This instance for chaining
     */
    enable() {
        this.isEnabled = true;
        return this;
    }

    /**
     * Disable inline toolbar
     * @returns {InlineToolbar} This instance for chaining
     */
    disable() {
        this.isEnabled = false;
        this.hide();
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
     * Get all registered tools
     * @returns {Map} Map of registered tools
     */
    getTools() {
        return new Map(this.tools);
    }

    /**
     * Check if toolbar is currently visible
     * @returns {boolean} Visibility status
     */
    isToolbarVisible() {
        return this.isVisible;
    }

    /**
     * Destroy inline toolbar
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('selectionchange', this.handleSelection);
        
        // Remove toolbar from DOM
        if (this.toolbar && this.toolbar.parentNode) {
            this.toolbar.parentNode.removeChild(this.toolbar);
        }
        
        // Clear references
        this.tools.clear();
        this.shortcuts.clear();
        this.toolbar = null;
        this.isVisible = false;
        this.isEnabled = false;
        
        // Emit destroyed event
        this.editor.emit('inlineToolbarDestroyed');
    }
}

// Default inline tool implementations
class BoldInlineTool {
    static get isInline() {
        return true;
    }

    static get title() {
        return 'Bold';
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.tag = 'B';
        this.class = 'bold';
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = '<b>B</b>';
        this.button.title = 'Bold';
        
        return this.button;
    }

    surround(range) {
        document.execCommand('bold');
    }

    checkState() {
        return document.queryCommandState('bold');
    }
}

class ItalicInlineTool {
    static get isInline() {
        return true;
    }

    static get title() {
        return 'Italic';
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.tag = 'I';
        this.class = 'italic';
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = '<i>I</i>';
        this.button.title = 'Italic';
        
        return this.button;
    }

    surround(range) {
        document.execCommand('italic');
    }

    checkState() {
        return document.queryCommandState('italic');
    }
}

class LinkInlineTool {
    static get isInline() {
        return true;
    }

    static get title() {
        return 'Link';
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.tag = 'A';
        this.class = 'link';
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = '🔗';
        this.button.title = 'Link';
        
        return this.button;
    }

    surround(range) {
        const url = prompt('Enter URL:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    }

    checkState() {
        return document.queryCommandState('createLink');
    }
}

class InlineCodeTool {
    static get isInline() {
        return true;
    }

    static get title() {
        return 'Code';
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.tag = 'CODE';
        this.class = 'inline-code';
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = '&lt;/&gt;';
        this.button.title = 'Inline Code';
        
        return this.button;
    }

    surround(range) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const selectedText = selection.toString();
        const code = document.createElement('code');
        code.textContent = selectedText;
        
        range.deleteContents();
        range.insertNode(code);
        selection.removeAllRanges();
    }

    checkState() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        
        const parentElement = selection.getRangeAt(0).commonAncestorContainer.parentElement;
        return parentElement && parentElement.tagName === 'CODE';
    }
}

class UnderlineInlineTool {
    static get isInline() {
        return true;
    }

    static get title() {
        return 'Underline';
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.tag = 'U';
        this.class = 'underline';
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = '<u>U</u>';
        this.button.title = 'Underline';
        
        return this.button;
    }

    surround(range) {
        document.execCommand('underline');
    }

    checkState() {
        return document.queryCommandState('underline');
    }
}
