import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: ['dist/**', 'dev-dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Catch dead imports/vars — the cheapest signal for leftover code after refactors.
      // Underscore-prefixed names are intentionally ignored.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // New JSX transform doesn't need React in scope; types aren't used here.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Mark JSX-referenced identifiers as used so no-unused-vars doesn't flag components.
      'react/jsx-uses-vars': 'error',
      // High-value correctness/a11y rules, kept at warn so CI stays green while the
      // existing files are brought into line incrementally.
      'react/jsx-key': 'warn',
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
    },
  },
];
