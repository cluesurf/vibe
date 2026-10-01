// THE KERNEL BENCHMARK: seconds per engine cycle on each backend and thread count, with the machine's load printed
// beside every row (the machine carries other experiment runs, and a busy core understates the gain). Each fast run's
// final state is also compared byte for byte with the js run's, so a timing is never reported for a wrong answer.
//
//   pnpm call task/kernel/bench.ts ball [radius] [cycles]      register-ball-reduced (default radius 24)
//   pnpm call task/kernel/bench.ts reduced [R] [cycles]        register-reduced, vector form, O_h at K = 0 (default 30)
//   pnpm call task/kernel/bench.ts sea [cycles]                register-sea on the L = 4 torus
//   pnpm call task/kernel/bench.ts holes [n] [cycles]          register-holes, n holes on L = 4 (default 3)
//   pnpm call task/kernel/bench.ts sorted [n] [cycles]         the sorted store, n holes on L = 4 (default 4); no js
//                                                              engine reaches four holes, so each run is compared with
//                                                              the first backend's (native, which the check holds to js)
//   pnpm call task/kernel/bench.ts primitive [radius]          conv alone, kernel time without the cycle around it
//
// BENCH_BACKENDS=native,hip keeps only the backends whose names start with one of those; BENCH_THREADS=1,8,20 sets the
// native thread counts. A cycle loop runs through fastCycles, fastSeaCycles or fastHoleCycles, so on a GPU backend the
// state is uploaded once, held on the device for every timed cycle, and downloaded once: the time a cycle includes
// its share of those two copies. One untimed cycle first warms every backend (a GPU backend uploads its tables then).
// The engine states are adopted by each fast engine (code/kernel/pair adopt), so the threaded wasm module runs on its
// own memory with no copy.

import { cpus, loadavg } from 'node:os'
import { gpuInfo } from '@/code/kernel/gpu'
import { available, kernel, onDevice, type Backend, type Kernel } from '@/code/kernel/index'
import { adopt, fastBall, fastCycles, fastReduced, pairTablesOfBall } from '@/code/kernel/pair'
import { fastHoleCycles } from '@/code/kernel/holes'
import { fastSeaCycles } from '@/code/kernel/sea'
import { ballCycle, ballEngine, ballGroup, ballSector, ballStart, cloneBall } from '@/code/measure/register-ball-reduced'
import { cloneState, cubicGroup, newState, reducedCycle, reducedEngine, sector } from '@/code/measure/register-reduced'
import { newPair, seaCycle, sectorBases, torus, type SeaRule } from '@/code/measure/register-sea'
import {
  bandVectors,
  copyHoles,
  holeCycle,
  holeEngine,
  holeFrame,
  pairAngles,
  slaterStart,
} from '@/code/measure/register-holes'
import { copySorted, sortedCycle, sortedEngine, sortedSlater } from '@/code/measure/register-sorted-holes'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { partnerProjector48, registerPiece, scaled, singletProjector24 } from '@/code/measure/spinor-register'

const what = process.argv[2] ?? 'ball'
const THREADS = process.env.BENCH_THREADS
  ? process.env.BENCH_THREADS.split(',').map(Number)
  : [...new Set([1, 2, 4, 8, 12, 16, cpus().length])].sort((a, b) => a - b)
const U: [number, number] = [Math.cos(1.2952), Math.sin(1.2952)]
const PHI = (Math.sqrt(5) - 1) / 2
const load = (): string => loadavg().map(x => x.toFixed(1)).join(' ')
const same = (a: Float64Array, b: Float64Array): boolean =>
  Buffer.from(a.buffer, a.byteOffset, a.byteLength).compare(Buffer.from(b.buffer, b.byteOffset, b.byteLength)) === 0

const only = process.env.BENCH_BACKENDS?.split(',')
const GPUS: Backend[] = ['hip', 'cuda', 'gpu-emu']
const backends = (): { name: string; k: Kernel }[] =>
  [
    ...(available('native') ? THREADS.map(n => ({ name: `native x${n}`, k: () => kernel('native', n) })) : []),
    ...(available('wasm') ? [{ name: 'wasm x1', k: () => kernel('wasm') }] : []),
    ...(available('wasm-threads')
      ? THREADS.map(n => ({ name: `wasm-threads x${n}`, k: () => kernel('wasm-threads', n) }))
      : []),
    ...GPUS.filter(g => (!only || only.some(o => g.startsWith(o))) && available(g)).map(g => ({
      name: g,
      k: () => kernel(g),
    })),
  ]
    .filter(b => !only || only.some(o => b.name.startsWith(o)))
    .map(b => ({ name: b.name, k: b.k() }))

function row(name: string, seconds: number, cycles: number, base: number | null, ok: boolean | null, versus = 'js'): void {
  const per = seconds / cycles

  console.log(
    `${name.padEnd(16)} ${per.toFixed(4).padStart(9)} s a cycle  ${base ? `${(base / per).toFixed(1).padStart(7)}x` : '        '}  ${ok === null ? '' : ok ? `bytes equal ${versus}` : `BYTES DIFFER from ${versus}`}  load ${load()}`,
  )
}

console.log(`${cpus().length} cores (${cpus()[0]?.model ?? 'unknown'}), load ${load()} at start`)

const list = backends()

for (const g of GPUS) {
  if (list.some(b => b.name === g)) {
    console.log(`${g}: ${gpuInfo(g as 'hip' | 'cuda' | 'gpu-emu')}`)
  }
}

if (what === 'ball' || what === 'primitive') {
  const radius = Number(process.argv[3] ?? 24)
  const cycles = Number(process.argv[4] ?? 8)
  const s = ballSector(ballGroup(), radius)
  const e = ballEngine(s, { u: U, tau: 0.0936, cap: 24, K: [0, 0, 0, 0] })
  const start = ballStart(s, V => Math.exp(-(((V - 8) / 0.7) ** 2)))

  console.log(`register-ball-reduced radius ${radius}: ${s.count} representatives, ${s.sites} sites`)

  if (what === 'primitive') {
    const t = pairTablesOfBall(e)
    const outRe = new Float64Array(s.count * 64)
    const outIm = new Float64Array(s.count * 64)
    const reps = 20
    const js = kernel('js')
    const jsOp = js.pairOp(t)
    let a = performance.now()

    for (let r = 0; r < 4; r++) js.conv(jsOp, start.re, start.im, 0, 256, 0, outRe, outIm, 1, false)

    const base = (performance.now() - a) / 4000

    row('js conv', base, 1, null, null)

    for (const b of list) {
      const op = b.k.pairOp(t)

      // a GPU backend's conv with the source and output held, so the time is the kernel's and not the copies'
      onDevice(b.k, [start.re, start.im, outRe, outIm], () => {
        b.k.conv(op, start.re, start.im, 0, 256, 0, outRe, outIm, 1, false)
        a = performance.now()

        for (let r = 0; r < reps; r++) b.k.conv(op, start.re, start.im, 0, 256, 0, outRe, outIm, 1, false)

        row(`${b.name}`, (performance.now() - a) / 1000 / reps, 1, base, null)
      })
    }
  } else {
    const jsCycles = Math.max(1, Math.min(2, cycles))
    const want = cloneBall(start)
    let a = performance.now()

    for (let c = 0; c < jsCycles; c++) ballCycle(e, want)

    const base = (performance.now() - a) / 1000 / jsCycles

    row('js engine', base * jsCycles, jsCycles, null, null)

    for (const b of list) {
      const f = fastBall(e, b.k)
      const n = b.name === 'wasm x1' ? jsCycles : cycles

      fastCycles(f, adopt(f, start), 1)

      const have = adopt(f, start)
      const check = adopt(f, start)

      a = performance.now()
      fastCycles(f, have, n)

      const seconds = (performance.now() - a) / 1000

      fastCycles(f, check, jsCycles)
      row(b.name, seconds, n, base, same(check.re, want.re) && same(check.im, want.im))
    }
  }
}

if (what === 'reduced') {
  const R = Number(process.argv[3] ?? 30)
  const cycles = Number(process.argv[4] ?? 6)
  const g = cubicGroup()
  const s = sector(g, [...g.elements.keys()], R)
  const counts = new Int32Array(s.count)

  for (let i = 0; i < s.count; i++) counts[i] = Math.floor(30 / (1 + s.shell[i]!))

  const e = reducedEngine(s, U, [0, 0, 0, 0], { counts, nearest: 0, top: 30, alpha: 1, theta: 0.0731 }, 'vector')
  const start = newState(s)

  for (let i = 0; i < start.re.length; i++) {
    start.re[i] = (((i + 1) * PHI) % 1) - 0.5
    start.im[i] = (((i + 7) * PHI) % 1) - 0.5
  }

  console.log(`register-reduced vector form R ${R}: ${s.count} representatives`)

  const want = cloneState(start)
  let a = performance.now()

  reducedCycle(e, want)

  const base = (performance.now() - a) / 1000

  row('js engine', base, 1, null, null)

  for (const b of list) {
    const f = fastReduced(e, b.k)
    const n = b.name === 'wasm x1' ? 1 : cycles

    fastCycles(f, adopt(f, start), 1)

    const have = adopt(f, start)
    const check = adopt(f, start)

    a = performance.now()
    fastCycles(f, have, n)

    const seconds = (performance.now() - a) / 1000

    fastCycles(f, check, 1)
    row(b.name, seconds, n, base, same(check.re, want.re) && same(check.im, want.im))
  }
}

if (what === 'sea') {
  const cycles = Number(process.argv[3] ?? 3)
  const T = torus(4)
  const E = sectorBases()
  const start = newPair(T)
  const rule: SeaRule = { u: U, string: 0.0936, cap: 8, contact: 0.41, dock: null, member: false }

  for (let i = 0; i < start.re.length; i++) {
    start.re[i] = ((((i + 1) * PHI) % 1) - 0.5) * 1e-3
    start.im[i] = ((((i + 7) * PHI) % 1) - 0.5) * 1e-3
  }

  console.log(`register-sea L 4: ${T.sites.length} docks, ${start.re.length} amplitudes`)

  const want = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }
  const spare = newPair(T)
  let a = performance.now()

  seaCycle(T, rule, E, want, spare)

  const base = (performance.now() - a) / 1000

  row('js engine', base, 1, null, null)

  for (const b of list.filter(x => !/x2$|x12$/.test(x.name))) {
    const n = b.name === 'wasm x1' ? 1 : cycles

    fastSeaCycles(b.k, T, rule, E, { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }, 1, spare)

    const have = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }
    const check = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }

    a = performance.now()
    fastSeaCycles(b.k, T, rule, E, have, n, spare)

    const seconds = (performance.now() - a) / 1000

    fastSeaCycles(b.k, T, rule, E, check, 1, spare)
    row(b.name, seconds, n, base, same(check.re, want.re) && same(check.im, want.im))
  }
}

// the many-hole engines on L = 4 with the registered hole pieces and pair angles (task/kernel/check.ts's setup)
const holeSetup = (n: number) => {
  const th = unitAngle(ringUnit(-1, 4))
  const hu: [number, number] = [Math.cos(th), Math.sin(th)]
  const ps = [
    registerPiece(scaled(singletProjector24(), 24), hu),
    registerPiece(scaled(partnerProjector48(), 48), [hu[0], -hu[1]]),
  ]
  const T = torus(4)
  const fr = holeFrame(T, ps, 8)
  const F = fr.fourier
  const angle = pairAngles(T, -unitAngle(ringUnit(-2, 1)), 8, -2 * unitAngle(ringUnit(2, 0)))
  const js =
    n === 2
      ? [1, F.neg[1]!]
      : n === 3
        ? [1, 2, F.sum[F.neg[1]! * F.N + F.neg[2]!]!]
        : [1, 2, 3, F.sum[F.sum[F.neg[1]! * F.N + F.neg[2]!]! * F.N + F.neg[3]!]!]

  return { fr, angle, js }
}

if (what === 'holes') {
  const n = Number(process.argv[3] ?? 3)
  const cycles = Number(process.argv[4] ?? 3)
  const { fr, angle, js } = holeSetup(n)
  const e = holeEngine(fr, n, 0)
  const start = slaterStart(e, js, js.map(j => bandVectors(fr, j).up[0]!))

  console.log(`register-holes n ${n} L 4: ${start.re.length} amplitudes a half`)

  const want = copyHoles(start)
  let a = performance.now()

  holeCycle(e, { angle }, want)

  const base = (performance.now() - a) / 1000

  row('js engine', base, 1, null, null)

  for (const b of list.filter(x => !/x2$|x12$/.test(x.name))) {
    const w = holeEngine(fr, n, 0, { backend: b.k.backend, threads: b.k.threads })
    const n2 = b.name === 'wasm x1' ? 1 : cycles

    fastHoleCycles(w.fast!, w, { angle }, copyHoles(start), 1)

    const have = copyHoles(start)
    const check = copyHoles(start)

    a = performance.now()
    fastHoleCycles(w.fast!, w, { angle }, have, n2)

    const seconds = (performance.now() - a) / 1000

    fastHoleCycles(w.fast!, w, { angle }, check, 1)
    row(b.name, seconds, n2, base, same(check.re, want.re) && same(check.im, want.im))
  }
}

if (what === 'sorted') {
  const n = Number(process.argv[3] ?? 4)
  const cycles = Number(process.argv[4] ?? 2)
  const { fr, angle, js } = holeSetup(n)
  const ref = sortedEngine(fr, n, 0)
  const start = sortedSlater(ref, js, js.map(j => bandVectors(fr, j).up[0]!))

  console.log(`register-sorted-holes n ${n} L 4: ${ref.rows} rows, ${start.re.length} amplitudes a half`)

  let base: number | null = null
  let first: { re: Float64Array; im: Float64Array } | null = null
  let firstName = ''

  for (const b of list.filter(x => !/x2$|x12$/.test(x.name) && !x.name.startsWith('wasm'))) {
    const se = sortedEngine(fr, n, 0, { backend: b.k.backend, threads: b.k.threads })
    const run = (s: { re: Float64Array; im: Float64Array }, c: number): void =>
      onDevice(se.k, [s.re, s.im], () => {
        for (let k = 0; k < c; k++) sortedCycle(se, { angle }, s)
      })
    const have = copySorted(start)
    const a = performance.now()

    run(have, cycles)

    const seconds = (performance.now() - a) / 1000

    if (!first) {
      first = have
      firstName = b.name
      base = seconds / cycles
      row(b.name, seconds, cycles, null, null)
    } else {
      row(b.name, seconds, cycles, base, same(have.re, first.re) && same(have.im, first.im), firstName)
    }
  }
}

console.log(`load ${load()} at end`)
