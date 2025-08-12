/**
 * Table of Contents utility for Writr Editor
 * Auto-generates navigation from document headers
 */

export class TableOfContents {
    constructor(editorData) {
        this.editorData = editorData;
        this.headers = this.extractHeaders();
    }

    /**
     * Extract headers from editor data
     */
    extractHeaders() {
        if (!this.editorData || !this.editorData.blocks) {
            return [];
        }

        const headers = [];
        
        this.editorData.blocks.forEach((block, index) => {
            if (block.type === 'header' && block.data && block.data.text) {
                headers.push({
                    id: `header-${index}`,
                    text: this.stripHtml(block.data.text),
                    level: block.data.level || 1,
                    blockIndex: index
                });
            }
        });

        return headers;
    }

    /**
     * Strip HTML tags from text
     */
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    /**
     * Generate Table of Contents HTML
     */
    generateHTML(options = {}) {
        const {
            maxLevel = 6,
            minLevel = 1,
            className = 'writr-toc',
            includeNumbers = true
        } = options;

        if (this.headers.length === 0) {
            return '<div class="writr-toc-empty">No headers found</div>';
        }

        const filteredHeaders = this.headers.filter(header => 
            header.level >= minLevel && header.level <= maxLevel
        );

        if (filteredHeaders.length === 0) {
            return '<div class="writr-toc-empty">No headers in specified range</div>';
        }

        let html = `<nav class="${className}">`;
        html += '<ul class="writr-toc-list">';

        filteredHeaders.forEach((header, index) => {
            const number = includeNumbers ? `${index + 1}. ` : '';
            const indent = header.level > 1 ? ` style="margin-left: ${(header.level - 1) * 20}px;"` : '';
            
            html += `<li class="writr-toc-item level-${header.level}"${indent}>`;
            html += `<a href="#${header.id}" class="writr-toc-link" data-block-index="${header.blockIndex}">`;
            html += `<span class="writr-toc-number">${number}</span>`;
            html += `<span class="writr-toc-text">${header.text}</span>`;
            html += '</a>';
            html += '</li>';
        });

        html += '</ul>';
        html += '</nav>';

        return html;
    }

    /**
     * Generate plain text TOC
     */
    generateText(options = {}) {
        const {
            maxLevel = 6,
            minLevel = 1,
            includeNumbers = true,
            indentChar = '  '
        } = options;

        const filteredHeaders = this.headers.filter(header => 
            header.level >= minLevel && header.level <= maxLevel
        );

        if (filteredHeaders.length === 0) {
            return 'No headers found';
        }

        let text = '';

        filteredHeaders.forEach((header, index) => {
            const number = includeNumbers ? `${index + 1}. ` : '';
            const indent = indentChar.repeat(header.level - 1);
            
            text += `${indent}${number}${header.text}\n`;
        });

        return text.trim();
    }

    /**
     * Generate TOC as a data structure
     */
    generateData() {
        return {
            headers: this.headers,
            count: this.headers.length,
            levels: [...new Set(this.headers.map(h => h.level))].sort(),
            isEmpty: this.headers.length === 0
        };
    }

    /**
     * Add click handlers for smooth scrolling
     */
    addClickHandlers(container = document) {
        const links = container.querySelectorAll('.writr-toc-link');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const blockIndex = parseInt(link.dataset.blockIndex);
                const targetId = link.getAttribute('href').substring(1);
                
                // Try to find the target element
                let target = document.getElementById(targetId);
                
                // If not found, try to find by block index
                if (!target) {
                    const blocks = document.querySelectorAll('[data-block-index]');
                    target = Array.from(blocks).find(block => 
                        parseInt(block.dataset.blockIndex) === blockIndex
                    );
                }

                // If still not found, try to find header by text content
                if (!target) {
                    const headerText = link.querySelector('.writr-toc-text').textContent;
                    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    target = Array.from(headers).find(header => 
                        header.textContent.trim() === headerText.trim()
                    );
                }

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Add highlight effect
                    target.classList.add('writr-toc-highlight');
                    setTimeout(() => {
                        target.classList.remove('writr-toc-highlight');
                    }, 2000);
                }
            });
        });
    }

    /**
     * Update TOC when editor data changes
     */
    update(newEditorData) {
        this.editorData = newEditorData;
        this.headers = this.extractHeaders();
    }

    /**
     * Get header count by level
     */
    getHeaderCounts() {
        const counts = {};
        
        for (let level = 1; level <= 6; level++) {
            counts[`h${level}`] = this.headers.filter(h => h.level === level).length;
        }
        
        counts.total = this.headers.length;
        
        return counts;
    }
}

/**
 * Create TOC from editor data
 */
export function createTableOfContents(editorData, options = {}) {
    return new TableOfContents(editorData);
}

/**
 * Generate TOC HTML from editor data
 */
export function generateTOCHTML(editorData, options = {}) {
    const toc = new TableOfContents(editorData);
    return toc.generateHTML(options);
}

/**
 * Generate TOC text from editor data
 */
export function generateTOCText(editorData, options = {}) {
    const toc = new TableOfContents(editorData);
    return toc.generateText(options);
}

export default TableOfContents;
