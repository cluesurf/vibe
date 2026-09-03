// Sync test/catalog.csv with the experiment files: find every experiment module whose
// code or id is missing from the catalog, extract its row (code, test id, category,
// depth, paper, substrates, title), REPORT by default, append with --commit.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const catalogPath = join(root, 'test', 'catalog.csv')
const catalog = readFileSync(catalogPath, 'utf8')
const have = new Set<string>()
for (const line of catalog.split('\n')) {
  const id = line.split(',')[1]
  if (id) have.add(id)
}

const rows: string[] = []
const base = join(root, 'test', 'experiment')
for (const category of readdirSync(base, { withFileTypes: true })) {
  if (!category.isDirectory()) continue
  for (const file of readdirSync(join(base, category.name))) {
    if (!file.endsWith('.ts')) continue
    const text = readFileSync(join(base, category.name, file), 'utf8')
    const id = text.match(/id: '([^']+)'/)?.[1]
    if (!id || have.has(id)) continue
    const code = text.match(/code: '([^']+)'/)?.[1] ?? ''
    const depth = text.match(/depth: '([^']+)'/)?.[1] ?? ''
    const paper = /paper: true/.test(text) ? 'true' : 'false'
    const substrates = /substrates: \['3434'\]/.test(text)
      ? '3434'
      : /substrates: 'any'/.test(text)
        ? 'any'
        : '3434'
    const title = text
      .match(/title:\s*\n?\s*'([\s\S]*?)',\n/)?.[1]
      ?.replace(/\s+/g, ' ')
      .replace(/"/g, "'")
      .trim() ?? ''
    rows.push(`${code},${id},${category.name},${depth},${paper},${substrates},"${title}"`)
  }
}

if (rows.length === 0) {
  console.log('catalog in sync, nothing missing')
} else {
  console.log(`${rows.length} experiments missing from the catalog:`)
  for (const r of rows) console.log(' ', r.slice(0, 110))
  if (process.argv.includes('--commit')) {
    writeFileSync(catalogPath, catalog.replace(/\n?$/, '\n') + rows.join('\n') + '\n')
    console.log('appended')
  } else {
    console.log('pass --commit to append')
  }
}
