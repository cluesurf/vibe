// THE GROUNDING MIXER SCREEN (a recorded decision).
// B3 (E-SLF-0183) and its engine (E-SLF-0184) found that B1's cluster on an open honeycomb line loses its excess at
// 0.043 a beat, and that under the working rule it can export only along its line (note/line-confinement.md: true for a
// state on one mesh line, false in general where K meets two single lines). Board 0034's six dock mixers are the pieces
// that let a vibe leave its line. Here each is screened as a GROUNDING piece (not a binding piece: a recorded decision): does
// it keep the self and slow the loss of its excess enough for a keeping time of 80 beats?
//
// THE INSTRUMENT (note/line-confinement.md section 4, Lemma W). With a dock mixer M before the beat, the part of the
// state with every vibe on the start line l is, through the end of beat 2, the line engine with each dock's on-line
// block P M P inserted (cone-line mixPass). No weight that left l can come back before beat 3. So within beats 0 to 2
// the lone cluster's F (all three loves on l) is honeycomb-exact, and the cluster-in-bath F read on the P part is a
// lower bound (an exported bath love is not read). The exact R = 4 ball cannot hold the start (B1's cluster spans 23
// docks of one line, the ball's line 9), so the ball checks the lemma's pieces in the members' own code instead (X1,
// X2) on starts that fit.
//
// GATES, fixed in the item's what before this file existed (gate 31ab68bfe595, 2026-11-16): C1, W0, X1, X2, B0, the
// measures L(t), g(t), r_self, r_exc, the pass bar tau >= 80. Verdict: open if an instrument gate fails; pass if a
// member passes; fail if all six fail; open otherwise. Smoke is open by rule.
//
// PREDICTION (before the first run): all six fail; F-G and F-L with L(2) below 0.6, the ring members between 0.6 and
// 0.9, the bare rule at least 0.9; screen verdict fail.
//
// SETTINGS. Default SMOKE (box-8 level, W 10 k 3 start 0, bare to beat 4; seconds on a small machine). MIXER_SWEEP=full for
// a large machine (box-12 level, W 12 k 3 starts 0 1 2, bare to beat 11 at cap 1.5e8).
//
// FULL RUN (M3, 2026-11-16, clone mixer-export, 317 s, gate 31ab68bfe595): FAIL. Every instrument gate holds (C1, W0,
// X1, X2 with blocks off 1.4e-17, B0 with g off 0019 by 4e-4 and rate 0.0433). L(2): F-G 0.221, F-L 0.015, R-w 0.414,
// R-w2 0.421, R-1 0.303, R-star 0.304, bare 0.959; tau_self 1.0 to 1.7 beats. The ring range of the prediction (0.6 to
// 0.9) was wrong: they lose more.
//
// Depth L2: B1's line rule in floats on one line, the mixers' on-line blocks from their exact code.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
} from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import {
  bathLoves,
  lineReader,
  type Coin,
  type LineReader,
} from '@/code/measure/cold-line'
import {
  ConeCap,
  coneBeat,
  coneBoundCount,
  coneNorm,
  coneStart,
  coneStore,
  mixPass,
  type ConeStore,
} from '@/code/measure/cone-line'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  cloneConfiguration,
  lockedNorm,
  lockedState,
  lockedTables,
  mergeBranches,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedVetoBeat,
  coinedVetoBeatBack,
  currentCoinPlace,
  liftBranch,
  mixBranch,
  setCoinPlace,
  type CoinPlace,
} from '@/code/rule/coined-locked-knit'
import {
  ringDockMixBranch,
  ringScale,
  SWAP_ANGLE,
  type RingUnit,
} from '@/code/rule/swap-mixer'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

const RECORDED = { energy: 0.33001851839229945 }

// 0019's open g at W 12 k 3, beats 0 to 11 (grounding log, 2026-11-15), and its loss rate
const G_0019 = [
  1.017, 0.872, 0.872, 0.695, 0.705, 0.582, 0.6, 0.52, 0.563, 0.518, 0.544,
  0.541,
]
const RATE_0019 = 0.0433
const G_TOL = 6e-4
const RATE_TOL = 5e-4
const NORM_TOL = 1e-10
const BLOCK_TOL = 1e-15
const HOLD = 0.9
const HALF = 0.5
const TAU_BAR = 80
const WINDOW = 2

const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

// ---- the members ----

type Member = {
  name: string
  // the mixer on a branch (adjoint for the inverse beat); every dock times `scale`
  mix: (cells: number, br: Branch, adjoint: boolean) => Branch[]
  scale: bigint
  // the on-line block (note/line-confinement.md section 4): a single line [[k, h], [h, k]], a full line f
  lone: Coin
  full: [number, number]
}

const SQ3 = Math.sqrt(3)

// u = (a + b w) / den as a complex number
const complexOf = (u: RingUnit): [number, number] => [
  (Number(u.num[0]) - Number(u.num[1]) / 2) / Number(u.den),
  ((Number(u.num[1]) * SQ3) / 2) / Number(u.den),
]

function ringMember(name: string, u: RingUnit): Member {
  const [ur, ui] = complexOf(u)
  const hr = (ur - 1) / 24
  const hi = ui / 24

  return {
    name,
    mix: (cells, br, adjoint) => ringDockMixBranch(cells, br, u, adjoint),
    scale: ringScale(u),
    lone: [
      [1 + hr, hi],
      [hr, hi],
    ],
    full: [1 + 2 * hr, 2 * hi],
  }
}

const BARE: Member = {
  name: 'bare',
  mix: (_cells, br) => [br],
  scale: 1n,
  lone: [
    [1, 0],
    [0, 0],
  ],
  full: [1, 0],
}

const MEMBERS: readonly Member[] = [
  {
    name: 'F-G',
    mix: (cells, br) => mixBranch(cells, br),
    scale: 1n,
    lone: [
      [0.75, 0],
      [-0.25, 0],
    ],
    full: [1, 0],
  },
  {
    name: 'F-L',
    mix: (cells, br) => liftBranch(cells, br),
    scale: 1n,
    lone: [
      [0.75, 0],
      [-0.25, 0],
    ],
    full: [0.5, 0],
  },
  ringMember('R-w', { num: [0n, 1n], den: 1n }),
  ringMember('R-w2', { num: [-1n, -1n], den: 1n }),
  ringMember('R-1', { num: [-1n, 0n], den: 1n }),
  ringMember('R-star', SWAP_ANGLE),
]

// ---- the exact ball ----

type Ball = {
  cells: number
  tables: LockedTables
  nb: (x: number, d: number) => number
}

function ballOf(radius: number): Ball {
  const m = exactBallMesh({ radius })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
  const tables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * 24).fill(f.weave.moves.identity),
  )

  return { cells, tables, nb: (x, d) => m.mesh.neighbour(x, d) }
}

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

// open loves of point 0 on the given (dock, slot)s
function loves(cells: number, at: readonly (readonly [number, number])[]): Configuration {
  const c = empty(cells)

  for (const [x, d] of at) {
    c.vibe[x * 24 + d] = 1
    c.open[x * 24 + d] = 1
  }

  return c
}

const cloneBranch = (b: Branch): Branch => ({
  ...cloneConfiguration(b),
  a: b.a,
  b: b.b,
  k: b.k,
})

function memberBeat(
  m: Member,
  t: LockedTables,
  s: LockedState,
  beat: number,
  keep?: (b: Branch) => boolean,
): LockedState {
  let mixed = mergeBranches(
    s.branches.flatMap(b => m.mix(t.cells, cloneBranch(b), false)),
  )

  if (keep) {
    mixed = mixed.filter(keep)
  }

  return coinedVetoBeat('none', t, { branches: mixed }, beat)
}

function memberBack(
  m: Member,
  t: LockedTables,
  s: LockedState,
  beat: number,
): LockedState {
  const back = coinedVetoBeatBack('none', t, s, beat)

  return {
    branches: mergeBranches(
      back.branches.flatMap(b => m.mix(t.cells, cloneBranch(b), true)),
    ),
  }
}

// the branches of `a` minus `b` times `factor`, merged: empty exactly when a = factor b
function differ(a: readonly Branch[], b: readonly Branch[], factor: bigint): number {
  const neg = b.map(x => {
    const y = cloneBranch(x)

    y.a = -x.a * factor
    y.b = -x.b * factor

    return y
  })

  return mergeBranches([...a.map(cloneBranch), ...neg]).length
}

// ---- W0: the part 1 witness ----

type Witness = {
  place: CoinPlace
  found: boolean
  start: string
  moved: number
  tried: number
}

function witness(place: CoinPlace): Witness {
  const ball = ballOf(1)
  const r = D0
  const lr = LINE_OF[r]!

  let tried = 0

  for (let s = 0; s < 24; s++) {
    const ls = LINE_OF[s]!

    if (ls === lr) {
      continue
    }

    for (let lm = 0; lm < 12; lm++) {
      if (lm === lr || lm === ls) {
        continue
      }

      tried++

      const start = loves(ball.cells, [
        [0, r],
        [0, s],
        [0, LINE_FIRSTS[lm]!],
        [0, OPPOSITE[LINE_FIRSTS[lm]!]!],
      ])
      const lines = [lr, ls, lm]
      const after = coinedVetoBeat('none', ball.tables, lockedState(start), 0)

      let moved = 0

      for (const b of after.branches) {
        for (let i = 0; i < b.vibe.length; i++) {
          if (b.vibe[i] === 0) {
            continue
          }

          const y = Math.floor(i / 24)
          const d = i % 24
          const l = LINE_OF[d]!
          const on = lines.some(
            q =>
              q === l &&
              (y === ball.nb(0, LINE_FIRSTS[q]!) ||
                y === ball.nb(0, OPPOSITE[LINE_FIRSTS[q]!]!)),
          )

          if (!on) {
            moved++
          }
        }
      }

      if (moved > 0) {
        return {
          place,
          found: true,
          start: `singles on slots ${r} and ${s}, full line ${lm}`,
          moved,
          tried,
        }
      }
    }
  }

  return { place, found: false, start: '-', moved: 0, tried }
}

// ---- X1: each member exact and reversible ----

type Reversal = { member: string; start: string; beats: number; equal: boolean; norm: boolean }

function reversal(m: Member, ball: Ball, name: string, c: Configuration, beats: number): Reversal {
  let s = lockedState(c)

  for (let t = 0; t < beats; t++) {
    s = memberBeat(m, ball.tables, s, t)
  }

  const n = lockedNorm(s)
  const scale2 = m.scale ** BigInt(2 * ball.cells * beats)
  const norm = n.total === n.unit * scale2

  for (let t = beats - 1; t >= 0; t--) {
    s = memberBack(m, ball.tables, s, t)
  }

  const equal = differ(s.branches, lockedState(c).branches, scale2) === 0

  return { member: m.name, start: name, beats, equal, norm }
}

// ---- X2: Lemma W in code ----

type Block = { member: string; off: number; extra: number }

// the member's on-line block on one dock, against its table
function blockCheck(m: Member): Block {
  const S = Number(m.scale)
  const value = (b: Branch): [number, number] => {
    const den = 2 ** b.k * S
    const a = Number(b.a)
    const bb = Number(b.b)

    return [(a - bb / 2) / den, ((bb * SQ3) / 2) / den]
  }
  const onLine = (b: Branch): boolean => {
    for (let d = 0; d < 24; d++) {
      if (b.vibe[d] !== 0 && d !== D0 && d !== D0_BACK) {
        return false
      }
    }

    return true
  }

  let off = 0
  let extra = 0

  const cases: [readonly [number, number][], [number, number, number, number][]][] = [
    // single on D0: D0 keeps k, the other slot h
    [[[0, D0]], [[D0, -1, m.lone[0][0], m.lone[0][1]], [D0_BACK, -1, m.lone[1][0], m.lone[1][1]]]],
    [[[0, D0_BACK]], [[D0_BACK, -1, m.lone[0][0], m.lone[0][1]], [D0, -1, m.lone[1][0], m.lone[1][1]]]],
    [[[0, D0], [0, D0_BACK]], [[D0, D0_BACK, m.full[0], m.full[1]]]],
  ]

  for (const [at, want] of cases) {
    const out = mergeBranches(
      m.mix(1, lockedState(loves(1, at)).branches[0]!, false),
    ).filter(onLine)
    const seen = new Set<number>()

    for (const b of out) {
      const held = [D0, D0_BACK].filter(d => b.vibe[d] !== 0)
      const row = want.findIndex(
        ([p, q]) =>
          held.length === (q < 0 ? 1 : 2) &&
          held.includes(p) &&
          (q < 0 || held.includes(q)),
      )

      if (row < 0) {
        extra++
        continue
      }

      seen.add(row)

      const [vr, vi] = value(b)

      off = Math.max(off, Math.hypot(vr - want[row]![2], vi - want[row]![3]))
    }

    want.forEach(([, , wr, wi], row) => {
      if (!seen.has(row)) {
        off = Math.max(off, Math.hypot(wr, wi))
      }
    })
  }

  return { member: m.name, off, extra }
}

type Window = { member: string; start: string; beats: number; differ: number; branches: number }

function windowCheck(m: Member, ball: Ball, name: string, c: Configuration, beats: number): Window {
  const onL = new Uint8Array(ball.cells * 24)

  for (const dir of [D0, D0_BACK]) {
    let x = 0

    while (x >= 0) {
      onL[x * 24 + D0] = 1
      onL[x * 24 + D0_BACK] = 1
      x = ball.nb(x, dir)
    }
  }

  const inP = (b: Branch): boolean => {
    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] !== 0 && !onL[i]) {
        return false
      }
    }

    return true
  }

  let a = lockedState(c)
  let b = lockedState(c)
  let branches = 0

  for (let t = 0; t < beats; t++) {
    a = memberBeat(m, ball.tables, a, t)
    b = memberBeat(m, ball.tables, b, t, inP)
    branches = Math.max(branches, a.branches.length)
  }

  return {
    member: m.name,
    start: name,
    beats,
    differ: differ(a.branches.filter(inP), b.branches, 1n),
    branches,
  }
}

// ---- the line runs ----

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  W: number
  starts: number
  bareBeats: number
  cap: number
}

const SMOKE: Setting = {
  name: 'smoke',
  box: 8,
  levelBar: 1e-4,
  W: 10,
  starts: 1,
  bareBeats: 4,
  cap: 2e6,
}

const FULL: Setting = {
  name: 'full',
  box: 12,
  levelBar: 1e-9,
  W: 12,
  starts: 3,
  bareBeats: 11,
  cap: 1.5e8,
}

const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

const mean = (xs: readonly number[]): number =>
  xs.reduce((s, x) => s + x, 0) / xs.length

type Series = { F: number[]; norm: number[]; reach: number }

// F and the norm at beats 0..beats (or to the cap) with the member's on-line block before each beat
function series(first: ConeStore, m: Member, beats: number, rd: LineReader): Series {
  let a = first
  let b = coneStore(a.n, a.line, a.cap)

  const F = [coneBoundCount(a, rd)]
  const norm = [coneNorm(a)]

  let reach = 0

  for (let t = 1; t <= beats; t++) {
    if (m !== BARE) {
      mixPass(a, m.lone, m.full)
    }

    try {
      coneBeat(a, b, true)
    } catch (err) {
      if (err instanceof ConeCap) {
        break
      }

      throw err
    }

    ;[a, b] = [b, a]
    reach = t
    F.push(coneBoundCount(a, rd))
    norm.push(coneNorm(a))
  }

  return { F, norm, reach }
}

type Reading = {
  member: string
  reach: number
  L: number[]
  g: number[]
  loneNorm: number[]
  rSelf: number
  tauSelf: number
  rExc: number
  tauExc: number
  status: 'pass' | 'fail' | 'open'
  normDrift: number
}

function reading(
  m: Member,
  beats: number,
  make: (n: number, bath: readonly (readonly [number, number])[], cluster: boolean) => ConeStore,
  baths: readonly (readonly (readonly [number, number])[])[],
  rd: LineReader,
  log: (what: string) => void,
): Reading {
  const lone = series(make(3, [], true), m, beats, rd)
  const cb = baths.map(bath => series(make(6, bath, true), m, beats, rd))
  const bt = baths.map(bath => series(make(3, bath, false), m, beats, rd))
  const reach = Math.min(lone.reach, ...cb.map(s => s.reach), ...bt.map(s => s.reach))
  const L: number[] = []
  const g: number[] = []

  for (let t = 0; t <= reach; t++) {
    L.push(lone.F[t]! / lone.F[0]!)
    g.push(
      (mean(cb.map(s => s.F[t]!)) - mean(bt.map(s => s.F[t]!))) / lone.F[t]!,
    )
  }

  const w = Math.min(WINDOW, reach)
  const rSelf = (1 - L[w]!) / w
  const rExc = (g[0]! - g[w]!) / w
  const tauSelf = rSelf > 0 ? HALF / rSelf : Infinity
  const tauExc = rExc > 0 ? (g[0]! - HALF) / rExc : Infinity
  const hold = L.slice(1, w + 1).every(x => x >= HOLD)
  const status: Reading['status'] =
    !hold || tauSelf < TAU_BAR
      ? 'fail'
      : tauExc >= TAU_BAR
        ? 'pass'
        : 'open'
  const normDrift =
    m === BARE
      ? Math.max(
          ...[lone, ...cb, ...bt].flatMap(s => s.norm.map(x => Math.abs(x - 1))),
        )
      : 0

  log(`${m.name}: reach ${reach}, L ${L.map(x => x.toFixed(4)).join(' ')}, g ${g.map(x => x.toFixed(4)).join(' ')}`)

  return {
    member: m.name,
    reach,
    L,
    g,
    loneNorm: lone.norm,
    rSelf,
    tauSelf,
    rExc,
    tauExc,
    status,
    normDrift,
  }
}

export default experiment({
  id: 'selves/mixer-export',
  code: 'E-SLF-0185',
  title:
    "the grounding mixer screen: board 0034's six dock mixers before the split beat, each read on B1's bound cluster and bath on an open honeycomb line within the two beats Lemma W keeps exact, for the self's persistence and the loss rate of its excess against the 80-beat keeping bar",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.MIXER_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const place0 = currentCoinPlace()

    try {
      // ---- W0, in both coin places ----
      const witnesses = (['before', 'split'] as const).map(p => {
        setCoinPlace(p)

        return witness(p)
      })
      const gW0 = witnesses.every(w => w.found)

      setCoinPlace('split')
      log('W0')

      // ---- X1 ----
      const b1 = ballOf(1)
      const L1 = loves(b1.cells, [[0, D0]])
      const F1 = loves(b1.cells, [[0, D0], [0, D0_BACK]])
      const reversals: Reversal[] = []

      for (const m of [BARE, ...MEMBERS]) {
        reversals.push(reversal(m, b1, 'L', L1, 2))
        reversals.push(reversal(m, b1, 'F', F1, 1))
        log(`X1 ${m.name}`)
      }

      const gX1 = reversals.every(r => r.equal && r.norm)

      // ---- X2 ----
      const blocks = MEMBERS.map(blockCheck)
      const b2 = ballOf(2)
      const L2 = loves(b2.cells, [[0, D0]])
      const F2 = loves(b2.cells, [[0, D0], [0, D0_BACK]])
      const windows: Window[] = []

      for (const m of MEMBERS) {
        windows.push(windowCheck(m, b2, 'L', L2, 2))
        windows.push(windowCheck(m, b2, 'F', F2, m.name === 'F-G' ? 2 : 1))
        log(`X2 ${m.name}`)
      }

      const gX2 =
        blocks.every(b => b.off <= BLOCK_TOL && b.extra === 0) &&
        windows.every(w => w.differ === 0)

      // ---- C1, the level ----
      const basis = lineBasis({
        flavors: [0, 0, 0],
        statistics: 'fermion',
        D: 3,
        box: setting.box,
        unit: 0,
      })
      const level = lineLightest(basis, wholeBasis(basis)).lightest
      const placed = levelPlacement(basis, level.cre, level.cim)
      const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
      const gC1 = levelOff <= setting.levelBar

      log('C1')

      // ---- the line runs ----
      const { W } = setting
      const read = Math.floor((W - 1) / 2)
      const fit = fitRing(placed, W).kept
      const width = widthOf(W, fit)
      const beats = setting.bareBeats
      const line = Math.max(256, width + 2 * beats + 2)
      const offset = beats + 1
      const rd = lineReader(placed, line, read, false)
      const baths = Array.from({ length: setting.starts }, (_, s) =>
        bathLoves(W, read, 3, s),
      )
      const make = (
        n: number,
        bath: readonly (readonly [number, number])[],
        cluster: boolean,
      ): ConeStore =>
        coneStart({
          n,
          line,
          cap: setting.cap,
          W,
          placed: cluster ? fit : undefined,
          bath,
          offset,
        }).store

      const bare = reading(BARE, beats, make, baths, rd, log)
      const readings = MEMBERS.map(m => reading(m, WINDOW, make, baths, rd, log))

      // ---- B0 ----
      const gOff =
        setting.name === 'full'
          ? Math.max(
              ...G_0019.map((x, t) =>
                t <= bare.reach ? Math.abs(bare.g[t]! - x) : Infinity,
              ),
            )
          : NaN
      const rate =
        bare.reach > 0 ? (bare.g[0]! - bare.g[bare.reach]!) / bare.reach : NaN
      const gB0 =
        setting.name === 'full' &&
        bare.reach >= 11 &&
        gOff <= G_TOL &&
        Math.abs(rate - RATE_0019) <= RATE_TOL &&
        bare.L.slice(1, WINDOW + 1).every(x => x >= HOLD) &&
        bare.normDrift <= NORM_TOL

      const instrument = gC1 && gW0 && gX1 && gX2 && (setting.name === 'smoke' || gB0)
      const status: 'pass' | 'fail' | 'open' =
        !instrument || setting.name === 'smoke'
          ? 'open'
          : readings.some(r => r.status === 'pass')
            ? 'pass'
            : readings.every(r => r.status === 'fail')
              ? 'fail'
              : 'open'

      const f4 = (x: number): string =>
        Number.isFinite(x) ? x.toFixed(4) : String(x)
      const row = (r: Reading): string =>
        `${r.member} ${r.status.toUpperCase()}: L ${r.L.map(f4).join(' ')}, on-line weight of the lone cluster ${r.loneNorm.map(f4).join(' ')}, g (P part) ${r.g.map(f4).join(' ')}, r_self ${f4(r.rSelf)} (tau_self ${f4(r.tauSelf)}), r_exc ${f4(r.rExc)} (tau_exc ${f4(r.tauExc)})`

      const metrics: Record<string, number> = {
        gate_C1: gC1 ? 1 : 0,
        gate_W0: gW0 ? 1 : 0,
        gate_X1: gX1 ? 1 : 0,
        gate_X2: gX2 ? 1 : 0,
        gate_B0: gB0 ? 1 : 0,
        levelOff,
        b0GOff: gOff,
        b0Rate: rate,
        b0Reach: bare.reach,
        b0NormDrift: bare.normDrift,
        blockOff: Math.max(...blocks.map(b => b.off)),
        windowDiffer: windows.reduce((s, w) => s + w.differ, 0),
        seconds: (Date.now() - started) / 1000,
      }

      for (const r of [bare, ...readings]) {
        const p = r.member.replace('-', '')

        metrics[`${p}_L1`] = r.L[1] ?? NaN
        metrics[`${p}_L2`] = r.L[2] ?? NaN
        metrics[`${p}_rSelf`] = r.rSelf
        metrics[`${p}_rExc`] = r.rExc
        metrics[`${p}_pass`] = r.status === 'pass' ? 1 : 0
      }

      return verdict({
        status,
        claim: `${setting.name} setting, W ${W} k 3 (${setting.starts} start${setting.starts > 1 ? 's' : ''}), window beats 0 to ${WINDOW}: ${readings.map(row).join(' || ')} || bare control to beat ${bare.reach}: g ${bare.g.map(f4).join(' ')}, loss rate ${f4(rate)}, window ${row(bare)}`,
        metrics,
        notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. Gates C1 ${gC1} (level off ${levelOff.toExponential(1)}), W0 ${gW0} (${witnesses.map(w => `${w.place}: ${w.found ? `${w.start}, ${w.moved} vibes off the start lines after ${w.tried} tries` : `none in ${w.tried}`}`).join('; ')}), X1 ${gX1} (${reversals.filter(r => !(r.equal && r.norm)).map(r => `${r.member} ${r.start} equal ${r.equal} norm ${r.norm}`).join(', ') || 'every member and start reverses exactly with exact norm'}), X2 ${gX2} (blocks off ${Math.max(...blocks.map(b => b.off)).toExponential(1)}, extra on-line outputs ${blocks.reduce((s, b) => s + b.extra, 0)}; windows ${windows.map(w => `${w.member} ${w.start} ${w.beats} beats ${w.differ} differ (${w.branches} branches)`).join(', ')}), B0 ${gB0} (g off 0019 ${Number.isFinite(gOff) ? gOff.toExponential(1) : gOff}, rate ${f4(rate)} against ${RATE_0019}, reach ${bare.reach}, norm drift ${bare.normDrift.toExponential(1)}). Honeycomb grade within beats 0 to ${WINDOW} by Lemma W (note/line-confinement.md section 4); tau is the 0019 linear projection, predicted. g is read on the P part, a lower bound, so r_exc is an upper bound. Grounding only: a recorded decision holds 004 for binding.`,
      })
    } finally {
      setCoinPlace(place0)
    }
  },
})
