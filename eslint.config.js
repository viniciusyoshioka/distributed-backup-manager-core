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
      '@stylistic/max-len': ['warn', {
        code: 100,
        tabWidth: 2,
        comments: 100,
        // ignorePattern: "",
        ignoreComments: false,
        ignoreTrailingComments: false,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
]
