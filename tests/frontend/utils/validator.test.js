import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WritrValidator } from '../../resources/js/utils/validator.js';

describe('WritrValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new WritrValidator();
  });

  describe('Content Validation', () => {
    it('should validate valid Editor.js data', () => {
      const validData = {
        time: Date.now(),
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            data: {
              text: 'This is a valid paragraph.'
            }
          },
          {
            id: 'block-2',
            type: 'header',
            data: {
              text: 'Valid Header',
              level: 2
            }
          }
        ],
        version: '2.28.0'
      };

      expect(validator.validateContent(validData)).toBe(true);
    });

    it('should reject invalid data structure', () => {
      const invalidData = {
        // Missing blocks array
        time: Date.now(),
        version: '2.28.0'
      };

      expect(validator.validateContent(invalidData)).toBe(false);
    });

    it('should reject blocks without required fields', () => {
      const invalidData = {
        time: Date.now(),
        blocks: [
          {
            // Missing id, type, and data
            content: 'Invalid block'
          }
        ],
        version: '2.28.0'
      };

      expect(validator.validateContent(invalidData)).toBe(false);
    });

    it('should validate empty content', () => {
      const emptyData = {
        time: Date.now(),
        blocks: [],
        version: '2.28.0'
      };

      expect(validator.validateContent(emptyData)).toBe(true);
    });
  });

  describe('Block Type Validation', () => {
    it('should validate paragraph blocks', () => {
      const paragraphBlock = {
        id: 'block-1',
        type: 'paragraph',
        data: {
          text: 'Valid paragraph text'
        }
      };

      expect(validator.validateBlock(paragraphBlock)).toBe(true);
    });

    it('should validate header blocks', () => {
      const headerBlock = {
        id: 'block-1',
        type: 'header',
        data: {
          text: 'Valid Header',
          level: 2
        }
      };

      expect(validator.validateBlock(headerBlock)).toBe(true);
    });

    it('should reject header with invalid level', () => {
      const invalidHeaderBlock = {
        id: 'block-1',
        type: 'header',
        data: {
          text: 'Invalid Header',
          level: 7 // Invalid level (should be 1-6)
        }
      };

      expect(validator.validateBlock(invalidHeaderBlock)).toBe(false);
    });

    it('should validate list blocks', () => {
      const listBlock = {
        id: 'block-1',
        type: 'list',
        data: {
          style: 'unordered',
          items: ['Item 1', 'Item 2', 'Item 3']
        }
      };

      expect(validator.validateBlock(listBlock)).toBe(true);
    });

    it('should reject list with invalid style', () => {
      const invalidListBlock = {
        id: 'block-1',
        type: 'list',
        data: {
          style: 'invalid', // Should be 'ordered' or 'unordered'
          items: ['Item 1', 'Item 2']
        }
      };

      expect(validator.validateBlock(invalidListBlock)).toBe(false);
    });

    it('should validate image blocks', () => {
      const imageBlock = {
        id: 'block-1',
        type: 'image',
        data: {
          file: {
            url: 'https://example.com/image.jpg'
          },
          caption: 'Image caption',
          withBorder: false,
          withBackground: false,
          stretched: false
        }
      };

      expect(validator.validateBlock(imageBlock)).toBe(true);
    });

    it('should reject image without file URL', () => {
      const invalidImageBlock = {
        id: 'block-1',
        type: 'image',
        data: {
          caption: 'Image without URL'
        }
      };

      expect(validator.validateBlock(invalidImageBlock)).toBe(false);
    });
  });

  describe('Sanitization', () => {
    it('should sanitize HTML content', () => {
      const maliciousContent = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = validator.sanitizeHtml(maliciousContent);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should remove dangerous attributes', () => {
      const maliciousContent = '<img src="image.jpg" onerror="alert(\'xss\')" onload="malicious()"/>';
      const sanitized = validator.sanitizeHtml(maliciousContent);
      
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).toContain('src="image.jpg"');
    });

    it('should preserve safe HTML tags', () => {
      const safeContent = '<p><strong>Bold</strong> and <em>italic</em> text with <a href="https://example.com">link</a></p>';
      const sanitized = validator.sanitizeHtml(safeContent);
      
      expect(sanitized).toBe(safeContent);
    });

    it('should sanitize block data', () => {
      const blockWithMaliciousContent = {
        id: 'block-1',
        type: 'paragraph',
        data: {
          text: 'Normal text <script>alert("xss")</script> more text'
        }
      };

      const sanitized = validator.sanitizeBlock(blockWithMaliciousContent);
      
      expect(sanitized.data.text).not.toContain('<script>');
      expect(sanitized.data.text).toContain('Normal text');
      expect(sanitized.data.text).toContain('more text');
    });
  });

  describe('URL Validation', () => {
    it('should validate valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://sub.example.com/path?param=value',
        'https://example.com:8080/path',
      ];

      validUrls.forEach(url => {
        expect(validator.isValidUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'ftp://example.com', // Not HTTP/HTTPS
        '',
        null,
        undefined
      ];

      invalidUrls.forEach(url => {
        expect(validator.isValidUrl(url)).toBe(false);
      });
    });

    it('should validate image URLs', () => {
      const validImageUrls = [
        'https://example.com/image.jpg',
        'https://example.com/image.png',
        'https://example.com/image.gif',
        'https://example.com/image.webp',
        'https://example.com/image.svg'
      ];

      validImageUrls.forEach(url => {
        expect(validator.isValidImageUrl(url)).toBe(true);
      });
    });

    it('should reject non-image URLs', () => {
      const nonImageUrls = [
        'https://example.com/document.pdf',
        'https://example.com/video.mp4',
        'https://example.com/page.html',
        'https://example.com/script.js'
      ];

      nonImageUrls.forEach(url => {
        expect(validator.isValidImageUrl(url)).toBe(false);
      });
    });
  });

  describe('File Validation', () => {
    it('should validate file size', () => {
      expect(validator.validateFileSize(1024 * 1024, 2 * 1024 * 1024)).toBe(true); // 1MB file, 2MB limit
      expect(validator.validateFileSize(3 * 1024 * 1024, 2 * 1024 * 1024)).toBe(false); // 3MB file, 2MB limit
    });

    it('should validate file type', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      
      expect(validator.validateFileType('image/jpeg', allowedTypes)).toBe(true);
      expect(validator.validateFileType('image/png', allowedTypes)).toBe(true);
      expect(validator.validateFileType('application/pdf', allowedTypes)).toBe(false);
      expect(validator.validateFileType('text/plain', allowedTypes)).toBe(false);
    });

    it('should validate file extension', () => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      
      expect(validator.validateFileExtension('image.jpg', allowedExtensions)).toBe(true);
      expect(validator.validateFileExtension('image.png', allowedExtensions)).toBe(true);
      expect(validator.validateFileExtension('document.pdf', allowedExtensions)).toBe(false);
      expect(validator.validateFileExtension('script.js', allowedExtensions)).toBe(false);
    });
  });

  describe('Content Length Validation', () => {
    it('should validate text length', () => {
      expect(validator.validateTextLength('Short text', 100)).toBe(true);
      expect(validator.validateTextLength('A'.repeat(101), 100)).toBe(false);
      expect(validator.validateTextLength('', 100)).toBe(true); // Empty is valid
    });

    it('should validate block count', () => {
      const content = {
        blocks: new Array(50).fill({ type: 'paragraph', data: { text: 'Block' } })
      };
      
      expect(validator.validateBlockCount(content, 100)).toBe(true);
      expect(validator.validateBlockCount(content, 25)).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate editor configuration', () => {
      const validConfig = {
        holder: 'editor',
        placeholder: 'Start writing...',
        autofocus: true,
        tools: {
          paragraph: true,
          header: true
        }
      };

      expect(validator.validateConfig(validConfig)).toBe(true);
    });

    it('should reject config without holder', () => {
      const invalidConfig = {
        placeholder: 'Start writing...',
        autofocus: true
      };

      expect(validator.validateConfig(invalidConfig)).toBe(false);
    });

    it('should validate tool configuration', () => {
      const validToolConfig = {
        class: 'SomeToolClass',
        config: {
          placeholder: 'Enter text'
        }
      };

      expect(validator.validateToolConfig(validToolConfig)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', () => {
      // Test with null/undefined inputs
      expect(() => validator.validateContent(null)).not.toThrow();
      expect(() => validator.validateContent(undefined)).not.toThrow();
      expect(() => validator.validateBlock(null)).not.toThrow();
      
      expect(validator.validateContent(null)).toBe(false);
      expect(validator.validateContent(undefined)).toBe(false);
      expect(validator.validateBlock(null)).toBe(false);
    });

    it('should provide validation error messages', () => {
      const invalidData = {
        blocks: 'not-an-array'
      };

      const result = validator.validateContentWithDetails(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Validation Rules', () => {
    it('should allow custom validation rules', () => {
      validator.addCustomRule('customBlock', (block) => {
        return block.data.customField !== undefined;
      });

      const blockWithCustomField = {
        id: 'block-1',
        type: 'customBlock',
        data: {
          customField: 'value'
        }
      };

      const blockWithoutCustomField = {
        id: 'block-2',
        type: 'customBlock',
        data: {}
      };

      expect(validator.validateBlock(blockWithCustomField)).toBe(true);
      expect(validator.validateBlock(blockWithoutCustomField)).toBe(false);
    });

    it('should remove custom validation rules', () => {
      validator.addCustomRule('tempRule', () => true);
      validator.removeCustomRule('tempRule');

      expect(validator.hasCustomRule('tempRule')).toBe(false);
    });
  });
});
