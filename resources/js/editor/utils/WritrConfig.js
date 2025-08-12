/**
 * WritrConfig - Configuration manager for WritrEditor
 * Handles all configuration options and provides defaults
 */
export class WritrConfig {
    constructor(options = {}) {
        this.options = options;
        this.defaults = this.getDefaults();
        this.config = { ...this.defaults, ...options };
    }

    /**
     * Get default configuration
     */
    getDefaults() {
        return {
            // Editor basics
            placeholder: 'Start writing or press "/" to add blocks...',
            autofocus: false,
            readOnly: false,
            minHeight: 300,
            logLevel: 'WARN',

            // Tools configuration
            tools: [
                'paragraph',
                'header', 
                'list',
                'quote',
                'code',
                'table',
                'delimiter'
            ],

            // Toolbar configuration
            toolbar: {
                shouldToolbarBeOpened: true,
                shouldToolbarBeRemoved: false,
                inlineToolbar: true,
                position: 'left'
            },

            // Sanitizer configuration
            sanitizer: {
                b: {},
                i: {},
                u: {},
                s: {},
                strong: {},
                em: {},
                span: {},
                p: {},
                br: {},
                div: {},
                mark: {},
                code: {},
                a: {
                    href: true,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            },

            // Auto-save configuration
            autosave: {
                enabled: false,
                delay: 5000
            },

            // Change detection
            onChange: null,
            onReady: null,
            onSave: null
        };
    }

    /**
     * Get configuration value
     */
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    /**
     * Set configuration value
     */
    set(key, value) {
        const keys = key.split('.');
        let current = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }

        current[keys[keys.length - 1]] = value;
        return this;
    }

    /**
     * Get full configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Get toolbar configuration
     */
    getToolbarConfig() {
        return this.get('toolbar', {});
    }

    /**
     * Get sanitizer configuration
     */
    getSanitizerConfig() {
        return this.get('sanitizer', {});
    }

    /**
     * Get tools configuration
     */
    getToolsConfig() {
        return this.get('tools', []);
    }

    /**
     * Merge with new options
     */
    merge(newOptions) {
        this.config = { ...this.config, ...newOptions };
        return this;
    }

    /**
     * Reset to defaults
     */
    reset() {
        this.config = { ...this.defaults };
        return this;
    }

    /**
     * Validate configuration
     */
    validate() {
        const errors = [];

        // Validate required fields
        if (!this.config.holder && !this.options.holder) {
            errors.push('Holder element is required');
        }

        // Validate tools array
        if (this.config.tools && !Array.isArray(this.config.tools)) {
            errors.push('Tools must be an array');
        }

        // Validate toolbar config
        const toolbar = this.config.toolbar;
        if (toolbar && typeof toolbar !== 'object') {
            errors.push('Toolbar configuration must be an object');
        }

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
        }

        return true;
    }
}
