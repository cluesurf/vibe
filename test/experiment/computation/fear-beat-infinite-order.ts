// Does a short word of the knit's beats on two roles have infinite order, exactly? (E-CMP-0020)
//
// The routes map (N, universality, "an element of infinite order") asks for one exact fact: some product of the
// knit's beats on two roles with an eigenvalue that is not a root of unity. E-QTM-0118 found it in floating
// point (a word whose powers up to 20,000 are never a scalar, and a Lie rank of 80). This file decides it in exact
// arithmetic, with no tolerance anywhere.
//
// THE GATES, as letters, each exact over Z[omega][1/6] (code/measure/eisenstein-words):
//   0..3  X, Z, S, F on the first role (the links, Sigma(648), E-QTM-0117)
//   4..7  X, Z, S, F on the second role
//   8     the swap phase U = ((1 + omega) + (1 - omega) SWAP) / 2, the like meeting, the fear beat
// THE TEST (code/algebra/cyclotomic rootsOfUnityTest): for the product N / den of a word, multiply its
// characteristic polynomial by its Galois conjugate to get P in Z[x], rescale to R(x) = P(den x) / den^18, and
// strip every cyclotomic factor Phi_n with phi(n) <= 18 by exact division. A unitary has finite order exactly
// when every eigenvalue is a root of unity (it is diagonalizable), and its eigenvalues are all roots of unity
// exactly when R is a product of cyclotomic polynomials (Kronecker). A nonconstant remainder is a proof of
// infinite order.
//
// HYPOTHESES, written before the first run:
//   H1  some word of length at most L = 4 that contains U has infinite order. Predicted: the shortest has
//       length 2 (U times one local letter), since E-QTM-0118's first candidate [U, local] was infinite in floats
//   P   no word to length 4 has infinite order. That would NOT prove the gate set is not universal: the
//       generated group could still be infinite through longer words. It would mean only that the knit's
//       shortest beat words are all periodic, and it would contradict E-QTM-0118's floating reading
// GATES, fixed before the first run:
//   G0 exactness: every letter is unitary exactly, N N^dagger = den^2 I
//   G1 control, the links alone: every word with no U has finite order (the Clifford group is finite)
//   G2 control, U replaced by SWAP (the fear beat off, the swap phase at pi): every word has finite order
//   G3 the method: the rational rotation (3/5, -4/5; 4/5, 3/5) (+) 1 has infinite order and the quarter turn
//      (0, -1; 1, 0) (+) 1 finite, read by the same test
// Verdict: fail if G0 to G3 fail (the instrument); pass if they hold and H1 holds; fail (P) otherwise.
//
// WHAT IT MEANS. An infinite-order element makes the closure of the generated group a compact Lie group of
// positive dimension. With the full two-role Clifford group (the local links plus SUM), that is density in the
// unitary group: the Clifford group is a maximal finite subgroup, so Clifford plus any non-Clifford gate is
// universal (Nebe, Rains, Sloane 2001; Campbell, Anwar, Browne 2012). The model's own set has no SUM (no link
// supplies one), and for it infinite order proves only an infinite closure; density there rests on E-QTM-0118's
// floating Lie rank 80. Either way this is universality for quantum computation of a gate set, not "the rule
// computes anything computable": no circuit is built in the knit.
//
// FIRST RUN, 2026-10-01 (tmp/qx-cmp-run1.log, 42 s): pass, every gate as fixed, H1 as predicted (length 2).
// The report then named a length-4 word as the first, because the depth-first walk meets long words first; the
// report was fixed to keep the shortest (run 2, tmp/qx-cmp-run2.log), no gate or count moved. The shortest is
// (X x 1) U; at length 2 every word but U U is infinite (16 of 17). The rest polynomial over 2^18 is
// x^12 + 11/4 x^9 + 249/64 x^6 + 11/4 x^3 + 1, whose non-integer coefficients already rule out roots of unity.
//
// DETERMINISM: every word to length 4 is enumerated, 7,380 of them, in lexicographic order. Depth L1: an exact
// known-mathematics fact about the model's gates, no rule run.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { cliffordGenerators, type Mat3 } from '@/code/measure/eisenstein-words'
import {
  cycAdjoint,
  cycIdentity,
  cycKron,
  cycMul,
  cycEqual,
  cyclotomicRing,
  rootsOfUnityTest,
  type CycMatrix,
} from '@/code/algebra/cyclotomic'

const LENGTH = 4
const RING = cyclotomicRing(3)

function fromMat3(m: Mat3): CycMatrix {
  return {
    n: 3,
    entries: m.num.map(([a, b]) => [BigInt(a), BigInt(b)]),
    den: 3n ** BigInt(m.den3),
  }
}

// the swap phase (or, with `off`, SWAP itself) on two roles, index 3 i + j
function meeting(off: boolean): CycMatrix {
  const entries = Array.from({ length: 81 }, () => RING.zero())

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const from = 3 * i + j
      const to = 3 * j + i
      // 2U: (1 + omega) on |ij>, (1 - omega) on |ji>; 2 SWAP: 2 on |ji>
      const keep = off ? [0n, 0n] : [1n, 1n]
      const exchange = off ? [2n, 0n] : [1n, -1n]

      entries[from * 9 + from] = RING.add(entries[from * 9 + from]!, keep)
      entries[to * 9 + from] = RING.add(entries[to * 9 + from]!, exchange)
    }
  }

  return { n: 9, entries, den: 2n }
}

function isUnitary(m: CycMatrix): boolean {
  const product = cycMul(RING, m, cycAdjoint(RING, m))

  return cycEqual(RING, product, cycIdentity(RING, m.n))
}

// a 3 x 3 with rational entries (numerators over one denominator), for the method check
function rational3(rows: readonly (readonly number[])[], den: number): CycMatrix {
  return {
    n: 3,
    entries: rows.flat().map(x => [BigInt(x), 0n]),
    den: BigInt(den),
  }
}

type Census = {
  words: number
  infinite: number
  byLength: number[]
  infiniteByLength: number[]
  first?: { word: number[]; rest: bigint[]; stripped: number[] }
}

function census(letters: readonly CycMatrix[], withU: boolean): Census {
  const out: Census = {
    words: 0,
    infinite: 0,
    byLength: new Array<number>(LENGTH + 1).fill(0),
    infiniteByLength: new Array<number>(LENGTH + 1).fill(0),
  }

  const walk = (word: number[], product: CycMatrix): void => {
    if (word.length > 0) {
      const hasU = word.includes(8)

      if (hasU === withU) {
        const test = rootsOfUnityTest(RING, product)

        out.words++
        out.byLength[word.length]!++

        if (!test.finite) {
          out.infinite++
          out.infiniteByLength[word.length]!++

          // the depth-first walk meets long words before short ones: keep the shortest, first in its length
          if (!out.first || out.first.word.length > word.length) {
            out.first = {
              word: [...word],
              rest: test.rest,
              stripped: test.stripped,
            }
          }
        }
      }
    }

    if (word.length === LENGTH) {
      return
    }

    letters.forEach((g, k) => {
      walk([...word, k], cycMul(RING, product, g))
    })
  }

  walk([], cycIdentity(RING, 9))

  return out
}

// the roots of the non-cyclotomic rest as turns, by Durand and Kerner in floats, for the report only
function restRootPhases(rest: readonly bigint[]): number[] {
  const n = rest.length - 1
  const lead = Number(rest[n])
  const coeffs = rest.map(c => Number(c) / lead)

  let roots = Array.from({ length: n }, (_, k): [number, number] => [
    Math.cos(0.4 + (2 * Math.PI * k) / n),
    Math.sin(0.4 + (2 * Math.PI * k) / n),
  ])

  for (let iteration = 0; iteration < 500; iteration++) {
    roots = roots.map((z, i) => {
      // p(z)
      let pr = 0
      let pi = 0

      for (let k = n; k >= 0; k--) {
        const r = pr * z[0] - pi * z[1] + (coeffs[k] ?? 0)
        const im = pr * z[1] + pi * z[0]

        pr = r
        pi = im
      }

      // prod (z - z_j)
      let dr = 1
      let di = 0

      roots.forEach((w, j) => {
        if (j !== i) {
          const ar = z[0] - w[0]
          const ai = z[1] - w[1]
          const r = dr * ar - di * ai

          di = dr * ai + di * ar
          dr = r
        }
      })

      const d2 = dr * dr + di * di

      return [
        z[0] - (pr * dr + pi * di) / d2,
        z[1] - (pi * dr - pr * di) / d2,
      ]
    })
  }

  return roots
    .map(z => Math.atan2(z[1], z[0]) / (2 * Math.PI))
    .sort((a, b) => a - b)
}

export default experiment({
  id: 'computation/fear-beat-infinite-order',
  code: 'E-CMP-0020',
  title:
    'one link and the fear beat on two roles make a word of infinite order, exactly: (X x 1) U has an eigenvalue that is not a root of unity (its norm polynomial keeps the factor x^12 + 11/4 x^9 + 249/64 x^6 + 11/4 x^3 + 1, not integral), as do 16 of the 17 words of length 2 and 2,522 of the 2,700 fear-beat words to length 4, where 0 of 4,680 link-only words and 0 of 7,380 words with SWAP in place of the fear beat are',
  category: 'computation',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const local = cliffordGenerators().map(fromMat3)
    const one = cycIdentity(RING, 3)
    const onFirst = local.map(g => cycKron(RING, g, one))
    const onSecond = local.map(g => cycKron(RING, one, g))
    const u = meeting(false)
    const swap = meeting(true)
    const letters = [...onFirst, ...onSecond, u]
    const controlLetters = [...onFirst, ...onSecond, swap]

    // G0
    const unitary = [...letters, swap].every(isUnitary)

    // G3, the method on two known cases
    const rotation = rational3(
      [
        [3, -4, 0],
        [4, 3, 0],
        [0, 0, 5],
      ],
      5,
    )
    const quarter = rational3(
      [
        [0, -1, 0],
        [1, 0, 0],
        [0, 0, 1],
      ],
      1,
    )
    const methodInfinite = !rootsOfUnityTest(RING, rotation).finite
    const methodFinite = rootsOfUnityTest(RING, quarter).finite
    const uAlone = rootsOfUnityTest(RING, u)

    // H1, and G1 (the words with no U) from the same enumeration
    const model = census(letters, true)
    const linksAlone = census(letters, false)
    // G2: U replaced by SWAP, every word
    const swapWithU = census(controlLetters, true)
    const swapWithout = census(controlLetters, false)
    const swapControlInfinite = swapWithU.infinite + swapWithout.infinite
    const shortest = model.infiniteByLength.findIndex(x => x > 0)
    const phases = model.first ? restRootPhases(model.first.rest) : []
    const names = ['X1', 'Z1', 'S1', 'F1', 'X2', 'Z2', 'S2', 'F2', 'U']
    const instrument =
      unitary &&
      linksAlone.infinite === 0 &&
      swapControlInfinite === 0 &&
      methodInfinite &&
      methodFinite
    const h1 = model.infinite > 0

    return verdict({
      status: instrument && h1 ? 'pass' : 'fail',
      claim: !instrument
        ? 'an instrument gate failed: the letters are not exactly unitary, or a Clifford-only or SWAP control word reads infinite order, or the method misreads a known rotation'
        : h1
          ? `the word ${model.first?.word.map(k => names[k]).join(' ')} of length ${shortest} has an eigenvalue that is not a root of unity, exactly: its norm polynomial keeps a factor of degree ${(model.first?.rest.length ?? 1) - 1} with no cyclotomic part; ${model.infinite} of ${model.words} words to length ${LENGTH} that hold the fear beat have infinite order, and 0 of the ${linksAlone.words} link-only words and 0 of the ${swapWithU.words + swapWithout.words} words with SWAP in its place`
          : `no word to length ${LENGTH} has infinite order (P): the shortest beat words are periodic, which does not decide universality`,
      metrics: {
        modelWords: model.words,
        modelInfinite: model.infinite,
        shortestInfiniteLength: shortest,
        ...Object.fromEntries(
          model.infiniteByLength.map((x, k) => [`infiniteAtLength${k}`, x]),
        ),
        ...Object.fromEntries(
          model.byLength.map((x, k) => [`wordsAtLength${k}`, x]),
        ),
        firstWordRestDegree: (model.first?.rest.length ?? 1) - 1,
        firstWordCyclotomicFactors: model.first?.stripped.length ?? 0,
        firstWordRestPhaseLowest: phases[0] ?? 0,
        firstWordRestPhaseHighest: phases[phases.length - 1] ?? 0,
        swapPhaseAloneFinite: uAlone.finite ? 1 : 0,
      },
      control: {
        lettersUnitary: unitary ? 1 : 0,
        linkOnlyWords: linksAlone.words,
        linkOnlyInfinite: linksAlone.infinite,
        swapControlWords: swapWithU.words + swapWithout.words,
        swapControlInfinite,
        methodRotationInfinite: methodInfinite ? 1 : 0,
        methodQuarterTurnFinite: methodFinite ? 1 : 0,
      },
      notes: `L1, exact. First infinite word ${model.first?.word.map(k => names[k]).join(' ') ?? 'none'}; its norm polynomial's non-cyclotomic part (integer coefficients, lowest first, scaled by den^deg): ${model.first?.rest.join(', ') ?? 'none'}; cyclotomic factors stripped: ${model.first?.stripped.join(', ') ?? 'none'}; the rest's roots as turns (floats, report only): ${phases.map(x => x.toFixed(9)).join(', ')}. Density for the full Clifford group plus U follows from the maximal finite subgroup theorem (cited, not reproved); for the model's set without SUM, from E-QTM-0118's floating Lie rank 80. Not a construction of computation in the knit: the ledger's universality row is not moved by this.`,
    })
  },
})
