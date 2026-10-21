// Test doubles for native modules. Tests that need other behavior override them with jest.mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-navigation-bar', () => ({ NavigationBar: jest.fn(() => null) }));

// Tests never call the live Infobae APIs. They get the bundled fixture content.
process.env.EXPO_PUBLIC_CONTENT_SOURCE = 'fixture';
