const fs = require('fs')
module.exports = function (wallaby) {
  babelrc = JSON.parse(fs.readFileSync('./use-shopping-cart/.babelrc'))
  return {
    files: [
      'use-shopping-cart/core/**/*.js?(x)',
      'use-shopping-cart/react/**/*.js?(x)',
      'use-shopping-cart/utilities/**/*.js?(x)',
      '!use-shopping-cart/**/*.test.js?(x)'
    ],
    tests: [
      'use-shopping-cart/core/**/*.test.js?(x)',
      'use-shopping-cart/react/**/*.test.js?(x)',
      'use-shopping-cart/utilities/**/*.test.js?(x)'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    compilers: {
      'use-shopping-cart/**/*.js?(x)': wallaby.compilers.babel(babelrc)
    },

    testFramework: 'jest',

    debug: true,
    trace: true,

    workers: { initial: 1, regular: 1 }
  }
}
