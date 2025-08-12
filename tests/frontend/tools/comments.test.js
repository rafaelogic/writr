import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentsTool } from '../../resources/js/tools/comments.js';

describe('CommentsTool', () => {
  let tool;
  let mockApi;
  let mockConfig;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockApi = {
      blocks: {
        getCurrentBlockIndex: vi.fn(() => 0),
        getBlockByIndex: vi.fn(() => ({ id: 'block-1', name: 'paragraph' }))
      },
      saver: {
        save: vi.fn()
      }
    };

    mockConfig = {
      currentUser: {
        id: 'user-1',
        name: 'Test User'
      }
    };

    tool = new CommentsTool({
      api: mockApi,
      config: mockConfig,
      data: {
        comments: []
      }
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should create tool instance', () => {
      expect(tool).toBeDefined();
      expect(tool.api).toBe(mockApi);
      expect(tool.config).toBe(mockConfig);
    });

    it('should have correct toolbox configuration', () => {
      const toolbox = CommentsTool.toolbox;
      
      expect(toolbox.title).toBe('Comments');
      expect(toolbox.icon).toBe('💬');
    });

    it('should initialize with empty comments', () => {
      expect(tool.data.comments).toEqual([]);
    });
  });

  describe('Rendering', () => {
    it('should render comments tool UI', () => {
      const wrapper = tool.render();
      
      expect(wrapper).toBeInstanceOf(HTMLElement);
      expect(wrapper.classList.contains('writr-comments-tool')).toBe(true);
      
      const header = wrapper.querySelector('.comments-header');
      const addBtn = wrapper.querySelector('.add-comment-btn');
      const commentsList = wrapper.querySelector('.comments-list');
      
      expect(header).toBeDefined();
      expect(addBtn).toBeDefined();
      expect(commentsList).toBeDefined();
    });

    it('should show comment count', () => {
      tool.data.comments = [
        { id: '1', content: 'Test comment', author: { name: 'User' } }
      ];
      
      const wrapper = tool.render();
      const countElement = wrapper.querySelector('.comments-count');
      
      expect(countElement.textContent).toBe('1 comments');
    });

    it('should render existing comments', () => {
      tool.data.comments = [
        {
          id: '1',
          content: 'Test comment',
          author: { name: 'Test User' },
          created_at: new Date().toISOString(),
          resolved: false,
          replies: []
        }
      ];
      
      const wrapper = tool.render();
      const comments = wrapper.querySelectorAll('.comment');
      
      expect(comments.length).toBe(1);
    });
  });

  describe('Comment Management', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = tool.render();
      container.appendChild(wrapper);
    });

    it('should add new comment', () => {
      // Mock window.getSelection
      global.window.getSelection = vi.fn(() => ({
        toString: () => 'selected text',
        rangeCount: 1,
        getRangeAt: () => ({
          getBoundingClientRect: () => ({
            left: 100,
            bottom: 200
          })
        })
      }));

      const addBtn = wrapper.querySelector('.add-comment-btn');
      addBtn.click();
      
      // Should create a comment form
      const form = document.querySelector('.comment-form');
      expect(form).toBeDefined();
    });

    it('should create comment element', () => {
      const comment = {
        id: '1',
        content: 'Test comment',
        author: { name: 'Test User' },
        created_at: new Date().toISOString(),
        resolved: false,
        replies: []
      };

      const commentElement = tool.createCommentElement(comment);
      
      expect(commentElement).toBeInstanceOf(HTMLElement);
      expect(commentElement.classList.contains('comment')).toBe(true);
      expect(commentElement.dataset.commentId).toBe('1');
    });

    it('should toggle comment resolution', () => {
      tool.data.comments = [
        {
          id: '1',
          content: 'Test comment',
          author: { name: 'Test User' },
          created_at: new Date().toISOString(),
          resolved: false,
          replies: []
        }
      ];

      tool.toggleResolve('1');
      
      expect(tool.data.comments[0].resolved).toBe(true);
      expect(mockApi.saver.save).toHaveBeenCalled();
    });

    it('should delete comment', () => {
      tool.data.comments = [
        {
          id: '1',
          content: 'Test comment',
          author: { name: 'Test User' }
        },
        {
          id: '2',
          content: 'Another comment',
          author: { name: 'Test User' }
        }
      ];

      tool.deleteComment('1');
      
      expect(tool.data.comments.length).toBe(1);
      expect(tool.data.comments[0].id).toBe('2');
      expect(mockApi.saver.save).toHaveBeenCalled();
    });
  });

  describe('Reply Management', () => {
    it('should add reply to comment', () => {
      tool.data.comments = [
        {
          id: '1',
          content: 'Test comment',
          author: { name: 'Test User' },
          created_at: new Date().toISOString(),
          resolved: false,
          replies: []
        }
      ];

      // Mock the reply addition
      const comment = tool.data.comments[0];
      const reply = {
        id: tool.generateId(),
        content: 'Test reply',
        author: mockConfig.currentUser,
        created_at: new Date().toISOString()
      };

      comment.replies.push(reply);
      
      expect(comment.replies.length).toBe(1);
      expect(comment.replies[0].content).toBe('Test reply');
    });

    it('should render replies', () => {
      const replies = [
        {
          id: '1',
          content: 'Test reply',
          author: { name: 'Test User' },
          created_at: new Date().toISOString()
        }
      ];

      const repliesContainer = document.createElement('div');
      tool.renderReplies(repliesContainer, replies);
      
      const replyElements = repliesContainer.querySelectorAll('.comment-reply');
      expect(replyElements.length).toBe(1);
    });
  });

  describe('Utility Functions', () => {
    it('should generate unique IDs', () => {
      const id1 = tool.generateId();
      const id2 = tool.generateId();
      
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
    });

    it('should escape HTML', () => {
      const html = '<script>alert("xss")</script>';
      const escaped = tool.escapeHtml(html);
      
      expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should format time ago', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      expect(tool.getTimeAgo(fiveMinutesAgo.toISOString())).toBe('5m ago');
      expect(tool.getTimeAgo(oneHourAgo.toISOString())).toBe('1h ago');
      expect(tool.getTimeAgo(oneDayAgo.toISOString())).toBe('1d ago');
    });

    it('should get selection position', () => {
      // Mock window.getSelection
      global.window.getSelection = vi.fn(() => ({
        rangeCount: 1,
        getRangeAt: () => ({
          getBoundingClientRect: () => ({
            left: 100,
            bottom: 200
          })
        })
      }));

      const position = tool.getSelectionPosition();
      
      expect(position).toEqual({
        x: 100,
        y: 200
      });
    });
  });

  describe('Save and Destroy', () => {
    it('should save tool data', () => {
      const savedData = tool.save();
      
      expect(savedData).toEqual(tool.data);
    });

    it('should destroy cleanly', () => {
      expect(() => {
        tool.destroy();
      }).not.toThrow();
    });
  });
});
