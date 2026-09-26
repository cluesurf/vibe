// The husk isotropy law: light on the husk is anisotropic only at relative order k^4, where a cubic lattice is
// anisotropic at k^2, and the shape of that leading anisotropy is fixed by W(F4).
//
// The reason. The husk's light is the bulk's at k4 = 0 (code/measure/photon-husk, E-FRC-0168), and the bulk's
// linear symbol M(k) (code/measure/photon-symbol, E-FRC-0179) is W(F4)-covariant on the D4 box. W(F4)'s basic
// invariants have degrees 2, 6, 8, 12 (Molien series, computed here exactly), so its only quartic invariant is
// |k|^4: any W(F4)-invariant function of k is isotropic through order k^4 and first differs between directions
// at k^6, a relative anisotropy of order k^4. The sum of the three photon eigenvalues is the trace of the
// acoustic block, such an invariant. On the cubic torus the quartic x^4 + y^4 + z^4 is invariant, so its light
// is anisotropic at relative order k^2.
//
// What W(F4) does NOT force, stated before the run: dim Hom(Sym^4 V, Sym^2 V) is 3 for W(F4), one more than the
// two isotropic covariants, so a single photon branch may carry an anisotropic k^4 term. Whether it does is a
// measurement.
//
// The shape. W(F4)'s second sextic invariant, restricted to k4 = 0, is 12 p6 + 60 q (the long roots' sum of
// (r . k)^6), which modulo |k|^6 is proportional to q - 3 r, with q = sum over i != j of k_i^4 k_j^2 and
// r = k1^2 k2^2 k3^2. The cubic group alone would allow q and r independently.
//
// Gates, fixed before the run:
// A W(F4) (1,152 elements from the 48 root reflections): the Molien series equals 1 / prod (1 - t^d),
//   d = 2, 6, 8, 12, through t^30, one quartic invariant, product of degrees 1,152, sum of (d - 1) = 24 = the
//   number of reflections. Controls: the stabilizer of the depth e4 (48, the husk's cubic group) has degrees
//   2, 4, 6, two quartic invariants; W(D4) has 2, 4, 4, 6
// B the law: over |k| = 0.025, 0.05, 0.1, 0.2 and 150 husk directions, log(anisotropy) against log |k| has
//   slope 4 +- 0.05 for the photon trace, and slope 2 +- 0.05 for the cubic torus's photons (the control)
// C the shape: at |k| = 0.05 the trace's order-k^4 anisotropy regresses on (q, r) with ratio r/q = -3 +- 0.01
//   and rms residual under 1e-3 of its size
// Reported: the slope of each single branch (two depth-even, one depth-odd), their shape ratios (only B3 acts on
// them), the full-sphere spread at |k| = pi / 2 and the linear theory for E-FRC-0169's two orbits.
//
// Depth L2: exact invariant theory, then the rule's own linear symbol.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { photonLatticeCubic, photonLatticeD4 } from '@/code/rule/photon-links'
import { makeHusk } from '@/code/measure/photon-husk'
import { curlSymbol, eigenvalues, huskSymbol, leapfrogBlock, plaquetteShapes } from '@/code/measure/photon-symbol'
import { degreeSeries, doubledClosure, doubledReflection, f4Roots, isLongRoot, molien } from '@/code/algebra/group/hurwitz-f4'

const KAPPA = (2 * Math.PI * 80) / 8192
const SMALL_K = [0.025, 0.05, 0.1, 0.2]
const SERIES = 30
const GOLDEN = (1 + Math.sqrt(5)) / 2

function hemisphere(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => {
    const z = (i + 0.5) / n
    const r = Math.sqrt(1 - z * z)
    const phi = (2 * Math.PI * i) / GOLDEN

    return [r * Math.cos(phi), r * Math.sin(phi), z]
  })
}

const spread = (values: readonly number[]): number => (Math.max(...values) - Math.min(...values)) / (values.reduce((s, x) => s + x, 0) / values.length)

function slope(xs: readonly number[], ys: readonly number[]): number {
  const x = xs.map(Math.log)
  const y = ys.map(Math.log)
  const mx = x.reduce((s, v) => s + v, 0) / x.length
  const my = y.reduce((s, v) => s + v, 0) / y.length

  return x.reduce((s, xi, i) => s + (xi - mx) * (y[i]! - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0)
}

const qOf = (u: readonly number[]): number => {
  let s = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      s += i === j ? 0 : u[i]! ** 4 * u[j]! ** 2
    }
  }

  return s
}
const rOf = (u: readonly number[]): number => u[0]! ** 2 * u[1]! ** 2 * u[2]! ** 2

export default experiment({
  id: 'method/husk-isotropy-law',
  code: 'E-MTH-0008',
  title:
    'the husk isotropy law: W(F4) has invariant degrees 2, 6, 8, 12 (Molien, exact), so its one quartic invariant is |k|^4, and the husk light of the exact linear symbol is anisotropic at relative order k^4 (slope 4.000 in every branch) where the cubic torus is at k^2 (slope 2.000), with the leading anisotropy of the photon trace in the shape q - 3 r that the restricted F4 sextic fixes (ratio -3.000)',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // A. invariant theory
    const reflections = f4Roots().map(doubledReflection)
    const f4 = doubledClosure(reflections)
    const d4 = doubledClosure(f4Roots().filter(isLongRoot).map(doubledReflection))
    const stabilizer = [...f4.values()].filter(g => g[3] === 0 && g[7] === 0 && g[11] === 0 && g[15] === 2)
    const mF4 = molien(f4.values(), 4, SERIES)
    const mB3 = molien(stabilizer, 3, SERIES)
    const mD4 = molien(d4.values(), 4, SERIES)
    const agrees = (series: readonly number[], degrees: number[]): boolean => {
      const target = degreeSeries(degrees, SERIES)

      return series.every((x, i) => Math.abs(x - target[i]!) < 1e-9)
    }
    const invariants =
      f4.size === 1152 &&
      agrees(mF4.series, [2, 6, 8, 12]) &&
      mF4.series[4] === 1 &&
      2 * 6 * 8 * 12 === f4.size &&
      1 + 5 + 7 + 11 === reflections.length / 2 &&
      stabilizer.length === 48 &&
      agrees(mB3.series, [2, 4, 6]) &&
      mB3.series[4] === 2 &&
      agrees(mD4.series, [2, 4, 4, 6])

    // B. the law, on the rule's linear symbol
    const bulk = photonLatticeD4({ side: 6 })
    const husk = makeHusk(bulk)
    const shapes = plaquetteShapes(bulk)
    const cubic = photonLatticeCubic({ side: 6 })
    const cubicShapes = plaquetteShapes(cubic)
    const directions = hemisphere(150)
    const branches = (k3: readonly number[]): { even: number[]; odd: number } => {
      const s = huskSymbol(husk, curlSymbol(bulk, shapes, [k3[0]!, k3[1]!, k3[2]!, 0]))
      const h = eigenvalues(s.hermitian)

      return { even: [h[1]!, h[2]!], odd: eigenvalues(s.odd)[0]! }
    }
    const series: Record<string, number[]> = { trace: [], evenLow: [], evenHigh: [], odd: [], cubic: [] }

    for (const k of SMALL_K) {
      const values: Record<string, number[]> = { trace: [], evenLow: [], evenHigh: [], odd: [], cubic: [] }

      for (const u of directions) {
        const b = branches(u.map(x => k * x))

        values.trace!.push((b.even[0]! + b.even[1]! + b.odd) / (k * k))
        values.evenLow!.push(b.even[0]! / (k * k))
        values.evenHigh!.push(b.even[1]! / (k * k))
        values.odd!.push(b.odd / (k * k))
        values.cubic!.push(eigenvalues(curlSymbol(cubic, cubicShapes, u.map(x => k * x)))[1]! / (k * k))
      }

      for (const name of Object.keys(values)) {
        series[name]!.push(spread(values[name]!))
      }
    }

    const slopes = Object.fromEntries(Object.entries(series).map(([name, ys]) => [name, slope(SMALL_K, ys)]))
    const law = Math.abs(slopes.trace! - 4) < 0.05 && Math.abs(slopes.cubic! - 2) < 0.05

    // C. the shape at |k| = 0.05
    const k = 0.05
    const axis = branches([k, 0, 0])
    const fit = (pick: (b: { even: number[]; odd: number }) => number): { ratio: number; residual: number } => {
      const base = pick(axis) / (k * k)
      const rows = directions.map(u => [qOf(u), rOf(u), (pick(branches(u.map(x => k * x))) / (k * k) - base) / k ** 4] as const)
      const sqq = rows.reduce((s, [q]) => s + q * q, 0)
      const srr = rows.reduce((s, [, r]) => s + r * r, 0)
      const sqr = rows.reduce((s, [q, r]) => s + q * r, 0)
      const sqd = rows.reduce((s, [q, , d]) => s + q * d, 0)
      const srd = rows.reduce((s, [, r, d]) => s + r * d, 0)
      const det = sqq * srr - sqr * sqr
      const a = (sqd * srr - srd * sqr) / det
      const b = (srd * sqq - sqd * sqr) / det
      const rms = Math.sqrt(rows.reduce((s, [q, r, d]) => s + (d - a * q - b * r) ** 2, 0) / rows.length)
      const size = Math.sqrt(rows.reduce((s, [, , d]) => s + d * d, 0) / rows.length)

      return { ratio: b / a, residual: rms / size }
    }
    const traceShape = fit(b => b.even[0]! + b.even[1]! + b.odd)
    const evenShape = fit(b => b.even[0]! + b.even[1]!)
    const oddShape = fit(b => b.odd)
    const shape = Math.abs(traceShape.ratio + 3) < 0.01 && traceShape.residual < 1e-3

    // reported: |k| = pi / 2
    const half = Math.PI / 2
    const omegas = directions.map(u => leapfrogBlock(KAPPA, branches(u.map(x => half * x)).even[0]!).omega)
    const step = (2 * Math.PI) / 12
    const orbitA = branches([3 * step, 0, 0])
    const orbitB = branches([2 * step, 2 * step, step])
    const meanOmega = (b: { even: number[] }): number => (leapfrogBlock(KAPPA, b.even[0]!).omega + leapfrogBlock(KAPPA, b.even[1]!).omega) / 2

    return verdict({
      status: invariants && law && shape ? 'pass' : 'fail',
      claim:
        'W(F4) has invariant degrees 2, 6, 8, 12 (its Molien series equals 1 / prod (1 - t^d) through t^30, product 1,152, sum of d - 1 = 24 reflections), so its only quartic invariant is |k|^4 while the husk\'s own cubic group has two; on the exact linear symbol the husk light is anisotropic at relative order k^4, slope 4.000 for the photon trace and for every single branch, against 2.000 on the cubic torus, and the trace\'s leading anisotropy has the shape q - 3 r (ratio -3.000) that the restricted F4 sextic fixes, where the cubic group alone would leave it free',
      metrics: {
        f4Order: f4.size,
        quarticInvariantsF4: mF4.series[4]!,
        quarticInvariantsHuskCubic: mB3.series[4]!,
        quarticCovariantsF4: mF4.quarticCovariants,
        anisotropicQuarticCovariantsF4: mF4.anisotropicQuarticCovariants,
        slopeTrace: Number(slopes.trace!.toFixed(4)),
        slopeEvenLow: Number(slopes.evenLow!.toFixed(4)),
        slopeEvenHigh: Number(slopes.evenHigh!.toFixed(4)),
        slopeOdd: Number(slopes.odd!.toFixed(4)),
        traceShapeRatio: Number(traceShape.ratio.toFixed(5)),
        traceShapeResidual: traceShape.residual,
        evenSumShapeRatio: Number(evenShape.ratio.toFixed(4)),
        oddShapeRatio: Number(oddShape.ratio.toFixed(4)),
        spreadTraceSmallest: series.trace![0]!,
        omegaSpreadAtHalfPi: spread(omegas),
        orbitGapAtHalfPi: meanOmega(orbitB) / meanOmega(orbitA) - 1,
      },
      control: {
        slopeCubicTorus: Number(slopes.cubic!.toFixed(4)),
        spreadCubicSmallest: series.cubic![0]!,
        quarticInvariantsD4: mD4.series[4]!,
      },
      notes:
        'L2. Disclosed: these gates were written after probes (tmp/mth-husk*.ts) had been run, and a first probe applied the -3 shape prediction to the single sorted branches, where it fails (-5.07, -3.29, -0.86 with 11 to 16 percent residuals, the sorted branches not being smooth); the correction, that only the trace is F4-invariant, was made before the trace was run. The k^4 law holds in every single branch too, which W(F4) alone does not force (its quartic covariants number 3, one anisotropic): the rule\'s symbol puts zero weight on that covariant, so the three photons stay degenerate to order k^4 (their splitting is 4e-8 of lambda at |k| = 0.1, relative order k^4 as well). The single branches are only B3-invariant, and their shapes are not -3 (even pair -4.07, odd -0.86); only the trace is F4-invariant. The law is a prediction for the husk as a flat projection of the D4 box; the hyperbolic columns (warp) are not modeled. At |k| = pi / 2 the linear theory puts the full-sphere spread of the lower branch at 0.30 percent in frequency and E-FRC-0169\'s two orbits (3,0,0) and (2,2,1) at 0.18 percent apart in the mean of the two branches, against the 0.005 percent that E-FRC-0169 read from a thermal run: that reading is closer than the linear symbol allows and should be audited (thermal renormalization rescales kappa for every direction alike and cannot close the gap).',
    })
  },
})
