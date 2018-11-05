#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const os = require('os')
const { spawnSync, execSync } = require('child_process')
const cwd = process.cwd()

// Edit dev dependencies here
const devPkgs = [
  'prettier',
  'lint-staged',
  'husky',
  'eslint-config-prettier',
  'eslint-plugin-react-hooks',
  '-D',
]

// Determine whether to use yarn or npm
const [, , option] = process.argv
const cmd = option === '-N' ? 'npm' : 'yarn'
const args = cmd === 'yarn' ? ['add', ...devPkgs] : ['install', ...devPkgs]

const isCreateReactApp = fs.existsSync('node_modules/react-scripts')
const isGastbyjs = fs.existsSync('node_modules/gatsby')

// package.json configurations
const packagejson = require(path.join(cwd, 'package.json'))
const husky = {
  hooks: {
    'pre-commit': 'lint-staged',
  },
}
const lint = {
  'lint-staged': {
    'src/**/*.{js,jsx,json,css}': ['prettier --write', 'git add'],
  },
}

const prettierrc = `{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "avoid",
  "requirePragma": false,
  "insertPragma": false,
  "proseWrap": "preserve"
}
`

if (isCreateReactApp) {
  spawnSync(cmd, args, { stdio: 'inherit' })

  const eslintConfig = {
    extends: ['react-app', 'prettier/react', 'prettier'],
    plugins: ['react-hooks'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'comma-dangle': ['error', 'always'],
    },
  }

  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({ ...packagejson, eslintConfig, husky, ...lint }, null, 2) +
      os.EOL,
  )

  fs.writeFileSync(path.join(cwd, '.prettierrc'), prettierrc)
} else if (isGastbyjs) {
  const gatsbyArgs = [...args, 'babel-eslint', 'eslint', 'eslint-plugin-react']

  execSync('git init', { stdio: 'ignore' })
  execSync('git add -A', { stdio: 'ignore' })
  execSync('git commit -m "Initial commit"', { stdio: 'ignore' })
  spawnSync(cmd, gatsbyArgs, { stdio: 'inherit' })

  const eslintConfig = {
    parser: 'babel-eslint',
    rules: {
      strict: 0,
      'no-ternary': 'off',
      'comma-dangle': ['error', 'always'],
      'react/prop-types': 0,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'prettier/react',
      'prettier',
    ],
    parserOptions: {
      ecmaVersion: 8,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    env: {
      es6: true,
      browser: true,
      node: true,
    },
  }

  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({ ...packagejson, eslintConfig, husky, ...lint }, null, 2) +
      os.EOL,
  )

  fs.writeFileSync(path.join(cwd, '.prettierrc'), prettierrc)
} else {
  console.log('You appear to not be in a Create-React-App or GatsbyJS project.')
}
