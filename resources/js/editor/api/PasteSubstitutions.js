/**
 * PasteSubstitutions - Implementation of EditorJS Paste Substitutions
 * 
 * Handles automatic block creation from pasted content:
 * - URLs to link/embed blocks
 * - Images to image blocks
 * - Code snippets to code blocks
 * - Custom paste patterns
 * 
 * @see https://editorjs.io/paste-substitutions/
 */

export class PasteSubstitutions {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.isEnabled = true;
        this.patterns = new Map();
        this.processors = new Map();
        
        // Default paste patterns
        this.defaultPatterns = {
            // URL patterns - convert to paragraph with URL
            url: {
                pattern: /^https?:\/\/[^\s]+$/,
                processor: this.processUrl.bind(this),
                blockType: 'paragraph',
                priority: 1
            },
            
            // YouTube URLs
            youtube: {
                pattern: /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
                processor: this.processYouTube.bind(this),
                blockType: 'embed',
                priority: 2
            },
            
            // Image URLs
            image: {
                pattern: /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?$/i,
                processor: this.processImage.bind(this),
                blockType: 'image',
                priority: 3
            },
            
            // GitHub Gist URLs
            gist: {
                pattern: /^https?:\/\/gist\.github\.com\/[^\s]+$/,
                processor: this.processGist.bind(this),
                blockType: 'code',
                priority: 2
            },
            
            // CodePen URLs
            codepen: {
                pattern: /^https?:\/\/codepen\.io\/[^\s]+$/,
                processor: this.processCodePen.bind(this),
                blockType: 'embed',
                priority: 2
            },
            
            // Multi-line code
            codeBlock: {
                pattern: /^```[\s\S]*```$/,
                processor: this.processCodeBlock.bind(this),
                blockType: 'code',
                priority: 1
            },
            
            // Markdown-style links - convert to paragraph
            markdownLink: {
                pattern: /^\[([^\]]+)\]\(([^)]+)\)$/,
                processor: this.processMarkdownLink.bind(this),
                blockType: 'paragraph',
                priority: 1
            }
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.addPattern = this.addPattern.bind(this);
        this.removePattern = this.removePattern.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.processContent = this.processContent.bind(this);
    }

    /**
     * Initialize paste substitutions
     * @param {object} config - Paste substitutions configuration
     * @returns {PasteSubstitutions} This instance for chaining
     */
    init(config = {}) {
        this.config = {
            enabled: config.enabled !== false,
            patterns: config.patterns || Object.keys(this.defaultPatterns),
            customPatterns: config.customPatterns || {},
            autoConvert: config.autoConvert !== false,
            showConfirmation: config.showConfirmation || false,
            ...config
        };
        
        if (this.config.enabled) {
            this.setupPatterns();
            this.setupEventHandlers();
        }
        
        return this;
    }

    /**
     * Setup paste patterns
     * @private
     */
    setupPatterns() {
        this.patterns.clear();
        this.processors.clear();
        
        // Register default patterns
        for (const [name, patternConfig] of Object.entries(this.defaultPatterns)) {
            if (this.config.patterns.includes(name)) {
                this.addPattern(name, patternConfig);
            }
        }
        
        // Register custom patterns
        for (const [name, patternConfig] of Object.entries(this.config.customPatterns)) {
            this.addPattern(name, patternConfig);
        }
    }

    /**
     * Setup event handlers for paste substitutions
     * @private
     */
    setupEventHandlers() {
        // Listen for paste events at the document level with higher priority
        document.addEventListener('paste', this.handlePaste, true); // Use capture phase
        
        // Don't listen for EditorJS paste events to avoid conflicts
        // this.editor.on('paste', this.handlePaste);
    }

    /**
     * Handle paste event
     * @param {ClipboardEvent} event - Paste event
     * @private
     */
    async handlePaste(event) {
        if (!this.isEnabled) return;
        
        // Check if the paste is happening within the editor
        const editorElement = this.editor.getHolderElement();
        if (!editorElement || !editorElement.contains(event.target)) {
            return;
        }
        
        // Get pasted content
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text/plain');
        
        if (!pastedText || !pastedText.trim()) return;
        
        // Process the pasted content
        const result = await this.processContent(pastedText.trim());
        
        if (result) {
            // Prevent default paste behavior to avoid double blocks
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            // Small delay to ensure editor is ready
            setTimeout(async () => {
                await this.insertBlock(result);
            }, 50);
        }
    }

    /**
     * Process pasted content
     * @param {string} content - Pasted content
     * @returns {object|null} Block data or null if no match
     */
    async processContent(content) {
        // Sort patterns by priority (higher first)
        const sortedPatterns = Array.from(this.patterns.entries())
            .sort((a, b) => (b[1].priority || 0) - (a[1].priority || 0));
        
        // Try each pattern
        for (const [name, pattern] of sortedPatterns) {
            const match = content.match(pattern.pattern);
            
            if (match) {
                try {
                    // Get processor function
                    const processor = this.processors.get(name);
                    
                    if (processor) {
                        const blockData = await processor(content, match, pattern);
                        
                        if (blockData) {
                            // Show confirmation if enabled
                            if (this.config.showConfirmation) {
                                const confirmed = await this.showConfirmation(content, blockData);
                                if (!confirmed) continue;
                            }
                            
                            return {
                                type: pattern.blockType,
                                data: blockData,
                                pattern: name
                            };
                        }
                    }
                } catch (error) {
                    console.error(`Error processing paste pattern ${name}:`, error);
                    this.editor.emit('error', error);
                }
            }
        }
        
        return null;
    }

    /**
     * Show confirmation dialog
     * @param {string} content - Original content
     * @param {object} blockData - Processed block data
     * @returns {Promise<boolean>} Confirmation result
     * @private
     */
    async showConfirmation(content, blockData) {
        return new Promise((resolve) => {
            const confirmed = confirm(
                `Convert "${content}" to ${blockData.type || 'block'}?`
            );
            resolve(confirmed);
        });
    }

    /**
     * Insert processed block into editor
     * @param {object} result - Block result from processing
     * @private
     */
    async insertBlock(result) {
        try {
            // Validate block type
            const availableTools = this.editor.toolRegistry.getAvailableTools();
            
            if (result.type !== 'paragraph' && !availableTools.includes(result.type)) {
                console.warn(`Block type "${result.type}" not available, falling back to paragraph`);
                // Fallback to paragraph with the URL as text
                result = {
                    type: 'paragraph',
                    data: { text: result.data.link || result.data.source || 'Pasted content' },
                    pattern: result.pattern
                };
            }
            
            // Use Block API for proper validation and error handling
            const blockAPI = this.editor.getBlockAPI();
            await blockAPI.insert(result.type, result.data);
            
            // Emit paste substitution event
            this.editor.emit('pasteSubstitution', {
                pattern: result.pattern,
                blockType: result.type,
                data: result.data
            });
            
        } catch (error) {
            console.error('Error inserting paste substitution block:', error);
            this.editor.emit('error', error);
            
            // Fallback: try to insert as paragraph
            try {
                const blockAPI = this.editor.getBlockAPI();
                await blockAPI.insert('paragraph', { 
                    text: result.data.link || result.data.source || 'Pasted content' 
                });
            } catch (fallbackError) {
                console.error('Fallback insertion also failed:', fallbackError);
            }
        }
    }

    /**
     * Add paste pattern
     * @param {string} name - Pattern name
     * @param {object} patternConfig - Pattern configuration
     * @returns {PasteSubstitutions} This instance for chaining
     */
    addPattern(name, patternConfig) {
        if (!patternConfig.pattern || !patternConfig.processor) {
            throw new Error('Pattern must have pattern and processor properties');
        }
        
        this.patterns.set(name, {
            pattern: patternConfig.pattern,
            blockType: patternConfig.blockType || 'paragraph',
            priority: patternConfig.priority || 0,
            ...patternConfig
        });
        
        this.processors.set(name, patternConfig.processor);
        
        return this;
    }

    /**
     * Remove paste pattern
     * @param {string} name - Pattern name to remove
     * @returns {PasteSubstitutions} This instance for chaining
     */
    removePattern(name) {
        this.patterns.delete(name);
        this.processors.delete(name);
        return this;
    }

    /**
     * Process URL to paragraph block with clickable link
     * @param {string} content - Pasted content
     * @param {Array} match - Regex match results
     * @param {object} pattern - Pattern configuration
     * @returns {object} Paragraph block data with link
     * @private
     */
    async processUrl(content, match, pattern) {
        try {
            // Try to fetch page metadata for a rich link
            const metadata = await this.fetchUrlMetadata(content);
            
            if (metadata && metadata.title && metadata.title !== content) {
                // Create a rich link with title
                return {
                    text: `<a href="${content}" target="_blank">${metadata.title}</a>`
                };
            }
        } catch (error) {
            // Fallback to simple link
        }
        
        // Fallback to simple clickable URL
        return {
            text: `<a href="${content}" target="_blank">${content}</a>`
        };
    }

    /**
     * Process YouTube URL to embed block
     * @param {string} content - Pasted content
     * @param {Array} match - Regex match results
     * @param {object} pattern - Pattern configuration
     * @returns {object} Embed block data
     * @private
     */
    async processYouTube(content, match, pattern) {
        const videoId = match[3];
        
        return {
            service: 'youtube',
            source: content,
            embed: `https://www.youtube.com/embed/${videoId}`,
            width: 580,
            height: 320,
            caption: ''
        };
    }

    /**
     * Process image URL to image block
     * @param {string} content - Pasted content
     * @param {Array} match - Regex match results
     * @param {object} pattern - Pattern configuration
     * @returns {object} Image block data
     * @private
     */
    async processImage(content, match, pattern) {
        return {
            file: {
                url: content
            },
            caption: '',
            withBorder: false,
            withBackground: false,
            stretched: false
        };
    }

    /**
     * Process GitHub Gist URL to code block
     * @param {string} content - Pasted content
     * @param {Array} match - Regex match results
     * @param {object} pattern - Pattern configuration
     * @returns {object} Code block data
     * @private
     */
    async processGist(content, match, pattern) {
        try {
            // Extract Gist ID from URL
            const gistId = content.split('/').pop().split('.')[0];
            
            // Fetch Gist content (simplified)
            const gistData = await this.fetchGistContent(gistId);
            
            return {
                code: gistData.code || '// Gist content',
                language: gistData.language || 'javascript'
            };
        } catch (error) {
            return {
                code: `// GitHub Gist: ${content}`,
                language: 'javascript'
            };
        }
    }

    /**
     * Process CodePen URL to embed block
     * @param {string} content - Pasted content
     * @param {Array} match - Regex match results
     * @param {object} pattern - Pattern configuration
     * @returns {object} Embed block data
     * @private
     */
    async processCodePen(content, match, pattern) {
        // Convert CodePen URL to embed URL
        const embedUrl = content.replace('/pen/', '/embed/');
        
        return {
            service: 'codepen',
            source: content,
            embed: embedUrl,
            width: 580,
            height: 300,
            caption: ''
        };
    }

    /**
     * Process code block to code block
     * @param {string} content - Pasted content
     * @param {Array} match - Regex match results
     * @param {object} pattern - Pattern configuration
     * @returns {object} Code block data
     * @private
     */
    async processCodeBlock(content, match, pattern) {
        // Remove code block markers and extract language
        const lines = content.split('\n');
        const firstLine = lines[0];
        const language = firstLine.replace(/```/, '').trim() || 'javascript';
        
        // Remove first and last lines (the ``` markers)
        const code = lines.slice(1, -1).join('\n');
        
        return {
            code: code,
            language: language
        };
    }

    /**
     * Process markdown link to paragraph block
     * @param {string} content - Pasted content
     * @param {Array} match - Regex match results
     * @param {object} pattern - Pattern configuration
     * @returns {object} Paragraph block data
     * @private
     */
    async processMarkdownLink(content, match, pattern) {
        const linkText = match[1];
        const linkUrl = match[2];
        
        // Create a clickable link in paragraph format
        return {
            text: `<a href="${linkUrl}" target="_blank">${linkText}</a>`
        };
    }

    /**
     * Fetch URL metadata (simplified implementation)
     * @param {string} url - URL to fetch metadata for
     * @returns {Promise<object>} URL metadata
     * @private
     */
    async fetchUrlMetadata(url) {
        // This is a simplified implementation
        // In a real app, you'd use a service like Embedly or your own backend
        try {
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    title: data.data.title || url,
                    description: data.data.description || '',
                    image: {
                        url: data.data.image?.url || ''
                    }
                };
            }
        } catch (error) {
            console.warn('Could not fetch URL metadata:', error);
        }
        
        return null;
    }

    /**
     * Fetch GitHub Gist content (simplified implementation)
     * @param {string} gistId - Gist ID
     * @returns {Promise<object>} Gist content
     * @private
     */
    async fetchGistContent(gistId) {
        try {
            const response = await fetch(`https://api.github.com/gists/${gistId}`);
            const data = await response.json();
            
            // Get first file content
            const files = Object.values(data.files);
            if (files.length > 0) {
                const file = files[0];
                return {
                    code: file.content,
                    language: file.language?.toLowerCase() || 'javascript'
                };
            }
        } catch (error) {
            console.warn('Could not fetch Gist content:', error);
        }
        
        return null;
    }

    /**
     * Enable paste substitutions
     * @returns {PasteSubstitutions} This instance for chaining
     */
    enable() {
        this.isEnabled = true;
        return this;
    }

    /**
     * Disable paste substitutions
     * @returns {PasteSubstitutions} This instance for chaining
     */
    disable() {
        this.isEnabled = false;
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
     * Get all registered patterns
     * @returns {Map} Map of registered patterns
     */
    getPatterns() {
        return new Map(this.patterns);
    }

    /**
     * Test content against all patterns
     * @param {string} content - Content to test
     * @returns {Array} Array of matching patterns
     */
    testContent(content) {
        const matches = [];
        
        for (const [name, pattern] of this.patterns) {
            const match = content.match(pattern.pattern);
            if (match) {
                matches.push({
                    name,
                    pattern: pattern.pattern,
                    blockType: pattern.blockType,
                    match
                });
            }
        }
        
        return matches.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    /**
     * Destroy paste substitutions
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('paste', this.handlePaste, true);
        
        // Clear references
        this.patterns.clear();
        this.processors.clear();
        this.isEnabled = false;
        
        // Emit destroyed event
        this.editor.emit('pasteSubstitutionsDestroyed');
    }
}
