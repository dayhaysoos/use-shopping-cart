const Koa = require('koa')
const app = new Koa()
const replace = require('stream-replace')
const fs = require('fs')
const path = require('path')
const clipboardy = require('clipboardy')
const util = require('util')

require('dotenv').config({
  path: path.resolve(process.cwd(), '../../.env.development')
})

const stat = util.promisify(fs.stat)

app.use(async (ctx) => {
  let filePath = ctx.path
  if (filePath === '/') filePath = '/index.html'
  filePath = path.join(process.cwd(), 'src', filePath)

  let stats
  try {
    stats = await stat(filePath)
    if (!stats.isFile) return

    ctx.type = path.extname(path.basename(filePath))
  } catch {
    return
  }

  // Other files
  if (!filePath.endsWith('.js')) {
    ctx.set('Content-Length', stats.size)
    return (ctx.body = fs.createReadStream(filePath))
  }

  // JavaScript files
  ctx.body = fs.createReadStream(filePath).pipe(
    replace(/process\.env\.(\w+)/, (match, $0) => {
      let newValue = JSON.stringify(process.env[$0])
      if (newValue === undefined) newValue = 'undefined'
      else if (newValue === null) newValue = 'null'

      ctx.set('Content-Length', stats.size + (newValue.length - match.length))
      return newValue
    })
  )
})

const port = 49813
app.listen(port, () => {
  const url = `http://localhost:${port}`
  console.log(`Listening on ${url}`)

  clipboardy.writeSync(url)
  console.log('The URL has been copied to your clipboard.')
})
