import sucrase from '@rollup/plugin-sucrase'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'

import pkg from './package.json'

export default {
  input: 'src/index.js',
  external: ['react'],
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
      globals: { react: 'React' }
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
