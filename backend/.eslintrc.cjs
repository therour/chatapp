module.exports = {
  root: true,
  env: { es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:security/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'jest.config.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  overrides: [
    {
      env: { 'jest/globals': true },
      files: ['tests/**/*.test.ts'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
