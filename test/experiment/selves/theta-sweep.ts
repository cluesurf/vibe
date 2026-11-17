// F-G AT A STRENGTH theta (item vibe-roadmap-grounding-0025; future-models.md family 2; board decision 013). E-FRC-0321
// selected the frame mixer F-G for motion (one lone love passes sqrt 2 on the R = 4 ball within the horizon), and
// E-SLF-0185 found that at full strength it drains B1's line self in under 2 beats. The report on self persistence in
// reversible dynamics (avenue 4) asks whether a weaker mixer opens a prethermal gap: a lifetime that grows as
// exp(c / theta), so a log lifetime that is a straight line against 1/theta. Here F-G gets an opt-in strength.
//
// THE PIECE. On a lone frame (one open vibe in a frame of 8 slots), G_theta = I + (u - 1) P_u, P_u the frame's
// uniform-mode projector and u = e^(i theta): keep 1 + (u - 1)/8, each other frame slot (u - 1)/8. theta = pi is F-G
// (keep 3/4, cross -1/4), theta = 0 the bare rule. It is unitary for every theta and G_theta = alpha I + beta G_pi with
// alpha = (1 + u)/2, beta = (1 - u)/2, so on one vibe its beat kernel is alpha K_bare + beta K_FG exactly.
//
// THE RING. On the unit circle Z[w][1/6] holds only the sixth roots of unity (2 is inert and 3 ramified in Q(w), so
// a / conj(a) with a over 2 and 3 is a unit), so there theta is a multiple of pi/3. Z[zeta9][1/6] holds the multiples of
// pi/9 (u = zeta18^m = (-1)^m zeta9^(5m)). The ladder is geometric with ratio 2: 8pi/9, 4pi/9, 2pi/9, pi/9, anchors 0,
// pi/3, pi. The branch code (code/rule/coined-locked-knit thetaMixBranch) carries Z[w] only, so it runs 0, pi/3 and pi,
// and X0 checks every theta on the frame exactly in Z[zeta9][1/2].
//
// GATES, fixed in the item's what before this file existed (gate dc5337b6b730, 2026-11-17): X0, X1, X3, K1, M0, R0, R1,
// R2, V; measures (a) the line self's L(t) and tau_self, the fits of log tau against 1/theta and against log theta, (b)
// W_off(4) and msd on the R = 4 ball, (c) V. Verdict: open if a gate fails; pass if some theta keeps tau_self >= 80 and
// passes (b) and V; fail otherwise. Smoke is open by rule.
//
// PREDICTION (before any code): every gate holds; tau_self about 1 (pi, 8pi/9), 2 (4pi/9), 8 (2pi/9), 30 (pi/9); log
// tau against log theta slope near -2, the 1/theta fit curved (no prethermal gap); W_off(4) about 0.0126
// sin^2(theta/2), passing only at 8pi/9 and pi; verdict fail.
//
// FULL RUN (M3, 2026-11-17, clone theta-sweep-2, 1,950 s, gate dc5337b6b730): FAIL. Every gate holds (X0, X1, X3, K1
// diff 5.6e-17 on 96 labels, M0 norm off 6.3e-14 on the 162,049-dock R = 4 ball, R0 L(2) 0.9589 least 0.9118 reach 229,
// R1 0.2214, R2 W_off(4) 0.0126 msd(4) 0.4084, V). tau_self: pi 0.80, 8pi/9 0.83, 4pi/9 2.03, pi/3 3.05, 2pi/9 8.36,
// pi/9 34.6 (all measured), bare projected 5e4. W_off(4): pi 0.0126, 8pi/9 0.0134, 4pi/9 0.0125 (motion passes at these
// three), pi/3 0.0094, 2pi/9 0.0052, pi/9 0.0015. log tau against log theta slope -1.73 (R^2 0.986), against 1/theta
// slope 1.50 (R^2 0.962): golden-rule scaling fits better, no clean prethermal gap. tau 80 needs theta near 0.197
// (golden fit), where W_off(4) would sit near 5e-4, twenty times under the motion bar. The prediction missed the motion
// curve (W_off is not sin^2(theta/2): 4pi/9 still passes).
//
// SETTINGS. Default SMOKE (box-8 level, W 10, cap 2e6, 24 line beats; the ball parts in full). THETA_SWEEP=full for the
// M3 (box-12 level, W 12, cap 1.5e8, 256 beats).
//
// GRADE. Within beats 0 to 2 the line self is honeycomb-exact (Lemma W, note/line-confinement.md section 4); after,
// the line engine is line-restricted (weight a mixer sends off the line never returns), so a later L is a model, not
// the honeycomb. Motion: honeycomb (exact R = 4 ball within its horizon). Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import { lineReader, type Coin, type LineReader } from '@/code/measure/cold-line'
import { ConeCap, coneBeat, coneBoundCount, coneStart, coneStore, mixPass, type ConeStore } from '@/code/measure/cone-line'
import {
  cloneConfiguration,
  lockedNorm,
  lockedState,
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
  loneFrames,
  mixBranch,
  setCoinPlace,
  thetaMixBranch,
} from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  BARE,
  MIXERS,
  chartBall,
  keyOf,
  readKernel,
  smallBall,
  sparseBeat,
  type Amplitudes,
  type Chart,
  type Kernel,
  type Mixer,
  type Out,
  type SmallBall,
} from '@/test/experiment/gauge/mixer-link-select'

const SLOTS = 24
const RECORDED = { energy: 0.33001851839229945 }
const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

// the reproductions (E-SLF-0185, E-SLF-0184, E-FRC-0321) and their tolerance
const BARE_L2 = 0.959
const BARE_LEAST = 0.912
const BARE_REACH = 228
const FG_L2 = 0.221
const FG_WOFF = 0.0126
const FG_MSD = 0.408
const REPRO_TOL = 5e-4

const HALF = 0.5
const STOP = 0.25
const TAU_BAR = 80
const MOTION_BEATS = 4
const OFF_LINE = Math.SQRT2 + 1e-9
const MOTION_W_OFF = 0.01
const NORM_TOL = 1e-10
const KERNEL_TOL = 1e-12
const CONTROL_TOL = 1e-12
const UNIT_TOL = 1e-9
const SUPPORT_TOL = 1e-14

// ---------------------------------------------------------------------------------------------------------------
// the strengths: theta = m pi / 9, u = zeta18^m; the Z[w] form where the branch code can run it

type Theta = { name: string; m: number; ring: readonly [bigint, bigint] | null; ladder: boolean }

const THETAS: readonly Theta[] = [
  { name: '0', m: 0, ring: [1n, 0n], ladder: false },
  { name: 'pi/9', m: 1, ring: null, ladder: true },
  { name: '2pi/9', m: 2, ring: null, ladder: true },
  { name: 'pi/3', m: 3, ring: [1n, 1n], ladder: false },
  { name: '4pi/9', m: 4, ring: null, ladder: true },
  { name: '8pi/9', m: 8, ring: null, ladder: true },
  { name: 'pi', m: 9, ring: [-1n, 0n], ladder: false },
]

const angleOf = (t: Theta): number => (t.m * Math.PI) / 9
const uOf = (t: Theta): [number, number] => [Math.cos(angleOf(t)), Math.sin(angleOf(t))]

// ---------------------------------------------------------------------------------------------------------------
// X0: Z[zeta9][1/2], c[0..5] on the integral basis 1, z, ..., z^5 over 2^k, z^6 = -z^3 - 1

type Cyc = { c: bigint[]; k: number }

const cyc = (c: readonly bigint[], k = 0): Cyc => ({ c: reduce([...c]), k })

function reduce(c: bigint[]): bigint[] {
  const out = [...c]

  for (let d = out.length - 1; d >= 6; d--) {
    const x = out[d]!

    if (x === 0n) {
      continue
    }

    out[d] = 0n
    out[d - 3] = (out[d - 3] ?? 0n) - x
    out[d - 6] = (out[d - 6] ?? 0n) - x
  }

  return Array.from({ length: 6 }, (_, i) => out[i] ?? 0n)
}

const lift = (a: Cyc, k: number): bigint[] => a.c.map(x => x << BigInt(k - a.k))

function add(a: Cyc, b: Cyc): Cyc {
  const k = Math.max(a.k, b.k)
  const x = lift(a, k)
  const y = lift(b, k)

  return { c: x.map((v, i) => v + y[i]!), k }
}

function mul(a: Cyc, b: Cyc): Cyc {
  const c = new Array<bigint>(11).fill(0n)

  a.c.forEach((x, i) => b.c.forEach((y, j) => (c[i + j]! += x * y)))

  return { c: reduce(c), k: a.k + b.k }
}

// z^i -> z^(9 - i)
function conj(a: Cyc): Cyc {
  const c = new Array<bigint>(10).fill(0n)

  a.c.forEach((x, i) => (c[i === 0 ? 0 : 9 - i]! += x))

  return { c: reduce(c), k: a.k }
}

function same(a: Cyc, b: Cyc): boolean {
  const k = Math.max(a.k, b.k)
  const x = lift(a, k)
  const y = lift(b, k)

  return x.every((v, i) => v === y[i])
}

const ZERO = cyc([0n])
const ONE = cyc([1n])

// zeta18^m = (-1)^m zeta9^(5m mod 9)
function zeta18(m: number): Cyc {
  const e = (((5 * m) % 9) + 9) % 9
  const c = new Array<bigint>(10).fill(0n)

  c[e] = m % 2 === 0 ? 1n : -1n

  return cyc(c)
}

type Matrix = Cyc[][]

// G for a given u on the 8 frame slots: delta + (u - 1)/8
const frameG = (u: Cyc): Matrix =>
  Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: 8 }, (_, j) => {
      const h = add(u, cyc([-1n]))

      return add(i === j ? ONE : ZERO, { c: h.c, k: h.k + 3 })
    }),
  )

const matMul = (a: Matrix, b: Matrix): Matrix =>
  a.map(row => b[0]!.map((_, j) => row.reduce((s, x, l) => add(s, mul(x, b[l]![j]!)), ZERO)))

const dagger = (a: Matrix): Matrix => a.map((row, i) => row.map((_, j) => conj(a[j]![i]!)))

const isIdentity = (a: Matrix): boolean => a.every((row, i) => row.every((x, j) => same(x, i === j ? ONE : ZERO)))

type ExactFrame = { theta: string; unitary: boolean; inverse: boolean; combination: boolean }

function exactFrame(t: Theta): ExactFrame {
  const u = zeta18(t.m)
  const G = frameG(u)
  const Gpi = frameG(cyc([-1n]))
  const alpha = { ...add(ONE, u), k: add(ONE, u).k + 1 }
  const minus = add(ONE, mul(cyc([-1n]), u))
  const beta = { ...minus, k: minus.k + 1 }
  const combination = G.every((row, i) =>
    row.every((x, j) => same(x, add(mul(alpha, i === j ? ONE : ZERO), mul(beta, Gpi[i]![j]!)))),
  )

  return {
    theta: t.name,
    unitary: isIdentity(matMul(G, dagger(G))),
    inverse: isIdentity(matMul(G, frameG(conj(u)))),
    combination,
  }
}

// ---------------------------------------------------------------------------------------------------------------
// the branch code: X1, X3, V

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

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

function loves(cells: number, at: readonly (readonly [number, number])[]): Configuration {
  const c = empty(cells)

  for (const [x, d] of at) {
    c.vibe[x * 24 + d] = 1
    c.open[x * 24 + d] = 1
  }

  return c
}

type Mix = (cells: number, br: Branch, adjoint: boolean) => Branch[]

const thetaMix =
  (u: readonly [bigint, bigint]): Mix =>
  (cells, br, adjoint) =>
    thetaMixBranch(cells, br, u, adjoint)

function beatWith(mix: Mix, t: LockedTables, s: LockedState, beat: number): LockedState {
  const mixed = mergeBranches(s.branches.flatMap(b => mix(t.cells, cloneBranch(b), false)))

  return coinedVetoBeat('none', t, { branches: mixed }, beat)
}

function backWith(mix: Mix, t: LockedTables, s: LockedState, beat: number): LockedState {
  const back = coinedVetoBeatBack('none', t, s, beat)

  return { branches: mergeBranches(back.branches.flatMap(b => mix(t.cells, cloneBranch(b), true))) }
}

// the branches of a minus b, merged: 0 exactly when a = b
function differ(a: readonly Branch[], b: readonly Branch[]): number {
  const neg = b.map(x => {
    const y = cloneBranch(x)

    y.a = -x.a
    y.b = -x.b

    return y
  })

  return mergeBranches([...a.map(cloneBranch), ...neg]).length
}

type Reversal = { theta: string; start: string; beats: number; equal: boolean; norm: boolean }

function reversal(name: string, mix: Mix, ball: SmallBall, start: string, c: Configuration, beats: number): Reversal {
  let s = lockedState(c)

  for (let t = 0; t < beats; t++) {
    s = beatWith(mix, ball.tables, s, t)
  }

  const n = lockedNorm(s)
  const norm = n.total === n.unit

  for (let t = beats - 1; t >= 0; t--) {
    s = backWith(mix, ball.tables, s, t)
  }

  return { theta: name, start, beats, equal: differ(s.branches, lockedState(c).branches) === 0, norm }
}

type Vacuum = { theta: string; beats: number; lone: number; branches: number; differ: number; unit: boolean }

// V: the empty ball under the theta beat. A theta without a Z[w] form acts as the identity wherever no frame is lone,
// so its orbit is the bare orbit with every lone-frame count 0
function vacuum(t: Theta, ball: SmallBall): Vacuum {
  const mix: Mix = t.ring ? thetaMix(t.ring) : (_cells, br) => [br]
  const start = lockedState(empty(ball.cells))

  let s = start
  let lone = 0
  let branches = 0

  for (let b = 0; b < MOTION_BEATS; b++) {
    lone += s.branches.reduce((n, br) => n + loneFrames(ball.cells, br).length, 0)
    s = beatWith(mix, ball.tables, s, b)
    branches = Math.max(branches, s.branches.length)
  }

  lone += s.branches.reduce((n, br) => n + loneFrames(ball.cells, br).length, 0)

  const n = lockedNorm(s)

  return {
    theta: t.name,
    beats: MOTION_BEATS,
    lone,
    branches,
    differ: differ(s.branches, start.branches),
    unit: n.total === n.unit,
  }
}

// ---------------------------------------------------------------------------------------------------------------
// motion: the kernel alpha K_bare + beta K_FG on the R = 4 ball

type Mul = [number, number]

const cmul = (a: Mul, b: Mul): Mul => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]

function combined(bare: Kernel, fg: Kernel, u: Mul, asked: Set<string>): Kernel {
  const alpha: Mul = [(1 + u[0]) / 2, u[1] / 2]
  const beta: Mul = [(1 - u[0]) / 2, -u[1] / 2]
  const cache = new Map<string, Out[]>()

  return {
    get(beat, slot, point, open) {
      const id = `${beat}:${slot}:${point}:${open}`
      const hit = cache.get(id)

      if (hit) {
        return hit
      }

      asked.add(id)

      const sum = new Map<string, Out>()
      const put = (o: Out, c: Mul): void => {
        const key = `${o.dir}:${o.slot}:${o.point}:${o.open}`
        const old = sum.get(key) ?? { ...o, re: 0, im: 0 }
        const [re, im] = cmul([o.re, o.im], c)

        sum.set(key, { ...old, re: old.re + re, im: old.im + im })
      }

      for (const o of bare.get(beat, slot, point, open)) {
        put(o, alpha)
      }

      for (const o of fg.get(beat, slot, point, open)) {
        put(o, beta)
      }

      const outs = [...sum.values()].filter(o => o.re !== 0 || o.im !== 0)

      cache.set(id, outs)

      return outs
    },
    exceptions: () => bare.exceptions() + fg.exceptions(),
    reads: () => cache.size,
  }
}

// K1: the combined kernel against a kernel read from branch code, on every label the run asked
function kernelDiff(a: Kernel, b: Kernel, asked: Set<string>): { diff: number; mismatches: number; labels: number } {
  let diff = 0
  let mismatches = 0

  for (const id of asked) {
    const [beat, slot, point, open] = id.split(':').map(Number) as [number, number, number, number]
    const index = (outs: Out[]): Map<string, Mul> =>
      new Map(outs.map(o => [`${o.dir}:${o.slot}:${o.point}:${o.open}`, [o.re, o.im] as Mul]))
    const x = index(a.get(beat, slot, point, open))
    const y = index(b.get(beat, slot, point, open))

    for (const key of new Set([...x.keys(), ...y.keys()])) {
      const p = x.get(key) ?? [0, 0]
      const q = y.get(key) ?? [0, 0]

      diff = Math.max(diff, Math.hypot(p[0] - q[0], p[1] - q[1]))

      if (Math.hypot(...p) > SUPPORT_TOL !== Math.hypot(...q) > SUPPORT_TOL) {
        mismatches++
      }
    }
  }

  return { diff, mismatches, labels: asked.size }
}

type Motion = {
  theta: string
  wOff: number[]
  msd: number[]
  maxShadow: number[]
  normOff: number
  frontier: number
  pass: boolean
}

function motion(name: string, kernel: Kernel, chart: Chart): Motion {
  const hits = { frontier: 0 }
  const wOff = new Array<number>(MOTION_BEATS).fill(0)
  const msd = new Array<number>(MOTION_BEATS).fill(0)
  const maxShadow = new Array<number>(MOTION_BEATS).fill(0)

  let normOff = 0

  for (let slot = 0; slot < SLOTS; slot++) {
    let a: Amplitudes = new Map([[keyOf(0, slot, 0, 1), [1, 0]]])

    for (let t = 0; t < MOTION_BEATS; t++) {
      a = sparseBeat(kernel, chart.table, a, t, hits)

      let weight = 0

      for (const [key, [re, im]] of a) {
        const w = re * re + im * im
        const x = Math.floor(key / (SLOTS * 128))
        const d = [0, 1, 2].map(i => chart.pos[x * 3 + i]! - chart.pos[i]!)
        const s = Math.hypot(d[0]!, d[1]!, d[2]!)

        weight += w
        msd[t]! += (w * s * s) / SLOTS

        if (w > SUPPORT_TOL) {
          maxShadow[t] = Math.max(maxShadow[t]!, s)
        }

        if (s > OFF_LINE) {
          wOff[t]! += w / SLOTS
        }
      }

      normOff = Math.max(normOff, Math.abs(weight - 1))
    }
  }

  const last = MOTION_BEATS - 1

  return {
    theta: name,
    wOff,
    msd,
    maxShadow,
    normOff,
    frontier: hits.frontier,
    pass: wOff[last]! >= MOTION_W_OFF && msd[last]! > msd[1]!,
  }
}

// ---------------------------------------------------------------------------------------------------------------
// the line self

type Setting = { name: 'smoke' | 'full'; box: number; levelBar: number; W: number; beats: number; cap: number }

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, W: 10, beats: 24, cap: 2e6 }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, W: 12, beats: 256, cap: 1.5e8 }

// E-SLF-0184's read beats
const readBeat = (t: number): boolean => t <= 32 || t % 8 === 0

const widthOf = (W: number, fit: readonly Placed[]): number => W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

type LineRun = {
  theta: string
  beats: number[]
  L: number[]
  reach: number
  capped: boolean
  stopped: boolean
  tau: number
  measured: boolean
  seconds: number
}

// the theta on-line block (note/line-confinement.md section 4): a single on the line keeps 1 + h, the other slot h
// (h = (u - 1)/8); a full line is two vibes in one frame, not lone, so untouched
function onLine(u: Mul): { lone: Coin; full: [number, number] } {
  const hr = (u[0] - 1) / 8
  const hi = u[1] / 8

  return {
    lone: [
      [1 + hr, hi],
      [hr, hi],
    ],
    full: [1, 0],
  }
}

function tauOf(beats: number[], L: number[]): { tau: number; measured: boolean } {
  const below = L.findIndex(x => x < HALF)

  if (below > 0) {
    const t0 = beats[below - 1]!
    const t1 = beats[below]!
    const l0 = Math.log(L[below - 1]!)
    const l1 = Math.log(L[below]!)

    return { tau: t0 + ((l0 - Math.log(HALF)) / (l0 - l1)) * (t1 - t0), measured: true }
  }

  const end = beats[beats.length - 1]!
  const late = beats.map((t, i) => [t, Math.log(L[i]!)] as const).filter(([t]) => t >= end / 2)

  if (late.length < 2) {
    return { tau: Number.NaN, measured: false }
  }

  const { slope } = fit(late.map(p => p[0]), late.map(p => p[1]))
  const lEnd = Math.log(L[L.length - 1]!)

  return { tau: slope < 0 ? end + (lEnd - Math.log(HALF)) / -slope : Infinity, measured: false }
}

function lineRun(
  t: Theta,
  first: () => ConeStore,
  setting: Setting,
  rd: LineReader,
  log: (what: string) => void,
): LineRun {
  const started = Date.now()
  const { lone, full } = onLine(uOf(t))

  let a = first()
  let b = coneStore(a.n, a.line, a.cap)
  let reach = 0
  let capped = false
  let stopped = false

  const F0 = coneBoundCount(a, rd)
  const beats = [0]
  const L = [1]

  for (let s = 1; s <= setting.beats; s++) {
    mixPass(a, lone, full)

    try {
      coneBeat(a, b, true)
    } catch (err) {
      if (err instanceof ConeCap) {
        capped = true
        break
      }

      throw err
    }

    ;[a, b] = [b, a]
    reach = s

    if (readBeat(s)) {
      beats.push(s)
      L.push(coneBoundCount(a, rd) / F0)

      if (s >= 2 && L[L.length - 1]! < STOP) {
        stopped = true
        break
      }
    }

    if (s <= 4 || s % 32 === 0) {
      log(`line ${t.name} beat ${s}: L ${L[L.length - 1]!.toFixed(4)}, ${a.used} slots`)
    }
  }

  const { tau, measured } = tauOf(beats, L)

  log(`line ${t.name}: reach ${reach}${capped ? ' (cap)' : ''}, tau ${tau.toFixed(2)} ${measured ? 'measured' : 'projected'}`)

  return { theta: t.name, beats, L, reach, capped, stopped, tau, measured, seconds: (Date.now() - started) / 1000 }
}

// least squares y = slope x + intercept, with R^2
function fit(x: readonly number[], y: readonly number[]): { slope: number; intercept: number; r2: number } {
  const n = x.length
  const mx = x.reduce((s, v) => s + v, 0) / n
  const my = y.reduce((s, v) => s + v, 0) / n
  const sxx = x.reduce((s, v) => s + (v - mx) ** 2, 0)
  const sxy = x.reduce((s, v, i) => s + (v - mx) * (y[i]! - my), 0)
  const syy = y.reduce((s, v) => s + (v - my) ** 2, 0)
  const slope = sxy / sxx
  const intercept = my - slope * mx

  return { slope, intercept, r2: syy > 0 ? (sxy * sxy) / (sxx * syy) : 1 }
}

// ---------------------------------------------------------------------------------------------------------------

export default experiment({
  id: 'selves/theta-sweep',
  code: 'E-SLF-0189',
  title:
    "F-G at a strength theta: the selected frame mixer as I + (e^(i theta) - 1) P_u, exact in Z[zeta9][1/2], swept over the geometric ladder 8pi/9, 4pi/9, 2pi/9, pi/9 with anchors 0, pi/3, pi, read for B1's line self's lifetime (log lifetime against 1/theta for a prethermal gap), one-body motion past sqrt 2 on the exact R = 4 ball, and the empty vacuum's coldness",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.THETA_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const place0 = currentCoinPlace()

    setCoinPlace('split')

    try {
      // ---- X0 ----
      const frames = THETAS.map(exactFrame)
      const gX0 = frames.every(f => f.unitary && f.inverse && f.combination)

      log('X0')

      // ---- X1, X3 ----
      const b1 = smallBall(1)
      const L1 = loves(b1.cells, [[0, D0]])
      const F1 = loves(b1.cells, [[0, D0], [0, D0_BACK]])
      const reversals: Reversal[] = []

      for (const t of THETAS) {
        if (!t.ring) {
          continue
        }

        reversals.push(reversal(t.name, thetaMix(t.ring), b1, 'L', L1, 2))
        reversals.push(reversal(t.name, thetaMix(t.ring), b1, 'F', F1, 1))
      }

      const gX1 = reversals.every(r => r.equal && r.norm)
      const fgMix: Mix = (cells, br) => mixBranch(cells, br)
      const x3 = [L1, F1].map(c =>
        differ(
          beatWith(thetaMix([-1n, 0n]), b1.tables, lockedState(c), 0).branches,
          beatWith(fgMix, b1.tables, lockedState(c), 0).branches,
        ),
      )
      const gX3 = x3.every(d => d === 0)

      log('X1 X3')

      // ---- motion, K1, M0, R2 ----
      const small = smallBall(2)
      const chart = chartBall(MOTION_BEATS)
      const FG = MIXERS.find(m => m.name === 'F-G')!
      const kBare = readKernel(BARE, small)
      const kFG = readKernel(FG, small)
      const motions: Motion[] = []

      let k1 = { diff: Number.NaN, mismatches: -1, labels: 0 }

      for (const t of THETAS) {
        const asked = new Set<string>()
        const kernel = combined(kBare, kFG, uOf(t), asked)

        motions.push(motion(t.name, kernel, chart))

        if (t.name === 'pi/3') {
          const third: Mixer = { name: 'G pi/3', mix: (cells, br) => thetaMixBranch(cells, br, [1n, 1n]), scale: 1n }

          k1 = kernelDiff(kernel, readKernel(third, small), asked)
        }

        log(`motion ${t.name}: W_off ${motions[motions.length - 1]!.wOff.map(x => x.toFixed(5)).join(' ')}`)
      }

      const gK1 = k1.diff <= KERNEL_TOL && k1.mismatches === 0 && k1.labels > 0
      const at = (x: number): number[] => [0, 1, 2].map(i => chart.pos[x * 3 + i]! - chart.pos[i]!)
      const unitOff = Math.max(...chart.layerSlots.map(s => Math.abs(Math.hypot(...at(chart.table[s]!)) - 1)))
      const pairOff = Math.max(
        ...chart.axes.map(({ slot, partner }) => {
          const p = at(chart.table[slot]!)
          const q = at(chart.table[partner]!)

          return Math.hypot(p[0]! + q[0]!, p[1]! + q[1]!, p[2]! + q[2]!)
        }),
      )
      const gH1 = chart.layerSlots.length === 6 && chart.axes.length === 3 && unitOff <= UNIT_TOL && pairOff <= UNIT_TOL
      const bareMotion = motions.find(m => m.theta === '0')!
      const fgMotion = motions.find(m => m.theta === 'pi')!
      const gM0 =
        kBare.exceptions() + kFG.exceptions() === 0 &&
        motions.every(m => m.normOff <= NORM_TOL && m.frontier === 0) &&
        bareMotion.wOff.every(w => w <= CONTROL_TOL) &&
        gH1 &&
        chart.exact
      const gR2 =
        Math.abs(fgMotion.wOff[MOTION_BEATS - 1]! - FG_WOFF) <= REPRO_TOL &&
        Math.abs(fgMotion.msd[MOTION_BEATS - 1]! - FG_MSD) <= REPRO_TOL

      // ---- V ----
      const ball4 = smallBall(MOTION_BEATS)
      const vacua = THETAS.map(t => vacuum(t, ball4))
      const gV = vacua.every(v => v.lone === 0 && v.branches === 1 && v.differ === 0 && v.unit)

      log('V')

      // ---- the line ----
      const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
      const level = lineLightest(basis, wholeBasis(basis)).lightest
      const placed = levelPlacement(basis, level.cre, level.cim)
      const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
      const { W } = setting
      const read = Math.floor((W - 1) / 2)
      const kept = fitRing(placed, W).kept
      const width = widthOf(W, kept)
      const line = Math.max(256, width + 2 * setting.beats + 2)
      const offset = setting.beats + 1
      const rd = lineReader(placed, line, read, false)
      const first = (): ConeStore =>
        coneStart({ n: 3, line, cap: setting.cap, W, placed: kept, bath: [], offset }).store

      log(`C1 level off ${levelOff.toExponential(1)}`)

      const runs = THETAS.map(t => lineRun(t, first, setting, rd, log))
      const bareRun = runs.find(r => r.theta === '0')!
      const fgRun = runs.find(r => r.theta === 'pi')!
      const bareLeast = Math.min(...bareRun.L)
      const gR0 =
        setting.name === 'full' &&
        Math.abs(bareRun.L[2]! - BARE_L2) <= REPRO_TOL &&
        Math.abs(bareLeast - BARE_LEAST) <= REPRO_TOL &&
        bareRun.reach >= BARE_REACH
      const gR1 = Math.abs((fgRun.L[2] ?? Number.NaN) - FG_L2) <= REPRO_TOL

      // ---- the fits over the ladder and pi ----
      const fitted = THETAS.map((t, i) => ({ t, r: runs[i]! })).filter(
        ({ t, r }) => (t.ladder || t.name === 'pi') && Number.isFinite(r.tau) && r.tau > 0,
      )
      const xs = fitted.map(({ t }) => angleOf(t))
      const ys = fitted.map(({ r }) => Math.log(r.tau))
      const pre = fitted.length >= 3 ? fit(xs.map(x => 1 / x), ys) : null
      const golden = fitted.length >= 3 ? fit(xs.map(Math.log), ys) : null
      const theta80 = golden && golden.slope < 0 ? Math.exp((Math.log(TAU_BAR) - golden.intercept) / golden.slope) : NaN
      const pre80 = pre && pre.slope > 0 ? 1 / ((Math.log(TAU_BAR) - pre.intercept) / pre.slope) : NaN

      // ---- verdict ----
      const gates = { X0: gX0, X1: gX1, X3: gX3, K1: gK1, M0: gM0, R0: gR0, R1: gR1, R2: gR2, V: gV }
      const instrument = Object.values(gates).every(Boolean)
      const keepers = THETAS.filter((t, i) => {
        const r = runs[i]!
        const m = motions[i]!

        return t.name !== '0' && r.tau >= TAU_BAR && m.pass && vacua[i]!.lone === 0
      }).map(t => t.name)
      const status: 'pass' | 'fail' | 'open' =
        setting.name === 'smoke' || !instrument ? 'open' : keepers.length > 0 ? 'pass' : 'fail'

      const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))
      const row = (t: Theta, i: number): string => {
        const r = runs[i]!
        const m = motions[i]!

        return `${t.name}: L(1) ${f4(r.L[1] ?? NaN)} L(2) ${f4(r.L[2] ?? NaN)}, tau_self ${f4(r.tau)} ${r.measured ? 'measured' : 'projected'} (reach ${r.reach}${r.capped ? ', cap' : ''}${r.stopped ? ', stopped below 0.25' : ''}), W_off ${m.wOff.map(x => x.toExponential(2)).join(' ')}, msd ${m.msd.map(f4).join(' ')}, motion ${m.pass ? 'PASS' : 'fail'}`
      }

      const metrics: Record<string, number> = {
        levelOff,
        k1Diff: k1.diff,
        k1Labels: k1.labels,
        bareLeast,
        bareReach: bareRun.reach,
        fitPrethermalSlope: pre?.slope ?? NaN,
        fitPrethermalR2: pre?.r2 ?? NaN,
        fitGoldenSlope: golden?.slope ?? NaN,
        fitGoldenR2: golden?.r2 ?? NaN,
        theta80Golden: theta80,
        theta80Prethermal: pre80,
        seconds: (Date.now() - started) / 1000,
      }

      for (const [k, v] of Object.entries(gates)) {
        metrics[`gate_${k}`] = v ? 1 : 0
      }

      THETAS.forEach((t, i) => {
        const p = `m${t.m}`

        metrics[`${p}_L2`] = runs[i]!.L[2] ?? NaN
        metrics[`${p}_tau`] = runs[i]!.tau
        metrics[`${p}_wOff4`] = motions[i]!.wOff[MOTION_BEATS - 1]!
        metrics[`${p}_msd4`] = motions[i]!.msd[MOTION_BEATS - 1]!
      })

      return verdict({
        status,
        claim: `${setting.name} setting, W ${W} k 3, theta = m pi/9: ${THETAS.map(row).join(' || ')} || fits over ${fitted.map(f => f.t.name).join(', ')}: log tau against 1/theta slope ${f4(pre?.slope ?? NaN)} R^2 ${f4(pre?.r2 ?? NaN)}, against log theta slope ${f4(golden?.slope ?? NaN)} R^2 ${f4(golden?.r2 ?? NaN)}; tau 80 at theta ${f4(theta80)} (golden rule fit) or ${f4(pre80)} (1/theta fit); keepers ${keepers.join(', ') || 'none'}`,
        metrics,
        notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. Gate dc5337b6b730. X0 ${gX0} (${frames.filter(f => !(f.unitary && f.inverse && f.combination)).map(f => f.theta).join(', ') || 'every theta unitary, inverse and alpha I + beta G_pi exactly in Z[zeta9][1/2]'}), X1 ${gX1} (${reversals.map(r => `${r.theta} ${r.start} ${r.equal && r.norm ? 'exact' : 'OFF'}`).join(', ')}), X3 ${gX3} (differ ${x3.join(', ')}), K1 ${gK1} (pi/3 combined kernel against the branch code on ${k1.labels} labels, diff ${k1.diff.toExponential(1)}, mismatches ${k1.mismatches}), M0 ${gM0} (kernel exceptions ${kBare.exceptions() + kFG.exceptions()}, norm off ${Math.max(...motions.map(m => m.normOff)).toExponential(1)}, frontier ${motions.reduce((s, m) => s + m.frontier, 0)}, bare W_off ${Math.max(...bareMotion.wOff).toExponential(1)}, H1 ${gH1}, R = 4 ball ${chart.cells} docks exact ${chart.exact}), R0 ${gR0} (L(2) ${f4(bareRun.L[2] ?? NaN)}, least ${f4(bareLeast)}, reach ${bareRun.reach}), R1 ${gR1} (F-G L(2) ${f4(fgRun.L[2] ?? NaN)}), R2 ${gR2} (W_off(4) ${f4(fgMotion.wOff[MOTION_BEATS - 1]!)}, msd(4) ${f4(fgMotion.msd[MOTION_BEATS - 1]!)}), V ${gV} (${vacua.map(v => `${v.theta} lone ${v.lone} branches ${v.branches} differ ${v.differ}`).join(', ')}; the vacuum is cold because G_theta acts only on a lone frame). C1 level off ${levelOff.toExponential(1)}. Line seconds ${runs.map(r => `${r.theta} ${r.seconds.toFixed(0)}`).join(', ')}. L within beats 0 to 2 is honeycomb-exact (Lemma W); later beats are line-restricted (no return of exported weight), a model.`,
      })
    } finally {
      setCoinPlace(place0)
    }
  },
})
