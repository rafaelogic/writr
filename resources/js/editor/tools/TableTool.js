/**
 * TableTool - Enhanced table tool for WritrEditor
 * 
 * Features:
 * - Resizable columns and rows
 * - Cell editing
 * - Add/remove rows and columns
 * - Table styling options
 * 
 * Following EditorJS Block Tool API
 */
export class TableTool {
    /**
     * Tool toolbox configuration
     */
    static get toolbox() {
        return {
            icon: `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="10" height="10" stroke="currentColor" fill="none"/>
                <line x1="2" y1="6" x2="12" y2="6" stroke="currentColor"/>
                <line x1="6" y1="2" x2="6" y2="12" stroke="currentColor"/>
                <line x1="10" y1="2" x2="10" y2="12" stroke="currentColor"/>
            </svg>`,
            title: 'Table',
            description: 'Add a resizable table'
        };
    }

    /**
     * Tool configuration
     */
    static get config() {
        return {
            rows: 2,
            cols: 3,
            withHeadings: false,
            minRows: 1,
            maxRows: 20,
            minCols: 1,
            maxCols: 10
        };
    }

    /**
     * Constructor
     */
    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;
        this.config = { ...TableTool.config, ...config };

        this.data = {
            withHeadings: data.withHeadings || this.config.withHeadings,
            content: data.content || this.createEmptyTable()
        };

        this.wrapper = null;
        this.table = null;
        this.resizing = null;
    }

    /**
     * Create empty table data
     */
    createEmptyTable() {
        const content = [];
        for (let row = 0; row < this.config.rows; row++) {
            const rowData = [];
            for (let col = 0; col < this.config.cols; col++) {
                rowData.push('');
            }
            content.push(rowData);
        }
        return content;
    }

    /**
     * Render the tool
     */
    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'writr-table-wrapper';

        this.table = document.createElement('table');
        this.table.className = 'writr-table';

        this.renderTable();
        this.attachEventListeners();

        this.wrapper.appendChild(this.table);

        if (!this.readOnly) {
            this.addTableControls();
        }

        return this.wrapper;
    }

    /**
     * Render table content
     */
    renderTable() {
        this.table.innerHTML = '';

        this.data.content.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            tr.className = 'writr-table-row';

            row.forEach((cell, colIndex) => {
                const cellElement = document.createElement(
                    this.data.withHeadings && rowIndex === 0 ? 'th' : 'td'
                );
                cellElement.className = 'writr-table-cell';
                cellElement.contentEditable = !this.readOnly;
                cellElement.innerHTML = cell;
                cellElement.dataset.row = rowIndex;
                cellElement.dataset.col = colIndex;

                if (!cell) {
                    cellElement.setAttribute('data-placeholder', 'Enter text...');
                }

                // Add resize handles
                if (!this.readOnly) {
                    this.addResizeHandles(cellElement, rowIndex, colIndex);
                }

                tr.appendChild(cellElement);
            });

            this.table.appendChild(tr);
        });
    }

    /**
     * Add resize handles to cells
     */
    addResizeHandles(cell, rowIndex, colIndex) {
        // Column resize handle
        if (colIndex < this.data.content[0].length - 1) {
            const colHandle = document.createElement('div');
            colHandle.className = 'writr-table-resize-handle writr-table-resize-col';
            colHandle.dataset.col = colIndex;
            colHandle.addEventListener('mousedown', this.startColResize.bind(this));
            cell.appendChild(colHandle);
        }

        // Row resize handle
        if (rowIndex < this.data.content.length - 1) {
            const rowHandle = document.createElement('div');
            rowHandle.className = 'writr-table-resize-handle writr-table-resize-row';
            rowHandle.dataset.row = rowIndex;
            rowHandle.addEventListener('mousedown', this.startRowResize.bind(this));
            cell.appendChild(rowHandle);
        }
    }

    /**
     * Start column resize
     */
    startColResize(event) {
        event.preventDefault();
        
        const colIndex = parseInt(event.target.dataset.col);
        const startX = event.clientX;
        const table = this.table;
        const cells = table.querySelectorAll(`td[data-col="${colIndex}"], th[data-col="${colIndex}"]`);
        const startWidth = cells[0].offsetWidth;

        this.resizing = {
            type: 'col',
            index: colIndex,
            startX,
            startWidth,
            cells
        };

        document.addEventListener('mousemove', this.handleResize.bind(this));
        document.addEventListener('mouseup', this.stopResize.bind(this));
        
        this.wrapper.classList.add('resizing');
    }

    /**
     * Start row resize
     */
    startRowResize(event) {
        event.preventDefault();
        
        const rowIndex = parseInt(event.target.dataset.row);
        const startY = event.clientY;
        const row = this.table.rows[rowIndex];
        const startHeight = row.offsetHeight;

        this.resizing = {
            type: 'row',
            index: rowIndex,
            startY,
            startHeight,
            row
        };

        document.addEventListener('mousemove', this.handleResize.bind(this));
        document.addEventListener('mouseup', this.stopResize.bind(this));
        
        this.wrapper.classList.add('resizing');
    }

    /**
     * Handle resize
     */
    handleResize(event) {
        if (!this.resizing) return;

        if (this.resizing.type === 'col') {
            const deltaX = event.clientX - this.resizing.startX;
            const newWidth = Math.max(50, this.resizing.startWidth + deltaX);
            
            this.resizing.cells.forEach(cell => {
                cell.style.width = `${newWidth}px`;
            });
        } else if (this.resizing.type === 'row') {
            const deltaY = event.clientY - this.resizing.startY;
            const newHeight = Math.max(30, this.resizing.startHeight + deltaY);
            
            this.resizing.row.style.height = `${newHeight}px`;
        }
    }

    /**
     * Stop resize
     */
    stopResize() {
        if (this.resizing) {
            document.removeEventListener('mousemove', this.handleResize);
            document.removeEventListener('mouseup', this.stopResize);
            
            this.resizing = null;
            this.wrapper.classList.remove('resizing');
        }
    }

    /**
     * Add table controls
     */
    addTableControls() {
        const controls = document.createElement('div');
        controls.className = 'writr-table-controls';

        // Add row button
        const addRowBtn = this.createControlButton('Add Row', this.addRow.bind(this));
        controls.appendChild(addRowBtn);

        // Add column button
        const addColBtn = this.createControlButton('Add Column', this.addColumn.bind(this));
        controls.appendChild(addColBtn);

        // Remove row button
        const removeRowBtn = this.createControlButton('Remove Row', this.removeRow.bind(this));
        controls.appendChild(removeRowBtn);

        // Remove column button
        const removeColBtn = this.createControlButton('Remove Column', this.removeColumn.bind(this));
        controls.appendChild(removeColBtn);

        this.wrapper.appendChild(controls);
    }

    /**
     * Create control button
     */
    createControlButton(text, onClick) {
        const button = document.createElement('button');
        button.className = 'writr-table-control-btn';
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * Add row
     */
    addRow() {
        if (this.data.content.length >= this.config.maxRows) return;

        const newRow = new Array(this.data.content[0].length).fill('');
        this.data.content.push(newRow);
        this.renderTable();
    }

    /**
     * Add column
     */
    addColumn() {
        if (this.data.content[0].length >= this.config.maxCols) return;

        this.data.content.forEach(row => {
            row.push('');
        });
        this.renderTable();
    }

    /**
     * Remove row
     */
    removeRow() {
        if (this.data.content.length <= this.config.minRows) return;

        this.data.content.pop();
        this.renderTable();
    }

    /**
     * Remove column
     */
    removeColumn() {
        if (this.data.content[0].length <= this.config.minCols) return;

        this.data.content.forEach(row => {
            row.pop();
        });
        this.renderTable();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (this.readOnly) return;

        this.table.addEventListener('input', (event) => {
            if (event.target.classList.contains('writr-table-cell')) {
                const row = parseInt(event.target.dataset.row);
                const col = parseInt(event.target.dataset.col);
                this.data.content[row][col] = event.target.innerHTML;

                // Update placeholder
                if (event.target.textContent.trim() === '') {
                    event.target.setAttribute('data-placeholder', 'Enter text...');
                } else {
                    event.target.removeAttribute('data-placeholder');
                }
            }
        });
    }

    /**
     * Save tool data
     */
    save() {
        return {
            withHeadings: this.data.withHeadings,
            content: this.data.content
        };
    }

    /**
     * Validate data
     */
    validate(savedData) {
        return savedData.content && 
               Array.isArray(savedData.content) && 
               savedData.content.length > 0;
    }

    /**
     * Settings panel
     */
    renderSettings() {
        return [
            {
                name: 'withHeadings',
                icon: `<svg width="16" height="16" viewBox="0 0 16 16">
                    <rect x="2" y="2" width="12" height="3" fill="currentColor"/>
                    <rect x="2" y="6" width="12" height="2" stroke="currentColor" fill="none"/>
                    <rect x="2" y="9" width="12" height="2" stroke="currentColor" fill="none"/>
                    <rect x="2" y="12" width="12" height="2" stroke="currentColor" fill="none"/>
                </svg>`,
                title: 'With headings',
                toggle: true,
                isActive: this.data.withHeadings,
                onActivate: () => {
                    this.data.withHeadings = !this.data.withHeadings;
                    this.renderTable();
                }
            }
        ];
    }

    /**
     * Sanitizer configuration
     */
    static get sanitize() {
        return {
            withHeadings: false,
            content: {
                br: true,
                strong: true,
                b: true,
                i: true,
                em: true,
                u: true,
                s: true,
                mark: true,
                code: true
            }
        };
    }

    /**
     * Destroy
     */
    destroy() {
        document.removeEventListener('mousemove', this.handleResize);
        document.removeEventListener('mouseup', this.stopResize);
    }
}

export default TableTool;
