/**
 * BlockAPI - Implementation of EditorJS Block API
 * 
 * Provides comprehensive block manipulation capabilities:
 * - Block operations (insert, delete, move, swap)
 * - Block properties (get, set, update)
 * - Block traversal and selection
 * - Event handling for block changes
 * 
 * @see https://editorjs.io/blockapi/
 */

export class BlockAPI {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.api = null;
        
        // Bind methods to preserve context
        this.getBlocksCount = this.getBlocksCount.bind(this);
        this.getCurrentBlockIndex = this.getCurrentBlockIndex.bind(this);
        this.getBlockByIndex = this.getBlockByIndex.bind(this);
        this.delete = this.delete.bind(this);
        this.clear = this.clear.bind(this);
        this.render = this.render.bind(this);
        this.renderFromHTML = this.renderFromHTML.bind(this);
        this.insert = this.insert.bind(this);
        this.insertAt = this.insertAt.bind(this);
        this.update = this.update.bind(this);
        this.swap = this.swap.bind(this);
        this.move = this.move.bind(this);
        this.getById = this.getById.bind(this);
        this.convert = this.convert.bind(this);
        this.stretchBlock = this.stretchBlock.bind(this);
        this.insertMany = this.insertMany.bind(this);
    }

    /**
     * Initialize Block API with EditorJS API reference
     */
    init(editorAPI) {
        this.api = editorAPI;
        return this;
    }

    /**
     * Get total number of blocks
     * @returns {number} Number of blocks
     */
    getBlocksCount() {
        if (!this.api) return 0;
        return this.api.blocks.getBlocksCount();
    }

    /**
     * Get current block index
     * @returns {number} Current block index (-1 if no selection)
     */
    getCurrentBlockIndex() {
        if (!this.api) return -1;
        return this.api.blocks.getCurrentBlockIndex();
    }

    /**
     * Get block by index
     * @param {number} index - Block index
     * @returns {object|null} Block data or null if not found
     */
    getBlockByIndex(index) {
        if (!this.api || index < 0 || index >= this.getBlocksCount()) {
            return null;
        }
        return this.api.blocks.getBlockByIndex(index);
    }

    /**
     * Get current block
     * @returns {object|null} Current block data or null
     */
    getCurrentBlock() {
        const index = this.getCurrentBlockIndex();
        return index >= 0 ? this.getBlockByIndex(index) : null;
    }

    /**
     * Delete block by index
     * @param {number} index - Block index to delete
     * @returns {Promise<boolean>} Success status
     */
    async delete(index) {
        try {
            if (!this.api || index < 0 || index >= this.getBlocksCount()) {
                return false;
            }
            
            this.api.blocks.delete(index);
            
            // Emit block deleted event
            this.editor.emit('blockDeleted', { index });
            
            return true;
        } catch (error) {
            console.error('Error deleting block:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Delete current block
     * @returns {Promise<boolean>} Success status
     */
    async deleteCurrent() {
        const index = this.getCurrentBlockIndex();
        return index >= 0 ? await this.delete(index) : false;
    }

    /**
     * Clear all blocks
     * @returns {Promise<boolean>} Success status
     */
    async clear() {
        try {
            if (!this.api) return false;
            
            this.api.blocks.clear();
            
            // Emit blocks cleared event
            this.editor.emit('blocksCleared');
            
            return true;
        } catch (error) {
            console.error('Error clearing blocks:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Render blocks from data
     * @param {object} data - EditorJS data format
     * @returns {Promise<boolean>} Success status
     */
    async render(data) {
        try {
            if (!this.api || !data || !data.blocks) {
                return false;
            }
            
            await this.api.blocks.render(data);
            
            // Emit blocks rendered event
            this.editor.emit('blocksRendered', { data });
            
            return true;
        } catch (error) {
            console.error('Error rendering blocks:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Render blocks from HTML
     * @param {string} html - HTML string to convert
     * @returns {Promise<boolean>} Success status
     */
    async renderFromHTML(html) {
        try {
            if (!this.api || !html) {
                return false;
            }
            
            this.api.blocks.renderFromHTML(html);
            
            // Emit blocks rendered from HTML event
            this.editor.emit('blocksRenderedFromHTML', { html });
            
            return true;
        } catch (error) {
            console.error('Error rendering blocks from HTML:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Insert a new block
     * @param {string} type - Block type
     * @param {object} data - Block data
     * @param {object} config - Insert configuration
     * @param {number} index - Insert position (optional)
     * @param {boolean} needToFocus - Focus after insert (optional)
     * @param {boolean} replace - Replace current block (optional)
     * @returns {Promise<object|null>} Inserted block or null
     */
    async insert(type = 'paragraph', data = {}, config = {}, index = null, needToFocus = true, replace = false) {
        try {
            if (!this.api) {
                throw new Error('EditorJS API not available');
            }
            
            // Validate block type
            if (!type || typeof type !== 'string') {
                throw new Error('Block type must be a non-empty string');
            }
            
            // Get available tools to validate the type
            const availableTools = this.editor.toolRegistry.getAvailableTools();
            
            // Paragraph is always available (default tool)
            if (type !== 'paragraph' && !availableTools.includes(type)) {
                throw new Error(`Block type "${type}" is not registered. Available tools: ${availableTools.join(', ')}, paragraph`);
            }
            
            // Validate data
            if (data && typeof data !== 'object') {
                throw new Error('Block data must be an object');
            }
            
            // Validate index if provided
            if (index !== null && (typeof index !== 'number' || index < 0)) {
                throw new Error('Block index must be a non-negative number');
            }
            
            const insertConfig = {
                type,
                data: data || {},
                index,
                needToFocus,
                replace,
                ...config
            };
            
            const block = this.api.blocks.insert(
                insertConfig.type,
                insertConfig.data,
                insertConfig,
                insertConfig.index,
                insertConfig.needToFocus,
                insertConfig.replace
            );
            
            // Emit block inserted event
            this.editor.emit('blockInserted', { 
                block, 
                type, 
                data, 
                config: insertConfig 
            });
            
            return block;
        } catch (error) {
            console.error('Error inserting block:', error);
            this.editor.emit('error', error);
            return null;
        }
    }    /**
     * Insert block at specific index
     * @param {number} index - Insert position
     * @param {string} type - Block type
     * @param {object} data - Block data
     * @param {object} config - Insert configuration
     * @returns {Promise<object|null>} Inserted block or null
     */
    async insertAt(index, type = 'paragraph', data = {}, config = {}) {
        return await this.insert(type, data, config, index);
    }

    /**
     * Update block data
     * @param {number} index - Block index
     * @param {object} data - New block data
     * @returns {Promise<boolean>} Success status
     */
    async update(index, data) {
        try {
            if (!this.api || index < 0 || index >= this.getBlocksCount()) {
                return false;
            }
            
            const block = this.getBlockByIndex(index);
            if (!block) return false;
            
            // Update block data
            Object.assign(block.holder.dataset, data);
            
            // Emit block updated event
            this.editor.emit('blockUpdated', { index, data, block });
            
            return true;
        } catch (error) {
            console.error('Error updating block:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Swap two blocks
     * @param {number} fromIndex - Source block index
     * @param {number} toIndex - Target block index
     * @returns {Promise<boolean>} Success status
     */
    async swap(fromIndex, toIndex) {
        try {
            if (!this.api || 
                fromIndex < 0 || fromIndex >= this.getBlocksCount() ||
                toIndex < 0 || toIndex >= this.getBlocksCount() ||
                fromIndex === toIndex) {
                return false;
            }
            
            this.api.blocks.swap(fromIndex, toIndex);
            
            // Emit blocks swapped event
            this.editor.emit('blocksSwapped', { fromIndex, toIndex });
            
            return true;
        } catch (error) {
            console.error('Error swapping blocks:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Move block to new position
     * @param {number} fromIndex - Source block index
     * @param {number} toIndex - Target block index
     * @returns {Promise<boolean>} Success status
     */
    async move(fromIndex, toIndex) {
        try {
            if (!this.api || 
                fromIndex < 0 || fromIndex >= this.getBlocksCount() ||
                toIndex < 0 || toIndex > this.getBlocksCount() ||
                fromIndex === toIndex) {
                return false;
            }
            
            this.api.blocks.move(fromIndex, toIndex);
            
            // Emit block moved event
            this.editor.emit('blockMoved', { fromIndex, toIndex });
            
            return true;
        } catch (error) {
            console.error('Error moving block:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Get block by ID
     * @param {string} id - Block ID
     * @returns {object|null} Block or null if not found
     */
    getById(id) {
        if (!this.api || !id) return null;
        return this.api.blocks.getById(id);
    }

    /**
     * Convert block to another type
     * @param {number} index - Block index
     * @param {string} newType - New block type
     * @param {object} data - New block data (optional)
     * @returns {Promise<boolean>} Success status
     */
    async convert(index, newType, data = null) {
        try {
            if (!this.api || index < 0 || index >= this.getBlocksCount()) {
                return false;
            }
            
            const block = this.getBlockByIndex(index);
            if (!block) return false;
            
            // Get current block data if no new data provided
            const blockData = data || block.save();
            
            // Delete current block and insert new one
            await this.delete(index);
            const newBlock = await this.insertAt(index, newType, blockData);
            
            // Emit block converted event
            this.editor.emit('blockConverted', { 
                index, 
                oldType: block.name, 
                newType, 
                data: blockData,
                newBlock 
            });
            
            return newBlock !== null;
        } catch (error) {
            console.error('Error converting block:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Stretch block to full width
     * @param {number} index - Block index
     * @param {boolean} status - Stretch status
     * @returns {Promise<boolean>} Success status
     */
    async stretchBlock(index, status = true) {
        try {
            if (!this.api || index < 0 || index >= this.getBlocksCount()) {
                return false;
            }
            
            this.api.blocks.stretchBlock(index, status);
            
            // Emit block stretched event
            this.editor.emit('blockStretched', { index, status });
            
            return true;
        } catch (error) {
            console.error('Error stretching block:', error);
            this.editor.emit('error', error);
            return false;
        }
    }

    /**
     * Insert multiple blocks at once
     * @param {Array} blocks - Array of block configurations
     * @param {number} startIndex - Starting insert position (optional)
     * @returns {Promise<Array>} Array of inserted blocks
     */
    async insertMany(blocks, startIndex = null) {
        const insertedBlocks = [];
        
        try {
            if (!Array.isArray(blocks)) {
                throw new Error('Blocks must be an array');
            }
            
            let currentIndex = startIndex !== null ? startIndex : this.getBlocksCount();
            
            for (const blockConfig of blocks) {
                const { type = 'paragraph', data = {}, config = {} } = blockConfig;
                const block = await this.insertAt(currentIndex, type, data, config);
                
                if (block) {
                    insertedBlocks.push(block);
                    currentIndex++;
                }
            }
            
            // Emit multiple blocks inserted event
            this.editor.emit('multipleBlocksInserted', { 
                blocks: insertedBlocks, 
                startIndex 
            });
            
            return insertedBlocks;
        } catch (error) {
            console.error('Error inserting multiple blocks:', error);
            this.editor.emit('error', error);
            return insertedBlocks;
        }
    }

    /**
     * Get all blocks
     * @returns {Array} Array of all blocks
     */
    getAllBlocks() {
        if (!this.api) return [];
        
        const blocks = [];
        const count = this.getBlocksCount();
        
        for (let i = 0; i < count; i++) {
            const block = this.getBlockByIndex(i);
            if (block) {
                blocks.push(block);
            }
        }
        
        return blocks;
    }

    /**
     * Find blocks by type
     * @param {string} type - Block type to find
     * @returns {Array} Array of matching blocks with their indices
     */
    findBlocksByType(type) {
        const matchingBlocks = [];
        const blocks = this.getAllBlocks();
        
        blocks.forEach((block, index) => {
            if (block.name === type) {
                matchingBlocks.push({ block, index });
            }
        });
        
        return matchingBlocks;
    }

    /**
     * Get block statistics
     * @returns {object} Statistics about blocks
     */
    getStatistics() {
        const blocks = this.getAllBlocks();
        const stats = {
            total: blocks.length,
            types: {},
            isEmpty: blocks.length === 0
        };
        
        blocks.forEach(block => {
            const type = block.name || 'unknown';
            stats.types[type] = (stats.types[type] || 0) + 1;
        });
        
        return stats;
    }
}
