import sucrase from '@rollup/plugin-sucrase'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import externals from 'rollup-plugin-node-externals'
import visualizer from 'rollup-plugin-visualizer'

import { promises as fs, existsSync } from 'fs'

import path from 'path'

import pkg from './package.json'

/**
 * Copying over the .d.ts type definition files to match each build file.
 * If we modify the names of the .js files, we need to modify the names that
 * these .d.ts files are copied to as well.
 *
 * react/index.d.ts -> dist/react.d.ts, dist/react.es.d.ts, dist/react.umd.d.ts
 * core/index.d.ts -> dist/core.d.ts, dist/core.es.d.ts, dist/core.umd.d.ts
 */
function copyTypes() {
  let copied = false
  return {
    async buildEnd() {
      if (copied) return
      copied = true

      for (const build of ['react', 'core']) {
        console.log(
          `./${build}/index.d.ts → ./dist/${build}.d.ts, ./dist/${build}.es.d.ts, ./dist/${build}.umd.d.ts`
        )
        for (const infix of ['', '.es', '.umd']) {
          try {
            await fs.copyFile(
              path.join(process.cwd(), build, 'index.d.ts'),
              path.join(process.cwd(), 'dist', `${build}${infix}.d.ts`)
            )
          } catch (error) {
            console.log(
              `Unable to copy ./${build}/index.d.ts to ./dist/${build}${infix}.d.ts`
            )
            console.error(error)
          }
        }
      }
    }
  }
}

/**
 * Deletes the dist/ folder and then makes a new directory.
 * Equivalent to `rm -r dist && mkdir dist`
 */
function clearDist() {
  let cleared = false

  return {
    async buildStart() {
      if (cleared) return
      cleared = true

      try {
        if (existsSync(path.resolve('dist')))
          await fs.rm(path.resolve('dist'), { recursive: true })

        await fs.mkdir(path.resolve('dist'))
        console.log('Cleared dist/ folder.')
      } catch (error) {
        console.error('Unable to clear dist/ folder.')
        console.error(error)
      }
    }
  }
}

const common = {
  react: {
    input: './react/index.js',
    external: ['react']
  },
  core: {
    input: './core/index.js'
  },
  plugins: [
    clearDist(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.__buildVersion__': JSON.stringify(pkg.version)
      }
    }),
    // We are using Sucrase to compile our JSX
    sucrase({
      exclude: 'node_modules/**/*',
      transforms: ['jsx']
    }),
    copyTypes(), // Copies the types to dist/
    externals({ deps: true }), // automatically externalizes dependencies in package.json
    resolve(),
    commonjs()
  ],
  // fixes an issue with uuid
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
          '@reduxjs/toolkit': 'RTK',
          'redux-persist': 'ReduxPersist',
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
          '@reduxjs/toolkit': 'RTK',
          'redux-persist': 'ReduxPersist',
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
