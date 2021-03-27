import sucrase from '@rollup/plugin-sucrase'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'
import alias from '@rollup/plugin-alias'

import pkg from './package.json'

const reactCommonConfig = {
  input: './react/index.js',
  external: ['react'],
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

const coreCommonConfig = {
  input: './core/store.js',
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

const aliases = () =>
  alias({
    entries: {
      uuid: 'uuid/dist/esm-browser/index.js'
    }
  })

export default [
  {
    ...reactCommonConfig,
    output: [
      {
        file: pkg.exports['.'].require,
        format: 'cjs',
        sourcemap: true
      },
      {
        name: 'UseShoppingCart',
        file: pkg.exports['.'].browser,
        format: 'umd',
        sourcemap: true,
        globals: { react: 'React' }
      }
    ]
  },
  {
    ...reactCommonConfig,
    output: {
      file: pkg.exports['.'].import,
      format: 'es',
      sourcemap: true
    },
    plugins: reactCommonConfig.plugins.concat(aliases())
  },
  {
    ...coreCommonConfig,
    output: [
      {
        file: pkg.exports['./core'].require,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },

      {
        name: 'UseShoppingCartCore',
        file: pkg.exports['./core'].browser,
        format: 'umd',
        sourcemap: true,
        globals: {
          react: 'React'
        }
      }
    ]
  },
  {
    ...coreCommonConfig,
    output: {
      file: pkg.exports['./core'].import,
      format: 'es',
      sourcemap: true,
      exports: 'named'
    },
    plugins: coreCommonConfig.plugins.concat(aliases())
  }
]
