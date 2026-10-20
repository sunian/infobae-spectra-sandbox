import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/'] },
  ...tseslint.configs.recommended,
  {
    // Constitution V: no untyped escape hatches.
    files: ['**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
);
