// THE KERNEL PARITY SUITE: many short cases, every backend, byte for byte. task/kernel/
// check.ts proves each primitive and each wired engine path equal to the reference on one fixed input each. This suite
// asks the broader question: across small engines of every kind, many parameters, edge-case states (zeros, one
// amplitude, negative zeros, values near 1e-300 and 1e300, subnormals, magnitudes mixed across 300 decades) and long runs
// (64 cycles, where an error that compounds would show), does every backend give the reference's bytes? And the readings
// the registered experiments print (replayed at reduced size, each case named after its experiment), and the invariants
// (norms, conserved weights, the free rule's Slater identity, the frozen flat modes), computed on each backend's state,
// must equal the reference's to the last bit. NOTHING HERE IS A TOLERANCE: every comparison is byte equality.
//
//   pnpm call task/kernel/parity.ts             the reference (each engine's own JavaScript) live, against every backend
//   pnpm call task/kernel/parity.ts --golden    every backend against task/kernel/parity/*.json, the reference not run
//   pnpm call task/kernel/parity.ts --write     run the reference and rewrite task/kernel/parity/*.json
//   pnpm call task/kernel/parity.ts --large     adds the L = 4 sea (1.3 s a reference cycle)
//   PARITY_BACKENDS=native:1,native:8,wasm,hip  the backends (default js, native:1, native:8, wasm, and every GPU backend
//                                               that loads); a backend named and missing is a failure
//   PARITY_ONLY=ball,holes                      keep only the cases whose id starts with one of these
//
// THE REFERENCE is each engine's own JavaScript (no kernel option), except the sorted store (register-sorted-holes),
// which runs only on a kernel and whose js backend is its reference. A backend runs a case through the engine's opt-in
// option ({ backend, threads }); a GPU backend runs it twice, through that option (the copy path: every array copied on
// and off the device each call) and with the state held on the device across the cycles (fastCycles, fastSeaCycles,
// fastHoleCycles, onDevice: the held path). The experiment replays run the copy path only, since they read the state
// every cycle.
//
// WHAT IS NOT HERE, and why: reversibility. No engine has an inverse or reversed cycle (register-ball-reduced,
// register-reduced, register-sea, register-holes and register-sorted-holes run forward only), and a reversed cycle built
// here would be new code with no reference to be equal to.
//
// The golden files keep, per case and output, the length, the sha256 of the bytes and a few values in the shortest
// decimal that reads back to the same double (with -0 kept), so a machine with no JavaScript reference run (a rented GPU)
// is checked against the same bytes. The one exception to "the same bytes" is a NaN, hashed as the canonical quiet NaN
// (see bytesOf), since x86-64 and arm64 make different NaNs from the same arithmetic.
//
// CROSS-PLATFORM, what the golden files can and cannot promise (note/research/vibe/kernel.md): the reference's Math.sin,
// cos, atan, atan2, exp, log and pow are V8's fdlibm compiled per platform, and the arm64 build fuses multiply-adds
// (clang's default contraction) where the x86-64 build cannot, so they differ in the last bit on about 1 input in 100.
// Files written on arm64 fail on x86-64 wherever a case's tables meet such an input: E-SPN-0178 and E-SPN-0179 here, the
// weak string's sin(6 tau). Every backend on one machine still matches that machine's reference to the bit.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { available, kernel, onDevice, type Backend, type KernelOptions } from '@/code/kernel/index'
import { fastBall, fastCycles } from '@/code/kernel/pair'
import { fastSeaCycles } from '@/code/kernel/sea'
import { fastHoleCycles } from '@/code/kernel/holes'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { partnerProjector48, registerPiece, scaled, singletProjector24 } from '@/code/measure/spinor-register'
import {
  ballAbsorb,
  ballCycle,
  ballEngine,
  ballFilter,
  ballGroup,
  ballInner,
  ballNorm2,
  ballProfile,
  ballRead,
  ballSector,
  ballStart,
  normalizeBall,
  type BallEngine,
  type BallSector,
  type BallState,
} from '@/code/measure/register-ball-reduced'
import { fearBallEngine } from '@/code/measure/role-register'
import {
  autocorrelation,
  cubicGroup,
  littleGroup,
  newState,
  reducedCycle,
  reducedEngine,
  reducedFilter,
  reducedInner,
  reducedNorm2,
  reducedRead,
  sector,
  type Form,
  type ReducedEngine,
  type Sector,
} from '@/code/measure/register-reduced'
import {
  FULL,
  flatCount,
  movingBlocks,
  newPair,
  pairAt,
  pairNorm,
  pairStart,
  seaCycle,
  sectorBases,
  torus,
  type Moving,
  type Pair,
  type SeaRule,
  type Torus,
} from '@/code/measure/register-sea'
import { localPair, relativeWeights } from '@/code/measure/register-crossing'
import {
  bandVectors,
  bandWeights,
  copyHoles,
  exchangeWeights,
  fromDensePair,
  holeCycle,
  holeEngine,
  holeFrame,
  holeGap,
  holeNorm,
  momentumWeights,
  newHoles,
  orbitalCycle,
  pairAngles,
  slaterStart,
  type HoleEngine,
  type HoleFrame,
  type HoleRule,
  type Holes,
} from '@/code/measure/register-holes'
import {
  copySorted,
  slaterRow,
  sortedCycle,
  sortedEngine,
  sortedNorm,
  sortedOccupation,
  sortedSlater,
  sortedUp,
  type SortedEngine,
} from '@/code/measure/register-sorted-holes'

const args = process.argv.slice(2)
const GOLDEN = args.includes('--golden')
const WRITE = args.includes('--write')
const LARGE = args.includes('--large')
const DIR = fileURLToPath(new URL('./parity', import.meta.url))
const ONLY = process.env.PARITY_ONLY?.split(',').filter(x => x.length > 0)
const started = Date.now()

// ---- the runs ----

type Path = 'copy' | 'held'
// o null: the reference (the engine's own JavaScript)
type Run = { name: string; o: KernelOptions | null; path: Path }

const REF: Run = { name: 'reference', o: null, path: 'copy' }

function runsOf(): { runs: Run[]; missing: string[] } {
  const named = process.env.PARITY_BACKENDS?.split(',').filter(x => x.length > 0)
  const list = named ?? ['js', 'native:1', 'native:8', 'wasm', 'hip', 'cuda', 'gpu-emu']
  const runs: Run[] = []
  const missing: string[] = []

  for (const spec of list) {
    const [b, t] = spec.split(':') as [Backend, string | undefined]
    const threads = t ? Number(t) : b === 'native' || b === 'wasm-threads' ? 1 : 1
    const isGpu = b === 'hip' || b === 'cuda' || b === 'gpu-emu'

    if (!available(b)) {
      // unnamed GPU backends that do not load (no device here) are skipped quietly
      if (named || !isGpu) {
        missing.push(spec)
      }

      continue
    }

    const name = b === 'native' || b === 'wasm-threads' ? `${b} x${threads}` : b

    runs.push({ name, o: { backend: b, threads }, path: 'copy' })

    if (kernel(b, threads).device) {
      runs.push({ name: `${name} held`, o: { backend: b, threads }, path: 'held' })
    }
  }

  return { runs, missing }
}

// ---- values ----

type Out = Map<string, Float64Array>

const PHI = (Math.sqrt(5) - 1) / 2
const f64 = (xs: readonly number[]): Float64Array => Float64Array.from(xs)
const snap = (a: Float64Array): Float64Array => Float64Array.from(a)

// a golden-ratio stream with exact zeros and negative zeros planted (check.ts's stream)
function stream(n: number, offset: number, scale = 1): Float64Array {
  const out = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    const x = ((i + 1) * PHI + offset * 0.7548776662466927) % 1

    out[i] = i % 13 === 5 ? 0 : i % 17 === 3 ? -0 : scale * (x - 0.5)
  }

  return out
}

// the edge-case states. Magnitudes: tiny puts entries near 1e-300 with subnormals (near 1e-310) planted, whose products
// underflow to zero or to subnormals (the GPU must keep subnormals, not flush them); huge puts entries near 1e300, which
// the unitary cycles keep bounded (every entry stays within a few times the state's largest, far below 1.8e308), while a
// norm, a sum of squares, overflows to Infinity on every backend alike (so the invariants of the huge cases read
// Infinity, deterministically); mixed interleaves 1e150, 1 and 1e-150 so that every sum adds terms 300 decades apart,
// where the order of addition decides the result
type Edge = 'zero' | 'single' | 'negzero' | 'tiny' | 'huge' | 'mixed'

const EDGES: readonly Edge[] = ['zero', 'single', 'negzero', 'tiny', 'huge', 'mixed']

function edgeFill(re: Float64Array, im: Float64Array, kind: Edge, seed: number): void {
  const n = re.length
  const a = stream(n, seed)
  const b = stream(n, seed + 1)

  re.fill(0)
  im.fill(0)

  for (let i = 0; i < n; i++) {
    switch (kind) {
      case 'zero':
        break
      case 'single':
        if (i === Math.floor(n / 3)) {
          re[i] = 0.6
          im[i] = -0.8
        }

        break
      case 'negzero':
        re[i] = i % 7 === 0 ? a[i]! : -0
        im[i] = i % 11 === 0 ? b[i]! : -0
        break
      case 'tiny':
        re[i] = i % 19 === 4 ? 3e-310 : a[i]! * 1e-300
        im[i] = i % 23 === 7 ? -2e-310 : b[i]! * 1e-300
        break
      case 'huge':
        re[i] = a[i]! * 1e300
        im[i] = b[i]! * 1e300
        break
      case 'mixed': {
        const m = [1e150, 1, 1e-150][i % 3]!

        re[i] = a[i]! * m
        im[i] = b[i]! * [1e-150, 1e150, 1][i % 3]!
        break
      }
    }
  }
}

// ---- shared tables, made once ----

const unitOf = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}
const LIGHT = unitOf([-1, 4])
const U: [number, number] = [Math.cos(1.2952), Math.sin(1.2952)]
const S_ANG = unitAngle(ringUnit(-2, 1))
const V_ANG = unitAngle(ringUnit(2, 0))
const PS = [registerPiece(scaled(singletProjector24(), 24), LIGHT), registerPiece(scaled(partnerProjector48(), 48), [LIGHT[0], -LIGHT[1]])]

const memo = <T>(make: () => T): (() => T) => {
  let v: T | undefined

  return () => (v ??= make())
}

const group = memo(ballGroup)
const ballSecs = new Map<number, BallSector>()
const ballSec = (r: number): BallSector => {
  let s = ballSecs.get(r)

  if (!s) {
    s = ballSector(group(), r)
    ballSecs.set(r, s)
  }

  return s
}
const cubic = memo(cubicGroup)
const tori = new Map<number, Torus>()
const torusOf = (L: number): Torus => {
  let t = tori.get(L)

  if (!t) {
    t = torus(L)
    tori.set(L, t)
  }

  return t
}
const E = memo(sectorBases)
const movings = new Map<number, Moving>()
const movingOf = (L: number): Moving => {
  let m = movings.get(L)

  if (!m) {
    m = movingBlocks(torusOf(L), PS)
    movings.set(L, m)
  }

  return m
}
const frames = new Map<string, HoleFrame>()
const frameOf = (L: number, fiber: 8 | 16 = 8): HoleFrame => {
  const key = `${L} ${fiber}`
  let f = frames.get(key)

  if (!f) {
    f = holeFrame(torusOf(L), PS, fiber)
    frames.set(key, f)
  }

  return f
}
const holeAngle = (L: number): Float64Array => pairAngles(torusOf(L), -S_ANG, 8, -2 * V_ANG)

// ---- the cases ----

type Case = { id: string; engine: string; heldPath: boolean; run(r: Run): Out }

const cases: Case[] = []
const add = (c: Case): void => {
  if (!ONLY || ONLY.some(o => c.id.startsWith(o))) {
    cases.push(c)
  }
}

// ---- register-ball-reduced ----

type BallConfig = { radius: number; u: [number, number]; tau: number; cap: number }

const ballOf = (c: BallConfig, r: Run): BallEngine =>
  ballEngine(ballSec(c.radius), { u: c.u, tau: c.tau, cap: c.cap, K: [0, 0, 0, 0] }, r.o ?? undefined)

// n ball cycles on the run's path
function ballCycles(e: BallEngine, st: BallState, n: number, r: Run): void {
  if (r.path === 'held') {
    fastCycles(e.fast!, st, n)
  } else {
    for (let c = 0; c < n; c++) {
      ballCycle(e, st)
    }
  }
}

function ballCase(id: string, c: BallConfig, fill: (s: BallSector) => BallState, long: number, reads: boolean): void {
  add({
    id,
    engine: 'ball',
    heldPath: true,
    run: r => {
      const e = ballOf(c, r)
      const s0 = fill(e.s)
      const st = { re: snap(s0.re), im: snap(s0.im) }
      const out: Out = new Map()

      ballCycles(e, st, 1, r)
      out.set('state after 1 re', snap(st.re))
      out.set('state after 1 im', snap(st.im))
      ballCycles(e, st, long - 1, r)
      out.set(`state after ${long} re`, snap(st.re))
      out.set(`state after ${long} im`, snap(st.im))

      if (reads) {
        out.set('norm2 start, after', f64([ballNorm2(e, s0), ballNorm2(e, st)]))
        out.set('inner start after', f64(ballInner(e, s0, st)))

        const v = ballFilter(e, s0, 1.2592, 6)
        const rd = ballRead(e, v)

        out.set('filter S 6 re', v.re)
        out.set('read lambda phase residual', f64([...rd.lambda, rd.phase, rd.residual]))
      }

      return out
    },
  })
}

const BALL_A: BallConfig = { radius: 6, u: LIGHT, tau: 0.0936, cap: 24 }
const BALL_B: BallConfig = { radius: 8, u: U, tau: 0.2807, cap: 8 }
const BALL_C: BallConfig = { radius: 4, u: LIGHT, tau: 0, cap: 24 }
const weylBall = (seed: number) => (s: BallSector): BallState => ({
  re: stream(s.count * 256, seed),
  im: stream(s.count * 256, seed + 1),
})

ballCase('ball radius 6 string shell start', BALL_A, s => ballStart(s, V => Math.exp(-(((V - 3) / 0.7) ** 2))), 64, true)
ballCase('ball radius 8 strong string weyl', BALL_B, weylBall(3), 64, true)
ballCase('ball radius 4 free weyl', BALL_C, weylBall(5), 64, true)

for (const kind of EDGES) {
  ballCase(
    `ball radius 4 edge ${kind}`,
    { ...BALL_A, radius: 4 },
    s => {
      const st = { re: new Float64Array(s.count * 256), im: new Float64Array(s.count * 256) }

      edgeFill(st.re, st.im, kind, 7)

      return st
    },
    16,
    false,
  )
}

// ---- register-reduced ----

type ReducedConfig = { form: Form; K: number[]; R: number }

function reducedOf(c: ReducedConfig, r: Run): ReducedEngine {
  const g = cubic()
  const members = c.K.every(k => k === 0) ? [...g.elements.keys()] : littleGroup(g, c.K)
  const s: Sector = sector(g, members, c.R)
  const counts = new Int32Array(s.count)

  for (let i = 0; i < s.count; i++) {
    counts[i] = Math.floor(30 / (1 + s.shell[i]!))
  }

  return reducedEngine(s, U, c.K, { counts, nearest: 0, top: 30, alpha: 1, theta: 0.0731 }, c.form, r.o ?? undefined)
}

function reducedCase(id: string, c: ReducedConfig, edge: Edge | null, long: number, reads: boolean): void {
  add({
    id,
    engine: 'reduced',
    heldPath: true,
    run: r => {
      const e = reducedOf(c, r)
      const s0 = newState(e.s)

      if (edge) {
        edgeFill(s0.re, s0.im, edge, 11)
      } else {
        s0.re.set(stream(s0.re.length, 70))
        s0.im.set(stream(s0.im.length, 71))
      }

      const st = { re: snap(s0.re), im: snap(s0.im) }
      const cycles = (n: number): void => {
        if (r.path === 'held') {
          fastCycles(e.fast!, st, n)
        } else {
          for (let k = 0; k < n; k++) {
            reducedCycle(e, st)
          }
        }
      }
      const out: Out = new Map()

      cycles(1)
      out.set('state after 1 re', snap(st.re))
      out.set('state after 1 im', snap(st.im))
      cycles(long - 1)
      out.set(`state after ${long} re`, snap(st.re))
      out.set(`state after ${long} im`, snap(st.im))

      if (reads) {
        out.set('norm2 start, after', f64([reducedNorm2(e, s0), reducedNorm2(e, st)]))
        out.set('inner start after', f64(reducedInner(e, s0, st)))

        const ac = autocorrelation(e, s0, 4)

        out.set('autocorrelation 4 re', ac.re)
        out.set('autocorrelation 4 im', ac.im)

        const v = reducedFilter(e, s0, 1.2592, 5)
        const rd = reducedRead(e, v)

        out.set('filter S 5 re', v.re)
        out.set('read lambda phase residual', f64([...rd.lambda, rd.phase, rd.residual]))
      }

      return out
    },
  })
}

reducedCase('reduced vector K 0 R 5', { form: 'vector', K: [0, 0, 0, 0], R: 5 }, null, 64, true)
reducedCase('reduced vector axis x R 5', { form: 'vector', K: [0.21, 0, 0, 0], R: 5 }, null, 64, true)
reducedCase('reduced scalar K 0 R 7', { form: 'scalar', K: [0, 0, 0, 0], R: 7 }, null, 64, true)
reducedCase('reduced scalar axis y R 5', { form: 'scalar', K: [0, 0.17, 0, 0], R: 5 }, null, 16, false)

for (const kind of EDGES) {
  reducedCase(`reduced vector K 0 R 3 edge ${kind}`, { form: 'vector', K: [0, 0, 0, 0], R: 3 }, kind, 16, false)
}

// ---- register-sea ----

const SEA_RULE: SeaRule = { u: LIGHT, string: -S_ANG, cap: 8, contact: -2 * V_ANG, dock: null, member: false }

function seaCycles(T: Torus, rule: SeaRule, s: Pair, n: number, r: Run): void {
  if (r.path === 'held') {
    fastSeaCycles(kernel(r.o!.backend!, r.o!.threads ?? 1), T, rule, E(), s, n)
  } else {
    const spare = newPair(T)

    for (let c = 0; c < n; c++) {
      seaCycle(T, rule, E(), s, spare, r.o ?? undefined)
    }
  }
}

function seaCase(id: string, L: number, rule: SeaRule, fill: (T: Torus) => Pair, long: number, flats: boolean): void {
  add({
    id,
    engine: 'sea',
    heldPath: true,
    run: r => {
      const T = torusOf(L)
      const s = fill(T)
      const out: Out = new Map()

      seaCycles(T, rule, s, 1, r)
      out.set('state after 1 re', snap(s.re))
      out.set('state after 1 im', snap(s.im))

      if (long > 1) {
        seaCycles(T, rule, s, long - 1, r)
        out.set(`state after ${long} re`, snap(s.re))
        out.set(`state after ${long} im`, snap(s.im))
      }

      out.set('pair norm', f64([pairNorm(s)]))

      if (flats) {
        const fc = flatCount(T, movingOf(L), s, r.o ?? undefined)

        out.set('flat count N_F, fourier', f64([fc.nF, fc.fourier]))
      }

      return out
    },
  })
}

const movingStart = (a: number, b: number) => (T: Torus): Pair => pairStart(T, movingOf(T.L), 'W', a, 'W', b)
const weylPair = (seed: number) => (T: Torus): Pair => {
  const p = newPair(T)

  p.re.set(stream(p.re.length, seed, 1e-3))
  p.im.set(stream(p.im.length, seed + 1, 1e-3))

  return p
}

seaCase('sea L 2 plain moving start', 2, SEA_RULE, movingStart(0, 47), 16, true)
seaCase('sea L 2 plain weyl', 2, SEA_RULE, weylPair(80), 16, true)
seaCase('sea L 2 dock control', 2, { ...SEA_RULE, dock: [Math.cos(0.3), Math.sin(0.3)] }, movingStart(19, 20), 16, true)
seaCase('sea L 2 member control', 2, { ...SEA_RULE, member: true }, movingStart(0, 47), 16, true)
seaCase('sea L 2 whole with kernel', 2, { ...SEA_RULE, whole: true, kernel: stream(torusOf(2).sites.length, 82) }, weylPair(84), 16, false)

for (const kind of EDGES) {
  seaCase(
    `sea L 2 edge ${kind}`,
    2,
    SEA_RULE,
    T => {
      const p = newPair(T)

      edgeFill(p.re, p.im, kind, 13)

      return p
    },
    4,
    false,
  )
}

if (LARGE) {
  seaCase('sea L 4 plain weyl', 4, SEA_RULE, weylPair(86), 1, false)
}

// ---- register-holes ----

// distinct momenta summing to total 0 (the sorted experiment's distinctStart, restated)
function distinct(fr: HoleFrame, n: number): number[] {
  const F = fr.fourier
  const N = F.N

  for (let a = 1; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      if (n === 2) {
        if (F.neg[a] === b) {
          return [a, b]
        }

        continue
      }

      if (n === 3) {
        const c = F.sum[F.neg[a]! * N + F.neg[b]!]!

        if (c > b) {
          return [a, b, c]
        }

        continue
      }

      for (let c = b + 1; c < N; c++) {
        const d = F.sum[F.sum[F.neg[a]! * N + F.neg[b]!]! * N + F.neg[c]!]!

        if (d > c) {
          return [a, b, c, d]
        }
      }
    }
  }

  throw new Error('parity: no distinct momenta')
}

const slaterOf = (e: HoleEngine): Holes => {
  const js = distinct(e.frame, e.n)

  return slaterStart(e, js, js.map(j => bandVectors(e.frame, j).up[0]!))
}

function holeCycles(e: HoleEngine, rule: HoleRule, s: Holes, n: number, r: Run): void {
  if (r.path === 'held') {
    fastHoleCycles(e.fast!, e, rule, s, n)
  } else {
    for (let c = 0; c < n; c++) {
      holeCycle(e, rule, s)
    }
  }
}

function holeCase(
  id: string,
  L: number,
  n: number,
  rule: (L: number) => HoleRule,
  fill: 'slater' | 'weyl' | Edge,
  long: number,
): void {
  add({
    id,
    engine: 'holes',
    heldPath: true,
    run: r => {
      const fr = frameOf(L)
      const e = holeEngine(fr, n, 0, r.o ?? undefined)
      const ru = rule(L)
      let s: Holes

      if (fill === 'slater') {
        s = slaterOf(e)
      } else {
        s = newHoles(fr, n, 0)

        if (fill === 'weyl') {
          s.re.set(stream(s.re.length, 110))
          s.im.set(stream(s.im.length, 111))
        } else {
          edgeFill(s.re, s.im, fill, 17)
        }
      }

      const out: Out = new Map()

      holeCycles(e, ru, s, 1, r)
      out.set('state after 1 re', snap(s.re))
      out.set('state after 1 im', snap(s.im))
      holeCycles(e, ru, s, long - 1, r)
      out.set(`state after ${long} re`, snap(s.re))
      out.set(`state after ${long} im`, snap(s.im))
      out.set('hole norm', f64([holeNorm(s)]))
      out.set('band weights', bandWeights(e, s))
      out.set('momentum weights', momentumWeights(e, s))

      const ex = exchangeWeights(e, s)

      out.set('exchange antisymmetric, other', f64([ex.antisymmetric, ex.other]))

      return out
    },
  })
}

const theRule = (L: number): HoleRule => ({ angle: holeAngle(L) })

holeCase('holes L 4 n 2 rule slater', 4, 2, theRule, 'slater', 64)
holeCase('holes L 4 n 2 one-sign control', 4, 2, L => ({ angle: holeAngle(L), angle2: holeAngle(L).map(x => -x) }), 'slater', 16)
holeCase('holes L 4 n 2 other phase sign weyl', 4, 2, L => ({ angle: holeAngle(L).map(x => -x) }), 'weyl', 16)
holeCase('holes L 2 n 3 rule slater', 2, 3, theRule, 'slater', 64)
holeCase(
  'holes L 2 n 3 pair mask 0-2 weyl',
  2,
  3,
  L => ({
    angle: holeAngle(L),
    pairs: [
      [false, false, true],
      [false, false, false],
      [false, false, false],
    ],
  }),
  'weyl',
  16,
)
holeCase('holes L 2 n 3 free rule weyl', 2, 3, () => ({ angle: null }), 'weyl', 16)

for (const kind of EDGES) {
  holeCase(`holes L 2 n 2 edge ${kind}`, 2, 2, theRule, kind, 16)
}

// the free rule's Slater identity (E-FND-0161 V4b's statement): three holes under the free rule stay the Slater
// determinant of their free-evolved orbitals. The gap is a float on each backend's state, compared byte for byte
add({
  id: 'holes L 2 n 3 free rule Slater identity',
  engine: 'holes',
  heldPath: false,
  run: r => {
    const fr = frameOf(2)
    const e = holeEngine(fr, 3, 0, r.o ?? undefined)
    const js = distinct(fr, 3)
    const orbitals = js.map(j => bandVectors(fr, j).up[0]!)
    const evolved = orbitals.map(v => ({ re: Float64Array.from(v.re), im: Float64Array.from(v.im) }))
    const s = slaterStart(e, js, orbitals)
    const gaps: number[] = []

    for (let c = 1; c <= 16; c++) {
      holeCycle(e, { angle: null }, s)
      js.forEach((j, i) => orbitalCycle(fr, j, evolved[i]!))

      if (c === 1 || c === 4 || c === 16) {
        gaps.push(holeGap(s, slaterStart(e, js, evolved)))
      }
    }

    return new Map([
      ['slater gap at 1, 4, 16', f64(gaps)],
      ['state after 16 re', snap(s.re)],
    ])
  },
})

// ---- register-sorted-holes (the js backend is the reference) ----

const sortedOf = (L: number, n: number, r: Run): SortedEngine => sortedEngine(frameOf(L), n, 0, r.o ?? { backend: 'js' })

function sortedCase(id: string, L: number, n: number, rule: (L: number) => HoleRule, edge: Edge | null, long: number): void {
  add({
    id,
    engine: 'sorted',
    heldPath: true,
    run: r => {
      const se = sortedOf(L, n, r)
      const js = distinct(se.frame, n)
      let s = sortedSlater(se, js, js.map(j => bandVectors(se.frame, j).up[0]!))

      if (edge) {
        s = copySorted(s)
        edgeFill(s.re, s.im, edge, 19)
      }

      const ru = rule(L)
      const cycles = (k: number): void => {
        const loop = (): void => {
          for (let c = 0; c < k; c++) {
            sortedCycle(se, ru, s)
          }
        }

        if (r.path === 'held') {
          onDevice(se.k, [s.re, s.im], loop)
        } else {
          loop()
        }
      }
      const out: Out = new Map()

      cycles(1)
      out.set('state after 1 re', snap(s.re))
      out.set('state after 1 im', snap(s.im))
      cycles(long - 1)
      out.set(`state after ${long} re`, snap(s.re))
      out.set(`state after ${long} im`, snap(s.im))
      out.set('sorted norm, up', f64([sortedNorm(se, s), sortedUp(se, s)]))
      out.set('sorted occupation', sortedOccupation(se, s))

      return out
    },
  })
}

sortedCase('sorted L 2 n 3 rule', 2, 3, theRule, null, 64)
sortedCase('sorted L 2 n 4 rule', 2, 4, theRule, null, 16)
sortedCase('sorted L 2 n 4 free rule', 2, 4, () => ({ angle: null }), null, 16)
sortedCase('sorted L 2 n 3 one-sign control', 2, 3, L => ({ angle: holeAngle(L), angle2: holeAngle(L).map(x => -x) }), null, 16)

for (const kind of ['zero', 'tiny', 'huge', 'mixed'] as const) {
  sortedCase(`sorted L 2 n 3 edge ${kind}`, 2, 3, theRule, kind, 8)
}

// ---- the registered experiments, replayed at reduced size ----

// E-SPN-0175 (spin/register-sea): two holes with the sea present keep the flat modes decoupled. Its two W (x) W moving
// starts (modes 0, 47 and 19, 20) on the L = 2 torus instead of L = 4, 8 cycles instead of 64; the reads are N_F and the
// pair norm at cycles 1, 2, 4, 8 (the experiment's N_F within 1.2e-13 of 0)
add({
  id: 'E-SPN-0175 flats frozen, L 2',
  engine: 'experiment',
  heldPath: false,
  run: r => {
    const T = torusOf(2)
    const out: Out = new Map()

    for (const [a, b] of [
      [0, 47],
      [19, 20],
    ] as const) {
      const s = pairStart(T, movingOf(2), 'W', a, 'W', b)
      const spare = newPair(T)
      const reads: number[] = []

      for (let c = 1; c <= 8; c++) {
        seaCycle(T, SEA_RULE, E(), s, spare, r.o ?? undefined)

        if (c === 1 || c === 2 || c === 4 || c === 8) {
          const fc = flatCount(T, movingOf(2), s, r.o ?? undefined)

          reads.push(fc.nF, fc.fourier, pairNorm(s))
        }
      }

      out.set(`modes ${a} ${b}: N_F, fourier, norm at 1 2 4 8`, f64(reads))
    }

    return out
  },
})

// E-FND-0158 (foundations/register-crossing): the weight a distinguishable pair trades between relative momenta, its
// start (one dock, slots 0 and 1, register 0) on L = 2 for 8 cycles instead of L = 4 for 64
add({
  id: 'E-FND-0158 traded weight, L 2',
  engine: 'experiment',
  heldPath: false,
  run: r => {
    const T = torusOf(2)
    const d = localPair(T, T.origin, 0, 8, 0)
    const spare = newPair(T)
    const w0 = relativeWeights(T, d)
    const trades: number[] = []

    for (let c = 1; c <= 8; c++) {
      seaCycle(T, SEA_RULE, E(), d, spare, r.o ?? undefined)

      if (c === 1 || c === 2 || c === 4 || c === 8) {
        const w = relativeWeights(T, d)
        const tot = w.reduce((s, x) => s + x, 0)

        trades.push(w.reduce((s, x, j) => s + Math.abs(x - w0[j]!), 0) / tot)
      }
    }

    return new Map([['traded weight at 1 2 4 8', f64(trades)]])
  },
})

// E-FND-0161 (foundations/register-holes): V2, the dense two-hole engine against the reduced one from a moving start,
// on L = 2 for 4 cycles instead of L = 4 for 64 (both engines on the backend); V4b and V4c, three holes under the free rule
// against the Slater determinant and the rule's antisymmetric complement, on L = 2 for 8 cycles instead of L = 4 for 16
add({
  id: 'E-FND-0161 dense against reduced and the three-hole reads, L 2',
  engine: 'experiment',
  heldPath: false,
  run: r => {
    const T = torusOf(2)
    const fr16 = frameOf(2, 16)
    const e2 = holeEngine(fr16, 2, 0, r.o ?? undefined)
    const dense = pairStart(T, fr16.moving, 'W', 0, 'W', 47)
    const spare = newPair(T)
    const mine = fromDensePair(e2, j => pairAt(T, dense, j)).holes
    const v2: number[] = []

    for (let c = 1; c <= 4; c++) {
      seaCycle(T, SEA_RULE, E(), dense, spare, r.o ?? undefined)
      holeCycle(e2, { angle: holeAngle(2) }, mine)

      const ref = fromDensePair(e2, j => pairAt(T, dense, j))

      v2.push(holeGap(mine, ref.holes), ref.outside, holeNorm(mine))
    }

    const fr8 = frameOf(2)
    const e3 = holeEngine(fr8, 3, 0, r.o ?? undefined)
    const js = distinct(fr8, 3)
    const orbitals = js.map(j => bandVectors(fr8, j).up[0]!)
    const free = slaterStart(e3, js, orbitals)
    const ruled = copyHoles(free)
    const evolved = orbitals.map(v => ({ re: Float64Array.from(v.re), im: Float64Array.from(v.im) }))
    const v4: number[] = []

    for (let c = 1; c <= 8; c++) {
      holeCycle(e3, { angle: null }, free)
      holeCycle(e3, { angle: holeAngle(2) }, ruled)
      js.forEach((j, i) => orbitalCycle(fr8, j, evolved[i]!))
      v4.push(holeGap(free, slaterStart(e3, js, evolved)), holeNorm(ruled))

      if (c === 1 || c === 8) {
        v4.push(exchangeWeights(e3, ruled).other)
      }
    }

    return new Map([
      ['V2 gap, outside, norm per cycle', f64(v2)],
      ['V4 slater gap, norm, exchange other', f64(v4)],
    ])
  },
})

// E-FND-0163 (foundations/register-sorted-holes): S3, four holes under the free rule against their Slater determinant
// (compared in the determinant's own row and against 0 elsewhere, the experiment's measure) at cycles 1, 2, 4 and the
// rule's norm and occupation sum over 4 cycles, on L = 2 instead of L = 4
add({
  id: 'E-FND-0163 four holes, L 2',
  engine: 'experiment',
  heldPath: false,
  run: r => {
    const se = sortedOf(2, 4, r)
    const fr = se.frame
    const js = distinct(fr, 4)
    const orbitals = js.map(j => bandVectors(fr, j).up[0]!)
    const evolved = orbitals.map(v => ({ re: Float64Array.from(v.re), im: Float64Array.from(v.im) }))
    const free = sortedSlater(se, js, orbitals)
    const reads: number[] = []

    for (let c = 1; c <= 4; c++) {
      sortedCycle(se, { angle: null }, free)
      js.forEach((j, i) => orbitalCycle(fr, j, evolved[i]!))

      if (c === 1 || c === 2 || c === 4) {
        const ref = slaterRow(se, js, evolved)
        const from = ref.row * se.block

        let gap = 0

        for (let k = 0; k < free.re.length; k++) {
          const inRow = k >= from && k < from + se.block

          gap = Math.max(gap, Math.hypot(free.re[k]! - (inRow ? ref.re[k - from]! : 0), free.im[k]! - (inRow ? ref.im[k - from]! : 0)))
        }

        reads.push(gap)
      }
    }

    const ruled = sortedSlater(se, js, orbitals)

    for (let c = 1; c <= 4; c++) {
      sortedCycle(se, { angle: holeAngle(2) }, ruled)
      reads.push(sortedNorm(se, ruled), sortedOccupation(se, ruled).reduce((a, x) => a + x, 0))
    }

    return new Map([['slater gaps, then norm and occupation per cycle', f64(reads)]])
  },
})

// E-SPN-0178 (spin/pulled-pair-weak) and E-SPN-0179 (spin/pulled-pair-fear): a pair pulled to V0 under the weak string
// (tau ringUnit(-3, 2), cap 24), held and free, with the absorbing layer; the reads are the knot weight at the start, its
// late mean, the most weight past V0 + reach, and the Gram norm after. Radius 10 instead of 32, V0 4 instead of 8 and
// 10, 16 cycles instead of 128 (late window 9 to 16), knot V <= 2, reach 3, absorber from V 8 at strength 0.5.
// E-SPN-0179's singlet channel is the same run with the fear beat (ringUnit(0, 2)) at V = 0 (its complement is E-SPN-0178's
// run to the last digit, per its registry line)
const PULL = { radius: 10, V0: 4, cycles: 16, lateFrom: 9, absorbFrom: 8, strength: 0.5, knot: 2, reach: 3 }

function pulled(e: BallEngine): number[] {
  const x = ballStart(e.s, V => Math.exp(-(((V - PULL.V0) / 0.7) ** 2)))

  normalizeBall(e, x)

  const p0 = ballProfile(e, x)
  const reference = p0.reduce((a, y) => a + y, 0)
  const knotOf = (p: number[]): number => p.slice(0, PULL.knot + 1).reduce((a, y) => a + y, 0) / reference
  const outOf = (p: number[]): number => p.slice(PULL.V0 + PULL.reach + 1).reduce((a, y) => a + y, 0) / reference
  const start = knotOf(p0)

  let late = 0
  let outMax = outOf(p0)

  for (let t = 1; t <= PULL.cycles; t++) {
    ballCycle(e, x)
    ballAbsorb(e.s, x, PULL.absorbFrom, PULL.strength)

    const p = ballProfile(e, x)

    if (t >= PULL.lateFrom) {
      late += knotOf(p) / (PULL.cycles - PULL.lateFrom + 1)
    }

    if (t % 4 === 0) {
      outMax = Math.max(outMax, outOf(p))
    }
  }

  return [start, late, outMax, ballNorm2(e, x)]
}

const weakTau = unitAngle(ringUnit(-3, 2))
const pullParams = (tau: number) => ({ u: LIGHT, tau, cap: 24, K: [0, 0, 0, 0] })

add({
  id: 'E-SPN-0178 pulled pair, held and free, radius 10',
  engine: 'experiment',
  heldPath: false,
  run: r => {
    const sec = ballSec(PULL.radius)

    return new Map([
      ['held: knot start, late, out max, norm', f64(pulled(ballEngine(sec, pullParams(weakTau), r.o ?? undefined)))],
      ['free: knot start, late, out max, norm', f64(pulled(ballEngine(sec, pullParams(0), r.o ?? undefined)))],
    ])
  },
})

add({
  id: 'E-SPN-0179 pulled pair with the fear beat, radius 10',
  engine: 'experiment',
  heldPath: false,
  run: r => {
    const e = fearBallEngine({ sector: ballSec(PULL.radius), params: pullParams(weakTau), angle: unitAngle(ringUnit(0, 2)) })

    // the fear engine has no opt-in option of its own: the fast path attached as ballEngine attaches it
    if (r.o?.backend) {
      e.fast = fastBall(e, kernel(r.o.backend, r.o.threads ?? 1))
    }

    return new Map([['singlet held: knot start, late, out max, norm', f64(pulled(e))]])
  },
})

// ---- comparing ----

type Golden = { length: number; sha256: string; values: string[] }
type GoldenFile = { note: string; tolerance: number; cases: Record<string, Record<string, Golden>> }

const repr = (x: number): string => (Object.is(x, -0) ? '-0' : String(x))
// THE ONE CANONICALIZATION: every NaN is hashed and compared as the quiet NaN 0x7ff8000000000000, whatever its sign and
// payload. Infinity - Infinity is 0x7ff8000000000000 on arm64 and 0xfff8000000000000 on x86-64 (the SSE "indefinite"
// has its sign bit set), so the huge edge cases, whose norms overflow and whose differences of norms are NaN, hashed
// differently on the two machines with every value equal (holes L 2 n 2 edge huge, 2026-09-30). JavaScript cannot
// observe a NaN's sign or payload except through a typed array's bytes, and no reading here depends on it. Every other
// bit, the sign of a zero and every subnormal included, is still compared exactly.
const NAN_BITS = 0x7ff8000000000000n
const bytesOf = (a: Float64Array): Buffer => {
  if (!a.some(x => x !== x)) {
    return Buffer.from(a.buffer, a.byteOffset, a.byteLength)
  }

  const c = new Float64Array(a.length)

  c.set(a)

  const u = new BigUint64Array(c.buffer)

  for (let i = 0; i < c.length; i++) {
    if (c[i] !== c[i]) {
      u[i] = NAN_BITS
    }
  }

  return Buffer.from(c.buffer)
}
const sha = (a: Float64Array): string => createHash('sha256').update(bytesOf(a)).digest('hex')
const goldenOf = (a: Float64Array): Golden => ({
  length: a.length,
  sha256: sha(a),
  values: Array.from(a.length <= 12 ? a : a.subarray(0, 3), repr),
})

// false when equal, else a description of the first difference
function differ(want: Float64Array | Golden, have: Float64Array): string | false {
  if (want instanceof Float64Array) {
    if (want.length === have.length && bytesOf(want).compare(bytesOf(have)) === 0) {
      return false
    }

    for (let i = 0; i < Math.min(want.length, have.length); i++) {
      if (!Object.is(want[i], have[i])) {
        return `first difference at ${i}: ${repr(want[i]!)} vs ${repr(have[i]!)}`
      }
    }

    return `lengths ${want.length} vs ${have.length}`
  }

  if (want.length === have.length && want.sha256 === sha(have)) {
    return false
  }

  const at = want.values.findIndex((v, i) => v !== repr(have[i]!))

  return `sha256 differs (length ${want.length} vs ${have.length}${at >= 0 ? `, stored value ${at} ${want.values[at]} vs ${repr(have[at]!)}` : ''})`
}

const GOLDEN_NOTE =
  'The kernel parity suite (task/kernel/parity.ts): the reference outputs of every case, the sha256 of each output array\'s bytes (little-endian float64) and its first values as the shortest decimals that read back to the same doubles. Tolerance 0: every comparison is byte equality, and no quantity here is defined only up to a tolerance.'

const engines = [...new Set(cases.map(c => c.engine))]

function loadGolden(): Map<string, Record<string, Golden>> {
  const out = new Map<string, Record<string, Golden>>()

  for (const en of engines) {
    const file = join(DIR, `${en}.json`)

    if (!existsSync(file)) {
      continue
    }

    const g = JSON.parse(readFileSync(file, 'utf8')) as GoldenFile

    Object.entries(g.cases).forEach(([id, outs]) => out.set(id, outs))
  }

  return out
}

// ---- run ----

const { runs, missing } = runsOf()
const say = (what: string): void => console.log(`${what} (${((Date.now() - started) / 1000).toFixed(1)} s)`)

say(`${cases.length} cases, runs: ${runs.map(r => r.name).join(', ') || 'none'}${GOLDEN ? ', against the golden files' : ''}`)

let failures = missing.length

missing.forEach(m => console.log(`FAIL backend ${m} is not available`))

const golden = loadGolden()
const refs = new Map<string, Out>()
const refSeconds = { t: 0 }

// the reference, live (not with --golden)
if (!GOLDEN) {
  for (const c of cases) {
    const t0 = Date.now()

    refs.set(c.id, c.run(REF))
    refSeconds.t += Date.now() - t0

    // a live reference that no longer matches the stored one is reported, since a change to an engine's arithmetic
    // must be a deliberate --write
    const g = golden.get(c.id)

    if (g && !WRITE) {
      for (const [name, a] of refs.get(c.id)!) {
        const d = g[name] ? differ(g[name]!, a) : 'not in the golden file'

        if (d) {
          failures++
          console.log(`FAIL reference against golden: ${c.id} / ${name}: ${d} (rerun with --write if the engine changed on purpose)`)
        }
      }
    }
  }

  say(`reference: ${cases.length} cases in ${(refSeconds.t / 1000).toFixed(1)} s`)
}

if (WRITE) {
  mkdirSync(DIR, { recursive: true })

  for (const en of engines) {
    const file: GoldenFile = { note: GOLDEN_NOTE, tolerance: 0, cases: {} }

    for (const c of cases.filter(x => x.engine === en)) {
      file.cases[c.id] = Object.fromEntries([...refs.get(c.id)!].map(([name, a]) => [name, goldenOf(a)]))
    }

    writeFileSync(join(DIR, `${en}.json`), `${JSON.stringify(file, null, 1)}\n`)
  }

  say(`wrote ${engines.map(en => `${en}.json`).join(', ')} under ${DIR}`)
}

const table: { name: string; cases: number; pass: number; fail: number; seconds: number }[] = []

for (const r of runs) {
  const row = { name: r.name, cases: 0, pass: 0, fail: 0, seconds: 0 }

  for (const c of cases) {
    if (r.path === 'held' && !c.heldPath) {
      continue
    }

    row.cases++

    const t0 = Date.now()
    let have: Out

    try {
      have = c.run(r)
    } catch (err) {
      row.fail++
      row.seconds += (Date.now() - t0) / 1000
      console.log(`FAIL ${c.id} ${r.name}: threw ${(err as Error).message}`)
      continue
    }

    row.seconds += (Date.now() - t0) / 1000

    const want = GOLDEN ? golden.get(c.id) : refs.get(c.id)
    let bad: string | false = want ? false : 'no reference (run --write, or drop --golden)'

    if (want) {
      for (const [name, a] of have) {
        const w = want instanceof Map ? want.get(name) : want[name]
        const d = w ? differ(w, a) : 'no reference output of this name'

        if (d) {
          bad = `${name}: ${d}`
          break
        }
      }
    }

    if (bad) {
      row.fail++
      console.log(`FAIL ${c.id} ${r.name}: ${bad}`)
    } else {
      row.pass++
    }
  }

  failures += row.fail
  table.push(row)
  say(`${r.name}: ${row.pass} of ${row.cases} cases equal, ${row.fail} failures, ${row.seconds.toFixed(1)} s`)
}

console.log('')
console.log('backend              cases  pass  fail  seconds')

if (!GOLDEN) {
  console.log(`${'reference'.padEnd(20)} ${String(cases.length).padStart(5)}     -     -  ${(refSeconds.t / 1000).toFixed(1).padStart(7)}`)
}

for (const t of table) {
  console.log(
    `${t.name.padEnd(20)} ${String(t.cases).padStart(5)} ${String(t.pass).padStart(5)} ${String(t.fail).padStart(5)}  ${t.seconds.toFixed(1).padStart(7)}`,
  )
}

console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures (${((Date.now() - started) / 1000).toFixed(1)} s)`)

if (failures > 0) {
  process.exit(1)
}
