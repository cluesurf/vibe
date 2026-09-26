// Planck from a light in the signed whole (E-FRC-0225): a light mode held as a register of N = 2D + 1 levels (a
// STAND-IN ladder: one register level is one quantum of this mode) meets, one per beat, the STAND-IN two-level
// emitters a thermal bath streams past it, through the fear beat's weights on each exchange block
// {|1, n>, |0, n + 1>} (stay 1/4, exchange 3/4, as E-FRC-0224's meeting).
//
// WHY IT IS PLANCK, derived before any run (Einstein 1917, here exact). The emitters arrive with populations p1 /
// p0 = x (x = e^(-omega / T), taken RATIONAL so the whole stays exact). The block unitary keeps a diagonal mode
// diagonal once the emitter is traced (coherence only joins |1, n> to |0, n + 1>, which differ in the emitter),
// so the mode's line sums follow the birth-death map
//   p'(n) = p(n) - (3/4) [p1 [n < N - 1] + p0 [n > 0]] p(n) + (3/4) p1 p(n - 1) + (3/4) p0 p(n + 1).
// The up rate from n and the down rate from n + 1 carry the SAME transfer 3/4 (unitarity of the 2 x 2 block), so
// detailed balance gives p(n) proportional to x^n exactly, for any nonzero transfer: the mean occupation is
// Bose-Einstein, x / (1 - x) = 1 / (e^(omega/T) - 1), up to the ladder's top (x^N), and the energy per mode is
// Planck's omega / (e^(omega/T) - 1). The one thing it needs is a transfer from |1, 0> to |0, 1>: emission into an
// EMPTY mode, Einstein's A, which is E-FRC-0224's spontaneous emission.
//   the semiclassical rule  The mode sees the emitters' expectation: a thermal emitter has no coherence, so the
//                           mean field on the mode is diagonal and commutes with a diagonal mode. From the vacuum
//                           no light is ever made, at any temperature. The classical light reaches equilibrium
//                           only through its classical bath, and there it is Rayleigh-Jeans, T per mode
//                           (E-SPN-0058, measured)
//   the quantum of action   With the register's step one quantum omega, the exchange unit is omega itself, which
//                           is what freezes the high modes; a step of omega / m is the same law with h / m, and
//                           tends to T per mode as m grows (reported)
//
// Gates, fixed before the first run:
// P1 detailed balance, exactly: for x in {9/10, 3/4, 1/2, 1/4, 1/10, 1/20} and N = 33 (D = 16), p(n) = x^n (1 - x)
//    / (1 - x^N) is a fixed point of the map in rationals (0 mismatches); and the map equals the line sums of the
//    whole's own joint evolution (block unitary on the emitter and a 9-level register, 20 meetings, floats) to 1e-12
// P2 Bose-Einstein: for x <= 3/4 the exact stationary mean is within 1 percent of x / (1 - x), and the map run from
//    the vacuum for 20,000 meetings reaches it to 1e-6 relative
// P3 Planck against Rayleigh-Jeans: for x <= 3/4 the energy per mode ln(1/x) nbar (in units of T) is within 1
//    percent of Planck's (omega/T) / (e^(omega/T) - 1), and at omega/T >= ln 4 (x <= 1/4) it is below half of
//    Rayleigh-Jeans' 1
// P4 the controls: the mean-field stream (RK4 over the meeting generator) and the fear-off stream (w^0, the
//    identity) leave a 9-level mode at the vacuum with mean occupation exactly 0 after 100 thermal meetings, at
//    every x
// Reported: the same mean-field integration with coherent emitters (|0> + |1>)/sqrt 2, which must make light (so
// the control is a computation that could have come out nonzero), and the energy per mode with the register's step
// omega / m (h / m) at omega/T = ln 20.
// Status: pass if every gate passes, partial if P1 and P4 pass, fail otherwise.
//
// Depth L1 to L2: Einstein's derivation on the model's collision stream, with STAND-IN ladder and emitters; the
// content is that the per-history light and the fear beat supply Einstein's A, where the semiclassical light
// supplies nothing.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const LADDER = 33
const SMALL = 9
const TEMPERATURES: readonly [number, number][] = [
  [9, 10],
  [3, 4],
  [1, 2],
  [1, 4],
  [1, 10],
  [1, 20],
]
const APPROACH_MEETINGS = 20000
const JOINT_MEETINGS = 20
const CONTROL_MEETINGS = 100
const MEAN_FIELD_STEPS = 400
const STAY = 0.25
const MOVE = 0.75

// the population map, exact: p as numerators over a common denominator; x = xn / xd
function mapExact(p: bigint[], xn: bigint, xd: bigint): bigint[] {
  // p1 = xn / (xn + xd), p0 = xd / (xn + xd); the map's new denominator is old * 4 (xn + xd)
  const n = p.length
  const s = xn + xd
  const out = new Array<bigint>(n).fill(0n)

  for (let k = 0; k < n; k++) {
    const leave = (k < n - 1 ? xn : 0n) + (k > 0 ? xd : 0n)

    out[k] = p[k]! * (4n * s - 3n * leave)
    if (k > 0) out[k] = out[k]! + 3n * xn * p[k - 1]!
    if (k < n - 1) out[k] = out[k]! + 3n * xd * p[k + 1]!
  }

  return out
}

function mapFloat(p: Float64Array, x: number): Float64Array {
  const p1 = x / (1 + x)
  const p0 = 1 / (1 + x)
  const n = p.length
  const out = new Float64Array(n)

  for (let k = 0; k < n; k++) {
    out[k] = p[k]! * (1 - MOVE * ((k < n - 1 ? p1 : 0) + (k > 0 ? p0 : 0)))
    if (k > 0) out[k] = out[k]! + MOVE * p1 * p[k - 1]!
    if (k < n - 1) out[k] = out[k]! + MOVE * p0 * p[k + 1]!
  }

  return out
}

// the joint evolution of emitter (levels 0, 1) and an n-level register: rho on 2n x 2n, index e n + k; each meeting
// starts from the thermal emitter times the mode's reduced state and applies the block unitary
function jointMeeting(mode: { re: Float64Array; im: Float64Array }, x: number, n: number, weight: [number, number, number, number]): { re: Float64Array; im: Float64Array } {
  const size = 2 * n
  const p1 = x / (1 + x)
  const p0 = 1 / (1 + x)
  const re = new Float64Array(size * size)
  const im = new Float64Array(size * size)

  for (let e = 0; e < 2; e++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        re[(e * n + i) * size + e * n + j] = (e === 1 ? p1 : p0) * mode.re[i * n + j]!
        im[(e * n + i) * size + e * n + j] = (e === 1 ? p1 : p0) * mode.im[i * n + j]!
      }
    }
  }

  // U: identity except the blocks {|1, k>, |0, k + 1>}, where U = a 1 + b X
  const [ar, ai, br, bi] = weight
  const ure = new Float64Array(size * size)
  const uim = new Float64Array(size * size)

  for (let s = 0; s < size; s++) ure[s * size + s] = 1

  for (let k = 0; k < n - 1; k++) {
    const u = 1 * n + k
    const v = 0 * n + k + 1

    ure[u * size + u] = ar
    uim[u * size + u] = ai
    ure[v * size + v] = ar
    uim[v * size + v] = ai
    ure[u * size + v] = br
    uim[u * size + v] = bi
    ure[v * size + u] = br
    uim[v * size + u] = bi
  }

  // rho' = U rho U^dagger
  const tre = new Float64Array(size * size)
  const tim = new Float64Array(size * size)

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < size; k++) {
        sr += ure[i * size + k]! * re[k * size + j]! - uim[i * size + k]! * im[k * size + j]!
        si += ure[i * size + k]! * im[k * size + j]! + uim[i * size + k]! * re[k * size + j]!
      }

      tre[i * size + j] = sr
      tim[i * size + j] = si
    }
  }

  const out = { re: new Float64Array(n * n), im: new Float64Array(n * n) }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < size; k++) {
        // (T U^dagger)_ij = sum_k T_ik conj(U_jk)
        sr += tre[i * size + k]! * ure[j * size + k]! + tim[i * size + k]! * uim[j * size + k]!
        si += tim[i * size + k]! * ure[j * size + k]! - tre[i * size + k]! * uim[j * size + k]!
      }

      // trace the emitter: i = e n + a, j = e n + b
      const ei = Math.floor(i / n)
      const ej = Math.floor(j / n)

      if (ei === ej) {
        out.re[(i % n) * n + (j % n)] = out.re[(i % n) * n + (j % n)]! + sr
        out.im[(i % n) * n + (j % n)] = out.im[(i % n) * n + (j % n)]! + si
      }
    }
  }

  return out
}

// The mean-field (semiclassical) meeting, integrated from the meeting's own generator: U = e^(-i H) with H =
// -(pi/3) (1 - X) on each block {|1, k>, |0, k + 1>} and 0 elsewhere. Each side evolves under the other's mean
// field, H_M = Tr_A[H (rho_A (x) 1)] and H_A = Tr_M[H (1 (x) rho_M)], by RK4 over unit time. A fresh emitter
// (`emitter`, 2 x 2) arrives each meeting; the mode (n x n) carries over. Nothing is assumed about which terms
// vanish: a thermal emitter's zero coherence is what the integration finds
type Pair = { re: Float64Array; im: Float64Array }

function generator(n: number): Float64Array {
  const size = 2 * n
  const h = new Float64Array(size * size)

  for (let k = 0; k < n - 1; k++) {
    const u = n + k
    const v = k + 1

    h[u * size + u] = -Math.PI / 3
    h[v * size + v] = -Math.PI / 3
    h[u * size + v] = Math.PI / 3
    h[v * size + u] = Math.PI / 3
  }

  return h
}

// -i [g, y] for n x n complex g, y
function commutator(g: Pair, y: Pair, n: number): Pair {
  const out: Pair = { re: new Float64Array(n * n), im: new Float64Array(n * n) }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let cr = 0
      let ci = 0

      for (let k = 0; k < n; k++) {
        cr += g.re[i * n + k]! * y.re[k * n + j]! - g.im[i * n + k]! * y.im[k * n + j]! - (y.re[i * n + k]! * g.re[k * n + j]! - y.im[i * n + k]! * g.im[k * n + j]!)
        ci += g.re[i * n + k]! * y.im[k * n + j]! + g.im[i * n + k]! * y.re[k * n + j]! - (y.re[i * n + k]! * g.im[k * n + j]! + y.im[i * n + k]! * g.re[k * n + j]!)
      }

      out.re[i * n + j] = ci
      out.im[i * n + j] = -cr
    }
  }

  return out
}

const shift = (y: Pair, a: number, d: Pair): Pair => ({ re: y.re.map((v, i) => v + a * d.re[i]!), im: y.im.map((v, i) => v + a * d.im[i]!) })

function meanFieldMeeting(mode: Pair, emitter: Pair, n: number, h: Float64Array): Pair {
  const size = 2 * n
  const step = 1 / MEAN_FIELD_STEPS
  const fields = (a: Pair, m: Pair): [Pair, Pair] => {
    const hm: Pair = { re: new Float64Array(n * n), im: new Float64Array(n * n) }
    const ha: Pair = { re: new Float64Array(4), im: new Float64Array(4) }

    for (let e = 0; e < 2; e++) {
      for (let f = 0; f < 2; f++) {
        for (let k = 0; k < n; k++) {
          for (let l = 0; l < n; l++) {
            const x = h[(e * n + k) * size + f * n + l]!

            if (x === 0) continue

            // H_M(k, l) += H((e,k),(f,l)) rho_A(f, e); H_A(e, f) += H((e,k),(f,l)) rho_M(l, k)
            hm.re[k * n + l] = hm.re[k * n + l]! + x * a.re[f * 2 + e]!
            hm.im[k * n + l] = hm.im[k * n + l]! + x * a.im[f * 2 + e]!
            ha.re[e * 2 + f] = ha.re[e * 2 + f]! + x * m.re[l * n + k]!
            ha.im[e * 2 + f] = ha.im[e * 2 + f]! + x * m.im[l * n + k]!
          }
        }
      }
    }

    return [commutator(ha, a, 2), commutator(hm, m, n)]
  }

  let a = emitter
  let m = mode

  for (let s = 0; s < MEAN_FIELD_STEPS; s++) {
    const [a1, m1] = fields(a, m)
    const [a2, m2] = fields(shift(a, step / 2, a1), shift(m, step / 2, m1))
    const [a3, m3] = fields(shift(a, step / 2, a2), shift(m, step / 2, m2))
    const [a4, m4] = fields(shift(a, step, a3), shift(m, step, m3))

    a = shift(shift(shift(shift(a, step / 6, a1), step / 3, a2), step / 3, a3), step / 6, a4)
    m = shift(shift(shift(shift(m, step / 6, m1), step / 3, m2), step / 3, m3), step / 6, m4)
  }

  return m
}

const diagonalOf = (m: Pair, n: number): Float64Array => Float64Array.from({ length: n }, (_, k) => m.re[k * n + k]!)

const meanOf = (p: ArrayLike<number>): number => {
  let s = 0
  let t = 0

  for (let k = 0; k < p.length; k++) {
    s += k * p[k]!
    t += p[k]!
  }

  return s / t
}

export default experiment({
  id: 'gauge/stream-planck',
  code: 'E-FRC-0225',
  title:
    "Planck from a light in the signed whole: a STAND-IN ladder mode meeting a thermal stream of STAND-IN emitters through the fear beat's weights reaches Bose-Einstein occupations exactly by detailed balance, because the meeting emits into an empty mode (Einstein's A); the semiclassical light makes no light at all",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let fixedMismatch = 0
    let jointError = 0
    let beWorst = 0
    let approachWorst = 0
    let planckWorst = 0
    let frozenOk = true
    let controlMax = 0
    const w = (2 * Math.PI) / 3
    // U = ((1 + w)/2) 1 + ((1 - w)/2) X on each block
    const weight: [number, number, number, number] = [(1 + Math.cos(w)) / 2, Math.sin(w) / 2, (1 - Math.cos(w)) / 2, -Math.sin(w) / 2]
    const h = generator(SMALL)

    for (const [a, b] of TEMPERATURES) {
      const x = a / b
      const xn = BigInt(a)
      const xd = BigInt(b)

      // P1: the geometric state x^n is a fixed point: numerators xn^k xd^(N-1-k)
      const geometric = Array.from({ length: LADDER }, (_, k) => xn ** BigInt(k) * xd ** BigInt(LADDER - 1 - k))
      const image = mapExact(geometric, xn, xd)
      const scale = 4n * (xn + xd)

      image.forEach((v, k) => (fixedMismatch += v === geometric[k]! * scale ? 0 : 1))

      // P1: the map against the joint evolution
      let mode = { re: new Float64Array(SMALL * SMALL), im: new Float64Array(SMALL * SMALL) }
      let pops = new Float64Array(SMALL)

      mode.re[0] = 1
      pops[0] = 1

      for (let t = 0; t < JOINT_MEETINGS; t++) {
        mode = jointMeeting(mode, x, SMALL, weight)
        pops = mapFloat(pops, x)

        for (let k = 0; k < SMALL; k++) jointError = Math.max(jointError, Math.abs(mode.re[k * SMALL + k]! - pops[k]!))
      }

      // P2: the exact stationary mean, and the approach
      let top = 0n
      let bottom = 0n

      geometric.forEach((g, k) => {
        top += BigInt(k) * g
        bottom += g
      })

      const exactMean = Number((top * 10n ** 15n) / bottom) / 1e15
      const be = x / (1 - x)
      let p = new Float64Array(LADDER)

      p[0] = 1

      for (let t = 0; t < APPROACH_MEETINGS; t++) p = mapFloat(p, x)

      const reached = meanOf(p)
      const omegaOverT = Math.log(b / a)
      const energy = omegaOverT * exactMean
      const planck = omegaOverT / Math.expm1(omegaOverT)
      const label = `x${a}over${b}`

      metrics[`${label}OmegaOverT`] = omegaOverT
      metrics[`${label}ExactMean`] = exactMean
      metrics[`${label}BoseEinstein`] = be
      metrics[`${label}Reached`] = reached
      metrics[`${label}EnergyOverT`] = energy
      metrics[`${label}PlanckOverT`] = planck

      if (x <= 0.75) {
        beWorst = Math.max(beWorst, Math.abs(exactMean / be - 1))
        approachWorst = Math.max(approachWorst, Math.abs(reached / exactMean - 1))
        planckWorst = Math.max(planckWorst, Math.abs(energy / planck - 1))
      }

      if (x <= 0.25 && !(energy < 0.5)) frozenOk = false

      // P4: the controls from the vacuum, a thermal emitter each meeting
      const thermal: Pair = { re: Float64Array.from([1 / (1 + x), 0, 0, x / (1 + x)]), im: new Float64Array(4) }
      let meanField: Pair = { re: new Float64Array(SMALL * SMALL), im: new Float64Array(SMALL * SMALL) }
      let fearOff = { re: new Float64Array(SMALL * SMALL), im: new Float64Array(SMALL * SMALL) }

      meanField.re[0] = 1
      fearOff.re[0] = 1

      for (let t = 0; t < CONTROL_MEETINGS; t++) {
        meanField = meanFieldMeeting(meanField, thermal, SMALL, h)
        fearOff = jointMeeting(fearOff, x, SMALL, [1, 0, 0, 0])
      }

      controlMax = Math.max(controlMax, meanOf(diagonalOf(meanField, SMALL)), meanOf(diagonalOf(fearOff, SMALL)))
    }

    // the control's own control: the same mean-field code with COHERENT emitters (|0> + |1>)/sqrt 2 makes light
    let coherent: Pair = { re: new Float64Array(SMALL * SMALL), im: new Float64Array(SMALL * SMALL) }

    coherent.re[0] = 1

    for (let t = 0; t < 10; t++) coherent = meanFieldMeeting(coherent, { re: Float64Array.from([0.5, 0.5, 0.5, 0.5]), im: new Float64Array(4) }, SMALL, h)

    metrics.meanFieldCoherentMean = meanOf(diagonalOf(coherent, SMALL))

    // reported: the quantum of action divided by m at omega/T = ln 20 (energy per mode in units of T)
    const omegaOverT = Math.log(20)

    for (const m of [1, 2, 4, 16, 64]) {
      const y = Math.exp(-omegaOverT / m)

      metrics[`stepOverM${m}EnergyOverT`] = (omegaOverT / m) * (y / (1 - y))
    }

    Object.assign(metrics, { fixedMismatch, jointError, beWorst, approachWorst, planckWorst, frozen: frozenOk ? 1 : 0, controlMax })

    const gates = {
      P1: fixedMismatch === 0 && jointError <= 1e-12,
      P2: beWorst <= 0.01 && approachWorst <= 1e-6,
      P3: planckWorst <= 0.01 && frozenOk,
      P4: controlMax === 0,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.P1 && gates.P4 ? 'partial' : 'fail'
    const e = (x: number): string => x.toExponential(2)

    return verdict({
      status,
      claim: `a STAND-IN ${LADDER}-level mode meeting thermal STAND-IN emitters through the fear beat's block weights has p(n) proportional to x^n as an exact fixed point (${fixedMismatch} mismatches over ${TEMPERATURES.length} temperatures), the map being the whole's own line sums (${e(jointError)}); for x <= 3/4 its mean is Bose-Einstein to ${e(beWorst)}, reached from the vacuum to ${e(approachWorst)}, and its energy per mode is Planck's to ${e(planckWorst)}, below half of Rayleigh-Jeans at omega/T >= ln 4 (${(metrics.x1over4EnergyOverT ?? 0).toFixed(3)} T at ln 4, ${(metrics.x1over20EnergyOverT ?? 0).toFixed(3)} T at ln 20); the semiclassical and fear-off streams make no light from the vacuum (mean ${controlMax})`,
      metrics,
      control: { controlMax },
      notes:
        "L2, STAND-IN ladder and emitters. FIRST RUN 2026-09-26 (tmp/frc0225.log, 4.8 s), PASS, no gate moved. P1: x^n is an exact fixed point at all 6 temperatures (0 mismatches over 33 levels), and the population map equals the joint block-unitary evolution's diagonal to 1.6e-15. P2: stationary means 2.9975, 1.0000, 0.3333, 0.1111, 0.0526 against Bose-Einstein 3, 1, 1/3, 1/9, 1/19 (worst 8.3e-4, the 33-level top at x = 3/4); the vacuum reaches them to 7.8e-15 in 20,000 meetings. At x = 9/10 (outside the gate by design) the ladder truncates: 7.948 against 9. P3: energy per mode 0.862, 0.693, 0.462, 0.256, 0.158 T at omega/T = 0.29, 0.69, 1.39, 2.30, 3.00, Planck's to 8.3e-4, against Rayleigh-Jeans' 1 T. P4: the mean-field stream and the fear-off stream leave the vacuum at mean exactly 0 at every temperature, while the same mean-field code with coherent emitters makes 2.84 quanta in 10 meetings (the control can fail). The step omega/m gives 0.158, 0.431, 0.672, 0.909, 0.977 T at m = 1, 2, 4, 16, 64 (Rayleigh-Jeans as h -> 0). The result is Einstein's 1917 argument, exact: detailed balance holds for ANY nonzero block transfer, so Planck here tests that the light has a ladder and an emission into the empty mode (Einstein's A), not the size of the coupling. The ladder is a STAND-IN: nothing in the model yet says a register level is one quantum of a husk mode.",
    })
  },
})
