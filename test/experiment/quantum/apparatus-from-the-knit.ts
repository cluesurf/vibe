// Preparing the relational record's apparatus from the knit's own moves (E-QTM-0137).
//
// E-QTM-0135 measured a role covariantly with the reflection R through the frame direction and a love-fear
// apparatus OPENED on one stored line l, a stand-in: the pair's weight is 1 on each of the 9 joint points of
// l x l. The knit's classical tokens are points. The question: which of the model's own operations turns a
// love at p and a fear stored at q into that pair on l(p, q), the line through the two points?
//
// The candidates are the love-fear fear beat (the singlet phase, the color mode's unlike kernel), the like
// fear beat, the comoving fear beat of E-SPN-0062 (the same kernels translated to the tokens' own points),
// the 216 grid moves the links apply, and words of them, with a helper vibe met and then left unread.
//
// Two exact facts decide most of it before any search (derived before the first run):
//   - every one of those operations is the Wigner kernel of a unitary or a permutation of points, and such a
//     kernel keeps the sum of squared weights (Tr rho^2 = 9 sum W^2 on two roles). A pair of points has sum
//     of squares 1 in its units; the pair on l x l has 9 / 81 = 1/9. So no word of the pair's own operations
//     prepares the stand-in from points. Only a trace (a helper left unread) can lower the sum.
//   - R moves the system by the pair's color content u = sf - sr, and every covariant meeting keeps a
//     love-fear pair's color content (E-QTM-0134; for the singlet phase it is the stored difference y - x at
//     every nonzero kernel entry). The stand-in's 9 members carry u = 0, d, 2 d three times each: the count
//     over them is what flattens the system.
// What a single member does, from R's formula (code/measure/in-model-apparatus header): it writes the
// record label 2 [d, l] - [d, x1], the stand-in's own bijection, whichever member it is, and moves the
// system by one point. So the record needs no opening. The back-action does.
//
// The model's own opening. Every Bell history opens its tokens on ROLE lines (knot-histories lineKnot, the
// start |0>|0bar>): a token at point p opens on the role line through p. A love-fear pair with equal roles
// and different tilts is then exactly the stand-in on l(p, q), and a common grid move carries it to the
// stand-in on l(g p, g q). That is a convention of the experiments' starts, not a derived operation, and it
// is not covariant at the opening (it picks the role axis).
//
// Predictions, written before the experiment's first run:
//   P1 the like and unlike kernels (and their translates at all 81 point pairs) are orthogonal up to D:
//      K^T K = D^2 1 exactly; the 216 grid moves and R are permutations. So no word of them prepares the
//      stand-in from points.
//   P2 the unlike kernel keeps the stored difference y - x at every nonzero entry and the like kernel keeps
//      x + y; both commute with all 216 diagonal grid moves; the comoving beat leaves every classical pair
//      at its own points in place (81 of 81 for each kernel).
//   P3 no word of up to 6 meetings among the love, the fear and one helper vibe (love or fear, at any point),
//      the helper then left unread, gives a product of two line states on any lines (A at point 0 by the
//      diagonal translation covariance of P2, q and the helper's point over all 9, both helper signs).
//   P4 the role opening equals the stand-in for exactly the 18 of 72 ordered pairs p != q with equal roles,
//      and for each of those every one of the 216 common grid moves carries it to the stand-in on
//      l(g p, g q); for the other 54 the two tokens are on two different role lines (two lines of one class,
//      E-QTM-0135's C2: the copy holds, the label is kicked).
//   P5 on all 2,880 reached states (E-QTM-0135's six Bell histories, 480 beats, token A in the love frame),
//      all 12 lines and all 9 members of each: the record and the reference copy the system's label by the
//      stand-in's bijections, the label distribution and the partner are unchanged, and the system is moved
//      by exactly sf - sr. The sum over the 9 members is the stand-in's three-token whole (linearity, L1).
//   P6 a member measuring class c and then a member measuring class c' != c record together the system's
//      own signed weight, point for point (the two labels fix the point), so their joint record is negative
//      on every state with a fear on A, where the stand-in's second record is independent and non-negative.
//
// Gates, fixed before the first run. G1 = P1, G2 = P2, G3 = P3 (0 line products), G4 = P4, G5 = P5 (all
// bad counts 0), G6 = P6 (0 mismatches, negative joint records on more than 0 states).
// H (the roadmap's gate): a word of the model's own operations turns a love at p and a fear at q into the
// stand-in on l(p, q) that measures exactly as E-QTM-0135's did. Predicted FALSE by P1.
// Status, fixed with the gates: pass if H holds with G5; partial if H fails and G1, G2, G4, G5 and G6 hold
// (the stand-in is the model's own opening convention, and each classical member already writes the
// record); fail otherwise.
//
// Disclosed: two probes ran before this header was written. tmp/qtm137-probe.ts printed the unlike
// kernel's columns at 5 point pairs (support 6, every entry at the same stored difference), and
// tmp/qtm137-probe2.ts ran P3's search for q in {0, 1, 3, 4} and found 0 line products, the nearest a
// largest-entry gap of 2/9. P2 and P3 were written after those probes.
//
// FIRST RUN (2026-09-26, 51.5 s): partial, every prediction as written, H false. 85 kernels orthogonal up
// to D with 0 bad entries, R a permutation. The singlet phase keeps the stored difference at every entry
// (it spreads one pair of points over 6 joint points, all at the same difference), the like kernel the sum,
// both commute with all 216 diagonal moves, and the comoving beats move 0 of 81 classical pairs. 354,132
// helper words: 0 line products, nearest largest-entry gap 2/9. The role opening is the stand-in for 18 of
// 72 ordered pairs, carried by all 216 common moves with 0 bad. On 2,880 reached states, 311,040 member
// cases: record, reference, label, partner and displacement all 0 bad; the member leaves the system flat
// along the axis in 33,318 cases, only where the state already was. Two members in sequence: 311,040
// cases, the joint record is the system's own weight on all, negative on 1,208 states (every state with a
// fear on A).
//
// Depth L2: exact theorems on the kernels, an exhaustive short search, and the members read on the knit's
// own states. The husk is not read: every number is a role-grid number.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fearKernels, phaseMove, type Whole } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { advanceKnot, bellHistories, lineKnot } from '@/code/measure/knot-histories'
import { physicalFrame } from '@/code/measure/sum-record'
import { translatedKernel } from '@/code/measure/comoving-parity'
import { addPoints, mod3, scalePoint } from '@/code/measure/frame-covariant-meeting'
import {
  LABEL,
  LINES,
  diagonalCovarianceBad,
  differenceBreaks,
  kernelNormBad,
  lineIndexThrough,
  lineLabel,
  meetThree,
  memberRecord,
  reflectionTable,
  sumBreaks,
} from '@/code/measure/in-model-apparatus'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 480
const WORD = 6

export default experiment({
  id: 'quantum/apparatus-from-the-knit',
  code: 'E-QTM-0137',
  title:
    'preparing the relational record\'s apparatus from the knit\'s own moves: no word of fear beats, comoving beats, links and helper meetings turns a love and a fear at two points into a line pair, since every one keeps the sum of squared weights and the pair\'s color content; the stand-in is the model\'s own role opening for a pair of equal roles, and each classical member of it already writes the record, while only the count over the members spreads the system',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const kernels = [true, false].map(ex => fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: ex })!)
    const moves = gridMoves()
    const phaseMoves = moves.act.map(g => phaseMove(g))

    // G1: orthogonality of every kernel, and of its translates to every pair of own points
    let normBad = 0
    let normChecks = 0

    for (const k of kernels) {
      for (const [kernel, divisor] of [
        [k.like, k.likeDivisor],
        [k.unlike, k.unlikeDivisor],
      ] as const) {
        normBad += kernelNormBad(kernel, divisor)
        normChecks++
      }
    }

    const unlike = kernels[0]!.unlike
    const unlikeDivisor = kernels[0]!.unlikeDivisor

    for (let pa = 0; pa < 9; pa++) {
      for (let pb = 0; pb < 9; pb++) {
        normBad += kernelNormBad(translatedKernel(unlike, pa, pb), unlikeDivisor)
        normChecks++
      }
    }

    // R is a permutation of the 729 stored joint points, so it too keeps the sum of squares
    const table = reflectionTable()
    const hit = new Uint8Array(729)

    table.forEach(j => {
      hit[j] = 1
    })

    const reflectionPermutation = hit.every(h => h === 1)

    // a member's record is R's table read at that member: the sum over the 9 members of l x l is then the
    // stand-in's whole by linearity (L1)
    let memberTableBad = 0

    for (let j = 0; j < 729; j++) {
      const m = memberRecord(Math.floor(j / 81), Math.floor(j / 9) % 9, j % 9)

      memberTableBad += table[j] === 81 * m.system + 9 * m.record + m.reference ? 0 : 1
    }

    // G2: what the kernels keep, their covariance, and the comoving beat on classical pairs
    const differenceBad = kernels.reduce((s, k) => s + differenceBreaks(k.unlike), 0)
    const likeSumBad = kernels.reduce((s, k) => s + sumBreaks(k.like), 0)
    const covarianceBad = kernels.reduce((s, k) => s + diagonalCovarianceBad(k.unlike, phaseMoves) + diagonalCovarianceBad(k.like, phaseMoves), 0)
    let comovingMoved = 0

    for (const k of kernels) {
      for (const [kernel, divisor] of [
        [k.like, k.likeDivisor],
        [k.unlike, k.unlikeDivisor],
      ] as const) {
        for (let pa = 0; pa < 9; pa++) {
          for (let pb = 0; pb < 9; pb++) {
            const t = translatedKernel(kernel, pa, pb)
            const col = 9 * pa + pb

            for (let r = 0; r < 81; r++) {
              comovingMoved += (t[r]?.[col] ?? 0) === (r === col ? divisor : 0) ? 0 : 1
            }
          }
        }
      }
    }

    // the singlet phase on two classical points, read (a reading): how many joint points it spreads over
    let unlikeSupportMax = 0

    for (let c = 0; c < 81; c++) {
      let n = 0

      for (let r = 0; r < 81; r++) {
        n += (unlike[r]?.[c] ?? 0) !== 0 ? 1 : 0
      }

      unlikeSupportMax = Math.max(unlikeSupportMax, n)
    }

    // G3 and H: words of meetings with one helper, the helper left unread
    const started = Date.now()
    const likeF = kernels.map(k => Float64Array.from(k.like.flat().map(x => x / k.likeDivisor)))
    const unlikeF = Float64Array.from(unlike.flat().map(x => x / unlikeDivisor))
    let words = 0
    let lineProducts = 0
    let standInHits = 0
    let nearest = Number.POSITIVE_INFINITY

    for (const likeK of likeF) {
      for (const helper of [1, -1]) {
        const meetings: [number, number, Float64Array][] =
          helper > 0
            ? [
                [0, 1, unlikeF],
                [0, 2, likeK],
                [2, 1, unlikeF],
              ]
            : [
                [0, 1, unlikeF],
                [0, 2, unlikeF],
                [1, 2, likeK],
              ]

        for (let q = 0; q < 9; q++) {
          for (let r = 0; r < 9; r++) {
            const start = new Float64Array(729)

            start[9 * q + r] = 1

            const target = q === 0 ? -1 : lineIndexThrough(0, q)
            const visit = (w: Float64Array, depth: number): void => {
              const pair = new Float64Array(81)

              for (let i = 0; i < 729; i++) {
                pair[Math.floor(i / 9)] = (pair[Math.floor(i / 9)] ?? 0) + (w[i] ?? 0)
              }

              words++

              for (let i = 0; i < 12; i++) {
                for (let j = 0; j < 12; j++) {
                  const l1 = LINES[i]!.points
                  const l2 = LINES[j]!.points
                  let gap = 0

                  for (let x = 0; x < 9 && gap < 1e-9 + nearest; x++) {
                    for (let y = 0; y < 9; y++) {
                      const want = l1.includes(x) && l2.includes(y) ? 1 / 9 : 0

                      gap = Math.max(gap, Math.abs((pair[9 * x + y] ?? 0) - want))
                    }
                  }

                  nearest = Math.min(nearest, gap)

                  if (gap < 1e-9) {
                    lineProducts++
                    standInHits += i === target && j === target ? 1 : 0
                  }
                }
              }

              if (depth < WORD) {
                for (const [a, b, kernel] of meetings) {
                  visit(meetThree(w, a, b, kernel), depth + 1)
                }
              }
            }

            visit(start, 0)
          }
        }
      }
    }

    const searchSeconds = (Date.now() - started) / 1000

    // G4: the role opening against the stand-in
    let roleEqualsStandIn = 0
    let roleOther = 0
    let carriedBad = 0
    const roleLine = (p: number): number[] => [0, 1, 2].map(k => 3 * Math.floor(p / 3) + k)
    const standIn = (p: number, q: number): bigint[] => {
      const l = LINES[lineIndexThrough(p, q)]!.points

      return lineKnot([0, 1], l, l).weight.map(x => x)
    }
    const same = (a: readonly bigint[], b: readonly bigint[]): boolean => a.every((x, i) => x === b[i])

    for (let p = 0; p < 9; p++) {
      for (let q = 0; q < 9; q++) {
        if (p === q) {
          continue
        }

        const opened = lineKnot([0, 1], roleLine(p), roleLine(q)).weight

        if (same(opened, standIn(p, q))) {
          roleEqualsStandIn++

          for (const g of phaseMoves) {
            const moved = new Array<bigint>(81).fill(0n)

            opened.forEach((w, i) => {
              moved[9 * (g[Math.floor(i / 9)] ?? 0) + (g[i % 9] ?? 0)] = w
            })

            carriedBad += same(moved, standIn(g[p] ?? 0, g[q] ?? 0)) ? 0 : 1
          }
        } else {
          roleOther++
        }
      }
    }

    // G5 and G6 on the reached states
    const counts = {
      states: 0,
      statesWithFearOnA: 0,
      memberCases: 0,
      memberCopyBad: 0,
      memberReferenceBad: 0,
      memberLabelBad: 0,
      memberPartnerBad: 0,
      memberDisplacementBad: 0,
      memberFlat: 0,
      sequentialCases: 0,
      sequentialBad: 0,
      sequentialNegativeStates: 0,
    }

    for (const h of bellHistories(BEATS)) {
      let w: Whole = lineKnot(h.tokens, [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k), [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k))

      for (const record of h.records) {
        w = advanceKnot(h, w, record)

        const state = physicalFrame(w, h.conjugated)
        const nonzero: number[] = []

        state.weight.forEach((x, i) => {
          if (x !== 0n) {
            nonzero.push(i)
          }
        })

        const margA = new Array<bigint>(9).fill(0n)
        const margB = new Array<bigint>(9).fill(0n)

        for (const i of nonzero) {
          margA[Math.floor(i / 9)] = (margA[Math.floor(i / 9)] ?? 0n) + (state.weight[i] ?? 0n)
          margB[i % 9] = (margB[i % 9] ?? 0n) + (state.weight[i] ?? 0n)
        }

        counts.states++
        counts.statesWithFearOnA += margA.some(x => x < 0n) ? 1 : 0

        let negativeHere = false

        for (const line of LINES) {
          const c = line.c
          const lam = lineLabel(line)

          for (const sr of line.points) {
            for (const sf of line.points) {
              const aAfter = new Array<bigint>(9).fill(0n)
              const bAfter = new Array<bigint>(9).fill(0n)
              let copyOk = true
              let referenceOk = true

              for (const i of nonzero) {
                const x = state.weight[i] ?? 0n
                const xa = Math.floor(i / 9)
                const m = memberRecord(xa, sr, sf)
                const k = LABEL[9 * c + xa] ?? 0

                copyOk = copyOk && LABEL[9 * c + m.record] === mod3(2 * lam - k)
                referenceOk = referenceOk && LABEL[9 * c + m.reference] === mod3(-k - lam)
                aAfter[m.system] = (aAfter[m.system] ?? 0n) + x
                bAfter[i % 9] = (bAfter[i % 9] ?? 0n) + x
              }

              const shift = addPoints(sf, scalePoint(2, sr))
              const labelsBefore = [0n, 0n, 0n]
              const labelsAfter = [0n, 0n, 0n]

              margA.forEach((x, p) => {
                labelsBefore[LABEL[9 * c + p] ?? 0] = (labelsBefore[LABEL[9 * c + p] ?? 0] ?? 0n) + x
              })
              aAfter.forEach((x, p) => {
                labelsAfter[LABEL[9 * c + p] ?? 0] = (labelsAfter[LABEL[9 * c + p] ?? 0] ?? 0n) + x
              })

              counts.memberCases++
              counts.memberCopyBad += copyOk ? 0 : 1
              counts.memberReferenceBad += referenceOk ? 0 : 1
              counts.memberLabelBad += labelsBefore.every((x, k) => x === labelsAfter[k]) ? 0 : 1
              counts.memberPartnerBad += margB.every((x, p) => x === bAfter[p]) ? 0 : 1
              counts.memberDisplacementBad += margA.every((x, p) => x === aAfter[addPoints(p, shift)]) ? 0 : 1
              counts.memberFlat += aAfter.every((x, p) => 3n * x === (labelsAfter[LABEL[9 * c + p] ?? 0] ?? 0n)) ? 1 : 0
            }
          }

          // G6: a member on this line, then a member on a line of another class
          for (const other of LINES) {
            if (other.c === c) {
              continue
            }

            const sr = line.points[0] ?? 0
            const sf = line.points[1] ?? 0
            const sr2 = other.points[1] ?? 0
            const sf2 = other.points[2] ?? 0
            const joint = new Array<bigint>(9).fill(0n)
            const at = new Array<number>(9).fill(0)

            margA.forEach((x, xa) => {
              const first = memberRecord(xa, sr, sf)
              const second = memberRecord(first.system, sr2, sf2)
              const k1 = LABEL[9 * c + first.record] ?? 0
              const k2 = LABEL[9 * other.c + second.record] ?? 0

              at[xa] = 3 * k1 + k2
              joint[3 * k1 + k2] = (joint[3 * k1 + k2] ?? 0n) + x
            })

            // the two labels fix the point: the joint record is the system's own weight, relabeled
            counts.sequentialCases++
            counts.sequentialBad += new Set(at).size === 9 && margA.every((x, xa) => joint[at[xa] ?? 0] === x) ? 0 : 1
            negativeHere = negativeHere || joint.some(x => x < 0n)
          }
        }

        counts.sequentialNegativeStates += negativeHere ? 1 : 0
      }
    }

    const gates = {
      G1: normBad === 0 && normChecks === 85 && reflectionPermutation,
      G2: differenceBad === 0 && likeSumBad === 0 && covarianceBad === 0 && comovingMoved === 0,
      G3: lineProducts === 0 && words > 0,
      G4: roleEqualsStandIn === 18 && roleOther === 54 && carriedBad === 0,
      G5:
        counts.memberCopyBad === 0 &&
        counts.memberReferenceBad === 0 &&
        counts.memberLabelBad === 0 &&
        counts.memberPartnerBad === 0 &&
        counts.memberDisplacementBad === 0 &&
        memberTableBad === 0 &&
        counts.states > 0,
      G6: counts.sequentialBad === 0 && counts.sequentialNegativeStates > 0,
    }
    const hypothesis = standInHits > 0
    const status = hypothesis && gates.G5 ? 'pass' : !hypothesis && gates.G1 && gates.G2 && gates.G4 && gates.G5 && gates.G6 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `no operation of the model prepares the relational record's apparatus from two classical points: the fear-beat kernels and their comoving translates keep the sum of squared weights (${normChecks} kernels, K^T K = D^2 1 exactly) and the 216 links and R permute points, so a pair of points (1) never becomes a line pair (1/9); the singlet phase keeps the pair's stored difference, the comoving beat leaves every classical pair in place, and ${words.toLocaleString()} meeting words with a helper vibe left unread give ${lineProducts} line products (nearest largest-entry gap ${nearest.toFixed(4)}); the stand-in is the model's own role opening for the ${roleEqualsStandIn} of 72 ordered pairs with equal roles, carried to l(g p, g q) by every common link; and on all ${counts.states} reached states each of the 9 classical members of the pair already writes the stand-in's record and reference (${counts.memberCases.toLocaleString()} cases, 0 bad) while moving the system by one point, so only the count over the members spreads it, and two members in sequence record the system's own signed weight, negative on ${counts.sequentialNegativeStates} states`,
      metrics: {
        normChecks,
        normBad,
        reflectionPermutation: reflectionPermutation ? 1 : 0,
        memberTableBad,
        differenceBad,
        likeSumBad,
        covarianceBad,
        comovingMoved,
        unlikeSupportMax,
        unlikeDivisor,
        words,
        lineProducts,
        standInHits,
        nearestGap: nearest,
        searchSeconds,
        roleEqualsStandIn,
        roleOther,
        carriedBad,
        ...counts,
        hypothesis: hypothesis ? 1 : 0,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat: status partial as before; states with fear on A 1,208 -> 995 (sequentially negative states the same 995). " + ('L2. Exact integer kernels and BigInt wholes on the reached states; the helper search is Float64 with a 1e-9 tolerance. No random numbers: every start, word and member is enumerated. The role opening is a convention of the experiments\' starts (lineKnot), not a derived operation, and it picks the role axis at the opening. H, the roadmap\'s gate, is the hypothesis a word of the model\'s operations prepares the stand-in from points; P1 predicted it false.'),
    })
  },
})
