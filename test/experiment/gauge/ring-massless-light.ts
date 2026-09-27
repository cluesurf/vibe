// The massless branch of the quantum light (E-FRC-0235): the plaquette ladder's rule with its transverse
// direction closed (code/rule/loop-ring), a periodic strip of husk squares one square around. The rails, which
// touched one square each and gave the ladder's photon its cutoff, become links between a square and itself
// and carry nothing; every rung lies between two squares, e_p = m_(p-1) - m_p. The product of all loop shifts
// is then the identity (a closed surface), so a uniform shift of every loop register is no change and the
// physical states are the ones it leaves alone.
//
// DERIVED before the first run.
//   (1) no cutoff      The curl-curl of the closed strip is K(k) = 2 - 2 cos k, so the classical E~ light on it
//                      has 2 - 2 cos omega = kappa K(k): omega(0) = 0 and omega / k -> sqrt(kappa) at long
//                      wavelength. The k = 0 mode is the uniform shift, which on a closed surface is no state at
//                      all: the zero-momentum sector holds no one-quantum level, only pairs (k, -k)
//   (2) the band       In the harmonic reading the beat is metaplectic and its one-quantum band IS the classical
//                      symbol (E-FRC-0231 (1)); the finite column departs from it by an amount that falls with N
//   (3) the husk       The husk's photon along a husk axis (E-FRC-0179's symbol, read from the bulk D4 box by
//                      code/measure/photon-symbol) solves lambda^2 - 12 lambda + 8 u = 0, u = 2 - 2 cos k: it is
//                      the lower root 6 - sqrt(36 - 8 u), level-repelled by a massive partner at 12 minus it. So
//                      lambda / u -> 2/3 and the husk light speed is sqrt(2 kappa / 3): the strip's sqrt(kappa)
//                      times sqrt(2/3), the husk's geometry. The quantum band's slope is the classical light's
//                      slope on the same geometry by (2); the husk's quantum light is not run here
//   (4) the split      f / s = links per square = 1 on the ring (E-FRC-0234's rule), realized by the nearest
//                      integer pair (code/rule/loop-ring splitNear)
//
// Gates, fixed before the first run (code checks before this file: tmp/qlit-probe1.ts printed the husk axis
// symbol at 17 wave numbers, which suggested the quadratic of (3); tmp/qlit-probe2.ts compared the kernels):
// M1 the band: on the closed strips (N, L) = (25, 3), (13, 4), (17, 4), (9, 5), in every momentum sector q != 0
//    the one-quantum level (largest overlap with E_k |vac>, E_k the rungs' Fourier field) sits at the classical
//    symbol within 1e-3 relative at N >= 13 and within 1e-2 at N = 9, overlap at least 0.9 at N >= 13
// M2 no cutoff: on each strip the zero-momentum sector's lowest level above the vacuum sits at twice the
//    measured omega(2 pi / L) within 1e-2 relative (a pair, not a photon); the control, the open ladder (rails
//    present, split f / s near 3) on the boxes (25, 2) and (13, 3), has its q = 0 one-quantum level at the cutoff
//    arccos(1 - kappa) within 1e-3 (the strips' own sizes are too large for the ladder's unreduced sectors)
// M3 the husk axis: the husk photon's two degenerate transverse eigenvalues along a husk axis solve
//    lambda^2 - 12 lambda + 8 u = 0 within 1e-10 at the 17 wave numbers k = pi j / 16, the next eigenvalue is its
//    partner 12 - lambda, and the zero-mode count is 1
// M4 exact and reversible: the ring's rule with the STAND-IN atom (N, L) = (3, 3), (5, 3), (3, 4): 8 beats forward
//    and back return every start exactly, and the beat commutes with the uniform shift exactly (BigInt
//    cyclotomic, 3 Weyl starts and their superposition per box)
// Reported (husk first): the husk light speed sqrt(2 kappa / 3) and the strip's sqrt(kappa) per N; the quantum
// band's chord omega(k_min) / k_min against the classical chord; the bulk: the vacuum's rung columns reaching trit
// depth d.
// Status: pass if M1 to M4 pass; partial if M1 and M3 pass; fail otherwise.
//
// Depth L2: the model's light rule on a closed husk strip; the husk axis quadratic is a new closed form of a
// known symbol (L1 for M3).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { exactBasis, exactEqual, exactFrom, inverseSteps, reduce, runExact, type Exact } from '@/code/rule/lattice-qed'
import { classicalOmega, splitOf, type LadderSpec } from '@/code/rule/plaquette-ladder'
import { huskAxisLambda, loopSize, loopSplit, loopSteps, loopUniformShift, ringCurl, ringSpec, splitNear, loopFluxes } from '@/code/rule/loop-ring'
import { oneQuantumBand } from '@/code/measure/quantum-ladder'
import { ringBand } from '@/code/measure/loop-spectrum'
import { photonLatticeD4 } from '@/code/rule/photon-links'
import { makeHusk } from '@/code/measure/photon-husk'
import { curlSymbol, eigenvalues, huskSymbol, plaquetteShapes } from '@/code/measure/photon-symbol'
import { weyl } from '@/code/tool/weyl'

const STRIPS: readonly [number, number][] = [
  [25, 3],
  [13, 4],
  [17, 4],
  [9, 5],
]
const CONTROL_LADDERS: readonly [number, number][] = [
  [25, 2],
  [13, 3],
]
const EXACT_BOXES: readonly [number, number][] = [
  [3, 3],
  [5, 3],
  [3, 4],
]
const BEATS = 8

function startsOf(size: number, m: number): Exact[] {
  const picks: number[] = []

  for (let k = 1; picks.length < 3; k++) {
    const i = Math.floor(weyl(k) * size)

    if (!picks.includes(i)) picks.push(i)
  }

  return [...picks.map(i => exactBasis(m, i)), exactFrom(m, picks.map((i, j) => [i, BigInt(j + 1)]))]
}

const mapExact = (v: Exact, f: (i: number) => number): Exact => ({ m: v.m, den: v.den, entries: new Map([...v.entries].map(([i, e]) => [f(i), e])) })

export default experiment({
  id: 'gauge/ring-massless-light',
  code: 'E-FRC-0235',
  title:
    "the massless branch of the quantum light: the plaquette ladder's rule on a strip of husk squares closed around its width has a one-quantum band on the classical E~ light's massless symbol, omega(0) = 0 and slope sqrt(kappa), with no photon at k = 0 (the uniform shift is no state on a closed surface), and the husk's own axis photon solves lambda^2 - 12 lambda + 8u = 0, so its light speed is sqrt(2 kappa / 3)",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let m1 = true
    let m2 = true

    // M3 first: the husk
    const bulk = photonLatticeD4({ side: 4 })
    const husk = makeHusk(bulk)
    const shapes = plaquetteShapes(bulk)
    let quadratic = 0
    let partner = 0
    let degenerate = 0
    let zeroCount = 0

    for (let j = 0; j <= 16; j++) {
      const k = (Math.PI * j) / 16
      const values = eigenvalues(huskSymbol(husk, curlSymbol(bulk, shapes, [k, 0, 0, 0])).hermitian)
      const u = ringCurl(k)
      const lambda = values[1]!

      quadratic = Math.max(quadratic, Math.abs(lambda * lambda - 12 * lambda + 8 * u), Math.abs(values[2]! ** 2 - 12 * values[2]! + 8 * u))
      degenerate = Math.max(degenerate, Math.abs(values[1]! - values[2]!))
      partner = Math.max(partner, Math.abs(values[3]! - (12 - lambda)))

      if (j === 0) zeroCount = values.filter(v => Math.abs(v) < 1e-9).length
      if (j === 8) metrics.huskAxisLambdaHalfPi = lambda
    }

    metrics.huskAxisQuadraticResidual = quadratic
    metrics.huskAxisDegeneracy = degenerate
    metrics.huskAxisPartnerResidual = partner
    metrics.huskAxisZeroModesAtK0 = zeroCount
    metrics.huskAxisLongWaveRatio = huskAxisLambda(1e-3) / ringCurl(1e-3)

    // j = 0 has three zero eigenvalues on the husk (the gauge mode and the two photons at k = 0); the gate reads
    // the count of zero modes beyond the photons, 1
    const m3 = quadratic <= 1e-10 && partner <= 1e-10 && degenerate <= 1e-10 && zeroCount - 2 === 1

    // M1, M2: the strips
    const chords: string[] = []

    for (const [n, L] of STRIPS) {
      const tag = `N${n}L${L}`
      const split = splitNear(n, 1)
      const spec = ringSpec(n, L, split)
      const { kappa } = loopSplit(spec)
      const out = ringBand(spec)
      let worst = 0
      let overlap = 1

      for (const b of out.band) {
        worst = Math.max(worst, Math.abs(b.omega / b.classical - 1))
        overlap = Math.min(overlap, b.overlap)
      }

      metrics[`splitRatio${tag}`] = split.force / split.drift
      metrics[`bandError${tag}`] = worst
      metrics[`bandOverlap${tag}`] = overlap
      metrics[`eigenResidual${tag}`] = out.residual
      metrics[`vacuumTrialOverlap${tag}`] = out.vacuumOverlap
      m1 &&= n >= 13 ? worst <= 1e-3 && overlap >= 0.9 : worst <= 1e-2

      // the husk first: the husk light speed, then the strip's
      metrics[`huskLightSpeed${tag}`] = Math.sqrt((2 * kappa) / 3)
      metrics[`stripLightSpeed${tag}`] = Math.sqrt(kappa)

      const low = out.band[0]!
      const chord = low.omega / low.k
      const classicalChord = low.classical / low.k

      metrics[`chord${tag}`] = chord
      metrics[`classicalChord${tag}`] = classicalChord
      metrics[`chordOverSqrtKappa${tag}`] = chord / Math.sqrt(kappa)
      chords.push(`${chord.toFixed(5)} against ${classicalChord.toFixed(5)} (sqrt kappa ${Math.sqrt(kappa).toFixed(5)}) at N = ${n}, L = ${L}`)

      // M2: the q = 0 sector's lowest level above the vacuum
      const vac = out.levels[out.vacuum]!
      let lowest = Infinity

      out.levels.forEach((l, i) => {
        if (l.q !== 0 || i === out.vacuum) return

        const e = (((vac.phase - l.phase) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

        if (e < Math.PI) lowest = Math.min(lowest, e)
      })

      metrics[`zeroMomentumLowest${tag}`] = lowest
      metrics[`zeroMomentumPairRatio${tag}`] = lowest / (2 * low.omega)
      m2 &&= Math.abs(lowest / (2 * low.omega) - 1) <= 1e-2

      // the bulk: P(|e_rung| >= d) in the vacuum
      const D = (n - 1) / 2
      const flux = new Int32Array(L)

      for (let d = 1; d <= Math.min(D, 6); d++) {
        let p = 0

        for (let i = 0; i < out.vacuumFull.re.length; i++) {
          const w = out.vacuumFull.re[i]! ** 2 + out.vacuumFull.im[i]! ** 2

          if (w === 0) continue

          loopFluxes(spec, i, flux)

          if (Math.abs(flux[0]!) >= d) p += w
        }

        metrics[`vacuumRungDepthP${d}${tag}`] = p
      }
    }

    // M2's control: the open ladder's photon at its cutoff
    for (const [n, L] of CONTROL_LADDERS) {
      const tag = `N${n}L${L}`
      const ladderSplit = splitNear(n, 3)
      const ladder: LadderSpec = { n, plaquettes: L, root: ladderSplit.root, drift: ladderSplit.drift, force: ladderSplit.force }
      const lb = oneQuantumBand(ladder)
      const cutoff = classicalOmega(splitOf(ladder).kappa, 0, L)

      metrics[`ladderCutoff${tag}`] = lb.band[0]!.omega
      metrics[`ladderCutoffClassical${tag}`] = cutoff
      m2 &&= Math.abs(lb.band[0]!.omega / cutoff - 1) <= 1e-3
    }

    // M4: exact and reversible, the uniform shift a symmetry
    let reverseMismatches = 0
    let shiftMismatches = 0

    for (const [n, L] of EXACT_BOXES) {
      const spec = ringSpec(n, L, splitNear(n, 1), 1)
      const steps = loopSteps(spec)
      const back = inverseSteps(steps)
      const shift = (i: number): number => loopUniformShift(spec, i)

      for (const start of startsOf(loopSize(spec), spec.root)) {
        const there = runExact(steps, start, BEATS)
        const again = runExact(back, there, BEATS)

        if (!exactEqual(reduce(again), reduce(start))) reverseMismatches++

        const a = runExact(steps, mapExact(start, shift), 2)
        const b = mapExact(runExact(steps, start, 2), shift)

        if (!exactEqual(a, b)) shiftMismatches++
      }
    }

    metrics.reverseMismatches = reverseMismatches
    metrics.shiftMismatches = shiftMismatches

    const m4 = reverseMismatches === 0 && shiftMismatches === 0
    const gates = { M1: m1, M2: m2, M3: m3, M4: m4 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = m1 && m2 && m3 && m4 ? 'pass' : m1 && m3 ? 'partial' : 'fail'
    const tags = STRIPS.map(([n, L]) => `N${n}L${L}`)

    return verdict({
      status,
      claim: `husk: the husk's axis photon solves lambda^2 - 12 lambda + 8u = 0 (residual ${quadratic.toExponential(1)} at 17 wave numbers), so it is massless with lambda / u -> 2/3 and light speed sqrt(2 kappa / 3) (${metrics.huskLightSpeedN25L3!.toFixed(4)} per beat at N = 25); strip: with its width closed the plaquette ladder's quantum light has its one-quantum band on the massless classical symbol within ${tags.map(t => metrics[`bandError${t}`]!.toExponential(1)).join(', ')} (N, L = ${STRIPS.map(([n, L]) => `${n}, ${L}`).join('; ')}), the band's chord at the smallest k is ${tags.map(t => metrics[`chordOverSqrtKappa${t}`]!.toFixed(4)).join(', ')} of sqrt(kappa) as the classical chord is, and the zero-momentum sector holds a pair at ${tags.map(t => metrics[`zeroMomentumPairRatio${t}`]!.toFixed(4)).join(', ')} of 2 omega(k_min) instead of a photon, where the open ladder's photon sits at its cutoff; the rule is exact and reversible with the STAND-IN atom (${reverseMismatches} mismatches) and keeps the uniform shift (${shiftMismatches})`,
      metrics,
      control: { ladderCutoffN25L2: metrics.ladderCutoffN25L2!, ladderCutoffN13L3: metrics.ladderCutoffN13L3! },
      notes: `L2 (M3 L1). FIRST RUN 2026-09-26 (tmp/frc0235.log, 569 s), PARTIAL: M1, M3, M4 pass, M2 fails on its first clause through a FLAW IN THE GATE. No gate moved. M1: the one-quantum band sits on the massless classical symbol within 6.6e-14, 7.7e-7, 1.1e-8, 2.0e-4 at (N, L) = (25, 3), (13, 4), (17, 4), (9, 5), overlap with E_k |vac> at least 0.9927 (0.99995 at N >= 13), eigen residuals at most 2.9e-7. M3: the husk's axis photon solves lambda^2 - 12 lambda + 8u = 0 within 2.5e-14 at 17 wave numbers, the two transverse branches degenerate within 4.9e-15, the massive partner at 12 - lambda within 1.2e-14, lambda / u = 0.6666667 at k = 1e-3; three zero eigenvalues at k = 0 (the gauge mode and the two photons, as the gate's count assumed). M4: 0 of 12 reversal mismatches and 0 of 12 uniform-shift mismatches, BigInt exact. M2: the open ladder's photon sits at its cutoff within 1.0e-12 and 2.8e-6 of arccos(1 - kappa) (N = 25 L = 2, N = 13 L = 3), but the gate read the ring's lowest QUASI-energy above the vacuum in q = 0, 0.012 to 0.031 of 2 omega(k_min). DIAGNOSED AFTER THE RUN (tmp/qlit-probe5.ts, disclosed): the q = 0 sector holds 208 and 552 levels spread over the whole circle of quasi-energy, so some high level always folds to within about 0.03 of the vacuum mod 2 pi; the level the gate found has generator energy 12.76 at (25, 3) and 6.47 at (13, 4). Read by generator energy, the lowest zero-momentum excitation IS the pair: quasi-energy 1.000000 and 1.000108 of 2 omega(k_min), overlap with E_k E_-k |vac> 1.000000 and 0.961. So the physics M2 asked for holds, and the gate as written cannot see it: the same folding E-FRC-0230 and 0232 avoided by unwrapping with the invariant energy. HUSK FIRST: the husk light speed is sqrt(2 kappa / 3) (0.2309 at N = 25), the strip's sqrt(kappa) (0.2828); on each strip the quantum chord omega(k_min) / k_min equals the classical chord within 2e-5 relative (0.8355, 0.9123, 0.9094, 0.9479 of sqrt(kappa) at k_min = 2 pi / 3, pi / 2, pi / 2, 2 pi / 5, the lattice's own sublinear factor). The husk's quantum light is NOT run: its speed follows from M3 and the metaplectic theorem that M1 confirms on the strip. BULK: the vacuum's rung-0 column reaches trit depth d with probability 0.742, 0.324, 0.100, 0.021, 0.0031, 0.0003 for d = 1 .. 6 at N = 25. Chords: ${chords.join('; ')}.`,
    })
  },
})
