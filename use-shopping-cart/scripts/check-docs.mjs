import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'

const libraryDir = join(import.meta.dirname, '..')
const docsDir = join(libraryDir, '..', 'docs', 'content')
const entryPoints = {
  'use-shopping-cart': 'react',
  'use-shopping-cart/core': 'core',
  'use-shopping-cart/utilities': 'utilities'
}

function exportedNames() {
  const files = Object.fromEntries(
    Object.entries(entryPoints).map(([path, name]) => [
      path,
      join(libraryDir, 'dist', `${name}.d.mts`)
    ])
  )
  const program = ts.createProgram(Object.values(files), { noEmit: true })
  const checker = program.getTypeChecker()
  return Object.fromEntries(
    Object.entries(files).map(([path, file]) => {
      const sourceFile = program.getSourceFile(file)
      if (!sourceFile) throw new Error(`Missing ${file}; run the build first`)
      const symbol = checker.getSymbolAtLocation(sourceFile)
      const names = checker.getExportsOfModule(symbol).map((s) => s.name)
      return [path, new Set(names)]
    })
  )
}

function mdxFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return mdxFiles(path)
    return entry.name.endsWith('.mdx') ? [path] : []
  })
}

function codeBlocks(text) {
  const blocks = []
  const fence = /^```[^\n]*\n([\s\S]*?)^```/gm
  let match
  while ((match = fence.exec(text))) {
    const line = text.slice(0, match.index).split('\n').length + 1
    blocks.push({ code: match[1], line })
  }
  return blocks
}

function packageImports(code) {
  const sourceFile = ts.createSourceFile(
    'block.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  return sourceFile.statements.flatMap((statement) => {
    if (!ts.isImportDeclaration(statement)) return []
    const path = statement.moduleSpecifier.text
    if (path !== 'use-shopping-cart' && !path.startsWith('use-shopping-cart/'))
      return []
    const clause = statement.importClause
    const names = []
    if (clause?.name) names.push('default')
    const bindings = clause?.namedBindings
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        names.push((element.propertyName ?? element.name).text)
      }
    }
    const line = sourceFile.getLineAndCharacterOfPosition(
      statement.getStart()
    ).line
    return [{ path, names, line }]
  })
}

const exports = exportedNames()
const problems = []

for (const file of mdxFiles(docsDir)) {
  const name = relative(join(libraryDir, '..'), file)
  for (const { code, line } of codeBlocks(readFileSync(file, 'utf8'))) {
    code.split('\n').forEach((text, offset) => {
      if (text.startsWith(';<')) {
        problems.push(
          `${name}:${line + offset}: line starts with ';<'; wrap the JSX in export const Root = () => (...)`
        )
      }
    })

    for (const imported of packageImports(code)) {
      const at = `${name}:${line + imported.line}`
      const available = exports[imported.path]
      if (!available) {
        problems.push(`${at}: '${imported.path}' is not a package entry point`)
        continue
      }
      for (const missing of imported.names.filter((n) => !available.has(n))) {
        problems.push(`${at}: '${imported.path}' does not export ${missing}`)
      }
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log('Docs code blocks import only what the package exports.')
