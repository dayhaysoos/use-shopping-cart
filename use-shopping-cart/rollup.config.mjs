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

function addUseClientDirective() {
  return {
    name: 'add-use-client-directive',
    banner() {
      return "'use client';"
    }
  }
}

const plugins = [
  clearDist(),
  replace({
    preventAssignment: true,
    values: {
      'process.env.__buildVersion__': JSON.stringify(pkg.version)
    }
  }),
  // We are using Sucrase to compile TypeScript and JSX
  sucrase({
    exclude: 'node_modules/**/*',
    transforms: ['typescript', 'jsx']
  }),
  nodeExternals(), // automatically externalizes dependencies in package.json
  nodeResolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
  commonjs()
]

/**
 * Each entry is built as ESM (.mjs), CommonJS (.cjs) and optionally UMD, plus a
 * single bundled declaration file emitted as .d.mts, .d.cts and .d.ts (the
 * latter for `moduleResolution: node` consumers that ignore `exports`).
 */
const entries = [
  {
    name: 'react',
    input: './react/index.ts',
    external: ['react'],
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

const jsBuilds = entries.map((entry) => ({
  input: entry.input,
  external: entry.external,
  plugins: [
    ...plugins,
    ...(entry.useClientDirective ? [addUseClientDirective()] : []),
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
    },
    ...(entry.umdName
      ? [
          {
            name: entry.umdName,
            file: `./dist/${entry.name}.umd.js`,
            format: 'umd',
            sourcemap: true,
            exports: 'named',
            globals: { react: 'React' }
          }
        ]
      : [])
  ]
}))

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
