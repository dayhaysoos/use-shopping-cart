import sucrase from '@rollup/plugin-sucrase'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'

import pkg from './package.json'

export default [
  {
    input: './react/index.js',
    external: ['react', 'crypto'],
    output: [
      {
        file: pkg.exports['.'].require,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: pkg.exports['.'].import,
        format: 'es',
        sourcemap: true
      },
      {
        name: 'UseShoppingCart',
        file: pkg.exports['.'].browser,
        format: 'umd',
        sourcemap: true,
        globals: { react: 'React', crypto: 'crypto' }
      }
    ],
    plugins: [
      url({ exclude: ['**/*.svg'] }),
      sucrase({
        exclude: 'node_modules/**/*',
        transforms: ['jsx']
      }),
      resolve(),
      commonjs()
    ]
  },
  {
    input: './core/store.js',
    external: ['@reduxjs/toolkit', 'uuid'],
    output: [
      {
        file: pkg.exports['./core'].require,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: pkg.exports['./core'].import,
        format: 'es',
        sourcemap: true,
        exports: 'named'
      },
      {
        name: 'UseShoppingCartCore',
        file: pkg.exports['./core'].browser,
        format: 'umd',
        sourcemap: true,
        globals: {
          react: 'React',
          uuid: 'uuid',
          '@reduxjs/toolkit': '@reduxjs/toolkit'
        }
      }
    ],
    plugins: [
      url({ exclude: ['**/*.svg'] }),
      sucrase({
        exclude: 'node_modules/**/*',
        transforms: ['jsx']
      }),
      resolve(),
      commonjs()
    ]
  }
]
