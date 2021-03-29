import sucrase from '@rollup/plugin-sucrase'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'
import alias from '@rollup/plugin-alias'
import externals from 'rollup-plugin-node-externals'

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
  get pluginsWithAliases() {
    return this.plugins.concat(
      alias({
        entries: {
          uuid: 'uuid/dist/esm-browser/index.js'
        }
      })
    )
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
        globals: { react: 'React' }
      }
    ]
  },
  {
    ...common.react,
    plugins: common.pluginsWithAliases,
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
          react: 'React'
        }
      }
    ]
  },
  {
    ...common.core,
    plugins: common.pluginsWithAliases,
    output: {
      file: pkg.exports['./core'].import,
      format: 'es',
      sourcemap: true,
      exports: 'named'
    }
  }
]
