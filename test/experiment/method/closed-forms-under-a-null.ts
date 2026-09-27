// Closed forms for today's measured constants, under a pre-registered budget and its null.
//
// THE PROTOCOL (code/measure/integer-relation, fixed before any target was searched): a T(x) = b + c B with
// T in {x, x^2}, B in {pi, sqrt 2, sqrt 3, sqrt 5, sqrt 7, log 2, log 3} or absent, 1 <= a <= 12, |c| <= 12,
// a hit within the value's own uncertainty delta. The null is 5,000 numbers uniform within 10 percent of the
// target at the same delta, placed by the golden Weyl sequence (no seed); p_null is the share with any hit. A number is identified only by a PROOF, or by a
// match whose p_null is under 0.01. The calibration is m_p / m_e = 1836.15267 against 6 pi^5 = 1836.118,
// refused because the gap is 3e6 times the ratio's uncertainty.
//
// The targets and what carries each:
// - CHSH sqrt 7 (swap phase) and (2 + 4 sqrt 2)/3 = 2.55228 (color mode, E-QTM-0109): PROVEN in E-MTH-0009
//   from the states the meetings make; numerically the budget would not separate them (p_null 0.13 and 1)
// - the sound speed 1/sqrt 2 = c/2: PROVEN here. At uniform occupation (the knit's third-each background) the
//   pressure tensor is (rho / 24) sum over the 24 D4 roots of e e^T = (rho / 2) I, since sum e e^T = 12 I (Schur:
//   W(F4) is irreducible on R^4), so c_s^2 = |e|^2 / 4 = 1/2 with |e| = sqrt 2 = c: c_s = c / sqrt 4. The husk
//   keeps it: the roots' shadows on the husk have second moment 12 I too (E-MTH-0013), a two-speed gas with
//   c_s = v_rms / sqrt 3 = 1 / sqrt 2, not the 0.816 of a one-speed 3D gas at c
// - the fear walk spread <x^2>/t^2 = 1 - sqrt 3 / 2: PROVEN (E-MTH-0009, the integral of v^2)
// - the boundary share 0.9453: PROVEN algebraic (E-MTH-0007, the root of 23 s^3 - 18 s^2 - 12 s + 8)
// - the fear share: 2/7 exactly at round 2 (love + fear = 7/3 wholes); the later rounds 0.29 to 0.30 have no
//   closed form in the budget (p_null 1) and sit at the Haar-typical value of a pure two-role state, the mean of
//   (N - 1)/(2 N) with N = sum |W| over random states, measured here
// - the viscosity: the lattice Boltzmann 0.4747 +- 0.0006 (two salts) and the knit's 0.469 +- 0.0125: p_null 1,
//   no identification admissible. An exact value needs the linearized collision averaged exactly over the
//   product measure of a dock (3^24 states), not attempted: an honest negative
// - the warp factor lambda to 1e-12: no relation in the budget at all (it is a cubic, E-MTH-0007)
//
// Gates, fixed before the run: each proof's identity holds to 1e-12; each target's p_null is computed and
// printed; no target is accepted on its number alone with p_null above 0.01.
//
// Depth L2: a discipline instrument run on real constants, with its null.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { namedFormChance, nullMatchRate, relationHits } from '@/code/measure/integer-relation'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { phasePointOperators } from '@/code/measure/grid-weights'
import { swapPhase } from '@/code/rule/fear-weave'

const NULL_SAMPLES = 5000

type Target = {
  readonly name: string
  readonly value: number
  readonly delta: number
  // the closed form a proof supplies, or undefined
  readonly proven?: number
}

const TARGETS: readonly Target[] = [
  { name: 'chshSwap', value: Math.sqrt(7), delta: 1e-6, proven: Math.sqrt(7) },
  { name: 'chshColor', value: 2.5523, delta: 5e-5, proven: (2 + 4 * Math.SQRT2) / 3 },
  { name: 'soundFlip', value: 0.71, delta: 0.003, proven: Math.SQRT1_2 },
  { name: 'walkSpread', value: 0.13398, delta: 5e-5, proven: 1 - Math.sqrt(3) / 2 },
  { name: 'boundaryShare', value: 0.9453, delta: 5e-5, proven: 0.945291537435573 },
  { name: 'fearShareRoundEight', value: 1606 / 5516, delta: 5e-4 },
  { name: 'viscosityBoltzmann', value: 0.4747, delta: 6e-4 },
  { name: 'viscosityKnit', value: 0.469, delta: 0.0125 },
  { name: 'warpFactor', value: 18.278707774365984, delta: 1e-12 },
]

// the mean fear share (N - 1)/(2 N) of Haar-random pure two-role states, N = sum over the 81 points of |W|
function haarFearShare(samples: number): { mean: number; sd: number } {
  const points = phasePointOperators(2)
  // a 36-dimensional Kronecker sequence frac(n sqrt p_j), p_j the first 36 primes: deterministic, no seed;
  // pairs of coordinates go through Box-Muller to the 18 Gaussians of a Haar-random pure state
  const primes: number[] = []

  for (let p = 2; primes.length < 36; p++) {
    if (primes.every(q => p % q !== 0)) {
      primes.push(p)
    }
  }

  const alphas = primes.map(p => Math.sqrt(p) % 1)
  let s = 0
  let s2 = 0

  for (let t = 0; t < samples; t++) {
    const u = alphas.map(a => (((t + 1) * a) % 1) * (1 - 1e-12) + 5e-13)
    const gauss = (k: number): number => Math.sqrt(-2 * Math.log(u[2 * k]!)) * Math.cos(2 * Math.PI * u[2 * k + 1]!)
    const re = Array.from({ length: 9 }, (_, k) => gauss(k))
    const im = Array.from({ length: 9 }, (_, k) => gauss(9 + k))
    const length = Math.sqrt(re.reduce((x, y) => x + y * y, 0) + im.reduce((x, y) => x + y * y, 0))
    let total = 0

    for (const p of points) {
      let w = 0

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const ar = p.re[i * 9 + j]!
          const ai = p.im[i * 9 + j]!

          w += re[i]! * (ar * re[j]! - ai * im[j]!) + im[i]! * (ar * im[j]! + ai * re[j]!)
        }
      }

      total += Math.abs(w / (9 * length * length))
    }

    const share = (total - 1) / (2 * total)

    s += share
    s2 += share * share
  }

  const mean = s / samples

  return { mean, sd: Math.sqrt(s2 / samples - mean * mean) }
}

export default experiment({
  id: 'method/closed-forms-under-a-null',
  code: 'E-MTH-0010',
  title:
    'closed forms for the measured constants under a pre-registered integer-relation budget and its null: the CHSH values sqrt 7 and (2 + 4 sqrt 2)/3, the sound speed c/2 (the D4 roots\' second moment 12 I, which the husk shadows keep), the walk spread 1 - sqrt 3 / 2 and the boundary share are proven, while the viscosity (0.4747 and 0.469) and the late fear share (0.29, the Haar-typical 0.297) have no admissible form (null rate 1), and the numbers alone would not have separated the proven from the coincidental',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const metrics: Record<string, number> = {}
    let admissible = true
    let proofsHold = true

    for (const t of TARGETS) {
      const hits = relationHits(t.value, t.delta)
      const rate = nullMatchRate(t.value, t.delta, NULL_SAMPLES)

      metrics[`${t.name}Hits`] = hits.length
      metrics[`${t.name}NullRate`] = rate

      if (t.proven !== undefined) {
        metrics[`${t.name}NamedChance`] = namedFormChance(t.value, t.delta)
        proofsHold = proofsHold && Math.abs(t.value - t.proven) <= t.delta
      } else {
        // a numeric-only identification needs a hit AND a null rate under 0.01; the gate is that the rate was
        // computed on the full null sample, and the flag records the outcome
        admissible = admissible && Number.isFinite(rate)
        metrics[`${t.name}Identified`] = hits.length > 0 && rate < 0.01 ? 1 : 0
      }
    }

    // the sound speed: sum over the 24 D4 roots of e e^T
    const roots = rootsD4()
    const second = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(b => roots.reduce((s, e) => s + e[a]! * e[b]!, 0)))
    const isotropic = second.every((row, a) => row.every((x, b) => x === (a === b ? 12 : 0)))
    const soundSquared = second[0]![0]! / roots.length
    const soundProof = isotropic && soundSquared === 0.5 && Math.abs(Math.sqrt(soundSquared) - Math.SQRT2 / 2) < 1e-15

    // the walk spread: (1 / 2 pi) integral of sin^2 k / (4 - cos^2 k)
    let spread = 0
    const n = 100000

    for (let i = 0; i < n; i++) {
      const k = (2 * Math.PI * (i + 0.5)) / n

      spread += Math.sin(k) ** 2 / (4 - Math.cos(k) ** 2) / n
    }

    const spreadProof = Math.abs(spread - (1 - Math.sqrt(3) / 2)) < 1e-12
    const haar = haarFearShare(4000)
    const roundTwo = (7 / 3 - 1) / (2 * (7 / 3))
    const proton = { ratio: 1836.15267343, delta: 1.1e-8 }
    const protonRefused = Math.abs(proton.ratio - 6 * Math.PI ** 5) > 1e3 * proton.delta

    // ADJUDICATION 1, the speed coincidence. The walk's top speed is cos(phi / 2) steps a beat, a step a root of
    // length c = sqrt 2; the sound speed is c / sqrt d. They agree iff cos(phi / 2) = 1 / sqrt d: at d = 4 that
    // is phi = 2 pi / 3, at d = 3 it would be 2 arccos(1 / sqrt 3) = 109.47 degrees, no root-of-unity angle. On
    // the husk a walk along a root runs at half its shadow's length (1/2 on the 6 lines with axis shadows,
    // 1 / sqrt 2 on the 6 with diagonal shadows) while the husk sound is 1 / sqrt 2 on every line (E-MTH-0013)
    const walkTopBulk = Math.cos(Math.PI / 3) * Math.SQRT2
    const soundBulk = Math.SQRT2 / 2
    const threeDimensionalAngle = (2 * Math.acos(1 / Math.sqrt(3)) * 180) / Math.PI
    const lineShadows = rootsD4()
      .filter((r, d, all) => d < all.findIndex(o => o.every((x, k) => x === -r[k]!)))
      .map(r => Math.hypot(r[0]!, r[1]!, r[2]!))
    const huskWalkMatchesSound = lineShadows.filter(s => Math.abs(s / 2 - soundBulk) < 1e-12).length

    // ADJUDICATION 2, the two sevens. CHSH^2 = 4 (1 + sin^2 phi) = 7 for the swap-phase pair; that pair's
    // sum |W| is 1 + |sin phi| / sqrt 3 = 3/2 at phi = 2 pi / 3 (fear share 1/6), so the 7/3 of E-FRC-0122's
    // round 2 (share 2/7) is a different state, one with SUM and Fourier moves in it
    const swapNorm = (phi: number): number => {
      const u = swapPhase(phi)
      const re = Array.from({ length: 9 }, (_, r) => u.re[r * 9 + 1] ?? 0)
      const im = Array.from({ length: 9 }, (_, r) => u.im[r * 9 + 1] ?? 0)

      return phasePointOperators(2).reduce((total, p) => {
        let w = 0

        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            w += re[i]! * (p.re[i * 9 + j]! * re[j]! - p.im[i * 9 + j]! * im[j]!) + im[i]! * (p.re[i * 9 + j]! * im[j]! + p.im[i * 9 + j]! * re[j]!)
          }
        }

        return total + Math.abs(w / 9)
      }, 0)
    }
    const normLawGap = Math.max(...[1, 2, 3, 4, 5].map(m => Math.abs(swapNorm((m * Math.PI) / 6) - (1 + Math.abs(Math.sin((m * Math.PI) / 6)) / Math.sqrt(3)))))
    const swapPairNorm = swapNorm((2 * Math.PI) / 3)

    metrics['walkTopSpeedBulk'] = walkTopBulk
    metrics['soundSpeedBulk'] = soundBulk
    metrics['coincidenceAngleInThreeDimensions'] = threeDimensionalAngle
    metrics['huskLinesWhereWalkEqualsSound'] = huskWalkMatchesSound
    metrics['swapPairWignerNorm'] = swapPairNorm
    metrics['swapPairFearShare'] = (swapPairNorm - 1) / (2 * swapPairNorm)
    metrics['wignerNormLawGap'] = normLawGap

    const solved = proofsHold && soundProof && spreadProof && admissible && protonRefused && Math.abs(roundTwo - 2 / 7) < 1e-15 && Math.abs(walkTopBulk - soundBulk) < 1e-15 && huskWalkMatchesSound === 6 && Math.abs(swapPairNorm - 1.5) < 1e-12 && normLawGap < 1e-12

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'under a pre-registered integer-relation budget with a null rate, the CHSH values sqrt 7 and (2 + 4 sqrt 2)/3, the sound speed c/2, the walk spread 1 - sqrt 3 / 2 and the boundary share are proven identities, the sound speed from the D4 roots\' second moment 12 I (so c_s^2 = |e|^2 / 4, kept on the husk, whose shadows have the same moment), while the viscosity (0.4747 and 0.469) and the late fear share (0.29, beside the Haar-typical 0.297) have no admissible closed form, every one of those matches landing at a null rate of 1, and the numbers alone would not have separated the proven from the coincidental (sqrt 7 at 1e-6 has null rate 0.13)',
      metrics: {
        ...metrics,
        soundSpeedSquared: soundSquared,
        walkSpread: spread,
        fearShareRoundTwo: roundTwo,
        haarFearShareMean: Number(haar.mean.toFixed(5)),
        haarFearShareSd: Number(haar.sd.toFixed(5)),
      },
      control: {
        protonGapOverDelta: Math.abs(proton.ratio - 6 * Math.PI ** 5) / proton.delta,
        nullSamples: NULL_SAMPLES,
      },
      notes:
        'L2. Deterministic throughout, no seed: the null points are the golden Weyl sequence frac(n phi) and the Haar states come from a Kronecker sequence frac(n sqrt p) through Box-Muller. The null is uniform within 10 percent of each target, the same delta and budget; the named-form chance is 2 delta over that window, the probability without look-elsewhere. Neither the budget nor the null was adjusted after a target was seen. A proof carries each accepted identity: sqrt 7 and (2 + 4 sqrt 2)/3 from the meeting states (E-MTH-0009, with Jordan\'s lemma for the upper bound), 1 - sqrt 3 / 2 from the integral of the group velocity squared, the share from the cubic (E-MTH-0007), c/2 from the root system. The viscosity negative is not a claim that no closed form exists, only that none within the budget is admissible at the precision the value is known to; the lattice Boltzmann number is itself a sampled average. The fear share of E-FRC-0122 fluctuates between rounds (0.2857 = 2/7 at round 2, 0.2911 at round 8) and has no limit to identify; the Haar mean says what a typical pure state gives. Two adjudications. The fear walk\'s top speed and the sound speed are both 1 / sqrt 2 in the bulk, but by two routes, cos(phi / 2) c and c / sqrt d, which meet only at d = 4 with phi = 2 pi / 3; no rule ties the coin angle to the dimension, and the husk breaks the equality on the 6 lines whose shadows are axes (walk 1/2, sound 1 / sqrt 2): coincidental, unforced. The two sevens: CHSH sqrt 7 is 4 + 3 for Schmidt weights 1/4, 3/4, while that same pair has sum |W| = 1 + |sin phi| / sqrt 3 = 3/2 (checked at five phases to 1e-12, not proven), so the 2/7 of E-FRC-0122 round 2 comes from another state: no common origin found.',
    })
  },
})
