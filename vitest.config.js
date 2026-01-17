import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        // Use jsdom for DOM simulation
        environment: 'jsdom',

        // Setup files run before each test file
        setupFiles: ['./src/test/setup.jsx'],

        // Include patterns for test files
        include: ['src/**/*.{test,spec}.{js,jsx}'],

        // Exclude patterns
        exclude: ['node_modules', 'dist', '.vite'],

        // Enable globals (describe, it, expect, etc.)
        globals: true,

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',

            // Coverage thresholds
            thresholds: {
                statements: 70,
                branches: 70,
                functions: 70,
                lines: 70,
            },

            // Files to include/exclude in coverage
            include: ['src/**/*.{js,jsx}'],
            exclude: [
                'src/test/**',
                'src/**/*.test.{js,jsx}',
                'src/**/*.spec.{js,jsx}',
                'node_modules/**',
            ],
        },

        // CSS handling
        css: false,

        // Reporter for test output
        reporters: ['verbose'],

        // Timeout for async tests
        testTimeout: 10000,

        // Pool configuration for faster tests
        pool: 'forks',
    },
});
