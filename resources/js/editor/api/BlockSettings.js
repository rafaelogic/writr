/**
 * BlockSettings - Implementation of EditorJS Block Settings
 * 
 * Provides block-level configuration and settings:
 * - Custom settings panel for each block
 * - Block-specific actions and options
 * - Settings persistence and validation
 * - Integration with block tools
 * 
 * @see https://editorjs.io/making-a-block-settings/
 */

export class BlockSettings {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.isEnabled = true;
        this.settings = new Map();
        this.panels = new Map();
        this.currentBlock = null;
        this.currentPanel = null;
        
        // Default block settings
        this.defaultSettings = {
            paragraph: {
                name: 'paragraph',
                icon: '¶',
                title: 'Paragraph Settings',
                settings: [
                    {
                        name: 'alignment',
                        icon: '⬅️',
                        label: 'Text Alignment',
                        type: 'select',
                        options: [
                            { value: 'left', label: 'Left' },
                            { value: 'center', label: 'Center' },
                            { value: 'right', label: 'Right' },
                            { value: 'justify', label: 'Justify' }
                        ],
                        default: 'left'
                    },
                    {
                        name: 'indent',
                        icon: '→',
                        label: 'Indent',
                        type: 'toggle',
                        default: false
                    }
                ]
            },
            
            header: {
                name: 'header',
                icon: 'H',
                title: 'Header Settings',
                settings: [
                    {
                        name: 'level',
                        icon: '#',
                        label: 'Header Level',
                        type: 'select',
                        options: [
                            { value: 1, label: 'H1' },
                            { value: 2, label: 'H2' },
                            { value: 3, label: 'H3' },
                            { value: 4, label: 'H4' },
                            { value: 5, label: 'H5' },
                            { value: 6, label: 'H6' }
                        ],
                        default: 2
                    },
                    {
                        name: 'anchor',
                        icon: '🔗',
                        label: 'Auto Anchor',
                        type: 'toggle',
                        default: false
                    }
                ]
            },
            
            list: {
                name: 'list',
                icon: '📝',
                title: 'List Settings',
                settings: [
                    {
                        name: 'style',
                        icon: '•',
                        label: 'List Style',
                        type: 'select',
                        options: [
                            { value: 'unordered', label: 'Unordered' },
                            { value: 'ordered', label: 'Ordered' }
                        ],
                        default: 'unordered'
                    },
                    {
                        name: 'compact',
                        icon: '⬇️',
                        label: 'Compact Mode',
                        type: 'toggle',
                        default: false
                    }
                ]
            },
            
            quote: {
                name: 'quote',
                icon: '"',
                title: 'Quote Settings',
                settings: [
                    {
                        name: 'alignment',
                        icon: '⬅️',
                        label: 'Quote Alignment',
                        type: 'select',
                        options: [
                            { value: 'left', label: 'Left' },
                            { value: 'center', label: 'Center' }
                        ],
                        default: 'left'
                    },
                    {
                        name: 'citation',
                        icon: '©',
                        label: 'Show Citation',
                        type: 'toggle',
                        default: true
                    }
                ]
            },
            
            code: {
                name: 'code',
                icon: '</>', 
                title: 'Code Settings',
                settings: [
                    {
                        name: 'language',
                        icon: '🗣️',
                        label: 'Language',
                        type: 'select',
                        options: [
                            { value: 'javascript', label: 'JavaScript' },
                            { value: 'typescript', label: 'TypeScript' },
                            { value: 'html', label: 'HTML' },
                            { value: 'css', label: 'CSS' },
                            { value: 'php', label: 'PHP' },
                            { value: 'python', label: 'Python' },
                            { value: 'json', label: 'JSON' },
                            { value: 'bash', label: 'Bash' }
                        ],
                        default: 'javascript'
                    },
                    {
                        name: 'lineNumbers',
                        icon: '#️⃣',
                        label: 'Line Numbers',
                        type: 'toggle',
                        default: true
                    },
                    {
                        name: 'theme',
                        icon: '🎨',
                        label: 'Theme',
                        type: 'select',
                        options: [
                            { value: 'light', label: 'Light' },
                            { value: 'dark', label: 'Dark' }
                        ],
                        default: 'light'
                    }
                ]
            },
            
            image: {
                name: 'image',
                icon: '🖼️',
                title: 'Image Settings',
                settings: [
                    {
                        name: 'withBorder',
                        icon: '🖼️',
                        label: 'With Border',
                        type: 'toggle',
                        default: false
                    },
                    {
                        name: 'withBackground',
                        icon: '🎨',
                        label: 'With Background',
                        type: 'toggle',
                        default: false
                    },
                    {
                        name: 'stretched',
                        icon: '↔️',
                        label: 'Stretched',
                        type: 'toggle',
                        default: false
                    }
                ]
            }
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.addBlockSettings = this.addBlockSettings.bind(this);
        this.removeBlockSettings = this.removeBlockSettings.bind(this);
        this.showSettings = this.showSettings.bind(this);
        this.hideSettings = this.hideSettings.bind(this);
        this.handleBlockSelection = this.handleBlockSelection.bind(this);
    }

    /**
     * Initialize block settings
     * @param {object} config - Block settings configuration
     * @returns {BlockSettings} This instance for chaining
     */
    init(config = {}) {
        this.config = {
            enabled: config.enabled !== false,
            blocks: config.blocks || Object.keys(this.defaultSettings),
            customSettings: config.customSettings || {},
            autoShow: config.autoShow !== false,
            position: config.position || 'right',
            ...config
        };
        
        if (this.config.enabled) {
            this.setupSettings();
            this.setupEventHandlers();
        }
        
        return this;
    }

    /**
     * Setup block settings
     * @private
     */
    setupSettings() {
        this.settings.clear();
        
        // Register default settings
        for (const [blockType, settingsConfig] of Object.entries(this.defaultSettings)) {
            if (this.config.blocks.includes(blockType)) {
                this.addBlockSettings(blockType, settingsConfig);
            }
        }
        
        // Register custom settings
        for (const [blockType, settingsConfig] of Object.entries(this.config.customSettings)) {
            this.addBlockSettings(blockType, settingsConfig);
        }
    }

    /**
     * Setup event handlers for block settings
     * @private
     */
    setupEventHandlers() {
        // Listen for block selection changes
        this.editor.on('block-clicked', this.handleBlockSelection);
        this.editor.on('block-selected', this.handleBlockSelection);
        
        // Listen for block changes
        this.editor.on('block-changed', (data) => {
            if (this.currentPanel && this.currentBlock) {
                this.updateSettingsPanel();
            }
        });
        
        // Hide settings on click outside
        document.addEventListener('click', (event) => {
            if (this.currentPanel && !this.currentPanel.contains(event.target)) {
                this.hideSettings();
            }
        });
    }

    /**
     * Handle block selection
     * @param {object} data - Block selection data
     * @private
     */
    handleBlockSelection(data) {
        if (!this.isEnabled || !this.config.autoShow) return;
        
        const block = data.block || this.editor.blocks.getBlockByIndex(data.index);
        
        if (block && this.settings.has(block.name)) {
            this.currentBlock = block;
            this.showSettings(block);
        } else {
            this.hideSettings();
        }
    }

    /**
     * Add block settings configuration
     * @param {string} blockType - Block type name
     * @param {object} settingsConfig - Settings configuration
     * @returns {BlockSettings} This instance for chaining
     */
    addBlockSettings(blockType, settingsConfig) {
        if (!settingsConfig.settings || !Array.isArray(settingsConfig.settings)) {
            throw new Error('Settings configuration must have a settings array');
        }
        
        this.settings.set(blockType, {
            name: settingsConfig.name || blockType,
            icon: settingsConfig.icon || '⚙️',
            title: settingsConfig.title || `${blockType} Settings`,
            settings: settingsConfig.settings,
            ...settingsConfig
        });
        
        return this;
    }

    /**
     * Remove block settings
     * @param {string} blockType - Block type to remove settings for
     * @returns {BlockSettings} This instance for chaining
     */
    removeBlockSettings(blockType) {
        this.settings.delete(blockType);
        
        // Hide panel if it was for this block type
        if (this.currentBlock && this.currentBlock.name === blockType) {
            this.hideSettings();
        }
        
        return this;
    }

    /**
     * Show settings panel for block
     * @param {object} block - Block instance
     * @returns {boolean} Success status
     */
    showSettings(block) {
        if (!block || !this.settings.has(block.name)) {
            return false;
        }
        
        // Hide current panel if exists
        this.hideSettings();
        
        // Create and show new panel
        this.currentBlock = block;
        this.currentPanel = this.createSettingsPanel(block);
        
        // Position and show panel
        this.positionPanel(this.currentPanel, block);
        document.body.appendChild(this.currentPanel);
        
        // Emit settings shown event
        this.editor.emit('blockSettingsShown', { block, panel: this.currentPanel });
        
        return true;
    }

    /**
     * Hide settings panel
     * @returns {boolean} Success status
     */
    hideSettings() {
        if (!this.currentPanel) return false;
        
        // Remove panel from DOM
        if (this.currentPanel.parentNode) {
            this.currentPanel.parentNode.removeChild(this.currentPanel);
        }
        
        // Emit settings hidden event
        this.editor.emit('blockSettingsHidden', { block: this.currentBlock });
        
        // Clear references
        this.currentPanel = null;
        this.currentBlock = null;
        
        return true;
    }

    /**
     * Create settings panel for block
     * @param {object} block - Block instance
     * @returns {HTMLElement} Settings panel element
     * @private
     */
    createSettingsPanel(block) {
        const settingsConfig = this.settings.get(block.name);
        const panel = document.createElement('div');
        
        panel.className = 'writr-block-settings-panel';
        panel.style.cssText = `
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            padding: 16px;
            min-width: 250px;
            max-width: 350px;
        `;
        
        // Create header
        const header = this.createPanelHeader(settingsConfig);
        panel.appendChild(header);
        
        // Create settings controls
        const controls = this.createSettingsControls(block, settingsConfig);
        panel.appendChild(controls);
        
        // Create actions
        const actions = this.createPanelActions(block);
        panel.appendChild(actions);
        
        return panel;
    }

    /**
     * Create panel header
     * @param {object} settingsConfig - Settings configuration
     * @returns {HTMLElement} Header element
     * @private
     */
    createPanelHeader(settingsConfig) {
        const header = document.createElement('div');
        header.className = 'writr-settings-header';
        header.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
        `;
        
        const icon = document.createElement('span');
        icon.textContent = settingsConfig.icon;
        icon.style.cssText = 'margin-right: 8px; font-size: 16px;';
        
        const title = document.createElement('h3');
        title.textContent = settingsConfig.title;
        title.style.cssText = 'margin: 0; font-size: 14px; font-weight: 600; color: #374151;';
        
        header.appendChild(icon);
        header.appendChild(title);
        
        return header;
    }

    /**
     * Create settings controls
     * @param {object} block - Block instance
     * @param {object} settingsConfig - Settings configuration
     * @returns {HTMLElement} Controls container
     * @private
     */
    createSettingsControls(block, settingsConfig) {
        const container = document.createElement('div');
        container.className = 'writr-settings-controls';
        
        for (const setting of settingsConfig.settings) {
            const control = this.createSettingControl(block, setting);
            container.appendChild(control);
        }
        
        return container;
    }

    /**
     * Create individual setting control
     * @param {object} block - Block instance
     * @param {object} setting - Setting configuration
     * @returns {HTMLElement} Control element
     * @private
     */
    createSettingControl(block, setting) {
        const wrapper = document.createElement('div');
        wrapper.className = 'writr-setting-control';
        wrapper.style.cssText = 'margin-bottom: 12px;';
        
        // Create label
        const label = document.createElement('label');
        label.style.cssText = `
            display: flex;
            align-items: center;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
        `;
        
        if (setting.icon) {
            const icon = document.createElement('span');
            icon.textContent = setting.icon;
            icon.style.cssText = 'margin-right: 6px;';
            label.appendChild(icon);
        }
        
        const labelText = document.createElement('span');
        labelText.textContent = setting.label;
        label.appendChild(labelText);
        
        wrapper.appendChild(label);
        
        // Create control based on type
        const control = this.createControlInput(block, setting);
        wrapper.appendChild(control);
        
        return wrapper;
    }

    /**
     * Create control input based on setting type
     * @param {object} block - Block instance
     * @param {object} setting - Setting configuration
     * @returns {HTMLElement} Input element
     * @private
     */
    createControlInput(block, setting) {
        const currentValue = this.getBlockSettingValue(block, setting.name) || setting.default;
        
        switch (setting.type) {
            case 'select':
                return this.createSelectInput(block, setting, currentValue);
            
            case 'toggle':
                return this.createToggleInput(block, setting, currentValue);
            
            case 'text':
                return this.createTextInput(block, setting, currentValue);
            
            case 'number':
                return this.createNumberInput(block, setting, currentValue);
            
            case 'color':
                return this.createColorInput(block, setting, currentValue);
            
            default:
                return this.createTextInput(block, setting, currentValue);
        }
    }

    /**
     * Create select input
     * @param {object} block - Block instance
     * @param {object} setting - Setting configuration
     * @param {*} currentValue - Current value
     * @returns {HTMLElement} Select element
     * @private
     */
    createSelectInput(block, setting, currentValue) {
        const select = document.createElement('select');
        select.style.cssText = `
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
            background: white;
        `;
        
        for (const option of setting.options) {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            optionElement.selected = option.value === currentValue;
            select.appendChild(optionElement);
        }
        
        select.addEventListener('change', () => {
            this.setBlockSettingValue(block, setting.name, select.value);
        });
        
        return select;
    }

    /**
     * Create toggle input
     * @param {object} block - Block instance
     * @param {object} setting - Setting configuration
     * @param {*} currentValue - Current value
     * @returns {HTMLElement} Toggle element
     * @private
     */
    createToggleInput(block, setting, currentValue) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; align-items: center;';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!currentValue;
        checkbox.style.cssText = 'margin-right: 8px;';
        
        const toggleLabel = document.createElement('span');
        toggleLabel.textContent = currentValue ? 'Enabled' : 'Disabled';
        toggleLabel.style.cssText = 'font-size: 12px; color: #6b7280;';
        
        checkbox.addEventListener('change', () => {
            const newValue = checkbox.checked;
            toggleLabel.textContent = newValue ? 'Enabled' : 'Disabled';
            this.setBlockSettingValue(block, setting.name, newValue);
        });
        
        wrapper.appendChild(checkbox);
        wrapper.appendChild(toggleLabel);
        
        return wrapper;
    }

    /**
     * Create text input
     * @param {object} block - Block instance
     * @param {object} setting - Setting configuration
     * @param {*} currentValue - Current value
     * @returns {HTMLElement} Text input element
     * @private
     */
    createTextInput(block, setting, currentValue) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue || '';
        input.style.cssText = `
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
        `;
        
        input.addEventListener('input', () => {
            this.setBlockSettingValue(block, setting.name, input.value);
        });
        
        return input;
    }

    /**
     * Create number input
     * @param {object} block - Block instance
     * @param {object} setting - Setting configuration
     * @param {*} currentValue - Current value
     * @returns {HTMLElement} Number input element
     * @private
     */
    createNumberInput(block, setting, currentValue) {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = currentValue || '';
        input.style.cssText = `
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
        `;
        
        if (setting.min !== undefined) input.min = setting.min;
        if (setting.max !== undefined) input.max = setting.max;
        if (setting.step !== undefined) input.step = setting.step;
        
        input.addEventListener('input', () => {
            const value = parseFloat(input.value);
            this.setBlockSettingValue(block, setting.name, isNaN(value) ? null : value);
        });
        
        return input;
    }

    /**
     * Create color input
     * @param {object} block - Block instance
     * @param {object} setting - Setting configuration
     * @param {*} currentValue - Current value
     * @returns {HTMLElement} Color input element
     * @private
     */
    createColorInput(block, setting, currentValue) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = currentValue || '#000000';
        input.style.cssText = `
            width: 100%;
            height: 32px;
            padding: 2px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            cursor: pointer;
        `;
        
        input.addEventListener('change', () => {
            this.setBlockSettingValue(block, setting.name, input.value);
        });
        
        return input;
    }

    /**
     * Create panel actions
     * @param {object} block - Block instance
     * @returns {HTMLElement} Actions container
     * @private
     */
    createPanelActions(block) {
        const actions = document.createElement('div');
        actions.className = 'writr-settings-actions';
        actions.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
        `;
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: white;
            color: #374151;
            font-size: 12px;
            cursor: pointer;
        `;
        
        closeButton.addEventListener('click', () => {
            this.hideSettings();
        });
        
        actions.appendChild(closeButton);
        
        return actions;
    }

    /**
     * Position panel relative to block
     * @param {HTMLElement} panel - Panel element
     * @param {object} block - Block instance
     * @private
     */
    positionPanel(panel, block) {
        // Get block element position
        const blockElement = block.holder || block.element;
        if (!blockElement) return;
        
        const blockRect = blockElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Position based on configuration
        let left, top;
        
        switch (this.config.position) {
            case 'right':
                left = blockRect.right + scrollLeft + 10;
                top = blockRect.top + scrollTop;
                break;
            
            case 'left':
                left = blockRect.left + scrollLeft - 260; // Panel width
                top = blockRect.top + scrollTop;
                break;
            
            case 'bottom':
                left = blockRect.left + scrollLeft;
                top = blockRect.bottom + scrollTop + 10;
                break;
            
            default:
                left = blockRect.right + scrollLeft + 10;
                top = blockRect.top + scrollTop;
        }
        
        // Ensure panel stays within viewport
        const panelRect = panel.getBoundingClientRect();
        const maxLeft = window.innerWidth - panelRect.width - 10;
        const maxTop = window.innerHeight - panelRect.height - 10;
        
        panel.style.left = `${Math.max(10, Math.min(left, maxLeft))}px`;
        panel.style.top = `${Math.max(10, Math.min(top, maxTop))}px`;
    }

    /**
     * Get block setting value
     * @param {object} block - Block instance
     * @param {string} settingName - Setting name
     * @returns {*} Setting value
     * @private
     */
    getBlockSettingValue(block, settingName) {
        if (!block || !block.data) return null;
        
        // Check if block has settings property
        if (block.data.settings && block.data.settings[settingName] !== undefined) {
            return block.data.settings[settingName];
        }
        
        // Check direct property
        if (block.data[settingName] !== undefined) {
            return block.data[settingName];
        }
        
        return null;
    }

    /**
     * Set block setting value
     * @param {object} block - Block instance
     * @param {string} settingName - Setting name
     * @param {*} value - Setting value
     * @private
     */
    setBlockSettingValue(block, settingName, value) {
        if (!block || !block.data) return;
        
        // Initialize settings object if it doesn't exist
        if (!block.data.settings) {
            block.data.settings = {};
        }
        
        // Set the setting value
        block.data.settings[settingName] = value;
        
        // Trigger block update
        if (typeof block.save === 'function') {
            block.save();
        }
        
        // Emit setting changed event
        this.editor.emit('blockSettingChanged', {
            block,
            setting: settingName,
            value,
            data: block.data
        });
    }

    /**
     * Update settings panel with current block data
     * @private
     */
    updateSettingsPanel() {
        if (!this.currentPanel || !this.currentBlock) return;
        
        // Re-create the panel with updated data
        const newPanel = this.createSettingsPanel(this.currentBlock);
        
        // Replace current panel
        if (this.currentPanel.parentNode) {
            this.currentPanel.parentNode.replaceChild(newPanel, this.currentPanel);
        }
        
        this.currentPanel = newPanel;
    }

    /**
     * Enable block settings
     * @returns {BlockSettings} This instance for chaining
     */
    enable() {
        this.isEnabled = true;
        return this;
    }

    /**
     * Disable block settings
     * @returns {BlockSettings} This instance for chaining
     */
    disable() {
        this.isEnabled = false;
        this.hideSettings();
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
     * Get all registered settings
     * @returns {Map} Map of registered settings
     */
    getSettings() {
        return new Map(this.settings);
    }

    /**
     * Check if settings panel is currently visible
     * @returns {boolean} Visibility status
     */
    isSettingsVisible() {
        return !!this.currentPanel;
    }

    /**
     * Get current block
     * @returns {object|null} Current block or null
     */
    getCurrentBlock() {
        return this.currentBlock;
    }

    /**
     * Destroy block settings
     */
    destroy() {
        // Remove event listeners
        this.editor.off('block-clicked', this.handleBlockSelection);
        this.editor.off('block-selected', this.handleBlockSelection);
        
        // Hide settings panel
        this.hideSettings();
        
        // Clear references
        this.settings.clear();
        this.panels.clear();
        this.currentBlock = null;
        this.currentPanel = null;
        this.isEnabled = false;
        
        // Emit destroyed event
        this.editor.emit('blockSettingsDestroyed');
    }
}
