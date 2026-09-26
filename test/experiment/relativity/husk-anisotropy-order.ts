// The order in k at which the committed and combined knits' husk transport anisotropy falls, from their
// exact linear lattice Boltzmann equations (E-RLT-0059).
//
// THE QUESTION. If a knit's husk anisotropy starts at relative order k^4 or higher it vanishes at long
// wavelength like a lattice artifact, and the CPT-isotropy fork (E-RLT-0048 to 0050) is a statement about
// the lattice scale. If it starts at k^2, or at k^0 (the leading tensor itself anisotropic), the fork
// stands physically. E-RLT-0058 predicts k^0 for both knits, whose groups are {I, -I}.
//
// THE METHOD. Each knit's dock collision is a product of layers of disjoint slot blocks (the committed
// turning weave: one layer of couples; the combined knit: scatter set, base, scatter set, code/rule/
// combined-knit-layers). Its linearized collision at the uniform background (each slot fear, calm, love
// with chance 1/3, invariant under every bijection) is then an exact count over the blocks
// (code/measure/exact-linear-collision), with no draws. The 24 matrices and the stream give the period map
// M(k) of the linear lattice Boltzmann equation, whose eigenvalues near 1 are the hydrodynamic modes
// (code/measure/husk-transport-order). Each is named by where its eigenvector sits among the schedule's
// exact invariants. Quantities, per direction k-hat and |k|:
// - the charge mode's decay rate over k^2 (the charge diffusion D, the lone-vibe transport of the charge)
// - the momentum sector (every other slow mode): the sum of Gamma / k^2 (the trace, a basis-free scalar),
//   the smallest Gamma / k^2, and the Gamma / k^2 of the modes named husk shear (momentum across k in the
//   husk), pooled over directions
// - the modes that do not decay (Gamma / k^2 under 1e-4, the eigenvalue rounding at the shortest k lying
//   far below it and every decaying mode far above): their speed omega / k (ballistic), and how many
//   directions carry one that does not move either (frozen, an exact slab invariant); these are kept out
//   of the momentum sector
// Sound: a propagating hydrodynamic pair needs a conserved count or energy; neither knit keeps one
// (E-FLD-0027), which the invariant count checks.
// The ANISOTROPY at one |k| is (max - min) / mean over the direction set (husk: 3 axes, 6 face diagonals, 4
// body diagonals and 24 golden-spiral directions, all with k4 = 0; bulk: 24 lattice directions and 24 Weyl
// points on the 3-sphere). The husk reading is the physics; the bulk is the substrate, beside it.
//
// THE WAVELENGTHS, by a rule fixed here: k_c = sqrt(Gamma_gap / D_max), Gamma_gap the decay rate of the
// slowest non-conserved mode at k = 0 and D_max the largest slow Gamma / k^2 over the husk axes at
// k = 1e-4; the ladder is k_c / 4, k_c / 8, ..., k_c / 256 (seven wavelengths), where every conserved mode
// decays at most a sixteenth as fast as the slowest non-conserved one. The exponent is the log-log slope of
// the anisotropy against |k| over the five longest of them (k_c / 4 to k_c / 64), with its least-squares
// standard error; the slope between the two shortest is reported as the k -> 0 check.
//
// CONTROLS on the same matrices: the combined knit's A_t averaged over W(F4) (every slot permutation of the
// 1,152) and over the husk's cubic group (the 48 fixing the depth), each a linear equation with exactly
// that symmetry. E-RLT-0058 predicts their husk charge-diffusion anisotropy at k^4 and k^2.
//
// Gates, fixed before the first run:
//  X1 exactness: on all 24 phases of both knits the composed layers equal the knit's own dock collision on
//     4,000 dense and 4,000 sparse Weyl dock states (0 mismatches); the block count equals brute force on
//     an 8-slot three-layer toy to 1e-14; every A_t keeps charge (and, for the combined knit, P and the
//     line sum) to 1e-12; M(0) has exactly as many eigenvalues of modulus 1 (to 1e-12) as there are exact
//     invariants
//  X2 the controls: W(F4)-averaged husk charge-diffusion and momentum-trace exponents 4 +- 0.5;
//     cubic-averaged husk charge-diffusion exponent 2 +- 0.5
//  X3 every knit exponent resolved: standard error under 0.3
// HYPOTHESIS H (the fork closes physically): every husk exponent of both knits is at least 3.
// Verdict: pass if X1, X2, X3 and H hold; fail if X1, X2, X3 hold and H does not (the fork stands);
// partial otherwise.
//
// DETERMINISM: exact counts, Weyl-sequence test states and golden-spiral directions; no random numbers.
// Depth L2: an exact linearization of each knit and its exact linear spectrum. The linear lattice
// Boltzmann equation assumes molecular chaos (E-FLD-0030, 0031 found it predicts the scatter weave's
// transport to about 1 percent; E-SCL-0017 found a 4 percent recollision correction at the block scale),
// so its magnitudes are the equation's; its symmetry, and so the exponent, is the knit's.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { composeMismatches, exactLinearization, jointToTarget, layerOf, symmetrize, type Layer, type SlotBlock } from '@/code/measure/exact-linear-collision'
import {
  bulkDirections,
  CHARGE,
  familiesFor,
  huskDirections,
  invariantBasis,
  logSlope,
  momentumAlong,
  orthonormalize,
  slowModesAt,
  spanInside,
  spread,
} from '@/code/measure/husk-transport-order'
import { periodMap, LINE_SUM_VECTOR } from '@/code/coarse/knit-boltzmann'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { combinedFactors } from '@/code/rule/combined-knit-layers'
import { knitForward } from '@/code/compute/knit-reference'
import { meshOpposites } from '@/code/tool/mesh'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { weyl, weylPermutation } from '@/code/tool/weyl'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'

const ROOTS = rootsD4()
const PERIOD = 24
const LADDER = [4, 8, 16, 32, 64, 128, 256]
const FIT = 5

// the 8-slot toy for the brute-force check
function toyCheck(): number {
  const blocks = [
    [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
    ],
    [
      [0, 1, 4, 5],
      [2, 3, 6, 7],
    ],
    [
      [0, 2, 4, 6],
      [1, 3, 5, 7],
    ],
  ]
  let start = 11
  const toy: Layer[] = blocks.map(layer => layer.map(slots => ({ slots, map: Int32Array.from(weylPermutation({ size: 81, start: start++ })) }) as SlotBlock))
  const degree = 8
  let worst = 0

  for (let d = 0; d < degree; d++) {
    for (const target of toy[2]!) {
      const joints = jointToTarget({ layers: toy, d, target })
      const counts = new Map<number, Float64Array>(target.slots.map(e => [e, new Float64Array(9)]))

      for (let x = 0; x < 3 ** degree; x++) {
        const s = Int8Array.from({ length: degree }, (_, i) => (Math.floor(x / 3 ** i) % 3) - 1)
        const a = (s[d] ?? 0) + 1

        for (const layer of toy) {
          for (const b of layer) {
            let local = 0

            for (let k = b.slots.length - 1; k >= 0; k--) local = local * 3 + ((s[b.slots[k]!] ?? 0) + 1)

            let image = b.map[local]!

            for (let k = 0; k < b.slots.length; k++) {
              s[b.slots[k]!] = (image % 3) - 1
              image = Math.floor(image / 3)
            }
          }
        }

        for (const e of target.slots) {
          const c = counts.get(e)!

          c[a * 3 + (s[e]! + 1)] = c[a * 3 + (s[e]! + 1)]! + 1 / 3 ** degree
        }
      }

      for (const e of target.slots) {
        const j = joints.get(e)!
        const c = counts.get(e)!

        for (let i = 0; i < 9; i++) worst = Math.max(worst, Math.abs(j[i]! - c[i]!))
      }
    }
  }

  return worst
}

type Built = { matrices: Float64Array[]; mismatches: number }

function buildKnit(name: 'committed' | 'combined'): Built {
  const opposite = meshOpposites(d4BoxMesh({ side: 3 }))
  const forward = knitForward(name)
  const dense = Array.from({ length: 4000 }, (_, n) =>
    Int8Array.from({ length: 24 }, (_, d) => {
      const u = weyl(n * 24 + d + 1, Math.SQRT2 - 1)

      return u < 1 / 3 ? -1 : u < 2 / 3 ? 0 : 1
    }),
  )
  const sparse = Array.from({ length: 4000 }, (_, n) =>
    Int8Array.from({ length: 24 }, (_, d) => {
      const u = weyl(n * 24 + d + 1, Math.sqrt(3) - 1)

      return u < 0.1 ? -1 : u < 0.8 ? 0 : 1
    }),
  )
  let mismatches = 0
  const matrices = Array.from({ length: PERIOD }, (_, t) => {
    const factors = name === 'committed' ? [forward(t)] : combinedFactors({ t, opposite })
    const layers = factors.map(collision => layerOf({ collision, degree: 24 }))

    mismatches += composeMismatches({ layers, collision: forward(t), states: dense }) + composeMismatches({ layers, collision: forward(t), states: sparse })

    return exactLinearization({ layers, degree: 24 })
  })

  return { matrices, mismatches }
}

// the largest change l A - l of a left vector over the matrices
function defect(matrices: readonly Float64Array[], left: Float64Array): number {
  let worst = 0

  for (const a of matrices) {
    for (let c = 0; c < 48; c++) {
      let s = 0

      for (let r = 0; r < 48; r++) s += (left[r] ?? 0) * (a[r * 48 + c] ?? 0)

      worst = Math.max(worst, Math.abs(s - (left[c] ?? 0)))
    }
  }

  return worst
}

type Reading = {
  // the anisotropy of each quantity at each rung of the ladder
  readonly series: Record<string, number[]>
  readonly ks: number[]
  // representative values at the longest rung: quantity on the three husk axes (or first three directions)
  readonly axes: Record<string, number[]>
  // at each rung, how many directions carry a mode that neither decays nor moves (an exact slab invariant)
  readonly frozen: number[]
  readonly directions: number
}

const ZERO_RATE = 1e-4

type Spectrum = { invariants: number; unitEigenvalues: number; gap: number; kc: number }

function spectrumOf(matrices: readonly Float64Array[], invariants: readonly Float64Array[]): Spectrum {
  const m0 = periodMap({ matrices, wave: [0, 0, 0, 0] })
  const ev = complexEigenvalues({ re: m0.re, im: m0.im, n: 48 })
  const moduli = ev.re.map((r, i) => Math.hypot(r, ev.im[i] ?? 0)).sort((a, b) => b - a)
  const unit = moduli.filter(x => Math.abs(x - 1) < 1e-12).length
  const next = moduli[invariants.length] ?? 0
  const gap = -Math.log(next) / PERIOD
  const probe = 1e-4
  let dMax = 0

  for (const u of [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
  ]) {
    const modes = slowModesAt({ matrices, wave: u.map(x => x * probe), count: invariants.length, families: familiesFor({ u, invariants, husk: true }) })

    for (const m of modes) dMax = Math.max(dMax, m.gamma / probe / probe)
  }

  return { invariants: invariants.length, unitEigenvalues: unit, gap, kc: Math.sqrt(gap / dMax) }
}

function readAnisotropy(input: { matrices: readonly Float64Array[]; invariants: readonly Float64Array[]; kc: number; husk: boolean }): Reading {
  const { matrices, invariants, kc, husk } = input
  const directions = husk ? huskDirections(24) : bulkDirections(24)
  const ks = LADDER.map(r => kc / r)
  const series: Record<string, number[]> = { charge: [], trace: [], slowest: [], shear: [], ballistic: [] }
  const axes: Record<string, number[]> = { charge: [], trace: [], slowest: [] }
  const frozen: number[] = []

  ks.forEach((k, rung) => {
    const values: Record<string, number[]> = { charge: [], trace: [], slowest: [], shear: [], ballistic: [] }

    directions.forEach((u, index) => {
      const modes = slowModesAt({ matrices, wave: u.map(x => x * k), count: invariants.length, families: familiesFor({ u, invariants, husk }) })
      const chargeMode = modes.reduce((best, m) => (m.family === 'charge' && m.share > (best?.share ?? -1) ? m : best), undefined as (typeof modes)[number] | undefined)
      const rest = modes.filter(m => m !== chargeMode)
      // a mode that does not decay (Gamma / k^2 under 1e-4, far below every decaying one and above the
      // eigenvalue rounding at the shortest k) is ballistic, or frozen when it does not move either
      const decaying = rest.filter(m => m.gamma / (k * k) > ZERO_RATE)
      const ballistic = rest.filter(m => m.gamma / (k * k) <= ZERO_RATE)

      frozen[rung] = (frozen[rung] ?? 0) + (ballistic.some(m => m.omega / k < 1e-3) ? 1 : 0)

      if (chargeMode) values.charge!.push(chargeMode.gamma / (k * k))

      if (decaying.length > 0) {
        values.trace!.push(decaying.reduce((s, m) => s + m.gamma / (k * k), 0))
        values.slowest!.push(Math.min(...decaying.map(m => m.gamma / (k * k))))
      }

      for (const m of decaying) if (m.family === 'shear') values.shear!.push(m.gamma / (k * k))
      for (const m of ballistic) values.ballistic!.push(m.omega / k)

      if (rung === 0 && index < 3) {
        if (chargeMode) axes.charge!.push(chargeMode.gamma / (k * k))
        if (decaying.length > 0) {
          axes.trace!.push(decaying.reduce((s, m) => s + m.gamma / (k * k), 0))
          axes.slowest!.push(Math.min(...decaying.map(m => m.gamma / (k * k))))
        }
      }
    })

    for (const name of Object.keys(series)) {
      const v = values[name] ?? []

      series[name]!.push(v.length > 1 && v.some(x => x !== 0) ? spread(v) : Number.NaN)
    }
  })

  return { series, ks, axes, frozen, directions: directions.length }
}

function exponents(reading: Reading): Record<string, { slope: number; error: number; tail: number; atShortest: number }> {
  const out: Record<string, { slope: number; error: number; tail: number; atShortest: number }> = {}

  for (const [name, ys] of Object.entries(reading.series)) {
    if (ys.some(y => !Number.isFinite(y))) continue

    const fit = logSlope(reading.ks.slice(0, FIT), ys.slice(0, FIT))
    const n = ys.length
    const tail = Math.log((ys[n - 2] ?? 1) / (ys[n - 1] ?? 1)) / Math.log((reading.ks[n - 2] ?? 1) / (reading.ks[n - 1] ?? 1))

    out[name] = { slope: fit.slope, error: fit.error, tail, atShortest: ys[n - 1] ?? Number.NaN }
  }

  return out
}

export default experiment({
  id: 'relativity/husk-anisotropy-order',
  code: 'E-RLT-0059',
  title:
    'the husk anisotropy of the committed and combined knits does not fall with wavelength: from their exact linear lattice Boltzmann equations (the linearized collision counted exactly over the layers, 0 mismatches against the knits), the husk anisotropy of the charge diffusion, the momentum sector and the husk shear has exponent 0.00 to 0.01 (+- 0.00) over k_c / 4 to k_c / 64, holding at 1.84 (committed charge, D 11.9, 19.1, 0.27 on the husk axes) and 1.05 to 3.09 (combined), with an exact slab mode frozen along one husk axis, while the same matrices averaged over W(F4) give exponents 3.99 (charge) and 4.05 (trace) but 1.99 (shear) and over the husk cubic group 1.99 (charge) and 0.01 (shear): the fork stands physically, at leading order',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const toy = toyCheck()
    const committed = buildKnit('committed')
    const combined = buildKnit('combined')

    // the W(F4) and husk-cubic averages of the combined knit's matrices
    const perms = weylF4DirectionPermutations({ directions: ROOTS })
    const fixesDepth = (p: readonly number[]): boolean =>
      ROOTS.every((r, d) => {
        const image = ROOTS[p[d] ?? d] ?? r
        // the linear map fixes e4 exactly when every root's fourth entry is kept
        return (image[3] ?? 0) === (r[3] ?? 0)
      })
    const cubicPerms = perms.filter(fixesDepth)
    const wf4Matrices = combined.matrices.map(a => symmetrize(a, perms))
    const cubicMatrices = combined.matrices.map(a => symmetrize(a, cubicPerms))

    const sets = {
      committed: committed.matrices,
      combined: combined.matrices,
      wf4Averaged: wf4Matrices,
      cubicAveraged: cubicMatrices,
    }
    const metrics: Record<string, number> = { toyWorst: toy, committedMismatches: committed.mismatches, combinedMismatches: combined.mismatches, cubicGroupOrder: cubicPerms.length }
    const results: Record<string, Record<string, Record<string, { slope: number; error: number; tail: number; atShortest: number }>>> = {}
    let exact = toy < 1e-14 && committed.mismatches === 0 && combined.mismatches === 0

    for (const [name, matrices] of Object.entries(sets)) {
      const invariants = invariantBasis(matrices)
      const spectrum = spectrumOf(matrices, invariants)

      metrics[`${name}Invariants`] = spectrum.invariants
      metrics[`${name}UnitEigenvalues`] = spectrum.unitEigenvalues
      metrics[`${name}Gap`] = spectrum.gap
      metrics[`${name}Kc`] = spectrum.kc
      metrics[`${name}ChargeDefect`] = defect(matrices, CHARGE)
      metrics[`${name}MomentumKept`] = spanInside(orthonormalize([0, 1, 2, 3].map(i => momentumAlong([0, 1, 2, 3].map(k => (k === i ? 1 : 0))))), invariants)
      metrics[`${name}LineSumKept`] = spanInside(orthonormalize([LINE_SUM_VECTOR]), invariants)

      if (name === 'committed' || name === 'combined') {
        exact = exact && spectrum.unitEigenvalues === spectrum.invariants && (metrics[`${name}ChargeDefect`] ?? 1) < 1e-12
      }

      if (name === 'combined') {
        exact =
          exact &&
          [0, 1, 2, 3].every(i => defect(matrices, momentumAlong([0, 1, 2, 3].map(k => (k === i ? 1 : 0)))) < 1e-12) &&
          defect(matrices, LINE_SUM_VECTOR) < 1e-12
      }

      results[name] = {}

      for (const husk of [true, false]) {
        const region = husk ? 'husk' : 'bulk'
        const reading = readAnisotropy({ matrices, invariants, kc: spectrum.kc, husk })
        const fits = exponents(reading)

        results[name]![region] = fits

        for (const [q, f] of Object.entries(fits)) {
          metrics[`${name}_${region}_${q}_exponent`] = Number(f.slope.toFixed(4))
          metrics[`${name}_${region}_${q}_error`] = Number(f.error.toFixed(4))
          metrics[`${name}_${region}_${q}_tailSlope`] = Number(f.tail.toFixed(4))
          metrics[`${name}_${region}_${q}_anisotropyAtShortestK`] = f.atShortest
        }

        reading.series.charge!.forEach((v, i) => {
          metrics[`${name}_${region}_charge_anisotropy_k${i}`] = v
        })
        metrics[`${name}_${region}_frozenDirectionsAtShortestK`] = reading.frozen[reading.frozen.length - 1] ?? 0
        metrics[`${name}_${region}_directions`] = reading.directions

        if (husk) {
          for (const [q, vs] of Object.entries(reading.axes)) {
            vs.forEach((v, i) => {
              metrics[`${name}_huskAxis${i}_${q}`] = v
            })
          }
        }
      }
    }

    const within = (x: number | undefined, target: number): boolean => x !== undefined && Math.abs(x - target) <= 0.5
    const controls =
      within(results.wf4Averaged?.husk?.charge?.slope, 4) && within(results.wf4Averaged?.husk?.trace?.slope, 4) && within(results.cubicAveraged?.husk?.charge?.slope, 2)
    const knitFits = ['committed', 'combined'].flatMap(n => Object.entries(results[n]?.husk ?? {}).map(([q, f]) => ({ knit: n, q, ...f })))
    const resolved = knitFits.every(f => f.error < 0.3) && ['committed', 'combined'].every(n => (results[n]?.husk?.charge?.slope ?? Number.NaN) === (results[n]?.husk?.charge?.slope ?? 0))
    const closes = knitFits.every(f => f.slope >= 3)

    metrics.seconds = (Date.now() - started) / 1000

    const status = exact && controls && resolved ? (closes ? 'pass' : 'fail') : 'partial'
    const huskList = knitFits.map(f => `${f.knit} ${f.q} ${f.slope.toFixed(2)} +- ${f.error.toFixed(2)}`).join(', ')

    return verdict({
      status,
      claim: `husk anisotropy exponents from the exact linear equation: ${huskList}; controls W(F4)-averaged charge ${results.wf4Averaged?.husk?.charge?.slope.toFixed(2)} and trace ${results.wf4Averaged?.husk?.trace?.slope.toFixed(2)}, cubic-averaged charge ${results.cubicAveraged?.husk?.charge?.slope.toFixed(2)}; the fork ${closes ? 'closes' : 'stands'} physically`,
      metrics,
      control: {
        wf4AveragedHuskChargeExponent: results.wf4Averaged?.husk?.charge?.slope ?? Number.NaN,
        wf4AveragedHuskTraceExponent: results.wf4Averaged?.husk?.trace?.slope ?? Number.NaN,
        cubicAveragedHuskChargeExponent: results.cubicAveraged?.husk?.charge?.slope ?? Number.NaN,
      },
      notes: `L2. Gates: X1 exact ${exact}, X2 controls ${controls}, X3 resolved ${resolved}, H closes ${closes}. First run recorded as is; nothing moved. The committed knit keeps 5 exact invariants: the charge and the love and fear densities of directions 0 and 1 (roots (1, 1, 0, 0) and (1, -1, 0, 0)), which its collision never touches (0 changes in 72,000 dock collisions), so those two directions stream freely and carry 4 undamped ballistic modes; it keeps no momentum, so it has no shear and no sound. The combined knit keeps charge, P and the line sum S (6), no count, so it has no sound either; its slab invariant S - P0 is a mode frozen at every k along husk axis x and nowhere else on the husk. Its charge diffusion is large (D 97 to 189 on the husk axes, lone vibes rarely scatter), so its hydrodynamic range lies below k_c = 0.0027. The W(F4)-averaged control shows what E-RLT-0058 found: W(F4) forces the husk scalars through k^4 (exponent 4) but not the shear's degree (2, 4), so even a W(F4) knit's shear anisotropy is k^2 unless its dynamics puts no weight there, as the photon's does. Magnitudes are the linear lattice Boltzmann equation's (molecular chaos at the uniform third-each background); the exponents follow from its symmetry, which is the knit's.`,
    })
  },
})
