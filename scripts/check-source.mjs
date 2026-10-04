import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
const ignored = new Set(['.git', 'node_modules', 'bin', 'obj', 'dist', '.prerender', '.playwright', 'playwright-report', 'test-results', 'storage', 'uploads'])
const failures = []
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await check(path)
    else if (/\.(cs|tsx?|m?js|json|ya?ml|html|css)$/.test(entry.name)) {
      const lines = (await readFile(path, 'utf8')).split('\n')
      lines.forEach((line, index) => { if (/^(<{7}|>{7}|\|{7})( |$)|^={7}\s*$/.test(line)) failures.push(`${path}:${index + 1}`) })
    }
  }
}
await check('.')
if (failures.length) { console.error(`Resolve Git conflict markers before building:\n${failures.join('\n')}`); process.exit(1) }
console.log('Source check passed: no unresolved Git conflict markers.')
