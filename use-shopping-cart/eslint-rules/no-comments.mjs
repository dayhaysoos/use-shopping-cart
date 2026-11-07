const allowed = [/^@ts-expect-error\s+\S/, /^eslint-(disable|enable)/]

function removalRange(text, comment) {
  let [start, end] = comment.range
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const newline = text.indexOf('\n', end)
  const lineEnd = newline === -1 ? text.length : newline
  const before = text.slice(lineStart, start)
  const after = text.slice(end, lineEnd)

  if (/^\s*\{\s*$/.test(before) && /^\s*\}\s*$/.test(after)) {
    return [lineStart, newline === -1 ? lineEnd : newline + 1]
  }
  const braceBefore = before.match(/\{\s*$/)
  const braceAfter = after.match(/^\s*\}/)
  if (braceBefore && braceAfter) {
    start -= braceBefore[0].length
    end += braceAfter[0].length
  }
  if (
    /^\s*$/.test(text.slice(lineStart, start)) &&
    /^\s*$/.test(text.slice(end, lineEnd))
  ) {
    return [lineStart, newline === -1 ? lineEnd : newline + 1]
  }
  const spaces = text.slice(lineStart, start).match(/\s*$/)[0].length
  return [start - spaces, end]
}

export default {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    messages: {
      comment:
        'Code has no comments. Only `@ts-expect-error <description>` and eslint directives are allowed.'
    },
    schema: []
  },
  create(context) {
    const sourceCode = context.sourceCode
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type === 'Shebang') continue
          const value = comment.value.trim()
          if (allowed.some((pattern) => pattern.test(value))) continue
          context.report({
            loc: comment.loc,
            messageId: 'comment',
            fix: value.startsWith('@ts-')
              ? null
              : (fixer) =>
                  fixer.removeRange(removalRange(sourceCode.text, comment))
          })
        }
      }
    }
  }
}
