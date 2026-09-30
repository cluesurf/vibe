// THE KERNEL BENCHMARK: seconds per engine cycle on each backend and thread count, with the machine's load printed
// beside every row (the machine carries other experiment runs, and a busy core understates the gain). Each fast run's
// final state is also compared byte for byte with the js run's, so a timing is never reported for a wrong answer.
//
//   pnpm call task/kernel/bench.ts ball [radius] [cycles]      register-ball-reduced (default radius 24)
//   pnpm call task/kernel/bench.ts reduced [R] [cycles]        register-reduced, vector form, O_h at K = 0 (default 30)
//   pnpm call task/kernel/bench.ts sea [cycles]                register-sea on the L = 4 torus
//   pnpm call task/kernel/bench.ts primitive [radius]          conv alone, kernel time without the cycle around it
//
// BENCH_BACKENDS=native,wasm-threads keeps only the backends whose names start with one of those. The engine states are
// adopted by each fast engine (code/kernel/pair adopt), so the threaded wasm module runs on its own memory with no copy.

import { cpus, loadavg } from 'node:os'
import { available, kernel, type Kernel } from '@/code/kernel/index'
import { adopt, fastBall, fastCycle, fastReduced, pairTablesOfBall } from '@/code/kernel/pair'
import { fastSeaCycle } from '@/code/kernel/sea'
import { ballCycle, ballEngine, ballGroup, ballSector, ballStart, cloneBall } from '@/code/measure/register-ball-reduced'
import { cloneState, cubicGroup, newState, reducedCycle, reducedEngine, sector } from '@/code/measure/register-reduced'
import { newPair, seaCycle, sectorBases, torus, type SeaRule } from '@/code/measure/register-sea'

const what = process.argv[2] ?? 'ball'
const THREADS = [1, 2, 4, 8, 12, 16]
const U: [number, number] = [Math.cos(1.2952), Math.sin(1.2952)]
const PHI = (Math.sqrt(5) - 1) / 2
const load = (): string => loadavg().map(x => x.toFixed(1)).join(' ')
const same = (a: Float64Array, b: Float64Array): boolean =>
  Buffer.from(a.buffer, a.byteOffset, a.byteLength).compare(Buffer.from(b.buffer, b.byteOffset, b.byteLength)) === 0

const only = process.env.BENCH_BACKENDS?.split(',')
const backends = (): { name: string; k: Kernel }[] =>
  [
    ...(available('native') ? THREADS.map(n => ({ name: `native x${n}`, k: () => kernel('native', n) })) : []),
    ...(available('wasm') ? [{ name: 'wasm x1', k: () => kernel('wasm') }] : []),
    ...(available('wasm-threads')
      ? THREADS.map(n => ({ name: `wasm-threads x${n}`, k: () => kernel('wasm-threads', n) }))
      : []),
  ]
    .filter(b => !only || only.some(o => b.name.startsWith(o)))
    .map(b => ({ name: b.name, k: b.k() }))

function row(name: string, seconds: number, cycles: number, base: number | null, ok: boolean | null): void {
  const per = seconds / cycles

  console.log(
    `${name.padEnd(12)} ${per.toFixed(4).padStart(9)} s a cycle  ${base ? `${(base / per).toFixed(1).padStart(6)}x` : '      '}  ${ok === null ? '' : ok ? 'bytes equal' : 'BYTES DIFFER'}  load ${load()}`,
  )
}

console.log(`${cpus().length} cores, load ${load()} at start`)

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

    for (const b of backends()) {
      const op = b.k.pairOp(t)

      a = performance.now()

      for (let r = 0; r < reps; r++) b.k.conv(op, start.re, start.im, 0, 256, 0, outRe, outIm, 1, false)

      row(`${b.name}`, (performance.now() - a) / 1000 / reps, 1, base, null)
    }
  } else {
    const jsCycles = Math.max(1, Math.min(2, cycles))
    const want = cloneBall(start)
    let a = performance.now()

    for (let c = 0; c < jsCycles; c++) ballCycle(e, want)

    const base = (performance.now() - a) / 1000 / jsCycles

    row('js engine', base * jsCycles, jsCycles, null, null)

    for (const b of backends()) {
      const f = fastBall(e, b.k)
      const n = b.name === 'wasm x1' ? jsCycles : cycles
      const have = adopt(f, start)
      const check = adopt(f, start)

      a = performance.now()

      for (let c = 0; c < n; c++) fastCycle(f, have)

      const seconds = (performance.now() - a) / 1000

      for (let c = 0; c < jsCycles; c++) fastCycle(f, check)

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

  for (const b of backends()) {
    const f = fastReduced(e, b.k)
    const n = b.name === 'wasm x1' ? 1 : cycles
    const have = adopt(f, start)
    const check = adopt(f, start)

    a = performance.now()

    for (let c = 0; c < n; c++) fastCycle(f, have)

    const seconds = (performance.now() - a) / 1000

    fastCycle(f, check)
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

  for (const b of backends().filter(x => !/x2$|x12$/.test(x.name))) {
    const have = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }
    const n = b.name === 'wasm x1' ? 1 : cycles

    a = performance.now()
    fastSeaCycle(b.k, T, rule, E, have, spare)

    const first = { re: Float64Array.from(have.re), im: Float64Array.from(have.im) }

    for (let c = 1; c < n; c++) fastSeaCycle(b.k, T, rule, E, have, spare)

    row(b.name, (performance.now() - a) / 1000, n, base, same(first.re, want.re) && same(first.im, want.im))
  }
}

console.log(`load ${load()} at end`)
