import sucrase from '@rollup/plugin-sucrase'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'

import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    external: ['react', 'crypto'],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true
      },
      {
        name: 'UseShoppingCart',
        file: pkg.umd,
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
    input: 'core/slices/cartSlice.js',
    external: ['@reduxjs/toolkit', 'uuid'],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        exports: 'named'
      },
      {
        name: 'UseShoppingCart-Core',
        file: pkg.umd,
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
