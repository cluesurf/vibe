// Checks the 227-model classification table (test/model-table/models-NNN-MMM.csv), fail-closed.
//
// One row per model of computation from the source list, saying whether the model emerges from one fixed local
// rule on the ternary mesh, emerges only with named added structure, or is excluded by a base property, and on
// what basis. The rules this enforces are plan.md section 5 of note/project/vibe/computation/models:
//
// - every number 1 to 227 present exactly once (a missing number fails unless --allow-missing is passed)
// - each part file holds only the numbers its name spans, and each number sits in its source family
// - every value inside its column's vocabulary (milestone: m1..m12, the quantum ladder q0..q7, or none)
// - every experiment code in `evidence` exists in test/registry.csv, every `lean:<name>` is a theorem under
//   code/proof
// - `emerges_with_structure` names its ingredients in `added_structure`, and no other verdict names any
// - a verdict other than `open` cites something: an experiment code, a Lean theorem, a published result
//   (`cite:<author-year>`), or for `excluded` the base property it contradicts (`base:<property>`)
// - `demonstrated` cites an experiment code, `proved` cites a Lean theorem
//
//   pnpm check:model-table                         every part file, all 227 numbers required
//   pnpm check:model-table --allow-missing         tolerate numbers no part file holds yet
//   pnpm check:model-table --dir <path>            read the part files from another directory

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const MODEL_COUNT = 227

const COLUMNS = [
  'number',
  'name',
  'family',
  'class',
  'time',
  'state',
  'geometry',
  'synchrony',
  'reversibility',
  'conservation',
  'causality',
  'universality',
  'verdict',
  'added_structure',
  'basis',
  'evidence',
  'milestone',
] as const

type Column = (typeof COLUMNS)[number]
type Row = Record<Column, string>

// the source's family boundaries (source/models-of-computing.md headings 1 to 12)
const FAMILIES: Array<{ name: string; first: number; last: number }> = [
  { name: 'classical_symbolic', first: 1, last: 14 },
  { name: 'automata_rewriting', first: 15, last: 29 },
  { name: 'cellular_spatial', first: 30, last: 55 },
  { name: 'associative', first: 56, last: 70 },
  { name: 'neural', first: 71, last: 89 },
  { name: 'concurrent', first: 90, last: 109 },
  { name: 'analog_dynamical', first: 110, last: 130 },
  { name: 'chemical_biological', first: 131, last: 150 },
  { name: 'quantum_optical_reversible', first: 151, last: 170 },
  { name: 'logical_algebraic_topological', first: 171, last: 192 },
  { name: 'unconventional_emergent', first: 193, last: 215 },
  { name: 'hypercomputation', first: 216, last: 227 },
]

// the 12 mechanism classes of source/computation-model-types.md, by their primitive
const CLASSES = [
  'transition',
  'rewrite',
  'local_update',
  'propagation',
  'association',
  'resonance',
  'relaxation',
  'exchange',
  'construction',
  'adaptation',
  'composition',
  'quantum_transformation',
]

const VOCABULARY: Partial<Record<Column, string[]>> = {
  family: FAMILIES.map(family => family.name),
  class: CLASSES,
  time: ['discrete', 'continuous', 'none'],
  state: ['binary', 'ternary', 'multistate', 'unbounded', 'continuous'],
  geometry: [
    'abstract',
    'linear',
    'euclidean',
    'spherical',
    'hyperbolic',
    'graph',
    'any',
  ],
  synchrony: [
    'sequential',
    'synchronous',
    'asynchronous',
    'partitioned',
    'none',
  ],
  reversibility: ['reversible', 'irreversible', 'either'],
  conservation: ['conservative', 'dissipative', 'either'],
  causality: ['deterministic', 'nondeterministic', 'stochastic'],
  universality: ['restricted', 'weakly_universal', 'strongly_universal'],
  verdict: ['emerges', 'emerges_with_structure', 'excluded', 'open'],
  basis: ['argued', 'demonstrated', 'proved'],
  milestone: [
    'm1',
    'm2',
    'm3',
    'm4',
    'm5',
    'm6',
    'm7',
    'm8',
    'm9',
    'm10',
    'm11',
    'm12',
    // the quantum ladder under the bare beat U (decision 004, plan.md 11.3)
    'q0',
    'q1',
    'q2',
    'q3',
    'q4',
    'q5',
    'q6',
    'q7',
    'none',
  ],
}

// ingredients beyond the mesh, the ternary state and one fixed local rule (decision 002, plan.md 5)
const ADDED_STRUCTURE = [
  'schedule',
  'orientation',
  'per_cell_weights',
  'unbounded_state',
  'trained_readout',
  'programmer_layout',
  'garbage_space',
  'external_input',
  'coarse_grain',
  'dynamic_topology',
  'deterministic_surrogate',
  // a quantum row realized by the bare beat U: `measurement` is a kept record branch (plan.md 11.4 row 153), and
  // `amplitudes` names Z[zeta_9][1/6] amplitudes as an outside ingredient, for the reading of plan.md 12 in which
  // bare U is not one fixed local rule; under decision 004 point 2 they are base state and no row names them
  'measurement',
  'amplitudes',
]

// base properties an `excluded` row may cite as the one it contradicts
const BASE_PROPERTIES = [
  'discrete_state',
  'deterministic',
  'finite_steps',
  'no_oracle',
  'local',
]

const EXPERIMENT_CODE = /\bE-[A-Z]{3}-\d{4}\b/g
const LEAN_TOKEN = /\blean:([A-Za-z_][A-Za-z0-9_.']*)/g
const CITE_TOKEN = /\bcite:([a-z0-9-]+)/g
const BASE_TOKEN = /\bbase:([a-z_]+)/g
const PART_FILE = /^models-(\d{3})-(\d{3})\.csv$/

const root = process.cwd()
const args = process.argv.slice(2)
const allowMissing = args.includes('--allow-missing')
const dirFlag = args.indexOf('--dir')
const tableDir =
  dirFlag >= 0 && args[dirFlag + 1]
    ? resolve(args[dirFlag + 1]!)
    : join(root, 'test/model-table')
const registryPath = join(root, 'test/registry.csv')
const proofDir = join(root, 'code/proof')

const errors: string[] = []

function fail(message: string): void {
  errors.push(message)
}

// RFC 4180 fields: quoted fields may hold commas and doubled quotes, never a newline in this table
function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!

    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"' && field === '') {
      quoted = true
    } else if (char === ',') {
      fields.push(field)
      field = ''
    } else {
      field += char
    }
  }

  if (quoted) {
    throw new Error('unterminated quoted field')
  }

  fields.push(field)
  return fields
}

function readRegistryCodes(): Set<string> {
  if (!existsSync(registryPath)) {
    throw new Error(`registry missing: ${registryPath}`)
  }

  const codes = new Set<string>()
  const lines = readFileSync(registryPath, 'utf8').split('\n').slice(1)

  for (const line of lines) {
    const code = line.split(',')[0]?.trim()

    if (code) {
      codes.add(code)
    }
  }

  if (codes.size === 0) {
    throw new Error(`registry has no codes: ${registryPath}`)
  }

  return codes
}

function walkLean(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)

    if (name === '.lake' || name === 'build') {
      continue
    }

    if (statSync(path).isDirectory()) {
      walkLean(path, found)
    } else if (name.endsWith('.lean')) {
      found.push(path)
    }
  }

  return found
}

function readLeanTheorems(): Set<string> {
  if (!existsSync(proofDir)) {
    throw new Error(`proof directory missing: ${proofDir}`)
  }

  const names = new Set<string>()
  const declaration =
    /^\s*(?:@\[[^\]]*\]\s*)?(?:private\s+|protected\s+)?(?:theorem|lemma)\s+([A-Za-z_][A-Za-z0-9_.']*)/gm

  for (const path of walkLean(proofDir)) {
    for (const match of readFileSync(path, 'utf8').matchAll(declaration)) {
      names.add(match[1]!)
    }
  }

  if (names.size === 0) {
    throw new Error(`no Lean theorems found under ${proofDir}`)
  }

  return names
}

function familyOf(number: number): string | undefined {
  return FAMILIES.find(
    family => number >= family.first && number <= family.last,
  )?.name
}

function checkRow(
  where: string,
  row: Row,
  registry: Set<string>,
  theorems: Set<string>,
): void {
  for (const column of COLUMNS) {
    const allowed = VOCABULARY[column]

    if (allowed && !allowed.includes(row[column])) {
      fail(`${where}: ${column} '${row[column]}' is not one of ${allowed.join(' ')}`)
    }
  }

  const number = Number(row.number)

  if (familyOf(number) !== undefined && familyOf(number) !== row.family) {
    fail(`${where}: family '${row.family}' but number ${number} is in '${familyOf(number)}'`)
  }

  if (row.name.trim() === '') {
    fail(`${where}: empty name`)
  }

  const structure =
    row.added_structure === '' ? [] : row.added_structure.split(';')

  for (const item of structure) {
    if (!ADDED_STRUCTURE.includes(item)) {
      fail(`${where}: added_structure '${item}' is not one of ${ADDED_STRUCTURE.join(' ')}`)
    }
  }

  if (new Set(structure).size !== structure.length) {
    fail(`${where}: added_structure repeats an item`)
  }

  if (row.verdict === 'emerges_with_structure' && structure.length === 0) {
    fail(`${where}: emerges_with_structure with empty added_structure`)
  }

  if (row.verdict !== 'emerges_with_structure' && structure.length > 0) {
    fail(`${where}: added_structure given on a '${row.verdict}' row`)
  }

  const evidence = row.evidence
  const codes = [...evidence.matchAll(EXPERIMENT_CODE)].map(match => match[0])
  const leanNames = [...evidence.matchAll(LEAN_TOKEN)].map(match => match[1]!)
  const cites = [...evidence.matchAll(CITE_TOKEN)].map(match => match[1]!)
  const bases = [...evidence.matchAll(BASE_TOKEN)].map(match => match[1]!)

  if (evidence.trim() === '') {
    fail(`${where}: empty evidence (every row carries at least a one-line argument)`)
  }

  for (const code of codes) {
    if (!registry.has(code)) {
      fail(`${where}: evidence code ${code} is not in test/registry.csv`)
    }
  }

  for (const name of leanNames) {
    if (!theorems.has(name)) {
      fail(`${where}: Lean theorem '${name}' not found under code/proof`)
    }
  }

  for (const cite of cites) {
    if (!/^[a-z][a-z0-9-]*-\d{4}$/.test(cite)) {
      fail(`${where}: cite:${cite} must read cite:<author>-<year>`)
    }
  }

  for (const base of bases) {
    if (!BASE_PROPERTIES.includes(base)) {
      fail(`${where}: base:${base} is not one of ${BASE_PROPERTIES.join(' ')}`)
    }
  }

  if (
    row.verdict !== 'open' &&
    codes.length + leanNames.length + cites.length + bases.length === 0
  ) {
    fail(`${where}: verdict '${row.verdict}' cites nothing (an experiment code, lean:, cite: or base:), so it must be open`)
  }

  if (row.verdict === 'excluded' && bases.length === 0) {
    fail(`${where}: excluded without the base:<property> it contradicts`)
  }

  if (row.verdict !== 'excluded' && bases.length > 0) {
    fail(`${where}: base:<property> cited on a '${row.verdict}' row`)
  }

  if (row.basis === 'demonstrated' && codes.length === 0) {
    fail(`${where}: basis demonstrated without an experiment code in evidence`)
  }

  if (row.basis === 'proved' && leanNames.length === 0) {
    fail(`${where}: basis proved without a lean:<theorem> in evidence`)
  }

  if (row.verdict === 'excluded' && row.milestone !== 'none') {
    fail(`${where}: excluded row has milestone '${row.milestone}', expected none`)
  }
}

function main(): void {
  if (!existsSync(tableDir)) {
    throw new Error(`table directory missing: ${tableDir}`)
  }

  const registry = readRegistryCodes()
  const theorems = readLeanTheorems()
  const parts = readdirSync(tableDir)
    .filter(name => name.endsWith('.csv'))
    .sort()

  if (parts.length === 0) {
    throw new Error(`no part files in ${tableDir}`)
  }

  const seen = new Map<number, string>()
  const verdicts = new Map<string, number>()
  let rowCount = 0

  for (const part of parts) {
    const span = PART_FILE.exec(part)

    if (!span) {
      fail(`${part}: part files are named models-NNN-MMM.csv`)
      continue
    }

    const first = Number(span[1])
    const last = Number(span[2])
    const lines = readFileSync(join(tableDir, part), 'utf8')
      .split('\n')
      .filter(line => line.trim() !== '')

    if (lines[0] !== COLUMNS.join(',')) {
      fail(`${part}: header must be exactly ${COLUMNS.join(',')}`)
      continue
    }

    for (let i = 1; i < lines.length; i++) {
      const where = `${part}:${i + 1}`
      let fields: string[]

      try {
        fields = parseCsvLine(lines[i]!)
      } catch (error) {
        fail(`${where}: ${(error as Error).message}`)
        continue
      }

      if (fields.length !== COLUMNS.length) {
        fail(`${where}: ${fields.length} fields, expected ${COLUMNS.length}`)
        continue
      }

      const row = Object.fromEntries(
        COLUMNS.map((column, index) => [column, fields[index]!]),
      ) as Row
      const number = Number(row.number)

      if (!/^\d+$/.test(row.number) || number < 1 || number > MODEL_COUNT) {
        fail(`${where}: number '${row.number}' is not an integer in 1 to ${MODEL_COUNT}`)
        continue
      }

      if (number < first || number > last) {
        fail(`${where}: number ${number} outside the file's span ${first} to ${last}`)
      }

      const earlier = seen.get(number)

      if (earlier) {
        fail(`${where}: duplicate number ${number} (first at ${earlier})`)
      } else {
        seen.set(number, where)
      }

      checkRow(where, row, registry, theorems)
      verdicts.set(row.verdict, (verdicts.get(row.verdict) ?? 0) + 1)
      rowCount++
    }
  }

  const missing: number[] = []

  for (let number = 1; number <= MODEL_COUNT; number++) {
    if (!seen.has(number)) {
      missing.push(number)
    }
  }

  if (missing.length > 0 && !allowMissing) {
    fail(`missing numbers (${missing.length}): ${missing.join(' ')}`)
  }

  const tally = [...verdicts.entries()]
    .sort()
    .map(([verdict, count]) => `${verdict} ${count}`)
    .join(', ')

  console.log(`model table: ${parts.length} part files, ${rowCount} rows, ${missing.length} missing${allowMissing ? ' (allowed)' : ''}`)
  console.log(`verdicts: ${tally || 'none'}`)

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`FAIL ${error}`)
    }

    console.error(`check:model-table FAILED with ${errors.length} error(s)`)
    process.exit(1)
  }

  console.log('check:model-table passed')
}

try {
  main()
} catch (error) {
  console.error(`check:model-table FAILED: ${(error as Error).message}`)
  process.exit(1)
}
