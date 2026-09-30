// THE PULL'S FALLOFF UNDER THE REGISTER COUNT (E-GRV-0148). E-GRV-0146 read gravity's pair piece only as two holes
// spreading more slowly than free on tori of side 4 and 6, never as a force law. This file reads the pull dynamically at
// separations 3 to 8 and asks whether it falls as the kernel's 1/r does (a pull as 1/r^2), or shows another shape. It
// also says why the husk solve failed on the sea's uniform raw count, and how that is bypassed. OPEN-GRV-01, OPEN-GRV-13;
// ledger H "Newton's inverse square" (stand-in).
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE READ. One hole, a band-A column packet (code/measure/register-count packetRun; E-GRV-0147's construction), in
//    the field of a static band-A hole on column 0: its S unit takes the extra angle 0.2867 k(column) (E-GRV-0146's pair
//    piece, the source's S count 1, its D count 0). The pull is the packet's mean offset toward the source against the
//    free packet after T cycles, from starts at (r, 0, 0), r = 3 .. 8. This is the test-particle limit of the pair piece:
//    the pair engine holds 36,864 amplitudes a relative dock and cannot reach side 16, let alone 40.
// 2. WHY IT SHOULD FOLLOW THE KERNEL'S GRADIENT. To first order the offset is linear in the field and the free dynamics
//    is translation invariant, so pull(r) = sum_x chi(x) phi(x + r) for one response chi, odd along the axis. If chi is
//    near isotropic and its support stays clear of the source, the mean-value property of a harmonic phi gives
//    pull(r) = C dphi/dr at the point (Newton's shell theorem); the torus's uniform background (a quadratic) passes the
//    same way. So pull(r) / (-dk/dr) should be flat in r wherever the packet has not reached the source, and fall short
//    where it has. The local mass drifts a little with r (the rest gap is M + 0.2867 k(r), E-GRV-0147), which tilts the
//    ratio upward at large r by about 1 percent.
// 3. THE TORUS, DERIVED. On a periodic husk the kernel's gradient is the point field's minus the uniform background's,
//    a relative change of 4 pi r^3 / (3 L^3) (the continuum Green's function with its mean removed, the operator's
//    normalization cancelling). At r = 8 that is 3.4 percent on L = 40 and 1.9 percent on L = 48, and the lattice's own
//    departure from 1/r at r >= 5 is smaller. So L = 40 is the smallest even side where the kernel itself stays within 5
//    percent of the point field's shape at r = 8, and a mismatch with 1/r^2 larger than that is not the box. L = 48 is
//    run as a second size.
// 4. THE PACKET. sigma = 1 (density e^(-rho^2 / 2) on each axis) and T = 6 cycles: the fastest front moves at most
//    0.214 columns a beat, so 12 beats take it 2.6 columns, clear of the source from r = 5 out. The band purity is poor
//    at this width, which does not matter for a like-band pull.
// 5. PREDICTION: the pull is attractive and falls with r at every r; over r = 5 .. 8 the ratio pull / (-dk/dr) is flat
//    within 5 percent on both sides and the pull's power law is the kernel gradient's within 0.15; at r = 3 and 4 the
//    ratio falls short (the packet reaches the source). Newton's exponent 2 is read, not gated: the kernel is the depth
//    register's float stand-in, and its own exponent on r 5 .. 8 includes the lattice and the torus.
// 6. THE CONTROL CR: a field of another shape, the planar ramp 0.002867 |x| (a constant pull), read the same way. Its
//    pull must be flat in r (within 2 percent over r = 4 .. 8) while the kernel's falls by more than 2 from r = 5 to 8:
//    the read sees the shape it is given.
// 7. THE SOLVER (a read, E-GRV-0146's failure). code/measure/trit-hop-light coulombFlux is conjugate gradients with an
//    ABSOLUTE stop, |r|^2 <= 1e-28. The husk Laplacian on a torus is singular (the constant is its null space), and the
//    source is centered by subtracting its float mean. For a uniform count of 64 with a spread hole on it the rounding of
//    that mean leaves a null-space component that conjugate gradients cannot remove, of squared size far above 1e-28 (tmp/
//    eq-probe4: 2.5e-21 at 64, 3e-25 even at 1), so it runs to its iteration cap on a direction where p . A p is 0 and the
//    depth returns NaN or 1e3. The BYPASS is to count from the sea before the solve: subtract the uniform part exactly (it
//    has no depth on a closed husk), so the solve sees only the hole. Then the raw count's depth is minus the ordered
//    one, by linearity, which is E-GRV-0144's "falls up". The shared solver is not changed (many experiments call it).
//
// GATES, fixed before the gate run.
//  F1 THE PULL IS ATTRACTIVE AND FALLS: on L = 40 and 48 the pull is positive at r = 3 .. 8 and decreases with r.
//  F2 IT FOLLOWS THE KERNEL: on both sides, pull / (-dk/dr) over r = 5 .. 8 has (max - min) / mean <= 0.05, the
//     gradient the centered difference of k along the axis.
//  F3 ITS POWER: on both sides the least-squares slope of ln pull against ln r over r = 5 .. 8 is within 0.15 of the same
//     slope of -dk/dr.
// INSTRUMENT (partial at best on failure). I1 every run keeps its norm within 1e-10. I2 the free packet's offset is below
//  1e-12 (the packet is symmetric and clear of the wrap). I3 the solver read (side 16, a spread hole of float weights
//  on a uniform 64): counted from the sea, x(0) - x(8) is minus the ordered hole's within 1e-6 relative, and the direct
//  solve is not (NaN or off by more than 1 relative).
// CONTROL (partial at best on failure). CR THE RAMP: its pull over r = 4 .. 8 has (max - min) / mean <= 0.02, while the
//  kernel's pull(5) / pull(8) >= 2 on both sides.
// READ, gating nothing: the ratio at r = 3, 4 (the near field); the reversed piece (members) at every r; the kernel's
//  r^2 dk/dr; the torus term 4 pi r^3 / (3 L^3); the exponents against 2.
// Verdict: fail if F1, F2 or F3 fails; partial if all hold and the instrument or the control fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/eq-probe3 on L = 40, T = 6, sigma 1 and 1.5 (no L = 48 run): at sigma 1
//  the ratio pull / (-dk/dr) is 0.998, 1.216, 1.292, 1.319, 1.330, 1.336 at r = 3 .. 8, the pull's slope on r 5 .. 8 is
//  -2.04 against the gradient's -2.12, and the ramp's pull is 1.593e-2 to 1.608e-2 over r 4 .. 8; at sigma 1.5 the
//  packet reaches the source (ratio 1.27 to 2.31), which fixed sigma 1. tmp/eq-probe4: the solver diagnosis of point 7.
//
// Depth: L2 (a known construction, a Dirac-type walk in a static scalar field, read on this rule's pieces; the kernel is
// the depth register's float stand-in, added to the rule). DETERMINISM: no random numbers. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { sectorBases } from '@/code/measure/register-sea'
import { shellMeans, staticDepth } from '@/code/measure/energy-lines'
import {
  columnKernel,
  oneTorus,
  packetRun,
} from '@/code/measure/register-count'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const RADII: readonly number[] = [3, 4, 5, 6, 7, 8]
const FAR: readonly number[] = [5, 6, 7, 8]
const RAMP_RADII: readonly number[] = [4, 5, 6, 7, 8]
const RAMP_UNIT = 0.01
const FLAT = 0.05
const SLOPE = 0.15
const RAMP_FLAT = 0.02
const FALL = 2
const EXACT = 1e-10
const FREE = 1e-12
// 64 - a - 64 carries the rounding of 64 (7e-15 absolute) on weights down to 1e-5
const SEA = 1e-6
const SOLVE_SIDE = 16
const SEA_COUNT = 64
const REF = 8

export type FalloffPlan = {
  sides: readonly number[]
  sigma: number
  cycles: number
}

export const GATE_PLAN: FalloffPlan = { sides: [40, 48], sigma: 1, cycles: 6 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gravity/register-falloff',
  code: 'E-GRV-0148',
  title: 'PLACEHOLDER',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return falloffRun(GATE_PLAN)
  },
})

// least-squares slope of ln y against ln x
function logSlope(xs: readonly number[], ys: readonly number[]): number {
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const mx = lx.reduce((a, v) => a + v, 0) / lx.length
  const my = ly.reduce((a, v) => a + v, 0) / ly.length

  return (
    lx.reduce((a, v, i) => a + (v - mx) * (ly[i]! - my), 0) /
    lx.reduce((a, v) => a + (v - mx) ** 2, 0)
  )
}

const spreadOf = (x: readonly number[]): number => {
  const mean = x.reduce((a, v) => a + v, 0) / x.length

  return (Math.max(...x) - Math.min(...x)) / mean
}

type SideRead = {
  L: number
  grad: number[]
  pull: number[]
  reversed: number[]
  ramp: number[]
  ratio: number[]
  slopePull: number
  slopeGrad: number
  farSpread: number
  rampSpread: number
  fall: number
  drift: number
  free: number
  torus: number
}

function sideRead(L: number, plan: FalloffPlan, log: (s: string) => void): SideRead {
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const thG = -unitAngle(ringUnit(STRING[0], STRING[1]))
  const o = oneTorus(L, 2)
  const { column: k } = columnKernel(L)
  const bases = sectorBases()
  const zero = new Float64Array(o.sites.length)
  const field = (scale: number): Float64Array =>
    Float64Array.from(o.column, c => scale * k[c]!)
  const rampField = (scale: number): Float64Array =>
    Float64Array.from(o.sites, p => {
      const x = ((p[0]! % L) + L) % L

      return scale * Math.min(x, L - x)
    })
  const at = (angleS: Float64Array, r: number): { x: number; drift: number } => {
    const run = packetRun({
      o,
      band: 'A',
      angleS,
      angleD: zero,
      r,
      sigma: plan.sigma,
      cycles: plan.cycles,
      theta: th,
      bases,
    })

    return { x: run.x[run.x.length - 1]!, drift: run.drift }
  }
  const plus = field(thG)
  const minus = field(-thG)
  const rampPlus = rampField(thG * RAMP_UNIT)
  const rampMinus = rampField(-thG * RAMP_UNIT)

  let drift = 0
  let free = 0

  const grad: number[] = []
  const pull: number[] = []
  const reversed: number[] = []
  const ramp: number[] = []

  for (const r of RADII) {
    const z = at(zero, r)
    const p = at(plus, r)
    const m = at(minus, r)
    const rp = at(rampPlus, r)
    const rm = at(rampMinus, r)

    drift = Math.max(drift, z.drift, p.drift, m.drift, rp.drift, rm.drift)
    free = Math.max(free, Math.abs(z.x))
    grad.push((k[r + 1]! - k[r - 1]!) / 2)
    pull.push(-(p.x - z.x))
    reversed.push(-(m.x - z.x))
    ramp.push(-(rp.x - rm.x) / 2)
    log(`L ${L} r ${r}: pull ${pull[pull.length - 1]!.toExponential(4)} ramp ${ramp[ramp.length - 1]!.toExponential(4)}`)
  }

  const idx = (rs: readonly number[]): number[] => rs.map(r => RADII.indexOf(r))
  const far = idx(FAR)
  const ratio = pull.map((v, i) => v / grad[i]!)

  return {
    L,
    grad,
    pull,
    reversed,
    ramp,
    ratio,
    slopePull: logSlope(FAR, far.map(i => pull[i]!)),
    slopeGrad: logSlope(FAR, far.map(i => grad[i]!)),
    farSpread: spreadOf(far.map(i => ratio[i]!)),
    rampSpread: spreadOf(idx(RAMP_RADII).map(i => ramp[i]!)),
    fall: pull[RADII.indexOf(5)]! / pull[RADII.indexOf(8)]!,
    drift,
    free,
    torus: (4 * Math.PI * 8 ** 3) / (3 * L ** 3),
  }
}

export function falloffRun(plan: FalloffPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- I3: the solver on the sea's uniform count, and the bypass ----------------
  const n = SOLVE_SIDE ** 3
  const hole = new Float64Array(n)

  for (let c = 0; c < n; c++) {
    const x = c % SOLVE_SIDE
    const y = Math.floor(c / SOLVE_SIDE) % SOLVE_SIDE
    const z = Math.floor(c / (SOLVE_SIDE * SOLVE_SIDE))
    const m = (v: number): number => Math.min(v, SOLVE_SIDE - v)

    hole[c] = Math.exp(-(m(x) ** 2 + m(y) ** 2 + m(z) ** 2) / 3)
  }

  const total = hole.reduce((a, v) => a + v, 0)
  const raw = Float64Array.from(hole, v => SEA_COUNT - v / total)
  const drop = (rho: Float64Array): number => {
    const p = shellMeans(SOLVE_SIDE, 0, staticDepth(SOLVE_SIDE, rho).depth)

    return p[0]! - p[REF]!
  }
  // the hole counted from the sea is +1 (E-GRV-0146); the raw count is the sea's uniform count minus the hole
  const ordered = drop(Float64Array.from(hole, v => v / total))
  const fromSea = drop(Float64Array.from(raw, v => v - SEA_COUNT))
  const direct = drop(raw)
  const I3 =
    Math.abs(fromSea / -ordered - 1) <= SEA &&
    !(Math.abs(direct / -ordered - 1) <= 1)

  log('I3')

  // ---------------- the pulls ----------------
  const sides = plan.sides.map(L => sideRead(L, plan, log))
  const F1 = sides.every(s =>
    s.pull.every((v, i) => v > 0 && (i === 0 || v < s.pull[i - 1]!)),
  )
  const F2 = sides.every(s => s.farSpread <= FLAT)
  const F3 = sides.every(s => Math.abs(s.slopePull - s.slopeGrad) <= SLOPE)
  const CR = sides.every(s => s.rampSpread <= RAMP_FLAT && s.fall >= FALL)
  const I1 = sides.every(s => s.drift <= EXACT)
  const I2 = sides.every(s => s.free <= FREE)
  const hard = F1 && F2 && F3
  const instrument = I1 && I2 && I3
  const status = !hard ? 'fail' : !instrument || !CR ? 'partial' : 'pass'
  const e3 = (v: number): string => v.toExponential(3)
  const metrics: Record<string, number> = {
    F1: flag(F1),
    F2: flag(F2),
    F3: flag(F3),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    CR: flag(CR),
    solverOrdered: ordered,
    solverFromSea: fromSea,
    solverDirect: direct,
    seconds: (Date.now() - started) / 1000,
  }

  sides.forEach(s => {
    const key = `L${s.L}`

    metrics[`${key}_slopePull`] = s.slopePull
    metrics[`${key}_slopeGrad`] = s.slopeGrad
    metrics[`${key}_farSpread`] = s.farSpread
    metrics[`${key}_rampSpread`] = s.rampSpread
    metrics[`${key}_fall`] = s.fall
    metrics[`${key}_torus`] = s.torus
    metrics[`${key}_free`] = s.free
    RADII.forEach((r, i) => {
      metrics[`${key}_r${r}_pull`] = s.pull[i]!
      metrics[`${key}_r${r}_grad`] = s.grad[i]!
      metrics[`${key}_r${r}_ratio`] = s.ratio[i]!
      metrics[`${key}_r${r}_reversed`] = s.reversed[i]!
      metrics[`${key}_r${r}_ramp`] = s.ramp[i]!
      metrics[`${key}_r${r}_r2grad`] = s.grad[i]! * r * r
    })
  })

  const sideText = sides
    .map(
      s =>
        `L ${s.L}: pull ${s.pull.map(e3).join(' ')}, over -dk/dr ${s.ratio.map(v => v.toFixed(4)).join(' ')} (r 3..8), spread on r 5..8 ${s.farSpread.toFixed(4)}, slope ${s.slopePull.toFixed(4)} against the gradient's ${s.slopeGrad.toFixed(4)}; ramp ${s.ramp.map(e3).join(' ')}, spread on r 4..8 ${s.rampSpread.toFixed(4)}; pull(5)/pull(8) ${s.fall.toFixed(3)}`,
    )
    .join('; ')

  return verdict({
    status,
    claim: `F1 ${F1}; F2 ${F2}; F3 ${F3}; control CR ${CR}; instrument I1 ${I1} I2 ${I2} I3 ${I3} (the spread hole's x(0) - x(8): ordered ${e3(ordered)}, counted from the sea on a uniform ${SEA_COUNT} ${e3(fromSea)}, solved directly ${e3(direct)}). ${sideText}`,
    metrics,
    control: { CR: flag(CR), instrument: flag(instrument) },
    notes: `L2. One band-A column packet (sigma ${plan.sigma}) in a static band-A source's field, ${plan.cycles} cycles, on the slab (sides ${plan.sides.join(', ')} by 2). Kernel r^2 dk/dr: ${sides.map(s => `L ${s.L} ${s.grad.map((g, i) => (g * RADII[i]! ** 2).toFixed(4)).join(' ')}`).join('; ')}. Torus term at r 8: ${sides.map(s => `L ${s.L} ${s.torus.toFixed(4)}`).join(', ')}. Reversed (members): ${sides.map(s => `L ${s.L} ${s.reversed.map(e3).join(' ')}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
