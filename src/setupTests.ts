// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Import custom matchers
import './test/utils/custom-matchers';

// Mock matchmedia
window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: function () {
    },
    removeListener: function () {
    }
  };
};

// Mock Ionic React hooks
jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  useIonAlert: () => [jest.fn((options?: any) => Promise.resolve())],
  useIonToast: () => [jest.fn((options?: any) => Promise.resolve()), jest.fn()],
  useIonRouter: () => ({
    push: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
}));

// Mock Ionic Storage and storage module
const mockStorageData = new Map<string, any>();

jest.mock('@ionic/storage', () => {
  return {
    Storage: jest.fn().mockImplementation(() => ({
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
    })),
  };
});
