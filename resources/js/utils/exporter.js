/**
 * Content Export utility for Writr Editor
 * Handles exporting content to various formats: HTML, Markdown, Plain Text, JSON
 */

export class ContentExporter {
    constructor(editorData) {
        this.editorData = editorData;
    }

    /**
     * Export to HTML format
     */
    toHTML(options = {}) {
        const {
            includeStyles = true,
            includeTitle = true,
            title = 'Exported Document',
            standalone = true
        } = options;

        let html = '';

        if (standalone) {
            html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>`;

            if (includeStyles) {
                html += `
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            line-height: 1.6; 
            color: #333; 
        }
        h1, h2, h3, h4, h5, h6 { margin-top: 2em; margin-bottom: 0.5em; color: #222; }
        h1 { font-size: 2.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        h2 { font-size: 2em; }
        h3 { font-size: 1.5em; }
        p { margin-bottom: 1em; }
        ul, ol { margin-bottom: 1em; padding-left: 2em; }
        li { margin-bottom: 0.25em; }
        blockquote { 
            margin: 1em 0; 
            padding: 0 1em; 
            border-left: 4px solid #ddd; 
            font-style: italic; 
            background: #f9f9f9;
        }
        code { 
            background: #f5f5f5; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        }
        pre { 
            background: #f5f5f5; 
            padding: 1em; 
            border-radius: 5px; 
            overflow-x: auto; 
            border: 1px solid #e1e5e9;
        }
        pre code {
            background: none;
            padding: 0;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 1em 0; 
            border: 1px solid #ddd;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px 8px; 
            text-align: left; 
        }
        th { background-color: #f5f5f5; font-weight: 600; }
        img { max-width: 100%; height: auto; border-radius: 3px; }
        .checklist { list-style: none; padding-left: 0; }
        .checklist li { position: relative; padding-left: 1.5em; }
        .checklist li:before { 
            content: '☐'; 
            position: absolute; 
            left: 0; 
            color: #666;
        }
        .checklist li.checked:before { content: '☑'; color: #0066cc; }
    </style>`;
            }

            html += `
</head>
<body>`;

            if (includeTitle) {
                html += `    <h1>${title}</h1>\n`;
            }
        }

        if (this.editorData && this.editorData.blocks) {
            this.editorData.blocks.forEach(block => {
                html += this.blockToHTML(block);
            });
        }

        if (standalone) {
            html += `
</body>
</html>`;
        }

        return html;
    }

    /**
     * Convert a single block to HTML
     */
    blockToHTML(block) {
        switch(block.type) {
            case 'header':
                const level = block.data.level || 1;
                return `<h${level}>${block.data.text || ''}</h${level}>\n`;

            case 'paragraph':
                return `<p>${block.data.text || ''}</p>\n`;

            case 'list':
                const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                let listHTML = `<${tag}>\n`;
                if (block.data.items) {
                    block.data.items.forEach(item => {
                        const text = typeof item === 'string' ? item : item.content || item.text || '';
                        listHTML += `  <li>${text}</li>\n`;
                    });
                }
                listHTML += `</${tag}>\n`;
                return listHTML;

            case 'checklist':
                let checklistHTML = '<ul class="checklist">\n';
                if (block.data.items) {
                    block.data.items.forEach(item => {
                        const checked = item.checked ? ' class="checked"' : '';
                        const text = item.text || '';
                        checklistHTML += `  <li${checked}>${text}</li>\n`;
                    });
                }
                checklistHTML += '</ul>\n';
                return checklistHTML;

            case 'quote':
                let quoteHTML = `<blockquote>${block.data.text || ''}`;
                if (block.data.caption) {
                    quoteHTML += `<br><cite>— ${block.data.caption}</cite>`;
                }
                quoteHTML += `</blockquote>\n`;
                return quoteHTML;

            case 'code':
                return `<pre><code>${this.escapeHtml(block.data.code || '')}</code></pre>\n`;

            case 'delimiter':
                return '<hr>\n';

            case 'table':
                let tableHTML = '<table>\n';
                if (block.data.content) {
                    block.data.content.forEach((row, rowIndex) => {
                        const tag = rowIndex === 0 ? 'th' : 'td';
                        tableHTML += '  <tr>\n';
                        row.forEach(cell => {
                            tableHTML += `    <${tag}>${cell || ''}</${tag}>\n`;
                        });
                        tableHTML += '  </tr>\n';
                    });
                }
                tableHTML += '</table>\n';
                return tableHTML;

            case 'image':
                const src = block.data.file?.url || block.data.url || '';
                const caption = block.data.caption || '';
                const alt = caption || 'Image';
                let imageHTML = `<img src="${src}" alt="${alt}">`;
                if (caption) {
                    imageHTML = `<figure>${imageHTML}<figcaption>${caption}</figcaption></figure>`;
                }
                return imageHTML + '\n';

            default:
                // Handle unknown blocks
                if (block.data.text) {
                    return `<div class="unknown-block">${block.data.text}</div>\n`;
                }
                return '';
        }
    }

    /**
     * Export to Markdown format
     */
    toMarkdown() {
        let markdown = '';

        if (this.editorData && this.editorData.blocks) {
            this.editorData.blocks.forEach(block => {
                markdown += this.blockToMarkdown(block);
            });
        }

        return markdown.trim();
    }

    /**
     * Convert a single block to Markdown
     */
    blockToMarkdown(block) {
        switch(block.type) {
            case 'header':
                const level = block.data.level || 1;
                const hashes = '#'.repeat(level);
                return `${hashes} ${this.stripHtml(block.data.text || '')}\n\n`;

            case 'paragraph':
                return `${this.stripHtml(block.data.text || '')}\n\n`;

            case 'list':
                let listMd = '';
                if (block.data.items) {
                    block.data.items.forEach((item, index) => {
                        const text = typeof item === 'string' ? item : item.content || item.text || '';
                        const cleanText = this.stripHtml(text);
                        if (block.data.style === 'ordered') {
                            listMd += `${index + 1}. ${cleanText}\n`;
                        } else {
                            listMd += `- ${cleanText}\n`;
                        }
                    });
                }
                return listMd + '\n';

            case 'checklist':
                let checklistMd = '';
                if (block.data.items) {
                    block.data.items.forEach(item => {
                        const checked = item.checked ? 'x' : ' ';
                        const text = this.stripHtml(item.text || '');
                        checklistMd += `- [${checked}] ${text}\n`;
                    });
                }
                return checklistMd + '\n';

            case 'quote':
                let quoteMd = `> ${this.stripHtml(block.data.text || '')}`;
                if (block.data.caption) {
                    quoteMd += `\n> \n> — ${this.stripHtml(block.data.caption)}`;
                }
                return quoteMd + '\n\n';

            case 'code':
                return `\`\`\`\n${block.data.code || ''}\n\`\`\`\n\n`;

            case 'delimiter':
                return '---\n\n';

            case 'table':
                let tableMd = '';
                if (block.data.content && block.data.content.length > 0) {
                    // Header row
                    tableMd += '| ' + block.data.content[0].map(cell => this.stripHtml(cell || '')).join(' | ') + ' |\n';
                    tableMd += '| ' + block.data.content[0].map(() => '---').join(' | ') + ' |\n';
                    
                    // Data rows
                    for (let i = 1; i < block.data.content.length; i++) {
                        tableMd += '| ' + block.data.content[i].map(cell => this.stripHtml(cell || '')).join(' | ') + ' |\n';
                    }
                }
                return tableMd + '\n';

            case 'image':
                const src = block.data.file?.url || block.data.url || '';
                const caption = this.stripHtml(block.data.caption || '');
                const alt = caption || 'Image';
                return `![${alt}](${src})\n\n`;

            default:
                if (block.data.text) {
                    return `${this.stripHtml(block.data.text)}\n\n`;
                }
                return '';
        }
    }

    /**
     * Export to plain text format
     */
    toPlainText() {
        let text = '';

        if (this.editorData && this.editorData.blocks) {
            this.editorData.blocks.forEach(block => {
                text += this.blockToPlainText(block);
            });
        }

        return text.trim();
    }

    /**
     * Convert a single block to plain text
     */
    blockToPlainText(block) {
        switch(block.type) {
            case 'header':
                const level = block.data.level || 1;
                const text = this.stripHtml(block.data.text || '');
                const underline = level === 1 ? '='.repeat(text.length) : '-'.repeat(text.length);
                return `${text}\n${underline}\n\n`;

            case 'paragraph':
                return `${this.stripHtml(block.data.text || '')}\n\n`;

            case 'list':
                let listText = '';
                if (block.data.items) {
                    block.data.items.forEach((item, index) => {
                        const text = typeof item === 'string' ? item : item.content || item.text || '';
                        const cleanText = this.stripHtml(text);
                        if (block.data.style === 'ordered') {
                            listText += `${index + 1}. ${cleanText}\n`;
                        } else {
                            listText += `• ${cleanText}\n`;
                        }
                    });
                }
                return listText + '\n';

            case 'checklist':
                let checklistText = '';
                if (block.data.items) {
                    block.data.items.forEach(item => {
                        const checked = item.checked ? '☑' : '☐';
                        const text = this.stripHtml(item.text || '');
                        checklistText += `${checked} ${text}\n`;
                    });
                }
                return checklistText + '\n';

            case 'quote':
                let quoteText = `"${this.stripHtml(block.data.text || '')}"`;
                if (block.data.caption) {
                    quoteText += `\n— ${this.stripHtml(block.data.caption)}`;
                }
                return quoteText + '\n\n';

            case 'code':
                return `${block.data.code || ''}\n\n`;

            case 'delimiter':
                return '* * *\n\n';

            case 'table':
                let tableText = '';
                if (block.data.content) {
                    block.data.content.forEach(row => {
                        tableText += row.map(cell => this.stripHtml(cell || '')).join('\t') + '\n';
                    });
                }
                return tableText + '\n';

            case 'image':
                const caption = this.stripHtml(block.data.caption || '');
                return caption ? `[Image: ${caption}]\n\n` : '[Image]\n\n';

            default:
                if (block.data.text) {
                    return `${this.stripHtml(block.data.text)}\n\n`;
                }
                return '';
        }
    }

    /**
     * Export to JSON format (pretty-printed)
     */
    toJSON(prettyPrint = true) {
        if (prettyPrint) {
            return JSON.stringify(this.editorData, null, 2);
        }
        return JSON.stringify(this.editorData);
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
     * Escape HTML characters
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Get export statistics
     */
    getStats() {
        if (!this.editorData || !this.editorData.blocks) {
            return {
                blocks: 0,
                words: 0,
                characters: 0,
                charactersNoSpaces: 0,
                paragraphs: 0,
                headers: 0,
                lists: 0,
                images: 0
            };
        }

        let words = 0;
        let characters = 0;
        let charactersNoSpaces = 0;
        let paragraphs = 0;
        let headers = 0;
        let lists = 0;
        let images = 0;

        this.editorData.blocks.forEach(block => {
            switch(block.type) {
                case 'header':
                    headers++;
                    break;
                case 'paragraph':
                    paragraphs++;
                    break;
                case 'list':
                case 'checklist':
                    lists++;
                    break;
                case 'image':
                    images++;
                    break;
            }

            // Count words and characters
            const text = this.getBlockText(block);
            if (text) {
                const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
                words += wordCount;
                characters += text.length;
                charactersNoSpaces += text.replace(/\s/g, '').length;
            }
        });

        return {
            blocks: this.editorData.blocks.length,
            words,
            characters,
            charactersNoSpaces,
            paragraphs,
            headers,
            lists,
            images
        };
    }

    /**
     * Extract text content from a block
     */
    getBlockText(block) {
        switch(block.type) {
            case 'header':
            case 'paragraph':
                return this.stripHtml(block.data.text || '');
            case 'quote':
                let text = this.stripHtml(block.data.text || '');
                if (block.data.caption) {
                    text += ' ' + this.stripHtml(block.data.caption);
                }
                return text;
            case 'list':
            case 'checklist':
                if (block.data.items) {
                    return block.data.items.map(item => {
                        const text = typeof item === 'string' ? item : item.content || item.text || '';
                        return this.stripHtml(text);
                    }).join(' ');
                }
                return '';
            case 'code':
                return block.data.code || '';
            case 'table':
                if (block.data.content) {
                    return block.data.content.flat().map(cell => this.stripHtml(cell || '')).join(' ');
                }
                return '';
            default:
                return this.stripHtml(block.data.text || '');
        }
    }
}

/**
 * Export editor data to various formats
 */
export function exportContent(editorData, format = 'html', options = {}) {
    const exporter = new ContentExporter(editorData);
    
    switch(format.toLowerCase()) {
        case 'html':
            return exporter.toHTML(options);
        case 'markdown':
        case 'md':
            return exporter.toMarkdown();
        case 'text':
        case 'txt':
            return exporter.toPlainText();
        case 'json':
            return exporter.toJSON(options.prettyPrint !== false);
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
}

export default ContentExporter;