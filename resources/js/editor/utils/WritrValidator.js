/**
 * WritrValidator - Validation utilities for WritrEditor
 * Ensures data integrity and configuration validity
 */
export class WritrValidator {
    /**
     * Validate editor configuration
     */
    static validateConfig(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Configuration must be an object');
        }

        const validated = { ...config };

        // Validate holder
        if (!validated.holder) {
            throw new Error('Holder element is required');
        }

        // Validate holder element exists if it's a string
        if (typeof validated.holder === 'string') {
            const element = document.getElementById(validated.holder) || 
                          document.querySelector(validated.holder);
            if (!element) {
                throw new Error(`Holder element "${validated.holder}" not found`);
            }
        }

        // Validate tools if provided
        if (validated.tools && !Array.isArray(validated.tools)) {
            throw new Error('Tools must be an array');
        }

        // Validate data structure if provided
        if (validated.data) {
            this.validateData(validated.data);
        }

        return validated;
    }

    /**
     * Validate EditorJS data structure
     */
    static validateData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Data must be an object');
        }

        if (!data.blocks || !Array.isArray(data.blocks)) {
            throw new Error('Data must have a blocks array');
        }

        // Validate each block
        data.blocks.forEach((block, index) => {
            this.validateBlock(block, index);
        });

        return data;
    }

    /**
     * Validate individual block structure
     */
    static validateBlock(block, index = 0) {
        if (!block || typeof block !== 'object') {
            throw new Error(`Block at index ${index} must be an object`);
        }

        if (!block.type || typeof block.type !== 'string') {
            throw new Error(`Block at index ${index} must have a type string`);
        }

        if (!block.data || typeof block.data !== 'object') {
            throw new Error(`Block at index ${index} must have a data object`);
        }

        return true;
    }

    /**
     * Validate tool configuration
     */
    static validateTool(tool, name) {
        if (!tool || typeof tool !== 'function') {
            throw new Error(`Tool "${name}" must be a constructor function`);
        }

        // Check if tool has required static properties for toolbox
        if (!tool.toolbox && typeof tool.toolbox !== 'object') {
            console.warn(`Tool "${name}" should have a toolbox configuration`);
        }

        return true;
    }

    /**
     * Sanitize HTML content
     */
    static sanitizeHTML(html, allowedTags = []) {
        if (typeof html !== 'string') {
            return '';
        }

        // Basic HTML sanitization
        // In production, consider using a library like DOMPurify
        const div = document.createElement('div');
        div.textContent = html;
        
        if (allowedTags.length > 0) {
            // Allow specific tags (simplified implementation)
            let sanitized = div.innerHTML;
            const allowedPattern = allowedTags.map(tag => `</?${tag}[^>]*>`).join('|');
            const regex = new RegExp(`<(?!/?(?:${allowedTags.join('|')})[\\s>])([^>]+)>`, 'gi');
            sanitized = sanitized.replace(regex, '');
            return sanitized;
        }

        return div.textContent || div.innerText || '';
    }

    /**
     * Validate URL
     */
    static isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Validate email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate that value is not empty
     */
    static isNotEmpty(value) {
        return value !== null && 
               value !== undefined && 
               value !== '' && 
               !(Array.isArray(value) && value.length === 0) &&
               !(typeof value === 'object' && Object.keys(value).length === 0);
    }

    /**
     * Validate numeric value
     */
    static isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    /**
     * Validate that value is within range
     */
    static isInRange(value, min, max) {
        const num = parseFloat(value);
        return this.isNumeric(num) && num >= min && num <= max;
    }
}
