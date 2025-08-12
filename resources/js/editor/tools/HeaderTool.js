/**
 * Header Tool for Writr Editor
 * 
 * A modular tool for creating headings (H1-H6)
 * Follows EditorJS Block Tool API
 */

export class HeaderTool {
    static get toolbox() {
        return {
            title: 'Heading',
            icon: '<svg width="11" height="14" viewBox="0 0 11 14" xmlns="http://www.w3.org/2000/svg"><path d="M7.6 8.15H2.25v4.525a1.125 1.125 0 0 1-2.25 0V1.125a1.125 1.125 0 1 1 2.25 0V5.9H7.6V1.125a1.125 1.125 0 0 1 2.25 0v11.55a1.125 1.125 0 0 1-2.25 0V8.15Z"/></svg>',
            class: 'writr-header-tool'
        };
    }

    static get enableLineBreaks() {
        return false;
    }

    static get sanitize() {
        return {
            text: {},
            level: false,
            anchor: {}
        };
    }

    static get isReadOnlySupported() {
        return true;
    }

    static get conversionConfig() {
        return {
            export: 'html',
            import: 'html'
        };
    }

    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.config = config || {};
        this.readOnly = readOnly;

        this.defaultData = {
            text: '',
            level: 2,
            anchor: ''
        };

        this.data = {
            text: data.text || this.defaultData.text,
            level: parseInt(data.level) || this.defaultData.level,
            anchor: data.anchor || this.defaultData.anchor
        };

        // Clamp level between 1-6
        this.data.level = Math.max(1, Math.min(6, this.data.level));

        this.CSS = {
            wrapper: 'writr-header-tool',
            input: 'writr-header-tool__input',
            anchor: 'writr-header-tool__anchor',
            settingsButton: 'writr-header-tool__settings-button',
            settingsButtonActive: 'writr-header-tool__settings-button--active'
        };

        this.levels = [1, 2, 3, 4, 5, 6];
    }

    /**
     * Render the tool's main UI
     */
    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add(this.CSS.wrapper);

        this.input = document.createElement('div');
        this.input.classList.add(this.CSS.input);
        this.input.contentEditable = !this.readOnly;
        this.input.innerHTML = this.data.text;
        this.input.dataset.placeholder = 'Enter heading...';

        // Set the correct heading tag
        this.updateHeadingLevel();

        // Event listeners
        this.input.addEventListener('input', () => {
            this.data.text = this.input.innerHTML;
            this.updateAnchor();
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.api.blocks.insert();
            }
        });

        this.input.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            document.execCommand('insertText', false, text);
        });

        wrapper.appendChild(this.input);

        return wrapper;
    }

    /**
     * Update heading level styling
     */
    updateHeadingLevel() {
        // Remove existing level classes
        this.levels.forEach(level => {
            this.input.classList.remove(`writr-header-tool__input--h${level}`);
        });

        // Add current level class
        this.input.classList.add(`writr-header-tool__input--h${this.data.level}`);

        // Set appropriate font size and styling
        const styles = {
            1: { fontSize: '2em', fontWeight: '700', lineHeight: '1.2' },
            2: { fontSize: '1.5em', fontWeight: '600', lineHeight: '1.3' },
            3: { fontSize: '1.25em', fontWeight: '600', lineHeight: '1.4' },
            4: { fontSize: '1.1em', fontWeight: '500', lineHeight: '1.4' },
            5: { fontSize: '1em', fontWeight: '500', lineHeight: '1.5' },
            6: { fontSize: '0.9em', fontWeight: '500', lineHeight: '1.5' }
        };

        const style = styles[this.data.level];
        Object.assign(this.input.style, style);
    }

    /**
     * Auto-generate anchor from text
     */
    updateAnchor() {
        if (this.config.autoAnchor !== false) {
            this.data.anchor = this.generateAnchor(this.data.text);
        }
    }

    /**
     * Generate URL-friendly anchor from text
     */
    generateAnchor(text) {
        return text
            .toLowerCase()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim('-'); // Remove leading/trailing hyphens
    }

    /**
     * Render settings menu
     */
    renderSettings() {
        const wrapper = document.createElement('div');

        // Header level buttons
        this.levels.forEach(level => {
            const button = this.createLevelButton(level);
            wrapper.appendChild(button);
        });

        // Anchor input (if enabled)
        if (this.config.showAnchor !== false) {
            const anchorSection = this.createAnchorSection();
            wrapper.appendChild(anchorSection);
        }

        return wrapper;
    }

    /**
     * Create level selection button
     */
    createLevelButton(level) {
        const button = document.createElement('div');
        button.classList.add(this.CSS.settingsButton);
        
        if (this.data.level === level) {
            button.classList.add(this.CSS.settingsButtonActive);
        }

        button.innerHTML = `
            <div class="writr-settings-item">
                <div class="writr-settings-label">H${level}</div>
                <div class="writr-settings-preview" style="font-size: ${2.5 - level * 0.25}em; font-weight: ${700 - level * 50};">
                    H${level}
                </div>
            </div>
        `;

        button.addEventListener('click', () => {
            this.changeLevel(level);
        });

        return button;
    }

    /**
     * Create anchor input section
     */
    createAnchorSection() {
        const section = document.createElement('div');
        section.innerHTML = `
            <div class="writr-settings-item writr-settings-item--full">
                <div class="writr-settings-label">Anchor (ID)</div>
                <input 
                    type="text" 
                    class="${this.CSS.anchor}" 
                    value="${this.data.anchor}" 
                    placeholder="auto-generated"
                    ${this.readOnly ? 'disabled' : ''}
                />
                <div class="writr-settings-hint">
                    Used for linking to this heading
                </div>
            </div>
        `;

        const anchorInput = section.querySelector(`.${this.CSS.anchor}`);
        anchorInput.addEventListener('input', (e) => {
            this.data.anchor = e.target.value;
        });

        return section;
    }

    /**
     * Change heading level
     */
    changeLevel(newLevel) {
        this.data.level = newLevel;
        this.updateHeadingLevel();

        // Update settings buttons
        const buttons = document.querySelectorAll(`.${this.CSS.settingsButton}`);
        buttons.forEach((button, index) => {
            if (index === newLevel - 1) {
                button.classList.add(this.CSS.settingsButtonActive);
            } else {
                button.classList.remove(this.CSS.settingsButtonActive);
            }
        });
    }

    /**
     * Save tool data
     */
    save() {
        return {
            text: this.data.text,
            level: this.data.level,
            anchor: this.data.anchor
        };
    }

    /**
     * Validate tool data
     */
    validate(savedData) {
        return savedData.text !== undefined && savedData.level >= 1 && savedData.level <= 6;
    }

    /**
     * Handle paste
     */
    onPaste(event) {
        const text = (event.clipboardData || window.clipboardData).getData('text');
        
        // Try to detect heading level from common markdown patterns
        const headingMatch = text.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            this.data.level = headingMatch[1].length;
            this.data.text = headingMatch[2];
            this.updateHeadingLevel();
            return this.render();
        }

        return false;
    }

    /**
     * Convert to HTML
     */
    static get exportHTML() {
        return (data) => {
            const tag = `h${data.level}`;
            const anchor = data.anchor ? ` id="${data.anchor}"` : '';
            return `<${tag}${anchor}>${data.text}</${tag}>`;
        };
    }

    /**
     * Convert from HTML
     */
    static get importHTML() {
        return (html) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            const heading = tempDiv.querySelector('h1, h2, h3, h4, h5, h6');
            if (!heading) return null;
            
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.innerHTML;
            const anchor = heading.id || '';
            
            return {
                text,
                level,
                anchor
            };
        };
    }

    /**
     * Conversion from other blocks
     */
    static get conversionConfig() {
        return {
            import: 'text',
            export: (data) => data.text
        };
    }

    /**
     * Shortcut for quick header creation
     */
    static get shortcut() {
        return 'CMD+SHIFT+H';
    }
}
