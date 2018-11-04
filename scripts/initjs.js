#!/usr/bin/env node

const fs = require('fs-extra')
const spawn = require('cross-spawn')

const [, , flag,] = process.argv
const cmd = flag === '-N' ? 'npm' : 'yarn'

const isCreateReactApp = fs.pathExistsSync('node_modules/react-scripts')
const isGastbyjs = fs.pathExistsSync('node_modules/gatsby')

// edit deps here
const pkgs = ['react@next', 'react-dom@next', 'styled-components',]
const devPkgs = [
  'prettier',
  'lint-staged',
  'husky',
  'eslint-config-prettier',
  'eslint-plugin-react-hooks',
  '-D',
]

// using yarn or npm?
const args = cmd === 'yarn' ? ['add', ...pkgs,] : ['install', ...pkgs,]
const devArgs = cmd === 'yarn' ? ['add', ...devPkgs,] : ['install', ...devPkgs,]

if (isCreateReactApp) {
  spawn.sync(cmd, args, { stdio: 'inherit', })
  spawn.sync(cmd, devArgs, { stdio: 'inherit', })
  writePrettierConfig()
} else if (isGastbyjs) {
  // adding gatsby plugins
  const gatsbyArgs = [
    ...pkgs,
    'babel-plugin-styled-components',
    'gatsby-plugin-styled-components',
  ]
  const gatsbyDevArgs = [
    ...devArgs,
    'babel-eslint',
    'eslint',
    'eslint-plugin-react',
  ]

  spawn.sync(cmd, gatsbyArgs, { stdio: 'inherit', })
  spawn.sync(cmd, gatsbyDevArgs, { stdio: 'inherit', })
  writeEslinConfig()
  writePrettierConfig()
} else {
  console.log('You not appear to be in a Create-React-App or GatsbyJS project.')
}

function writePrettierConfig() {
  const prettierConfig = `{
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
  try {
    fs.writeFileSync('.prettierrc', prettierConfig)
  } catch (error) {
    // ignoring
  }
}

function writeEslinConfig() {
  const eslintConfig = `{
    "parser": "babel-eslint",
    "rules": {
      "strict": 0,
      "no-ternary": "off",
      "comma-dangle": ["error", "always"],
      "react/prop-types": 0
    },
    "extends": [
      "eslint:recommended",
      "plugin:react/recommended",
      "prettier/react",
      "prettier"
    ],
    "parserOptions": {
      "ecmaVersion": 8,
      "sourceType": "module",
      "ecmaFeatures": {
        "jsx": true
      }
    },
    "env": {
      "es6": true,
      "browser": true,
      "node": true
    }
  }`

  try {
    fs.writeFileSync('.eslintrc.json', eslintConfig)
  } catch (error) {
    // ignoring
  }
}
