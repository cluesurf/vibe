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
  reducedInner,
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

function reducedAt(members: number[], K: number[], R: number): ReducedEngine {
  const s = sector(cubic, members, R)
  const counts = new Int32Array(s.count)

  for (let i = 0; i < s.count; i++) {
    counts[i] = Math.floor(30 / (1 + s.shell[i]!))
  }

  return reducedEngine(s, U, K, { counts, nearest: 0, top: 30, alpha: 1, theta: 0.0731 }, 'vector')
}

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
  }

  say(`sea (${T.sites.length} docks, ${FULL * T.sites.length} amplitudes): ${runs} comparisons, ${failures} failures`)
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

console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${runs} comparisons, ${failures} failures, backends ${list.map(b => b.name).join(', ')}`)

if (failures > 0) {
  process.exit(1)
}
