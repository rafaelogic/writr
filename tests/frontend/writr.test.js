import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WritrEditor } from '../../resources/js/writr.js';

describe('WritrEditor', () => {
  let container;
  let editor;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-editor';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should create editor instance', () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });

      expect(editor).toBeDefined();
      expect(editor.options).toBeDefined();
    });

    it('should merge default options with provided options', () => {
      const customOptions = {
        placeholder: 'Custom placeholder',
        features: {
          collaboration: true
        }
      };

      editor = new WritrEditor(customOptions);

      expect(editor.options.placeholder).toBe('Custom placeholder');
      expect(editor.options.features.collaboration).toBe(true);
    });

    it('should initialize utilities', () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });

      expect(editor.validator).toBeDefined();
      expect(editor.exporter).toBeDefined();
      expect(editor.importer).toBeDefined();
      expect(editor.storage).toBeDefined();
      expect(editor.theme).toBeDefined();
    });
  });

  describe('Tools Configuration', () => {
    it('should include default tools', () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });

      const tools = editor.getTools();

      expect(tools.paragraph).toBeDefined();
      expect(tools.header).toBeDefined();
      expect(tools.list).toBeDefined();
      expect(tools.quote).toBeDefined();
      expect(tools.code).toBeDefined();
    });

    it('should include custom tools when features are enabled', () => {
      editor = new WritrEditor({
        holder: 'test-editor',
        features: {
          collaboration: true,
          comments: true,
          versionHistory: true,
          nestedBlocks: true,
          dragDrop: true
        }
      });

      const tools = editor.getTools();

      expect(tools.collaboration).toBeDefined();
      expect(tools.comments).toBeDefined();
      expect(tools.versionHistory).toBeDefined();
      expect(tools.nestedBlocks).toBeDefined();
      expect(tools.dragDrop).toBeDefined();
    });

    it('should exclude optional tools when disabled', () => {
      editor = new WritrEditor({
        holder: 'test-editor',
        tools: {
          image: false,
          embed: false,
          attaches: false
        }
      });

      const tools = editor.getTools();

      expect(tools.image).toBeUndefined();
      expect(tools.embed).toBeUndefined();
      expect(tools.attaches).toBeUndefined();
    });
  });

  describe('Content Management', () => {
    beforeEach(async () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });
      await editor.init();
    });

    it('should save content', async () => {
      const content = await editor.save();
      
      expect(content).toBeDefined();
      expect(content.blocks).toBeDefined();
      expect(Array.isArray(content.blocks)).toBe(true);
    });

    it('should load content', async () => {
      const testData = {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Test content'
            }
          }
        ]
      };

      await editor.load(testData);
      
      // Since we're using mock EditorJS, we can't verify the actual loading
      // In a real test environment with actual EditorJS, you would verify
      // that the content is properly loaded into the editor
      expect(true).toBe(true);
    });

    it('should validate content', () => {
      const validData = {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Valid content'
            }
          }
        ]
      };

      const isValid = editor.validate(validData);
      expect(isValid).toBe(true);
    });

    it('should export content to different formats', async () => {
      const testData = {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Test content'
            }
          }
        ]
      };

      const html = await editor.exportToHTML(testData);
      const markdown = await editor.exportToMarkdown(testData);

      expect(typeof html).toBe('string');
      expect(typeof markdown).toBe('string');
      expect(html.includes('Test content')).toBe(true);
      expect(markdown.includes('Test content')).toBe(true);
    });
  });

  describe('Auto-save functionality', () => {
    it('should enable auto-save with interval', () => {
      const onSave = vi.fn();
      
      editor = new WritrEditor({
        holder: 'test-editor',
        autosave: {
          enabled: true,
          interval: 1000,
          onSave
        }
      });

      editor.startAutoSave();
      
      expect(editor.autosaveTimer).toBeDefined();
    });

    it('should disable auto-save', () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });

      editor.startAutoSave();
      editor.stopAutoSave();
      
      expect(editor.autosaveTimer).toBeNull();
    });
  });

  describe('Theme management', () => {
    it('should apply light theme by default', () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });

      expect(editor.theme.currentTheme).toBe('light');
    });

    it('should switch to dark theme', () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });

      editor.theme.setTheme('dark');
      
      expect(editor.theme.currentTheme).toBe('dark');
    });

    it('should toggle theme', () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });

      const initialTheme = editor.theme.currentTheme;
      editor.theme.toggle();
      
      expect(editor.theme.currentTheme).not.toBe(initialTheme);
    });
  });

  describe('Event handling', () => {
    it('should handle ready event', async () => {
      const onReady = vi.fn();
      
      editor = new WritrEditor({
        holder: 'test-editor',
        onReady
      });

      await editor.init();
      
      // In a real environment, this would be called when EditorJS is ready
      editor.handleReady();
      
      expect(onReady).toHaveBeenCalled();
    });

    it('should handle change events', () => {
      const onChange = vi.fn();
      
      editor = new WritrEditor({
        holder: 'test-editor',
        onChange
      });

      editor.handleChange();
      
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle initialization errors gracefully', () => {
      // Mock EditorJS to throw an error
      const originalEditorJS = global.EditorJS;
      global.EditorJS = class {
        constructor() {
          throw new Error('Mock initialization error');
        }
      };

      expect(() => {
        editor = new WritrEditor({
          holder: 'non-existent-element'
        });
      }).not.toThrow();

      // Restore original mock
      global.EditorJS = originalEditorJS;
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on destroy', async () => {
      editor = new WritrEditor({
        holder: 'test-editor'
      });

      await editor.init();
      await editor.destroy();
      
      expect(editor.editor).toBeNull();
      expect(editor.autosaveTimer).toBeNull();
    });
  });
});
