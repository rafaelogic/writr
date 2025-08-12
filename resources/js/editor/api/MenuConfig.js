/**
 * MenuConfig - Implementation of EditorJS Menu Configuration
 * 
 * Provides comprehensive menu management capabilities:
 * - Toolbar configuration and customization
 * - Block Tunes management
 * - Inline toolbar configuration
 * - Conversion toolbar setup
 * - Custom menu actions and shortcuts
 * 
 * @see https://editorjs.io/menu-config/
 */

export class MenuConfig {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.config = {
            toolbar: {
                shouldNotGroupWhenFull: false,
                hideWhenEmpty: true
            },
            blockTunes: {
                enabled: true,
                actions: []
            },
            inlineToolbar: {
                enabled: true,
                tools: []
            },
            conversion: {
                enabled: true,
                shortcuts: {}
            },
            contextMenu: {
                enabled: true,
                items: []
            }
        };
        
        this.shortcuts = new Map();
        this.customActions = new Map();
        this.blockTunes = new Map();
        
        // Bind methods
        this.configureToolbar = this.configureToolbar.bind(this);
        this.configureBlockTunes = this.configureBlockTunes.bind(this);
        this.configureInlineToolbar = this.configureInlineToolbar.bind(this);
        this.addShortcut = this.addShortcut.bind(this);
        this.removeShortcut = this.removeShortcut.bind(this);
        this.addCustomAction = this.addCustomAction.bind(this);
        this.setupContextMenu = this.setupContextMenu.bind(this);
    }

    /**
     * Initialize menu configuration
     * @param {object} options - Menu configuration options
     * @returns {MenuConfig} This instance for chaining
     */
    init(options = {}) {
        this.config = this.mergeConfig(this.config, options);
        this.setupDefaultMenus();
        this.registerDefaultShortcuts();
        return this;
    }

    /**
     * Configure main toolbar
     * @param {object} toolbarConfig - Toolbar configuration
     * @returns {MenuConfig} This instance for chaining
     */
    configureToolbar(toolbarConfig = {}) {
        const config = {
            shouldNotGroupWhenFull: toolbarConfig.shouldNotGroupWhenFull ?? this.config.toolbar.shouldNotGroupWhenFull,
            hideWhenEmpty: toolbarConfig.hideWhenEmpty ?? this.config.toolbar.hideWhenEmpty,
            ...toolbarConfig
        };

        this.config.toolbar = config;
        
        // Emit toolbar configured event
        this.editor.emit('toolbarConfigured', { config });
        
        return this;
    }

    /**
     * Configure block tunes (block settings menu)
     * @param {object} blockTunesConfig - Block tunes configuration
     * @returns {MenuConfig} This instance for chaining
     */
    configureBlockTunes(blockTunesConfig = {}) {
        const config = {
            enabled: blockTunesConfig.enabled ?? this.config.blockTunes.enabled,
            actions: [...(this.config.blockTunes.actions || []), ...(blockTunesConfig.actions || [])],
            ...blockTunesConfig
        };

        this.config.blockTunes = config;
        
        // Register custom block tunes
        if (config.actions && config.actions.length > 0) {
            config.actions.forEach(action => {
                this.addBlockTune(action.name, action);
            });
        }
        
        // Emit block tunes configured event
        this.editor.emit('blockTunesConfigured', { config });
        
        return this;
    }

    /**
     * Configure inline toolbar
     * @param {object} inlineConfig - Inline toolbar configuration
     * @returns {MenuConfig} This instance for chaining
     */
    configureInlineToolbar(inlineConfig = {}) {
        const config = {
            enabled: inlineConfig.enabled ?? this.config.inlineToolbar.enabled,
            tools: [...(this.config.inlineToolbar.tools || []), ...(inlineConfig.tools || [])],
            ...inlineConfig
        };

        this.config.inlineToolbar = config;
        
        // Emit inline toolbar configured event
        this.editor.emit('inlineToolbarConfigured', { config });
        
        return this;
    }

    /**
     * Add keyboard shortcut
     * @param {string} key - Keyboard shortcut (e.g., 'CMD+B', 'CTRL+I')
     * @param {string|Function} action - Action name or function
     * @param {object} options - Shortcut options
     * @returns {MenuConfig} This instance for chaining
     */
    addShortcut(key, action, options = {}) {
        const shortcutConfig = {
            key: key.toUpperCase(),
            action,
            description: options.description || `Shortcut for ${key}`,
            preventDefault: options.preventDefault ?? true,
            stopPropagation: options.stopPropagation ?? true,
            ...options
        };

        this.shortcuts.set(key.toUpperCase(), shortcutConfig);
        
        // Register with EditorJS if editor is available
        if (this.editor.api && this.editor.api.shortcuts) {
            this.editor.api.shortcuts.add(shortcutConfig);
        }
        
        // Emit shortcut added event
        this.editor.emit('shortcutAdded', { key, config: shortcutConfig });
        
        return this;
    }

    /**
     * Remove keyboard shortcut
     * @param {string} key - Keyboard shortcut to remove
     * @returns {MenuConfig} This instance for chaining
     */
    removeShortcut(key) {
        const upperKey = key.toUpperCase();
        const removed = this.shortcuts.delete(upperKey);
        
        // Remove from EditorJS if editor is available
        if (this.editor.api && this.editor.api.shortcuts && removed) {
            this.editor.api.shortcuts.remove(upperKey);
        }
        
        // Emit shortcut removed event
        this.editor.emit('shortcutRemoved', { key, removed });
        
        return this;
    }

    /**
     * Add custom action to toolbar
     * @param {string} name - Action name
     * @param {object} actionConfig - Action configuration
     * @returns {MenuConfig} This instance for chaining
     */
    addCustomAction(name, actionConfig) {
        const config = {
            name,
            title: actionConfig.title || name,
            icon: actionConfig.icon || '⚙️',
            action: actionConfig.action,
            shortcut: actionConfig.shortcut,
            group: actionConfig.group || 'custom',
            isActive: actionConfig.isActive || (() => false),
            isDisabled: actionConfig.isDisabled || (() => false),
            ...actionConfig
        };

        this.customActions.set(name, config);
        
        // Add shortcut if provided
        if (config.shortcut) {
            this.addShortcut(config.shortcut, config.action, {
                description: `Shortcut for ${config.title}`
            });
        }
        
        // Emit custom action added event
        this.editor.emit('customActionAdded', { name, config });
        
        return this;
    }

    /**
     * Add block tune
     * @param {string} name - Block tune name
     * @param {object} tuneConfig - Block tune configuration
     * @returns {MenuConfig} This instance for chaining
     */
    addBlockTune(name, tuneConfig) {
        const config = {
            name,
            title: tuneConfig.title || name,
            icon: tuneConfig.icon || '🔧',
            action: tuneConfig.action,
            isActive: tuneConfig.isActive || (() => false),
            isDisabled: tuneConfig.isDisabled || (() => false),
            ...tuneConfig
        };

        this.blockTunes.set(name, config);
        
        // Emit block tune added event
        this.editor.emit('blockTuneAdded', { name, config });
        
        return this;
    }

    /**
     * Setup context menu
     * @param {object} contextConfig - Context menu configuration
     * @returns {MenuConfig} This instance for chaining
     */
    setupContextMenu(contextConfig = {}) {
        const config = {
            enabled: contextConfig.enabled ?? this.config.contextMenu.enabled,
            items: [...(this.config.contextMenu.items || []), ...(contextConfig.items || [])],
            ...contextConfig
        };

        this.config.contextMenu = config;
        
        // Setup context menu event handlers
        if (config.enabled) {
            this.setupContextMenuHandlers(config);
        }
        
        // Emit context menu configured event
        this.editor.emit('contextMenuConfigured', { config });
        
        return this;
    }

    /**
     * Setup context menu event handlers
     * @param {object} config - Context menu configuration
     * @private
     */
    setupContextMenuHandlers(config) {
        // Add right-click event listener to editor
        const editorElement = this.editor.getHolderElement();
        if (!editorElement) return;

        editorElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showContextMenu(event, config);
        });
    }

    /**
     * Show context menu
     * @param {Event} event - Mouse event
     * @param {object} config - Context menu configuration
     * @private
     */
    showContextMenu(event, config) {
        // Create context menu element
        const menu = document.createElement('div');
        menu.className = 'writr-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 200px;
            padding: 8px 0;
        `;

        // Add menu items
        config.items.forEach(item => {
            const menuItem = this.createContextMenuItem(item);
            menu.appendChild(menuItem);
        });

        // Add to DOM
        document.body.appendChild(menu);

        // Close menu on click outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);

        // Emit context menu shown event
        this.editor.emit('contextMenuShown', { menu, config });
    }

    /**
     * Create context menu item
     * @param {object} item - Menu item configuration
     * @returns {HTMLElement} Menu item element
     * @private
     */
    createContextMenuItem(item) {
        const menuItem = document.createElement('div');
        menuItem.className = 'writr-context-menu-item';
        menuItem.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #374151;
            transition: background-color 0.15s;
        `;

        menuItem.innerHTML = `
            <span class="menu-icon" style="margin-right: 8px;">${item.icon || '•'}</span>
            <span class="menu-title">${item.title}</span>
            ${item.shortcut ? `<span class="menu-shortcut" style="margin-left: auto; color: #9ca3af; font-size: 12px;">${item.shortcut}</span>` : ''}
        `;

        // Add hover effects
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = '#f3f4f6';
        });

        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = 'transparent';
        });

        // Add click handler
        menuItem.addEventListener('click', (event) => {
            event.preventDefault();
            
            if (typeof item.action === 'function') {
                item.action(event, this.editor);
            }
            
            // Close menu
            const menu = menuItem.closest('.writr-context-menu');
            if (menu) {
                menu.remove();
            }
        });

        return menuItem;
    }

    /**
     * Setup default menus and actions
     * @private
     */
    setupDefaultMenus() {
        // Default block tunes
        this.addBlockTune('moveUp', {
            title: 'Move Up',
            icon: '⬆️',
            action: (block, editor) => {
                const currentIndex = editor.blocks.getCurrentBlockIndex();
                if (currentIndex > 0) {
                    editor.blocks.move(currentIndex, currentIndex - 1);
                }
            }
        });

        this.addBlockTune('moveDown', {
            title: 'Move Down',
            icon: '⬇️',
            action: (block, editor) => {
                const currentIndex = editor.blocks.getCurrentBlockIndex();
                const total = editor.blocks.getBlocksCount();
                if (currentIndex < total - 1) {
                    editor.blocks.move(currentIndex, currentIndex + 1);
                }
            }
        });

        this.addBlockTune('delete', {
            title: 'Delete',
            icon: '🗑️',
            action: (block, editor) => {
                const currentIndex = editor.blocks.getCurrentBlockIndex();
                if (currentIndex >= 0) {
                    editor.blocks.delete(currentIndex);
                }
            }
        });

        // Default context menu items
        this.setupContextMenu({
            items: [
                {
                    title: 'Cut',
                    icon: '✂️',
                    shortcut: 'Ctrl+X',
                    action: () => document.execCommand('cut')
                },
                {
                    title: 'Copy',
                    icon: '📋',
                    shortcut: 'Ctrl+C',
                    action: () => document.execCommand('copy')
                },
                {
                    title: 'Paste',
                    icon: '📄',
                    shortcut: 'Ctrl+V',
                    action: () => document.execCommand('paste')
                },
                {
                    title: 'Select All',
                    icon: '🔘',
                    shortcut: 'Ctrl+A',
                    action: () => document.execCommand('selectAll')
                }
            ]
        });
    }

    /**
     * Register default keyboard shortcuts
     * @private
     */
    registerDefaultShortcuts() {
        // Text formatting shortcuts
        this.addShortcut('CMD+B', 'bold', { description: 'Bold text' });
        this.addShortcut('CMD+I', 'italic', { description: 'Italic text' });
        this.addShortcut('CMD+U', 'underline', { description: 'Underline text' });
        this.addShortcut('CMD+K', 'link', { description: 'Add link' });
        
        // Block shortcuts
        this.addShortcut('CMD+SHIFT+1', 'header1', { description: 'Header 1' });
        this.addShortcut('CMD+SHIFT+2', 'header2', { description: 'Header 2' });
        this.addShortcut('CMD+SHIFT+3', 'header3', { description: 'Header 3' });
        this.addShortcut('CMD+SHIFT+L', 'list', { description: 'List' });
        this.addShortcut('CMD+SHIFT+Q', 'quote', { description: 'Quote' });
        this.addShortcut('CMD+SHIFT+C', 'code', { description: 'Code block' });
        
        // Editor shortcuts
        this.addShortcut('CMD+S', 'save', { description: 'Save document' });
        this.addShortcut('CMD+Z', 'undo', { description: 'Undo' });
        this.addShortcut('CMD+SHIFT+Z', 'redo', { description: 'Redo' });
        this.addShortcut('CMD+A', 'selectAll', { description: 'Select all' });
        
        // Block manipulation
        this.addShortcut('CMD+SHIFT+D', 'duplicate', { description: 'Duplicate block' });
        this.addShortcut('CMD+SHIFT+BACKSPACE', 'deleteBlock', { description: 'Delete block' });
        this.addShortcut('CMD+UP', 'moveBlockUp', { description: 'Move block up' });
        this.addShortcut('CMD+DOWN', 'moveBlockDown', { description: 'Move block down' });
    }

    /**
     * Merge configuration objects
     * @param {object} target - Target configuration
     * @param {object} source - Source configuration
     * @returns {object} Merged configuration
     * @private
     */
    mergeConfig(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeConfig(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Get current menu configuration
     * @returns {object} Current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Get all registered shortcuts
     * @returns {Map} Map of shortcuts
     */
    getShortcuts() {
        return new Map(this.shortcuts);
    }

    /**
     * Get all custom actions
     * @returns {Map} Map of custom actions
     */
    getCustomActions() {
        return new Map(this.customActions);
    }

    /**
     * Get all block tunes
     * @returns {Map} Map of block tunes
     */
    getBlockTunes() {
        return new Map(this.blockTunes);
    }

    /**
     * Export menu configuration for EditorJS
     * @returns {object} EditorJS-compatible configuration
     */
    exportForEditorJS() {
        return {
            toolbar: this.config.toolbar,
            blockTunes: Array.from(this.blockTunes.values()),
            inlineToolbar: this.config.inlineToolbar.tools,
            shortcuts: Object.fromEntries(this.shortcuts),
            contextMenu: this.config.contextMenu
        };
    }
}
