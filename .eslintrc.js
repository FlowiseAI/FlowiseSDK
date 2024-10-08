module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'unused-imports', 'prettier'],
    ignorePatterns: [
        '**/node_modules',
        '**/dist',
        '**/build',
        '**/package-lock.json',
    ],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'warn',
        'unused-imports/no-unused-vars': [
            'warn',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_',
            },
        ],
        'no-undef': 'off',
        'no-console': [
            process.env.CI ? 'error' : 'warn',
            { allow: ['warn', 'error', 'info'] },
        ],
        'prettier/prettier': 'error',
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off"
    },
};
