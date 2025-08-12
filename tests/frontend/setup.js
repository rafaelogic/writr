// Test setup for frontend tests
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/dom';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Editor.js for testing
global.EditorJS = class MockEditorJS {
  constructor(config) {
    this.config = config;
    this.blocks = {
      getBlocksCount: () => 0,
      getBlockByIndex: () => null,
      getCurrentBlockIndex: () => 0,
      clear: () => {},
      render: () => {},
      insert: () => {},
      delete: () => {}
    };
    this.saver = {
      save: () => Promise.resolve({ blocks: [] })
    };
    this.api = {
      blocks: this.blocks,
      saver: this.saver
    };
  }
  
  isReady() {
    return Promise.resolve();
  }
  
  save() {
    return Promise.resolve({ blocks: [] });
  }
  
  destroy() {
    return Promise.resolve();
  }
};

// Mock DOM APIs
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock WebSocket for collaboration tests
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 10);
  }
  
  send(data) {
    // Mock send
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
};

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;
