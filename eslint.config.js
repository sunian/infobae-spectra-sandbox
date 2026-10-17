const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'android/',
      'ios/',
      'specs/',
      '.specify/',
      '.claude/',
      '.maestro/',
    ],
  },
  {
    // Constitution V: no untyped escape hatches.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Constitution II: no user-facing string literals in JSX. Text comes from t().
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'react/jsx-no-literals': ['error', { noStrings: true, ignoreProps: true }],
    },
  },
  {
    // Constitution I: screens and routes use design system components, not raw views.
    files: ['app/**/*.{ts,tsx}', 'src/screens/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text', 'View', 'StyleSheet', 'Pressable'],
              message: 'Use components from @/design-system.',
            },
          ],
        },
      ],
    },
  },
  prettierConfig,
]);
