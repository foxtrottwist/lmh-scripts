#!/usr/bin/env node

const fs = require('fs')
const { spawnSync, } = require('child_process')

// Edit dev dependencies here
const devPkgs = [
  'prettier',
  'lint-staged',
  'husky',
  'eslint-config-prettier',
  'eslint-plugin-react-hooks',
  '-D',
]
const [, , option,] = process.argv
const cmd = option === '-N' ? 'npm' : 'yarn'
const args = cmd === 'yarn' ? ['add', ...devPkgs,] : ['install', ...devPkgs,]

const isCreateReactApp = fs.existsSync('node_modules/react-scripts')
const isGastbyjs = fs.existsSync('node_modules/gatsby')

if (isCreateReactApp) {
  spawnSync(cmd, args, { stdio: 'inherit', })

  writePrettierConfig()
} else if (isGastbyjs) {
  const gatsbyArgs = [...args, 'babel-eslint', 'eslint', 'eslint-plugin-react',]

  spawnSync(cmd, gatsbyArgs, { stdio: 'inherit', })

  writeEslinConfig()

  writePrettierConfig()
} else {
  console.log('You appear to not be in a Create-React-App or GatsbyJS project.')
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
