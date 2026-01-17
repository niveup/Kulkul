/**
 * lint-staged configuration
 * 
 * Runs linting and formatting on staged files before commit
 */
export default {
    // JavaScript/JSX files - lint and format
    '*.{js,jsx}': [
        'eslint --fix --max-warnings=0',
        'prettier --write',
    ],

    // JSON, CSS, and Markdown - format only
    '*.{json,css,md}': [
        'prettier --write',
    ],
};
