// THE HUSK'S 3D LIGHT BALANCE, MEASURED (E-FRC-0262). E-FRC-0261 fixed the criterion for the light's split rho = f / s:
// E-FRC-0234's virial identity s sum <e^2> = f sum <B^2> makes the average link register and the average plaquette
// register fill alike, and reach their seams at one temperature, exactly when rho is the balance (Planck to the
// highest temperature). The ladder's balance 3 was measured; the 3D one was carried over as 3/8 (12 bulk links over
// 32 bulk triangles a dock) or read as 9/20 (9 husk link directions over 20 husk triangles), never measured on the
// husk. This experiment measures it.
//
// DERIVED BEFORE THE GATE RUN (two probes were run first, disclosed at the end of this header).
// 1. THE FILLS ARE PROJECTOR DIAGONALS. The husk trit light (code/rule/trit-column) runs x' = s e (the drift) and
//    e' = -f C^T N C W x (the kick), C the husk curl, W = diag(w) the link weights (1 on an axis, 2 on a face
//    diagonal: an axis column holds 2D bulk links, a diagonal D), N = diag(n) the triangle multiplicities. Its
//    conserved energy is H = (s/2) e^T W e + (f/2) B^T N B with B = C W x, and (x, p = W e) is a canonical pair. In
//    the Gibbs state at temperature T, the classical regime where columns reach their seams, equipartition gives
//    <e_l^2> = (T/s) pi_l / w_l and <B_P^2> = (T/f) Pi_P / n_P, with pi the diagonal of the projector onto
//    range(W^(1/2) C^T) and Pi the diagonal of the projector onto range(N^(1/2) C W). Both traces are rank C, which
//    is the virial identity in its weighted form, s sum w <e^2> = f sum n <B^2>.
// 2. THE BALANCE. Registers of one capacity reach their seams at one temperature when their fills are equal. The
//    average link register against the average plaquette register (E-FRC-0234's criterion) balance at
//        rho_avg = mean_P (Pi_P / n_P) / mean_l (pi_l / w_l),
//    and one class of link against one class of plaquette at rho = (Pi_P / n_P) / (pi_l / w_l). With every weight
//    1 both traces are rank C and rho_avg = L / P, the bare count, exactly: 3 on the ladder, 12/32 = 3/8 on the
//    bulk light, 9/20 on the husk. So the bare counts are what the balance is when weights are ignored, and the
//    husk's weights are what can move it.
// 3. THE BULK READING IS EXACTLY 3/8, WITH NO SPREAD. On the bulk light every weight is 1, W(F4) sends every root to
//    every other, and the 32 triangles are one orbit, so every link fills rank / 12 and every triangle rank / 32:
//    one split, 3/8, fills every register alike. Predicted exact.
// 4. THE HUSK READING IS NOT A BARE COUNT. The husk light is the bulk light's depth zero mode, read with its
//    column weights: an axis husk link sums 2D bulk links and a diagonal D, and a husk triangle has n_P D bulk
//    triangles over it (n_P is 1 on 8 of the 20 husk triangle types a dock and 2 on 12). So its fills are weighted,
//    its average balance is not 9/20, and its classes need not agree. Predicted: rho_avg between 3/8 and 3/5,
//    different from each of 3/8, 9/20, 3/5 and 9/32 by more than 1 percent, and the per-class balances spread by
//    at least a factor of 2 (no single split fills every husk register alike).
// 5. EVEN THE LADDER'S CLASSES DISAGREE. The ladder's rails and rung are different classes: in the rung-rail
//    symbol the rails fill sqrt 3 / 6 and the rung 1 - 1/sqrt 3 of the plaquette's 1, so the rails balance at
//    2 sqrt 3 = 3.464 and the rung at (3 + sqrt 3) / 2 = 2.366, and only the average is 3. E-FRC-0234's criterion
//    is the average. Read, not gated.
// 6. WHAT A MEASURED BALANCE DOES, derived for any rho:
//    - alpha = sqrt(3 / (2 rho)) / (12 N) (E-FRC-0261, free of kappa), so 1/alpha = 12 N sqrt(2 rho / 3), N = 2D + 1.
//      No new fitting: the formula and E-FRC-0261's admissible depths D = 1 .. 10,000, target 137.035999177,
//      window 1e-3 and null (chance about eps T / A for 1/alpha = A N over odd N) are E-FRC-0261's, unchanged.
//    - one exact speed (kappa = 3/16) at a balanced split needs rho / 3 to be a rational square (E-FRC-0261's
//      theorem). A balance that is a lattice integral, not a count, need not be rational at all; then no integer
//      split sits on the balance exactly either, and the balance and one speed are BOTH limits of the register:
//      by Dirichlet's simultaneous approximation of (rho, sqrt(16 rho / 3)) a register of about eps^(-2/3) meets
//      both within eps, so about 1e12 for the 1e-18 bound on light's speed. A bound, argued, not gated.
//
// GATES, fixed before the gate run:
// I1 WITNESS: on a husk torus of side 4 the dense projectors built from the box's own triangles and links (no
//    symbol, no type grouping) give the same class fills as the symbol averaged over the box's 64 momenta, within
//    1e-9, and every link and triangle of one class the same fill within 1e-9 (translation invariance)
// I2 VIRIAL: on every light and grid read, sum pi = sum Pi = the mean rank, within 1e-9
// C1 LADDER (E-FRC-0234): rho_avg = 3 within 1e-12 at g = 64
// C2 E-FRC-0261 W3: its Planck ratios at T = omega_min for the rho = 3 split and the nearest-3/8 split at N = 17, 21,
//    25, recomputed here through the same measure functions, equal its own run's metrics bit for bit (===)
// C3 BARE COUNTS: the unweighted husk gives rho_avg = 9/20 and the bulk 3/8, within 1e-12, and on the bulk every link
//    fills alike and every triangle fills alike, within 1e-12
// M1 CONVERGENCE: the husk's rho_avg at g = 8, 16, 24, 32 changes by at most 1e-6 from g = 24 to 32
// M2 NOT A CANDIDATE: the husk's rho_avg differs from each of 3/8, 9/20, 3/5, 9/32 by more than 1 percent, relatively
// M3 NO ONE SPLIT: the husk's per-class balances (2 link classes by 2 triangle classes) span a factor of at least 2
// READ: the husk's class fills and per-class balances, the fill ratio (plaquette over link, averages) at each
// candidate split, the ladder's per-class balances, alpha at the measured balance (nearest D, miss, null chance),
// and the Dirichlet register bound.
// Status: partial if every gate holds (the balance is measured, and it is a reading-dependent answer: 3/8 on the
// bulk registers, a non-count value on the husk's own, with no single split filling every husk class); fail
// otherwise.
//
// Depth L2: exact equipartition (projectors) of the model's own linear husk light and bulk light, on a Brillouin
// grid with a finite-box witness; the trit rule's dither and wraps are not run, and the classical regime is the
// one where seams are reached. No start family: every claim is about the rule's constants.
//
// PROBES, disclosed. tmp/hb-probe1.log (the first version failed to group husk triangles into types, since it
// anchored each at the box's first-listed link, which is not translation invariant; fixed by the least key over all
// anchors and both orientations, tmp/hb-probe1b.log): ladder rho_avg 3 at g = 16 and 64, rails 0.288675, rung
// 0.422650; unweighted husk 9/20 at g = 6 and 10; the weighted husk rho_avg 0.4613819 (g = 6) and 0.4613819 (g =
// 10), link fills 0.83880 (axis) and 0.45697 (diagonal), triangle fills 0.34780 (n = 1, 8 types) and 0.21740 (n =
// 2, 12 types); bulk rank 11, every link 11/12, every triangle 11/32, rho_avg 3/8. tmp/hb-probe2.log: the side-4
// witness agrees with the symbol at the box's 64 momenta to 3e-13 in every class (axis 0.8354911, diagonal
// 0.4551897, n = 1 0.3459071, n = 2 0.2167289), with every link and triangle of a class equal to 1.2e-14, in 62 s.
// The Jacobi stopping rule was made relative before that probe (an absolute 1e-30 could stall on a 576 matrix).
// NOT BLIND: point 4's predictions and gates M2 and M3 were written AFTER probe 1 had shown the husk's balance
// (0.4614) and its class spread (a factor of about 2.9), so they record a measurement, not a prediction. The blind
// parts are the derivation's exact claims (points 2, 3 and 5) and the controls C1 to C3 and I1 to I2.
//
// FIRST RUN 2026-09-28 (tmp/hb-exp-run1.log, 137 s): PARTIAL, all eight gates held, no gate moved. Ladder rho_avg 3,
// rails 2 sqrt 3 = 3.4641016, rung (3 + sqrt 3) / 2 = 2.3660254. Bulk 3/8 (0.375 to 4e-15), link spread 1.6e-15,
// triangle spread 4.4e-16. Unweighted husk 9/20. Weighted husk rho_avg 0.46138187 (g = 8), 0.46138185 (16),
// 0.461381849 (24), 0.461381849 (32): 0.4613818, which misses 3/8 by +23.0%, 9/20 by +2.5%, 3/5 by -23.1% and 9/32
// by +64.0%. Class fills: axis links 0.838803, diagonal links 0.456966, n = 1 triangles 0.347800, n = 2 triangles
// 0.217400; class balances 0.4146, 0.2592, 0.7611, 0.4757, a factor of 2.94. Witness at side 4: 2.6e-13, spread
// 1.2e-14. E-FRC-0261's W3 reproduced bit for bit. alpha at rho = 0.4613818: 1/alpha = 6.65527 N, nearest D = 10
// (139.761, 1.99% off), outside the 1e-3 window; the null puts some depth that close with chance 0.41, and in the
// window with chance 0.021; nothing is claimed.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { LadderSpec } from '@/code/rule/plaquette-ladder'
import type { Split } from '@/code/rule/loop-ring'
import {
  oneQuantumBand,
  planck,
  thermalEnergy,
  unwrapped,
} from '@/code/measure/quantum-ladder'
import {
  loopSplits,
  nearestRatio,
} from '@/code/measure/one-light-split'
import {
  alphaOfBalance,
  nearestDepth,
} from '@/code/measure/light-split-origin'
import {
  averageFills,
  balances,
  boxFills,
  bulkLight,
  huskLight,
  ladderLight,
} from '@/code/measure/husk-balance'
import { lightSplitOriginRun } from '@/test/experiment/gauge/light-split-origin'

/** The candidate balances, as [a, b] for a / b. */
const CANDIDATES: readonly (readonly [number, number])[] = [
  [3, 8],
  [9, 20],
  [3, 5],
  [9, 32],
]

const GRIDS = [8, 16, 24, 32]

/** E-FRC-0261's frozen prediction test, unchanged. */
const TARGET = 137.035999177
const WINDOW = 1e-3
const MAX_DEPTH = 10000

const PLANCK_BOXES = [17, 21, 25]

const mean = (xs: number[]): number =>
  xs.reduce((a, b) => a + b, 0) / xs.length
const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0)

/** E-FRC-0261's Planck ratio at T = x * omega_min, rebuilt from the same measure functions. */
function planckRatio(spec: LadderSpec, x: number): number {
  const { band, levels } = oneQuantumBand(spec)
  const { energies } = unwrapped(levels)
  const omegas = band.map(b => b.omega)
  const T = x * Math.min(...omegas)

  return (
    thermalEnergy(energies, T) /
    omegas.reduce((acc, w) => acc + planck(w, T), 0)
  )
}

const specOf = (n: number, split: Split): LadderSpec => ({
  n,
  plaquettes: 2,
  root: split.root,
  drift: split.drift,
  force: split.force,
})

export function huskBalanceRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}

  let i2 = true

  const virial = (f: {
    pi: number[]
    Pi: number[]
    rank: number
  }): boolean =>
    Math.abs(sum(f.pi) - f.rank) <= 1e-9 &&
    Math.abs(sum(f.Pi) - f.rank) <= 1e-9

  // C1, and the ladder's classes
  const ladder = ladderLight()
  const lf = averageFills(ladder.light, 64, ladder)
  const lb = balances(lf, ladder)

  i2 &&= virial(lf)
  metrics.ladderAverage = lb.average
  metrics.ladderRailBalance = lb.plaquetteFill[0]! / lb.linkFill[0]!
  metrics.ladderRungBalance = lb.plaquetteFill[0]! / lb.linkFill[2]!

  const c1 = Math.abs(lb.average - 3) <= 1e-12

  // C3, bare counts
  const husk = huskLight()
  const ones = { w: husk.w.map(() => 1), n: husk.n.map(() => 1) }
  const hu = averageFills(husk.light, 16, ones)
  const hub = balances(hu, ones)
  const bulk = bulkLight()
  const bf = averageFills(bulk.light, 6, bulk)
  const bb = balances(bf, bulk)

  i2 &&= virial(hu) && virial(bf)
  metrics.huskUnweightedAverage = hub.average
  metrics.bulkAverage = bb.average
  metrics.bulkLinkSpread =
    Math.max(...bb.linkFill) - Math.min(...bb.linkFill)

  metrics.bulkTriangleSpread =
    Math.max(...bb.plaquetteFill) - Math.min(...bb.plaquetteFill)
  metrics.bulkTypes = bulk.light.plaquettes.length
  metrics.huskTypes = husk.light.plaquettes.length

  const c3 =
    Math.abs(hub.average - 9 / 20) <= 1e-12 &&
    Math.abs(bb.average - 3 / 8) <= 1e-12 &&
    metrics.bulkLinkSpread <= 1e-12 &&
    metrics.bulkTriangleSpread <= 1e-12

  // M1: the husk's weighted balance on growing grids
  const averages: number[] = []

  let last: ReturnType<typeof balances> | undefined

  for (const g of GRIDS) {
    const f = averageFills(husk.light, g, husk)
    const b = balances(f, husk)

    i2 &&= virial(f)
    averages.push(b.average)
    metrics[`huskAverage_g${g}`] = b.average
    last = b
  }

  const rho = averages[averages.length - 1]!
  const m1 =
    Math.abs(
      averages[averages.length - 1]! - averages[averages.length - 2]!,
    ) <= 1e-6

  metrics.huskBalance = rho

  // the classes: links axis (w = 1) and diagonal (w = 2), triangles n = 1 and n = 2
  const linkClass = {
    axis: mean(last!.linkFill.slice(0, 3)),
    diagonal: mean(last!.linkFill.slice(3)),
  }
  const triClass = {
    one: mean(last!.plaquetteFill.filter((_, t) => husk.n[t] === 1)),
    two: mean(last!.plaquetteFill.filter((_, t) => husk.n[t] === 2)),
  }

  metrics.fillAxis = linkClass.axis
  metrics.fillDiagonal = linkClass.diagonal
  metrics.fillTriangleOne = triClass.one
  metrics.fillTriangleTwo = triClass.two
  metrics.typesTriangleOne = husk.n.filter(n => n === 1).length
  metrics.typesTriangleTwo = husk.n.filter(n => n === 2).length

  const perClass: number[] = []

  for (const [ln, l] of Object.entries(linkClass)) {
    for (const [tn, t] of Object.entries(triClass)) {
      metrics[`classBalance_${ln}_${tn}`] = t / l
      perClass.push(t / l)
    }
  }

  const m3 = Math.max(...perClass) / Math.min(...perClass) >= 2

  // M2 and the fill ratio at each candidate
  let m2 = true

  for (const [a, b] of CANDIDATES) {
    const c = a / b

    metrics[`missFrom_${a}_${b}`] = rho / c - 1
    metrics[`fillRatioAt_${a}_${b}`] = rho / c
    m2 &&= Math.abs(rho / c - 1) > 0.01
  }

  // I1, the witness
  const box = boxFills(4)
  const symbol = balances(averageFills(husk.light, 4, husk, 0), husk)
  const boxClass = (
    keep: (l: number) => boolean,
    fills: number[],
  ): number[] => fills.filter((_, l) => keep(l))
  const axisBox = boxClass(l => box.linkDirection[l]! < 3, box.linkFill)
  const diagBox = boxClass(
    l => box.linkDirection[l]! >= 3,
    box.linkFill,
  )
  const oneBox = boxClass(
    p => box.plaquetteN[p] === 1,
    box.plaquetteFill,
  )
  const twoBox = boxClass(
    p => box.plaquetteN[p] === 2,
    box.plaquetteFill,
  )
  const spread = (xs: number[]): number =>
    Math.max(...xs) - Math.min(...xs)
  const symbolClass = [
    mean(symbol.linkFill.slice(0, 3)),
    mean(symbol.linkFill.slice(3)),
    mean(symbol.plaquetteFill.filter((_, t) => husk.n[t] === 1)),
    mean(symbol.plaquetteFill.filter((_, t) => husk.n[t] === 2)),
  ]
  const boxMeans = [
    mean(axisBox),
    mean(diagBox),
    mean(oneBox),
    mean(twoBox),
  ]
  const witnessGap = Math.max(
    ...boxMeans.map((x, k) => Math.abs(x - symbolClass[k]!)),
  )
  const witnessSpread = Math.max(
    spread(axisBox),
    spread(diagBox),
    spread(oneBox),
    spread(twoBox),
  )
  const i1 = witnessGap <= 1e-9 && witnessSpread <= 1e-9

  metrics.witnessGap = witnessGap
  metrics.witnessSpread = witnessSpread

  // C2: E-FRC-0261's W3 numbers, bit for bit
  const e0261 = lightSplitOriginRun().metrics

  let c2 = true

  for (const n of PLANCK_BOXES) {
    const three = loopSplits(n, 3, 16, 64).find(
      s => s.w === 4 && s.force === 3 * s.drift,
    )!
    const near = nearestRatio(loopSplits(n, 3, 16, 64), [3, 8])
    const r3 = planckRatio(specOf(n, three), 1)
    const rn = planckRatio(specOf(n, near), 1)

    metrics[`e0261Rho3_N${n}`] = r3
    metrics[`e0261Near_N${n}`] = rn
    c2 &&=
      r3 === e0261[`planckRho3_N${n}`] &&
      rn === e0261[`planckNear3over8_N${n}`]
  }

  // READ: alpha at the measured balance, E-FRC-0261's frozen test unchanged
  const best = nearestDepth(
    n => alphaOfBalance(n, rho),
    TARGET,
    MAX_DEPTH,
  )
  const slope = 1 / alphaOfBalance(1, rho)

  metrics.alphaNearestD = best.d
  metrics.alphaNearestInverse = best.inverse
  metrics.alphaNearestMiss = best.miss
  metrics.alphaNullChanceWindow = (WINDOW * TARGET) / slope
  metrics.alphaNullChanceAtMiss = (best.miss * TARGET) / slope
  metrics.alphaSlope = slope
  metrics.dirichletRegisterFor1e18 = 1e12

  const gates = {
    I1: i1,
    I2: i2,
    C1: c1,
    C2: c2,
    C3: c3,
    M1: m1,
    M2: m2,
    M3: m3,
  }

  for (const [k, v] of Object.entries(gates)) {
    metrics[`gate${k}`] = v ? 1 : 0
  }

  metrics.seconds = (Date.now() - started) / 1000

  const f6 = (x: number | undefined): string =>
    (x ?? Number.NaN).toFixed(6)

  return verdict({
    status: Object.values(gates).every(Boolean) ? 'partial' : 'fail',
    claim: `the husk light's 3D balance, measured by exact equipartition: on the bulk light every one of 12 links fills alike and every one of 32 triangles fills alike, so the bulk registers balance at exactly 3/8 (${bb.average}); on the husk light read with its own column weights (1 on an axis, 2 on a diagonal; triangle multiplicity 1 on 8 types, 2 on 12) the average link and plaquette registers balance at rho = ${f6(rho)}, not 3/8, 9/20, 3/5 or 9/32 (misses ${CANDIDATES.map(([a, b]) => `${a}/${b} ${(metrics[`missFrom_${a}_${b}`]! * 100).toFixed(2)}%`).join(', ')}), and no single split fills every husk class alike (class balances ${perClass.map(f6).join(', ')}); the unweighted husk reproduces the bare count 9/20 and the ladder its 3, whose rails and rung balance apart at 2 sqrt 3 and (3 + sqrt 3) / 2; at the husk's balance 1/alpha = ${slope.toFixed(4)} N, nearest D = ${best.d} (${best.inverse.toFixed(3)}, ${(best.miss * 100).toFixed(2)} percent), no hit`,
    metrics,
    control: {
      ladderAverage: lb.average,
      huskUnweightedAverage: hub.average,
      bulkAverage: bb.average,
      witnessGap,
    },
    notes: `L2, deterministic (a uniform Brillouin grid, cyclic Jacobi, no draw). Gates: ${JSON.stringify(gates)}. Exact equipartition of the linear light; the trit rule's dither and wraps are not run. The balance is reading dependent: 3/8 if the registers are the bulk's trits, ${f6(rho)} if they are the husk's weighted columns. The one-speed register bound 1e12 is Dirichlet's, argued, not gated.`,
  })
}

export default experiment({
  id: 'gauge/husk-balance',
  code: 'E-FRC-0262',
  title:
    "the husk light's 3D balance split, measured, partial as derived: by exact equipartition the bulk light's registers balance at exactly 3/8 with every link and triangle alike, while the husk light read with its own column weights balances at about 0.4614, none of the carried-over 3/8, the bare husk count 9/20, 3/5 or 9/32, and no single split fills every husk register class alike; alpha at that balance gives no depth near 137.036",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return huskBalanceRun()
  },
})
