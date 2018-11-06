#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const os = require('os')
const { spawnSync, execSync, } = require('child_process')
const cwd = process.cwd()

// Edit primary dev dependencies here
const devPkgs = [
  'eslint-config-prettier',
  'eslint-plugin-react-hooks',
  'flow-bin',
  'husky',
  'lint-staged',
  'prettier',
  '-D',
]

// Determine whether to use yarn or npm
const [, , option,] = process.argv
const cmd = option === '-N' ? 'npm' : 'yarn'
const args = cmd === 'yarn' ? ['add', ...devPkgs,] : ['install', ...devPkgs,]

// Are we in a create-react-app or a GatsbyJs project
const isCreateReactApp = fs.existsSync('node_modules/react-scripts')
const isGastbyjs = fs.existsSync('node_modules/gatsby')

// package.json configurations
const packagejson = require(path.join(cwd, 'package.json'))
/* Properties are separated out to remove unwanted boilerplate from the default 
   GatsbyJS package.json, and to add custom propeties such as scripts etc. */
const dependencies = packagejson.dependencies
const scripts = { ...packagejson.scripts, flow: 'flow', }

const eslintConfig = {
  extends: ['react-app', 'prettier/react', 'prettier',],
  plugins: ['react-hooks',],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'comma-dangle': ['error', 'always',],
  },
}
const husky = {
  hooks: {
    'pre-commit': 'lint-staged',
  },
}
const lint = {
  'lint-staged': {
    'src/**/*.{js,jsx,json,css}': ['prettier --write', 'git add',],
  },
}

// Other configuration files
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
}`

const gatsbyconfigjs = `module.exports = {
  siteMetadata: {
    title: 'Gatsby Default Starter',
  },
  plugins: [
    'gatsby-plugin-flow',
    'gatsby-plugin-react-helmet',
    {
      resolve: \`gatsby-source-filesystem\`,
      options: {
        name: \`images\`,
        path: \`\${__dirname}/src/images\`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: \`gatsby-plugin-manifest\`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#c71f16',
        theme_color: '#c71f16',
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    // 'gatsby-plugin-offline',
  ],
}
`

// create-react-app setup
if (isCreateReactApp) {
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify(
      { ...packagejson, scripts, eslintConfig, husky, ...lint, },
      null,
      2,
    ) + os.EOL,
  )

  fs.writeFileSync(path.join(cwd, '.prettierrc'), prettierrc)

  spawnSync(cmd, args, { stdio: 'inherit', })

  execSync(`${cmd === 'yarn' ? cmd : `${cmd} run`} flow init`, {
    stdio: 'ignore',
  })

  execSync('git add -A', { stdio: 'ignore', })
  execSync('git commit -m "Development configuration updated"', {
    stdio: 'ignore',
  })

  // GatsbyJS setup
} else if (isGastbyjs) {
  // Edit GatsbyJS specific dev dependancies here
  const gatsbyArgs = [
    ...args,
    'babel-eslint',
    'eslint',
    'eslint-config-react-app',
    'eslint-plugin-flowtype',
    'eslint-plugin-import',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-react',
    'gatsby-plugin-flow',
  ]

  execSync('git init', { stdio: 'ignore', })
  execSync('git add -A', { stdio: 'ignore', })
  execSync('git commit -m "Initial commit"', { stdio: 'ignore', })

  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify(
      { dependencies, scripts, eslintConfig, husky, ...lint, },
      null,
      2,
    ) + os.EOL,
  )

  fs.writeFileSync(path.join(cwd, '.prettierrc'), prettierrc)
  fs.writeFileSync(path.join(cwd, 'gatsby-config.js'), gatsbyconfigjs)

  spawnSync(cmd, gatsbyArgs, { stdio: 'inherit', })

  execSync(`${cmd === 'yarn' ? cmd : `${cmd} run`} flow init`, {
    stdio: 'ignore',
  })

  execSync('git add -A', { stdio: 'ignore', })
  execSync('git commit -m "Development configuration updated"', {
    stdio: 'ignore',
  })

  // If you are neither in a create-react-app or GatsbyJS project
} else {
  console.log(
    `You appear to not be in a create-react-app or GatsbyJS project.
    To use this script run it from the root of your create-react-app or GatsbyJS project.`,
  )
}
