// Verify the fdlibm restatement (task/determinism/fdlibm.ts) against this machine's Math, function by function.
//
//   tsx task/determinism/verify.ts [count] [functions...]
//
// For each function, `count` inputs (200,000 by default) from a fixed generator that reaches every branch the
// function has on its working range. Prints how many of them the FUSED form and the PLAIN form equal this machine's
// Math bit for bit (Object.is, so the sign of a zero counts), and the first input each form misses.
//
// On darwin-arm64 (node 24.13.1) the FUSED form must equal Math on every input: that is the evidence that this Mac's
// Math is V8's fdlibm compiled with fused multiply-adds, and that the restatement reads the C source the way clang
// does. On an x86-64 node the PLAIN form must equal Math on every input instead. The count by which PLAIN misses on
// the Mac is how often the two builds disagree.
//
// `pow` is checked differently (see task/determinism/pow.ts): this machine's Math.pow against the correctly rounded
// x^y, over integer, half, third and real exponents, and the count of HARD inputs, those whose exact value lies within
// MARGIN of a rounding midpoint, where a 0.54 ULP libm could round either way.
import { RESTATED, setFused } from './fdlibm'
import { MARGIN, powOracle } from './pow'

const count = Number(process.argv[2] ?? 200000) || 200000
const only = new Set(process.argv.slice(3))

// a fixed generator (splitmix32), so a rerun sees the same inputs
let state = 0x9e3779b9

function next(): number {
  state = (state + 0x9e3779b9) | 0
  let z = state
  z = Math.imul(z ^ (z >>> 16), 0x85ebca6b)
  z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35)
  return ((z ^ (z >>> 16)) >>> 0) / 4294967296
}

const sign = (): number => (next() < 0.5 ? -1 : 1)

// |x| log-uniform in [2^lo, 2^hi]
const logUniform = (lo: number, hi: number): number => 2 ** (lo + next() * (hi - lo))

const inputs: Record<keyof typeof RESTATED, () => number[]> = {
  sin: () => [trig()],
  cos: () => [trig()],
  tan: () => [trig()],
  asin: () => [unit()],
  acos: () => [unit()],
  atan: () => [next() < 0.6 ? (next() - 0.5) * 20 : sign() * logUniform(-35, 70)],
  atan2: () =>
    next() < 0.7
      ? [(next() - 0.5) * 4, (next() - 0.5) * 4]
      : [sign() * logUniform(-80, 80), sign() * logUniform(-80, 80)],
  exp: () => [next() < 0.6 ? (next() - 0.7) * 60 : next() < 0.5 ? (next() - 0.5) * 1500 : sign() * logUniform(-60, 0)],
  expm1: () => [next() < 0.6 ? (next() - 0.6) * 80 : next() < 0.5 ? (next() - 0.5) * 1500 : sign() * logUniform(-60, 0)],
  log: () => [positive()],
  log2: () => [positive()],
  log10: () => [positive()],
  log1p: () => [next() < 0.4 ? -1 + next() * 4 : next() < 0.6 ? sign() * logUniform(-60, -1) : logUniform(-1, 1000)],
  cbrt: () => [next() < 0.9 ? sign() * logUniform(-1060, 1020) : sign() * next() * 2 ** -1022],
  sinh: () => [hyperbolic()],
  cosh: () => [hyperbolic()],
  tanh: () => [hyperbolic()],
  asinh: () => [next() < 0.5 ? (next() - 0.5) * 8 : sign() * logUniform(-35, 60)],
  acosh: () => [next() < 0.5 ? 1 + next() * 3 : next() < 0.5 ? 1 + logUniform(-50, 0) : logUniform(1, 60)],
  atanh: () => [next() < 0.6 ? (next() - 0.5) * 2 : sign() * (next() < 0.5 ? 1 - logUniform(-50, -1) : logUniform(-35, -1))],
}

function trig(): number {
  const u = next()
  if (u < 0.4) {
    return (next() - 0.5) * 160
  }
  if (u < 0.7) {
    return (next() - 0.5) * 2
  }
  return sign() * logUniform(-30, 19)
}

function unit(): number {
  const u = next()
  if (u < 0.6) {
    return (next() - 0.5) * 2
  }
  if (u < 0.85) {
    return sign() * (1 - logUniform(-50, -1))
  }
  return sign() * logUniform(-35, -1)
}

function positive(): number {
  const u = next()
  if (u < 0.4) {
    return next() * 3
  }
  if (u < 0.8) {
    return 2 ** ((next() - 0.5) * 200) * (1 + next())
  }
  if (u < 0.95) {
    return (1 + (next() - 0.5) * 4e-6) * 2 ** Math.floor((next() - 0.5) * 40)
  }
  return next() * 2 ** -1022
}

function hyperbolic(): number {
  const u = next()
  if (u < 0.5) {
    return (next() - 0.5) * 50
  }
  if (u < 0.75) {
    return (next() - 0.5) * 1430
  }
  return sign() * logUniform(-60, 0)
}

const native = Math as unknown as Record<string, (...a: number[]) => number>

console.log(`node ${process.version} ${process.arch} ${process.platform}, ${count} inputs per function`)

for (const name of Object.keys(inputs) as (keyof typeof RESTATED)[]) {
  if (only.size > 0 && !only.has(name)) {
    continue
  }
  const restated = RESTATED[name] as (...a: number[]) => number
  let plain = 0
  let fused = 0
  let plainMiss = ''
  let fusedMiss = ''
  for (let i = 0; i < count; i++) {
    const a = inputs[name]()
    const want = native[name]!(...a)
    setFused(false)
    const p = restated(...a)
    setFused(true)
    const f = restated(...a)
    setFused(false)
    if (Object.is(p, want)) {
      plain++
    } else if (!plainMiss) {
      plainMiss = `${name}(${a.join(', ')}): Math ${want}, plain ${p}`
    }
    if (Object.is(f, want)) {
      fused++
    } else if (!fusedMiss) {
      fusedMiss = `${name}(${a.join(', ')}): Math ${want}, fused ${f}`
    }
  }
  console.log(`${name.padEnd(6)} fused ${fused} of ${count}   plain ${plain} of ${count}`)
  if (fusedMiss) {
    console.log(`         first fused miss  ${fusedMiss}`)
  }
  if (plainMiss) {
    console.log(`         first plain miss  ${plainMiss}`)
  }
}

// ---- pow ----

function powInput(): [number, number] {
  const u = next()
  const x = next() < 0.8 ? logUniform(-40, 40) * (next() < 0.1 ? -1 : 1) : 1 + (next() - 0.5) * 2 ** -20
  if (u < 0.3) {
    return [x, Math.floor(next() * 12) - 3]
  }
  if (u < 0.4) {
    return [Math.abs(x), [0.5, -0.5, 1 / 3, 1 / 4, 1.5, 2 / 3][Math.floor(next() * 6)]!]
  }
  if (u < 0.5) {
    return [1 + (next() - 0.5) * 2 ** -30, (next() - 0.5) * 2 ** 40]
  }
  return [Math.abs(x), (next() - 0.5) * 20]
}

if (only.size === 0 || only.has('pow')) {
  let equal = 0
  let exact = 0
  let hard = 0
  let hardEqual = 0
  let miss = ''
  const started = Date.now()
  for (let i = 0; i < count; i++) {
    const [x, y] = powInput()
    const want = Math.pow(x, y)
    const answer = powOracle(x, y)
    const same = Object.is(want, answer.value)
    if (answer.exact) {
      exact++
    }
    if (!answer.exact && answer.margin <= MARGIN) {
      hard++
      if (same) {
        hardEqual++
      }
    }
    if (same) {
      equal++
    } else if (!miss) {
      miss = `pow(${x}, ${y}): Math ${want}, correctly rounded ${answer.value}, margin ${answer.margin.toFixed(4)}`
    }
  }
  const us = ((Date.now() - started) * 1000) / count
  console.log(
    `pow    correctly rounded ${equal} of ${count}   exact ${exact}   hard (margin <= ${MARGIN}) ${hard}, of them correctly rounded ${hardEqual}   ${us.toFixed(1)} us an input`,
  )
  if (miss) {
    console.log(`         first miss  ${miss}`)
  }
}
