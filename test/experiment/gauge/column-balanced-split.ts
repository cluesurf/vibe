// The balanced split lives in the column, not in the mode (E-FRC-0234). The plaquette ladder's quantum light
// (code/rule/plaquette-ladder, E-FRC-0230 to 0233) with kappa = 2 / (2D + 1) split between drift and force.
// E-FRC-0232 found a hot box a few percent below Planck and read it as "one split balances only the modes near
// K = N/2, a balanced ladder for every k needs the split per mode". That reading measured each mode by its loop
// amplitude m_k, which is not a column. This file derives where the balance lives and measures Planck with it.
//
// THE EXACT REASON, derived before any run.
//   (1) the seams      The rule's only nonlinearity is the wrap of each register: the drift reads bal(e) on every
//                      LINK column (e = m_a - m_b, or e = m_a on an edge link) and the force reads bal(B) on every
//                      SQUARE column (B the angle conjugate to the square's loop). The harmonic reading, and with it
//                      the oscillator rungs and Planck, holds while the link columns and the square columns stay
//                      inside their seams at +-D. The loop register m_p itself is read only through its links.
//   (2) the virial     In the harmonic reading each mode's beat is the leapfrog (B, m) -> (B + s K m, m - f B'),
//                      whose invariant is Q = f B^2 + f s K B m + s K m^2. A stationary state of the mode (a Fock
//                      level, any mixture of them, the thermal state) has second moments proportional to the
//                      inverse of that form, so s K <|m_k|^2> = f <|B_k|^2>, and s K |m_k|^2 = s sum over the
//                      mode's links |e|^2. Summed over modes: s sum_links <e^2> = f sum_squares <B^2> EXACTLY,
//                      whatever the occupation of each mode. The ratio in which a state fills its link columns
//                      and its square columns is fixed by the split alone and is the SAME FOR EVERY MODE.
//   (3) the balance    So the split is balanced when the average link column and the average square column fill
//                      alike: f / s = (links) / (squares). One integer split does it for every mode at once. On
//                      the ladder: 3 links per square (two rails and one rung), f / s = 3. For the single column
//                      of E-FRC-0230 (L = 1, the rung shared with itself carries 0) it is 2, the split 0230 found
//                      by its per-mode reasoning: the two readings agree only where there is one mode.
//   (4) why 0232 fell short   Its split carried kappa in the drift (c = 2, r = N: f / s = N / 2), so every link
//                      column filled N / 6 times faster than the square columns (4.2 at N = 25) and reached its
//                      seam at a temperature about sqrt N times too low.
// The integer split: M = 2 N^2 w, c r = 2 N w^2 (so s f = 2 / N exactly), (c, r) the divisor pair with r / c
// nearest 3 multiplicatively, w = 1 .. 8 (code/rule/loop-ring splitNear, integer comparisons only). Every
// exponent is an integer mod M; no real enters the rule.
//
// Gates, fixed before the first run (code checks before this file: tmp/qlit-probe2.ts compared the kernels
// and printed the chosen splits, no spectrum or thermal number was computed):
// B1 the virial (the exact reason): on the boxes (N, L) = (17, 2), (21, 2), (25, 2), (13, 3) with the column
//    split, every level below the cut 3 omega_max has s sum<bal(e)^2> / (f sum<bal(B)^2>) within 1e-2 of 1
// B2 Planck: with the column split, on the same boxes, the thermal energy of all the box's levels is within
//    1e-3 of sum_k omega_k / (e^(omega_k / T) - 1) at T / omega_min = 1/4, 1/2, 1 on every box and at 2 on the
//    boxes with N >= 21
// B3 the control (E-FRC-0232's split, c = 2, r = N): at T = 2 omega_min it departs from Planck by more than 1e-3
//    on every box, and the column split's departure there is at least 10 times smaller on every box
// B4 the hot box: at T = 4 and 8 omega_min the column split holds a larger fraction of Planck than the control
//    on every box
// Reported: the chosen splits, the fills of the one-quantum levels (edge links against shared links), the bulk
// seam weight (the expected number of link and square columns at their last trit) at T = 2 and 4 omega_min.
// Status: pass if B1 to B4 pass; partial if B1 and B3 pass; fail otherwise.
//
// Depth L2: the finite oscillator of the model's column registers under the model's light rule; the novel part
// is the exact reason (2) and the rule it gives (3).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { bal } from '@/code/rule/lattice-qed'
import { inverseDepthSpec, ladderKernel, splitOf, toAngleBasis, fluxesOf, type LadderSpec } from '@/code/rule/plaquette-ladder'
import { splitNear } from '@/code/rule/loop-ring'
import { oneQuantumBand, planck, sectorBasis, sectorsOf, sectorToFull, thermalEnergy, unwrapped } from '@/code/measure/quantum-ladder'
import { ladderFills, ladderFillTables } from '@/code/measure/loop-spectrum'

const BOXES: readonly [number, number][] = [
  [17, 2],
  [21, 2],
  [25, 2],
  [13, 3],
]
const T_OVER_OMEGA = [1 / 4, 1 / 2, 1, 2]
const HOT = [4, 8]
const VIRIAL = 1e-2
const PLANCK = 1e-3

function columnSpec(n: number, L: number): LadderSpec {
  const split = splitNear(n, 3)

  return { n, plaquettes: L, root: split.root, drift: split.drift, force: split.force }
}

type Box = {
  omegas: number[]
  energies: number[]
  virialWorst: number
  belowCut: number
  ratios: Record<string, number>
  hot: Record<string, number>
  seamLinks: Record<string, number>
  seamSquares: Record<string, number>
  bandFills: { k: number; edge: number; shared: number; squares: number }[]
}

function study(spec: LadderSpec): Box {
  const L = spec.plaquettes
  const n = spec.n
  const D = (n - 1) / 2
  const { band, levels } = oneQuantumBand(spec)
  const { energies, vacuum } = unwrapped(levels)
  const omegas = band.map(b => b.omega)
  const cut = 3 * Math.max(...omegas)
  const kernel = ladderKernel(spec)
  const tables = ladderFillTables(kernel)
  const sectors = sectorsOf(spec)
  const bases = Array.from({ length: L }, (_, q) => sectorBasis(spec, sectors, q))
  const half = n ** L
  let virialWorst = 0
  let belowCut = 0
  const seamLink = new Float64Array(levels.length)
  const seamSquare = new Float64Array(levels.length)
  const fills = levels.map((l, i) => {
    const full = sectorToFull(spec, sectors, bases[l.q]!, l.q, l.vector)
    const f = ladderFills(kernel, tables, full)
    // the bulk: the expected number of columns at their last trit
    let sl = 0
    let ss = 0

    for (let j = 0; j < full.re.length; j++) {
      const w = full.re[j]! ** 2 + full.im[j]! ** 2

      if (w === 0) continue

      for (const e of fluxesOf(spec, j)) if (Math.abs(bal(e, n)) === D) sl += w
    }

    const angle = toAngleBasis(kernel, full.re, full.im)

    for (let j = 0; j < angle.re.length; j++) {
      const w = angle.re[j]! ** 2 + angle.im[j]! ** 2

      if (w === 0) continue

      let rest = j % half

      for (let p = 0; p < L; p++) {
        if (Math.abs(bal(rest % n, n)) === D) ss += w
        rest = Math.floor(rest / n)
      }
    }

    seamLink[i] = sl
    seamSquare[i] = ss

    if (energies[i]! < cut) {
      belowCut++
      virialWorst = Math.max(virialWorst, Math.abs(f.ratio - 1))
    }

    return f
  })
  const wmin = Math.min(...omegas)
  const ratios: Record<string, number> = {}
  const hot: Record<string, number> = {}
  const seamLinks: Record<string, number> = {}
  const seamSquares: Record<string, number> = {}
  const thermalMean = (values: Float64Array, T: number): number => {
    const lowest = Math.min(...energies)
    let z = 0
    let acc = 0

    energies.forEach((e, i) => {
      const w = Math.exp(-(e - lowest) / T)

      z += w
      acc += w * values[i]!
    })

    return acc / z
  }

  for (const x of T_OVER_OMEGA) {
    const T = x * wmin

    ratios[`T${x}`] = thermalEnergy(energies, T) / omegas.reduce((acc, w) => acc + planck(w, T), 0)
  }

  for (const x of HOT) {
    const T = x * wmin

    hot[`T${x}`] = thermalEnergy(energies, T) / omegas.reduce((acc, w) => acc + planck(w, T), 0)
  }

  for (const x of [2, 4]) {
    seamLinks[`T${x}`] = thermalMean(seamLink, x * wmin)
    seamSquares[`T${x}`] = thermalMean(seamSquare, x * wmin)
  }

  // the one-quantum levels' excess fills over the vacuum, per mode
  const vac = fills[vacuum]!
  const bandFills = band.map(b => {
    let best = -1
    let bestD = Infinity

    levels.forEach((l, i) => {
      if (l.q !== b.q || i === vacuum) return

      const d = Math.abs(energies[i]! - b.omega)

      if (d < bestD) {
        bestD = d
        best = i
      }
    })

    const f = fills[best]!

    return { k: b.k, edge: f.edge - vac.edge, shared: f.shared - vac.shared, squares: f.squares - vac.squares }
  })

  return { omegas, energies, virialWorst, belowCut, ratios, hot, seamLinks, seamSquares, bandFills }
}

export default experiment({
  id: 'gauge/column-balanced-split',
  code: 'E-FRC-0234',
  title:
    "the balanced split lives in the column, not in the mode: the virial theorem makes every mode fill its link columns and its square columns in the ratio f / s alone, so one integer split, f / s = links per square, balances every mode at once, and with it a hot box of the plaquette ladder's quantum light reaches Planck where E-FRC-0232's drift-carried split fell short",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let b1 = true
    let b2 = true
    let b3 = true
    let b4 = true

    for (const [n, L] of BOXES) {
      const tag = `N${n}L${L}`
      const spec = columnSpec(n, L)
      const control = inverseDepthSpec(n, L, 'drift')
      const box = study(spec)
      const ref = study(control)
      const { s, f } = splitOf(spec)

      metrics[`splitDrift${tag}`] = spec.drift
      metrics[`splitForce${tag}`] = spec.force
      metrics[`splitRoot${tag}`] = spec.root
      metrics[`splitRatio${tag}`] = f / s
      metrics[`virialWorst${tag}`] = box.virialWorst
      metrics[`levelsBelowCut${tag}`] = box.belowCut
      metrics[`controlVirialWorst${tag}`] = ref.virialWorst
      b1 &&= box.virialWorst <= VIRIAL

      for (const x of T_OVER_OMEGA) {
        metrics[`planckRatio${tag}T${x}`] = box.ratios[`T${x}`]!
        metrics[`controlPlanckRatio${tag}T${x}`] = ref.ratios[`T${x}`]!

        if (x < 2 || n >= 21) b2 &&= Math.abs(box.ratios[`T${x}`]! - 1) <= PLANCK
      }

      const dev = Math.abs(box.ratios.T2! - 1)
      const devControl = Math.abs(ref.ratios.T2! - 1)

      b3 &&= devControl > PLANCK && dev * 10 <= devControl

      for (const x of HOT) {
        metrics[`hotPlanckRatio${tag}T${x}`] = box.hot[`T${x}`]!
        metrics[`controlHotPlanckRatio${tag}T${x}`] = ref.hot[`T${x}`]!
        b4 &&= box.hot[`T${x}`]! > ref.hot[`T${x}`]!
      }

      for (const x of [2, 4]) {
        metrics[`seamLinks${tag}T${x}`] = box.seamLinks[`T${x}`]!
        metrics[`seamSquares${tag}T${x}`] = box.seamSquares[`T${x}`]!
        metrics[`controlSeamLinks${tag}T${x}`] = ref.seamLinks[`T${x}`]!
        metrics[`controlSeamSquares${tag}T${x}`] = ref.seamSquares[`T${x}`]!
      }

      box.bandFills.forEach((b, q) => {
        metrics[`oneQuantumEdgeFill${tag}q${q}`] = b.edge
        metrics[`oneQuantumSharedFill${tag}q${q}`] = b.shared
        metrics[`oneQuantumSquareFill${tag}q${q}`] = b.squares
        metrics[`oneQuantumVirial${tag}q${q}`] = (s * (b.edge + b.shared)) / (f * b.squares)
      })

      metrics[`omegaMin${tag}`] = Math.min(...box.omegas)
    }

    const gates = { B1: b1, B2: b2, B3: b3, B4: b4 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = b1 && b2 && b3 && b4 ? 'pass' : b1 && b3 ? 'partial' : 'fail'
    const tags = BOXES.map(([n, L]) => `N${n}L${L}`)
    const worst = (key: string, xs: readonly number[]): number => Math.max(...tags.flatMap(t => xs.map(x => Math.abs(metrics[`${key}${t}T${x}`]! - 1))))

    return verdict({
      status,
      claim: `every level of the plaquette ladder's quantum light below three top quanta fills its link columns and its square columns in the ratio f / s (s sum<e^2> = f sum<B^2> within ${Math.max(...tags.map(t => metrics[`virialWorst${t}`]!)).toExponential(1)}), whatever mode it occupies, so the split balances in the column: with f / s near 3 (links per square; realized ${tags.map(t => metrics[`splitRatio${t}`]!.toFixed(3)).join(', ')}) a box's thermal energy is Planck's within ${worst('planckRatio', [0.25, 0.5, 1]).toExponential(1)} up to T = omega_min and ${Math.max(...tags.map(t => Math.abs(metrics[`planckRatio${t}T2`]! - 1))).toExponential(1)} at 2 omega_min, against ${Math.min(...tags.map(t => Math.abs(metrics[`controlPlanckRatio${t}T2`]! - 1))).toExponential(1)} to ${Math.max(...tags.map(t => Math.abs(metrics[`controlPlanckRatio${t}T2`]! - 1))).toExponential(1)} for E-FRC-0232's drift-carried split; at 4 and 8 omega_min it holds ${tags.map(t => metrics[`hotPlanckRatio${t}T4`]!.toFixed(3)).join(', ')} and ${tags.map(t => metrics[`hotPlanckRatio${t}T8`]!.toFixed(3)).join(', ')} of Planck against ${tags.map(t => metrics[`controlHotPlanckRatio${t}T4`]!.toFixed(3)).join(', ')} and ${tags.map(t => metrics[`controlHotPlanckRatio${t}T8`]!.toFixed(3)).join(', ')}`,
      metrics,
      control: {
        controlPlanckRatioN25L2T2: metrics.controlPlanckRatioN25L2T2!,
        controlHotPlanckRatioN25L2T4: metrics.controlHotPlanckRatioN25L2T4!,
      },
      notes:
        "L2. FIRST RUN 2026-09-26 (tmp/frc0234.log, 81 s), FAIL on all four gates. No gate moved. B1: on the three two-square boxes every level below the cut obeys s sum<e^2> = f sum<B^2> within 8.2e-4, 3.0e-6, 2.0e-8 (N = 17, 21, 25; the one-quantum levels of k = 0 and k = pi within 5e-5), but (13, 3) misses by 0.107. B2: the two-square boxes reach Planck within 2.6e-5, 4.4e-7, 2.1e-7 up to T = omega_min (the control 1.5e-2, 1.5e-2, 4.6e-3) and within 9.2e-3, 2.2e-3, 8.4e-4 at 2 omega_min, so N = 21 misses the 1e-3 gate by a factor 2.2; (13, 3) misses from T = omega_min / 2 on (2.6e-3, 3.8e-2, 0.125). B3: the control departs by 9.0e-2, 6.6e-2, 3.7e-2, 0.24 at 2 omega_min and the column split is 9.7, 30, 44 and 1.9 times closer, so N = 17 misses the factor 10 by a hair and (13, 3) by far. B4: at 4 omega_min the column split holds more on the two-square boxes (0.882, 0.932, 0.958 against 0.795, 0.829, 0.849) but not on (13, 3) (0.750 against 0.753), and at 8 omega_min it holds LESS on three of four boxes (0.728, 0.785, 0.759 against 0.786, 0.793, 0.840; only N = 25 holds more, 0.823 against 0.774). DIAGNOSED AFTER THE RUN (tmp/qlit-probe3.ts, disclosed): (1) N = 13 is a shallow column at any length: (13, 2) with the column split is 3.3e-3 off Planck at omega_min and 4.4e-2 at 2 omega_min, so the deficit at omega_min falls 3.3e-3, 2.6e-5, 4.4e-7, 2.1e-7 for N = 13, 17, 21, 25, the exponential in N a seam predicts; the third square adds an anharmonic k = 2 pi / 3 level (virial 1.04). (2) B4's 8 omega_min clause asked the wrong regime: there every mode's Planck occupation (about 7.5) is past what these columns hold, and the energy is set by how many levels each split packs below the seam and where, not by the balance. BULK: at 2 omega_min the expected number of link columns at their last trit is 5.4e-3, 1.3e-3, 1.9e-4 with the column split against 4.3e-2, 2.3e-2, 1.3e-2 with the control (8 to 69 times fewer), the square columns about alike (1.8e-3 against 1.9e-3 at N = 17): the control overfills its link columns, as (4) derived. PER MODE: at N = 25 the k = 0 quantum puts 10.15 in the rails, 0 in the rungs and 3.25 in the squares, the k = pi quantum 6.12, 12.24 and 5.88; the link-to-square ratio is f / s in both (virial 1.0000000), but the share among link kinds is the mode's geometry (a k = pi rung fills four times a rail): the average link balances every mode, the fullest link kind does not, and no split can change that. KEY: the balance is a property of the column pair (virial, exact in the harmonic reading, confirmed to 2e-8), so one integer split serves every mode; the split per mode that E-FRC-0232 asked for is not needed. The shortfall that remains is the column's depth (N), not the split.",
    })
  },
})
