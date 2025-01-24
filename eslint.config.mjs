// eslint.config.js
import js from "@eslint/js";
import eslintConfigGoogle from 'eslint-config-google';

export default [
    eslintConfigGoogle,
    js.configs.recommended,
    {
        rules: {
            'valid-jsdoc': 'off',
            'require-jsdoc': 'off',
            'indent': ['warn', 'tab'],
            'no-undef': 'off',
            'no-tabs': ['off', { allowIndentationTabs: true }],
            'no-invalid-this': 'off',
            'space-before-function-paren': 'off',
            'max-len': ['warn', { code: 100 }],
        },
        languageOptions: {
            ecmaVersion: 'latest'
        }
    }
];
