import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

// Mock window.addEventListener and removeEventListener
Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: vi.fn()
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: vi.fn()
});
