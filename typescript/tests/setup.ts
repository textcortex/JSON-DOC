import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock IntersectionObserver for jsdom
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  root: null,
  rootMargin: "",
  thresholds: [],
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  takeRecords: vi.fn(() => []),
}));
