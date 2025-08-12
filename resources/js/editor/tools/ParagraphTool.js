/**
 * ParagraphTool - Enhanced paragraph tool for WritrEditor
 * 
 * Following EditorJS Block Tool API:
 * https://editorjs.io/tools-api#block-tools-api
 */
export class ParagraphTool {
    /**
     * Tool toolbox configuration
     * This will be displayed in the editor toolbox
     */
    static get toolbox() {
        return {
            icon: `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.714 5.143h10.572c.473 0 .857-.384.857-.857V2.714c0-.473-.384-.857-.857-.857H1.714c-.473 0-.857.384-.857.857v1.572c0 .473.384.857.857.857zM1.714 12h10.572c.473 0 .857-.384.857-.857v-1.572c0-.473-.384-.857-.857-.857H1.714c-.473 0-.857.384-.857.857v1.572c0 .473.384.857.857.857z"/>
            </svg>`,
            title: 'Paragraph',
            description: 'Add a paragraph text block'
        };
    }

    /**
     * Tool configuration
     */
    static get config() {
        return {
            placeholder: 'Start writing...',
            preserveBlank: false
        };
    }

    /**
     * Tool constructor
     * @param {object} options - Tool options
     * @param {object} options.data - Previously saved data
     * @param {object} options.config - Tool config
     * @param {object} options.api - Editor.js API
     * @param {boolean} options.readOnly - Read-only mode
     */
    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;
        this.config = { ...ParagraphTool.config, ...config };
        
        this.data = {
            text: data.text || '',
            alignment: data.alignment || 'left'
        };

        this.wrapper = null;
        this.element = null;
    }

    /**
     * Create Tool's view
     * @returns {HTMLElement}
     */
    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'writr-paragraph-wrapper';

        this.element = document.createElement('div');
        this.element.className = 'writr-paragraph';
        this.element.contentEditable = !this.readOnly;
        this.element.innerHTML = this.data.text;
        
        // Set placeholder
        if (!this.data.text) {
            this.element.setAttribute('data-placeholder', this.config.placeholder);
        }

        // Set alignment
        this.element.style.textAlign = this.data.alignment;

        // Ensure element is focusable and editable
        if (!this.readOnly) {
            this.element.style.outline = 'none';
            this.element.style.border = 'none';
            this.element.style.minHeight = '1.2em';
            this.element.style.cursor = 'text';
            this.element.style.userSelect = 'text';
            this.element.style.webkitUserSelect = 'text';
            this.element.style.mozUserSelect = 'text';
            
            // Add event listeners
            this.element.addEventListener('input', this.onInput.bind(this));
            this.element.addEventListener('paste', this.onPaste.bind(this));
            this.element.addEventListener('keydown', this.onKeyDown.bind(this));
            this.element.addEventListener('focus', this.onFocus.bind(this));
            this.element.addEventListener('blur', this.onBlur.bind(this));
            
            // Ensure contentEditable is always true for this element
            this.element.addEventListener('click', () => {
                if (!this.readOnly) {
                    this.element.contentEditable = true;
                    this.element.focus();
                }
            });
        }

        this.wrapper.appendChild(this.element);
        return this.wrapper;
    }

    /**
     * Handle input event
     */
    onInput() {
        this.data.text = this.element.innerHTML;
        
        // Update placeholder visibility
        if (this.element.textContent.trim() === '') {
            this.element.setAttribute('data-placeholder', this.config.placeholder);
        } else {
            this.element.removeAttribute('data-placeholder');
        }
    }

    /**
     * Handle focus event
     */
    onFocus() {
        // Ensure element remains editable on focus
        if (!this.readOnly) {
            this.element.contentEditable = true;
        }
    }

    /**
     * Handle blur event
     */
    onBlur() {
        // Save content when element loses focus
        this.data.text = this.element.innerHTML;
    }

    /**
     * Handle paste event
     */
    onPaste(event) {
        event.preventDefault();
        
        const paste = (event.clipboardData || window.clipboardData).getData('text/plain');
        const selection = window.getSelection();
        
        if (selection.getRangeAt && selection.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(paste));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        this.onInput();
    }

    /**
     * Handle key down event
     */
    onKeyDown(event) {
        // Handle Enter key
        if (event.keyCode === 13 && !event.shiftKey) {
            // If paragraph is empty, don't create new paragraph
            if (this.element.textContent.trim() === '' && !this.config.preserveBlank) {
                event.preventDefault();
                return;
            }
        }
    }

    /**
     * Extract Tool's data from the view
     * @returns {object} saved data
     */
    save() {
        return {
            text: this.element.innerHTML,
            alignment: this.data.alignment
        };
    }

    /**
     * Validate saved data
     * @param {object} savedData - Data to validate
     * @returns {boolean} validation result
     */
    validate(savedData) {
        if (!savedData.text || savedData.text.trim() === '') {
            return false;
        }
        return true;
    }

    /**
     * Sanitizer configuration
     * Defines which HTML tags and attributes are allowed
     */
    static get sanitize() {
        return {
            text: {
                br: true,
                strong: true,
                b: true,
                i: true,
                em: true,
                u: true,
                s: true,
                mark: true,
                code: true,
                a: {
                    href: true,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            }
        };
    }

    /**
     * Tool settings panel
     * @returns {Array} settings
     */
    renderSettings() {
        const settings = [
            {
                name: 'left',
                icon: `<svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M1 3h14v2H1V3zm0 4h10v2H1V7zm0 4h14v2H1v-2z"/>
                </svg>`,
                title: 'Align Left',
                toggle: true,
                isActive: this.data.alignment === 'left',
                onActivate: () => {
                    this.data.alignment = 'left';
                    this.element.style.textAlign = 'left';
                }
            },
            {
                name: 'center',
                icon: `<svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M1 3h14v2H1V3zm2 4h10v2H3V7zm-2 4h14v2H1v-2z"/>
                </svg>`,
                title: 'Align Center',
                toggle: true,
                isActive: this.data.alignment === 'center',
                onActivate: () => {
                    this.data.alignment = 'center';
                    this.element.style.textAlign = 'center';
                }
            },
            {
                name: 'right',
                icon: `<svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M1 3h14v2H1V3zm4 4h10v2H5V7zm-4 4h14v2H1v-2z"/>
                </svg>`,
                title: 'Align Right',
                toggle: true,
                isActive: this.data.alignment === 'right',
                onActivate: () => {
                    this.data.alignment = 'right';
                    this.element.style.textAlign = 'right';
                }
            }
        ];

        return settings;
    }

    /**
     * Called on Tool destroy
     * Clear any timers, close any dialogs, etc.
     */
    destroy() {
        if (this.element) {
            this.element.removeEventListener('input', this.onInput);
            this.element.removeEventListener('paste', this.onPaste);
            this.element.removeEventListener('keydown', this.onKeyDown);
            this.element.removeEventListener('focus', this.onFocus);
            this.element.removeEventListener('blur', this.onBlur);
        }
    }

    /**
     * Focus the tool element
     */
    focus() {
        if (this.element && !this.readOnly) {
            this.element.contentEditable = true;
            this.element.focus();
        }
    }

    /**
     * Check if tool can be focused
     */
    static get isFocusable() {
        return true;
    }
}

export default ParagraphTool;
