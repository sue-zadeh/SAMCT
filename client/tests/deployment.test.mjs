import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

const html = await readFile('dist/index.html', 'utf8')
assert.match(html, /<title>SAMCT Villages/)
assert.match(html, /<meta name="description"/)
assert.match(html, /<div id="root"><\/div>/)
const assets = await readdir('dist/assets')
assert.ok(assets.some(name => name.endsWith('.js')), 'React JavaScript must be built')
assert.ok(assets.some(name => name.endsWith('.css')), 'React CSS must be built')
console.log('Azure frontend build is ready.')
