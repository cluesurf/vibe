// THE COIN'S PLACE AND THE MOTION REVERSAL. The working rule (coined, veto 'none',
// contact 'pass', trivial links) fails T = K S R (code/measure/locked-parity motionReversal) on E-FND-0178's X1 start
// and nowhere else. This file asks why, and whether another antiunitary is kept.
//
// THE ARGUMENT, to be checked. Write a beat as U_t = S W Y_t C W (code/measure/coin-reversal): the value phase W, the
// coin C, the meeting and collision Y_t, the stream S. With T = K S R and T0 = K R (dock-local), T U_t T^-1 =
// T0(W Y_t C W) S^-1, and T0 maps every piece to its own inverse, the collision with its order flipped (t -> t + 1).
// So T U_t T^-1 = W^-1 C^-1 Y_t+1^-1 W^-1 S^-1 = (S W C Y_t+1 W)^-1: the inverse of the rule with the coin AFTER the
// collision, not of the rule itself. The check then fails at beat t exactly where C and Y_t do not commute on the
// state, which needs a dock holding an open vibe on a half-empty line and a collision that reads that line.
//
// THE GATES were fixed in the item's `what` before this file existed (task/pre-register): G0 the rebuilt beat is the
// working beat; G1 reproduce; G2 the duality; G3 the commutator witness; G4 the pieces switched off; G5 the split-coin
// control; G6 the corrected-T search; G7 ODD's CPT read against a zero control.
//
// DETERMINISM: no random numbers. Every comparison of states is exact (Z[w][1/2] in bigint).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  lockedState,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  chargeConjugate,
  huskInversion,
  mapState,
  mirrorConfiguration,
  mirrorOf,
  motionReversal,
  type Mirror,
} from '@/code/measure/locked-parity'
import {
  valueBeat,
  valueBeatBack,
  valueCensus,
  VALUE_KINDS,
  type ValueKind,
  type ValuePiece,
} from '@/code/rule/value-phase'
import { sameStateFast } from '@/code/measure/value-phase-maps'
import {
  ALL_ON,
  coinCommutator,
  coinStep,
  halfCoinStep,
  orderBeat,
  orderBeatBack,
  type CoinOrder,
  type Switches,
} from '@/code/measure/coin-reversal'
import { meshSetup, type MeshKind } from '@/test/experiment/foundations/value-phase'

type Setup = ReturnType<typeof meshSetup>
type Start = { name: string; config: Configuration }
type State = LockedState
type Map1 = (x: State) => State

const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

// ---- starts: E-FND-0178's, without XA ----

function empty(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

function put(c: Configuration, x: number, d: number, tone: number, point: number, open: boolean): void {
  if (x < 0) {
    throw new Error('coin-reversal: a start leaves the mesh')
  }

  c.vibe[x * 24 + d] = tone
  c.point[x * 24 + d] = point
  c.open[x * 24 + d] = open ? 1 : 0
}

export function startsOf(s: Setup): Start[] {
  const cells = s.table.cells
  const nb = s.table.neighbour
  const lone = empty(cells)
  const head = empty(cells)
  const knot = empty(cells)
  const x1 = empty(cells)

  put(lone, 0, D0, 1, 0, true)
  put(head, nb(0, D0_BACK), D0, 1, 0, true)
  put(head, nb(0, D0), D0_BACK, 1, 1, true)
  put(knot, 0, D0, 1, 0, true)
  put(knot, 0, D0_BACK, 1, 1, true)
  valueCensus().first.forEach(([slot, tone], i) => {
    put(x1, nb(0, OPPOSITE[slot]!), slot, tone, 0, i === 0)
  })

  const base: Start[] = [
    { name: 'L', config: lone },
    { name: 'H', config: head },
    { name: 'K', config: knot },
    { name: 'X1', config: x1 },
  ]

  return [
    ...base.flatMap(st => [st, { name: `${st.name}f`, config: chargeConjugate(st.config) }]),
    { name: 'E', config: empty(cells) },
  ]
}

// ---- the beat families ----

type Rule = {
  forward: (s: State, t: number) => State
  back: (s: State, t: number) => State
}

const pieceOf = (s: Setup, kind: ValueKind): ValuePiece => ({ kind, orientation: s.orientation })

function ruleOf(s: Setup, order: CoinOrder, piece: ValuePiece, sw: Switches = ALL_ON): Rule {
  return {
    forward: (x, t) => orderBeat(order, piece, s.tables, x, t, sw),
    back: (x, t) => orderBeatBack(order, piece, s.tables, x, t, sw),
  }
}

// beats where image(F_t psi_t) != B_(t + delta)(image(psi_t)), psi run by F
function reversalBeats(
  s: Setup,
  rule: Rule,
  inverse: Rule,
  a0: Configuration,
  image: Map1,
  delta = 1,
): number[] {
  let a = lockedState(a0)

  const off: number[] = []

  for (let t = 0; t < s.beats; t++) {
    const next = rule.forward(a, t)

    if (!sameStateFast(image(next), inverse.back(image(a), t + delta))) {
      off.push(t)
    }

    a = next
  }

  return off
}

// beats where the coin and Y_t do not commute on W psi_t (piece off: on psi_t)
function commutatorBeats(s: Setup, rule: Rule, a0: Configuration, sw: Switches): number[] {
  let a = lockedState(a0)

  const off: number[] = []

  for (let t = 0; t < s.beats; t++) {
    const c = coinCommutator(s.tables, a, t, sw)

    if (!sameStateFast(c.yThenC, c.cThenY)) {
      off.push(t)
    }

    a = rule.forward(a, t)
  }

  return off
}

function returns(s: Setup, rule: Rule, a0: Configuration): boolean {
  let a = lockedState(a0)

  for (let t = 0; t < s.beats; t++) {
    a = rule.forward(a, t)
  }

  for (let t = s.beats - 1; t >= 0; t--) {
    a = rule.back(a, t)
  }

  return sameStateFast(a, lockedState(a0))
}

// G0: the rebuilt coin-before beat against valueBeat, forward and back, beats mismatched
function workingMismatches(s: Setup, piece: ValuePiece, a0: Configuration): number {
  const rule = ruleOf(s, 'before', piece)

  let a = lockedState(a0)
  let off = 0

  for (let t = 0; t < s.beats; t++) {
    const mine = rule.forward(a, t)
    const theirs = valueBeat(piece, s.tables, a, t)

    if (!sameStateFast(mine, theirs)) {
      off++
    }

    if (!sameStateFast(rule.back(theirs, t), valueBeatBack(piece, s.tables, theirs, t))) {
      off++
    }

    a = theirs
  }

  return off
}

// ---- the first failing dock ----

function dockOnly(c: Configuration, x: number): Configuration {
  const out = empty(c.vibe.length / 24)

  out.vibe.set(c.vibe.subarray(x * 24, x * 24 + 24), x * 24)
  out.point.set(c.point.subarray(x * 24, x * 24 + 24), x * 24)
  out.open.set(c.open.subarray(x * 24, x * 24 + 24), x * 24)
  out.store.set(c.store.subarray(x * 12, x * 12 + 12), x * 12)
  out.spoint.set(c.spoint.subarray(x * 12, x * 12 + 12), x * 12)
  out.sopen.set(c.sopen.subarray(x * 12, x * 12 + 12), x * 12)

  return out
}

function commutes(s: Setup, c: Configuration, t: number, sw: Switches): boolean {
  const k = coinCommutator(s.tables, lockedState(c), t, sw)

  return sameStateFast(k.yThenC, k.cThenY)
}

type Witness = {
  beat: number
  dock: number
  content: string
  pairAlone: boolean
  bounceAlone: boolean
  both: boolean
}

function firstWitness(s: Setup, a0: Configuration, failing: readonly number[]): Witness | undefined {
  if (failing.length === 0) {
    return undefined
  }

  const rule = ruleOf(s, 'before', { kind: 'off' })
  const t0 = failing[0]!

  let a = lockedState(a0)

  for (let t = 0; t < t0; t++) {
    a = rule.forward(a, t)
  }

  for (const br of a.branches) {
    for (let x = 0; x < s.tables.cells; x++) {
      const c = dockOnly(br, x)

      if (c.vibe.every(v => v === 0) || commutes(s, c, t0, ALL_ON)) {
        continue
      }

      const slots: string[] = []

      for (let d = 0; d < 24; d++) {
        const v = c.vibe[x * 24 + d]!

        if (v !== 0) {
          slots.push(`${d}${v > 0 ? '+' : '-'}${c.open[x * 24 + d] ? 'o' : 'c'}`)
        }
      }

      for (let l = 0; l < 12; l++) {
        if (c.store[x * 12 + l] !== 0) {
          slots.push(`store${l}:${c.store[x * 12 + l]}`)
        }
      }

      return {
        beat: t0,
        dock: x,
        content: slots.join(' '),
        pairAlone: !commutes(s, c, t0, { meeting: false, pair: true, bounce: false }),
        bounceAlone: !commutes(s, c, t0, { meeting: false, pair: false, bounce: true }),
        both: !commutes(s, c, t0, { meeting: false, pair: true, bounce: true }),
      }
    }
  }

  return undefined
}

// ---- one mesh ----

const VARIANTS: readonly { name: string; sw: Switches }[] = [
  { name: 'all', sw: ALL_ON },
  { name: 'noMeeting', sw: { meeting: false, pair: true, bounce: true } },
  { name: 'noPair', sw: { meeting: true, pair: false, bounce: true } },
  { name: 'noBounce', sw: { meeting: true, pair: true, bounce: false } },
]

export type CoinReading = {
  name: string
  kind: MeshKind
  g0Mismatches: number
  g0VariantsReturn: boolean
  // piece off, K S R against the rule itself, per start
  t: Record<string, number[]>
  // G2, per kind and start
  dual: Record<string, Record<string, number>>
  // G3: per variant and start, failing beats and commutator beats
  witness: Record<string, Record<string, { fail: number[]; comm: number[] }>>
  coinOff: Record<string, number>
  first?: Witness
  // G5, per kind and start
  split: Record<string, Record<string, number>>
  // G6: candidate name -> starts reading 0 (of all), and X1 beats off
  candidates: Record<string, { zeroStarts: number; x1: number }>
  // G7 (box only): per kind, per map, per start
  cptDual?: Record<string, Record<string, Record<string, number>>>
  cptSplit?: Record<string, Record<string, Record<string, number>>>
  seconds: number
}

export function readCoin(s: Setup, log: (line: string) => void = () => {}): CoinReading {
  const started = Date.now()
  const starts = startsOf(s)
  const theta: Map1 = x => motionReversal(s.tables, x)
  const off = pieceOf(s, 'off')
  const working = ruleOf(s, 'before', off)
  const r: CoinReading = {
    name: s.name,
    kind: s.kind,
    g0Mismatches: 0,
    g0VariantsReturn: true,
    t: {},
    dual: {},
    witness: {},
    coinOff: {},
    split: {},
    candidates: {},
    seconds: 0,
  }
  const tick = (what: string): void =>
    log(`${s.name} ${what} (${Math.round((Date.now() - started) / 1000)} s)`)

  for (const kind of VALUE_KINDS) {
    const piece = pieceOf(s, kind)
    const before = ruleOf(s, 'before', piece)
    const after = ruleOf(s, 'after', piece)
    const split = ruleOf(s, 'split', piece)

    r.dual[kind] = {}
    r.split[kind] = {}

    for (const st of starts) {
      r.g0Mismatches += workingMismatches(s, piece, st.config)
      r.dual[kind][st.name] = reversalBeats(s, before, after, st.config, theta).length
      r.split[kind][st.name] = reversalBeats(s, split, split, st.config, theta).length

      if (kind === 'off' || kind === 'odd') {
        for (const o of ['after', 'split', 'none'] as CoinOrder[]) {
          r.g0VariantsReturn &&= returns(s, ruleOf(s, o, piece), st.config)
        }
      }
    }

    tick(`${kind}: dual ${JSON.stringify(r.dual[kind])} split ${JSON.stringify(r.split[kind])}`)
  }

  for (const v of VARIANTS) {
    const rule = ruleOf(s, 'before', off, v.sw)

    r.witness[v.name] = {}

    for (const st of starts) {
      r.g0VariantsReturn &&= returns(s, rule, st.config)
      r.witness[v.name]![st.name] = {
        fail: reversalBeats(s, rule, rule, st.config, theta),
        comm: commutatorBeats(s, rule, st.config, v.sw),
      }
    }
  }

  for (const st of starts) {
    r.t[st.name] = r.witness.all![st.name]!.fail
    r.coinOff[st.name] = reversalBeats(s, ruleOf(s, 'none', off), ruleOf(s, 'none', off), st.config, theta).length
  }

  const x1 = starts.find(st => st.name === 'X1')!

  r.first = firstWitness(s, x1.config, r.t.X1!)
  tick(`witness ${JSON.stringify(r.witness)} coin off ${JSON.stringify(r.coinOff)} first ${JSON.stringify(r.first)}`)

  if (s.kind === 'box') {
    const c: Map1 = x => coinStep(s.tables, x, false)
    const cInv: Map1 = x => coinStep(s.tables, x, true)
    const d: Map1 = x => halfCoinStep(s.tables, x, false)
    const dInv: Map1 = x => halfCoinStep(s.tables, x, true)
    const candidates: Record<string, Map1> = {
      'theta C': x => theta(c(x)),
      'theta C^-1': x => theta(cInv(x)),
      'C theta': x => c(theta(x)),
      'C^-1 theta': x => cInv(theta(x)),
      'theta D': x => theta(d(x)),
      'theta D^-1': x => theta(dInv(x)),
      'D theta': x => d(theta(x)),
      'D^-1 theta': x => dInv(theta(x)),
    }

    for (const [name, image] of Object.entries(candidates)) {
      for (const delta of [0, 1, 2]) {
        let zeroStarts = 0
        let x1Off = -1

        for (const st of starts) {
          const n = reversalBeats(s, working, working, st.config, image, delta).length

          zeroStarts += n === 0 ? 1 : 0

          if (st.name === 'X1') {
            x1Off = n
          }
        }

        r.candidates[`${name} delta ${delta}`] = { zeroStarts, x1: x1Off }
      }
    }

    tick(`candidates ${JSON.stringify(r.candidates)}`)

    const maps: Record<string, Mirror> = {
      P: mirrorOf(huskInversion(false), 4),
      Prot: mirrorOf(huskInversion(true), 4),
    }
    const cp = (m: Mirror): Map1 => x =>
      mapState(theta(x), q => chargeConjugate(mirrorConfiguration(m, q)))

    r.cptDual = {}
    r.cptSplit = {}

    for (const kind of VALUE_KINDS) {
      const piece = pieceOf(s, kind)
      const before = ruleOf(s, 'before', piece)
      const after = ruleOf(s, 'after', piece)
      const split = ruleOf(s, 'split', piece)

      r.cptDual[kind] = {}
      r.cptSplit[kind] = {}

      for (const [mn, m] of Object.entries(maps)) {
        r.cptDual[kind][mn] = {}
        r.cptSplit[kind][mn] = {}

        for (const st of starts) {
          r.cptDual[kind][mn][st.name] = reversalBeats(s, before, after, st.config, cp(m)).length
          r.cptSplit[kind][mn][st.name] = reversalBeats(s, split, split, st.config, cp(m)).length
        }
      }
    }

    tick(`cptDual ${JSON.stringify(r.cptDual)} cptSplit ${JSON.stringify(r.cptSplit)}`)
  }

  r.seconds = (Date.now() - started) / 1000

  return r
}

// ---- the gates ----

const sameBeats = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i])

const allZero = (rec: Record<string, number>): boolean => Object.values(rec).every(n => n === 0)

export function coinGates(r: CoinReading): Record<string, boolean> {
  const box = r.kind === 'box'
  const expectX1 = box ? 2 : 1
  const gates: Record<string, boolean> = {
    G0: r.g0Mismatches === 0 && r.g0VariantsReturn,
    G1: Object.entries(r.t).every(([n, beats]) =>
      n === 'X1' || n === 'X1f' ? beats.length === expectX1 : beats.length === 0,
    ),
    G2: Object.values(r.dual).every(allZero),
    G3: Object.values(r.witness).every(per =>
      Object.values(per).every(w => sameBeats(w.fail, w.comm)),
    ),
    G5: Object.values(r.split).every(allZero),
  }

  if (box) {
    gates.G4 =
      allZero(r.coinOff) &&
      r.witness.noMeeting!.X1!.fail.length === 2 &&
      r.first !== undefined

    gates.G6none = Object.values(r.candidates).every(c => c.zeroStarts < 9)

    const d = r.cptDual!
    const sp = r.cptSplit!
    const pattern = (x: Record<string, Record<string, Record<string, number>>>): boolean =>
      allZero(x.off!.P!) &&
      allZero(x.off!.Prot!) &&
      allZero(x.odd!.P!) &&
      x.odd!.Prot!.X1! > 0 &&
      x.odd!.Prot!.X1f! > 0 &&
      x.even!.P!.H! > 0

    gates.G7 = pattern(d) && pattern(sp)
  }

  return gates
}

export function coinReversal(
  meshes: readonly { kind: MeshKind; radius?: number; gated: boolean }[],
  log: (line: string) => void = () => {},
): Verdict {
  const started = Date.now()
  const readings = meshes.map(spec => {
    const s = meshSetup(spec.kind, spec.radius)
    const r = readCoin(s, log)
    const gates = coinGates(r)

    log(`${s.name} gates ${JSON.stringify(gates)}`)

    return { spec, r, gates }
  })
  const gated = readings.filter(x => x.spec.gated)
  const allGates: Record<string, boolean> = {}

  for (const x of gated) {
    for (const [g, ok] of Object.entries(x.gates)) {
      allGates[g] = (allGates[g] ?? true) && ok
    }
  }

  const box = readings.find(x => x.r.kind === 'box')?.r
  const found = box ? Object.entries(box.candidates).filter(([, c]) => c.zeroStarts === 9).map(([n]) => n) : []
  const failing = Object.entries(allGates).filter(([g, ok]) => !ok && g !== 'G6none').map(([g]) => g)
  const status = failing.length > 0 ? 'fail' : found.length > 0 ? 'open' : 'pass'
  const metrics: Record<string, number> = { seconds: (Date.now() - started) / 1000 }

  for (const [g, ok] of Object.entries(allGates)) {
    metrics[`gate${g}`] = ok ? 1 : 0
  }

  for (const { spec, r } of readings) {
    const tag = `${spec.kind}${spec.radius ?? ''}`

    metrics[`${tag}_tX1`] = r.t.X1!.length
    metrics[`${tag}_dualTotal`] = Object.values(r.dual).reduce((a, k) => a + Object.values(k).reduce((p, q) => p + q, 0), 0)
    metrics[`${tag}_splitTotal`] = Object.values(r.split).reduce((a, k) => a + Object.values(k).reduce((p, q) => p + q, 0), 0)

    for (const v of VARIANTS) {
      metrics[`${tag}_${v.name}_X1fail`] = r.witness[v.name]!.X1!.fail.length
    }

    if (r.cptDual) {
      for (const kind of VALUE_KINDS) {
        metrics[`${tag}_${kind}_cptDualProtX1`] = r.cptDual[kind]!.Prot!.X1!
        metrics[`${tag}_${kind}_cptDualPX1`] = r.cptDual[kind]!.P!.X1!
        metrics[`${tag}_${kind}_cptSplitProtX1`] = r.cptSplit![kind]!.Prot!.X1!
      }
    }
  }

  const odd = box?.cptDual?.odd?.Prot?.X1

  return verdict({
    status,
    claim:
      status === 'pass'
        ? `K S R carries the working rule onto the inverse of the coin-after rule exactly (0 beats off on every start, mesh and value kind), and fails the rule itself exactly where the coin and the collision do not commute; the split-coin palindrome is T-even; no coin-dressed antiunitary is kept, so the rule is T-odd by the coin's place; ODD's CPT under the depth-reversing lift breaks on X1 at ${odd} of 8 beats against a zero control`
        : status === 'open'
          ? `a coin-dressed antiunitary is kept on every start: ${found.join(', ')}`
          : `gates failing: ${failing.join(', ')}`,
    metrics,
    notes: `Gates registered before the run. First witness: ${JSON.stringify(box?.first)}. ${readings
      .map(x => `${x.r.name} (${x.spec.gated ? 'gated' : 'reported'}, ${x.r.seconds.toFixed(0)} s): ${JSON.stringify(x.gates)}`)
      .join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'foundations/coin-reversal',
  code: 'E-FND-0179',
  title:
    "the coin's place and the motion reversal, pass: K R maps every piece of the working rule to its own inverse, so K S R carries the rule (coin, then meeting and collision, then stream) exactly onto the inverse of the rule with the coin after the collision, 0 beats off on 9 of 9 starts on the side-4 box and the R = 3 and R = 4 balls for every value kind; it fails the rule itself exactly at the beats where the coin and the collision do not commute on the state (X1: beats 1 and 5 of 8 on the box, 1 of 3 on the balls), first at beat 1 on dock 0 (an open love on slot 0, closed loves on 1, 4, 16), broken by the bounce alone (bounce off: 0; meeting or pair move off: unchanged; coin off: 0); the coin split around the collision (D = C^(1/2), exact in Z[w][1/2]) is exactly T-even on every start and mesh; no coin-dressed antiunitary (24 candidates) is kept, so the rule is T-odd and CPT-odd by the coin's place; read against that zero control ODD breaks CPT under the depth-reversing lift on X1 at 2 of 8 beats and keeps it under the depth-kept inversion, EVEN breaks it on the like pair at 7 of 8",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return coinReversal(
      [
        { kind: 'box', radius: 1, gated: true },
        { kind: 'ball', radius: 3, gated: true },
        { kind: 'ball', radius: 4, gated: true },
      ],
      line => console.error(line),
    )
  },
})
