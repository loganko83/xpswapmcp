import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web3 APIs
global.ethereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true
};

// Mock crypto.getRandomValues for testing
Object.defineProperty(global.crypto, 'getRandomValues', {
  value: vi.fn().mockImplementation((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  })
});

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:5000',
    origin: 'http://localhost:5000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});
