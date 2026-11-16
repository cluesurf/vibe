// The 191-fact ledger as a CSV beside the registry (vibe-roadmap-board-0023).
//
// The ledger itself is note/project/vibe/roadmap/everything.md in the parent workspace: one table per area (A to Q),
// one row per fact the model must produce, each with a status (held, partial, stand-in, open, none) and the
// experiments it cites. Its totals were typed by hand into the readme and the paper and disagreed (readme 38, 67, 45,
// 24, 17; paper 36, 52, 45, 26, 32). This task reads the note, expands every cited code (E-QTM-0149 to 0153 is five
// codes, E-QTM-0100, 0103 two), and joins each row to the registry, the catalog's depth and test/mesh.csv (which mesh
// the cited code builds, its grade, its rule and its vacuum, from task/mesh-labels.ts).
//
// A held mark is REFUSED when the experiments it cites deny it:
//   - no cited code is in test/registry.csv (nothing to rerun)
//   - every cited experiment that builds a mesh builds only the flat D4 box: by keys 6 and honeycomb decision 001 a
//     box result is box-specific until it is rerun on the honeycomb, so it cannot be held for the model's mesh
// A refusal never edits the note. It is written in the `refusal` column and counted beside the totals, so the totals
// the readme prints say how many of the held rows stand on the honeycomb.
//
// Writes test/ledger.csv only with --commit. Reports the totals either way. --strict exits 1 while any held mark
// is refused.
//
//   pnpm exec tsx task/make-ledger.ts              report
//   pnpm exec tsx task/make-ledger.ts --commit     write test/ledger.csv

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = process.cwd()
const workspace = resolve(root, '../../../..')
const notePath = join(workspace, 'note/project/vibe/roadmap/everything.md')
const registryPath = join(root, 'test/registry.csv')
const catalogPath = join(root, 'test/catalog.csv')
const meshPath = join(root, 'test/mesh.csv')
const ledgerPath = join(root, 'test/ledger.csv')
const commit = process.argv.includes('--commit')
const strict = process.argv.includes('--strict')

const STATUSES = ['held', 'partial', 'stand-in', 'open', 'none', 'audit'] as const

type Status = (typeof STATUSES)[number]

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < line.length; i++) {
    const c = line[i]!

    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      out.push(field)
      field = ''
    } else {
      field += c
    }
  }

  out.push(field)

  return out
}

function readCsv(path: string): Record<string, string>[] {
  const lines = readFileSync(path, 'utf8').trim().split('\n')
  const header = parseCsvLine(lines[0]!)

  return lines.slice(1).map(line => {
    const cells = parseCsvLine(line)

    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']))
  })
}

// every experiment code a cell names: E-XXX-0001, a list continuing the prefix (E-QTM-0100, 0103 and 0109), and a
// range (E-QTM-0149 to 0153)
export function codesIn(text: string): string[] {
  const found: string[] = []
  const pattern = /E-([A-Z]{3})-(\d{4})((?:\s*(?:,|and|to|-)\s*\d{4}\b)*)/g

  for (const match of text.matchAll(pattern)) {
    const arena = match[1]!
    let last = Number(match[2])

    found.push(`E-${arena}-${match[2]}`)

    for (const step of match[3]!.matchAll(/(,|and|to|-)\s*(\d{4})/g)) {
      const next = Number(step[2])

      if (step[1] === 'to' || step[1] === '-') {
        for (let n = last + 1; n <= next && n - last < 200; n++) {
          found.push(`E-${arena}-${String(n).padStart(4, '0')}`)
        }
      } else {
        found.push(`E-${arena}-${step[2]}`)
      }

      last = next
    }
  }

  return [...new Set(found)]
}

function cellsOf(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(c => c.trim())
}

type Fact = {
  area: string
  fact: string
  status: Status
  codes: string[]
}

function readLedger(text: string): Fact[] {
  const facts: Fact[] = []
  let area = ''
  let header: string[] | null = null

  for (const line of text.split('\n')) {
    const heading = /^## ([A-Q])\. (.+)$/.exec(line)

    if (heading) {
      area = `${heading[1]}. ${heading[2]}`
      header = null
      continue
    }

    if (/^## /.test(line)) {
      area = ''
      header = null
      continue
    }

    if (area === '' || !line.startsWith('|')) {
      continue
    }

    const cells = cellsOf(line)

    if (header === null) {
      header = cells
      continue
    }

    if (cells.every(c => /^:?-+:?$/.test(c))) {
      continue
    }

    const statusIndex = header.indexOf('status')
    const statusCell = cells[statusIndex] ?? ''
    const word = /^\**([a-z-]+)/.exec(statusCell)?.[1] ?? ''

    if (!(STATUSES as readonly string[]).includes(word)) {
      throw new Error(`make-ledger: no status in "${cells[0]}" (${area}): "${statusCell}"`)
    }

    facts.push({
      area,
      fact: cells[0]!,
      status: word as Status,
      codes: codesIn(cells.slice(1).join(' | ')),
    })
  }

  return facts
}

if (!existsSync(notePath)) {
  console.error(`make-ledger: the ledger note is missing at ${notePath}`)
  process.exit(1)
}

const facts = readLedger(readFileSync(notePath, 'utf8'))
const registry = new Set(readCsv(registryPath).map(r => r.code!))
const depth = new Map(readCsv(catalogPath).map(r => [r.code!, r.depth!]))
const mesh = new Map(readCsv(meshPath).map(r => [r.code!, r]))

const DEPTH_ORDER = ['L0', 'L1', 'L2', 'L3']
const union = (values: string[]): string =>
  [...new Set(values.flatMap(v => v.split(' ')).filter(Boolean))].join(' ')

const rows = facts.map(fact => {
  const registered = fact.codes.filter(c => registry.has(c))
  const unregistered = fact.codes.filter(c => !registry.has(c))
  const depths = registered.map(c => depth.get(c) ?? '').filter(Boolean)
  const top = depths.sort((a, b) => DEPTH_ORDER.indexOf(b) - DEPTH_ORDER.indexOf(a))[0] ?? ''
  const labels = registered.map(c => mesh.get(c)).filter(r => r !== undefined)
  const grades = union(labels.map(r => r.grade!))
  const meshes = union(labels.map(r => r.mesh!))
  const rule = labels.some(r => r.rule === 'working')
    ? 'working'
    : labels.some(r => r.rule === 'other')
      ? 'other'
      : labels.length > 0
        ? 'none'
        : ''
  const vacuum = labels.some(r => r.vacuum === 'box-store') ? 'box-store' : ''
  // the cited experiments that build any mesh, and whether any of them reaches the honeycomb
  const built = labels.filter(r => r.mesh !== 'none')
  const onHoneycomb = built.some(r => /honeycomb-/.test(r.mesh!))
  const boxOnly =
    built.length > 0 &&
    !onHoneycomb &&
    built.every(r => r.mesh!.split(' ').every(m => m === 'd4-box'))
  let refusal = ''

  if (fact.status === 'held') {
    if (registered.length === 0) {
      refusal = 'held with no registered experiment'
    } else if (boxOnly) {
      refusal = 'held on the flat D4 box alone, box-specific until rerun on the honeycomb (honeycomb decision 001)'
    }
  }

  return {
    area: fact.area,
    fact: fact.fact,
    status: fact.status,
    depth: top,
    mesh: meshes,
    grade: grades,
    rule,
    vacuum,
    experiments: registered.join(' '),
    unregistered: unregistered.join(' '),
    refusal,
  }
})

const counts = new Map<string, number>()
const byArea = new Map<string, Map<string, number>>()

for (const row of rows) {
  counts.set(row.status, (counts.get(row.status) ?? 0) + 1)

  const area = byArea.get(row.area) ?? new Map<string, number>()

  area.set(row.status, (area.get(row.status) ?? 0) + 1)
  byArea.set(row.area, area)
}

const refused = rows.filter(r => r.refusal !== '')
const heldOnHoneycomb = rows.filter(
  r => r.status === 'held' && /honeycomb-/.test(r.mesh),
).length

console.log(`make-ledger  ${rows.length} facts from ${notePath.slice(workspace.length + 1)}`)
console.log(
  `  totals: ${STATUSES.map(s => `${s} ${counts.get(s) ?? 0}`).join(', ')}`,
)
console.log(
  `  held marks refused: ${refused.length} (${refused.filter(r => r.refusal.startsWith('held on')).length} box alone, ${refused.filter(r => r.refusal.startsWith('held with no')).length} no registered code); held rows citing a honeycomb run: ${heldOnHoneycomb}`,
)
console.log('  by area:')

for (const [area, map] of byArea) {
  console.log(
    `    ${area.padEnd(48)} ${STATUSES.map(s => `${s} ${map.get(s) ?? 0}`).join(', ')}`,
  )
}

if (commit) {
  const quote = (s: string): string => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
  const header = 'area,fact,status,depth,mesh,grade,rule,vacuum,experiments,unregistered,refusal'
  const body = rows.map(r =>
    [
      r.area,
      r.fact,
      r.status,
      r.depth,
      r.mesh,
      r.grade,
      r.rule,
      r.vacuum,
      r.experiments,
      r.unregistered,
      r.refusal,
    ]
      .map(quote)
      .join(','),
  )

  writeFileSync(ledgerPath, `${[header, ...body].join('\n')}\n`)
  console.log(`  wrote test/ledger.csv (${rows.length} rows)`)
}

if (strict && refused.length > 0) {
  process.exit(1)
}
