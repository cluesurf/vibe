// The depth a trit column needs (E-FRC-0208): how deep the column of code/rule/trit-column must be for a
// given field range and wave accuracy, what the column's saturation law is, and what the depth sets besides:
// the coupling and the fine-structure constant.
//
// What the column holds. A husk angle column of 2D trits (axis) or D (diagonal) is a cycling number, so the
// plaquette field B is read mod N_B = 4D with its seam (the compact U(1) wrap) at |B| = 2D. The potential
// column of a husk triangle holds |U| <= n_P D. Each counter is a column of D trits, a cycling number in
// -D .. D mod q = 2D + 1, and the coupling is kappa = 2p / q.
//
// Exact statements, derived before any run:
// - stability: the husk operator's largest eigenvalue is lambda_max = 16 (E-FRC-0207 S), so the leapfrog is
//   stable iff kappa lambda_max <= 4, i.e. 2D + 1 >= 8p: D >= 4 at p = 1. Below it the top branch grows by
//   the leapfrog's growth factor per beat
// - the dither bound: the wave form's raw field differs from its shadow by C W C^T d, |d| <= D / q, so
//   |B - B~| <= beta(D) = 36 D / (2D + 1) < 18 (36 = the largest sum over a husk triangle's links of the weight
//   times the number of husk triangles on the link)
// - the seam law: a wave whose shadow peaks at P never reaches the seam while P + 2.5 + beta(D) < 2D (2.5
//   bounds the rounding of the start in B), so the depth a field range P needs is D > (P + 2.5 + beta) / 2,
//   about P / 2 + 10
// - the coupling: kappa(D) = 2p / (2D + 1), and the light speed of the long waves c = sqrt(2 kappa / 3)
//   (E-FRC-0179's lambda / k^2 = 2/3)
// - the fine-structure constant: E-MTH-0020 derived alpha = e^2 / (12 N D c) for the bulk rule with N angle
//   steps per unit of bulk angle and column depth D. In the column rule one unit of bulk angle is half a
//   turn (the axis column's 4D values cover the circle, and one bulk link is 1 / 2D of it), so N = 2, and a
//   vibe's charge is one bulk flux unit, e = 1: alpha(D) = 1 / (24 D c(D)) = sqrt(3 (2D + 1) / (4p)) / (24 D),
//   about 0.051 / sqrt(p D). THE DEPTH SETS THE COUPLING, THE SPEED OF LIGHT AND ALPHA TOGETHER. This carries
//   E-MTH-0020's formula over, it is not re-measured here
// - saturation: a wrap (cycling) maps a column's 2m + 1 values one to one; a cap merges two values into one
//
// Gates, fixed before the first gated run (probes: tmp/trit-probe2.log, tmp/trit-probe5.log):
// D1 stability: 2D + 1 >= 8p exactly where the symbol's top branch has growth 1 (D = 3 grows, D = 4 does
//    not, at p = 1), from the exact block
// D2 the dither bound: every measured |B - B~| is at most beta(D)
// D3 the seam law: over the grid D in {8, 12, 16, 24, 32, 64, 128}, peak |B| in {D/2, D, 3D/2}, wave vector
//    (1,0,0) 2 pi / 8, one photon, 600 beats, every run the law calls safe reads the symbol within 1e-4 on
//    its shadow and never reaches the seam
// D4 the coupling: the same safe runs confirm kappa(D) = 2 / (2D + 1) (D3's 1e-4), and p = 2 at D = 32
//    (kappa 4 / 65) reads within 1e-4 too
// D5 the dipole question: at the smallest D whose seam holds a wave of peak |B| 1 (D_min, from the seam
//    law), alpha(D_min) < 0.1 and alpha(D_min) c(D_min) < c(D_min) / 10
// D6 saturation: exhaustive on one column of m = 1 to 6 trits: the wrap is a bijection (0 collisions), the cap
//    is not (1 collision each)
// Reported, not gated: the unsafe runs, the largest potential against its window, and the first form's error
//    at D = 16, 64, 256 (the carried remainder of E-FRC-0181 heats; does depth cure it?)
// Status: pass if every gate passes, partial if D1, D2 and D6 pass, fail otherwise.
//
// Runs use the husk integer rule, which the trit rule equals bit for bit (E-FRC-0207 A), so the cost does not
// grow with D. Side 8. Depth L2: exact laws measured against the symbol.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { leapfrogBlock } from '@/code/measure/photon-symbol'
import { makeTritLight, writeColumn } from '@/code/rule/trit-column'
import { tritKappa, tritWave } from '@/code/measure/trit-column-light'

const beta = (d: number): number => (36 * d) / (2 * d + 1)
const kappaOf = (d: number, p = 1): number => (2 * p) / (2 * d + 1)
const cOf = (d: number, p = 1): number => Math.sqrt((2 * kappaOf(d, p)) / 3)
const alphaOf = (d: number, p = 1): number => 1 / (24 * d * cOf(d, p))
const safe = (d: number, peak: number): boolean => peak + 2.5 + beta(d) < 2 * d

function sectionD1(): Record<string, number> {
  const out: Record<string, number> = {}

  for (const d of [3, 4]) {
    out[`d1Growth_D${d}`] = leapfrogBlock(kappaOf(d), 16).growth
  }

  // the exact threshold for p = 1: the smallest D with 2D + 1 >= 8
  out['d1SmallestStableDepth'] = [1, 2, 3, 4, 5].find(d => 2 * d + 1 >= 8) ?? -1

  return out
}

function sectionGrid(): { metrics: Record<string, number>; okD2: boolean; okD3: boolean; okD4: boolean } {
  const out: Record<string, number> = {}
  const tau = (2 * Math.PI) / 8

  let okD2 = true
  let okD3 = true
  let safeRuns = 0
  let unsafeRuns = 0
  let unsafeTouched = 0
  let potentialUse = 0

  for (const d of [8, 12, 16, 24, 32, 64, 128]) {
    const light = makeTritLight({ side: 8, depth: d, form: 'wave' })

    for (const peak of [d / 2, d, (3 * d) / 2]) {
      const w = tritWave(light, [tau, 0, 0], 1, peak, 600, 'husk')
      const name = `D${d}_P${peak}`
      const isSafe = safe(d, peak)
      const touched = w.maxField >= 2 * d

      out[`${name}_Relative`] = w.relative
      out[`${name}_RawRelative`] = w.rawRelative
      out[`${name}_MaxField`] = w.maxField
      out[`${name}_MaxDither`] = w.maxDither
      out[`${name}_MaxPotential`] = w.maxPotential
      out[`${name}_Safe`] = isSafe ? 1 : 0
      okD2 = okD2 && w.maxDither <= beta(d) + 1e-9
      potentialUse = Math.max(potentialUse, w.maxPotential / d)

      if (isSafe) {
        safeRuns++
        okD3 = okD3 && Math.abs(w.relative) < 1e-4 && !touched
      } else {
        unsafeRuns++
        unsafeTouched += touched ? 1 : 0
      }
    }
  }

  const two = makeTritLight({ side: 8, depth: 32, form: 'wave', p: 2 })
  const w2 = tritWave(two, [tau, 0, 0], 1, 16, 600, 'husk')

  out['d4P2Kappa'] = tritKappa(two)
  out['d4P2Relative'] = w2.relative
  out['gridSafeRuns'] = safeRuns
  out['gridUnsafeRuns'] = unsafeRuns
  out['gridUnsafeTouchedSeam'] = unsafeTouched
  out['gridLargestPotentialOverDepth'] = potentialUse

  return { metrics: out, okD2, okD3, okD4: okD3 && Math.abs(w2.relative) < 1e-4 }
}

function sectionD5(): { metrics: Record<string, number>; ok: boolean } {
  const out: Record<string, number> = {}
  const dMin = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].find(d => d >= 4 && safe(d, 1)) ?? -1

  out['d5SmallestDepth'] = dMin
  out['d5Alpha'] = alphaOf(dMin)
  out['d5LightSpeed'] = cOf(dMin)
  out['d5OrbitSpeedOverLight'] = alphaOf(dMin)

  for (const d of [4, 8, 16, 32, 64, 128, 256]) {
    out[`alpha_D${d}`] = alphaOf(d)
    out[`inverseAlpha_D${d}`] = 1 / alphaOf(d)
    out[`lightSpeed_D${d}`] = cOf(d)
    out[`kappa_D${d}`] = kappaOf(d)
  }

  // the committed bulk rule's coupling, kappa = 2 pi 80 / 8192, for comparison: the D with the same kappa
  out['depthMatchingCommittedKappa'] = (2 / ((2 * Math.PI * 80) / 8192) - 1) / 2

  return { metrics: out, ok: dMin > 0 && alphaOf(dMin) < 0.1 && alphaOf(dMin) * cOf(dMin) < cOf(dMin) / 10 }
}

function sectionD6(): Record<string, number> {
  let wrapCollisions = 0
  let capCollisions = 0

  for (let m = 1; m <= 6; m++) {
    const values = 2 * m + 1
    const wrapImage = new Set<string>()
    const capImage = new Set<string>()

    for (let v = -m; v <= m; v++) {
      const entries = Int32Array.from({ length: m }, (_, i) => i)
      const wrap = new Int8Array(m)
      const cap = new Int8Array(m)

      writeColumn(wrap, entries, undefined, 0, m, ((((v + 1 + m) % values) + values) % values) - m)
      writeColumn(cap, entries, undefined, 0, m, Math.min(v + 1, m))
      wrapImage.add(Array.from(wrap).join(','))
      capImage.add(Array.from(cap).join(','))
    }

    wrapCollisions += values - wrapImage.size
    capCollisions += values - capImage.size
  }

  return { d6WrapCollisions: wrapCollisions, d6CapCollisions: capCollisions }
}

function firstForm(): Record<string, number> {
  const out: Record<string, number> = {}
  const tau = (2 * Math.PI) / 8

  for (const d of [16, 64, 256]) {
    const light = makeTritLight({ side: 8, depth: d, form: 'first' })
    const w = tritWave(light, [tau, 0, 0], 1, d / 2, 600, 'husk')

    out[`first_D${d}_Relative`] = w.relative
    out[`first_D${d}_MaxField`] = w.maxField
  }

  return out
}

export default experiment({
  id: 'gauge/trit-column-depth',
  code: 'E-FRC-0208',
  title:
    'the depth a trit column needs: the leapfrog is stable from D = 4, the wave form reads light within 1e-4 whenever the seam at 2D clears the peak field plus a dither under 18, a wrap is the only saturation that keeps the bijection, and the depth sets the coupling 2 / (2D + 1), the speed of light and alpha together',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const d1 = sectionD1()
    const grid = sectionGrid()
    const d5 = sectionD5()
    const d6 = sectionD6()
    const first = firstForm()
    const okD1 = (d1['d1Growth_D3'] ?? 1) > 1 && d1['d1Growth_D4'] === 1 && d1['d1SmallestStableDepth'] === 4
    const okD6 = d6['d6WrapCollisions'] === 0 && d6['d6CapCollisions'] === 6
    const gates = { D1: okD1, D2: grid.okD2, D3: grid.okD3, D4: grid.okD4, D5: d5.ok, D6: okD6 }
    const metrics: Record<string, number> = { ...d1, ...grid.metrics, ...d5.metrics, ...d6, ...first }

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok ? 1 : 0
    }

    return verdict({
      status: Object.values(gates).every(x => x) ? 'pass' : okD1 && grid.okD2 && okD6 ? 'partial' : 'fail',
      claim:
        'a trit column of depth D holds light stably from D = 4, reads it within 1e-4 whenever 2D clears the peak field plus a dither under 18, saturates only by a wrap (the compact U(1)), and sets kappa = 2 / (2D + 1), c = sqrt(2 kappa / 3) and alpha = 1 / (24 D c) together',
      metrics,
      control: { firstFormD16: first['first_D16_Relative'] ?? -1, firstFormD256: first['first_D256_Relative'] ?? -1 },
      notes:
        "L2, exact integers, deterministic. First run 2026-09-26 (tmp/frc0208.log, 98 s), PASS on every gate. D1: the top branch grows by 2.094 per beat at D = 3 (kappa 2/7, kappa lambda_max 4.57) and not at D = 4 (kappa 2/9, 3.56): stable from D = 4 at p = 1, exactly 2D + 1 >= 8p. D2: the largest measured |B - B~| is 13.4 (D 32) against the bound 36 D / (2D + 1), which is 16.9 to 17.9; it does not grow with D (11.6 to 13.4 at every D). D3: all 11 runs the seam law calls safe read the symbol within 2.4e-6 (worst D 32, peak 16) on the shadow, 2e-5 to 4e-4 on the raw field, and never touch the seam. The law is sufficient, not necessary: of the 10 runs it calls unsafe, 4 still read within 5.1e-5 (D 12 peaks 6 and 12, D 16 peak 16, D 24 peak 36, D 32 peak 48), and 6 reached the seam and failed (all three at D 8, 10 to 73 percent; D 12 peak 18, 42 percent; D 16 peak 24, 30 percent). D4: the p = 2 run at D 32 (kappa 4/65) reads within 6.5e-8. In the safe runs the largest potential is 20 (D 128) against windows of 128 or 256, 0.16 D (only the seam-crossing D 8 runs filled theirs, 2 D): the potential column is nearly empty for light; the field range is set by the ANGLE column's seam, not the potential's. D5: the smallest depth whose seam holds a unit wave is D = 11, where alpha = 0.0157 and c = 0.241, so an orbit moves at 1.6 percent of light: the dipole regime. alpha(D) = 1 / (24 D c(D)): 0.0271 (D 4), 0.0186 (8), 0.0130 (16), 0.0091 (32), 0.0064 (64), 0.0045 (128), 0.0032 (256); c = 0.385, 0.280, 0.201, 0.143, 0.102, 0.072, 0.051. The committed kappa = 2 pi 80 / 8192 is D = 15.8 at p = 1: the column depth 16 reproduces the committed light (c 0.2010 against 0.2023). D6: the wrap maps each column's 2m + 1 values one to one (0 collisions over m = 1 to 6), the cap merges one pair per column (6). CONTROL, the first form (E-FRC-0181's carried remainder) at peak D / 2: 226 percent off at D 16 (it heats to the seam), 1.6e-4 at D 64, 3.1e-5 at D 256: depth cures the first form's heating too (its one-unit error shrinks against a wave of flux growing with D), but the wave form is exact at every D the seam allows. THE ANSWER TO THE DEPTH QUESTION: D >= 4 for stability; D > (P + 20.5) / 2 for a field range of peak |B| = P (about P / 2 + 10), with accuracy about 1e-5 on the shadow independent of D; the saturation law is the wrap, which is compact U(1) with N_B = 4D. ALPHA IS CARRIED OVER from E-MTH-0020 (alpha = e^2 / (12 N D c) with N = 2 and e = 1 in the column rule), not measured here. alpha is a free function of D and p (about 0.051 / sqrt(p D)): 1 / 137 would need D near 49 at p = 1, which is a choice and not a prediction.",
    })
  },
})
