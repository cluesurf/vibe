// The finite-state limit of counted light (E-FRC-0204): no rule with a bounded integer state can carry a
// photon as exactly linear light at a stable coupling kappa = 1/Q, and the best it can do is carry the
// remainder, which E-FRC-0205's counters do to 2^-S.
//
// The caller asked for the wave form's shadow E~ to be "exactly linear, with no rounding anywhere". The
// second half is met (E-FRC-0205). The first cannot be, for any rule of this kind, and this experiment says
// why and measures it. The argument (code/measure/photon-count-limit): a readout that is an integer-linear
// function of a bounded integer state over a fixed denominator lies in a fixed lattice; an exactly linear
// orbit in a lattice spans a lattice the leapfrog preserves, which forces kappa lambda to be an algebraic
// integer for every mode present; the conjugates of lambda are eigenvalues of the integer matrix M = C^T C,
// all in [0, lambda_max]; so with Q >= lambda_max every conjugate of kappa lambda lies in [0, 1] and its norm
// is below 1 in absolute value unless lambda = 0 or lambda = Q. A nonzero algebraic integer has norm at least
// 1. Hence: at Q = 16 = lambda_max the only exactly carriable modes are the gauge and static fields
// (lambda = 0) and the top of the band (lambda = 16, kappa lambda = 1, period 6). Every photon is out of reach.
//
// In 2-adic terms, on the side 2 box where M's eigenvalues are integers: a mode with eigenvalue lambda has
// the leapfrog trace 2 - lambda/16, whose 2-adic size sets how many bits the exact orbit's denominator gains
// per beat: lambda = 4 or 12 (trace 7/4 or 5/4) gain 2 bits a beat, lambda = 8 (trace 3/2) gains 1, lambda = 0
// and 16 gain none.
//
// Predictions and gates, fixed before the run (the side 2, 3 and 4 spectra were read in a probe first, and
// are disclosed as seen: side 2 holds 0, 4, 8, 12, 16 only, side 3 tops at 15 with the conjugate pair
// 6 -+ 2 sqrt 3, side 4 tops at 16):
// G1 the theorem's hypothesis: every eigenvalue of M over every wave vector of the side 2, 3 and 4 boxes in
//    [0, 16] within 1e-9, and lambda_max = 16 within 1e-9 on sides 2 and 4; on side 2 the exact integer
//    identity M (M - 4)(M - 8)(M - 12)(M - 16) w = 0 on 4 integer test vectors, with every one of the five
//    factors needed (dropping any one leaves a nonzero vector for some w)
// G2 exact rationals on side 2, 64 beats: from the E-FRC-0164 integer start the denominator's exponent grows
//    at 2 bits per beat (least-squares slope over beats 32 to 64 within 0.1 of 2); from a start projected
//    exactly onto lambda = 8 at 1 bit per beat (within 0.1); from a start projected onto lambda = 16 the
//    denominator stays 1 and the orbit returns exactly after 6 beats; from a start projected onto lambda = 0 it
//    stays 1 and the state never changes
// G3 the carried remainder: the wave form's shadow departs from the float linear leapfrog, over 1,000 beats
//    from the hot start on side 4, by a worst amount that falls by at least a factor 8 per added base-16 digit
//    from 2 to 5 digits (expected 16), and is under 0.01 flux units at 4 digits
// Status: pass if G1, G2 and G3 pass, partial if G1 and G2 pass, fail otherwise.
//
// Depth L3 for G1 and G2 (a theorem, and exact arithmetic confirming it), L2 for G3.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { photonLatticeD4 } from '@/code/rule/photon-links'
import { applyFactors, boxSpectrum, exactLeapfrog, slope, startVectors, testVector } from '@/code/measure/photon-count-limit'
import { sectionS } from '@/code/measure/photon-count-battery'
import { hotStart, start164 } from '@/code/measure/photon-battery'

const EIGENVALUES = [0, 4, 8, 12, 16]

export default experiment({
  id: 'gauge/photon-count-limit',
  code: 'E-FRC-0204',
  title:
    'the finite-state limit of counted light: no rule with a bounded integer state carries a photon as exactly linear light at kappa = 1/Q, because an exact orbit in a lattice forces kappa lambda to be an algebraic integer and at Q = lambda_max = 16 only the gauge (lambda = 0) and the top of the band (lambda = 16, period 6) qualify; measured in exact rationals, and the carried remainder falls as 16 per digit',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // G1
    let inBand = true

    for (const side of [2, 3, 4]) {
      const s = boxSpectrum(side)

      metrics[`g1Side${side}Max`] = s.max
      metrics[`g1Side${side}Min`] = s.min
      metrics[`g1Side${side}Values`] = s.values.length
      inBand = inBand && s.min > -1e-9 && s.max < 16 + 1e-9
    }

    const topped = Math.abs((metrics['g1Side2Max'] ?? 0) - 16) < 1e-9 && Math.abs((metrics['g1Side4Max'] ?? 0) - 16) < 1e-9
    const lattice = photonLatticeD4({ side: 2 })
    const tests = [1, 2, 3, 4].map(salt => testVector(lattice.links, salt))
    const annihilated = tests.every(w => applyFactors(lattice, EIGENVALUES, w).every(x => x === 0n))
    const needed = EIGENVALUES.map(mu => tests.some(w => applyFactors(lattice, EIGENVALUES.filter(x => x !== mu), w).some(x => x !== 0n)))

    metrics['g1Annihilated'] = annihilated ? 1 : 0
    metrics['g1FactorsNeeded'] = needed.filter(Boolean).length

    const okG1 = inBand && topped && annihilated && needed.every(Boolean)

    // G2
    const beats = 64
    const general = startVectors(lattice, start164)
    const projected = (lambda: number): bigint[] => applyFactors(lattice, EIGENVALUES.filter(x => x !== lambda), tests[0]!)
    const zeros = (): bigint[] => Array.from({ length: lattice.links }, () => 0n)
    const runGeneral = exactLeapfrog(lattice, 4, general.angle, general.flux, beats)
    const run8 = exactLeapfrog(lattice, 4, projected(8), zeros(), beats)
    const run16 = exactLeapfrog(lattice, 4, projected(16), zeros(), beats)
    const run0 = exactLeapfrog(lattice, 4, projected(0), zeros(), beats)
    const slopeGeneral = slope(runGeneral.exponents, 32, 64)
    const slope8 = slope(run8.exponents, 32, 64)

    metrics['g2GeneralExponentAt64'] = runGeneral.exponents[63] ?? -1
    metrics['g2GeneralSlope'] = slopeGeneral
    metrics['g2Lambda8ExponentAt64'] = run8.exponents[63] ?? -1
    metrics['g2Lambda8Slope'] = slope8
    metrics['g2Lambda16MaxExponent'] = Math.max(...run16.exponents)
    metrics['g2Lambda16PeriodSix'] = run16.periodSix ? 1 : 0
    metrics['g2Lambda16Nonzero'] = projected(16).some(x => x !== 0n) ? 1 : 0
    metrics['g2Lambda0MaxExponent'] = Math.max(...run0.exponents)
    metrics['g2Lambda0Static'] = run0.static ? 1 : 0
    metrics['g2Lambda0Nonzero'] = projected(0).some(x => x !== 0n) ? 1 : 0
    metrics['g2Lambda8Nonzero'] = projected(8).some(x => x !== 0n) ? 1 : 0

    const okG2 =
      Math.abs(slopeGeneral - 2) < 0.1 &&
      Math.abs(slope8 - 1) < 0.1 &&
      metrics['g2Lambda16MaxExponent'] === 0 &&
      run16.periodSix &&
      metrics['g2Lambda0MaxExponent'] === 0 &&
      run0.static &&
      metrics['g2Lambda16Nonzero'] === 1 &&
      metrics['g2Lambda0Nonzero'] === 1 &&
      metrics['g2Lambda8Nonzero'] === 1

    // G3
    const s = sectionS(
      'wave',
      'zero',
      [2, 3, 4, 5].map(digits => [`Digits${digits}`, 4, hotStart, 1000, 13, digits] as const),
    )
    const worst = [2, 3, 4, 5].map(digits => s[`sDigits${digits}FromLinearWorst`] ?? 1)
    const ratios = worst.slice(1).map((w, i) => (worst[i] ?? 0) / w)

    worst.forEach((w, i) => (metrics[`g3Digits${i + 2}Worst`] = w))
    ratios.forEach((r, i) => (metrics[`g3Ratio${i + 2}To${i + 3}`] = r))
    metrics['g3SeamCrossings'] = [2, 3, 4, 5].reduce((a, digits) => a + (s[`sDigits${digits}SeamCrossings`] ?? 0), 0)

    const okG3 = ratios.every(r => r >= 8) && (worst[2] ?? 1) < 0.01
    const gates = { G1: okG1 ? 1 : 0, G2: okG2 ? 1 : 0, G3: okG3 ? 1 : 0 }

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok
    }

    return verdict({
      status: okG1 && okG2 && okG3 ? 'pass' : okG1 && okG2 ? 'partial' : 'fail',
      claim:
        'the curl-curl spectrum lies in [0, 16] with lambda_max = 16, so at kappa = 1/16 no bounded integer state carries any photon exactly: the exact rational orbit gains 2 bits of denominator a beat through lambda = 4 and 12 and 1 through lambda = 8, while the gauge (lambda = 0) and the top of the band (lambda = 16, period 6) stay integer; the carried remainder of the wave form falls by 16 per digit',
      metrics,
      control: {
        lambda16PeriodSix: metrics['g2Lambda16PeriodSix'] ?? 0,
        lambda0Static: metrics['g2Lambda0Static'] ?? 0,
      },
      notes:
        'L3 for G1 and G2 (a theorem, with exact BigInt arithmetic confirming it), L2 for G3; deterministic. First run 2026-09-26 (tmp/frc0204.log, 3.8 s), PASS. G1: every eigenvalue of M over the 192, 972 and 3,072 wave-vector eigenvalues of the side 2, 3 and 4 boxes lies in [0, 16] (least -2.6e-15), lambda_max = 16 on sides 2 and 4 (15 on side 3); on side 2 M (M - 4)(M - 8)(M - 12)(M - 16) annihilates all 4 integer test vectors exactly and all 5 factors are needed. G2: in exact rationals from the E-FRC-0164 integer start the denominator reaches 2^132 after 64 beats, slope 1.997 bits per beat over beats 32 to 64 (predicted 2); from a start projected onto lambda = 8 it reaches 2^59, slope 1.000 (predicted 1); onto lambda = 16 the orbit stays integer and returns exactly after 6 beats; onto lambda = 0 it stays integer and never changes. G3: the wave form\'s shadow departs from the floating linear leapfrog by 0.28, 0.017, 0.0011 and 7.1e-5 flux units at 2, 3, 4 and 5 base-16 digits (1,000 beats, hot start, side 4, 0 seam crossings), ratios 16.4, 15.2 and 15.9 per digit (predicted 16). MEANING: "the shadow exactly linear with no rounding anywhere" is impossible for any rule with bounded integer state at a stable kappa = 1/Q; what a counter can do is make the departure 16^-digits and carry it, which E-FRC-0205 does. The spectra were read in a probe before the gates were written (disclosed in the header).',
    })
  },
})
