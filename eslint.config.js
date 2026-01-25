// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

// TODO: define a more specific configuration
// Also, beware of possible conflicts with prettier!
// Crazy how I need to install 4 fucking dependencies for a stupid linter + one more library for fixing conflicts with another library 🤯
// In what world are we living in...
export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
);