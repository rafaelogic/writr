/**
 * Code Tool for Writr Editor
 * 
 * A modular tool for displaying code blocks with syntax highlighting
 * Follows EditorJS Block Tool API
 */

export class CodeTool {
    static get toolbox() {
        return {
            title: 'Code',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M3.177 6.852c.205.253.347.572.427.954.078.372.117.844.117 1.417 0 .418.01.783.03 1.096.02.312.04.635.06.97.017.335.01.7-.02 1.096-.028.397-.067.73-.117 1.004-.05.265-.22.4-.51.4-.29 0-.46-.135-.51-.4-.05-.274-.089-.607-.117-1.004-.03-.397-.037-.761-.02-1.096.02-.335.04-.658.06-.97.02-.313.03-.678.03-1.096 0-.573-.039-1.045-.117-1.417-.08-.382-.222-.701-.427-.954C2.173 6.594 2 6.328 2 6c0-.328.173-.594.177-.852.205-.253.347-.572.427-.954.078-.372.117-.844.117-1.417 0-.418-.01-.783-.03-1.096-.02-.312-.04-.635-.06-.97-.017-.335-.01-.7.02-1.096.028-.397.067-.73.117-1.004.05-.265.22-.4.51-.4.29 0 .46.135.51.4.05.274.089.607.117 1.004.03.397.037.761.02 1.096-.02.335-.04.658-.06.97-.02.313-.03.678-.03 1.096 0 .573.039 1.045.117 1.417.08.382.222.701.427.954z"/><path d="M10.822 6.852c-.205.253-.347.572-.427.954-.078.372-.117.844-.117 1.417 0 .418-.01.783-.03 1.096-.02.312-.04.635-.06.97-.017.335-.01.7.02 1.096.028.397.067.73.117 1.004.05.265.22.4.51.4.29 0 .46-.135.51-.4.05-.274.089-.607.117-1.004.03-.397.037-.761.02-1.096-.02-.335-.04-.658-.06-.97-.02-.313-.03-.678-.03-1.096 0-.573.039-1.045.117-1.417.08-.382.222-.701.427-.954.004-.258.177-.524.177-.852 0-.328-.173-.594-.177-.852-.205-.253-.347-.572-.427-.954-.078-.372-.117-.844-.117-1.417 0-.418.01-.783.03-1.096.02-.312.04-.635.06-.97.017-.335.01-.7-.02-1.096-.028-.397-.067-.73-.117-1.004-.05-.265-.22-.4-.51-.4-.29 0-.46.135-.51.4-.05.274-.089.607-.117 1.004-.03.397-.037.761-.02 1.096.02.335.04.658.06.97.02.313.03.678.03 1.096 0 .573-.039 1.045-.117 1.417-.08.382-.222.701-.427.954z"/></svg>',
            class: 'writr-code-tool'
        };
    }

    static get enableLineBreaks() {
        return true;
    }

    static get sanitize() {
        return {
            code: false // Don't sanitize code content
        };
    }

    static get isReadOnlySupported() {
        return true;
    }

    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.config = config || {};
        this.readOnly = readOnly;
        
        // Default data
        this.data = {
            code: data.code || '',
            language: data.language || 'javascript',
            ...data
        };

        // Language options
        this.languages = [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'php', label: 'PHP' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' },
            { value: 'cpp', label: 'C++' },
            { value: 'csharp', label: 'C#' },
            { value: 'html', label: 'HTML' },
            { value: 'css', label: 'CSS' },
            { value: 'json', label: 'JSON' },
            { value: 'xml', label: 'XML' },
            { value: 'sql', label: 'SQL' },
            { value: 'bash', label: 'Bash' },
            { value: 'text', label: 'Plain Text' }
        ];

        this.CSS = {
            wrapper: 'writr-code-tool',
            textarea: 'writr-code-tool__textarea',
            language: 'writr-code-tool__language',
            languageSelect: 'writr-code-tool__language-select',
            placeholder: 'writr-code-tool__placeholder'
        };
    }

    /**
     * Render the tool's main UI
     */
    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add(this.CSS.wrapper);

        // Language selector
        const languageWrapper = document.createElement('div');
        languageWrapper.classList.add(this.CSS.language);

        const languageSelect = document.createElement('select');
        languageSelect.classList.add(this.CSS.languageSelect);
        
        this.languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.value;
            option.textContent = lang.label;
            option.selected = lang.value === this.data.language;
            languageSelect.appendChild(option);
        });

        languageSelect.addEventListener('change', (e) => {
            this.data.language = e.target.value;
            this.api.blocks.getBlockByIndex(this.api.blocks.getCurrentBlockIndex()).holder.dataset.language = this.data.language;
        });

        languageWrapper.appendChild(languageSelect);

        // Code textarea
        const textarea = document.createElement('textarea');
        textarea.classList.add(this.CSS.textarea);
        textarea.placeholder = 'Enter your code here...';
        textarea.value = this.data.code;
        textarea.disabled = this.readOnly;

        // Auto-resize textarea
        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(100, textarea.scrollHeight) + 'px';
        };

        textarea.addEventListener('input', (e) => {
            this.data.code = e.target.value;
            autoResize();
        });

        textarea.addEventListener('keydown', (e) => {
            // Handle tab key
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const spaces = '    '; // 4 spaces
                
                textarea.value = textarea.value.substring(0, start) + spaces + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
                
                this.data.code = textarea.value;
            }
        });

        // Initial resize
        setTimeout(autoResize, 0);

        wrapper.appendChild(languageWrapper);
        wrapper.appendChild(textarea);

        this.textarea = textarea;

        return wrapper;
    }

    /**
     * Save tool data
     */
    save() {
        return {
            code: this.data.code,
            language: this.data.language
        };
    }

    /**
     * Tool settings menu
     */
    renderSettings() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="writr-settings-item">
                <div class="writr-settings-label">Copy Code</div>
                <div class="writr-settings-button" data-action="copy">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
                    </svg>
                </div>
            </div>
            <div class="writr-settings-item">
                <div class="writr-settings-label">Format Code</div>
                <div class="writr-settings-button" data-action="format">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                </div>
            </div>
        `;

        wrapper.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            
            if (action === 'copy') {
                this.copyCode();
            } else if (action === 'format') {
                this.formatCode();
            }
        });

        return wrapper;
    }

    /**
     * Copy code to clipboard
     */
    copyCode() {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(this.data.code);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.data.code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        // Show feedback
        this.api.notifier.show({
            message: 'Code copied to clipboard',
            style: 'success'
        });
    }

    /**
     * Format code (basic indentation)
     */
    formatCode() {
        let formatted = this.data.code;
        
        // Basic formatting for common languages
        if (['javascript', 'typescript', 'php', 'java', 'csharp', 'css'].includes(this.data.language)) {
            // Simple bracket-based indentation
            const lines = formatted.split('\n');
            let indentLevel = 0;
            const indentChar = '    ';
            
            formatted = lines.map(line => {
                const trimmed = line.trim();
                
                if (trimmed.includes('}') || trimmed.includes(']') || trimmed.includes(')')) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }
                
                const indentedLine = indentChar.repeat(indentLevel) + trimmed;
                
                if (trimmed.includes('{') || trimmed.includes('[') || trimmed.includes('(')) {
                    indentLevel++;
                }
                
                return indentedLine;
            }).join('\n');
        }
        
        this.data.code = formatted;
        this.textarea.value = formatted;
        
        // Trigger input event to resize textarea
        this.textarea.dispatchEvent(new Event('input'));
    }

    /**
     * Validate tool data
     */
    validate(savedData) {
        return savedData.code !== undefined;
    }

    /**
     * On paste handler
     */
    onPaste(event) {
        const text = (event.clipboardData || window.clipboardData).getData('text');
        
        if (text) {
            this.data.code = text;
            return this.render();
        }
    }
}
