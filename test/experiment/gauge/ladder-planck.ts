// Planck in a closed box of quantum light (E-FRC-0232): the plaquette ladder's own spectrum (code/rule/
// plaquette-ladder, kappa = 2 / (2D + 1) carried by the drift), every eigenstate of the beat on boxes of L = 2 and
// 3 squares by momentum sector.
//
// DERIVED before the first run.
//   (1) the integer ladder   In the harmonic reading the beat is metaplectic, so its eigenstates are the Fock
//                            states of the L normal modes and a level's energy above the vacuum is sum_k n_k omega_k
//                            with n_k = 0, 1, 2, ... and total momentum sum n_k k: an integer ladder of occupation.
//                            The measured one-quantum band (E-FRC-0231) fixes every omega_k, so every other level is
//                            a PREDICTION with no free number
//   (2) Planck               A ladder of equal rungs per mode at temperature T holds omega / (e^(omega/T) - 1) per
//                            mode: the box's thermal energy from its own levels is Planck's sum over its modes. The
//                            classical light on the same registers (the N^(2L) phase points, each at its classical
//                            energy) holds T per mode (Rayleigh-Jeans, E-SPN-0058's classical link field)
//   (3) the column's top     The ladder holds only while the levels fit inside the columns (E-FRC-0230): above
//                            about pi/4 of 2D + 1 quanta per mode the levels stop matching, so a high cut must find
//                            unmatched levels, and a hot box must fall below Planck
//   (4) the control          The classical light's own split (unit drift, c = N, r = 2) at the same kappa holds
//                            about sqrt N rungs per column (E-FRC-0230): its levels must fail to match
//
// Gates, fixed before the first run (probes before this file, disclosed in the notes):
// P1 the integer ladder: on the boxes (N, L) = (17, 2), (21, 2), (25, 2), (13, 3), every level below the cut
//    3 omega_max matches a distinct occupation vector (n_k) of the same momentum with |E - sum n_k omega_k| <= 1e-2
//    (omega_k the measured band), and the number of levels below the cut equals the number of occupation vectors
//    below it (none missing, none extra)
// P2 Planck, not Rayleigh-Jeans: on the same boxes, at T / omega_min = 1/4, 1/2, 1, 2 the thermal energy of all the
//    box's levels is within 1e-3 of sum_k omega_k / (e^(omega_k/T) - 1), and at T = omega_min / 4 it is below
//    0.1 L T
// P3 the classical reading (the control that must give Rayleigh-Jeans): the N^4 phase points of the L = 2 boxes,
//    each at its classical energy (pi / N) sum_k (omega_k / sin omega_k) Q_k, hold between 0.9 L T and 1.1 L T at
//    T = omega_min / 4 and omega_min / 2
// P4 the classical split (the control that must fail the ladder): on (13, 2) at least one level below the cut
//    fails to match
// Reported: the hot box (T = 4 and 8 omega_min) against Planck; the band's error against the classical symbol.
// Status: pass if P1 to P4 pass; fail otherwise.
//
// Depth L2: the metaplectic (Gaussian) quantization of the model's classical light in the model's column
// registers; the integer ladder is the point, Planck follows from it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { inverseDepthSpec, splitOf, type LadderSpec } from '@/code/rule/plaquette-ladder'
import { oneQuantumBand, planck, thermalEnergy, unwrapped } from '@/code/measure/quantum-ladder'

const BOXES: readonly [number, number][] = [
  [17, 2],
  [21, 2],
  [25, 2],
  [13, 3],
]
const CONTROL: readonly [number, number] = [13, 2]
const T_OVER_OMEGA = [1 / 4, 1 / 2, 1, 2]
const HOT = [4, 8]
const MATCH = 1e-2

type Occupation = { energy: number; q: number }

function occupations(L: number, omegas: readonly number[], cut: number): Occupation[] {
  const out: Occupation[] = []
  const n = new Array<number>(L).fill(0)
  const walk = (j: number, e: number): void => {
    if (e > cut) return

    if (j === L) {
      out.push({ energy: e, q: n.reduce((s, x, i) => s + x * i, 0) % L })

      return
    }

    for (let c = 0; e + c * omegas[j]! <= cut; c++) {
      n[j] = c
      walk(j + 1, e + c * omegas[j]!)
    }

    n[j] = 0
  }

  walk(0, 0)

  return out
}

// the ladder reading of a box: its levels below the cut against the occupation vectors of its measured band
function ladderOf(spec: LadderSpec): {
  omegas: number[]
  energies: number[]
  found: number
  expected: number
  unmatched: number
  worst: number
  bandError: number
} {
  const L = spec.plaquettes
  const { band, levels } = oneQuantumBand(spec)
  const { energies } = unwrapped(levels)
  const omegas = band.map(b => b.omega)
  const cut = 3 * Math.max(...omegas)
  // a margin keeps a level sitting exactly on the cut from being counted on one side only
  const margin = 0.05
  const predicted = occupations(L, omegas, cut + margin)
  const used = new Set<number>()
  let unmatched = 0
  let worst = 0
  const below = levels.map((l, i) => ({ e: energies[i]!, q: l.q })).filter(x => x.e < cut)

  for (const lv of below) {
    let best = -1
    let bestD = Infinity

    predicted.forEach((p, j) => {
      if (p.q !== lv.q || used.has(j)) return

      const d = Math.abs(p.energy - lv.e)

      if (d < bestD) {
        bestD = d
        best = j
      }
    })

    if (best < 0 || bestD > MATCH) unmatched++
    else {
      used.add(best)
      worst = Math.max(worst, bestD)
    }
  }

  return {
    omegas,
    energies,
    found: below.length,
    expected: predicted.filter(p => p.energy < cut).length,
    unmatched,
    worst,
    bandError: Math.max(...band.map(b => Math.abs(b.omega - b.classical) / b.classical)),
  }
}

// the classical reading of an L = 2 box: the N^4 points (B_a, B_b, m_a, m_b) at their classical energy
function classicalEnergyOverLT(spec: LadderSpec, T: number): number {
  const n = spec.n
  const { s, f, kappa } = splitOf(spec)
  const D = (n - 1) / 2
  const modes = [0, Math.PI].map(k => {
    const K = 4 - 2 * Math.cos(k)
    const omega = Math.acos(1 - (kappa * K) / 2)

    return { K, weight: omega / Math.sin(omega) }
  })
  let z = 0
  let e = 0

  for (let Ba = -D; Ba <= D; Ba++) {
    for (let Bb = -D; Bb <= D; Bb++) {
      for (let ma = -D; ma <= D; ma++) {
        for (let mb = -D; mb <= D; mb++) {
          // k = 0: (a + b)/sqrt 2, k = pi: (a - b)/sqrt 2
          let energy = 0

          ;[
            [(Ba + Bb) / Math.SQRT2, (ma + mb) / Math.SQRT2],
            [(Ba - Bb) / Math.SQRT2, (ma - mb) / Math.SQRT2],
          ].forEach(([B, m], j) => {
            const { K, weight } = modes[j]!

            energy += weight * (f * B! * B! + f * s * K * B! * m! + s * K * m! * m!)
          })

          energy *= Math.PI / n

          const w = Math.exp(-energy / T)

          z += w
          e += w * energy
        }
      }
    }
  }

  return e / z / (2 * T)
}

export default experiment({
  id: 'gauge/ladder-planck',
  code: 'E-FRC-0232',
  title:
    "Planck in a closed box of quantum light: every level of the plaquette ladder's beat on boxes of two and three squares is a sum of whole quanta of its measured band (an integer ladder of occupation, none missing, none extra), so the box's thermal energy is Planck's, while the same registers read as classical points hold Rayleigh-Jeans' T per mode and the classical light's own split breaks the ladder",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let p1 = true
    let p2 = true
    let p3 = true

    for (const [n, L] of BOXES) {
      const spec = inverseDepthSpec(n, L, 'drift')
      const box = ladderOf(spec)
      const tag = `N${n}L${L}`
      const wmin = Math.min(...box.omegas)

      metrics[`levels${tag}`] = box.found
      metrics[`occupations${tag}`] = box.expected
      metrics[`unmatched${tag}`] = box.unmatched
      metrics[`worstMatch${tag}`] = box.worst
      metrics[`bandError${tag}`] = box.bandError
      p1 &&= box.unmatched === 0 && box.found === box.expected

      for (const x of T_OVER_OMEGA) {
        const T = x * wmin
        const e = thermalEnergy(box.energies, T)
        const p = box.omegas.reduce((acc, w) => acc + planck(w, T), 0)

        metrics[`planckRatio${tag}T${x}`] = e / p
        metrics[`energyOverLT${tag}T${x}`] = e / (L * T)
        p2 &&= Math.abs(e / p - 1) <= 1e-3
      }

      p2 &&= metrics[`energyOverLT${tag}T0.25`]! < 0.1

      for (const x of HOT) {
        const T = x * wmin

        metrics[`hotPlanckRatio${tag}T${x}`] = thermalEnergy(box.energies, T) / box.omegas.reduce((acc, w) => acc + planck(w, T), 0)
      }

      if (L === 2) {
        for (const x of [1 / 4, 1 / 2]) {
          const r = classicalEnergyOverLT(spec, x * wmin)

          metrics[`classicalOverLT${tag}T${x}`] = r
          p3 &&= r >= 0.9 && r <= 1.1
        }
      }
    }

    const control = ladderOf(inverseDepthSpec(CONTROL[0], CONTROL[1], 'force'))

    metrics.controlUnmatched = control.unmatched
    metrics.controlLevels = control.found
    metrics.controlOccupations = control.expected

    const p4 = control.unmatched > 0
    const gates = { P1: p1, P2: p2, P3: p3, P4: p4 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : 'fail'

    return verdict({
      status,
      claim: `every level of the plaquette ladder's beat below three top quanta is a sum of whole quanta of its measured band: ${BOXES.map(([n, L]) => `${metrics[`levels${`N${n}L${L}`}`]} levels for ${metrics[`occupations${`N${n}L${L}`}`]} occupation vectors, ${metrics[`unmatched${`N${n}L${L}`}`]} unmatched (N = ${n}, L = ${L})`).join('; ')}; the box's thermal energy is Planck's to ${Math.max(...BOXES.flatMap(([n, L]) => T_OVER_OMEGA.map(x => Math.abs(metrics[`planckRatioN${n}L${L}T${x}`]! - 1)))).toExponential(1)} (${metrics['energyOverLTN25L2T0.25']!.toFixed(4)} L T at T = omega_min/4), while the same registers read as classical points hold ${metrics['classicalOverLTN25L2T0.25']!.toFixed(3)} L T; the classical split leaves ${control.unmatched} of ${control.found} levels unmatched`,
      metrics,
      control: {
        classicalOverLT: metrics['classicalOverLTN25L2T0.25']!,
        controlUnmatched: control.unmatched,
      },
      notes:
        "L2. FIRST RUN 2026-09-26 (tmp/frc0232.log, 28 s), FAIL on P1 and P2; P3 and P4 pass. No gate moved. P1: on the L = 2 boxes every level below the cut matches a distinct occupation vector (worst 7.3e-4, 2.5e-3, 4.6e-4 at N = 17, 21, 25), but N = 21 and 25 count 13 levels against 12 vectors. DIAGNOSED AFTER THE RUN (tmp/qlad-probe10.ts): the cut 3 omega_max is itself an occupation energy (three quanta of the top mode), whose level sits 2e-3 and 4e-4 BELOW it through the anharmonic shift, so it was counted as found while its vector was counted above the cut: a flaw in the gate's cut, not a missing or extra level. Read level by level, N = 25 is 0, 0.40272, 0.70748, 0.80543, 1.11019, 1.20815, 1.41490, 1.51292, 1.61086, 1.81765, 1.91559, 2.01355, 2.12198, the sums of 0.40272 and 0.70748 to 4e-4. On (13, 3) 19 levels against 22 vectors with 1 unmatched: the three-quanta level of the top mode sits at 2.7010 against 2.7225 (0.8 percent low), a real anharmonic shift, and the rest is the same cut effect. P2: Planck holds to 3e-6 and 5e-4 at T = omega_min/4 and omega_min/2 on every box (0.040 L T and 0.21 L T against Rayleigh-Jeans' L T), but falls short at omega_min and 2 omega_min (0.985 to 0.995 and 0.91 to 0.96 on L = 2, 0.91 and 0.76 on (13, 3)). This is the column's top of derivation (3), which the gate contradicted: with c = 2, r = N the split balances at K = N/2 only, so the k = 0 mode (K = 2) holds about (pi N / 4) sin(omega) / f = 7.7 rungs at N = 25 (13 for k = pi), and at T = 2 omega_min the truncation weighs a few percent; hot boxes read 0.75 to 0.85 of Planck. So the drift-carrier split is NOT balanced for every mode: a balanced ladder for all k needs the split per mode, which one pair (c, r) cannot give. P3: the same registers read as classical points hold 0.985 to 0.995 L T at omega_min/4 and 1.000 L T at omega_min/2 (Rayleigh-Jeans). P4: the classical split leaves 7 of 10 levels unmatched. The invariant energy (the unwrapping reference) reads the L = 2 levels to 1e-3 but misreads (13, 3) by 0.1 to 0.3 at one to two quanta; the turn choice was still right there because every error is below pi.",
    })
  },
})
