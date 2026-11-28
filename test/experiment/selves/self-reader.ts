// THE SELF READER (note/self-reader.md). Every grounding
// route so far read a self by a hand-chosen weight L(t) of B1's bound level, and all failed (E-SLF-0183 to E-SLF-0186).
// Here a self is a REGION that keeps its past: its closure c_A(t), the fidelity with which the region's present alone
// (the complement put back to its self-free run) implies its past when the reversible rule runs back, must outlast the
// closure its members would have as free loves: tau_c >= 2 tau_0 (code/measure/self-reader).
//
// THE GATES, fixed in the item's what before any probe (gate 2fdea9d3d997): instruments C1, B0, N1, I0, F0 and the
// line run's norm; definition gates S1 (B1's line self reads as a self on the line engine over 96 beats), S2 (the empty
// vacuum is not a self), S3 (a lone love is not a self, c = c0 on the exact R = 4 ball), S4 (invariance over the 12
// lines through a dock in both orientations, C and the members' order). REPORTED: kappa(2) = sqrt c(2) on E-SLF-0186's
// K arm and E-SLF-0185's mixers, where L(2) dropped. Smoke is open by rule.
//
// PREDICTION (before the first run): S1 passes (tau_c beyond the run, tau_0 near 20 to 30); S2 to S4 pass; kappa(2)
// 0.88 to 0.92 for the K arm and 0.4 to 0.85 for the mixers.
//
// Depth L2: the line self is B1's line rule in floats on the line engine (honeycomb-exact for a state on one line);
// the ball gates are the exact R = 4 ball with sparse branches.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
} from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import { lineReader, type Coin } from '@/code/measure/cold-line'
import {
  ConeCap,
  addAmp,
  coneBeat,
  coneBoundCount,
  coneNorm,
  coneStart,
  coneStore,
  mixPass,
  type ConeStore,
} from '@/code/measure/cone-line'
import { crossDockRun, loneWeights, type DockEnv } from '@/code/measure/cross-line-dock'
import {
  newSparseTally,
  physical,
  sparseBeat,
  sparseStart,
  type SparseState,
} from '@/code/measure/cross-ball'
import {
  ballParts,
  ballRetention,
  closureDockRun,
  closureOf,
  configsOf,
  freeLove,
  freeNull,
  readSelf,
  regionRetention,
  supportOf,
  type BallTerm,
  type SelfReading,
} from '@/code/measure/self-reader'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { lockedTables, type LockedTables } from '@/code/rule/doublet-locked-knit'
import type { CrossOptions } from '@/code/rule/cross-line-pieces'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { SWAP_ANGLE, type RingUnit } from '@/code/rule/swap-mixer'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

const RECORDED = { energy: 0.33001851839229945 }

// 0020's line self (clock 14): L(1), L(2); E-SLF-0186's P0 L(2) and main L_C(2) (clock 18); E-SLF-0185's L(2)
const L_0020 = [0.917, 0.959]
const P0_0186 = 0.9524
const MAIN_0186 = 0.8868
const MIX_0185: Record<string, number> = {
  'F-G': 0.221,
  'F-L': 0.015,
  'R-w': 0.414,
  'R-w2': 0.421,
  'R-1': 0.303,
  'R-star': 0.304,
}
const REF_TOL = 1e-3
const TOL = 1e-12
const NORM_TOL = 1e-9
const HOLD = 0.9
const WINDOW = 2
const PI9 = 18
const PI7 = 14
const SAMPLES = [0, 1, 2, 4, 8, 16, 32, 64, 96]

const D0 = LINE_FIRSTS[0]!
const LINE_L = LINE_OF[D0]!
const BARE_RULE: CrossOptions = { sign: false, cost: false, clock: PI9, place: 'split' }

// ---- the dock mixers' on-line blocks (E-SLF-0185, note/line-confinement.md section 4) ----

type Mixer = { name: string; lone: Coin; full: [number, number] }

const SQ3 = Math.sqrt(3)

function ringMixer(name: string, u: RingUnit): Mixer {
  const ur = (Number(u.num[0]) - Number(u.num[1]) / 2) / Number(u.den)
  const ui = ((Number(u.num[1]) * SQ3) / 2) / Number(u.den)
  const hr = (ur - 1) / 24
  const hi = ui / 24

  return {
    name,
    lone: [
      [1 + hr, hi],
      [hr, hi],
    ],
    full: [1 + 2 * hr, 2 * hi],
  }
}

const MIXERS: readonly Mixer[] = [
  { name: 'F-G', lone: [[0.75, 0], [-0.25, 0]], full: [1, 0] },
  { name: 'F-L', lone: [[0.75, 0], [-0.25, 0]], full: [0.5, 0] },
  ringMixer('R-w', { num: [0n, 1n], den: 1n }),
  ringMixer('R-w2', { num: [-1n, -1n], den: 1n }),
  ringMixer('R-1', { num: [-1n, 0n], den: 1n }),
  ringMixer('R-star', SWAP_ANGLE),
]

// ---- the ball ----

type Ball = {
  radius: number
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

  return { radius, cells, tables, nb: (x, d) => m.mesh.neighbour(x, d) }
}

// the docks of the mesh line through dock 0 along slot `dir`: position -> dock and dock -> position
function lineDocks(ball: Ball, dir: number): { dockAt: Map<number, number>; pos: Map<number, number> } {
  const pos = new Map<number, number>([[0, 0]])

  for (const [d, step] of [[dir, 1], [OPPOSITE[dir]!, -1]] as const) {
    let x = ball.nb(0, d)
    let p = step

    while (x >= 0) {
      pos.set(x, p)
      x = ball.nb(x, d)
      p += step
    }
  }

  return { dockAt: new Map([...pos].map(([x, p]) => [p, x])), pos }
}

type BallStart = { slots: number[]; values: number[]; re: number; im: number }

// the bare working rule (split coin) on the sparse ball from a sum of configurations: the terms at beats 0..beats
function ballRun(ball: Ball, starts: readonly BallStart[], beats: number): { per: BallTerm[][]; kFired: number; frontier: number } {
  const per: Map<string, BallTerm>[] = Array.from({ length: beats + 1 }, () => new Map())
  const tally = newSparseTally()

  for (const p of starts) {
    let s: SparseState = sparseStart(p.slots, p.values, new Map())

    for (let t = 0; t <= beats; t++) {
      if (t > 0) {
        s = sparseBeat(BARE_RULE, ball.tables, s, t - 1, tally)
      }

      for (const [key, term] of s) {
        const [ar, ai] = physical(term, PI9)
        const o = per[t]!.get(key) ?? { slots: term.slots, values: term.values, re: 0, im: 0 }

        o.re += p.re * ar - p.im * ai
        o.im += p.re * ai + p.im * ar
        per[t]!.set(key, o)
      }
    }
  }

  return { per: per.map(m => [...m.values()]), kFired: tally.kFired, frontier: tally.frontier }
}

// W0's env: the first (s, m') in W0's search order where K at a dock with l single on D0 moves m' off its line
function findEnv(): DockEnv {
  const dock = new Int8Array(24)
  const perm = new Int32Array(24)

  for (let s = 0; s < 24; s++) {
    if (LINE_OF[s] === LINE_L) {
      continue
    }

    for (let lm = 0; lm < 12; lm++) {
      if (lm === LINE_L || lm === LINE_OF[s]) {
        continue
      }

      dock.fill(0)
      dock[D0] = 1
      dock[s] = 1
      dock[LINE_FIRSTS[lm]!] = 1
      dock[OPPOSITE[LINE_FIRSTS[lm]!]!] = 1

      if (bouncePermutation(BOUNCE_TABLE, 'pass', dock, 0, perm) === 1 && LINE_OF[perm[LINE_FIRSTS[lm]!]!] !== lm) {
        return { first: D0, single: s, full: lm }
      }
    }
  }

  throw new Error('self-reader: no W0 env')
}

// B1's level cut to 3 docks (positions -1..1), renormalized (E-SLF-0186's cut start)
type Cut = { ts: [number, number][]; re: number; im: number }[]

function cutLevel(placed: readonly Placed[]): Cut {
  const kept = placed.filter(p => Math.max(...p.ts.map(t => t[0])) <= 2 && p.re ** 2 + p.im ** 2 > 0)
  const w = Math.sqrt(kept.reduce((s, p) => s + p.re ** 2 + p.im ** 2, 0))

  return kept.map(p => ({ ts: p.ts.map(([x, j]) => [x - 1, j] as [number, number]), re: p.re / w, im: p.im / w }))
}

// the cut start on the line through dock 0 along slot `fwd` (label 0 on fwd)
function cutOnBall(ball: Ball, cut: Cut, fwd: number, value: number, reverse: boolean): { starts: BallStart[]; inRegion: (s: number) => boolean } {
  const { dockAt } = lineDocks(ball, fwd)
  const region = new Set([-1, 0, 1].map(p => dockAt.get(p)!))
  const starts = cut.map(p => {
    const slots = p.ts.map(([x, j]) => dockAt.get(x)! * 24 + (j === 0 ? fwd : OPPOSITE[fwd]!))

    return {
      slots: reverse ? [...slots].reverse() : slots,
      values: slots.map(() => value),
      re: p.re,
      im: p.im,
    }
  })

  return { starts, inRegion: s => region.has(Math.floor(s / 24)) }
}

// ---- settings ----

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  W: number
  T: number
  cap: number
  ballRadius: number
}

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, W: 10, T: 12, cap: 1e7, ballRadius: 3 }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, W: 12, T: 96, cap: 1.5e8, ballRadius: 4 }

const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))
const ex = (x: number): string => (Number.isFinite(x) ? x.toExponential(1) : String(x))
const maxAbs = (xs: readonly number[]): number => xs.reduce((m, x) => Math.max(m, Math.abs(x)), 0)

export default experiment({
  id: 'selves/self-reader',
  code: 'E-SLF-0187',
  title:
    "the information-closure self reader: a region of whole docks is a self when its present alone implies its past (the complement put back to its self-free run, the rule run back) at least twice as long as its members would as free loves; checked on B1's line self over 96 beats of the line engine, the empty vacuum, a lone love and the 24 line orientations on the exact R = 4 ball, then read on E-SLF-0186's shared-dock arm and E-SLF-0185's dock mixers",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.SELF_SWEEP === 'full' ? FULL : SMOKE
    const full = setting.name === 'full'
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const env = findEnv()

    // ---- C1, the level ----
    const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
    const gC1 = levelOff <= setting.levelBar
    const { W } = setting
    const read = Math.floor((W - 1) / 2)
    const fit = fitRing(placed, W).kept
    const width = widthOf(W, fit)

    log('C1')

    // ---- the two-beat arms (E-SLF-0186's line engine) ----
    const line = Math.max(64, width + 2 * WINDOW + 8)
    const offset = WINDOW + 2
    const rd = lineReader(placed, line, read, false)
    const make = (clock: number): ConeStore =>
      coneStart({ n: 3, line, cap: setting.cap, W, placed: fit, bath: [], offset, clock }).store
    const [lo, hi] = supportOf(make(PI9))
    const lone = loneWeights(make(PI9))
    const top = Math.max(...lone.values())
    const xs = [...lone.entries()].filter(([, w]) => w >= 1e-3 * top).map(([x]) => x).sort((a, b) => a - b)
    const xStar = [...lone.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0]
    const ref = (X: number, e: DockEnv | undefined) =>
      crossDockRun({ start: make(PI9), X, env: e, beats: WINDOW, rd, collision: 'pass', spanBar: 2 })
    const mine = (X: number, e: DockEnv | undefined) =>
      closureDockRun({ start: make(PI9), X, env: e, beats: WINDOW, rd, collision: 'pass', lo, hi })
    const p0 = ref(0, undefined)
    const kMain = ref(xStar, env)
    const lineArm = mine(0, undefined)
    const mainArm = mine(xStar, env)
    const Lof = (F: readonly number[]): number[] => F.map(f => f / F[0]!)
    const LP0 = Lof(p0.F)
    const LC = Lof(kMain.F)
    const fSame = Math.max(
      maxAbs(lineArm.F.map((f, i) => f - p0.F[i]!)),
      maxAbs(mainArm.F.map((f, i) => f - kMain.F[i]!)),
    )
    // I0 (line): the K variant with no env equals r_A^2
    const i0Line = maxAbs(lineArm.c.map((c, i) => c - lineArm.inside[i]! ** 2))

    log(`arms: P0 L ${LP0.map(f4).join(' ')}, main L ${LC.map(f4).join(' ')}, c ${mainArm.c.map(f4).join(' ')}`)

    const profile = xs.map(X => {
      const r = X === xStar ? mainArm : mine(X, env)

      return { X, L2: r.F[WINDOW]! / r.F[0]!, kappa: Math.sqrt(r.c[WINDOW]!), fired: r.fired, envs: r.envs }
    })

    log('profile')

    // ---- the mixers (E-SLF-0185, clock 14) ----
    const mixRead = (m: Mixer | undefined) => {
      let a = make(PI7)

      const F0 = coneBoundCount(a, rd)

      for (let t = 1; t <= WINDOW; t++) {
        if (m) {
          mixPass(a, m.lone, m.full)
        }

        const b = coneStore(a.n, a.line, a.cap, a.clock)

        coneBeat(a, b, true)
        a = b
      }

      const r = regionRetention(a, lo, hi)

      return { name: m?.name ?? 'bare', L2: coneBoundCount(a, rd) / F0, kappa: r, norm: coneNorm(a) }
    }
    const mixers = [mixRead(undefined), ...MIXERS.map(mixRead)]
    const mixOff = full ? Math.max(...mixers.filter(m => m.name !== 'bare').map(m => Math.abs(m.L2 - MIX_0185[m.name]!))) : NaN

    log(`mixers ${mixers.map(m => `${m.name} L ${f4(m.L2)} kappa ${f4(m.kappa)}`).join('; ')}`)

    // ---- F0: the free-null tensor against the determinant sum, on the cut start ----
    const cut = cutLevel(placed)
    const cutStore = coneStore(3, line, 1e6, PI7)
    const mid = Math.floor(line / 2)

    for (const p of cut) {
      addAmp(cutStore, Int32Array.from(p.ts.map(([x, j]) => 2 * (mid + x) + (j === 0 ? 1 : 0)).sort((a, b) => a - b)), p.re, p.im)
    }

    const f0 = freeNull({ psi: configsOf(cutStore), line, lo: mid - 1, hi: mid + 1, beats: WINDOW, checkBeat: WINDOW })
    const f0Off = Math.abs(f0.r0[WINDOW]! - f0.direct!)

    log(`F0 ${ex(f0Off)}`)

    // ---- S1: the line self over T beats ----
    const T = setting.T
    const longLine = width + 2 * T + 12
    const longOff = T + 5
    const rdLong = lineReader(placed, longLine, read, false)
    let a = coneStart({ n: 3, line: longLine, cap: setting.cap, W, placed: fit, bath: [], offset: longOff, clock: PI7 }).store
    const psi = configsOf(a)
    const [llo, lhi] = supportOf(a)
    const F0 = coneBoundCount(a, rdLong)
    const r = [regionRetention(a, llo, lhi)]
    const Ls = new Map<number, number>([[0, 1]])

    let normDrift = Math.abs(coneNorm(a) - 1)
    let reach = 0

    for (let t = 1; t <= T; t++) {
      const b = coneStore(a.n, a.line, a.cap, a.clock)

      try {
        coneBeat(a, b, true)
      } catch (err) {
        if (err instanceof ConeCap) {
          break
        }

        throw err
      }

      a = b
      reach = t
      r.push(regionRetention(a, llo, lhi))

      if (SAMPLES.includes(t) || t === T) {
        Ls.set(t, coneBoundCount(a, rdLong) / F0)
        normDrift = Math.max(normDrift, Math.abs(coneNorm(a) - 1))
        log(`S1 beat ${t}: r ${f4(r[t]!)}, L ${f4(Ls.get(t)!)}, store ${a.used}`)
      }
    }

    const c = r.map(x => x * x)
    const fn = freeNull({ psi, line: longLine, lo: llo, hi: lhi, beats: reach })
    const c0 = fn.r0.map(x => x * x)
    const s1 = readSelf(3, c, c0)
    const gNorm = normDrift <= NORM_TOL
    const gB0 =
      !full ||
      (L_0020.every((x, i) => Math.abs(Ls.get(i + 1)! - x) <= REF_TOL) &&
        Math.abs(LP0[WINDOW]! - P0_0186) <= REF_TOL &&
        Math.abs(LC[WINDOW]! - MAIN_0186) <= REF_TOL &&
        fSame <= TOL &&
        mixOff <= REF_TOL)

    log(`S1 ${s1.reason}`)

    // ---- the ball ----
    const R = setting.ballRadius
    const ball = ballOf(R)
    const loneBeats = R - 1
    const cutBeats = R - 2

    log('ball')

    // N1 and S3: a lone love on each slot of dock 0
    const fl = 2 * R + 10
    const fo = R + 5
    let n1 = 0
    let s3Off = 0
    let s3Frontier = 0
    const s3: SelfReading[] = []

    for (let d = 0; d < 24; d++) {
      const { pos } = lineDocks(ball, d)
      const run = ballRun(ball, [{ slots: [d], values: [1], re: 1, im: 0 }], loneBeats)
      const free = freeLove(fl, 2 * fo + 1, loneBeats)
      const inRegion = (s: number): boolean => Math.abs(pos.get(Math.floor(s / 24)) ?? 99) <= 1
      const cs: number[] = []
      const c0s: number[] = []

      s3Frontier += run.frontier

      for (let t = 0; t <= loneBeats; t++) {
        const byPos = new Map<number, number>()

        for (const term of run.per[t]!) {
          const p = pos.get(Math.floor(term.slots[0]! / 24))

          if (p === undefined) {
            n1 = Infinity
            continue
          }

          byPos.set(p, (byPos.get(p) ?? 0) + term.re ** 2 + term.im ** 2)
        }

        let inside = 0

        for (let p = -fo; p < fl - fo; p++) {
          const x = fo + p
          const v = free[t]!
          const w = v[4 * x]! ** 2 + v[4 * x + 1]! ** 2 + v[4 * x + 2]! ** 2 + v[4 * x + 3]! ** 2

          n1 = Math.max(n1, Math.abs(w - (byPos.get(p) ?? 0)))

          if (Math.abs(p) <= 1) {
            inside += w
          }
        }

        cs.push(closureOf(ballParts(run.per[t]!, inRegion)).c)
        c0s.push(inside * inside)
      }

      s3Off = Math.max(s3Off, maxAbs(cs.map((x, i) => x - c0s[i]!)))
      s3.push(readSelf(1, cs, c0s))
    }

    const gN1 = n1 <= TOL
    // the gate as recorded: c = c0 and tau_c < 2 tau_0 on every slot (readSelf's decidability bar, tau_0 <= T/2, is
    // for S1's run; on 3 beats a lone love's tau_0 is at least 2, so the bar alone would leave every slot undecided)
    const gS3 = s3Off <= TOL && s3.every(x => x.tauC < 2 * x.tau0)

    log(`N1 ${ex(n1)}; S3 off ${ex(s3Off)}, ${s3[0]!.reason}`)

    // S2: the empty vacuum
    let vacuumC: number[] = []

    try {
      const run = ballRun(ball, [{ slots: [], values: [], re: 1, im: 0 }], loneBeats)

      vacuumC = run.per.map(terms => closureOf(ballParts(terms, () => true)).c)
    } catch (err) {
      vacuumC = [NaN]
      log(`S2 run: ${(err as Error).message}`)
    }

    const s2 = readSelf(0, vacuumC, vacuumC)
    const gS2 = s2.self === false

    // I0: the general formula against r_A^2, the cut start on l and W0's dock
    const cutL = cutOnBall(ball, cut, D0, 1, false)
    const cutRun = ballRun(ball, cutL.starts, cutBeats)
    const i0Cut = maxAbs(cutRun.per.map(terms => closureOf(ballParts(terms, cutL.inRegion)).c - ballRetention(terms, cutL.inRegion) ** 2))
    const w0Beats = Math.min(2, R - 1)
    const lDocks = lineDocks(ball, D0)
    const w0Region = new Set([-1, 0, 1].map(p => lDocks.dockAt.get(p)!))
    const w0In = (s: number): boolean => w0Region.has(Math.floor(s / 24))
    const w0Slots = [D0, env.single, LINE_FIRSTS[env.full]!, OPPOSITE[LINE_FIRSTS[env.full]!]!]
    const w0Run = ballRun(ball, [{ slots: w0Slots, values: w0Slots.map(() => 1), re: 1, im: 0 }], w0Beats)
    const w0C = w0Run.per.map(terms => closureOf(ballParts(terms, w0In)).c)
    const i0W0 = maxAbs(w0Run.per.map((terms, t) => w0C[t]! - ballRetention(terms, w0In) ** 2))
    const gI0 = i0Cut <= TOL && i0W0 <= TOL && i0Line <= TOL && w0Run.kFired > 0

    log(`I0 cut ${ex(i0Cut)}, W0 ${ex(i0W0)} (K fired ${w0Run.kFired}), line ${ex(i0Line)}`)

    // S4: the cut start on every line and orientation, C, and the members' order
    const cutClosure = (fwd: number, value: number, reverse: boolean): number[] => {
      const s = cutOnBall(ball, cut, fwd, value, reverse)

      return ballRun(ball, s.starts, cutBeats).per.map(terms => closureOf(ballParts(terms, s.inRegion)).c)
    }
    const refC = cutClosure(D0, 1, false)
    let s4 = 0

    for (let k = 0; k < 12; k++) {
      for (const fwd of [LINE_FIRSTS[k]!, OPPOSITE[LINE_FIRSTS[k]!]!]) {
        s4 = Math.max(s4, maxAbs(cutClosure(fwd, 1, false).map((x, i) => x - refC[i]!)))
      }
    }

    s4 = Math.max(
      s4,
      maxAbs(cutClosure(D0, -1, false).map((x, i) => x - refC[i]!)),
      maxAbs(cutClosure(D0, 1, true).map((x, i) => x - refC[i]!)),
    )

    const gS4 = s4 <= TOL

    log(`S4 ${ex(s4)} (c ${refC.map(f4).join(' ')})`)

    // ---- the verdict ----
    const gF0 = f0Off <= TOL
    const instrument = gC1 && gB0 && gN1 && gI0 && gF0 && gNorm
    const definition = [s1.self === true, gS2, gS3, gS4]
    const status: 'pass' | 'fail' | 'open' =
      !full || !instrument
        ? 'open'
        : definition.every(Boolean)
          ? 'pass'
          : s1.self === false || !gS2 || !gS3 || !gS4
            ? 'fail'
            : 'open'
    const kMainKappa = Math.sqrt(mainArm.c[WINDOW]!)
    const survives = (kappa: number, L2: number): string =>
      L2 >= HOLD ? 'L held' : kappa >= HOLD ? 'SURVIVES' : 'drops'
    const sample = (series: readonly number[]): string =>
      SAMPLES.filter(t => t < series.length).map(t => `${t}:${f4(series[t]!)}`).join(' ')

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_B0: gB0 ? 1 : 0,
      gate_N1: gN1 ? 1 : 0,
      gate_I0: gI0 ? 1 : 0,
      gate_F0: gF0 ? 1 : 0,
      gate_norm: gNorm ? 1 : 0,
      gate_S1: s1.self === true ? 1 : 0,
      gate_S2: gS2 ? 1 : 0,
      gate_S3: gS3 ? 1 : 0,
      gate_S4: gS4 ? 1 : 0,
      levelOff,
      reach,
      tau_c: s1.tauC,
      tau_0: s1.tau0,
      line_L1: Ls.get(1) ?? NaN,
      line_L2: Ls.get(2) ?? NaN,
      line_LT: Ls.get(reach) ?? NaN,
      line_cT: c[reach]!,
      line_c0T: c0[reach]!,
      P0_L2: LP0[WINDOW]!,
      main_L2: LC[WINDOW]!,
      main_kappa2: kMainKappa,
      main_fired: mainArm.fired,
      line_kappa2: Math.sqrt(lineArm.c[WINDOW]!),
      n1,
      i0Cut,
      i0W0,
      i0Line,
      f0Off,
      s3Off,
      s4,
      normDrift,
      seconds: (Date.now() - started) / 1000,
    }

    for (const m of mixers) {
      const p = m.name.replace('-', '')

      metrics[`${p}_L2`] = m.L2
      metrics[`${p}_kappa2`] = m.kappa
    }

    return verdict({
      status,
      claim: `${setting.name} setting, W ${W} k 3. S1, B1's line self on the line engine (clock 14, split, region docks ${llo - longOff}..${lhi - longOff} of the start, ${lhi - llo + 1} docks) to beat ${reach}: c ${sample(c)}; free-love null c0 ${sample(c0)}; L ${[...Ls].map(([t, x]) => `${t}:${f4(x)}`).join(' ')}; ${s1.self === true ? 'A SELF' : s1.self === false ? 'NOT A SELF' : 'UNDECIDED'} (${s1.reason}). S2 vacuum: ${s2.reason}, c ${vacuumC.map(f4).join(' ')}. S3 lone love (24 slots, R ${R}): c equal to its free null within ${ex(s3Off)}, ${s3[0]!.reason}. S4 the cut start's c ${refC.map(f4).join(' ')} over 24 line orientations, C and order within ${ex(s4)}. APPLY, kappa(2) = sqrt c(2) against L(2): E-SLF-0186 line arm (P0, clock 18) kappa ${f4(Math.sqrt(lineArm.c[WINDOW]!))} L ${f4(LP0[WINDOW]!)}; main arm (K at shared dock X* ${xStar - offset}, W0's env slot ${env.single} line ${env.full}) kappa ${f4(kMainKappa)} L ${f4(LC[WINDOW]!)} (K fired on ${f4(mainArm.fired)}, ${mainArm.envs} env outcomes, region weight with any env ${f4(mainArm.inside[WINDOW]!)}): ${survives(kMainKappa, LC[WINDOW]!)}; profile over ${profile.length} docks ${profile.map(p => `${p.X - offset}:${f4(p.kappa)}/${f4(p.L2)}`).join(' ')} (kappa/L); E-SLF-0185 (clock 14) ${mixers.map(m => `${m.name} kappa ${f4(m.kappa)} L ${f4(m.L2)} ${survives(m.kappa, m.L2)}`).join('; ')}.`,
      metrics,
      notes: `L2. Setting ${setting.name}${full ? '' : ' (proves the file runs; not evidence, status open by rule)'}. Gates: C1 ${gC1} (level off ${ex(levelOff)}); B0 ${gB0} (L(1), L(2) ${f4(Ls.get(1) ?? NaN)} ${f4(Ls.get(2) ?? NaN)} against ${L_0020.join(' ')}; P0 ${f4(LP0[WINDOW]!)} against ${P0_0186}; main ${f4(LC[WINDOW]!)} against ${MAIN_0186}; K variant F off ${ex(fSame)}; mixers off 0185 by ${ex(mixOff)}); N1 ${gN1} (${ex(n1)}); I0 ${gI0} (cut ${ex(i0Cut)}, W0 dock ${ex(i0W0)} with K fired ${w0Run.kFired}, line ${ex(i0Line)}); F0 ${gF0} (${ex(f0Off)}); norm ${gNorm} (${ex(normDrift)}); S1 ${s1.self} (tau_c ${s1.tauC}, tau_0 ${s1.tau0}, reach ${reach}); S2 ${gS2}; S3 ${gS3} (frontier hits ${s3Frontier}); S4 ${gS4}. In a calm complement c = r_A^2 (note/self-reader.md section 2, checked by I0), so the line self's c is read as r_A^2 every beat. The arms are a two-beat window (Lemma W and cross-line-dock's argument), where tau_c cannot be read; kappa(2) is the region's recoverable weight. The free null is the working rule's one-love walk as free fermions (no drift cost, no meeting phase).`,
    })
  },
})
