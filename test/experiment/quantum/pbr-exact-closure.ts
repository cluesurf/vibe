// PBR'S READING FROM THE RULE'S OWN FEAR-BEAT WORDS, EXACT IN Q(w) (E-QTM-0191,
// OPEN-QTM-15). E-QTM-0170: no Clifford reading is a PBR reading, so in the model PBR can bite only through a fear
// beat. E-QTM-0180 (floats, zero test at 1e-12): no word of X, Z, S, F on each role and the like meeting U to length 7
// is a PBR reading for two roles prepared in |0> or |+>, the least largest leftover falling 0.111 to 0.021. This file
// asks the same question exactly, and over the whole closure of the rule's words by meetings, not only short words.
//
// THE SETUP. Two roles, each prepared independently in psi_0 = |0> or psi_1 = |+> (overlap 1/3, the only overlap two
// non-orthogonal stabilizer states have). A reading is a word of the rule's letters followed by the computational
// readout. It is a PBR reading when each of its 9 outcomes has chance exactly 0 on at least one of the four products.
// Two copies suffice for this overlap (PBR's bound 2^(1/n) - 1 <= tan(theta / 2): cos theta = 1/sqrt 3 gives
// tan(theta / 2) = 0.518 >= sqrt 2 - 1 at n = 2), so the multi-copy form is not needed.
//
// DERIVED BEFORE THE GATE RUN.
// 1. A READING EXISTS IN THE SMALLEST FIELD (code/measure/pbr-reading pbrTwoCopyReading): PBR's two-copy construction
//    solved for |0>, |+> gives four entangled outcomes A, B, C, D, one orthogonal to each product, inside the span of
//    the products; pairing each with a vector of equal norm from the span's complement makes every row norm 16. The
//    reading is 1/4 times an integer matrix, a real orthogonal matrix over Z[1/2]. So no field or denominator stands
//    in the way: the swap phase U itself has denominator 2. The question is only whether the rule's group reaches one.
// 2. THE CLOSURE REDUCES TO A FINITE SEARCH PER MEETING COUNT (code/measure/pbr-reading header): U commutes with
//    A (x) A and V with A (x) conj(A), so every word with m meetings is C M_m (I (x) B_(m-1)) ... M_1 (I (x) B_0), and
//    C counts only through its product stabilizer readout basis (4 x 4). m meetings: 16 (864)^m configurations,
//    meetings U, U^dag, V, V^dag. m <= 3 is every element of the rule's group with at most three meetings, at any
//    length. Layers before the last are stored with equal state tuples merged (up to a scalar per state and their
//    order); the last is streamed, every child read.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/qtm191-probe.ts: the two controls, the instrument checks and the closure to
// m = 1, to test the code (all gates held; m = 0 and m = 1 had no reading, best 8 of 9, least leftover 1/9 and 1/36;
// the pair {|0>, |+>} has an orbit of all 54 non-orthogonal stabilizer pairs). tmp/qtm191-size.ts: the distinct state
// tuples after 1 and 2 meetings, 216 and 181,062 (sizes only, no reading evaluated), which set m = 3 (156 million
// streamed tuples) as reachable. No number of m = 2, m = 3 or the word replay was seen before the gates were written.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: X, Z, S, sqrt 3 F, 2U, 2U^dag, 3V, 3V^dag and the 4 readout bases are exactly a unitary times a
//     positive integer; the local Clifford group has exactly 216 elements mod phases; each of the 216 lies in the
//     monomial coset of exactly one readout basis, 54 each; no overflow (the code throws past 2^52).
//  I2 THE REDUCTION: 2U and 2U^dag commute exactly with A (x) A, and 3V, 3V^dag with A (x) conj(A), for all 216 A.
//  C1 CONTROL, PBR's own qubit reading: PBR's basis for |0>, |+> of a qubit, embedded in |0>, |1> of each role and
//     completed by the five computational vectors outside, is exactly orthogonal and the same zero test excludes 9 of
//     9 on PBR's own preparations.
//  C2 CONTROL, PBR's two-copy reading for THESE states: rows exactly orthogonal, all of norm 16, 9 of 9 excluded on
//     the products of |0>, |+>, and 8 of its 9 rows entangled (Schmidt rank above 1; the ninth, 2 d (x) d, zeroes all
//     four products).
//  C3 CONTROL, the zero test says no where E-QTM-0170 says no: m = 0 (every local Clifford pair) has no reading.
//  H1 THE ROUTE: some configuration with m <= 3 meetings, or some word of E-QTM-0180's letters to length 7, is an
//     exact PBR reading.
//  P1 THE KILL: none is. Then read which outcome cannot be zeroed.
//  R  READ: per m, configurations, distinct tuples, readings, the most outcomes excluded, the exact least largest
//     leftover chance and a configuration with it; over the configurations excluding 8 of 9, the readout position
//     left and the preparation on which its chance is least; the exact word replay's readings and leftover by length
//     against E-QTM-0180's floats; the orbit of the pair {|0>, |+>} among the 54 non-orthogonal stabilizer pairs.
// VERDICT, fixed before the run: PASS when I1, I2, C1, C2, C3 and H1 hold; FAIL when I1, I2, C1, C2, C3 and P1 hold
//  (the route's kill, recorded); PARTIAL otherwise.
// WHAT THIS CAN AND CANNOT SHOW. Every group element with at most three meetings, and words to length 7 with up to
//  four; four or more meetings are not covered by the closure. A reading with an extra role (an ancilla) or a POVM is not
//  searched. The preparations are |0>, |+>; the read of the pair's orbit says whether another stabilizer pair could
//  change the answer (it cannot when the orbit is all 54, since C_0 is any local pair).
//
// FIRST RUN 2026-10-27 (8,071 s, log test/record/E-QTM-0191/gate-run-1.log): PASS, no gate moved, title written after
//  the run. I1, I2, C1, C2, C3 hold. H1 holds: m = 0 and m = 1 have no reading (best 8 of 9, least leftover 1/9,
//  1/36), m = 2 has 4 readings of 2,896,992 configurations, m = 3 has 1,352 of 2,503,001,088. The first is
//  U^dag (I (x) B_4) U (I (x) B_157) read in Z (x) FS: the like meeting, one link move on role 2, then the rule's
//  meeting w U^dag. Its outcomes zero |00> (3 outcomes), |0+> (5), |++> (3), and none zeroes |+0>, which PBR does not
//  need. Checked again on its own (tmp/qtm191-verify.ts, log verify-first-reading.log): the whole word as one exact
//  matrix is sqrt 3888 times a unitary, 9 of 9 outcomes excluded, 8 rows entangled, and the float chances from the
//  normalized gates sum to 1 within 4.4e-16 with the same zeros. The exact word replay of E-QTM-0180's letters to
//  length 7 finds none (its leftover 1/9, 1/9, 1/12, 1/16, 1/36, 1/36, 1/48 is E-QTM-0180's float curve exactly):
//  E-QTM-0180 skipped U U, so its words never hold U^dag = U^2 next to a link, and the reading needs U^dag.
//
// Depth L2: the rule's own letters, every group element to three meetings exactly, controls that pass the same test.
// DETERMINISM: exhaustive, fixed order, no random number. EXACT: integers in Z[w]; floats only rank leftovers, the
//  reported least leftover is recomputed as an exact fraction.

import {
  closureSearch,
  entangledRow,
  fourier3,
  inner,
  ket3,
  localCliffords,
  matConj,
  matEqual,
  matKron,
  matMul,
  matAdjoint,
  matVec,
  pbrQubitReading,
  pbrTwoCopyReading,
  phase3,
  productPreparations,
  readoutBases,
  readRows,
  reduceVec,
  ruleMeetings,
  scaledUnitary,
  shift3,
  clock3,
  vecNorm,
  wordSearch,
  type Mat,
  type Vec,
} from '@/code/measure/pbr-reading'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

const frac = (n: bigint, d: bigint): string => `${n}/${d}`

// the readout basis whose rows, up to phases and order, are C's rows: C R^dag is monomial
function cosetOf(c: Mat, bases: readonly Mat[]): number[] {
  const hits: number[] = []

  bases.forEach((r, i) => {
    const p = matMul(c, matAdjoint(r))
    let monomial = true

    for (let row = 0; row < 3; row++) {
      let nonzero = 0

      for (let col = 0; col < 3; col++) {
        if (p.e[2 * (3 * row + col)] !== 0 || p.e[2 * (3 * row + col) + 1] !== 0) {
          nonzero++
        }
      }

      if (nonzero !== 1) {
        monomial = false
      }
    }

    if (monomial) {
      hits.push(i)
    }
  })

  return hits
}

function orthogonalRows(rows: readonly Vec[]): { orthogonal: boolean; norms: number[] } {
  let orthogonal = true

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const z = inner(rows[i]!, rows[j]!)

      if (z[0] !== 0 || z[1] !== 0) {
        orthogonal = false
      }
    }
  }

  return { orthogonal, norms: rows.map(vecNorm) }
}

export function pbrExactClosureRun(input: { maxMeetings: number; wordLength: number }): Verdict {
  const started = Date.now()
  const cliffords = localCliffords()
  const bases = readoutBases()
  const meetings = ruleMeetings()

  // I1
  const letters: [string, Mat][] = [
    ['X', shift3()],
    ['Z', clock3()],
    ['S', phase3()],
    ['sqrt3 F', fourier3()],
    ...meetings.map(m => [m.name, m.m] as [string, Mat]),
    ...bases.map(b => [`readout ${b.name}`, b.m] as [string, Mat]),
  ]
  const lambdas = letters.map(([, m]) => scaledUnitary(m))
  const cosets = cliffords.map(c => cosetOf(c, bases.map(b => b.m)))
  const cosetSizes = bases.map((_, i) => cosets.filter(h => h.length === 1 && h[0] === i).length)
  const i1 =
    lambdas.every(l => l > 0) &&
    cliffords.length === 216 &&
    cosets.every(h => h.length === 1) &&
    cosetSizes.every(s => s === 54)

  // I2
  let commuting = 0
  let commuteChecks = 0

  for (const a of cliffords) {
    const same = matKron(a, a)
    const twisted = matKron(a, matConj(a))

    for (const m of meetings) {
      const g = m.name.startsWith('U') ? same : twisted

      commuteChecks++

      if (matEqual(matMul(g, m.m), matMul(m.m, g))) {
        commuting++
      }
    }
  }

  const i2 = commuting === commuteChecks

  // C1, C2
  const qubit = pbrQubitReading()
  const qubitOrth = orthogonalRows(qubit.rows)
  const qubitRead = readRows(qubit.rows, qubit.preparations)
  const c1 = qubitOrth.orthogonal && qubitRead.excluded === 9
  const two = pbrTwoCopyReading()
  const twoOrth = orthogonalRows(two.rows)
  const twoRead = readRows(two.rows, two.preparations)
  const twoEntangled = two.rows.filter(entangledRow).length
  const c2 =
    twoOrth.orthogonal &&
    twoOrth.norms.every(n => n === 16) &&
    twoRead.excluded === 9 &&
    twoEntangled === 8

  // the closure
  const preparations = productPreparations(ket3([1, 0, 0]), ket3([1, 1, 1]))
  const closure = closureSearch({
    preparations,
    maxMeetings: input.maxMeetings,
    meetings,
    locals: cliffords,
  })
  const closureSeconds = (Date.now() - started) / 1000
  const c3 = closure[0]!.readings === 0

  // the exact replay of E-QTM-0180's words
  const words = wordSearch(preparations, input.wordLength)
  const totalReadings = closure.reduce((s, r) => s + r.readings, 0) + words.readings
  const h1 = totalReadings > 0
  const p1 = totalReadings === 0

  // R: the orbit of the pair {|0>, |+>} among the non-orthogonal stabilizer pairs
  const zero = ket3([1, 0, 0])
  const plus = ket3([1, 1, 1])
  const one = (m: Mat, v: Vec): Vec => {
    const out = matVec(m, v)

    return reduceVec(out)
  }
  const keyOf = (v: Vec): string => Array.from(v).join(',')
  const states = new Map<string, Vec>()

  for (const c of cliffords) {
    const s = one(c, zero)

    states.set(keyOf(s), s)
  }

  const stateList = [...states.values()]
  let pairs = 0

  for (let i = 0; i < stateList.length; i++) {
    for (let j = i + 1; j < stateList.length; j++) {
      const z = inner(stateList[i]!, stateList[j]!)

      if (z[0] !== 0 || z[1] !== 0) {
        pairs++
      }
    }
  }

  const orbit = new Set<string>()

  for (const c of cliffords) {
    orbit.add([keyOf(one(c, zero)), keyOf(one(c, plus))].sort().join('|'))
  }

  const status =
    i1 && i2 && c1 && c2 && c3 && h1
      ? 'pass'
      : i1 && i2 && c1 && c2 && c3 && p1
        ? 'fail'
        : 'partial'
  const seconds = (Date.now() - started) / 1000
  const position = (j: number): string => `|${Math.floor(j / 3)}${j % 3}>`
  const closureText = closure
    .map(
      r =>
        `m = ${r.depth}: ${r.configurations} configurations${r.distinctTuples >= 0 ? ` (${r.distinctTuples} distinct state tuples)` : ''}, ${r.readings} readings, best ${r.bestExcluded} of 9 (${r.bestCount} configurations), least largest leftover ${frac(r.leastLeftoverNum, r.leastLeftoverDen)}`,
    )
    .join('; ')
  const best = closure[closure.length - 1]!
  const leftText = best.leftoverPositions
    .map((n, j) => (n > 0 ? `${position(j)} ${n}` : ''))
    .filter(Boolean)
    .join(', ')
  const prepNames = ['|00>', '|0+>', '|+0>', '|++>']
  const prepText = best.leftoverPreparationCounts
    .map((n, k) => `${prepNames[k]} ${n}`)
    .join(', ')
  const wordText = words.leftoverExact
    .slice(1)
    .map(([n, d]) => (d > 0n ? frac(n, d) : '-'))
    .join(', ')

  return verdict({
    status,
    claim: `${p1 ? "no element of the rule's group with at most " + input.maxMeetings + ' meetings, and no word of E-QTM-0180\'s letters to length ' + input.wordLength + ', is an exact PBR reading' : "the rule's group holds an exact PBR reading"} for two roles prepared in |0> or |+> (overlap 1/3), checked exactly in Z[w]: ${closureText}; the exact word replay: ${words.words} words, ${words.readings} readings, best ${words.bestExcluded} of 9, least largest leftover by length ${wordText}. At m = ${best.depth}, of the configurations excluding 8 of 9 the outcome left is ${leftText}, its least chance on ${prepText}. Controls: PBR's qubit reading excludes ${qubitRead.excluded} of 9, PBR's two-copy reading for these states (a real orthogonal matrix over Z[1/2], rows of norm 16, ${twoEntangled} entangled) excludes ${twoRead.excluded} of 9, and every local Clifford pair excludes at most ${closure[0]!.bestExcluded} of 9`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_I2: i2 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_C2: c2 ? 1 : 0,
      gate_C3: c3 ? 1 : 0,
      gate_H1: h1 ? 1 : 0,
      gate_P1: p1 ? 1 : 0,
      cliffords: cliffords.length,
      commuting,
      commuteChecks,
      ...Object.fromEntries(
        closure.flatMap(r => [
          [`m${r.depth}_configurations`, r.configurations],
          [`m${r.depth}_distinct`, r.distinctTuples],
          [`m${r.depth}_readings`, r.readings],
          [`m${r.depth}_bestExcluded`, r.bestExcluded],
          [`m${r.depth}_bestCount`, r.bestCount],
          [`m${r.depth}_leastLeftover`, Number(r.leastLeftoverNum) / Number(r.leastLeftoverDen)],
        ]),
      ),
      words: words.words,
      wordReadings: words.readings,
      wordBestExcluded: words.bestExcluded,
      ...Object.fromEntries(
        words.leftoverByLength.map((v, l) => [`word_eps_L${l}`, Number.isFinite(v) ? v : -1]),
      ),
      stabilizerStates: stateList.length,
      nonOrthogonalPairs: pairs,
      pairOrbit: orbit.size,
      closureSeconds,
      seconds,
    },
    control: {
      pbrQubitExcluded: qubitRead.excluded,
      pbrTwoCopyExcluded: twoRead.excluded,
      pbrTwoCopyEntangled: twoEntangled,
      cliffordBestExcluded: closure[0]!.bestExcluded,
    },
    notes: `L2. Gates I1 ${i1} (lambdas ${lambdas.join(', ')}; coset sizes ${cosetSizes.join(', ')}), I2 ${i2} (${commuting} of ${commuteChecks}), C1 ${c1}, C2 ${c2} (norms ${twoOrth.norms.join(', ')}), C3 ${c3}, H1 ${h1}, P1 ${p1}. Exact least leftovers: ${closure.map(r => `m ${r.depth} ${frac(r.leastLeftoverNum, r.leastLeftoverDen)} at ${r.leastLeftover ? `${r.leastLeftover.meetings.join(' ') || 'no meeting'}, B ${r.leastLeftover.locals.join(' ')}, readout ${r.leastLeftover.bases.join(' x ')}, outcome ${position(r.leastLeftover.outcome)}` : '-'}`).join('; ')}. First reading: ${closure.find(r => r.firstReading)?.firstReading ? JSON.stringify(closure.find(r => r.firstReading)!.firstReading) : words.firstReading || 'none'}. Pair orbit ${orbit.size} of ${pairs} non-orthogonal pairs of ${stateList.length} stabilizer states. ${seconds.toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'quantum/pbr-exact-closure',
  code: 'E-QTM-0191',
  title:
    "PBR's reading is made exactly by the rule's own fear-beat words, pass: for two roles prepared in |0> or |+> (overlap 1/3), checked exactly in Z[w] over every element of the rule's group with at most 3 meetings, none with 0 or 1 meeting is a reading (best 8 of 9), 4 of 2,896,992 configurations with 2 meetings and 1,352 of 2,503,001,088 with 3 are, the first the like meeting, one link move on role 2, then the rule's meeting w U^dag, read in a product stabilizer basis; E-QTM-0180's words miss it because they never hold U^dag; controls: PBR's qubit reading and PBR's two-copy reading for these states (an orthogonal matrix over Z[1/2]) pass the same zero test, and every local Clifford pair fails it",
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    return pbrExactClosureRun({ maxMeetings: 3, wordLength: 7 })
  },
})
