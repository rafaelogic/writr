/**
 * List Tool for Writr Editor
 * 
 * A modular tool for creating ordered and unordered lists
 * Follows EditorJS Block Tool API
 */

export class ListTool {
    static get toolbox() {
        return {
            title: 'List',
            icon: '<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg"><path d="M5.625 4.85h9.25a.4.4 0 0 1 0 .8h-9.25a.4.4 0 0 1 0-.8zm0 4.85h9.25a.4.4 0 0 1 0 .8h-9.25a.4.4 0 0 1 0-.8zm0-9.85h9.25a.4.4 0 0 1 0 .8h-9.25a.4.4 0 0 1 0-.8zm-4.5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm0 4.85a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm0 4.85a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>',
            class: 'writr-list-tool'
        };
    }

    static get enableLineBreaks() {
        return true;
    }

    static get sanitize() {
        return {
            style: {},
            items: {
                'br': true
            }
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
            style: 'unordered', // 'ordered' or 'unordered'
            items: []
        };

        this.data = {
            style: data.style || this.defaultData.style,
            items: data.items || this.defaultData.items
        };

        this.CSS = {
            wrapper: 'writr-list-tool',
            list: 'writr-list-tool__list',
            item: 'writr-list-tool__item',
            itemText: 'writr-list-tool__item-text',
            itemSelected: 'writr-list-tool__item--selected',
            settingsButton: 'writr-list-tool__settings-button',
            settingsButtonActive: 'writr-list-tool__settings-button--active'
        };

        // Bind event handlers
        this.onKeydown = this.onKeydown.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }

    /**
     * Render the tool's main UI
     */
    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add(this.CSS.wrapper);

        this.list = this.createList();
        this.wrapper.appendChild(this.list);

        // If no items, create one empty item
        if (!this.data.items.length) {
            this.data.items = [''];
            this.renderItems();
        } else {
            this.renderItems();
        }

        return this.wrapper;
    }

    /**
     * Create list element based on style
     */
    createList() {
        const listTag = this.data.style === 'ordered' ? 'ol' : 'ul';
        const list = document.createElement(listTag);
        list.classList.add(this.CSS.list);
        return list;
    }

    /**
     * Render list items
     */
    renderItems() {
        this.list.innerHTML = '';
        
        this.data.items.forEach((item, index) => {
            const listItem = this.createItem(item, index);
            this.list.appendChild(listItem);
        });

        // Focus on the first item if it's empty
        if (this.data.items.length === 1 && this.data.items[0] === '') {
            this.focusItem(0);
        }
    }

    /**
     * Create a single list item
     */
    createItem(content, index) {
        const listItem = document.createElement('li');
        listItem.classList.add(this.CSS.item);
        listItem.dataset.index = index;

        const textElement = document.createElement('div');
        textElement.classList.add(this.CSS.itemText);
        textElement.contentEditable = !this.readOnly;
        textElement.innerHTML = content || '';
        textElement.dataset.placeholder = 'List item';

        // Event listeners
        textElement.addEventListener('keydown', this.onKeydown);
        textElement.addEventListener('input', this.onInput);
        textElement.addEventListener('paste', this.onPaste);

        listItem.appendChild(textElement);
        return listItem;
    }

    /**
     * Handle keydown events
     */
    onKeydown(event) {
        const currentItem = event.target;
        const currentIndex = parseInt(currentItem.parentElement.dataset.index);

        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                this.addNewItem(currentIndex);
                break;
            
            case 'Backspace':
                if (currentItem.textContent.trim() === '') {
                    event.preventDefault();
                    this.removeItem(currentIndex);
                }
                break;
            
            case 'ArrowUp':
                event.preventDefault();
                this.focusItem(currentIndex - 1);
                break;
            
            case 'ArrowDown':
                event.preventDefault();
                this.focusItem(currentIndex + 1);
                break;
            
            case 'Tab':
                event.preventDefault();
                if (event.shiftKey) {
                    this.unindentItem(currentIndex);
                } else {
                    this.indentItem(currentIndex);
                }
                break;
        }
    }

    /**
     * Handle input events
     */
    onInput(event) {
        const currentItem = event.target;
        const currentIndex = parseInt(currentItem.parentElement.dataset.index);
        this.data.items[currentIndex] = currentItem.innerHTML;
    }

    /**
     * Handle paste events
     */
    onPaste(event) {
        event.preventDefault();
        
        const text = (event.clipboardData || window.clipboardData).getData('text');
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length > 1) {
            const currentIndex = parseInt(event.target.parentElement.dataset.index);
            
            // Replace current item with first line
            this.data.items[currentIndex] = lines[0];
            
            // Add remaining lines as new items
            lines.slice(1).forEach((line, index) => {
                this.data.items.splice(currentIndex + index + 1, 0, line);
            });
            
            this.renderItems();
            this.focusItem(currentIndex + lines.length - 1);
        } else {
            // Single line paste
            document.execCommand('insertText', false, text);
        }
    }

    /**
     * Add new item after current index
     */
    addNewItem(afterIndex) {
        if (afterIndex === this.data.items.length - 1 && this.data.items[afterIndex].trim() === '') {
            // If last item is empty, create new block instead
            this.api.blocks.insert();
            return;
        }
        
        this.data.items.splice(afterIndex + 1, 0, '');
        this.renderItems();
        this.focusItem(afterIndex + 1);
    }

    /**
     * Remove item at index
     */
    removeItem(index) {
        if (this.data.items.length === 1) {
            // If only one item, clear it
            this.data.items[0] = '';
            this.renderItems();
            this.focusItem(0);
        } else {
            this.data.items.splice(index, 1);
            this.renderItems();
            this.focusItem(Math.max(0, index - 1));
        }
    }

    /**
     * Focus on item at index
     */
    focusItem(index) {
        if (index < 0 || index >= this.data.items.length) {
            return;
        }

        const items = this.list.querySelectorAll(`.${this.CSS.itemText}`);
        const targetItem = items[index];
        
        if (targetItem) {
            targetItem.focus();
            
            // Place cursor at the end
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(targetItem);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    /**
     * Indent item (placeholder for nested lists)
     */
    indentItem(index) {
        // For now, just add some indentation visually
        const item = this.list.querySelector(`[data-index="${index}"]`);
        if (item) {
            item.style.marginLeft = (parseInt(item.style.marginLeft) || 0) + 20 + 'px';
        }
    }

    /**
     * Unindent item
     */
    unindentItem(index) {
        const item = this.list.querySelector(`[data-index="${index}"]`);
        if (item) {
            const currentMargin = parseInt(item.style.marginLeft) || 0;
            item.style.marginLeft = Math.max(0, currentMargin - 20) + 'px';
        }
    }

    /**
     * Render settings menu
     */
    renderSettings() {
        const wrapper = document.createElement('div');
        
        const orderedButton = this.createSettingsButton('Ordered List', 'ordered');
        const unorderedButton = this.createSettingsButton('Unordered List', 'unordered');

        wrapper.appendChild(unorderedButton);
        wrapper.appendChild(orderedButton);

        return wrapper;
    }

    /**
     * Create settings button
     */
    createSettingsButton(title, style) {
        const button = document.createElement('div');
        button.classList.add(this.CSS.settingsButton);
        
        if (this.data.style === style) {
            button.classList.add(this.CSS.settingsButtonActive);
        }

        button.innerHTML = `
            <div class="writr-settings-item">
                <div class="writr-settings-label">${title}</div>
                <div class="writr-settings-icon">
                    ${style === 'ordered' ? 
                        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2.003 2.5a.5.5 0 0 0-.723-.447l-1.003.5a.5.5 0 0 0 .446.894l.28-.14V6H.5a.5.5 0 0 0 0 1h2.006a.5.5 0 1 0 0-1h-.503V2.5z"/><path d="M5 12.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/><path d="M1.5 6.5a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H2v1.5a.5.5 0 0 1-1 0V7H.5a.5.5 0 0 1 0-1H1V6.5z"/></svg>' : 
                        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>'
                    }
                </div>
            </div>
        `;

        button.addEventListener('click', () => {
            this.changeListStyle(style);
        });

        return button;
    }

    /**
     * Change list style
     */
    changeListStyle(newStyle) {
        if (this.data.style === newStyle) {
            return;
        }

        this.data.style = newStyle;
        
        // Replace the list element
        const newList = this.createList();
        newList.innerHTML = this.list.innerHTML;
        this.wrapper.replaceChild(newList, this.list);
        this.list = newList;
    }

    /**
     * Save tool data
     */
    save() {
        return {
            style: this.data.style,
            items: this.data.items.filter(item => item.trim() !== '')
        };
    }

    /**
     * Validate tool data
     */
    validate(savedData) {
        return savedData.items && Array.isArray(savedData.items);
    }

    /**
     * Convert to HTML
     */
    static get exportHTML() {
        return (data) => {
            const listTag = data.style === 'ordered' ? 'ol' : 'ul';
            const items = data.items.map(item => `<li>${item}</li>`).join('');
            return `<${listTag}>${items}</${listTag}>`;
        };
    }

    /**
     * Convert from HTML
     */
    static get importHTML() {
        return (html) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            const list = tempDiv.querySelector('ol, ul');
            if (!list) return null;
            
            const items = Array.from(list.querySelectorAll('li')).map(li => li.innerHTML);
            const style = list.tagName.toLowerCase() === 'ol' ? 'ordered' : 'unordered';
            
            return {
                style,
                items
            };
        };
    }
}
