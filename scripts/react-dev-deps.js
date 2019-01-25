/*
  Provides additional dev dependencies for create-react-app
  and GatsbyJS projects. Adding prefered configurations
  for eslint, prettier, and others creating a more 
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
  'husky',
  'lint-staged',
  '-D',
]

// Determine whether to use yarn or npm
const [, , option,] = process.argv
const cmd = option === '-N' ? 'npm' : 'yarn'
const args = cmd === 'yarn' ? ['add', ...devPkgs,] : ['install', ...devPkgs,]

// Are we in a create-react-app or a GatsbyJs project
const isCreateReactApp = fs.existsSync('node_modules/react-scripts')

const isGastbyjs =
  fs.existsSync('node_modules/gatsby') || fs.existsSync('gatsby-config.js')

// package.json configurations
const packagejson = require(path.join(cwd, 'package.json'))
/* Properties are separated out to remove unwanted boilerplate from the default 
   GatsbyJS package.json, and to add custom propeties such as scripts etc. */
const dependencies = packagejson.dependencies
const scripts = {
  ...packagejson.scripts,
  format: `prettier --write \"src/**/*.{js,jsx,json,css,html,md,mdx}\"`,
}

const eslintConfig = {
  extends: ['react-app', 'prettier/react', 'prettier',],
  plugins: ['react-hooks',],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
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
    title: 'Hello Law, Good Luck!',
    description: 'Keep calm.',
    author: '@foxtrottwist',
  },
  plugins: [
    'gatsby-plugin-styled-components',
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
        name: 'starter',
        short_name: 'starter',
        start_url: '/',
        background_color: '#008080',
        theme_color: '#008080',
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

  // Adding dev packages
  spawnSync(cmd, args, { stdio: 'inherit', })

  // Additional packages
  execSync('yarn add prettier --dev --exact', { stdio: 'inherit', })
  execSync('yarn add styled-components', { stdio: 'inherit', })

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
    'eslint-plugin-flowtype', // referenced in eslint-config-react-app
    'eslint-plugin-import',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-react',
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

  // Adding dev packages
  spawnSync(cmd, gatsbyArgs, { stdio: 'inherit', })

  // Additional packages
  execSync('yarn add prettier --dev --exact', { stdio: 'inherit', })
  execSync(
    'yarn add gatsby-plugin-styled-components styled-components babel-plugin-styled-components',
    { stdio: 'inherit', },
  )

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
