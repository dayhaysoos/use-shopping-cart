import sucrase from '@rollup/plugin-sucrase'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { nodeExternals } from 'rollup-plugin-node-externals'
import { visualizer } from 'rollup-plugin-visualizer'
import { dts } from 'rollup-plugin-dts'

import { promises as fs, existsSync, readFileSync } from 'fs'

import path from 'path'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

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

function addUseClientDirective() {
  return {
    name: 'add-use-client-directive',
    banner() {
      return "'use client';"
    }
  }
}

const clearDistPlugin = clearDist()

function plugins({ bundleJsxRuntime = false } = {}) {
  return [
    clearDistPlugin,
    replace({
      preventAssignment: true,
      values: {
        'process.env.__buildVersion__': JSON.stringify(pkg.version),
        ...(bundleJsxRuntime
          ? { 'process.env.NODE_ENV': JSON.stringify('production') }
          : {})
      }
    }),
    sucrase({
      exclude: 'node_modules/**/*',
      transforms: ['typescript', 'jsx'],
      jsxRuntime: 'automatic',
      production: true
    }),
    nodeExternals({ exclude: bundleJsxRuntime ? ['react/jsx-runtime'] : [] }),
    nodeResolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
    commonjs()
  ]
}

const entries = [
  {
    name: 'react',
    input: './react/index.ts',
    useClientDirective: true,
    umdName: 'UseShoppingCart'
  },
  {
    name: 'core',
    input: './core/index.ts',
    useClientDirective: true,
    umdName: 'UseShoppingCartCore'
  },
  {
    name: 'utilities',
    input: './utilities/serverless.ts'
  }
]

const jsBuilds = entries.flatMap((entry) => {
  const entryPlugins = (options) => [
    ...plugins(options),
    ...(entry.useClientDirective ? [addUseClientDirective()] : [])
  ]

  return [
    {
      input: entry.input,
      plugins: [
        ...entryPlugins(),
        ...(entry.umdName
          ? [visualizer({ filename: `stats/${entry.name}.html` })]
          : [])
      ],
      output: [
        {
          file: `./dist/${entry.name}.mjs`,
          format: 'es',
          sourcemap: true
        },
        {
          file: `./dist/${entry.name}.cjs`,
          format: 'cjs',
          sourcemap: true,
          exports: 'named'
        }
      ]
    },
    ...(entry.umdName
      ? [
          {
            input: entry.input,
            plugins: entryPlugins({ bundleJsxRuntime: true }),
            output: {
              name: entry.umdName,
              file: `./dist/${entry.name}.umd.js`,
              format: 'umd',
              sourcemap: true,
              exports: 'named',
              globals: { react: 'React' }
            }
          }
        ]
      : [])
  ]
})

const typeBuilds = entries.map((entry) => ({
  input: entry.input,
  external: ['react', 'react/jsx-runtime'],
  plugins: [dts()],
  output: ['d.mts', 'd.cts', 'd.ts'].map((extension) => ({
    file: `./dist/${entry.name}.${extension}`,
    format: 'es'
  }))
}))

export default [...jsBuilds, ...typeBuilds]
