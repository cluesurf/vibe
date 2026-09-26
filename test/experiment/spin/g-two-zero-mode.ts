// g measured on the forced schedule, and what the Dirac square root adds beyond second order (E-SPN-0080). (The
// token is a STAND-IN: code/rule/spinor-token.)
//
// E-SPN-0079 found that no symmetry the husk or the model has fixes the token's g, that the Dirac square root (no
// ordering term, T = 0) fixes g = 2 by theorem, and that with CPT and the shortest period it fixes the schedule: the
// 16-beat nested palindrome. Its census reads g in the second-order band only. Some schedules WITH an ordering term
// also read g = 2 there, because their T happens to be a Pauli square too (the 14-beat time-symmetric class
// 00x00yy00x00zz: its S and T parts each lie on z = -2a). If T = 0 is the real content of g = 2, the difference must
// show beyond second order, in the Landau ladders at finite field.
//
// PREDICTION, written before any run. On a T = 0 schedule the whole period in a field along z has the form C^N F with F
// a palindromic product of Dirac copies, F(pi) F(-pi) = 1, and E-MTR-0017 saw its Landau zero mode sit at the rest
// energy within 7.5e-9 at every field for x, y, z, x and the nested schedule, which second order does not promise. So:
// a T = 0 schedule's zero mode is EXACT at every field (g_lo = 2 at each side separately, no extrapolation), and a
// T != 0 schedule whose second-order g is 2 has a zero mode that misses at finite field and approaches 2 only as the
// field falls.
//
// Schedules (words over x, y, z and depth fillers, E-SPN-0079's notation; a filler is a depth beat, the coin alone in
// the plane read), each read in the planes (x, y), (y, z), (z, x) by relabeling the axes:
// - forced: the nested palindrome z00x00y00y00x00z (T = 0, time symmetric, 16 beats)
// - square root, shorter: the six 14-beat ordering-free isotropic classes of E-SPN-0079 (T = 0, not time symmetric)
// - accidental: two 14-beat isotropic classes with g = 2 at second order and T != 0: 00x00yy00x00zz (time symmetric)
//   and 0000x0x0yyxxzz (not)
// - control: the 7-beat isotropic class xxxxyxz, g = 4 at second order
// The witness is E-MTR-0015's Landau estimator (code/measure/token-g-landau), g_lo = 2 - 4 E_lo / omega, at L = 48, 96,
// 192 (field 2 pi / L), locked mode, the model coin.
//
// Gates, fixed before the first run:
// Z0 the words are what E-SPN-0079 says: each isotropic, with second-order g = 2 (g = 4 for the control), T = 0 in some
//    rotation exactly for the forced and square-root words and in none for the accidental ones
// Z1 g on the forced schedule: |g_lo - 2| < 1e-7 at every side and in every plane
// Z2 the square root is exact beyond second order: every T = 0 schedule reads |g_lo - 2| < 1e-7 at every side and plane
// Z3 the accidental g = 2 is second order only: each T != 0 g = 2 schedule reads |g_lo - 2| > 1e-5 at L = 48 in at least
//    one plane, and its worst miss at L = 192 is below its worst miss at L = 48
// Z4 control: the g = 4 schedule reads g_lo within 0.1 of 4 at L = 192 in every plane
// Status: pass if Z0 to Z4 hold, fail otherwise.
//
// Depth L2: a stand-in walk's exact Landau chain against an exact second-order census.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { PLANES, readWord, relabel, rotations, gSquared } from '@/code/measure/g-two-census'
import { bandSignOf, landauG } from '@/code/measure/token-g-landau'
import { type Step } from '@/code/rule/spinor-token'

const MODEL_COIN = Math.PI / 3
const SIDES = [48, 96, 192]
const EXACT = 1e-7
const MISS = 1e-5

const FORCED = 'z00x00y00y00x00z'
const SQUARE_ROOT = ['00x0y0xz0z0xyx', '00x0y0y0z0zyyx', '00x0yzy0y0z0yx', '00xy0z0y0yzy0x', '00xyx0z0zx0y0x', '00xyyz0z0y0y0x']
const ACCIDENTAL = ['00x00yy00x00zz', '0000x0x0yyxxzz']
const CONTROL = 'xxxxyxz'

// the word read in plane (a, b): a -> x, b -> y, the third axis -> z, a filler -> a depth beat
function planeSteps(word: string, plane: readonly [number, number]): Step[] {
  const image: [string, string, string] = ['', '', '']

  image[plane[0]] = 'x'
  image[plane[1]] = 'y'
  image[3 - plane[0] - plane[1]] = 'z'

  return Array.from(relabel(word, image), (ch): Step => (ch === '0' ? 'up' : (ch as Step)))
}

type Witness = { word: string; misses: number[][]; gLo: number[][] }

function witness(word: string): Witness {
  const gLo = PLANES.map(plane => {
    const schedule = planeSteps(word, plane)
    const sign = bandSignOf({ schedule, mode: 'locked', coinAngle: MODEL_COIN })

    return SIDES.map(side => landauG({ schedule, mode: 'locked', coinAngle: MODEL_COIN, side, sign }).gLo)
  })

  return { word, gLo, misses: gLo.map(row => row.map(g => Math.abs(g - 2))) }
}

function describe(word: string): { isotropic: boolean; g2: string; orderingFree: boolean } {
  const reading = readWord(word)
  const g2 = gSquared(reading.planes[0]!)

  return { isotropic: reading.isotropicG, g2: g2 ? `${g2[0]}/${g2[1]}` : 'saddle', orderingFree: rotations(word).some(w => readWord(w).orderingFree) }
}

export default experiment({
  id: 'spin/g-two-zero-mode',
  code: 'E-SPN-0080',
  title:
    "g on the forced schedule, and what the Dirac square root adds beyond second order, a STAND-IN: the 16-beat nested palindrome's Landau zero mode is measured at the rest energy at every field in all three planes, and the prediction that every ordering-free (T = 0) schedule's zero mode is exact while a T != 0 schedule with second-order g = 2 misses at finite field is tested on E-SPN-0079's 14-beat classes",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const descriptions = [FORCED, ...SQUARE_ROOT, ...ACCIDENTAL, CONTROL].map(w => ({ word: w, ...describe(w) }))
    const z0 =
      descriptions.every(d => d.isotropic) &&
      descriptions.filter(d => d.word !== CONTROL).every(d => d.g2 === '4/1') &&
      descriptions.find(d => d.word === CONTROL)?.g2 === '16/1' &&
      [FORCED, ...SQUARE_ROOT].every(w => descriptions.find(d => d.word === w)?.orderingFree) &&
      ACCIDENTAL.every(w => !descriptions.find(d => d.word === w)?.orderingFree)
    const forced = witness(FORCED)
    const roots = SQUARE_ROOT.map(witness)
    const accidental = ACCIDENTAL.map(witness)
    const control = witness(CONTROL)
    const worst = (w: Witness): number => Math.max(...w.misses.flat())
    const worstAt = (w: Witness, i: number): number => Math.max(...w.misses.map(row => row[i] ?? Infinity))
    const z1 = worst(forced) < EXACT
    const z2 = roots.every(w => worst(w) < EXACT)
    const z3 = accidental.every(w => worstAt(w, 0) > MISS && worstAt(w, 2) < worstAt(w, 0))
    const z4 = control.gLo.every(row => Math.abs((row[2] ?? 0) - 4) < 0.1)
    const ok = z0 && z1 && z2 && z3 && z4
    const metrics: Record<string, number> = {
      gateZ0: z0 ? 1 : 0,
      gateZ1: z1 ? 1 : 0,
      gateZ2: z2 ? 1 : 0,
      gateZ3: z3 ? 1 : 0,
      gateZ4: z4 ? 1 : 0,
      forcedWorstMiss: worst(forced),
      squareRootWorstMiss: Math.max(...roots.map(worst)),
    }

    const record = (tag: string, w: Witness): void => {
      w.gLo.forEach((row, p) => row.forEach((g, i) => (metrics[`${tag}_plane${p}_L${SIDES[i]}_gLo`] = g)))
    }

    record('forced', forced)
    roots.forEach((w, i) => (metrics[`squareRoot${i}_worstMiss`] = worst(w)))
    accidental.forEach((w, i) => record(`accidental${i}`, w))
    record('control', control)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the forced nested palindrome reads g_lo = 2 within ${worst(forced).toExponential(1)} at L = ${SIDES.join(', ')} in all three planes; the six 14-beat ordering-free classes within ${metrics['squareRootWorstMiss']?.toExponential(1)}; the two 14-beat classes with second-order g = 2 and T != 0 miss by ${accidental.map(w => `${worstAt(w, 0).toExponential(2)} at 48 and ${worstAt(w, 2).toExponential(2)} at 192`).join('; ')}; the g = 4 control reads ${control.gLo.map(row => (row[2] ?? NaN).toFixed(4)).join(', ')} at 192`,
      metrics,
      control: { controlWorstFrom4At192: Math.max(...control.gLo.map(row => Math.abs((row[2] ?? 0) - 4))) },
      notes:
        'L2, STAND-IN, deterministic. Read with E-SPN-0079: that file finds the principle, this one measures g on the schedule it selects and asks whether the principle means more than a second-order coincidence. FIRST RUN 2026-09-26 (tmp/base-spn80.log, 38 s): FAIL on Z3 and Z4. Z1 passes: g on the forced schedule is 2 within 7.5e-9 at every side and plane. Z2 passes: all six 14-beat ordering-free classes within 2.5e-8. Z3 FAILS, a wrong prediction: the two T != 0 classes with second-order g = 2 ALSO sit at the rest energy, within 7.5e-8 at L = 48 and 2e-12 at 192, so an exact zero mode does not single out T = 0; the Dirac square root is sufficient for g = 2, not necessary, and nothing beyond second order separates the two kinds here. Z4 FAILS as an instrument failure: the g = 4 control reads 4.06 in one plane but 32.46 in the other two at L = 192, where the estimator (E-MTR-0015\'s, tuned on schedules with fillers) takes a level outside the Landau ladder for a 7-beat word with no fillers; the control is uninformative in those planes, not evidence of g = 32.',
    })
  },
})
