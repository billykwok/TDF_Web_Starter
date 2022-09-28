module.exports = {
  env: {
    worker: true,
    commonjs: true,
    amd: true,
    es6: true,
    node: true,
    browser: true,
    'shared-node-browser': true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    ecmaFeatures: { impliedStrict: true, jsx: true },
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.ts', '.tsx', '.png'] },
      webpack: { config: './.webpack/client.dev.ts' },
    },
  },
  plugins: ['import', '@babel', 'prettier', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/react',
  ],
  rules: {
    'consistent-return': 'off',
    'max-len': 'off',
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'import', 'prettier'],
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended',
        'prettier',
        'prettier/react',
      ],
      rules: {
        '@typescript-eslint/no-floating-promises': [
          'error',
          { ignoreIIFE: true },
        ],
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: false,
          },
        ],
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': 'allow-with-description',
            'ts-nocheck': 'allow-with-description',
            'ts-check': 'allow-with-description',
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            vars: 'all',
            varsIgnorePattern: 'createElement',
            args: 'after-used',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/no-empty-function': [
          'error',
          { allow: ['methods'] },
        ],
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/prefer-includes': 'off',
        '@typescript-eslint/camelcase': 'off',
        'consistent-return': 'off',
        'max-len': 'off',
        'no-console': 'off',
      },
    },
  ],
};
