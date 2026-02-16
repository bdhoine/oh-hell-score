/**
 * Mock for src/storage/index.ts
 * Used in tests to avoid Ionic Storage initialization
 */

const mockStorageData = new Map<string, any>();

const mockStorageInstance = {
  create: jest.fn(() => Promise.resolve()),
  get: jest.fn((key: string) => Promise.resolve(mockStorageData.get(key))),
  set: jest.fn((key: string, value: any) => {
    mockStorageData.set(key, value);
    return Promise.resolve();
  }),
  remove: jest.fn((key: string) => {
    mockStorageData.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorageData.clear();
    return Promise.resolve();
  }),
  keys: jest.fn(() => Promise.resolve(Array.from(mockStorageData.keys()))),
  length: jest.fn(() => Promise.resolve(mockStorageData.size)),
};

export const get = jest.fn((key: string) => mockStorageInstance.get(key));

export default mockStorageInstance;
