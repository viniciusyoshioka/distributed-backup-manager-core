import { configs } from '@vinicius1313/eslint-config'


/** @type {import('eslint').Linter.Config[]} */
export default [
  ...configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: '.',
        projectService: {
          allowDefaultProject: [
            'eslint.config.js',
            'jest.config.js',
          ],
        },
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
]
