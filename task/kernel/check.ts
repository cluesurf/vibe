// THE KERNEL EQUIVALENCE CHECK: every backend against the TypeScript reference, BYTE FOR BYTE, at 1, 2, 4, 8 and 16
// threads. Exits 1 on the first run with any difference, naming the primitive, the backend, the thread count, the first
// differing entry and both values. pnpm call task/kernel/check.ts [--quick]
//
//   primitives   each kernel primitive on fixed inputs (a golden-ratio Weyl stream, with exact zeros and negative
//                zeros planted, so the skip tests and signed zeros are exercised), on the real tables of a ball sector
//                and of a reduced sector at K = 0 and at K on an axis (nonzero root phases): js backend vs native at
//                every thread count, vs wasm, and vs the threaded wasm module at every thread count when it is built
//   engines      whole engine steps through the fast path against the ENGINE'S OWN functions, the true reference:
//                register-ball-reduced ballCycle, ballInner, ballFilter, ballRead; register-reduced reducedCycle in the
//                vector form (beats and cross pieces) at K = 0 and on the axis, reducedInner, autocorrelation;
//                register-sea seaCycle under the plain rule and under the dock, member and whole controls, pairAt,
//                flatCount on a fixed moving basis
//   wired        each engine's opt-in backend option (ballEngine, reducedEngine, seaCycle and flatCount with
//                { backend: 'native', threads }) against the same engine's default path, read only through the
//                engine's own functions, at 1, 4 and 16 threads (the ball at every native count)
//   holes        register-holes' three primitives (holeOneBody, holeBand, holePair) on fixed inputs, the pair piece's
//                FFT on the real tables of L = 2 and 6 (the direct sum) and L = 4 (the radix-4 butterfly), on the dense
//                engine's tables and the sorted store's; holeCycle and bandWeights through the js backend and wired
//                native (holeEngine's option) against the engine's own JavaScript, under the rule, the one-sign
//                control, a pair mask and the free rule; and the sorted store (register-sorted-holes), whose js
//                backend is its reference, against native at 1, 4 and 16 threads and wasm
//
// DETERMINISM: no random numbers. Nothing here is a tolerance: a difference of one unit in the last place fails.

import { available, kernel, type Kernel } from '@/code/kernel/index'
import { jsKernel } from '@/code/kernel/js'
import {
  adopt,
  fastAutocorrelation,
  fastBall,
  fastCycle,
  fastFilter,
  fastInner,
  fastRead,
  fastReduced,
  pairTablesOfBall,
  pairTablesOfReduced,
  type PairState,
} from '@/code/kernel/pair'
import { fastFlatCount, fastPairAt, fastSeaCycle } from '@/code/kernel/sea'
import { densePairTables, holeFourierTables, phaseTables } from '@/code/kernel/holes'
import type { HolePairTables, HolePhase } from '@/code/kernel/types'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { partnerProjector48, registerPiece, scaled, singletProjector24 } from '@/code/measure/spinor-register'
import {
  bandVectors,
  bandWeights,
  copyHoles,
  holeCycle,
  holeEngine,
  holeFrame,
  pairAngles,
  slaterStart,
  torusFourier,
  type HoleFrame,
  type HoleRule,
  type TorusFourier,
} from '@/code/measure/register-holes'
import {
  copySorted,
  sortedCycle,
  sortedEngine,
  sortedSlater,
  sortedUp,
} from '@/code/measure/register-sorted-holes'
import {
  ballCycle,
  ballEngine,
  ballFilter,
  ballGroup,
  ballInner,
  ballRead,
  ballSector,
  ballStart,
  cloneBall,
} from '@/code/measure/register-ball-reduced'
import {
  autocorrelation,
  cloneState,
  cubicGroup,
  littleGroup,
  newState,
  reducedCycle,
  reducedEngine,
  reducedFilter,
  reducedGram,
  reducedInner,
  reducedRead,
  sector,
  type ReducedEngine,
} from '@/code/measure/register-reduced'
import {
  flatCount,
  newPair,
  pairAt,
  seaCycle,
  sectorBases,
  torus,
  FULL,
  MODES,
  type Moving,
  type Pair,
  type SeaRule,
} from '@/code/measure/register-sea'

const quick = process.argv.includes('--quick')
const THREADS = [1, 2, 4, 8, 16]
const PHI = (Math.sqrt(5) - 1) / 2
const started = Date.now()

let runs = 0
let failures = 0

const bytes = (a: Float64Array): Buffer => Buffer.from(a.buffer, a.byteOffset, a.byteLength)

// byte equality: false when equal, else the first differing entry (-1 when only the lengths differ)
function differs(a: Float64Array, b: Float64Array): false | number {
  if (a.length === b.length && bytes(a).compare(bytes(b)) === 0) {
    return false
  }

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (!Object.is(a[i], b[i])) {
      return i
    }
  }

  return -1
}

function compare(label: string, want: Float64Array[], have: Float64Array[]): void {
  runs++

  for (let n = 0; n < want.length; n++) {
    const a = want[n]!
    const b = have[n]!
    const at = differs(a, b)

    if (at !== false) {
      failures++
      console.log(
        `FAIL ${label} [array ${n}]: lengths ${a.length} ${b.length}, first difference at ${at}: ${a[at]} vs ${b[at]}`,
      )

      return
    }
  }
}

// a fixed stream with exact zeros and negative zeros planted
function stream(n: number, offset: number, scale = 1): Float64Array {
  const out = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    const x = ((i + 1) * PHI + offset * 0.7548776662466927) % 1

    out[i] = i % 13 === 5 ? 0 : i % 17 === 3 ? -0 : scale * (x - 0.5)
  }

  return out
}

// the backends under test, each named with its thread count
function backends(): { name: string; k: Kernel }[] {
  const out: { name: string; k: Kernel }[] = []

  if (available('native')) {
    for (const n of THREADS) {
      out.push({ name: `native x${n}`, k: kernel('native', n) })
    }
  } else {
    failures++
    console.log('FAIL the native build is missing: pnpm call task/kernel/build.ts')
  }

  if (available('wasm')) {
    out.push({ name: 'wasm x1', k: kernel('wasm') })
  } else {
    failures++
    console.log('FAIL the wasm build is missing: pnpm call task/kernel/build.ts')
  }

  // the threaded wasm module is optional (pnpm call task/kernel/build.ts wasm-threads); checked when present
  if (available('wasm-threads')) {
    for (const n of THREADS) {
      out.push({ name: `wasm-threads x${n}`, k: kernel('wasm-threads', n) })
    }
  } else {
    console.log('note: no threaded wasm build, so the wasm-threads backend is not checked')
  }

  return out
}

const say = (what: string): void => console.log(`${what} (${((Date.now() - started) / 1000).toFixed(1)} s)`)

// ---- the engines under test ----

const U: [number, number] = [Math.cos(1.2952), Math.sin(1.2952)]
const group = ballGroup()
const ballSec = ballSector(group, quick ? 8 : 10)
const ball = ballEngine(ballSec, { u: U, tau: 0.0936, cap: 24, K: [0, 0, 0, 0] })
const cubic = cubicGroup()
const oh = [...cubic.elements.keys()]

const reducedCounts = new Map<ReducedEngine, Int32Array>()

function reducedAt(members: number[], K: number[], R: number): ReducedEngine {
  const s = sector(cubic, members, R)
  const counts = new Int32Array(s.count)

  for (let i = 0; i < s.count; i++) {
    counts[i] = Math.floor(30 / (1 + s.shell[i]!))
  }

  const e = reducedEngine(s, U, K, { counts, nearest: 0, top: 30, alpha: 1, theta: 0.0731 }, 'vector')

  reducedCounts.set(e, counts)

  return e
}

// the same engine (same sector, counts, momentum and form) with the opt-in backend: the wired path, read only through
// the engine's own functions
const wiredReduced = (e: ReducedEngine, threads: number): ReducedEngine =>
  reducedEngine(
    e.s,
    e.u,
    e.K,
    { counts: reducedCounts.get(e)!, nearest: 0, top: 30, alpha: 1, theta: 0.0731 },
    e.form,
    { backend: 'native', threads },
  )

// the wired paths are held to the default paths at these native thread counts
const WIRED = [1, 4, 16]

const redZero = reducedAt(oh, [0, 0, 0, 0], quick ? 7 : 9)
const axisK = [0.21, 0, 0, 0]
const redAxis = reducedAt(littleGroup(cubic, axisK), axisK, quick ? 5 : 7)

function fillState(st: PairState, offset: number): void {
  st.re.set(stream(st.re.length, offset))
  st.im.set(stream(st.im.length, offset + 1))
}

// ---- 1. the primitives ----

function primitives(list: { name: string; k: Kernel }[]): void {
  const ref = jsKernel()
  const tableSets = [
    { name: 'ball', t: pairTablesOfBall(ball) },
    { name: 'reduced K 0', t: pairTablesOfReduced(redZero) },
    { name: 'reduced axis', t: pairTablesOfReduced(redAxis) },
  ]

  for (const { name, t } of tableSets) {
    const N = t.plusRep.length / 24
    const srcRe = stream(N * 256, 1)
    const srcIm = stream(N * 256, 2)
    const fieldRe = stream(N * 64, 3)
    const fieldIm = stream(N * 64, 4)
    const refOp = ref.pairOp(t)
    const ops = list.map(b => b.k.pairOp(t))

    for (const [srcOff, stride, from] of [
      [0, 256, 'state A'],
      [64, 256, 'state B'],
      [128, 256, 'state X'],
      [192, 256, 'state D'],
      [0, 64, 'field'],
    ] as const) {
      for (let tt = 0; tt < 4; tt++) {
        for (const member of [1, 2] as const) {
          for (const dagger of [false, true]) {
            const sR = stride === 256 ? srcRe : fieldRe
            const sI = stride === 256 ? srcIm : fieldIm
            const wantR = new Float64Array(N * 64)
            const wantI = new Float64Array(N * 64)

            ref.conv(refOp, sR, sI, srcOff, stride, tt, wantR, wantI, member, dagger)
            list.forEach((b, n) => {
              const haveR = stream(N * 64, 9)
              const haveI = stream(N * 64, 10)

              b.k.conv(ops[n]!, sR, sI, srcOff, stride, tt, haveR, haveI, member, dagger)
              compare(
                `conv ${name} ${from} t ${tt} member ${member}${dagger ? ' dagger' : ''} ${b.name}`,
                [wantR, wantI],
                [haveR, haveI],
              )
            })
          }
        }
      }
    }

    // the site-local pieces on the same N
    const f = Array.from({ length: 10 }, (_, j) => stream(N * 64, 20 + j))
    const beta = stream(2 * N, 40)
    const cross = stream(2 * N, 41)

    for (const mainOff of [0, 192] as const) {
      const wantR = Float64Array.from(srcRe)
      const wantI = Float64Array.from(srcIm)
      const [a, b2, c, d, e, g, h, i, j, k] = f as [
        Float64Array,
        Float64Array,
        Float64Array,
        Float64Array,
        Float64Array,
        Float64Array,
        Float64Array,
        Float64Array,
        Float64Array,
        Float64Array,
      ]

      ref.pairBeat(wantR, wantI, a, b2, c, d, e, g, h, i, j, k, beta, U[0] - 1, U[1], mainOff)
      list.forEach(b => {
        const haveR = Float64Array.from(srcRe)
        const haveI = Float64Array.from(srcIm)

        b.k.pairBeat(haveR, haveI, a, b2, c, d, e, g, h, i, j, k, beta, U[0] - 1, U[1], mainOff)
        compare(`pairBeat ${name} main ${mainOff} ${b.name}`, [wantR, wantI], [haveR, haveI])
      })
    }

    for (const own of [64, 128] as const) {
      const wantR = Float64Array.from(srcRe)
      const wantI = Float64Array.from(srcIm)

      ref.crossApply(wantR, wantI, f[0]!, f[1]!, f[2]!, f[3]!, f[4]!, f[5]!, cross, own)
      list.forEach(b => {
        const haveR = Float64Array.from(srcRe)
        const haveI = Float64Array.from(srcIm)

        b.k.crossApply(haveR, haveI, f[0]!, f[1]!, f[2]!, f[3]!, f[4]!, f[5]!, cross, own)
        compare(`crossApply ${name} own ${own} ${b.name}`, [wantR, wantI], [haveR, haveI])
      })
    }

    for (const off of [0, 64, 128, 192] as const) {
      const wantR = Float64Array.from(srcRe)
      const wantI = Float64Array.from(srcIm)

      ref.blockAdd(wantR, wantI, fieldRe, fieldIm, off)
      list.forEach(b => {
        const haveR = Float64Array.from(srcRe)
        const haveI = Float64Array.from(srcIm)

        b.k.blockAdd(haveR, haveI, fieldRe, fieldIm, off)
        compare(`blockAdd ${name} off ${off} ${b.name}`, [wantR, wantI], [haveR, haveI])
      })
    }

    {
      const bRe = stream(N * 256, 50)
      const bIm = stream(N * 256, 51)
      const wantR = new Float64Array(N)
      const wantI = new Float64Array(N)

      ref.blockInner(srcRe, srcIm, bRe, bIm, wantR, wantI)
      list.forEach(b => {
        const haveR = new Float64Array(N)
        const haveI = new Float64Array(N)

        b.k.blockInner(srcRe, srcIm, bRe, bIm, haveR, haveI)
        compare(`blockInner ${name} ${b.name}`, [wantR, wantI], [haveR, haveI])
      })
    }

    {
      const wantR = Float64Array.from(srcRe)
      const wantI = Float64Array.from(srcIm)
      const xr = stream(N * 256, 60)
      const xi = stream(N * 256, 61)

      ref.axpy(wantR, wantI, xr, xi, 0.3171, -1.4142)
      ref.scale(wantR, wantI, 0.7071067811865476)
      list.forEach(b => {
        const haveR = Float64Array.from(srcRe)
        const haveI = Float64Array.from(srcIm)

        b.k.axpy(haveR, haveI, xr, xi, 0.3171, -1.4142)
        b.k.scale(haveR, haveI, 0.7071067811865476)
        compare(`axpy then scale ${name} ${b.name}`, [wantR, wantI], [haveR, haveI])
      })
    }
  }

  say(`primitives: ${runs} comparisons, ${failures} failures`)
}

// ---- 2. the engines ----

function ballEngines(list: { name: string; k: Kernel }[]): void {
  const start = ballStart(ballSec, V => Math.exp(-(((V - 4) / 0.7) ** 2)))
  const cycles = quick ? 2 : 3

  // the witness: the engine's own functions
  const want = cloneBall(start)

  for (let c = 0; c < cycles; c++) {
    ballCycle(ball, want)
  }

  const wantInner = ballInner(ball, start, want)
  const wantFilter = ballFilter(ball, start, 1.2592, 6)
  const wantRead = ballRead(ball, wantFilter)

  for (const b of [{ name: 'js', k: jsKernel() }, ...list]) {
    const f = fastBall(ball, b.k)
    // adopted: on a backend with its own memory the state lives there, so the no-copy path is the one checked here
    const have = adopt(f, start)

    for (let c = 0; c < cycles; c++) {
      fastCycle(f, have)
    }

    compare(`ballCycle x${cycles} radius ${ballSec.radius} ${b.name}`, [want.re, want.im], [have.re, have.im])

    const hi = fastInner(f, start, have)

    compare(`ballInner ${b.name}`, [Float64Array.from(wantInner)], [Float64Array.from(hi)])

    const hf = fastFilter(f, start, 1.2592, 6)

    compare(`ballFilter S 6 ${b.name}`, [wantFilter.re, wantFilter.im], [hf.re, hf.im])

    const hr = fastRead(f, hf)

    compare(
      `ballRead ${b.name}`,
      [Float64Array.from([...wantRead.lambda, wantRead.phase, wantRead.residual])],
      [Float64Array.from([...hr.lambda, hr.phase, hr.residual])],
    )
  }

  // the wired engine: ballEngine's opt-in backend, read only through the engine's own functions
  for (const b of list.filter(x => x.k.backend === 'native')) {
    const wired = ballEngine(ballSec, ball.params, { backend: 'native', threads: b.k.threads })
    const have = cloneBall(start)

    for (let c = 0; c < cycles; c++) {
      ballCycle(wired, have)
    }

    compare(`wired ballEngine ballCycle x${cycles} ${b.name}`, [want.re, want.im], [have.re, have.im])
    compare(
      `wired ballEngine ballInner ${b.name}`,
      [Float64Array.from(wantInner)],
      [Float64Array.from(ballInner(wired, start, have))],
    )

    const hf = ballFilter(wired, start, 1.2592, 6)
    const hr = ballRead(wired, hf)

    compare(`wired ballEngine ballFilter ${b.name}`, [wantFilter.re, wantFilter.im], [hf.re, hf.im])
    compare(
      `wired ballEngine ballRead ${b.name}`,
      [Float64Array.from([...wantRead.lambda, wantRead.phase, wantRead.residual])],
      [Float64Array.from([...hr.lambda, hr.phase, hr.residual])],
    )
  }

  say(`ball engine (${ballSec.count} representatives): ${runs} comparisons, ${failures} failures`)
}

function reducedEngines(list: { name: string; k: Kernel }[]): void {
  for (const [label, e] of [
    ['K 0 O_h', redZero],
    ['axis C4v', redAxis],
  ] as const) {
    const start = newState(e.s)

    fillState(start, 70)

    const cycles = quick ? 2 : 3
    const want = cloneState(start)

    for (let c = 0; c < cycles; c++) {
      reducedCycle(e, want)
    }

    const wantInner = reducedInner(e, start, want)
    const wantAuto = autocorrelation(e, start, 3)

    for (const b of [{ name: 'js', k: jsKernel() }, ...list]) {
      const f = fastReduced(e, b.k)
      const have = adopt(f, start)

      for (let c = 0; c < cycles; c++) {
        fastCycle(f, have)
      }

      compare(`reducedCycle vector x${cycles} ${label} ${b.name}`, [want.re, want.im], [have.re, have.im])
      compare(`reducedInner ${label} ${b.name}`, [Float64Array.from(wantInner)], [Float64Array.from(fastInner(f, start, have))])

      const ha = fastAutocorrelation(f, start, 3)

      compare(`autocorrelation 3 ${label} ${b.name}`, [wantAuto.re, wantAuto.im], [ha.re, ha.im])
    }

    // the wired engine: reducedEngine's opt-in backend against its default, through the engine's own functions only
    const wantGram = reducedGram(e, start)
    const wantFilter = reducedFilter(e, start, 1.2592, 5)
    const wantRead = reducedRead(e, wantFilter)

    for (const n of WIRED) {
      const w = wiredReduced(e, n)
      const have = cloneState(start)

      for (let c = 0; c < cycles; c++) {
        reducedCycle(w, have)
      }

      compare(`wired reducedCycle x${cycles} ${label} native x${n}`, [want.re, want.im], [have.re, have.im])

      const hg = reducedGram(w, start)

      compare(`wired reducedGram ${label} native x${n}`, [wantGram.re, wantGram.im], [hg.re, hg.im])
      compare(
        `wired reducedInner ${label} native x${n}`,
        [Float64Array.from(wantInner)],
        [Float64Array.from(reducedInner(w, start, have))],
      )

      const ha = autocorrelation(w, start, 3)

      compare(`wired autocorrelation 3 ${label} native x${n}`, [wantAuto.re, wantAuto.im], [ha.re, ha.im])

      const hf = reducedFilter(w, start, 1.2592, 5)
      const hr = reducedRead(w, hf)

      compare(`wired reducedFilter S 5 ${label} native x${n}`, [wantFilter.re, wantFilter.im], [hf.re, hf.im])
      compare(
        `wired reducedRead ${label} native x${n}`,
        [Float64Array.from([...wantRead.lambda, wantRead.phase, wantRead.residual])],
        [Float64Array.from([...hr.lambda, hr.phase, hr.residual])],
      )
    }

    say(`reduced engine ${label} (${e.s.count} representatives): ${runs} comparisons, ${failures} failures`)
  }
}

function seaEngines(list: { name: string; k: Kernel }[]): void {
  const T = torus(4)
  const E = sectorBases()
  const start = newPair(T)

  start.re.set(stream(start.re.length, 80, 1e-3))
  start.im.set(stream(start.im.length, 81, 1e-3))

  const base: SeaRule = { u: U, string: 0.0936, cap: 8, contact: 0.41, dock: null, member: false }
  const rules: [string, SeaRule][] = [
    ['plain', base],
    ['dock and member', { ...base, dock: [Math.cos(0.3), Math.sin(0.3)], member: true }],
    ['whole with kernel', { ...base, whole: true, kernel: stream(T.sites.length, 82) }],
  ]
  const clonePair = (p: Pair): Pair => ({ re: Float64Array.from(p.re), im: Float64Array.from(p.im) })
  // sea runs are 75 MB a state: the thread counts 1, 4 and 16 carry it, with js and wasm
  const SEA = new Set(['native x1', 'native x4', 'native x16', 'wasm x1', 'wasm-threads x1', 'wasm-threads x16'])
  const seaList = [{ name: 'js', k: jsKernel() }, ...list.filter(b => SEA.has(b.name))]

  for (const [label, rule] of quick ? rules.slice(0, 1) : rules) {
    const want = clonePair(start)

    seaCycle(T, rule, E, want)

    for (const b of seaList) {
      const have = clonePair(start)

      fastSeaCycle(b.k, T, rule, E, have)
      compare(`seaCycle ${label} ${b.name}`, [want.re, want.im], [have.re, have.im])
    }

    // the wired engine: seaCycle's opt-in backend against its default
    for (const n of WIRED) {
      const have = clonePair(start)

      seaCycle(T, rule, E, have, undefined, { backend: 'native', threads: n })
      compare(`wired seaCycle ${label} native x${n}`, [want.re, want.im], [have.re, have.im])
    }

    say(`sea cycle ${label}: ${runs} comparisons, ${failures} failures`)
  }

  for (const j of [0, 5, 77]) {
    const want = pairAt(T, start, j)

    for (const b of seaList) {
      const have = fastPairAt(b.k, T, start, j)

      compare(`pairAt ${j} ${b.name}`, [want.re, want.im], [have.re, have.im])
    }
  }

  if (!quick) {
    // flatCount on a fixed moving basis of rank 3 (the arithmetic does not care whether the basis is W(q))
    const mv: Moving = { re: [], im: [], rank: [], accepted: 0, rejected: 0, sOutsideW: 0 }

    T.momenta.forEach((_, j) => {
      mv.re.push(stream(MODES * 3, 90 + j))
      mv.im.push(stream(MODES * 3, 300 + j))
      mv.rank.push(3)
    })

    const want = flatCount(T, mv, start)

    for (const b of seaList.filter(x => x.name === 'js' || x.name === 'native x16')) {
      const have = fastFlatCount(b.k, T, mv, start)

      compare(`flatCount ${b.name}`, [Float64Array.from([want.nF, want.fourier])], [Float64Array.from([have.nF, have.fourier])])
    }

    // the wired engine: flatCount's opt-in backend against its default
    for (const n of WIRED) {
      const have = flatCount(T, mv, start, { backend: 'native', threads: n })

      compare(
        `wired flatCount native x${n}`,
        [Float64Array.from([want.nF, want.fourier])],
        [Float64Array.from([have.nF, have.fourier])],
      )
    }
  }

  say(`sea (${T.sites.length} docks, ${FULL * T.sites.length} amplitudes): ${runs} comparisons, ${failures} failures`)
}

// ---- 3. register-holes and the sorted store ----

const holeU = ((): [number, number] => {
  const th = unitAngle(ringUnit(-1, 4))

  return [Math.cos(th), Math.sin(th)]
})()
const holePs = [
  registerPiece(scaled(singletProjector24(), 24), holeU),
  registerPiece(scaled(partnerProjector48(), 48), [holeU[0], -holeU[1]]),
]
const holeFrames = new Map<number, HoleFrame>()
const frameAt = (L: number): HoleFrame => {
  let fr = holeFrames.get(L)

  if (!fr) {
    fr = holeFrame(torus(L), holePs, 8)
    holeFrames.set(L, fr)
  }

  return fr
}
const holeAngle = (L: number): Float64Array =>
  pairAngles(torus(L), -unitAngle(ringUnit(-2, 1)), 8, -2 * unitAngle(ringUnit(2, 0)))

// the member momenta of every tuple at total 0, from the Fourier tables alone (register-holes memberMomenta's loop)
function momentaOf(F: TorusFourier, n: number): Int32Array {
  const N = F.N
  const tuples = N ** (n - 1)
  const out = new Int32Array(tuples * n)

  for (let T = 0; T < tuples; T++) {
    let rest = T
    let acc = 0

    for (let i = n - 2; i >= 0; i--) {
      const j = rest % N

      rest = Math.floor(rest / N)
      out[T * n + i] = j
      acc = F.sum[acc * N + F.neg[j]!]!
    }

    out[T * n + n - 1] = acc
  }

  return out
}

// the three hole primitives alone, on fixed inputs: the transfers and projectors a Weyl stream with exact and negative
// zeros planted (so the skip of zero entries is exercised), the pair piece on the real Fourier tables of L = 2 and L = 6
// (the direct sum, with sin(pi) = 1.2e-16 and six-point twiddles) and L = 4 (the radix-4 butterfly), on the dense
// engine's tables (every pair, and one pair mask) and the sorted store's (L = 2 four holes, L = 4 three holes), with the
// real pair angles at both signs and with a stream of phases
function holePrimitives(list: { name: string; k: Kernel }[]): void {
  const ref = jsKernel()
  const fr2 = frameAt(2)
  const fr4 = frameAt(4)
  const F6 = torusFourier(torus(6))
  const fake6 = { fourier: F6, fiber: 8, sector: fr4.sector }
  const f = 8

  for (const { name, F, n } of [
    { name: 'L 2 n 3', F: fr2.fourier, n: 3 },
    { name: 'L 2 n 4', F: fr2.fourier, n: 4 },
    { name: 'L 4 n 2', F: fr4.fourier, n: 2 },
  ]) {
    const mom = momentaOf(F, n)
    const size = (mom.length / n) * f ** n
    const re0 = stream(size, 110)
    const im0 = stream(size, 111)
    const aRe = stream(F.N * f * f, 112)
    const aIm = stream(F.N * f * f, 113)
    const want = { re: Float64Array.from(re0), im: Float64Array.from(im0) }
    const wantPart = new Float64Array(mom.length)

    ref.holeOneBody(want.re, want.im, mom, n, f, aRe, aIm)
    ref.holeBand(re0, im0, mom, n, f, aRe, aIm, wantPart)
    list.forEach(b => {
      const have = { re: Float64Array.from(re0), im: Float64Array.from(im0) }
      const part = stream(mom.length, 114)

      b.k.holeOneBody(have.re, have.im, mom, n, f, aRe, aIm)
      compare(`holeOneBody ${name} ${b.name}`, [want.re, want.im], [have.re, have.im])
      b.k.holeBand(re0, im0, mom, n, f, aRe, aIm, part)
      compare(`holeBand ${name} ${b.name}`, [wantPart], [part])
    })
  }

  const pairCases: { name: string; F: TorusFourier; tables: HolePairTables; masks: number[]; n: number; angle: Float64Array }[] = [
    { name: 'dense L 2 n 3', F: fr2.fourier, ...densePairTables(fr2, 3), n: 3, angle: holeAngle(2) },
    {
      name: 'dense L 2 n 3 mask 0-2',
      F: fr2.fourier,
      ...densePairTables(fr2, 3, [
        [false, false, true],
        [false, false, false],
        [false, false, false],
      ]),
      n: 3,
      angle: holeAngle(2),
    },
    { name: 'dense L 4 n 2', F: fr4.fourier, ...densePairTables(fr4, 2), n: 2, angle: holeAngle(4) },
    { name: 'dense L 6 n 2', F: F6, ...densePairTables(fake6, 2), n: 2, angle: stream(F6.N, 115) },
  ]

  for (const [label, se] of [
    ['sorted L 2 n 4', sortedEngine(fr2, 4, 0)],
    ['sorted L 4 n 3', sortedEngine(fr4, 3, 0)],
  ] as const) {
    pairCases.push({ name: label, F: se.frame.fourier, tables: se.pair, masks: se.masks, n: se.n, angle: holeAngle(se.frame.t.L) })
  }

  for (const c of pairCases) {
    const fourier = holeFourierTables(c.F)
    const rows = c.tables.tOf.length / c.tables.psign.length
    const size = rows * f ** c.n
    const re0 = stream(size, 120)
    const im0 = stream(size, 121)
    const tuples = c.F.N ** (c.n - 1)
    const streamed = {
      cos: stream(c.masks.length * tuples, 122),
      sin: stream(c.masks.length * tuples, 123),
      skip: Int8Array.from({ length: c.masks.length * tuples }, (_, t) => (t % 7 === 2 ? 1 : 0)),
    }
    const phases: [string, HolePhase][] = [
      ['sign +1', phaseTables(c.F, c.n, c.angle, 1, undefined, c.masks)],
      ['sign -1', phaseTables(c.F, c.n, c.angle, -1, undefined, c.masks)],
      ['streamed phases', streamed],
    ]

    for (const [pl, ph] of phases) {
      const want = { re: Float64Array.from(re0), im: Float64Array.from(im0) }

      ref.holePair(want.re, want.im, fourier, c.tables, ph)
      list.forEach(b => {
        const have = { re: Float64Array.from(re0), im: Float64Array.from(im0) }

        b.k.holePair(have.re, have.im, fourier, c.tables, ph)
        compare(`holePair ${c.name} ${pl} ${b.name}`, [want.re, want.im], [have.re, have.im])
      })
    }
  }

  say(`hole primitives: ${runs} comparisons, ${failures} failures`)
}

// the engines: register-holes' kernel path against the engine's OWN JavaScript (holeCycle's pairPhases, with its own
// dft4d, and oneBody; bandWeights), through the js backend and wired native at 1, 4 and 16 threads, under the rule, the
// one-sign control (angle2), a pair mask and the free rule; and the sorted store's js backend (its reference) against
// native at every wired count and wasm
function holeEngines(list: { name: string; k: Kernel }[]): void {
  const cases = quick ? [{ L: 4, n: 2, cycles: 2 }] : [{ L: 4, n: 2, cycles: 3 }, { L: 4, n: 3, cycles: 2 }]

  for (const { L, n, cycles } of cases) {
    const fr = frameAt(L)
    const F = fr.fourier
    const angle = holeAngle(L)
    const e = holeEngine(fr, n, 0)
    const js = n === 3 ? [1, 2, F.sum[F.neg[1]! * F.N + F.neg[2]!]!] : [1, F.neg[1]!]
    const start = slaterStart(e, js, js.map(j => bandVectors(fr, j).up[0]!))
    const mask = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === 0 && j === n - 1))
    const rules: [string, HoleRule, number][] = [
      ['rule', { angle }, cycles],
      ['one-sign control', { angle, angle2: angle.map(x => -x) }, 1],
      ['pair mask', { angle, pairs: mask }, 1],
      ['free', { angle: null }, 1],
    ]
    const engines: { name: string; e: ReturnType<typeof holeEngine> }[] = [
      { name: 'js', e: holeEngine(fr, n, 0, { backend: 'js' }) },
      ...WIRED.map(t => ({ name: `wired native x${t}`, e: holeEngine(fr, n, 0, { backend: 'native', threads: t }) })),
      ...(n === 2
        ? list
            .filter(b => b.k.backend !== 'native')
            .map(b => ({ name: b.name, e: holeEngine(fr, n, 0, { backend: b.k.backend, threads: b.k.threads }) }))
        : []),
    ]

    for (const [label, rule, c] of rules) {
      const want = copyHoles(start)

      for (let k = 0; k < c; k++) {
        holeCycle(e, rule, want)
      }

      const wantBand = bandWeights(e, want)

      for (const w of engines) {
        const have = copyHoles(start)

        for (let k = 0; k < c; k++) {
          holeCycle(w.e, rule, have)
        }

        compare(`holeCycle x${c} L ${L} n ${n} ${label} ${w.name}`, [want.re, want.im], [have.re, have.im])
        compare(`bandWeights L ${L} n ${n} ${label} ${w.name}`, [wantBand], [bandWeights(w.e, have)])
      }
    }

    say(`hole engine L ${L} n ${n}: ${runs} comparisons, ${failures} failures`)
  }

  // the sorted store: its js backend is the reference
  const sortedCases = quick ? [{ L: 2, n: 4 }] : [{ L: 2, n: 4 }, { L: 4, n: 3 }]

  for (const { L, n } of sortedCases) {
    const fr = frameAt(L)
    const F = fr.fourier
    const angle = holeAngle(L)
    const ref = sortedEngine(fr, n, 0)
    const js = [1, 2]

    if (n === 4) {
      js.push(3, F.sum[F.sum[F.neg[1]! * F.N + F.neg[2]!]! * F.N + F.neg[3]!]!)
    } else {
      js.push(F.sum[F.neg[1]! * F.N + F.neg[2]!]!)
    }

    const start = sortedSlater(ref, js, js.map(j => bandVectors(fr, j).up[0]!))
    const cycles = 2
    const want = copySorted(start)

    for (let c = 0; c < cycles; c++) {
      sortedCycle(ref, { angle }, want)
    }

    const wantUp = Float64Array.from([sortedUp(ref, want)])
    const others = [
      ...WIRED.map(t => ({ name: `native x${t}`, o: { backend: 'native' as const, threads: t } })),
      ...list.filter(b => b.k.backend !== 'native').map(b => ({ name: b.name, o: { backend: b.k.backend, threads: b.k.threads } })),
    ]

    for (const w of others) {
      const se = sortedEngine(fr, n, 0, w.o)
      const have = copySorted(start)

      for (let c = 0; c < cycles; c++) {
        sortedCycle(se, { angle }, have)
      }

      compare(`sortedCycle x${cycles} L ${L} n ${n} ${w.name}`, [want.re, want.im], [have.re, have.im])
      compare(`sortedUp L ${L} n ${n} ${w.name}`, [wantUp], [Float64Array.from([sortedUp(se, have)])])
    }

    say(`sorted store L ${L} n ${n} (${ref.rows} rows): ${runs} comparisons, ${failures} failures`)
  }
}

// ---- run ----

// the comparison's own control: one unit in the last place, and -0 against +0, must each fail it
{
  const a = Float64Array.from([1, 0, 2])
  const ulp = Float64Array.from([1, 0, 2 + 2 ** -51])
  const zero = Float64Array.from([1, -0, 2])

  if (differs(a, ulp) !== 2 || differs(a, zero) !== 1 || differs(a, Float64Array.from(a)) !== false) {
    console.log('FAIL the comparison does not see a one-ulp or a signed-zero difference')
    process.exit(1)
  }

  console.log('control: the comparison sees one ulp and a signed zero')
}

const list = backends()

primitives(list)
ballEngines(list)
reducedEngines(list)
seaEngines(list)
holePrimitives(list)
holeEngines(list)

console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${runs} comparisons, ${failures} failures, backends ${list.map(b => b.name).join(', ')}`)

if (failures > 0) {
  process.exit(1)
}
