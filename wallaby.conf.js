const fs = require('fs')
module.exports = function (wallaby) {
  babelrc = JSON.parse(fs.readFileSync('./use-shopping-cart/.babelrc'))
  return {
    files: [
      'use-shopping-cart/**/*.js?(x)',
      '!use-shopping-cart/**/*.test.js?(x)',
      '!use-shopping-cart/dist',
      '!use-shopping-cart/stats'
    ],
    tests: ['use-shopping-cart/**/*.test.js?(x)'],

    env: {
      type: 'node',
      runner: 'node'
    },

    compilers: {
      '**/*.js?(x)': wallaby.compilers.babel(babelrc)
    },

    testFramework: 'jest',

    debug: true
  }
}
