import sucrase from '@rollup/plugin-sucrase'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'
import alias from '@rollup/plugin-alias'
import externals from 'rollup-plugin-node-externals'
import visualizer from 'rollup-plugin-visualizer'

import pkg from './package.json'

const common = {
  react: {
    input: './react/index.js',
    external: ['react']
  },
  core: {
    input: './core/store.js'
  },
  plugins: [
    url({ exclude: ['**/*.svg'] }),
    sucrase({
      exclude: 'node_modules/**/*',
      transforms: ['jsx']
    }),
    externals({ deps: true }),
    resolve(),
    commonjs()
  ],
  get aliases() {
    return alias({
      entries: {
        uuid: 'uuid/dist/esm-browser/index.js'
      }
    })
  }
}

export default [
  {
    ...common.react,
    plugins: common.plugins,
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
        globals: {
          react: 'React',
          'react-redux': 'react-redux',
          'redux-persist/integration/react': 'redux-persist/integration/react',
          '@reduxjs/toolkit': '@reduxjs/toolkit',
          'redux-persist': 'redux-persist',
          uuid: 'uuid',
          '@stripe/stripe-js': '@stripe/stripe-js'
        }
      }
    ]
  },
  {
    ...common.react,
    plugins: common.plugins.concat(
      common.aliases,
      visualizer({ filename: 'stats/react.html' })
    ),
    output: {
      file: pkg.exports['.'].import,
      format: 'es',
      sourcemap: true
    }
  },
  {
    ...common.core,
    plugins: common.plugins,
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
          react: 'React',
          ['@reduxjs/toolkit']: '@reduxjs/toolkit',
          ['redux-persist']: 'redux-persist',
          uuid: 'uuid',
          '@stripe/stripe-js': '@stripe/stripe-js'
        }
      }
    ]
  },
  {
    ...common.core,
    plugins: common.plugins.concat(
      common.aliases,
      visualizer({ filename: 'stats/core.html' })
    ),
    output: {
      file: pkg.exports['./core'].import,
      format: 'es',
      sourcemap: true,
      exports: 'named'
    }
  }
]
