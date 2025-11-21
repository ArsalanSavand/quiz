import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    files: [
      'scripts/**/*.ts',
      'projects/**/*.ts',
      'cypress/**/*.ts',
    ],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@typescript-eslint/explicit-member-accessibility': ['error', { overrides: { constructors: 'off' } }],
      'quotes': ['error', 'single'],
      'max-len': ['error', { code: 120, comments: 80 }],
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always'],
      'object-curly-spacing': ['error', 'always', { objectsInObjects: true }],
      'no-duplicate-imports': ['error'],
      'indent': ['error', 2, {
        'SwitchCase': 1,
        'FunctionDeclaration': { parameters: 'first' },
        'FunctionExpression': { parameters: 'first' },
        'CallExpression': { arguments: 'first' },
        'ignoredNodes': ['FunctionExpression > .params[decorators.length > 0]'],
      }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/alt-text': 'off',
      '@angular-eslint/template/role-has-required-aria': 'off',
    },
  },
);
