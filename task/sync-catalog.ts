// Sync test/catalog.csv with test/registry.csv and the registered experiment definitions:
// builds the exact 1-to-1 catalog table (code, test, category, depth, paper, substrates, title)
// directly from the live Experiment objects in test/experiment/all.ts in registry.csv order.
// Reports diffs by default; rewrites test/catalog.csv on --commit.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { allExperiments } from '@/test/scaffold/suite'
import '@/test/experiment/all'

const root = new URL('..', import.meta.url).pathname
const registryPath = join(root, 'test', 'registry.csv')
const catalogPath = join(root, 'test', 'catalog.csv')

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  fields.push(cur)
  return fields
}

const byId = new Map(allExperiments().map(e => [e.id, e]))
const byCode = new Map(
  allExperiments()
    .filter(e => e.code)
    .map(e => [e.code!, e]),
)

const regLines = readFileSync(registryPath, 'utf8')
  .trim()
  .split('\n')
  .slice(1)

const outLines: string[] = ['code,test,category,depth,paper,substrates,title']
const missing: string[] = []

for (const line of regLines) {
  const [code, _arena, _num, testId, category, regTitle] = parseCsvLine(line)
  if (!code || !testId) continue
  const exp = byCode.get(code) ?? byId.get(testId)
  if (!exp) {
    missing.push(`${code} (${testId})`)
    continue
  }
  const substrates =
    exp.substrates === 'any'
      ? 'any'
      : exp.substrates.length > 0
        ? exp.substrates.join('|')
        : 'none'
  const title = (exp.title || regTitle || '')
    .replace(/\s+/g, ' ')
    .replace(/"/g, "'")
    .trim()
  outLines.push(
    `${code},${exp.id},${exp.category || category},${exp.depth},${exp.paper ? 'true' : 'false'},${substrates},"${title}"`,
  )
}

if (missing.length > 0) {
  console.error(`ERROR: ${missing.length} registry rows missing from barrel:`, missing)
  process.exit(1)
}

const nextText = outLines.join('\n') + '\n'
const prevText = readFileSync(catalogPath, 'utf8')

if (nextText === prevText) {
  console.log(`catalog in sync (${outLines.length - 1} rows, 0 diffs)`)
} else {
  const prevCount = prevText.trim().split('\n').length - 1
  console.log(
    `catalog diff: ${prevCount} existing rows -> ${outLines.length - 1} canonical registry rows`,
  )
  if (process.argv.includes('--commit')) {
    writeFileSync(catalogPath, nextText)
    console.log(`wrote ${outLines.length - 1} canonical rows to test/catalog.csv`)
  } else {
    console.log('pass --commit to rewrite test/catalog.csv cleanly')
  }
}
