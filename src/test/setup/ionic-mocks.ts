/**
 * Enhanced Ionic mocks for testing
 * Mocks Ionic components, hooks, and Storage to avoid test flakiness
 */

// Mock useIonAlert
export const mockIonAlert = jest.fn(() => Promise.resolve());
export const mockUseIonAlert = jest.fn(() => [mockIonAlert]);

// Mock useIonToast
export const mockIonToast = jest.fn(() => Promise.resolve());
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const mockUseIonToast = jest.fn(() => [mockIonToast, () => {}]);

// Mock useIonRouter
export const mockIonRouterPush = jest.fn();
export const mockUseIonRouter = jest.fn(() => ({
  push: mockIonRouterPush,
  goBack: jest.fn(),
  canGoBack: jest.fn(() => true),
}));

// Mock Ionic Storage
const mockStorage = new Map<string, any>();

export const mockIonicStorage = {
  create: jest.fn(() => Promise.resolve({
    get: jest.fn((key: string) => Promise.resolve(mockStorage.get(key))),
    set: jest.fn((key: string, value: any) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    }),
    remove: jest.fn((key: string) => {
      mockStorage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      mockStorage.clear();
      return Promise.resolve();
    }),
    keys: jest.fn(() => Promise.resolve(Array.from(mockStorage.keys()))),
    length: jest.fn(() => Promise.resolve(mockStorage.size)),
  })),
};

// Helper to clear storage between tests
export const clearMockStorage = (): void => {
  mockStorage.clear();
};

// Helper to preset storage values for tests
export const setMockStorageValue = (key: string, value: any): void => {
  mockStorage.set(key, value);
};

// Helper to get storage values in tests
export const getMockStorageValue = (key: string): any => {
  return mockStorage.get(key);
};

// Clear all mock function calls
export const clearAllIonicMocks = (): void => {
  mockIonAlert.mockClear();
  mockUseIonAlert.mockClear();
  mockIonToast.mockClear();
  mockUseIonToast.mockClear();
  mockIonRouterPush.mockClear();
  mockUseIonRouter.mockClear();
  clearMockStorage();
};
