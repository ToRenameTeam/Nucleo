// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    files: [
      'users-service/src/**/*.ts',
      'master-data-service/src/**/*.ts',
      'frontend-service/src/**/*.ts',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended
);
