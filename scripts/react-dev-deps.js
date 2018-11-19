#!/usr/bin/env node

/*
  Provides additional dev dependencies for create-react-app
  and GatsbyJS projects. Adding prefered configurations
  for eslint, flow, prettier, and others creating a more 
  homogeneous enviroment to develop across both  GatsbyJs
  and create-react-app.
*/

const fs = require('fs')
const path = require('path')
const os = require('os')
const { spawnSync, execSync, } = require('child_process')
const cwd = process.cwd()

// Edit primary dev dependencies here
const devPkgs = [
  'eslint-config-prettier',
  'eslint-plugin-react-hooks@next',
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
const scripts = {
  ...packagejson.scripts,
  flow: 'flow',
  format: `prettier --write \"src/**/*.{js,jsx,json,css,html,md,mdx}\"`,
}

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
const lintStaged = {
  'lint-staged': {
    'src/**/*.{js,jsx,json,css,html,md,mdx}': ['prettier --write', 'git add',],
  },
}

// README and configuration files
const flowInit = cmd === 'yarn' ? `${cmd} flow init` : `${cmd} run flow init`

const READMEmd = `<div align="center">

<h1>Project Title Goes Here</h1>

<p>A short description here</p>

</div>

<hr />

### More to come...
`
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
      { ...packagejson, scripts, eslintConfig, husky, ...lintStaged, },
      null,
      2,
    ) + os.EOL,
  )

  fs.writeFileSync(path.join(cwd, '.prettierrc'), prettierrc)
  fs.writeFileSync(path.join(cwd, 'README.md'), READMEmd)

  spawnSync(cmd, args, { stdio: 'inherit', })

  execSync(flowInit, { stdio: 'ignore', })

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

  // Initialize git before adding git hooks with husky
  execSync('git init', { stdio: 'ignore', })
  execSync('git add -A', { stdio: 'ignore', })
  execSync('git commit -m "Initial commit"', { stdio: 'ignore', })

  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify(
      { dependencies, scripts, eslintConfig, husky, ...lintStaged, },
      null,
      2,
    ) + os.EOL,
  )

  fs.writeFileSync(path.join(cwd, '.prettierrc'), prettierrc)
  fs.writeFileSync(path.join(cwd, 'README.md'), READMEmd)
  fs.writeFileSync(path.join(cwd, 'gatsby-config.js'), gatsbyconfigjs)

  spawnSync(cmd, gatsbyArgs, { stdio: 'inherit', })

  execSync(flowInit, { stdio: 'ignore', })

  execSync('git add -A', { stdio: 'ignore', })
  execSync('git commit -m "Development configuration updated"', {
    stdio: 'ignore',
  })

  // If you are neither in a create-react-app or GatsbyJS project
} else {
  console.log(
    `It appears you are not in a create-react-app or GatsbyJS project.

     To use this script, run it from the root of your create-react-app 
    
     or GatsbyJS project.`,
  )
}
