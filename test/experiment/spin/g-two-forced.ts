// What forces the g = 2 schedule of the spinor token, and what does not (E-SPN-0079). (The token is a STAND-IN:
// code/rule/spinor-token. Its spin and charge are put in.)
//
// The ledger audit found g = 2 CHOSEN: E-MTR-0017 read it on a hand-picked 16-beat nested palindrome, one x and one y
// stream read g = 4 (E-MTR-0016), and E-SPN-0065 refuted "every palindrome has a saddle". This file asks which
// principle, if any, forces the schedule, and counts the alternatives, EXACTLY.
//
// THE EXACT READING (code/measure/g-two-census). At the model coin C^3 = 1, so a stream's coin frame is its beat mod 3
// and the second-order band of any schedule reduces to four integers per plane, a, b, c, z, with g^2 = 4 z^2 / (4ab -
// 3c^2) and a bowl when 4ab > 3c^2. The band splits as (kappa / 2) w^dagger w - (i / 2) T: the Pauli square of the
// first-order generator w = sum_a Z_a sigma_a pi_a in the coin frame, which alone gives g = 2, and the ORDERING term T,
// the commutators of the copies taken in order, which is the lattice's own Pauli (anomalous moment) term.
//
// THREE THEOREMS, each checked here.
// A (the Dirac square root). If the streams with their frames read the same backward (a labeled palindrome, Strang's
//   symmetric splitting with the frames as part of the letters), every ordered pair has a mirror of equal frame
//   difference and opposite order, so T = 0, the band is (kappa / 2) w^dagger w, rank one, and g = 2 in every plane that
//   is a bowl.
// B (covariance forbids mass). A husk turn acts on a schedule by permuting its axis letters (the spin turns along). A
//   schedule covariant under a 3-fold turn maps to itself up to rotation and reflection, the dihedral group D_N, whose
//   elements of order 3 are rotations by N / 3; so N = 0 mod 3, C^N = 1, and the token is massless. No massive
//   schedule is covariant, so the husk's W(F4) cannot select one: a massive token is isotropic only at second order,
//   never as a symmetry of its period.
// C (CPT is time reversal here). C (i tau_y sigma_y K) and P (tau_x) hold beat by beat, so CPT of the period is its
//   time reversal i sigma_y K, which takes each Dirac beat to its inverse: the period is CPT symmetric exactly when its
//   word reversed is one of its rotations (depth pairs reversing with up and down exchanged).
//
// THE CENSUS. Every schedule of at most 16 beats over {x, y, z, depth filler}, massive (N != 0 mod 3), with an even
// number of fillers (the depth pairs that return every column), first beat an x stream (every period is a rotation and
// relabeling of one of these): 1,158,959,429 words, reduced to classes up to rotation and the husk's axis
// permutations. A class is kept when it is ISOTROPIC: equal kinetic coefficients on the three axes, no anisotropic term
// in any plane, and one g for a field along any axis.
//
// DISCLOSED: probes (tmp/base-probe-census.ts, tmp/base-probe-words.ts, tmp/base-probe-words16.ts; logs
// tmp/base-census7.log, base-census8.log, base-words16.log) ran the stream census to 8 streams and the word census to 16
// beats BEFORE these gates were written, to learn what the census holds. The gates below restate the probe's findings
// as the claims this file makes, and the notes say which were expected before the probe. Theorems A, B and C were
// derived before any probe.
//
// Gates, fixed before this file's first run:
// G1 calibration: the integer reading equals the float second-order perturbation theory of code/measure/token-g-
//    analytic on every plane of the three named words and 3,000 golden Weyl words: 0 bowl mismatches, g within 1e-9
// G2 theorem B: over every word of up to 9 beats with a stream, every word covariant under the 3-fold turn has N = 0
//    mod 3 (0 massive), and covariant words exist at N = 3, 6, 9
// G3 theorem A: over every stream sequence of up to 7 streams (both mass signs), every labeled palindrome has T = 0 in
//    all three planes, and every one of its bowl planes has g = 2 exactly (integer identity); at least one palindrome
// G4 the census to 16 beats:
//    (a) isotropy does not fix g: the isotropic classes carry at least two distinct g
//    (b) CPT with isotropy and the shortest period does not fix g: at the shortest length holding a time-symmetric
//        isotropic class, time-symmetric classes with g = 2 and with g != 2 both exist
//    (c) the Dirac square root fixes g: every isotropic class with T = 0 (at some origin) has g = 2
//    (d) the Dirac square root with CPT and the shortest period fixes the SCHEDULE: at the shortest length holding an
//        isotropic, ordering-free, time-symmetric class there is exactly one, and it is the nested palindrome's class
// Status: pass if G1 to G4 hold, fail otherwise.
//
// Depth L2: exact integer algebra and exhaustive enumeration over a stand-in's schedules; the structural statements are
// theorems A to C, the census is the count.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { covarianceCensus, gSquared, isBowl, PLANES, readWord, scheduleCensus, turnClass, wordCensus } from '@/code/measure/g-two-census'
import { tokenG, type TokenStep } from '@/code/measure/token-g-analytic'
import { GOLDEN } from '@/code/tool/weyl'

const NESTED = 'z00x00y00y00x00z'
const LETTERS = ['x', 'y', 'z', '0']
const CALIBRATION_WORDS = 3000

function planeSchedule(word: string, plane: readonly [number, number]): TokenStep[] {
  return Array.from(word, ch => ({ axis: ch === 'xyz'[plane[0]] ? 'x' : ch === 'xyz'[plane[1]] ? 'y' : 'none' }))
}

function calibrate(): { planes: number; bowlMismatches: number; worstG: number } {
  const words = ['xyz00', 'xyyx', NESTED]

  for (let i = 1; i <= CALIBRATION_WORDS; i++) {
    const length = 4 + Math.floor(((i * GOLDEN) % 1) * 13)
    let w = ''

    for (let k = 0; k < length; k++) {
      w += LETTERS[Math.floor((((i * 131 + k * 17 + 1) * GOLDEN) % 1) * 4)]
    }

    words.push(w)
  }

  let planes = 0
  let bowlMismatches = 0
  let worstG = 0

  for (const word of words) {
    const reading = readWord(word)

    if (reading.eps === 0) {
      continue
    }

    PLANES.forEach((plane, i) => {
      const v = reading.planes[i]!
      const float = tokenG({ schedule: planeSchedule(word, plane), mu: Math.PI / 3 })
      const exact = gSquared(v)

      planes++

      if (float.bowl !== isBowl(v)) {
        bowlMismatches++
      } else if (exact) {
        worstG = Math.max(worstG, Math.abs(Math.sqrt(exact[0] / exact[1]) - float.g))
      }
    })
  }

  return { planes, bowlMismatches, worstG }
}

export default experiment({
  id: 'spin/g-two-forced',
  code: 'E-SPN-0079',
  title:
    "what forces the spinor token's g = 2, a STAND-IN: exactly, in Eisenstein integers, over every schedule of up to 16 beats, neither the husk's turns (a covariant schedule is massless), nor isotropy, nor CPT with the shortest period fixes g (isotropic classes read g = 4, 0, 4/3, 2, 1, the shortest g = 4 at 7 beats); the Dirac square root, no ordering term T = 0, forces g = 2 by theorem, and with CPT and the shortest period it forces the schedule: the 16-beat nested palindrome, the one class",
  category: 'spin',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // G1
    const cal = calibrate()
    const g1 = cal.planes > 0 && cal.bowlMismatches === 0 && cal.worstG < 1e-9

    // G2
    const covariance = covarianceCensus(9)
    const covariantAt = (n: number): number => covariance.find(c => c.length === n)?.covariantThreeFold ?? 0
    const g2 = covariance.every(c => c.covariantMassive === 0) && covariantAt(3) > 0 && covariantAt(6) > 0 && covariantAt(9) > 0

    // G3
    const streams = scheduleCensus(7)
    const g3 = streams.labeledPalindromes > 0 && streams.palindromeOrderingViolations === 0 && streams.palindromeNonDiracBowls === 0

    // G4
    const words = wordCensus(16)
    const classes = words.classes
    const distinctG = new Set(classes.map(k => k.g2))
    const symmetric = classes.filter(k => k.timeSymmetric)
    const shortestSymmetric = Math.min(...symmetric.map(k => k.length))
    const symmetricAtShortest = symmetric.filter(k => k.length === shortestSymmetric)
    const a = distinctG.size >= 2
    const b = symmetricAtShortest.some(k => k.g2 === '4/1') && symmetricAtShortest.some(k => k.g2 !== '4/1')
    const orderingFree = classes.filter(k => k.orderingFree)
    const c = orderingFree.length > 0 && orderingFree.every(k => k.g2 === '4/1')
    const forced = classes.filter(k => k.orderingFree && k.timeSymmetric)
    const shortestForced = Math.min(...forced.map(k => k.length))
    const forcedAtShortest = forced.filter(k => k.length === shortestForced)
    const nestedClass = turnClass(NESTED)
    const d = forcedAtShortest.length === 1 && forcedAtShortest[0]?.word === nestedClass
    const g4 = a && b && c && d
    const ok = g1 && g2 && g3 && g4

    const byLength = (predicate: (k: (typeof classes)[number]) => boolean): string =>
      [...new Set(classes.filter(predicate).map(k => k.length))]
        .sort((x, y) => x - y)
        .map(n => `${n}: ${classes.filter(k => predicate(k) && k.length === n).length}`)
        .join(', ')
    const shortestIsotropic = Math.min(...classes.map(k => k.length))
    const gAt = (n: number): string => [...new Set(classes.filter(k => k.length === n).map(k => k.g2))].join(' ')
    const nested = readWord(NESTED)
    const metrics: Record<string, number> = {
      gateG1: g1 ? 1 : 0,
      gateG2: g2 ? 1 : 0,
      gateG3: g3 ? 1 : 0,
      gateG4: g4 ? 1 : 0,
      gateG4a: a ? 1 : 0,
      gateG4b: b ? 1 : 0,
      gateG4c: c ? 1 : 0,
      gateG4d: d ? 1 : 0,
      calibrationPlanes: cal.planes,
      calibrationBowlMismatches: cal.bowlMismatches,
      calibrationWorstG: cal.worstG,
      covariantWordsN3: covariantAt(3),
      covariantWordsN6: covariantAt(6),
      covariantWordsN9: covariantAt(9),
      covariantMassiveWords: covariance.reduce((t, x) => t + x.covariantMassive, 0),
      streamSequences: streams.sequences,
      labeledPalindromes: streams.labeledPalindromes,
      palindromeOrderingViolations: streams.palindromeOrderingViolations,
      palindromeBowlPlanes: streams.palindromeBowlPlanes,
      palindromeNonDiracBowls: streams.palindromeNonDiracBowls,
      wordsExamined: words.examined,
      wordsMassiveEvenFillers: words.massiveEven,
      isotropicWords: words.isotropic,
      isotropicClasses: classes.length,
      distinctIsotropicG: distinctG.size,
      shortestIsotropicLength: shortestIsotropic,
      shortestTimeSymmetricLength: shortestSymmetric,
      timeSymmetricClassesAtShortest: symmetricAtShortest.length,
      timeSymmetricDiracAtShortest: symmetricAtShortest.filter(k => k.g2 === '4/1').length,
      timeSymmetricNonDiracAtShortest: symmetricAtShortest.filter(k => k.g2 !== '4/1').length,
      orderingFreeClasses: orderingFree.length,
      shortestOrderingFreeLength: Math.min(...orderingFree.map(k => k.length)),
      orderingFreeClassesAtShortest: orderingFree.filter(k => k.length === Math.min(...orderingFree.map(x => x.length))).length,
      forcedShortestLength: shortestForced,
      forcedClassesAtShortest: forcedAtShortest.length,
      nestedA: nested.planes[0]?.a ?? NaN,
      nestedZ: nested.planes[0]?.z ?? NaN,
    }

    for (const g of [...distinctG].sort()) {
      const key = g.replace('/', 'over')
      const set = classes.filter(k => k.g2 === g)

      metrics[`isotropicG2_${key}_classes`] = set.length
      metrics[`isotropicG2_${key}_shortest`] = Math.min(...set.map(k => k.length))
      metrics[`isotropicG2_${key}_timeSymmetric`] = set.filter(k => k.timeSymmetric).length
      metrics[`isotropicG2_${key}_orderingFree`] = set.filter(k => k.orderingFree).length
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the integer reading equals the float perturbation theory on ${cal.planes} planes (worst ${cal.worstG.toExponential(1)}, ${cal.bowlMismatches} bowl mismatches); covariance forbids mass: ${metrics['covariantMassiveWords']} of ${covariantAt(3) + covariantAt(6) + covariantAt(9)} turn-covariant words up to 9 beats are massive; every one of ${streams.labeledPalindromes} labeled palindromes has T = 0 and all ${streams.palindromeBowlPlanes} of their bowl planes g = 2; over ${words.examined} words to 16 beats the isotropic classes (by length ${byLength(() => true)}) read g^2 in {${[...distinctG].join(', ')}}, the shortest at ${shortestIsotropic} beats with g^2 ${gAt(shortestIsotropic)}; CPT (time symmetry) first holds at ${shortestSymmetric} beats, where ${symmetricAtShortest.filter(k => k.g2 === '4/1').length} classes read g = 2 and ${symmetricAtShortest.filter(k => k.g2 !== '4/1').length} do not; all ${orderingFree.length} ordering-free isotropic classes read g = 2 (${byLength(k => k.orderingFree)}), and the ordering-free time-symmetric ones first appear at ${shortestForced} beats as ${forcedAtShortest.length} class: ${forcedAtShortest.map(k => k.word).join(', ')} (the nested palindrome ${nestedClass})`,
      metrics,
      control: {
        tokenA: readWord('xyz00').planes[0]?.a ?? NaN,
        tokenZ: readWord('xyz00').planes[0]?.z ?? NaN,
        xyyxZ: readWord('xyyx').planes[0]?.z ?? NaN,
      },
      notes:
        "L2, STAND-IN, exact integers, exhaustive, deterministic. ANSWER: no schedule is forced by the symmetries the husk and the model already have. The husk's turns cannot select a massive schedule (theorem B: a covariant period has N = 0 mod 3 and C^N = 1). Isotropy does not fix g: the shortest isotropic token is 7 beats with g = 4, and isotropic classes read g^2 = 16, 0, 16/9, 4 and 1 within 16 beats. CPT (which here is the period's time reversal, theorem C) with isotropy and the shortest period does not fix it either: at 14 beats time-symmetric classes read both g = 2 and g = 4. The MINIMAL EXTRA PRINCIPLE is the Dirac square root, T = 0: the token's second-order band is the square of its first-order step, with no lattice Pauli term from the order of the copies (theorem A, Strang's symmetric splitting in the coin frame). It is the lattice form of minimal coupling, the same principle that gives g = 2 in Dirac's equation, where a Pauli term is allowed by symmetry and excluded only by that choice. With it g = 2 is a theorem on every schedule; with it AND CPT AND the shortest period the schedule is unique: the 16-beat nested palindrome, up to the six axis relabelings, which is what E-MTR-0017 chose. So the choice is now one principle, stated, not a schedule picked. Before the probe the expectation was that isotropy and CPT might force g = 2; the census refuted both (G4a, G4b are those refutations, recorded as claims). Not shown: that the knit's own 24-beat turn schedule satisfies T = 0; the token is still a stand-in whose spin and charge are put in. FIRST RUN 2026-09-26 (tmp/base-spn79.log, 110 s): PASS, every gate. 2,129 isotropic classes in 1,158,959,429 words; g = 4 at 7 beats is the shortest isotropic token; 11 time-symmetric classes at 14 beats, 9 with g = 2 and 2 with g = 4; 87 ordering-free classes, all g = 2 (6 at 14 beats, none time symmetric, 81 at 16); exactly one ordering-free time-symmetric class at the shortest length, the nested palindrome.",
    })
  },
})
