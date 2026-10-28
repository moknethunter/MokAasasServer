module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/no-restricted-paths': ['error', {
      zones: [
        { target: './src/modules', from: './src/adapters' },
        { target: './src/ports',   from: './src/adapters' },
        { target: './src/shared',  from: './src/modules' },
        { target: './src/shared',  from: './src/adapters' }
      ]
    }]
  },
  ignorePatterns: ['dist', 'node_modules', '*.cjs']
};
