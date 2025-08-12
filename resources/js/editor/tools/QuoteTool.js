/**
 * QuoteTool - Enhanced quote tool for WritrEditor
 * 
 * Features:
 * - Styled quote blocks
 * - Author attribution
 * - Different quote styles
 * - Citation support
 * 
 * Following EditorJS Block Tool API
 */
export class QuoteTool {
    /**
     * Tool toolbox configuration
     */
    static get toolbox() {
        return {
            icon: `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7.5c0-1.5 1.2-2.7 2.7-2.7.7 0 1.4.3 1.9.8.1.1.1.3 0 .4-.5.5-1.2.8-1.9.8C4.2 6.8 3 8 3 9.5S4.2 12.2 5.7 12.2c.7 0 1.4-.3 1.9-.8.1-.1.3-.1.4 0s.1.3 0 .4c-.5.5-1.2.8-1.9.8C4.2 12.6 3 11.4 3 9.9V7.5zm4.8 0c0-1.5 1.2-2.7 2.7-2.7.7 0 1.4.3 1.9.8.1.1.1.3 0 .4-.5.5-1.2.8-1.9.8-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7c.7 0 1.4-.3 1.9-.8.1-.1.3-.1.4 0s.1.3 0 .4c-.5.5-1.2.8-1.9.8-1.5 0-2.7-1.2-2.7-2.7V7.5z"/>
            </svg>`,
            title: 'Quote',
            description: 'Add a styled quote block'
        };
    }

    /**
     * Tool configuration
     */
    static get config() {
        return {
            quotePlaceholder: 'Enter a quote...',
            captionPlaceholder: 'Quote author',
            citationPlaceholder: 'Source (optional)',
            defaultStyle: 'simple'
        };
    }

    /**
     * Available quote styles
     */
    static get styles() {
        return {
            simple: {
                name: 'Simple',
                class: 'writr-quote-simple'
            },
            bordered: {
                name: 'Bordered',
                class: 'writr-quote-bordered'
            },
            highlighted: {
                name: 'Highlighted',
                class: 'writr-quote-highlighted'
            },
            modern: {
                name: 'Modern',
                class: 'writr-quote-modern'
            }
        };
    }

    /**
     * Constructor
     */
    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;
        this.config = { ...QuoteTool.config, ...config };

        this.data = {
            text: data.text || '',
            caption: data.caption || '',
            citation: data.citation || '',
            style: data.style || this.config.defaultStyle,
            alignment: data.alignment || 'left'
        };

        this.wrapper = null;
        this.quoteElement = null;
        this.captionElement = null;
        this.citationElement = null;
    }

    /**
     * Render the tool
     */
    render() {
        this.wrapper = document.createElement('blockquote');
        this.wrapper.className = `writr-quote ${QuoteTool.styles[this.data.style].class}`;
        this.wrapper.style.textAlign = this.data.alignment;

        // Quote text
        this.quoteElement = document.createElement('div');
        this.quoteElement.className = 'writr-quote-text';
        this.quoteElement.contentEditable = !this.readOnly;
        this.quoteElement.innerHTML = this.data.text;
        
        if (!this.data.text) {
            this.quoteElement.setAttribute('data-placeholder', this.config.quotePlaceholder);
        }

        this.wrapper.appendChild(this.quoteElement);

        // Quote author (caption)
        this.captionElement = document.createElement('cite');
        this.captionElement.className = 'writr-quote-caption';
        this.captionElement.contentEditable = !this.readOnly;
        this.captionElement.innerHTML = this.data.caption;
        
        if (!this.data.caption) {
            this.captionElement.setAttribute('data-placeholder', this.config.captionPlaceholder);
        }

        this.wrapper.appendChild(this.captionElement);

        // Citation/source
        this.citationElement = document.createElement('div');
        this.citationElement.className = 'writr-quote-citation';
        this.citationElement.contentEditable = !this.readOnly;
        this.citationElement.innerHTML = this.data.citation;
        
        if (!this.data.citation) {
            this.citationElement.setAttribute('data-placeholder', this.config.citationPlaceholder);
        }

        this.wrapper.appendChild(this.citationElement);

        this.attachEventListeners();

        return this.wrapper;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (this.readOnly) return;

        // Quote text events
        this.quoteElement.addEventListener('input', () => {
            this.data.text = this.quoteElement.innerHTML;
            this.updatePlaceholder(this.quoteElement, this.config.quotePlaceholder);
        });

        this.quoteElement.addEventListener('paste', this.handlePaste.bind(this));

        // Caption events
        this.captionElement.addEventListener('input', () => {
            this.data.caption = this.captionElement.innerHTML;
            this.updatePlaceholder(this.captionElement, this.config.captionPlaceholder);
        });

        // Citation events
        this.citationElement.addEventListener('input', () => {
            this.data.citation = this.citationElement.innerHTML;
            this.updatePlaceholder(this.citationElement, this.config.citationPlaceholder);
        });

        // Keyboard navigation
        this.quoteElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.captionElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.citationElement.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Handle paste events
     */
    handlePaste(event) {
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
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(event) {
        const { keyCode } = event;
        
        // Enter key behavior
        if (keyCode === 13) {
            if (event.target === this.quoteElement) {
                // Move to caption on Enter
                event.preventDefault();
                this.captionElement.focus();
            } else if (event.target === this.captionElement) {
                // Move to citation on Enter
                event.preventDefault();
                this.citationElement.focus();
            }
        }
        
        // Tab key navigation
        if (keyCode === 9) {
            event.preventDefault();
            
            if (event.target === this.quoteElement) {
                this.captionElement.focus();
            } else if (event.target === this.captionElement) {
                this.citationElement.focus();
            } else if (event.target === this.citationElement) {
                this.quoteElement.focus();
            }
        }
    }

    /**
     * Update placeholder visibility
     */
    updatePlaceholder(element, placeholder) {
        if (element.textContent.trim() === '') {
            element.setAttribute('data-placeholder', placeholder);
        } else {
            element.removeAttribute('data-placeholder');
        }
    }

    /**
     * Save tool data
     */
    save() {
        return {
            text: this.quoteElement.innerHTML,
            caption: this.captionElement.innerHTML,
            citation: this.citationElement.innerHTML,
            style: this.data.style,
            alignment: this.data.alignment
        };
    }

    /**
     * Validate data
     */
    validate(savedData) {
        return savedData.text && savedData.text.trim() !== '';
    }

    /**
     * Settings panel
     */
    renderSettings() {
        const settings = [];

        // Style settings
        Object.entries(QuoteTool.styles).forEach(([key, style]) => {
            settings.push({
                name: key,
                icon: this.getStyleIcon(key),
                title: style.name,
                toggle: true,
                isActive: this.data.style === key,
                onActivate: () => {
                    this.data.style = key;
                    this.wrapper.className = `writr-quote ${style.class}`;
                }
            });
        });

        // Alignment settings
        settings.push(
            {
                name: 'align-left',
                icon: `<svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M1 3h14v2H1V3zm0 4h10v2H1V7zm0 4h14v2H1v-2z"/>
                </svg>`,
                title: 'Align Left',
                toggle: true,
                isActive: this.data.alignment === 'left',
                onActivate: () => {
                    this.data.alignment = 'left';
                    this.wrapper.style.textAlign = 'left';
                }
            },
            {
                name: 'align-center',
                icon: `<svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M1 3h14v2H1V3zm2 4h10v2H3V7zm-2 4h14v2H1v-2z"/>
                </svg>`,
                title: 'Align Center',
                toggle: true,
                isActive: this.data.alignment === 'center',
                onActivate: () => {
                    this.data.alignment = 'center';
                    this.wrapper.style.textAlign = 'center';
                }
            },
            {
                name: 'align-right',
                icon: `<svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M1 3h14v2H1V3zm4 4h10v2H5V7zm-4 4h14v2H1v-2z"/>
                </svg>`,
                title: 'Align Right',
                toggle: true,
                isActive: this.data.alignment === 'right',
                onActivate: () => {
                    this.data.alignment = 'right';
                    this.wrapper.style.textAlign = 'right';
                }
            }
        );

        return settings;
    }

    /**
     * Get style icon
     */
    getStyleIcon(style) {
        const icons = {
            simple: `<svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M4 6h8v4H4z" stroke="currentColor" fill="none"/>
            </svg>`,
            bordered: `<svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="2" y="4" width="12" height="8" stroke="currentColor" fill="none" stroke-width="2"/>
            </svg>`,
            highlighted: `<svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="2" y="4" width="12" height="8" fill="currentColor" opacity="0.2"/>
                <path d="M2 4h12v8H2z" stroke="currentColor" fill="none"/>
            </svg>`,
            modern: `<svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="4" y="6" width="8" height="4" rx="2" fill="currentColor" opacity="0.1"/>
                <rect x="4" y="6" width="8" height="4" rx="2" stroke="currentColor" fill="none"/>
            </svg>`
        };

        return icons[style] || icons.simple;
    }

    /**
     * Sanitizer configuration
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
            },
            caption: {
                br: true,
                strong: true,
                b: true,
                i: true,
                em: true,
                u: true,
                s: true
            },
            citation: {
                br: true,
                a: {
                    href: true,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            }
        };
    }

    /**
     * Destroy
     */
    destroy() {
        // Clean up event listeners
        if (this.quoteElement) {
            this.quoteElement.removeEventListener('input', this.onInput);
            this.quoteElement.removeEventListener('paste', this.handlePaste);
            this.quoteElement.removeEventListener('keydown', this.handleKeyDown);
        }
    }
}

export default QuoteTool;
