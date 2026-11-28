// The TypeScript-to-Lean link: export the finite tables of the code that ran into data-only Lean files under
// code/proof/Vibe/Generated/, so a Lean bridge theorem can prove by `decide` that each table equals the Lean
// definition its theorems quantify over (lean-track.md section 4, decision 008 of the computation models project).
//
// Every export calls the TypeScript module itself (never a hand copy) on every input of its finite domain and
// writes the outputs. A generated file imports nothing, opens `namespace Vibe` then `namespace Generated`, sets
// `autoImplicit false`, and carries a header naming each source file with the SHA-256 of its text. The output is
// a pure function of the source tree, so the drift gate (task/check-lean-link.ts) regenerates and byte-diffs.
//
// Later items add one entry to LEAN_EXPORTS per table: an export function that renders the file, the Lean module
// that proves the bridge, and the bridge theorem names (which must also be in REQUIRED_THEOREMS of check-lean.ts).
//
//   tsx --tsconfig tsconfig.json task/lean-export.ts            report which files would change
//   tsx --tsconfig tsconfig.json task/lean-export.ts --commit   write them into code/proof/Vibe/Generated/
//   tsx --tsconfig tsconfig.json task/lean-export.ts --out DIR  write them into DIR (scratch, for the drift gate)

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerRun, splitCell } from '@/code/compute/lab/counter'
import { KLEENE_TARGETS, gateRule, lineBrickRun, occupancyBlind, tableKey as gateTableKey } from '@/code/compute/lab/gates'
import { wordIndex } from '@/code/intelligence/solver/develop/develop-router'
import { rayLayoutToLine, searchRays, wireSide } from '@/code/compute/lab/ray-search'
import {
  type LineLayout,
  denseLineTable,
  sidedUnaryClosure,
  toneTransport,
  unsidedUnaryClosure,
} from '@/code/compute/lab/wire-invariant'
import {
  PAIR_COUNT,
  commutesWithNegation,
  commutesWithSwap,
  conjugateTable,
  conservesExcitation,
  fixesVacuum,
  negatePair,
  pairIndex,
  pairRuleCensus,
  pairRuleClasses,
  pairRulesFromFibers,
  pairTones,
  tableKey,
} from '@/code/rule/pair-rule'
import { lineChain } from '@/code/compute/quantum/particles'
import {
  LINES,
  LINE_OF_SLOT,
  OPPOSITE_SLOT,
  ROOTS,
  dockCenterKey,
  inconsistentStepCount,
  withGeometry,
} from '@/code/rule/bare-beat'
import { q2rMove } from '@/code/rule/spin-one-q2r'
import {
  LINE_SCHEDULES,
  LumpWitness,
  blockMap,
  blockOfCode,
  blockOffsets,
  checkWitness,
  lumpability,
  ringPartition,
  windowRadius,
} from '@/code/compute/lab/coarse-block'
import { encodeState, globalPermutation } from '@/code/rule/partitioned-pair'
import {
  RationalSpan,
  type LieElement,
  lieBracket,
  lieClosureDimension,
  spinSector,
  transpositionImage,
  tripleGenerators,
} from '@/code/compute/quantum/gate-set'
import { applyShiftedAdjacency, evaluatePolynomialOn, shiftedAdjacencyMinimalPolynomial } from '@/code/measure/z3-resonance'
import { closedQuotients, findRotaryMap, referenceTiling, squareTorus, triangleTorus } from '@/code/substrate/tiling-quotient'
import { DECLARED_TONE_MAPS } from '@/code/compute/quantum/classical-boundary'
import { type Vibe as BeatVibe } from '@/code/rule/bare-beat'
import {
  BEAT_LAYERS,
  BEAT_LAYER_NAMES,
  type BeatState,
  Z9_COIN_DIAG,
  Z9_COIN_OFF,
  Z9_MEET_SWAP,
  Z9_OMEGA,
  Z9_ZETA18,
  Z9_ZETA6,
  type Z9,
  applyBeat,
  applyBeats,
  applyHalfCoinD,
  applyOddChiralPhase,
  applyOppositeSignBounce,
  applyPairLineMixer,
  applyRoleMeet,
  basisKet,
  conjZ9,
  decodeConfig,
  mulZ9,
  stepDock,
} from '@/code/rule/bare-beat'

const scriptDir = dirname(fileURLToPath(import.meta.url))

export const WORKTREE_ROOT = resolve(scriptDir, '..')
export const GENERATED_DIR = join(WORKTREE_ROOT, 'code', 'proof', 'Vibe', 'Generated')

export type LeanExport = {
  // the file stem under Generated/, also the last part of the Lean module name
  name: string
  // the source files the table is read from, relative to the worktree root
  sources: readonly string[]
  // the Lean module that imports the generated file and proves the bridge theorems
  bridgeModule: string
  // the bridge theorem names, each required in REQUIRED_THEOREMS
  bridges: readonly string[]
  // the full text of the generated Lean file
  render: () => string
}

export type RenderedExport = {
  name: string
  // the path under Generated/, e.g. PairRuleTable.lean
  file: string
  text: string
}

export function generatedModule(name: string): string {
  return `Vibe.Generated.${name}`
}

function sourceDigest(source: string): string {
  const text = readFileSync(join(WORKTREE_ROOT, source), 'utf8')

  return createHash('sha256').update(text).digest('hex')
}

function header(input: {
  sources: readonly string[]
  lines: readonly string[]
}): string {
  const sources = input.sources.map(
    s => `Source: ${s}\nSHA-256: ${sourceDigest(s)}`,
  )

  return [
    '/-',
    'Generated by task/lean-export.ts. Never edit by hand: change the source and run',
    '  tsx --tsconfig tsconfig.json task/lean-export.ts --commit',
    'The drift gate task/check-lean-link.ts regenerates this file and fails on any byte of difference.',
    '',
    ...sources,
    '',
    ...input.lines,
    '-/',
  ].join('\n')
}

function wrap(input: { header: string; body: string }): string {
  return [
    input.header,
    '',
    'set_option autoImplicit false',
    '',
    'namespace Vibe',
    'namespace Generated',
    '',
    input.body,
    '',
    'end Generated',
    'end Vibe',
    '',
  ].join('\n')
}

function leanList(items: readonly string[], indent: string): string {
  if (items.length === 0) {
    return '[]'
  }

  return `[ ${items.join(`,\n${indent}  `)} ]`
}

// pair-rule.ts: the tone pair of every pair index, and the table of every conservative reversible pair rule in
// census order. The census is the brute force over all 9! permutations; it must agree with the fiber
// construction, or the export refuses.
export function exportPairRuleTable(): string {
  const source = 'code/rule/pair-rule.ts'
  const tones: string[] = []

  for (let p = 0; p < PAIR_COUNT; p++) {
    const [a, b] = pairTones(p)

    if (pairIndex(a, b) !== p) {
      throw new Error(`pairIndex(pairTones(${p})) is not ${p}`)
    }

    tones.push(`(${a}, ${b})`)
  }

  const census = pairRuleCensus().rules
  const fibers = pairRulesFromFibers()

  if (
    census.length !== fibers.length ||
    census.some((r, i) => tableKey(r.table) !== tableKey(fibers[i]!.table))
  ) {
    throw new Error('pairRuleCensus and pairRulesFromFibers disagree')
  }

  const tables = census.map(
    r => `[${Array.from(r.table, v => String(v)).join(', ')}]`,
  )
  const names = census.map(r => r.name)

  const body = [
    '/-- `pairTones p` of pair-rule.ts for every pair index `p` in `0 .. 8`, where',
    '    `p = (a + 1) * 3 + (b + 1)`. -/',
    `def pairTonesTable : List (Int × Int) :=\n  ${leanList(tones, '  ')}`,
    '',
    `/-- The table of every rule of \`pairRuleCensus()\` in pair-rule.ts, in census order: entry \`p\` of a`,
    '    table is the index of the image of pair `p`. The rule names, in the same order, are',
    `    ${names.join(', ')}. -/`,
    `def pairRuleTables : List (List Nat) :=\n  ${leanList(tables, '  ')}`,
  ].join('\n')

  return wrap({
    header: header({
      sources: [source],
      lines: [
        'Exports pairTones on every pair index, and the table of every rule of pairRuleCensus(),',
        `${census.length} rules, after checking the census equals pairRulesFromFibers().`,
        'Bridge: Vibe.Compute.PairRuleLink (gen_pair_tones_eq, gen_pair_rules_eq).',
      ],
    }),
    body,
  })
}

// L03 (models-0074): the rule census. Per census rule its name, the four symmetry flags and its class index under
// {1, P, C, PC} without and with time reversal (pair-rule.ts); its tone transport (wire-invariant.ts); per rule and
// background its M6 cell kind and type (counter.ts), its wire side (ray-search.ts) and the M5 occupancy-blind flag
// (gates.ts); and the sided and unsided unary closures of the two two-law wire rules (wire-invariant.ts).
const RULE_CENSUS_SOURCES = [
  'code/rule/pair-rule.ts',
  'code/compute/lab/gates.ts',
  'code/compute/lab/counter.ts',
  'code/compute/lab/ray-search.ts',
  'code/compute/lab/wire-invariant.ts',
] as const

const TWO_LAW_RULES = ['swap.BCA.swap', 'swap.CAB.swap'] as const

// a unary table key "t(-1),t(0),t(1)" as a Lean triple, and its base-3 code (input -1 least significant)
const keyTriple = (key: string): number[] => key.split(',').map(Number)
const keyCode = (key: string): number =>
  keyTriple(key).reduce((acc, v, i) => acc + (v + 1) * 3 ** i, 0)
const leanTriples = (keys: Iterable<string>): string =>
  `[${[...keys]
    .sort((x, y) => keyCode(x) - keyCode(y))
    .map(k => `(${keyTriple(k).join(', ')})`)
    .join(', ')}]`

export function exportRuleCensus(): string {
  const census = pairRuleCensus().rules
  const indexOf = (classes: ReturnType<typeof pairRuleClasses>): Map<string, number> =>
    new Map(
      classes.flatMap((c, i) => c.members.map(m => [tableKey(m.table), i] as const)),
    )
  const plain = indexOf(pairRuleClasses({ rules: census }))
  const withInverse = indexOf(pairRuleClasses({ rules: census, withInverse: true }))
  const gates = census.map(r => gateRule(r.name, r.table))
  const bool = (b: boolean): string => (b ? 'true' : 'false')

  const meta = census.map(r => {
    const key = tableKey(r.table)

    return `("${r.name}", ${bool(fixesVacuum(r.table))}, ${bool(conservesExcitation(r.table))}, ${bool(commutesWithSwap(r.table))}, ${bool(commutesWithNegation(r.table))}, ${plain.get(key)!}, ${withInverse.get(key)!})`
  })

  const passengers = gates.map(
    g => `[${toneTransport(g).map(t => `(${bool(t.forward)}, ${bool(t.backward)})`).join(', ')}]`,
  )

  const cells = gates.flatMap((g, i) =>
    [-1, 0, 1].map(b => {
      const split = splitCell(g, b)

      return `(${i}, ${b}, "${split.kind}", "${split.type ?? 'none'}", "${wireSide(g, b) ?? 'none'}", ${bool(occupancyBlind(g, b))})`
    }),
  )

  const closures = TWO_LAW_RULES.map(name => {
    const i = census.findIndex(r => r.name === name)

    if (i < 0) {
      throw new Error(`no census rule named ${name}`)
    }

    const sided = sidedUnaryClosure(gates[i]!)

    return `(${i}, "${name}", ${leanTriples(sided.first)}, ${leanTriples(sided.second)}, ${leanTriples(unsidedUnaryClosure(gates[i]!))})`
  })

  const body = [
    '/-- Per rule of `pairRuleCensus()`, in census order (the order of `pairRuleTables`): its name, `fixesVacuum`,',
    '    `conservesExcitation`, `commutesWithSwap`, `commutesWithNegation`, and its class index under `{1, P, C, PC}`',
    '    in `pairRuleClasses` without and with time reversal (`withInverse`). -/',
    `def ruleCensusMeta : List (String × Bool × Bool × Bool × Bool × Nat × Nat) :=\n  ${leanList(meta, '  ')}`,
    '',
    '/-- Per census rule, `toneTransport` of wire-invariant.ts for the tones `-1, 0, +1`: (forward, backward). -/',
    `def ruleCensusPassengers : List (List (Bool × Bool)) :=\n  ${leanList(passengers, '  ')}`,
    '',
    '/-- Per census rule index and background `-1, 0, +1`: `splitCell` kind and type of counter.ts, `wireSide` of',
    '    ray-search.ts, and `occupancyBlind` of gates.ts. -/',
    `def ruleCensusCells : List (Nat × Int × String × String × String × Bool) :=\n  ${leanList(cells, '  ')}`,
    '',
    '/-- For the two two-law wire rules (census index, name): `sidedUnaryClosure` first side, second side, and',
    '    `unsidedUnaryClosure` of wire-invariant.ts, each table `(t(-1), t(0), t(+1))`, sorted by base-3 code. -/',
    `def ruleCensusClosures :\n    List (Nat × String × List (Int × Int × Int) × List (Int × Int × Int) × List (Int × Int × Int)) :=\n  ${leanList(closures, '  ')}`,
  ].join('\n')

  return wrap({
    header: header({
      sources: RULE_CENSUS_SOURCES,
      lines: [
        `Exports the metadata, tone transport and 72 rule-background cells of the ${census.length} census rules,`,
        `and the unary closures of ${TWO_LAW_RULES.join(' and ')}.`,
        'Bridge: Vibe.Compute.RuleCensus (gen_rule_census_meta_eq, gen_rule_census_passengers_eq,',
        'gen_rule_census_cells_eq, gen_rule_census_closures_eq).',
      ],
    }),
    body,
  })
}

// bare-beat.ts and particles.ts (L12, lines meet once): the slot tables ROOTS, OPPOSITE_SLOT, LINES and
// LINE_OF_SLOT, and the exact centers of the docks lineChain visits from dock 0 of a fresh {3,4,3,4} mesh at line
// coordinates -2..2 along every slot, each as five (a, b) pairs of a + b sqrt 2 in Coxeter root coordinates. The
// export refuses when the mesh counted an inconsistent frame step.
const BEAT_SLOT_SOURCES = ['code/rule/bare-beat.ts', 'code/compute/quantum/particles.ts'] as const
const BEAT_LINE_REACH = 2

function beatCenterPairs(key: string): string {
  const pairs = key.split(';').map(entry => {
    const [a, b] = entry.split(',')

    return `(${a}, ${b})`
  })

  if (pairs.length !== 5) {
    throw new Error(`dock center ${key} does not have 5 coordinates`)
  }

  return `[${pairs.join(', ')}]`
}

export function exportBeatSlots(): string {
  const roots = ROOTS.map(r => `(${r[0]}, ${r[1]}, ${r[2]}, ${r[3]})`)
  const lines = LINES.map(([a, b]) => `(${a}, ${b})`)

  const centers = withGeometry('3434', () => {
    const rows = ROOTS.map((_, slot) => {
      const chain = lineChain(0, slot, BEAT_LINE_REACH)
      const dockAt = new Map<number, number>()

      for (const [dock, k] of chain) {
        dockAt.set(k, dock)
      }

      const row: string[] = []

      for (let k = -BEAT_LINE_REACH; k <= BEAT_LINE_REACH; k++) {
        const dock = dockAt.get(k)

        if (dock === undefined) {
          throw new Error(`lineChain(0, ${slot}) has no dock at coordinate ${k}`)
        }

        row.push(beatCenterPairs(dockCenterKey(dock)))
      }

      return `[${row.join(',\n    ')}]`
    })

    if (inconsistentStepCount() !== 0) {
      throw new Error('the {3,4,3,4} mesh counted an inconsistent frame step')
    }

    return rows
  })

  const body = [
    '/-- `ROOTS` of bare-beat.ts: the D_4 root of every slot `0 .. 23`. -/',
    `def beatRoots : List (Int × Int × Int × Int) :=\n  ${leanList(roots, '  ')}`,
    '',
    '/-- `OPPOSITE_SLOT` of bare-beat.ts: the slot of the negated root. -/',
    `def beatOppositeSlot : List Nat :=\n  [${OPPOSITE_SLOT.join(', ')}]`,
    '',
    '/-- `LINES` of bare-beat.ts: the 12 antipodal slot pairs `(a, b)`, `a < b`. -/',
    `def beatLines : List (Nat × Nat) :=\n  [${lines.join(', ')}]`,
    '',
    '/-- `LINE_OF_SLOT` of bare-beat.ts: the line of every slot. -/',
    `def beatLineOfSlot : List Nat :=\n  [${LINE_OF_SLOT.join(', ')}]`,
    '',
    '/-- For every slot `s`, the centers of the docks at coordinates `-2 .. 2` of',
    '    `lineChain(0, s, 2)` (particles.ts) on a fresh `{3,4,3,4}` mesh, by `dockCenterKey`',
    '    (bare-beat.ts): five `(a, b)` pairs of `a + b √2` per dock. -/',
    `def beatLineCenters : List (List (List (Int × Int))) :=\n  ${leanList(centers, '  ')}`,
  ].join('\n')

  return wrap({
    header: header({
      sources: BEAT_SLOT_SOURCES,
      lines: [
        'Exports ROOTS, OPPOSITE_SLOT, LINES, LINE_OF_SLOT, and the centers of the docks lineChain visits',
        `from dock 0 of a fresh {3,4,3,4} mesh at line coordinates -${BEAT_LINE_REACH}..${BEAT_LINE_REACH} on every slot.`,
        'Bridge: Vibe.Compute.LinesMeetOnce (gen_beat_roots_eq, gen_beat_opposite_eq, gen_beat_lines_eq,',
        'gen_beat_line_centers_eq).',
      ],
    }),
    body,
  })
}

// L07 (models-0083): q2rMove of spin-one-q2r.ts on its local finite family, every coupling J in 1..3, crystal field
// Delta in -12..12 and neighbour field h in -12..12 (degree at most 12). Each (J, Delta, h) is one small Nat, the
// base-3 code (move(-1) + 1) + 3 (move(0) + 1) + 9 (move(+1) + 1), in the nesting order J, Delta, h (h innermost):
// a list of 1,875 tuple literals times out in Lean's elaborator, a list of small Nats does not.
const Q2R_SOURCES = ['code/rule/spin-one-q2r.ts'] as const
const Q2R_COUPLING_MAX = 3
const Q2R_REACH = 12

export function exportSpinOneQ2r(): string {
  const lines: string[] = []

  let count = 0

  for (let coupling = 1; coupling <= Q2R_COUPLING_MAX; coupling++) {
    for (let crystalField = -Q2R_REACH; crystalField <= Q2R_REACH; crystalField++) {
      const row: number[] = []

      for (let field = -Q2R_REACH; field <= Q2R_REACH; field++) {
        const out = [-1, 0, 1].map(t => q2rMove(t, field, { coupling, crystalField }))

        if (out.some(o => o !== -1 && o !== 0 && o !== 1)) {
          throw new Error(`q2rMove left the tones at J ${coupling}, Delta ${crystalField}, h ${field}`)
        }

        row.push(out[0]! + 1 + 3 * (out[1]! + 1) + 9 * (out[2]! + 1))
        count++
      }

      lines.push(row.join(', '))
    }
  }

  const body = [
    `/-- \`q2rMove(tone, field, { coupling, crystalField })\` of spin-one-q2r.ts for every coupling \`J\` in`,
    `    \`1 .. ${Q2R_COUPLING_MAX}\`, crystal field \`Δ\` in \`-${Q2R_REACH} .. ${Q2R_REACH}\` and neighbour field \`h\` in`,
    `    \`-${Q2R_REACH} .. ${Q2R_REACH}\`, in that nesting order (\`h\` innermost, one line per \`(J, Δ)\`): each entry is`,
    '    `(move(-1) + 1) + 3 (move(0) + 1) + 9 (move(+1) + 1)`. -/',
    `def q2rMoveCodes : List Nat :=\n  [ ${lines.join(',\n    ')} ]`,
  ].join('\n')

  return wrap({
    header: header({
      sources: Q2R_SOURCES,
      lines: [
        `Exports q2rMove on every tone, J in 1..${Q2R_COUPLING_MAX}, Delta and h in -${Q2R_REACH}..${Q2R_REACH} (${count} entries).`,
        'Bridge: Vibe.Compute.SpinOneQ2R (gen_q2r_move_eq).',
      ],
    }),
    body,
  })
}

// L11 (models-0090): the line lumpability witnesses of coarse-block.ts (E-CMP-0066) for every non-identity rule of
// pairRuleCensus(), every line schedule, b 2 to 4 at every declared offset, tau 1 and 2, and the three reading maps
// majority, netSign and netResidue. A row the capped search leaves open is decided by the C-conjugate rule's negated
// witness, re-run by checkWitness on the rule's own table, as the experiment does; a row with no ring-checked witness
// makes the export refuse. Each row is nine small Nats: rule index, schedule index, b, offset, tau, map index,
// base + LUMP_BASE_SHIFT, and the left and right window codes (encodeState: base 3, cell 0 the lowest digit, digit
// tone + 1). Also the three maps on every block of 2 to 4 cells.
const LUMP_SOURCES = [
  'code/compute/lab/coarse-block.ts',
  'code/rule/partitioned-pair.ts',
  'code/rule/pair-rule.ts',
] as const
const LUMP_MAPS = ['majority', 'netSign', 'netResidue'] as const
const LUMP_BLOCKS = [2, 3, 4] as const
const LUMP_TAUS = [1, 2] as const
const LUMP_CAP = 3 ** 12
const LUMP_BASE_SHIFT = 32

function twoDigits(k: number): string {
  return k < 10 ? `0${k}` : `${k}`
}

export function exportLumpability(): string {
  const census = pairRuleCensus().rules

  if (!census[0]!.table.every((v, i) => v === i)) {
    throw new Error('pairRuleCensus() does not start with the identity')
  }

  const defs: string[] = []
  const names: string[] = ['[]']

  let rows = 0
  let byNegation = 0

  for (let k = 1; k < census.length; k++) {
    const table = census[k]!.table
    const mate = conjugateTable(table, negatePair)
    const flat: number[] = []

    LINE_SCHEDULES.forEach((schedule, s) => {
      for (const b of LUMP_BLOCKS) {
        for (const offset of blockOffsets(b, schedule)) {
          for (const tau of LUMP_TAUS) {
            LUMP_MAPS.forEach((name, m) => {
              const map = blockMap(name)
              const radius = windowRadius(b, tau, schedule)
              const check = (w: LumpWitness): boolean =>
                checkWitness({ table, schedule, b, tau, map, witness: w, radius })

              let witness = lumpability({ table, schedule, b, offset, tau, map, cap: LUMP_CAP }).witness

              if (!witness) {
                const other = lumpability({ table: mate, schedule, b, offset, tau, map, cap: LUMP_CAP }).witness

                if (other) {
                  const negated = {
                    ...other,
                    left: other.left.map(v => -v),
                    right: other.right.map(v => -v),
                  }

                  if (check(negated)) {
                    witness = negated
                    byNegation++
                  }
                }
              }

              if (!witness || !check(witness)) {
                throw new Error(`no ring-checked witness: rule ${k}, ${schedule.name}, b ${b}, offset ${offset}, tau ${tau}, ${name}`)
              }

              if (witness.base + LUMP_BASE_SHIFT < 0) {
                throw new Error(`witness base ${witness.base} below -${LUMP_BASE_SHIFT}`)
              }

              flat.push(
                k,
                s,
                b,
                offset,
                tau,
                m,
                witness.base + LUMP_BASE_SHIFT,
                encodeState(witness.left),
                encodeState(witness.right),
              )
              rows++
            })
          }
        }
      }
    })

    const name = `lumpWitnessRule${twoDigits(k)}`

    names.push(name)
    defs.push(
      `/-- The witness rows of rule ${k} (${census[k]!.name}), nine Nats each. -/`,
      `def ${name} : List Nat :=\n  [${flat.join(', ')}]`,
      '',
    )
  }

  const maps: string[] = []

  for (const name of LUMP_MAPS) {
    const map = blockMap(name)

    for (const b of LUMP_BLOCKS) {
      const out: number[] = []

      for (let code = 0; code < 3 ** b; code++) {
        out.push(map.read(Int8Array.from(blockOfCode(code, b)), 0, b))
      }

      maps.push(`[${out.join(', ')}]`)
    }
  }

  const body = [
    ...defs,
    '/-- The witness rows of every rule in census order (the identity has none). -/',
    `def lumpWitnesses : List (List Nat) :=\n  ${leanList(names, '  ')}`,
    '',
    `/-- \`read\` of the block maps ${LUMP_MAPS.join(', ')} (in that order, the outer loop) of coarse-block.ts on`,
    `    every block of b = ${LUMP_BLOCKS.join(', ')} cells (the inner loop), indexed by \`blockCode\`. -/`,
    `def lumpBlockMapTables : List (List Int) :=\n  ${leanList(maps, '  ')}`,
  ].join('\n')

  return wrap({
    header: header({
      sources: LUMP_SOURCES,
      lines: [
        `Exports ${rows} ring-checked lumpability witnesses of coarse-block.ts (${byNegation} from the C-conjugate's`,
        `negated witness), the cap ${LUMP_CAP} windows, base shift ${LUMP_BASE_SHIFT}, and the block maps on every block.`,
        'Bridge: Vibe.Compute.Lumpability (gen_lump_block_maps_eq, thm_lump_line_conflict_witnesses).',
      ],
    }),
    body,
  })
}

// L11 (models-0090): the round of partitioned-pair.ts as a permutation of all 3^6 configurations of the 6-ring under
// brick2 (ringPartition of coarse-block.ts, base 0), for every rule of pairRuleCensus(), by globalPermutation.
const RING_SOURCES = [
  'code/rule/partitioned-pair.ts',
  'code/compute/lab/coarse-block.ts',
  'code/rule/pair-rule.ts',
] as const
const RING_SIZE = 6

export function exportPartitionedRing(): string {
  const census = pairRuleCensus().rules
  const partition = ringPartition({ schedule: LINE_SCHEDULES[0]!, n: RING_SIZE, base: 0 })
  const defs: string[] = []
  const names: string[] = []

  census.forEach((rule, k) => {
    const image = globalPermutation({ table: rule.table, schedule: partition })
    const name = `ringImage${twoDigits(k)}`

    names.push(name)
    defs.push(
      `/-- \`globalPermutation\` of rule ${k} (${rule.name}): entry \`x\` is the code of the round's image of`,
      '    configuration code `x`. -/',
      `def ${name} : List Nat :=\n  [${Array.from(image).join(', ')}]`,
      '',
    )
  })

  const body = [
    ...defs,
    '/-- The images of every rule in census order. -/',
    `def partitionedRingImages : List (List Nat) :=\n  ${leanList(names, '  ')}`,
  ].join('\n')

  return wrap({
    header: header({
      sources: RING_SOURCES,
      lines: [
        `Exports globalPermutation on the ${RING_SIZE}-ring under brick2 (ringPartition, base 0) for every rule of`,
        `pairRuleCensus(), ${census.length} rules, ${3 ** RING_SIZE} configurations each (code = encodeState).`,
        'Bridge: Vibe.Compute.Lumpability (gen_partitioned_ring_eq).',
      ],
    }),
    body,
  })
}

// L15 (models-0085): the bare beat against the Lean Fock beat (Vibe.Compute.BeatLink). A family vibe is
// (slot, tone, role) at dock 0 of a fresh {3,4,3,4} mesh. The family: every one-excitation state of dock 0, every
// two-excitation state with an excitation on line 0 (slot 0 or its opposite), and every identical full-line pair
// (same tone, same role) on any line, roles 0 and 1 only (the Lean Fock model has 2 roles). It is closed under the
// seven dock-local layers, which the export checks. Also: the layer coefficients as the layers produce them, the
// beat itself, the 24 neighbour centers, and the lone vibe (slot 0, +1, role 0) to beat 16 with q-ladder Q5's
// moments and returns, which the export checks against the printed table.
const BARE_BEAT_SOURCES = ['code/rule/bare-beat.ts', 'code/compute/quantum/particles.ts'] as const
const BARE_BEAT_LINE_REACH = 16

type BareBeatVibe = readonly [number, number, number]

function bareBeatKey(vibes: readonly BareBeatVibe[]): string {
  return [...vibes]
    .sort((a, b) => a[0] - b[0])
    .map(v => v.join(':'))
    .join(';')
}

function bareBeatFamily(): BareBeatVibe[][] {
  const tones = [-1, 1]
  const roles = [0, 1]
  const lineZero = [0, OPPOSITE_SLOT[0]!]
  const family: BareBeatVibe[][] = []

  for (let s = 0; s < 24; s++) {
    for (const t of tones) {
      for (const r of roles) {
        family.push([[s, t, r]])
      }
    }
  }

  for (let s1 = 0; s1 < 24; s1++) {
    for (let s2 = s1 + 1; s2 < 24; s2++) {
      const touchesLineZero = lineZero.includes(s1) || lineZero.includes(s2)

      if (!touchesLineZero && OPPOSITE_SLOT[s1] !== s2) {
        continue
      }

      for (const t1 of tones) {
        for (const r1 of roles) {
          for (const t2 of tones) {
            for (const r2 of roles) {
              if (!touchesLineZero && (t1 !== t2 || r1 !== r2)) {
                continue
              }

              family.push([
                [s1, t1, r1],
                [s2, t2, r2],
              ])
            }
          }
        }
      }
    }
  }

  // sorted by the flat Lean form (slot, tone 1 or 0, role, ...) in lexicographic order, so Lean proves the states
  // distinct by one pass over adjacent pairs
  const flat = (v: readonly BareBeatVibe[]): number[] => v.flatMap(([s, t, r]) => [s, t === 1 ? 1 : 0, r])
  const lex = (a: readonly number[], b: readonly number[]): number => {
    for (let k = 0; k < a.length && k < b.length; k++) {
      if (a[k] !== b[k]) {
        return a[k]! - b[k]!
      }
    }

    return a.length - b.length
  }

  return family.sort((a, b) => lex(flat(a), flat(b)))
}

// an integer as a natural number (zigzag: 2c for c >= 0, -2c - 1 for c < 0), so every table is a list of naturals
function bareBeatZig(c: bigint): string {
  return String(c >= 0n ? 2n * c : -2n * c - 1n)
}

// amp / den as num / 6^e (the Lean NinthRaw6 form) with the least e such that den divides 6^e: the six zigzag
// coefficients of num, then e
function bareBeatRaw(amp: Z9, den: bigint): string {
  let e = 0

  while (6n ** BigInt(e) % den !== 0n) {
    e++

    if (e > 64) {
      throw new Error(`denominator ${den} is not a product of 2s and 3s`)
    }
  }

  const k = 6n ** BigInt(e) / den

  return `${amp.map(c => bareBeatZig(c * k)).join(', ')}, ${e}`
}

function bareBeatKet(vibes: readonly BareBeatVibe[]): BeatState {
  return basisKet(vibes.map(([s, t, r]) => [0, s, t as -1 | 1, r] as const))
}

// a state as rows (family index of its configuration read at dock 0, amplitude), sorted by index
function bareBeatRows(
  state: BeatState,
  indexOf: Map<string, number>,
  onDock: (dock: number, slot: number) => boolean,
): string {
  const rows: [number, string][] = []

  for (const [key, amp] of state.amp) {
    const vibes = decodeConfig(key)

    for (const [dock, slot] of vibes) {
      if (!onDock(dock, slot)) {
        throw new Error(`output ${key} leaves the expected dock`)
      }
    }

    const j = indexOf.get(bareBeatKey(vibes.map(([, s, t, r]) => [s, t, r] as const)))

    if (j === undefined) {
      throw new Error(`output ${key} is outside the family`)
    }

    rows.push([j, bareBeatRaw(amp, state.den)])
  }

  rows.sort((a, b) => a[0] - b[0])

  return `[${rows.map(([j, a]) => `${j}, ${a}`).join(', ')}]`
}

// |amp|^2 numerator over den^2, refusing a value that is not rational
function bareBeatNormSq(amp: Z9): bigint {
  const n = mulZ9(conjZ9(amp), amp)

  if (n.slice(1).some(c => c !== 0n)) {
    throw new Error(`|amp|^2 of ${amp.join(',')} is not rational`)
  }

  return n[0]!
}

function bareBeatRatio(num: bigint, den: bigint): string {
  let x = num < 0n ? -num : num
  let y = den

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  const g = x === 0n ? den : x

  return `${num / g}/${den / g}`
}

// q-ladder Q5: the bare-U lone vibe's printed second moments and returns to the start dock
const Q5_LONE_MOMENT: Record<number, string> = {
  1: '1/1',
  2: '1/1',
  3: '3/2',
  4: '23/8',
  5: '61/16',
  6: '663/128',
  7: '1855/256',
  8: '9259/1024',
  16: '1171761107/33554432',
}
const Q5_LONE_RETURN: Record<number, string> = {
  1: '0/1',
  2: '3/4',
  3: '0/1',
  4: '21/64',
  5: '0/1',
  6: '39/256',
  7: '0/1',
  8: '2433/16384',
  16: '76931769/1073741824',
}

export function exportBareBeat(): string {
  const family = bareBeatFamily()
  const indexOf = new Map(family.map((v, i) => [bareBeatKey(v), i] as const))
  const atBase = (dock: number): boolean => dock === 0
  const layers = [
    ['phi', (s: BeatState) => applyOddChiralPhase(s, false)],
    ['coin', (s: BeatState) => applyHalfCoinD(s, false)],
    ['bounce', (s: BeatState) => applyOppositeSignBounce(s)],
    ['pair', (s: BeatState) => applyPairLineMixer(s, false)],
    ['meet', (s: BeatState) => applyRoleMeet(s, false)],
  ] as const

  // a dock center key 'a,b;...' (five a + b sqrt 2) as ten zigzag naturals
  const centerNats = (key: string): string => {
    const parts = key.split(';').flatMap(entry => entry.split(','))

    if (parts.length !== 10) {
      throw new Error(`dock center ${key} does not have 5 coordinates`)
    }

    return `[${parts.map(p => bareBeatZig(BigInt(p))).join(', ')}]`
  }

  const body = withGeometry('3434', () => {
    const neighbourCenters = OPPOSITE_SLOT.map((_, s) => centerNats(dockCenterKey(stepDock(0, s))))
    const layerTables = layers.map(
      ([name, apply]) => [name, family.map(v => bareBeatRows(apply(bareBeatKet(v)), indexOf, atBase))] as const,
    )
    // every output vibe of the beat sits on the neighbour its own slot points to, so a beat row is written by the
    // pre-stream configuration at dock 0
    const beatRows = family.map(v =>
      bareBeatRows(applyBeat(bareBeatKet(v)), indexOf, (dock, slot) => dockCenterKey(dock) === dockCenterKey(stepDock(0, slot))),
    )

    const o = OPPOSITE_SLOT[0]!
    const witness = (state: BeatState, vibes: readonly BareBeatVibe[]): string => {
      const z = state.amp.get(
        [...vibes]
          .sort((a, b) => a[0] - b[0])
          .map(([s, t, r]) => `0:${s}:${t}:${r}`)
          .join(';'),
      )

      if (z === undefined) {
        throw new Error('a coefficient witness has no amplitude')
      }

      return bareBeatRaw(z, state.den)
    }
    const lone: BareBeatVibe[] = [[0, 1, 0]]
    const oppSign: BareBeatVibe[] = [[0, 1, 0], [o, -1, 0]]
    const ident: BareBeatVibe[] = [[0, 1, 0], [o, 1, 0]]
    const diffRole: BareBeatVibe[] = [[0, 1, 0], [o, 1, 1]]
    const coeffs = [
      ['coin_diag', witness(applyHalfCoinD(bareBeatKet(lone), false), lone)],
      ['coin_off', witness(applyHalfCoinD(bareBeatKet(lone), false), [[o, 1, 0]])],
      ['full_line_phase', witness(applyHalfCoinD(bareBeatKet(oppSign), false), oppSign)],
      ['bounce_sign', witness(applyOppositeSignBounce(bareBeatKet(oppSign)), [[0, -1, 0], [o, 1, 0]])],
      ['meet_equal_role_phase', witness(applyRoleMeet(bareBeatKet(ident), false), ident)],
      ['meet_keep', witness(applyRoleMeet(bareBeatKet(diffRole), false), diffRole)],
      ['meet_swap', witness(applyRoleMeet(bareBeatKet(diffRole), false), [[0, 1, 1], [o, 1, 0]])],
      ['pair_keep', witness(applyPairLineMixer(bareBeatKet(ident), false), ident)],
      ['pair_hop', witness(applyPairLineMixer(bareBeatKet(ident), false), [[1, 1, 0], [OPPOSITE_SLOT[1]!, 1, 0]])],
    ]

    const chain = lineChain(0, 0, BARE_BEAT_LINE_REACH)
    const dockAt = new Map<number, number>()

    for (const [dock, k] of chain) {
      dockAt.set(k, dock)
    }

    const lineCenters: string[] = []

    for (let k = -BARE_BEAT_LINE_REACH; k <= BARE_BEAT_LINE_REACH; k++) {
      lineCenters.push(centerNats(dockCenterKey(dockAt.get(k)!)))
    }

    const walk: string[] = []
    const moments: string[] = []
    const returns: string[] = []

    for (let t = 0; t <= BARE_BEAT_LINE_REACH; t++) {
      const state = applyBeats(basisKet([[0, 0, 1, 0]]), t)
      const rows: [number, number, string][] = []
      let moment = 0n
      let back = 0n

      for (const [key, amp] of state.amp) {
        const vibes = decodeConfig(key)

        if (vibes.length !== 1) {
          throw new Error(`lone walk beat ${t} holds ${vibes.length} vibes`)
        }

        const [dock, slot, tone, role] = vibes[0]!
        const k = chain.get(dock)

        if (k === undefined || tone !== 1 || role !== 0 || (slot !== 0 && slot !== o)) {
          throw new Error(`lone walk beat ${t} leaves line 0: ${key}`)
        }

        rows.push([k, slot, bareBeatRaw(amp, state.den)])
        const p = bareBeatNormSq(amp)

        moment += BigInt(k * k) * p

        if (k === 0) {
          back += p
        }
      }

      rows.sort((a, b) => a[0] - b[0] || a[1] - b[1])
      walk.push(`[${rows.map(([k, s, a]) => `${bareBeatZig(BigInt(k))}, ${s}, ${a}`).join(', ')}]`)
      const den2 = state.den * state.den

      if (Q5_LONE_MOMENT[t] !== undefined && bareBeatRatio(moment, den2) !== Q5_LONE_MOMENT[t]) {
        throw new Error(`beat ${t} second moment ${bareBeatRatio(moment, den2)} is not q-ladder's ${Q5_LONE_MOMENT[t]}`)
      }

      if (Q5_LONE_RETURN[t] !== undefined && bareBeatRatio(back, den2) !== Q5_LONE_RETURN[t]) {
        throw new Error(`beat ${t} return ${bareBeatRatio(back, den2)} is not q-ladder's ${Q5_LONE_RETURN[t]}`)
      }

      moments.push(bareBeatRaw([moment, 0n, 0n, 0n, 0n, 0n], den2))
      returns.push(bareBeatRaw([back, 0n, 0n, 0n, 0n, 0n], den2))
    }

    if (inconsistentStepCount() !== 0) {
      throw new Error('the {3,4,3,4} mesh counted an inconsistent frame step')
    }

    const z9 = (z: Z9): string => `[${z.map(bareBeatZig).join(', ')}]`
    // a long table in chunks of 100 rows (one def each, elaborated quickly) joined by `++`
    const chunked = (name: string, doc: string, rows: readonly string[]): string[] => {
      const parts: string[] = []
      const names: string[] = []

      for (let start = 0; start < rows.length; start += 100) {
        const part = `${name}_${String(start / 100).padStart(2, '0')}`

        names.push(part)
        parts.push(`def ${part} : List (List Nat) :=\n  [${rows.slice(start, start + 100).join(',\n   ')}]`, '')
      }

      return [...parts, doc, `def ${name} : List (List Nat) :=\n  ${names.join(' ++ ')}`, '']
    }

    return [
      '/-! Every integer below is written as a natural number by zigzag (`2c` for `c ≥ 0`, `-2c - 1` for `c < 0`),',
      'and every amplitude as seven naturals: the zigzag coefficients of `num` on `1, z, ..., z^5`',
      '(`z^6 + z^3 + 1 = 0`) and `exp`, for `num / 6^exp`. -/',
      '',
      '/-- The `Z9` constants of bare-beat.ts: `Z9_COIN_DIAG, Z9_COIN_OFF, Z9_MEET_SWAP, Z9_ZETA18, Z9_ZETA6,',
      '    Z9_OMEGA`, in that order (zigzag). -/',
      `def bareBeatZ9 : List (List Nat) :=\n  [${[Z9_COIN_DIAG, Z9_COIN_OFF, Z9_MEET_SWAP, Z9_ZETA18, Z9_ZETA6, Z9_OMEGA].map(z9).join(', ')}]`,
      '',
      '/-- The names of the measured coefficients, in the order of `bareBeatCoeffs`. -/',
      `def bareBeatCoeffNames : List String :=\n  [${coeffs.map(([n]) => `"${n}"`).join(', ')}]`,
      '',
      '/-- Each layer coefficient as the layer itself produces it on its smallest witness state (an amplitude). -/',
      `def bareBeatCoeffs : List (List Nat) :=\n  [${coeffs.map(([, a]) => `[${a}]`).join(',\n   ')}]`,
      '',
      '/-- `BEAT_LAYER_NAMES`, in execution order. -/',
      `def bareBeatLayerNames : List String :=\n  [${BEAT_LAYER_NAMES.map(n => `"${n}"`).join(', ')}]`,
      '',
      '/-- The function names of `BEAT_LAYERS`, in execution order. -/',
      `def bareBeatLayerFunctions : List String :=\n  [${BEAT_LAYERS.map(f => `"${f.name}"`).join(', ')}]`,
      '',
      ...chunked(
        'bareBeatFamily',
        '/-- The declared family at dock 0: each state its vibes `slot, tone (1 for +1, 0 for -1), role`, by slot. -/',
        family.map(v => `[${v.map(([s, t, r]) => `${s}, ${t === 1 ? 1 : 0}, ${r}`).join(', ')}]`),
      ),
      ...layerTables.flatMap(([name, rows]) =>
        chunked(
          `bareBeatLayer_${name}`,
          `/-- Layer \`${name}\` on every family state: rows \`output family index, amplitude\`, by index. -/`,
          rows,
        ),
      ),
      ...chunked(
        'bareBeatBeat',
        '/-- `applyBeat` on every family state: rows `family index of the pre-stream configuration, amplitude`; every\n    output vibe sits on the dock its slot points to from dock 0. -/',
        beatRows,
      ),
      '/-- The center of `stepDock(0, s)` for every slot `s` (`dockCenterKey`: five `a + b √2`, zigzag `a, b`). -/',
      `def bareBeatNeighbourCenters : List (List Nat) :=\n  [${neighbourCenters.join(',\n   ')}]`,
      '',
      `/-- The centers of the docks of \`lineChain(0, 0, ${BARE_BEAT_LINE_REACH})\` at coordinates -${BARE_BEAT_LINE_REACH} .. ${BARE_BEAT_LINE_REACH}. -/`,
      `def bareBeatLineCenters : List (List Nat) :=\n  [${lineCenters.join(',\n   ')}]`,
      '',
      `/-- \`applyBeats\` of the lone vibe (dock 0, slot 0, +1, role 0) at beats 0 .. ${BARE_BEAT_LINE_REACH}: rows`,
      '    `zigzag line coordinate, slot, amplitude`. -/',
      `def bareBeatWalk : List (List Nat) :=\n  [${walk.join(',\n   ')}]`,
      '',
      '/-- Per beat of the lone walk, the second moment `sum k^2 p` (an amplitude; checked by the export against',
      "    q-ladder Q5's printed table). -/",
      `def bareBeatWalkMoments : List (List Nat) :=\n  [${moments.map(m => `[${m}]`).join(', ')}]`,
      '',
      '/-- Per beat of the lone walk, the return probability to dock 0 (an amplitude; checked likewise). -/',
      `def bareBeatWalkReturns : List (List Nat) :=\n  [${returns.map(m => `[${m}]`).join(', ')}]`,
    ].join('\n')
  })

  return wrap({
    header: header({
      sources: BARE_BEAT_SOURCES,
      lines: [
        `Exports the layer coefficients, the ${family.length}-state family's seven dock-local layer tables and beat`,
        `table, the neighbour centers, and the lone walk to beat ${BARE_BEAT_LINE_REACH} of the bare beat.`,
        'Bridge: Vibe.Compute.BeatLink.',
      ],
    }),
    body,
  })
}

// L19 (models-0092): the Kleene and counter certificates. (1) The four width-9 neg layouts E-CMP-0058 replays, read
// from the LAYOUTS literal of its experiment file; (2) the neg, min and max layouts of E-CMP-0061 for the four one-law
// cells, found here by the same ray search and line conversion the experiment runs (searchRays to span 10 for neg and
// 12 for min and max, rayLayoutToLine); each with the dense runner's table on every input (denseLineTable), which must
// equal the target or the export refuses. (3) The T5 counter cell and registerRun's ADD and SUB value on all 162 cases
// a, n in 0..8, the side that adds read from a one-mover run as universality-m1.ts reads it.
const KLEENE_SOURCES = [
  'code/rule/pair-rule.ts',
  'code/compute/lab/gates.ts',
  'code/compute/lab/ray-search.ts',
  'code/compute/lab/wire-invariant.ts',
  'code/compute/lab/counter.ts',
  'test/experiment/computation/wire-neg.ts',
] as const

const KLEENE_ONE_LAW: readonly [string, number][] = [
  ['id.CAB.swap', 1],
  ['id.BCA.swap', 1],
  ['swap.BCA.id', -1],
  ['swap.CAB.id', -1],
]
const KLEENE_NEG_SPAN = 10
const KLEENE_MIN_MAX_SPAN = 12
const KLEENE_REGISTER_RANGE = 8
const KLEENE_T5_RULE = 'id.CBA.swap'

// The LAYOUTS literal of wire-neg.ts: one `rule:` line, one `control:` line and one single-line `layout:` object each.
function wireNegLayouts(): { rule: string; layout: LineLayout }[] {
  const text = readFileSync(join(WORKTREE_ROOT, 'test/experiment/computation/wire-neg.ts'), 'utf8')
  const pattern =
    /rule: '([^']+)',\s*control: '[^']+',\s*layout: \{ background: (-?\d+), start: (-?\d+), window: \[([^\]]*)\], inputs: \[([^\]]*)\], readPosition: (-?\d+), readRound: (\d+) \}/g
  const ints = (s: string): number[] => s.split(',').map(x => Number(x.trim()))
  const out = [...text.matchAll(pattern)].map(m => ({
    rule: m[1]!,
    layout: {
      background: Number(m[2]),
      start: Number(m[3]),
      window: m[4]!.split(',').map(x => (x.trim() === 'null' ? null : Number(x.trim()))),
      inputs: ints(m[5]!),
      readPosition: Number(m[6]),
      readRound: Number(m[7]),
    },
  }))

  if (out.length !== 4) {
    throw new Error(`wire-neg.ts LAYOUTS: expected 4 layouts, read ${out.length}`)
  }

  return out
}

export function exportKleene(): string {
  const census = pairRuleCensus().rules
  const indexOf = (name: string): number => {
    const i = census.findIndex(r => r.name === name)

    if (i < 0) {
      throw new Error(`no census rule named ${name}`)
    }

    return i
  }
  const gates = census.map(r => gateRule(r.name, r.table))
  const targetOf = (name: string) => KLEENE_TARGETS.find(t => t.name === name)!
  const rows: string[] = []

  const addRow = (code: string, rule: string, target: string, layout: LineLayout): void => {
    const i = indexOf(rule)
    const dense = denseLineTable(gates[i]!, layout)

    if (gateTableKey(dense) !== gateTableKey(targetOf(target).table)) {
      throw new Error(`${code} ${rule} ${target}: the dense run does not compute the target`)
    }

    if (layout.inputs.length !== targetOf(target).arity) {
      throw new Error(`${code} ${rule} ${target}: ${layout.inputs.length} inputs`)
    }

    // window cells: the constant tone, or 2 for input x and 3 for input y
    const window = layout.window.map((v, k) => {
      const j = layout.inputs.indexOf(k)

      if (j >= 0) {
        return 2 + j
      }

      if (v === null) {
        throw new Error(`${code} ${rule} ${target}: an unplaced input at window cell ${k}`)
      }

      return v
    })

    rows.push(
      `("${code}", ${i}, "${rule}", ${layout.background}, ${layout.start}, [${window.join(', ')}], ${layout.readPosition}, ${layout.readRound}, "${target}", [${Array.from(dense).join(', ')}])`,
    )
  }

  for (const { rule, layout } of wireNegLayouts()) {
    addRow('E-CMP-0058', rule, 'neg', layout)
  }

  for (const [name, background] of KLEENE_ONE_LAW) {
    const rule = gates[indexOf(name)]!
    const side = wireSide(rule, background)

    if (side === null) {
      throw new Error(`${name} on ${background}: no one-sided wire`)
    }

    const unary = searchRays({ rule, background, targets: [targetOf('neg')], maxSpan: KLEENE_NEG_SPAN })
    const binary = searchRays({ rule, background, targets: [targetOf('min'), targetOf('max')], maxSpan: KLEENE_MIN_MAX_SPAN })

    for (const h of [...unary.hits, ...binary.hits]) {
      addRow('E-CMP-0061', name, h.target, rayLayoutToLine({ rays: h.rays, side, background, inputs: h.inputs }))
    }
  }

  if (rows.length !== 16) {
    throw new Error(`expected 16 Kleene layouts, have ${rows.length}`)
  }

  // the T5 counter
  const t5i = indexOf(KLEENE_T5_RULE)
  const t5 = gates[t5i]!
  const split = splitCell(t5, 0)

  if (split.type !== 'T5' || split.mover === null || split.still === null) {
    throw new Error(`${KLEENE_T5_RULE} on 0 is not a T5 cell with a mover and a still tone`)
  }

  const unit = registerRun({ rule: t5, split, a: 0, n: 1, from: 'right' }).value
  const addSide: 'left' | 'right' = unit === 1 ? 'right' : 'left'
  const subSide: 'left' | 'right' = addSide === 'right' ? 'left' : 'right'
  const counter: string[] = []
  const bool = (b: boolean): string => (b ? 'true' : 'false')

  for (let a = 0; a <= KLEENE_REGISTER_RANGE; a++) {
    for (let n = 0; n <= KLEENE_REGISTER_RANGE; n++) {
      const add = registerRun({ rule: t5, split, a, n, from: addSide })
      const sub = registerRun({ rule: t5, split, a, n, from: subSide })

      if (add.value === null || sub.value === null) {
        throw new Error(`register ${a} ${n}: no single still tone at the end`)
      }

      counter.push(`(${a}, ${n}, ${add.value}, ${sub.value}, ${bool(add.moversFree)}, ${bool(sub.moversFree)})`)
    }
  }

  const body = [
    '/-- Per Kleene layout: experiment code, census rule index and name, background, start position, window cells',
    '    left to right (a constant tone, or 2 for input x and 3 for input y), read position, read round, target, and',
    '    the read slot of `denseLineTable` on every input (inputsOf order, x least significant). Rows 0 to 3: the',
    '    LAYOUTS of wire-neg.ts (E-CMP-0058); then per one-law cell the first hit of `searchRays` for neg (span',
    `    ${KLEENE_NEG_SPAN}), min and max (span ${KLEENE_MIN_MAX_SPAN}), through \`rayLayoutToLine\` (E-CMP-0061). -/`,
    `def kleeneLayouts :\n    List (String × Nat × String × Int × Int × List Int × Int × Nat × String × List Int) :=\n  ${leanList(rows, '  ')}`,
    '',
    '/-- The T5 counter cell: census rule index and name, background, `splitCell` still and mover tones and type, and',
    '    the sides `registerRun` adds and subtracts from. -/',
    `def kleeneCounterCell : Nat × String × Int × Int × Int × String × String × String :=\n  (${t5i}, "${KLEENE_T5_RULE}", ${split.background}, ${split.still}, ${split.mover}, "${split.type}", "${addSide}", "${subSide}")`,
    '',
    `/-- \`registerRun\` for a, n in 0 .. ${KLEENE_REGISTER_RANGE} (a outer): (a, n, ADD value, SUB value, ADD movers free,`,
    '    SUB movers free). -/',
    `def kleeneCounterRows : List (Nat × Nat × Int × Int × Bool × Bool) :=\n  ${leanList(counter, '  ')}`,
  ].join('\n')

  return wrap({
    header: header({
      sources: KLEENE_SOURCES,
      lines: [
        'Exports the 16 Kleene layouts of E-CMP-0058 and E-CMP-0061 with their dense tables, and the T5 counter',
        `on all ${2 * (KLEENE_REGISTER_RANGE + 1) ** 2} ADD and SUB cases.`,
        'Bridge: Vibe.Compute.KleeneCertificates (gen_kleene_layouts_eq, gen_kleene_counter_eq).',
      ],
    }),
    body,
  })
}

// I03 (intelligence-0047): level 7's identity census (D3), run by the code. The rule id.ABC.id of pair-rule.ts as a
// gate rule (gates.ts), the word index of develop-router.ts on the six words [t, d], and the preference functions the
// identity device realizes: every window of width 2 and 3 on every background at both parities, every ordered pair of
// distinct input cells, every read round 1 to R_READ and read cell in the light cone, and the 6 nonempty proper tone
// sets, each run by lineBrickRun exactly as develop.ts's census probes a window (mask bit w set when the read of word w
// lies in the set, words in develop.ts's WORDS order, which must equal wordIndex).
const DEVICES_SOURCES = [
  'code/rule/pair-rule.ts',
  'code/compute/lab/gates.ts',
  'code/intelligence/solver/develop/develop-router.ts',
  'test/experiment/intelligence/develop.ts',
] as const
const DEVICES_IDENTITY_RULE = 'id.ABC.id'
const DEVICES_R_READ = 6
const DEVICES_TONE_SETS = [1, 2, 4, 3, 5, 6] as const
const DEVICES_WIDTHS = [2, 3] as const

export function exportDevices(): string {
  const rule = pairRulesFromFibers().find(r => r.name === DEVICES_IDENTITY_RULE)

  if (!rule) {
    throw new Error(`${DEVICES_IDENTITY_RULE} is not among pairRulesFromFibers()`)
  }

  const gate = gateRule(rule.name, rule.table)
  const words = Array.from({ length: 6 }, (_, w) => [w & 1, (w >> 1) - 1] as const)
  const wordRows: string[] = []

  words.forEach(([t, d], w) => {
    if (wordIndex(t, d) !== w) {
      throw new Error(`wordIndex(${t}, ${d}) is ${wordIndex(t, d)}, the census's word order says ${w}`)
    }

    wordRows.push(`(${t}, ${d}, ${wordIndex(t, d)})`)
  })

  const realized = new Set<number>()
  const reads = new Int8Array(6)
  let runs = 0

  for (const background of [-1, 0, 1]) {
    for (const width of DEVICES_WIDTHS) {
      for (let code = 0; code < 3 ** width; code++) {
        const window = Array.from({ length: width }, (_, i) => (Math.floor(code / 3 ** (width - 1 - i)) % 3) - 1)

        for (const lo of [2, 3]) {
          for (let i = 0; i < width; i++) {
            for (let j = 0; j < width; j++) {
              if (i === j) {
                continue
              }

              const lines = words.map(([t, d]) => {
                const x = window.slice()

                x[i] = t
                x[j] = d
                runs++

                return lineBrickRun({ rule: gate, background, start: lo, window: x, rounds: DEVICES_R_READ })
              })
              const pad = lines[0]!.pad

              for (let round = 1; round <= DEVICES_R_READ; round++) {
                for (let p = lo - 2 * round; p <= lo + width - 1 + 2 * round; p++) {
                  for (let w = 0; w < 6; w++) {
                    reads[w] = lines[w]!.frames[round]![p + pad]!
                  }

                  for (const set of DEVICES_TONE_SETS) {
                    let g = 0

                    for (let w = 0; w < 6; w++) {
                      if (((set >> (reads[w]! + 1)) & 1) === 1) {
                        g |= 1 << w
                      }
                    }

                    realized.add(g)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const census = [...realized].sort((a, c) => a - c)
  const body = [
    `/-- The table of \`${DEVICES_IDENTITY_RULE}\` in pairRulesFromFibers() (pair-rule.ts): entry \`p\` is the index of the`,
    '    image of pair `p`. The census runs it as a gate rule (gates.ts). -/',
    `def devicesIdentityRule : List Nat :=\n  [${Array.from(rule.table, v => String(v)).join(', ')}]`,
    '',
    '/-- `(t, d, wordIndex(t, d))` of develop-router.ts for the six words in mask order: bit `w` of a',
    '    preference mask is the decision on the word with index `w`. -/',
    `def devicesWordIndex : List (Nat × Int × Nat) :=\n  ${leanList(wordRows, '  ')}`,
    '',
    `/-- The preference masks the identity device realizes over the census family (${runs} runs of`,
    '    lineBrickRun), in increasing order. -/',
    `def devicesIdentityCensus : List Nat :=\n  [${census.join(', ')}]`,
  ].join('\n')

  return wrap({
    header: header({
      sources: DEVICES_SOURCES,
      lines: [
        `Exports ${DEVICES_IDENTITY_RULE}'s table, wordIndex on the six words, and the identity census of level 7 (D3):`,
        `windows of width ${DEVICES_WIDTHS.join(' and ')} on backgrounds -1, 0, +1 at both parities, every input pair,`,
        `read rounds 1 to ${DEVICES_R_READ}, every read cell in the light cone, the 6 nonempty proper tone sets.`,
        'Bridge: Vibe.Compute.Devices (gen_devices_rule_eq, gen_devices_word_index_eq, gen_devices_identity_census_eq).',
      ],
    }),
    body,
  })
}

// L16 (models-0091): the four declared tone maps of classical-boundary.ts (DECLARED_TONE_MAPS, q-ladder Q6) on every
// one- and two-excitation dock state of role 0, in the order Vibe.Compute.QuantumCoarse rebuilds (qcMapFamily): one
// excitation by slot, then tone +1, -1; two by slot pair in lexicographic order, then tones ++, +-, -+, --. Each entry
// is the base-3 code (netSign + 1) + 3 (netResidue + 1) + 9 (pairedSign + 1) + 27 (lowestSlotTone + 1).
const QUANTUM_COARSE_SOURCES = ['code/compute/quantum/classical-boundary.ts'] as const
const QUANTUM_COARSE_MAPS = ['netSign', 'netResidue', 'pairedSign', 'lowestSlotTone'] as const
const QUANTUM_COARSE_TONE_PAIRS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const

export function exportQuantumCoarse(): string {
  if (DECLARED_TONE_MAPS.length !== QUANTUM_COARSE_MAPS.length) {
    throw new Error(`lean-export: ${DECLARED_TONE_MAPS.length} declared tone maps, expected ${QUANTUM_COARSE_MAPS.length}`)
  }

  const maps = QUANTUM_COARSE_MAPS.map(name => {
    const map = DECLARED_TONE_MAPS.find(m => m.name === name)

    if (!map) {
      throw new Error(`lean-export: no declared tone map ${name}`)
    }

    return map
  })
  const family: BeatVibe[][] = []

  for (let slot = 0; slot < 24; slot++) {
    for (const tone of [1, -1] as const) {
      family.push([[0, slot, tone, 0]])
    }
  }

  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      for (const [ta, tb] of QUANTUM_COARSE_TONE_PAIRS) {
        family.push([
          [0, a, ta, 0],
          [0, b, tb, 0],
        ])
      }
    }
  }

  const codes = family.map(vibes => maps.reduce((code, map, k) => code + 3 ** k * (map.ofDock(vibes) + 1), 0))
  const lines: string[] = []

  for (let i = 0; i < codes.length; i += 24) {
    lines.push(codes.slice(i, i + 24).join(', '))
  }

  const body = [
    '/-- The declared tone maps of classical-boundary.ts on every one- and two-excitation dock state of role 0',
    '    (one excitation by slot, then tone `+1, -1`; two by slot pair in lexicographic order, then tones',
    '    `++, +-, -+, --`): each entry is `(netSign + 1) + 3 (netResidue + 1) + 9 (pairedSign + 1) +',
    '    27 (lowestSlotTone + 1)`. -/',
    `def quantumCoarseMapCodes : List Nat :=\n  [ ${lines.join(',\n    ')} ]`,
  ].join('\n')

  return wrap({
    header: header({
      sources: QUANTUM_COARSE_SOURCES,
      lines: [
        `Exports DECLARED_TONE_MAPS (${QUANTUM_COARSE_MAPS.join(', ')}) on ${family.length} dock states.`,
        'Bridge: Vibe.Compute.QuantumCoarse (gen_quantum_coarse_maps_eq).',
      ],
    }),
    body,
  })
}

// L21 (models-0093): the large certificates of Vibe.Compute.GateSetRank. Rows are packed into one Nat per row so the
// generated lists stay short (traps.md, L07): a digit string lowest first, `CERT_BASE` per digit, signed entries
// shifted by `CERT_OFFSET`, F3 entries in base 4.
const CERT_BASE = 2n ** 32n
const CERT_OFFSET = 2n ** 31n

function packSigned(entries: readonly bigint[]): string {
  let code = 0n

  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]!

    if (e >= CERT_OFFSET || e < -CERT_OFFSET) {
      throw new Error(`certificate entry ${e} outside the packed range`)
    }

    code = code * CERT_BASE + (e + CERT_OFFSET)
  }

  return code.toString()
}

// a long list of naturals as defs of 100 entries joined by `++` (a single long literal passes maxRecDepth)
function chunkedNats(name: string, doc: string, items: readonly string[]): string[] {
  const parts: string[] = []
  const names: string[] = []

  for (let start = 0; start < Math.max(items.length, 1); start += 100) {
    const part = `${name}_${String(start / 100).padStart(2, '0')}`

    names.push(part)
    parts.push(`def ${part} : List Nat :=\n  [${items.slice(start, start + 100).join(',\n   ')}]`, '')
  }

  return [...parts, doc, `def ${name} : List Nat :=\n  ${names.join(' ++ ')}`, '']
}

function packDigits(digits: readonly number[], base: number): string {
  let code = 0n

  for (let i = digits.length - 1; i >= 0; i--) {
    const d = digits[i]!

    if (d < 0 || d >= base) {
      throw new Error(`certificate digit ${d} outside base ${base}`)
    }

    code = code * BigInt(base) + BigInt(d)
  }

  return code.toString()
}

// B7: Q1's Lie closure on the S = 1 sector of six excitations with two in role 1 (gate-set.ts). The generators are
// tripleGenerators (i P_ab Pi_std(abc) Pi_S, integer-scaled, real part zero); the rows are lieClosureDimension's
// echelon basis in insertion order, each with the generator or bracket it was reduced from.
const GATE_SET_SOURCES = ['code/compute/quantum/gate-set.ts', 'code/algebra/ninth-field.ts'] as const
const GATE_SET_EXCITATIONS = 6
const GATE_SET_ROLE_ONE = 2
const GATE_SET_TWICE_SPIN = 2

export function exportCertificatesGateSet(): string {
  const sector = spinSector(GATE_SET_EXCITATIONS, GATE_SET_ROLE_ONE)
  const gens = tripleGenerators(sector, GATE_SET_TWICE_SPIN)
  const n = sector.words.length
  const flatten = (x: LieElement): bigint[] => [...x.re.flat(), ...x.im.flat()]
  const unflatten = (v: readonly bigint[]): LieElement => ({
    re: Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => v[i * n + j]!)),
    im: Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => v[n * n + i * n + j]!)),
  })
  // lieClosureDimension's loop, keeping each new row's parent: (0, k) for generator k, (j + 1, k) for [row j, g_k]
  const span = new RationalSpan()
  const queue: LieElement[] = []
  const parents: [number, number][] = []

  for (const [k, g] of gens.entries()) {
    const row = span.insert(flatten(g))

    if (row) {
      queue.push(unflatten(row))
      parents.push([0, k])
    }
  }

  for (const [j, element] of queue.entries()) {
    for (const [k, g] of gens.entries()) {
      const row = span.insert(flatten(lieBracket(element, g)))

      if (row) {
        queue.push(unflatten(row))
        parents.push([j + 1, k])
      }
    }
  }

  const closure = lieClosureDimension(gens, 4 * n * n)

  if (!closure.closed || closure.dimension !== span.dimension) {
    throw new Error(`gate set: the replayed closure (${span.dimension}) is not lieClosureDimension's (${closure.dimension})`)
  }

  const rowsOf = (m: readonly (readonly bigint[])[]): string => `[${m.map(r => packSigned(r)).join(', ')}]`
  const genRows = gens.map(g => {
    if (g.re.some(r => r.some(x => x !== 0n))) {
      throw new Error('gate set: a generator with a real part')
    }

    return rowsOf(g.im)
  })
  const basisRows = queue.map(e => rowsOf([...e.re, ...e.im]))
  // the sector itself, so the Lean side rebuilds the generators: the words and every transposition image
  const words = sector.words.map(w => `[${w.join(', ')}]`)
  const images: string[] = []

  for (let p = 0; p < sector.n; p++) {
    for (let q = p + 1; q < sector.n; q++) {
      images.push(`(${p}, ${q}, [${transpositionImage(sector, p, q).join(', ')}])`)
    }
  }

  const body = [
    `/-- The spin sector of gate-set.ts: ${GATE_SET_EXCITATIONS} excitations, ${GATE_SET_ROLE_ONE} in role 1, the positions in`,
    '    role 1 of each basis word in the order of \`spinSector\`. -/',
    `def gateSetWords : List (List Nat) :=\n  ${leanList(words, '  ')}`,
    '',
    '/-- `transpositionImage` of every transposition `(p q)`, `p < q`: the word index each word goes to. -/',
    `def gateSetImages : List (Nat × Nat × List Nat) :=\n  ${leanList(images, '  ')}`,
    '',
    `/-- \`tripleGenerators(spinSector(${GATE_SET_EXCITATIONS}, ${GATE_SET_ROLE_ONE}), ${GATE_SET_TWICE_SPIN})\`: the imaginary part of each`,
    `    generator (the real part is zero), one packed Nat per row (base 2^32, entries shifted by 2^31). -/`,
    `def gateSetGens : List (List Nat) :=\n  ${leanList(genRows, '  ')}`,
    '',
    `/-- The ${queue.length} echelon rows of \`lieClosureDimension\` in insertion order: the real part's ${n} rows, then the`,
    '    imaginary part\'s, packed as in `gateSetGens`. -/',
    `def gateSetBasis : List (List Nat) :=\n  ${leanList(basisRows, '  ')}`,
    '',
    '/-- The pivot of each echelon row (`RationalSpan`): the flat index (real part first, row-major) of its first',
    '    nonzero entry. -/',
    `def gateSetPivots : List Nat :=\n  [${span.rows.map(r => r.pivot).join(', ')}]`,
    '',
    '/-- What each row was reduced from: `(0, k)` generator `k`, `(j + 1, k)` the bracket of row `j` with',
    '    generator `k`. -/',
    `def gateSetParents : List (Nat × Nat) :=\n  [${parents.map(([a, b]) => `(${a}, ${b})`).join(', ')}]`,
    '',
    '/-- `lieClosureDimension(gens, cap).dimension`, with the closure complete. -/',
    `def gateSetDimension : Nat := ${closure.dimension}`,
  ].join('\n')

  return wrap({
    header: header({
      sources: GATE_SET_SOURCES,
      lines: [
        `Exports Q1's spin sector, its ${gens.length} triple generators and the ${queue.length}-row echelon basis of their Lie closure.`,
        'Bridge: Vibe.Compute.GateSetRank (gen_gsr_generators_eq, gen_gsr_dimension_eq).',
      ],
    }),
    body,
  })
}

// B10: M8's excited-mode counts (E-CMP-0046, test/experiment/computation/z3-resonance.ts pairSpecs): every
// hyperbolic closed quotient with its flat partner, and the two larger M2-B pairs, under both laws (self 0, self 1).
// Per graph and law the code's minimal polynomial of A' = A + sigma I on delta_0 over F3, the pivot cells of the
// Krylov vectors K_0 .. K_(k-1) and the inverse Y of their pivot block b[c][t] = K_t[pivot c], so that
// sum_c Y[i][c] K_t[pivot c] = [i = t] over F3.
const KRYLOV_SOURCES = [
  'code/measure/z3-resonance.ts',
  'code/substrate/tiling-quotient.ts',
  'test/experiment/computation/z3-resonance.ts',
] as const
const KRYLOV_NEIGHBOR_BASE = 4096

function krylovGraphList(): { name: string; neighbors: number[][] }[] {
  const entries = closedQuotients()
  const byName = new Map(entries.map(e => [e.quotient.name, e.quotient]))
  const out: { name: string; neighbors: number[][] }[] = []

  for (const e of entries) {
    const q = e.quotient

    if (q.curvature !== 'hyperbolic' || q.partner === null) {
      continue
    }

    const partner = byName.get(q.partner)!

    out.push({ name: q.name, neighbors: q.neighbors }, { name: partner.name, neighbors: partner.neighbors })
  }

  for (const [p, qq, modulus, torus, torusName] of [
    [4, 5, 11, squareTorus(15, 22), 'square-15x22'],
    [3, 7, 13, triangleTorus(13, 14), 'triangle-13x14'],
  ] as const) {
    const rotary = findRotaryMap({ p, q: qq, moduli: [modulus], reference: referenceTiling([p, qq], 6000), minSystole: 1 })

    if (!rotary) {
      throw new Error(`krylov: no {${p},${qq}} map in PGL(2,${modulus})`)
    }

    out.push(
      { name: `surface-${p}-${qq}-pgl2-${modulus}-${rotary.analysis.faces}`, neighbors: rotary.analysis.neighbors },
      { name: torusName, neighbors: torus.analysis.neighbors },
    )
  }

  return out
}

// the pivot cells of the rows of m (k x n over F3) and Y = b^-1 for b[c][t] = m[t][pivot c]
function krylovDual(m: readonly Uint8Array[]): { pivots: number[]; y: number[][] } {
  const k = m.length
  const rows = m.map(r => Uint8Array.from(r))
  const pivots: number[] = []

  for (let r = 0; r < k; r++) {
    const row = rows[r]!
    const pivot = row.findIndex(v => v !== 0)

    if (pivot < 0) {
      throw new Error('krylov: dependent Krylov vectors')
    }

    pivots.push(pivot)

    const inv = row[pivot] === 1 ? 1 : 2

    for (let i = 0; i < row.length; i++) {
      row[i] = (row[i]! * inv) % 3
    }

    for (let s = r + 1; s < k; s++) {
      const c = rows[s]![pivot]!

      if (c !== 0) {
        for (let i = 0; i < row.length; i++) {
          rows[s]![i] = (rows[s]![i]! + (3 - c) * row[i]!) % 3
        }
      }
    }
  }

  // b[c][t] = m[t][pivot c]; invert b by Gauss-Jordan
  const b = pivots.map(p => m.map(r => r[p]!))
  const aug = b.map((row, i) => [...row, ...Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))])

  for (let col = 0; col < k; col++) {
    const r = aug.findIndex((row, i) => i >= col && row[col] !== 0)

    if (r < 0) {
      throw new Error('krylov: singular pivot block')
    }

    ;[aug[col], aug[r]] = [aug[r]!, aug[col]!]

    const inv = aug[col]![col] === 1 ? 1 : 2

    aug[col] = aug[col]!.map(v => (v * inv) % 3)

    for (let i = 0; i < k; i++) {
      const c = aug[i]![col]!

      if (i !== col && c !== 0) {
        aug[i] = aug[i]!.map((v, j) => (v + (3 - c) * aug[col]![j]!) % 3)
      }
    }
  }

  // sum_c Y[i][c] b[c][t] = [i = t]: Y = b^-1
  const y = aug.map(row => row.slice(k))

  for (let i = 0; i < k; i++) {
    for (let t = 0; t < k; t++) {
      let s = 0

      for (let c = 0; c < k; c++) {
        s += y[i]![c]! * m[t]![pivots[c]!]!
      }

      if (s % 3 !== (i === t ? 1 : 0)) {
        throw new Error('krylov: the dual certificate fails')
      }
    }
  }

  return { pivots, y }
}

export function exportCertificatesKrylov(): string {
  const graphs = krylovGraphList()
  const graphRows: string[] = []
  const certRows: string[] = []
  const degreeRows: string[] = []
  const tables: string[] = []

  for (const [gi, g] of graphs.entries()) {
    const n = g.neighbors.length
    const degree = g.neighbors[0]!.length

    if (n > KRYLOV_NEIGHBOR_BASE || g.neighbors.some(r => r.length !== degree)) {
      throw new Error(`krylov: ${g.name} is not regular or too large to pack`)
    }

    tables.push(
      ...chunkedNats(
        `krylovNb${gi}`,
        `/-- The neighbours of every cell of ${g.name}, packed base ${KRYLOV_NEIGHBOR_BASE} lowest first. -/`,
        g.neighbors.map(r => packDigits(r, KRYLOV_NEIGHBOR_BASE)),
      ),
    )
    graphRows.push(`("${g.name}", ${n}, ${degree}, krylovNb${gi})`)

    for (const sigma of [0, 1]) {
      const delta = new Uint8Array(n)

      delta[0] = 1

      const poly = shiftedAdjacencyMinimalPolynomial({ neighbors: g.neighbors, sigma, seed: delta })
      const k = poly.length - 1

      if (poly[k] !== 1 || !evaluatePolynomialOn(g.neighbors, sigma, poly, delta).every(v => v === 0)) {
        throw new Error(`krylov: ${g.name} sigma ${sigma}: the code's polynomial is not monic or does not kill delta_0`)
      }

      const krylov: Uint8Array[] = [delta]

      for (let t = 1; t < k; t++) {
        krylov.push(applyShiftedAdjacency(g.neighbors, sigma, krylov[t - 1]!))
      }

      const { pivots, y } = krylovDual(krylov)
      const ci = certRows.length

      tables.push(
        ...chunkedNats(`krylovPiv${ci}`, `/-- The pivot cells of ${g.name} under sigma ${sigma}. -/`, pivots.map(String)),
        ...chunkedNats(
          `krylovY${ci}`,
          `/-- The rows of Y for ${g.name} under sigma ${sigma}, packed base 4 lowest first. -/`,
          y.map(r => packDigits(r, 4)),
        ),
      )
      certRows.push(`(${gi}, ${sigma}, ${k}, ${packDigits(poly, 4)}, krylovPiv${ci}, krylovY${ci})`)
      degreeRows.push(`("${g.name}", ${sigma}, ${k})`)
    }
  }

  const body = [
    ...tables,
    '/-- Per graph: name, cell count, degree, and per cell its neighbours in the code\'s order, packed base',
    `    ${KRYLOV_NEIGHBOR_BASE} lowest first. -/`,
    `def krylovGraphs : List (String × Nat × Nat × List Nat) :=\n  ${leanList(graphRows, '  ')}`,
    '',
    '/-- Per graph and law: graph index, sigma, the degree k of `shiftedAdjacencyMinimalPolynomial` on delta_0, its',
    '    coefficients packed base 4 lowest first (k + 1 digits), the pivot cells of K_0 .. K_(k-1), and the rows of',
    '    Y packed base 4 (k digits each). -/',
    `def krylovCerts : List (Nat × Nat × Nat × Nat × List Nat × List Nat) :=\n  ${leanList(certRows, '  ')}`,
    '',
    '/-- The code\'s Krylov degree per graph and law: (graph name, sigma, degree). -/',
    `def krylovDegrees : List (String × Nat × Nat) :=\n  ${leanList(degreeRows, '  ')}`,
  ].join('\n')

  return wrap({
    header: header({
      sources: KRYLOV_SOURCES,
      lines: [
        `Exports the ${graphs.length} graphs of M8's mode table (E-CMP-0046) and, per law, the minimal polynomial of A' on`,
        'delta_0 with a dual certificate that K_0 .. K_(k-1) are independent over F3.',
        'Bridge: Vibe.Compute.GateSetRank (gen_gsr_krylov_degrees_eq).',
      ],
    }),
    body,
  })
}

export const LEAN_EXPORTS: readonly LeanExport[] = [
  {
    name: 'PairRuleTable',
    sources: ['code/rule/pair-rule.ts'],
    bridgeModule: 'Vibe.Compute.PairRuleLink',
    bridges: ['gen_pair_tones_eq', 'gen_pair_rules_eq'],
    render: exportPairRuleTable,
  },
  {
    name: 'RuleCensus',
    sources: RULE_CENSUS_SOURCES,
    bridgeModule: 'Vibe.Compute.RuleCensus',
    bridges: [
      'gen_rule_census_meta_eq',
      'gen_rule_census_passengers_eq',
      'gen_rule_census_cells_eq',
      'gen_rule_census_closures_eq',
    ],
    render: exportRuleCensus,
  },
  {
    name: 'BeatSlots',
    sources: BEAT_SLOT_SOURCES,
    bridgeModule: 'Vibe.Compute.LinesMeetOnce',
    bridges: [
      'gen_beat_roots_eq',
      'gen_beat_opposite_eq',
      'gen_beat_lines_eq',
      'gen_beat_line_centers_eq',
    ],
    render: exportBeatSlots,
  },
  {
    name: 'SpinOneQ2R',
    sources: Q2R_SOURCES,
    bridgeModule: 'Vibe.Compute.SpinOneQ2R',
    bridges: ['gen_q2r_move_eq'],
    render: exportSpinOneQ2r,
  },
  {
    name: 'Lumpability',
    sources: LUMP_SOURCES,
    bridgeModule: 'Vibe.Compute.Lumpability',
    bridges: ['gen_lump_block_maps_eq', 'thm_lump_line_conflict_witnesses'],
    render: exportLumpability,
  },
  {
    name: 'PartitionedRing',
    sources: RING_SOURCES,
    bridgeModule: 'Vibe.Compute.Lumpability',
    bridges: ['gen_partitioned_ring_eq'],
    render: exportPartitionedRing,
  },
  {
    name: 'BareBeat',
    sources: BARE_BEAT_SOURCES,
    bridgeModule: 'Vibe.Compute.BeatLink',
    bridges: [
      'gen_bare_beat_coeffs_eq',
      'gen_bare_beat_layers_eq',
      'gen_bare_beat_family_eq',
      'gen_bare_beat_beat_eq',
      'gen_bare_beat_neighbours_eq',
    ],
    render: exportBareBeat,
  },
  {
    name: 'Kleene',
    sources: KLEENE_SOURCES,
    bridgeModule: 'Vibe.Compute.KleeneCertificates',
    bridges: ['gen_kleene_layouts_eq', 'gen_kleene_counter_eq'],
    render: exportKleene,
  },
  {
    name: 'Devices',
    sources: DEVICES_SOURCES,
    bridgeModule: 'Vibe.Compute.Devices',
    bridges: ['gen_devices_rule_eq', 'gen_devices_word_index_eq', 'gen_devices_identity_census_eq'],
    render: exportDevices,
  },
]

export function renderLeanExports(): RenderedExport[] {
  return LEAN_EXPORTS.map(e => ({
    name: e.name,
    file: `${e.name}.lean`,
    text: e.render(),
  }))
}

export function writeLeanExports(outDir: string): RenderedExport[] {
  const rendered = renderLeanExports()

  mkdirSync(outDir, { recursive: true })

  for (const r of rendered) {
    writeFileSync(join(outDir, r.file), r.text)
  }

  return rendered
}

function main(): void {
  const args = process.argv.slice(2)
  const outIndex = args.indexOf('--out')

  if (outIndex >= 0) {
    const outDir = resolve(args[outIndex + 1] ?? '')

    if (outDir === GENERATED_DIR) {
      throw new Error('use --commit to write into Generated/')
    }

    for (const r of writeLeanExports(outDir)) {
      console.log(`lean-export  wrote ${join(outDir, r.file)}`)
    }

    return
  }

  const commit = args.includes('--commit')

  for (const r of renderLeanExports()) {
    const path = join(GENERATED_DIR, r.file)
    const current = existsSync(path) ? readFileSync(path, 'utf8') : null
    const state =
      current === null ? 'new' : current === r.text ? 'same' : 'changed'

    if (commit && state !== 'same') {
      mkdirSync(GENERATED_DIR, { recursive: true })
      writeFileSync(path, r.text)
    }

    console.log(
      `lean-export  ${r.file}  ${state}${commit && state !== 'same' ? '  written' : ''}`,
    )
  }

  if (!commit) {
    console.log('lean-export  report only: pass --commit to write Generated/')
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
