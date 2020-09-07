const fs = require('fs')
fs.copyFileSync(
  '../../use-shopping-cart/dist/index.umd.js',
  './public/use-shopping-cart.umd.js'
)
console.log('uSC copied successfully')
