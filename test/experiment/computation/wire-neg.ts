// Item vibe-computation-models-0057: which invariant keeps the sum-0-fiber 3-cycle wire rules from computing Kleene
// neg, though M5 (E-CMP-0050) saw them reach 21 of 26 unary tables on the line? Library: code/compute/lab/wire-invariant.ts
// on code/compute/lab/gates.ts. Lean: code/proof/Vibe/WireInvariant.lean.
//
// Declared before the experiment's first run (after six probes, W/tmp/wire-invariant-probe*.ts, which found the
// layouts below by exhaustive search and the passenger laws by brute force):
// - PART A, transport census: for each of the 24 rules and each tone v, brute force over the nine pairs: does the
//   second cell hold v after the rule exactly when the first held it (forward), or the first exactly when the second
//   held it (backward)? Cross-checked against occupancy transport on background v (the same law read as emptiness).
// - PART B, sided closure: the least sets of unary tables on the first side and on the second side that hold the
//   constants and the identity and are closed under the rule (first output to the second side, second output to the
//   first: the brick line, where every cell alternates sides). For the rules with a passenger on both sides the two sets
//   must equal the passenger-compatible tables exactly and exclude neg; for the rules with one law the free side must
//   hold all 27 tables. Control: without sides (one set) the two-law rules reach all 27, so the side alternation is
//   what the invariant needs.
// - PART C, the neg layouts: four width-9 line layouts, one per one-law wire cell, replayed for every input by the dense
//   brick run and by the sparse runner, the read slot riding its wire for HOLD rounds. Controls: each layout replayed
//   under the two-law rule on the same background must not compute neg; a corrupted target table must be rejected.
// - PART D, minimality and the two-law reach: the exhaustive line search for neg on id.CAB.swap (+1) to width 8 finds
//   nothing (at scale >= 2 also width 9, where it must find the layout); every unary and binary table the two-law rules
//   reach on the line to width LINE_WIDTH is passenger-compatible on one side.
// Gates (fail the run): every listed condition, two runs giving identical bytes, no random number.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  CONTROL_TARGETS,
  GateRule,
  KLEENE_TARGETS,
  fixesUniform,
  gateRule,
  searchLineGates,
  tableKey,
} from '@/code/compute/lab/gates'
import {
  LineLayout,
  denseLineTable,
  occupancyTransport,
  passengerCompatible,
  sidedUnaryClosure,
  sparseLineTable,
  toneTransport,
  unaryKeys,
  unsidedUnaryClosure,
} from '@/code/compute/lab/wire-invariant'
import { pairRuleCensus } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = ['code/compute/lab/wire-invariant.ts', 'test/experiment/computation/wire-neg.ts']

// ---- parameters, fixed before the first run ----

const HOLD = 8
const READ = 12
const LINE_WIDTH = 6
const MIN_WIDTH_PROBE = 8
const NEG = KLEENE_TARGETS.find(t => t.name === 'neg')!
const ONE_LAW = ['id.CAB.swap', 'id.BCA.swap', 'swap.BCA.id', 'swap.CAB.id']
const TWO_LAW = ['swap.BCA.swap', 'swap.CAB.swap']

// The neg layouts, found by the exhaustive line search of gates.ts at width 9 (W/tmp/wire-invariant-probe5.ts; 36 of
// 118,098 width-9 layouts for each rule). Window cells left to right from position `start`; null is the input.
const LAYOUTS: { rule: string; control: string; layout: LineLayout }[] = [
  {
    rule: 'id.CAB.swap',
    control: 'swap.BCA.swap',
    layout: { background: 1, start: 1, window: [-1, 0, null, 0, -1, 1, 0, 1, -1], inputs: [2], readPosition: 4, readRound: 3 },
  },
  {
    rule: 'id.BCA.swap',
    control: 'swap.CAB.swap',
    layout: { background: 1, start: 0, window: [-1, 1, 0, 1, null, 0, 0, 0, -1], inputs: [4], readPosition: 3, readRound: 3 },
  },
  {
    rule: 'swap.BCA.id',
    control: 'swap.BCA.swap',
    layout: { background: -1, start: 1, window: [1, 0, null, 0, 1, -1, 0, -1, 0], inputs: [2], readPosition: 4, readRound: 3 },
  },
  {
    rule: 'swap.CAB.id',
    control: 'swap.CAB.swap',
    layout: { background: -1, start: 0, window: [0, -1, 0, -1, null, 0, 0, 0, 1], inputs: [4], readPosition: 3, readRound: 3 },
  },
]

type RuleRow = {
  name: string
  forward: number[]
  backward: number[]
  // occupancy transport on background v agrees with tone-v transport, on every background the rule fixes
  occupancyAgrees: boolean
}

type ClosureRow = {
  rule: string
  first: number
  second: number
  negFirst: boolean
  negSecond: boolean
  // two-law rules: each side's set equals the passenger-compatible tables of its tone
  matchesPassengers: boolean | null
  unsided: number
}

type LayoutRow = {
  rule: string
  background: number
  dense: string
  sparse: string
  rides: boolean
  computesNeg: boolean
  controlRule: string
  controlComputesNeg: boolean
}

type ReachRow = {
  rule: string
  background: number
  unary: number
  binary: number
  // reached tables compatible with neither side's passenger law (the theorem says none)
  exceptions: number
}

function rulesByName(): Map<string, GateRule> {
  return new Map(pairRuleCensus().rules.map(r => [r.name, gateRule(r.name, r.table)]))
}

function partA(rules: Map<string, GateRule>): RuleRow[] {
  return [...rules.values()].map(rule => {
    const t = toneTransport(rule)
    const occupancyAgrees = [-1, 0, 1]
      .filter(b => fixesUniform(rule, b))
      .every(b => {
        const o = occupancyTransport(rule, b)
        const law = t.find(x => x.tone === b)!

        return o.secondFromFirst === law.forward && o.firstFromSecond === law.backward
      })

    return {
      name: rule.name,
      forward: t.filter(x => x.forward).map(x => x.tone),
      backward: t.filter(x => x.backward).map(x => x.tone),
      occupancyAgrees,
    }
  })
}

function partB(rules: Map<string, GateRule>, rows: readonly RuleRow[]): ClosureRow[] {
  const negKey = tableKey(NEG.table)

  return [...ONE_LAW, ...TWO_LAW].map(name => {
    const rule = rules.get(name)!
    const c = sidedUnaryClosure(rule)
    const row = rows.find(r => r.name === name)!
    const twoLaw = row.forward.length > 0 && row.backward.length > 0
    const matches = (set: Set<string>, tone: number): boolean =>
      unaryKeys().every(k => set.has(k) === passengerCompatible(k.split(',').map(Number), 1, tone))

    return {
      rule: name,
      first: c.first.size,
      second: c.second.size,
      negFirst: c.first.has(negKey),
      negSecond: c.second.has(negKey),
      // the first side carries the forward tone into the second cell, so the first-side tables keep the forward tone
      matchesPassengers: twoLaw ? matches(c.first, row.forward[0]!) && matches(c.second, row.backward[0]!) : null,
      unsided: unsidedUnaryClosure(rule).size,
    }
  })
}

function partC(rules: Map<string, GateRule>): LayoutRow[] {
  return LAYOUTS.map(({ rule, control, layout }) => {
    const g = rules.get(rule)!
    const dense = denseLineTable(g, layout)
    const sparse = sparseLineTable(g, layout, HOLD)
    const ctl = sparseLineTable(rules.get(control)!, layout, HOLD)
    const negKey = tableKey(NEG.table)

    return {
      rule,
      background: layout.background,
      dense: tableKey(dense),
      sparse: tableKey(sparse.table),
      rides: sparse.rides,
      computesNeg: tableKey(dense) === negKey && tableKey(sparse.table) === negKey && sparse.rides,
      controlRule: control,
      controlComputesNeg: tableKey(ctl.table) === negKey && ctl.rides,
    }
  })
}

function partD(rules: Map<string, GateRule>, scale: number): { negAbsentTo: number; negFoundAt: number | null; reach: ReachRow[] } {
  const minimal = searchLineGates({
    rule: rules.get('id.CAB.swap')!,
    background: 1,
    targets: [NEG],
    maxWidth: scale >= 2 ? MIN_WIDTH_PROBE + 1 : MIN_WIDTH_PROBE,
    readRounds: READ,
    hold: HOLD,
  })
  const reach: ReachRow[] = []

  for (const name of TWO_LAW) {
    const rule = rules.get(name)!
    const t = toneTransport(rule)
    const fwd = t.find(x => x.forward)!.tone
    const bwd = t.find(x => x.backward)!.tone

    for (const background of [-1, 1]) {
      const s = searchLineGates({
        rule,
        background,
        targets: [...KLEENE_TARGETS, ...CONTROL_TARGETS],
        maxWidth: LINE_WIDTH,
        readRounds: 8,
        hold: HOLD,
        collect: true,
      })

      let unary = 0
      let binary = 0
      let exceptions = 0

      for (const key of s.reachable.keys()) {
        const arity = Number(key.split(':')[0])
        const table = key.split(':')[1]!.split(',').map(Number)

        if (arity === 1) {
          unary++
        } else {
          binary++
        }

        if (!passengerCompatible(table, arity, fwd) && !passengerCompatible(table, arity, bwd)) {
          exceptions++
        }
      }

      reach.push({ rule: name, background, unary, binary, exceptions })
    }
  }

  return {
    negAbsentTo: minimal.absent.neg ?? 0,
    negFoundAt: minimal.gates.find(g => g.target === 'neg')?.width ?? null,
    reach,
  }
}

export function wireNeg(input: { scale: number; skipSearch?: boolean }): {
  a: RuleRow[]
  b: ClosureRow[]
  c: LayoutRow[]
  d: ReturnType<typeof partD> | null
  serialized: string
} {
  const rules = rulesByName()
  const a = partA(rules)
  const b = partB(rules, a)
  const c = partC(rules)
  const d = input.skipSearch ? null : partD(rules, input.scale)

  return { a, b, c, d, serialized: JSON.stringify({ a, b, c }) }
}

export default experiment({
  id: 'computation/wire-neg',
  code: 'E-CMP-0058',
  title:
    'Kleene neg on the 3-cycle wire rules: the passenger laws (one tone kept along every ray of one side), the two-law rules excluded from neg, min and max on the brick line by theorem, and width-9 line layouts that compute neg for the one-law rules',
  category: 'computation',
  substrates: ['line'],
  depth: 'L2',
  paper: false,
  run(context) {
    const scale = context.scale ?? 1
    const r = wireNeg({ scale })
    const twice = (): string => wireNeg({ scale: 1, skipSearch: true }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const row = (n: string): RuleRow => r.a.find(x => x.name === n)!
    const oneLaw = ONE_LAW.map(row)
    const twoLaw = TWO_LAW.map(row)
    const lawCount = (x: RuleRow): number => x.forward.length + x.backward.length
    const corrupted = Int8Array.from(NEG.table)

    corrupted[1] = corrupted[1] === 0 ? 1 : 0

    const corruptedRejected = r.c.every(l => l.sparse !== tableKey(corrupted))
    const d = r.d!
    const checks: [boolean, string][] = [
      [r.a.length === 24, 'rule census'],
      [r.a.every(x => x.occupancyAgrees), 'occupancy transport disagrees with tone transport'],
      [oneLaw.every(x => lawCount(x) === 1), `one-law rules ${oneLaw.map(x => `${x.name}:${lawCount(x)}`).join(' ')}`],
      [twoLaw.every(x => x.forward.length === 1 && x.backward.length === 1 && x.forward[0] === -x.backward[0]!), 'two-law rules'],
      [r.b.filter(x => TWO_LAW.includes(x.rule)).every(x => x.matchesPassengers === true && !x.negFirst && !x.negSecond), 'two-law closure'],
      [r.b.filter(x => ONE_LAW.includes(x.rule)).every(x => Math.max(x.first, x.second) === 27 && (x.negFirst || x.negSecond)), 'one-law free side'],
      [r.b.filter(x => TWO_LAW.includes(x.rule)).every(x => x.unsided === 27), 'unsided control must reach all 27'],
      [r.c.every(l => l.computesNeg), `neg layouts ${r.c.filter(l => !l.computesNeg).map(l => `${l.rule}:${l.dense}/${l.sparse}/${l.rides}`).join(' ')}`],
      [r.c.every(l => !l.controlComputesNeg), 'a two-law control computed neg'],
      [corruptedRejected, 'corrupted table accepted'],
      [d.negAbsentTo === MIN_WIDTH_PROBE && (scale < 2 ? d.negFoundAt === null : d.negFoundAt === MIN_WIDTH_PROBE + 1), `minimality absent ${d.negAbsentTo} found ${d.negFoundAt}`],
      [d.reach.every(x => x.exceptions === 0 && x.unary > 0), `two-law reach ${d.reach.map(x => `${x.rule}/${x.background}:${x.exceptions}`).join(' ')}`],
      [identicalBytes, 'bytes differ'],
      [findings.length === 0, findings.map(f => `${f.file}:${f.line}`).join(' ')],
    ]
    const failures = checks.filter(([ok]) => !ok).map(([, why]) => why)
    const ok = failures.length === 0
    const noLaw = r.a.filter(x => lawCount(x) === 0).length

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the 3-cycle wire rules split by their passenger laws (a tone that, after the rule, sits on the second cell exactly when it sat on the first, or on the first exactly when it sat on the second; brute force over the nine pairs, the same law as occupancy transport on that tone's background): swap.BCA.swap and swap.CAB.swap keep one tone forward and the opposite tone backward, so on the brick line, where every cell alternates sides, the forward tone's indicator never changes along a right-moving ray and the backward tone's along a left-moving ray, whatever crosses them; every ray starts at an input or a constant, so no ray computes neg, min or max (Lean, any input-dependent crossing sequence), the sided table closure equals the passenger-compatible tables exactly (13 per side, neg on neither) and every table these rules reach on the line to width ${LINE_WIDTH} is passenger-compatible (0 exceptions); without the side alternation the same closure reaches all 27 tables. The four one-law rules (id.CAB.swap, id.BCA.swap, swap.BCA.id, swap.CAB.id) keep one tone on one side only and their wire side is free (all 27 tables in its closure), and they do compute neg: a width-9 line layout for each, replayed by two runners on every input with the output riding its wire for ${HOLD} rounds, and none at width ${d.negAbsentTo} or less (exhaustive for id.CAB.swap); M5's 21 of 26 was a width limit, not an invariant`,
      metrics: {
        rules: r.a.length,
        rulesWithoutLaw: noLaw,
        oneLawRules: oneLaw.length,
        twoLawRules: twoLaw.length,
        negLayoutsVerified: r.c.filter(l => l.computesNeg).length,
        negAbsentToWidth: d.negAbsentTo,
        negFoundAtWidth: d.negFoundAt ?? 0,
        twoLawUnaryReached: d.reach.reduce((s, x) => s + x.unary, 0),
        twoLawBinaryReached: d.reach.reduce((s, x) => s + x.binary, 0),
        twoLawExceptions: d.reach.reduce((s, x) => s + x.exceptions, 0),
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        twoLawControlsComputingNeg: r.c.filter(l => l.controlComputesNeg).length,
        unsidedClosureTwoLawMin: Math.min(...r.b.filter(x => TWO_LAW.includes(x.rule)).map(x => x.unsided)),
        corruptedRejected: corruptedRejected ? 1 : 0,
      },
      notes:
        `Item vibe-computation-models-0057. Closures: ${r.b.map(x => `${x.rule} first ${x.first} second ${x.second}${x.negFirst ? ' neg-first' : ''}${x.negSecond ? ' neg-second' : ''}`).join('; ')}. Layout tables (dense/sparse): ${r.c.map(l => `${l.rule}/${l.background} ${l.dense} | ${l.sparse}`).join('; ')}. Reach: ${d.reach.map(x => `${x.rule}/${x.background} unary ${x.unary} binary ${x.binary}`).join('; ')}. ${ok ? '' : `Failures: ${failures.join('; ')}`}`.trim(),
    })
  },
})
