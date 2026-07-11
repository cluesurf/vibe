// Next experiment code per arena. Vibe experiment codes are E-<ARENA>-<NNNN>, and
// they are numbered PER ARENA: holography (HLG) and relativity (RLT) each run their
// own 0001.. sequence, so the next code for an arena is that arena's highest number
// plus one, not the global maximum. Picking the global maximum is the mistake this
// tool exists to prevent (it leaves gaps and cross-arena number clashes).
//
// It reads the registry and the catalog together (their union, so a code present in
// only one still counts as taken) and prints the next free code for one arena,
// several arenas, or every arena. Run it before adding experiments.
//
// Run:
//   pnpm call task/next-code/index.ts --arena HLG
//   pnpm call task/next-code/index.ts --arena HLG,RLT --count 3
//   pnpm call task/next-code/index.ts --json --arena FND
//   pnpm call task/next-code/index.ts               # every arena, one line each
//
// Flags:
//   --arena, -a   arena code(s): repeat the flag or comma-separate (HLG,RLT). Omit for all.
//   --count, -n   how many next codes to reserve per arena (default 1)
//   --json        machine-readable output

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parseArgs } from 'node:util'

const packageRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../..',
)

const CODE_PATTERN = /^E-([A-Z]{3})-(\d{4})$/

// the first column of a csv, skipping the header, ignoring blank lines
function firstColumn(path: string): string[] {
  let text: string

  try {
    text = readFileSync(resolve(packageRoot, path), 'utf8')
  } catch {
    return []
  }

  return text
    .split('\n')
    .slice(1)
    .map(line => line.split(',')[0]?.trim() ?? '')
    .filter(cell => cell.length > 0)
}

// arena code -> full name, from the canonical arena list
function readArenaNames(): Map<string, string> {
  const names = new Map<string, string>()

  for (const line of readFileSync(
    resolve(packageRoot, 'test/codes.csv'),
    'utf8',
  )
    .split('\n')
    .slice(1)) {
    const [code, name] = line.split(',')

    if (code && name) names.set(code.trim(), name.trim())
  }

  return names
}

// arena code -> the set of numbers already used, from registry + catalog union
function readUsedNumbers(): Map<string, Set<number>> {
  const used = new Map<string, Set<number>>()
  const codes = [
    ...firstColumn('test/registry.csv'),
    ...firstColumn('test/catalog.csv'),
  ]

  for (const code of codes) {
    const match = CODE_PATTERN.exec(code)

    if (!match) continue

    const arena = match[1]!
    const number = Number(match[2])
    const set = used.get(arena) ?? new Set<number>()

    set.add(number)
    used.set(arena, set)
  }

  return used
}

function formatCode(arena: string, number: number): string {
  return `E-${arena}-${String(number).padStart(4, '0')}`
}

const parsed = parseArgs({
  options: {
    arena: { type: 'string', short: 'a', multiple: true },
    count: { type: 'string', short: 'n', default: '1' },
    json: { type: 'boolean', default: false },
  },
})

const count = Math.max(1, Number(parsed.values.count) || 1)
const arenaNames = readArenaNames()
const used = readUsedNumbers()

// requested arenas: the flag values (comma-split, uppercased) or every known arena
const requested = (parsed.values.arena ?? [])
  .flatMap(value => value.split(','))
  .map(value => value.trim().toUpperCase())
  .filter(value => value.length > 0)

const arenas =
  requested.length > 0
    ? requested
    : [...arenaNames.keys()].sort((left, right) =>
        left.localeCompare(right),
      )

const results = arenas.map(arena => {
  const numbers = used.get(arena) ?? new Set<number>()
  const max = numbers.size > 0 ? Math.max(...numbers) : 0
  const next = Array.from({ length: count }, (unused, index) =>
    formatCode(arena, max + 1 + index),
  )

  return {
    arena,
    name: arenaNames.get(arena) ?? null,
    used: numbers.size,
    max,
    next,
    known: arenaNames.has(arena),
  }
})

if (parsed.values.json) console.log(JSON.stringify(results, null, 2))
else {
  for (const result of results) {
    const label = (result.name ?? 'UNKNOWN ARENA').padEnd(14)
    const tally = `used ${String(result.used).padStart(3)}`
    const nextList = result.next.join(', ')
    const warn = result.known ? '' : '  (not in test/codes.csv)'

    console.log(
      `${result.arena}  ${label}  ${tally}  next ${nextList}${warn}`,
    )
  }
}
