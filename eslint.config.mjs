// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react'; // For general React rules
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // --- 1. Global Ignores ---
  // Files and directories to ignore across the entire project
  {
    ignores: ['out/**', 'dist/**', '**/*.d.ts', 'node_modules/**', '.vscode-test/**', '.vscode-test.mjs', 'eslint.config.mjs'],
  },

  // --- 2. Base Configurations (Applied to ALL files by default) ---

  // Recommended JavaScript rules
  js.configs.recommended,

  // Recommended TypeScript rules from typescript-eslint
  // This automatically sets up the parser and disables conflicting JS rules.
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // Adds stylistic TypeScript rules (e.g., consistent-type-imports)

  // Disables ESLint rules that might conflict with Prettier
  // Always put this last in the base configs to ensure it overrides others.
  prettierConfig,
  // weird thing to do, but it works
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    }
  },

  // --- 3. Configuration for VS Code Extension (Node.js/TypeScript) ---
  {
    files: ['src/**/*.ts'], // Only apply to your extension's TypeScript files
    // Specific language options for this part of the project
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      // Define global variables for the Node.js environment
      globals: {
        ...globals.node,
        // Add any other specific globals for your extension if needed
      },
      // Specify the TypeScript parser for these files
      parser: tseslint.parser,
      // Configuration for the TypeScript parser, crucial for type-aware linting
      parserOptions: {
        // project: ['./tsconfig.json'], // Path to your main tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Helps resolve relative paths correctly
        projectService: true,
      },
    },
    // Specific rules for your extension's TypeScript files
    rules: {
      // You can override or add rules here.
      // Example: 'warn' level for specific TypeScript rules
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
      ],
      'curly': 'warn', // Require curly braces for all control statements
      'eqeqeq': 'warn', // Require the use of '===' and '!=='
      'no-throw-literal': 'warn', // Disallow throwing literals as exceptions
      'semi': 'off', // Let Prettier handle semicolons (or enforce no semicolons)
      '@typescript-eslint/no-floating-promises': 'error', // Good for async operations
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_', // Ignore unused arguments starting with _
          varsIgnorePattern: '^_', // Ignore unused variables starting with _
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Or 'warn' depending on your preference
    },
  },

  // --- 4. Configuration for Webview UI (React/TypeScript) ---
  {
    files: ['webview-ui/src/**/*.{ts,tsx}'], // Only apply to your React webview files
    // Specific language options for the React part of the project
    languageOptions: {
      ecmaVersion: 2020, // Or 2021/2022 if your target environment supports it
      sourceType: 'module',
      // Define global variables for the browser environment
      globals: {
        ...globals.browser,
      },
      // Specify the TypeScript parser for these files
      parser: tseslint.parser,
      // Configuration for the TypeScript parser, including JSX support
      parserOptions: {
        // project: ['./webview-ui/tsconfig.json'], // Path to your webview's tsconfig.json
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    // Define plugins specific to the React environment
    plugins: {
      react, // General React rules
      'react-hooks': reactHooks, // Rules for React Hooks
      'react-refresh': reactRefresh, // Rules for React Fast Refresh
    },
    // Specific rules for your React/TypeScript files
    rules: {
      // General React rules (e.g., props validation, accessibility)
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // Use this for React 17+ with new JSX transform

      // React Hooks specific rules
      ...reactHooks.configs.recommended.rules,

      // React Refresh specific rule
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Override or add other React/TypeScript specific rules
      'react/prop-types': 'off', // Often not needed with TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed for React 17+ with new JSX transform
      '@typescript-eslint/explicit-function-return-type': 'off', // Often too verbose in React components
      'semi': 'off', // Let Prettier handle semicolons
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  },
]);