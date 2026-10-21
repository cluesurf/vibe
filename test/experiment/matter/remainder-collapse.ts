// A CONTINUUM-LIMIT COLLAPSE OF THE REGISTER PAIR'S REMAINDER (E-MTR-0028, OPEN-MOT-01). On the candidate rule with
// the register, with the light's contact well removed, the light pair's inertia over energy R_full stands above
// E-SPN-0209's corrected static reference (the member's exact band over the level's momentum density, plus the Darwin
// exchange) by a remainder r. The reading after E-SPN-0211 is two lattice artifacts of the static engine, one growing
// as the member gets lighter at fixed a_B and one growing with the member's own lattice inertia tan m / m - 1. If both
// are lattice artifacts, r must collapse onto a form whose continuum limit (m -> 0, a_B -> infinity at fixed m a_B,
// which holds the pair's internal speed fixed) is 0. This file fits such a form on recorded reads and predicts a read
// that has not landed.
//
// THE RECORDED SOFTENED READS (code/measure/register-track, the axis read, code/measure/contact-core softenContact):
//   1  m 0.427029 (ringUnit(-5, 1)) at a_B 8   E-SPN-0206   R_full 1.2236985  clean (overlap 0.638 against 0.246, ratio 3.975)
//   2  m 0.427029 at a_B 12                    E-SPN-0208   R_full 1.1729882  clean (0.653 against 0.271, ratio 3.987)
//   3  m 0.473807 (ringUnit(-8, 3)) at a_B 8   E-SPN-0211   R_full 1.2919034  clean (0.613 against 0.196, ratio 3.904)
//   4  m 0.283682 (ringUnit(-7, 2)) at a_B 8   E-SPN-0211   R_full 1.5499846  NOT clean (ratio 3.855 at K 0.02)
//   5  m 0.283682 at a_B 12                    E-SPN-0212   running when this header was written, not read
// Each remainder is recomputed here from the recorded level energy E and Darwin overlap S by code/measure/pair-mass-read
// correctedReference, so a reference is never copied in. Clean is E-SPN-0211's rule: overlap at least 0.2 and twice
// the next line's, and the K ratio within 0.1 of 4.
//
// THE FORM (code/measure/remainder-collapse): r = C + B (tan m / m - 1) / a_B. The second term is the member's lattice
// inertia excess times the inverse Bohr radius: at fixed X = m a_B it is about X^2 / (3 a_B^3), so it vanishes in the
// continuum limit and C is the continuum remainder. HOW IT WAS CHOSEN, DISCLOSED: every two-artifact form with a light
// piece A X^-p / a_B^k and a mass piece B (tan m / m - 1) / a_B^j (p 0 to 4, k 1 to 3, j -1 to 2) was solved on the
// three clean points before this header was written. With j = 0 every one needs C near -0.15, and with j = 1 every one
// gives C within 0.016 of 0 but a light piece with the WRONG sign (A < 0), so the clean points hold no light piece at
// all, and the two-parameter form above is what they support. The light piece is carried by point 4 alone, whose K read
// is not clean. So the collapse stands or falls on whether the light piece is a read or lattice artifact that is gone
// at point 5, and point 5 is the test: it has the same X as point 1 (3.404 against 3.416, the same internal speed) with
// a member a third lighter.
//
// GATES, fixed before point 5 was read:
//   T  THE TRAINING FIT on points 1, 2, 3 (one spare point): recorded below by the run, C_train and B
//   H  THE BLIND POINT: point 5's remainder within 0.02 of the training fit's prediction, on a clean read. Point 4 is a
//      held-out point too, but it was seen before the form was chosen and its read is not clean, so it is reported and
//      not gated
//   K  THE CONTINUUM: the form refitted on every clean point (1, 2, 3, and 5 if clean) gives |C| <= 0.02
//   Verdict: pass if H and K; partial if not pass but |C| <= 2 sigma_C of the final fit, with that fit's residual rms at
//   most 0.02 (so a gross miss cannot buy consistency by widening sigma); fail otherwise. If point 5 is not clean, the
//   final fit is the training fit.
// PREDICTED (from T, written before point 5 landed): C_train -0.0020 +- 0.0183, B 18.39, so r(0.2837, a_B 12) = 0.0405,
// H's band [0.0205, 0.0605], and R_full at point 5 = its own corrected reference + 0.0405. For point 4 the form gives
// 0.0617 against the recorded 0.533. E-SPN-0212's own prediction for point 5, made on a different argument (the
// whole a_B 8 remainder carried by tan m / m - 1 at fixed X), is 0.060.
//
// FIRST RUN (2026-10-20, after point 5 landed at 20:28; tmp/mtr-collapse-train.log before it, tmp/mtr-collapse-run1.log
// after): PASS. No gate moved.
//  - T: C_train -0.0020 +- 0.0183, B 18.39, the three clean points fitted to 0.0062, 0.0027 and 0.0035.
//  - H holds: point 5 is clean (overlap 0.684 against 0.253, ratio 3.989) and reads R_full 1.0785 against its corrected
//    reference 1.0244, a remainder of 0.0541 against the predicted 0.0405, a miss of 0.0136 inside the 0.02 band.
//    E-SPN-0212's own prediction (0.060) also lands inside it, so this point does not choose between the two arguments.
//  - K holds: refitted on the four clean points, C = 0.0120 +- 0.0086 (rms 0.0051), within 0.02 of 0, but 1.4 sigma
//    above it, so a small positive continuum remainder is not excluded at this precision.
//  - At the same X (3.404 against 3.416), the remainder falls from 0.143 at a_B 8 to 0.054 at a_B 12 when the member is
//    a third lighter: the pair's own physics held fixed, the remainder shrank 2.6 times with the lattice, which is what a
//    lattice artifact does and what a missing continuum term would not do.
//  - Point 4 (seen, not clean) reads 0.533 against the form's 0.062. Its light piece is gone at a_B 12 (0.054), so it
//    was either the unclean K read or a light-member artifact that falls faster than 1 / a_B (by 10 from a_B 8 to 12).
// MEANING. On the softened count the whole remainder over the static-plus-Darwin reference is carried, to 0.014 on a
// blind point, by the member's lattice inertia excess times 1 / a_B, a term that vanishes in the continuum limit at fixed
// m a_B, and the extrapolated continuum remainder is 0.012 +- 0.009. The caveats: four clean points and two parameters,
// the form chosen on three of them, and the contact well's own part (E-SPN-0208, falling as a_B^-3.4) is outside this
// fit, which is of the softened count only.
//
// Depth L2 (an analysis of reads of a two-body quantum walk on the husk quotient; the softened count is a control, and
// the reference formula is the comparison). DETERMINISM: no random numbers, recorded reads only.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { correctedReference } from '@/code/measure/pair-mass-read'
import { setupFor } from '@/code/measure/register-track'
import {
  fitRemainderCollapse,
  predictRemainder,
  type CollapsePoint,
} from '@/code/measure/remainder-collapse'

type RecordedRead = {
  name: string
  unit: readonly [number, number]
  aB: number
  Rfull: number
  E: number
  darwinS: number
  overlap: number
  next: number
  ratio: number
  role: 'train' | 'seen' | 'blind'
}

// the recorded reads, full precision from their saved runs
const READS: readonly RecordedRead[] = [
  {
    name: 'm0427a8',
    unit: [-5, 1],
    aB: 8,
    Rfull: 1.2236985226452484,
    E: 1.676673975509106,
    darwinS: 0.9953769317457825,
    overlap: 0.6382514247428467,
    next: 0.24622363044455356,
    ratio: 3.974728223045248,
    role: 'train',
  },
  {
    name: 'm0427a12',
    unit: [-5, 1],
    aB: 12,
    Rfull: 1.172988158103087,
    E: 1.6959015115017095,
    darwinS: 0.9977735605422176,
    overlap: 0.6531905887376364,
    next: 0.2712839155805365,
    ratio: 3.9871948087568785,
    role: 'train',
  },
  {
    name: 'm0474a8',
    unit: [-8, 3],
    aB: 8,
    Rfull: 1.2919034324027578,
    E: 1.8677923628717206,
    darwinS: 0.9953769317457825,
    overlap: 0.6130741155861017,
    next: 0.1964877352759551,
    ratio: 3.9037017008779267,
    role: 'train',
  },
  {
    name: 'm0284a8',
    unit: [-7, 2],
    aB: 8,
    Rfull: 1.5499845914375134,
    E: 1.0842040877094554,
    darwinS: 0.9953769317457825,
    overlap: 0.47572580881633064,
    next: 0.21283459017848785,
    ratio: 3.854637419439117,
    role: 'seen',
  },
  // E-SPN-0212's read (tmp/spn-light-m0284-a12.json), added after the prediction above was written
  {
    name: 'm0284a12',
    unit: [-7, 2],
    aB: 12,
    Rfull: 1.0785232103074023,
    E: 1.1141074420257853,
    darwinS: 0.9977735605422176,
    overlap: 0.6838837712968797,
    next: 0.25272745185192935,
    ratio: 3.989489758337509,
    role: 'blind',
  },
]

const IDENTITY = 0.2
const AMBIGUOUS = 2
const QUADRATIC = 0.1
const BAND = 0.02
const SPREAD = 2
const PREDICTED_BLIND = 0.0405

const flag = (b: boolean): number => (b ? 1 : 0)

const isClean = (r: RecordedRead): boolean =>
  r.overlap >= IDENTITY &&
  r.overlap >= AMBIGUOUS * r.next &&
  Math.abs(r.ratio - 4) <= QUADRATIC

export function remainderOf(r: RecordedRead): CollapsePoint & { m: number } {
  const su = setupFor(r.unit)

  return {
    m: su.m,
    aB: r.aB,
    remainder: r.Rfull - correctedReference(su, r.E, r.darwinS),
  }
}

export function combineCollapse(reads: readonly RecordedRead[]): Verdict {
  const metrics: Record<string, number> = {}
  const points = reads.map(r => ({ read: r, point: remainderOf(r), clean: isClean(r) }))
  const train = points.filter(p => p.read.role === 'train' && p.clean).map(p => p.point)
  const fitTrain = fitRemainderCollapse(train)
  const blind = points.find(p => p.read.role === 'blind')
  const blindClean = blind !== undefined && blind.clean
  const final = fitRemainderCollapse(
    blindClean ? [...train, blind.point] : train,
  )
  const text: string[] = []

  for (const p of points) {
    const predicted = predictRemainder(fitTrain, p.point)

    metrics[`${p.read.name}_m`] = p.point.m
    metrics[`${p.read.name}_X`] = p.point.m * p.point.aB
    metrics[`${p.read.name}_remainder`] = p.point.remainder
    metrics[`${p.read.name}_predicted`] = predicted
    metrics[`${p.read.name}_clean`] = flag(p.clean)
    text.push(
      `${p.read.name} (${p.read.role}, X ${(p.point.m * p.point.aB).toFixed(3)}${p.clean ? '' : ', not clean'}): remainder ${p.point.remainder.toFixed(4)}, the training form ${predicted.toFixed(4)}`,
    )
  }

  const blindMiss = blind
    ? Math.abs(blind.point.remainder - predictRemainder(fitTrain, blind.point))
    : Number.NaN
  const H = blindClean && blindMiss <= BAND
  const K = Math.abs(final.continuum) <= BAND
  const consistent =
    Number.isFinite(final.continuumError) &&
    Math.abs(final.continuum) <= SPREAD * final.continuumError &&
    final.rms <= BAND
  const status = H && K ? 'pass' : consistent ? 'partial' : 'fail'

  metrics.trainContinuum = fitTrain.continuum
  metrics.trainContinuumError = fitTrain.continuumError
  metrics.trainSlope = fitTrain.slope
  metrics.trainRms = fitTrain.rms
  metrics.finalContinuum = final.continuum
  metrics.finalContinuumError = final.continuumError
  metrics.finalSlope = final.slope
  metrics.finalRms = final.rms
  metrics.blindMiss = blindMiss
  metrics.H = flag(H)
  metrics.K = flag(K)
  metrics.consistent = flag(consistent)

  return verdict({
    status,
    claim: `the remainder collapses onto C + B (tan m / m - 1) / a_B with C ${final.continuum.toFixed(4)} +- ${final.continuumError.toFixed(4)} and B ${final.slope.toFixed(2)} (training C ${fitTrain.continuum.toFixed(4)}), ${blind ? `the blind point m 0.284 at a_B 12 reading ${blind.point.remainder.toFixed(4)} against the predicted ${predictRemainder(fitTrain, blind.point).toFixed(4)}${blind.clean ? '' : ' (not clean)'}` : 'the blind point not yet read'}: H ${H}, K ${K}`,
    metrics,
    control: { predictedBlind: PREDICTED_BLIND },
    notes: `L2. ${text.join('. ')}.`,
  })
}

export default experiment({
  id: 'matter/remainder-collapse',
  code: 'E-MTR-0028',
  title:
    "explores whether the light register pair's remaining excess inertia is a lattice artifact that vanishes in the continuum limit: a collapse of the recorded remainders onto C + B (tan m / m - 1) / a_B: pass, the blind point m 0.284 at a_B 12 reads 0.054 against the predicted 0.041 and the continuum remainder is 0.012 +- 0.009",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return combineCollapse(READS)
  },
})
