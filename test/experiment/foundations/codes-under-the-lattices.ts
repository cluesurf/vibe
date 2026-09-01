// The substrate's two committed geometries are error-correcting codes in disguise. The base has 24
// directions, the D4 root system (the 24-cell), and its division-algebra ladder tops out at E8, the
// magic-square corner (E-FND-0061). Both lattices are Construction A lifts of classical binary
// codes: D4 is the lift of the even-weight parity code [4,3,2] (the integer vectors of even
// coordinate sum), and E8 is the lift of the extended Hamming code [8,4,4], the Reed-Muller code
// RM(1,3). So under each committed geometry sits a classical error-correcting code, and the
// geometric ladder D4 to E8 is a code ladder, parity check to Hamming.
//
// Verified by exhaustive enumeration: the Construction A lift of the parity code has minimal norm 2
// with exactly 24 minimal vectors, the D4 root count and the substrate's direction count, and the
// lift of the Hamming code has minimal norm 4 with exactly 240 minimal vectors, the E8 root count.
// The Hamming code's weight distribution (one word of weight 0, fourteen of weight 4, one of
// weight 8) confirms it is the [8,4,4] code, and it is self-dual, matching E8 being unimodular.
//
// The control is the odd-weight coset: it is not closed under addition (two odd-weight vectors sum
// to an even-weight one), so it is not a linear code and its lift is not a lattice. So the lattice
// structure comes specifically from the code being linear, the codes are not decoration.
//
// This bridges the substrate to quantum error correction, because exactly these two codes are the
// classical seeds of the smallest quantum codes (the CSS lifts, built in the companion
// E-QTM-0054): conservation-style parity structure and geometry are two faces of one object.
//
// Depth L1. It confirms the known Conway-Sloane facts (D4 and E8 as Construction A of the parity
// and Hamming codes, root counts 24 and 240) by direct enumeration, mapping the committed geometric
// ladder onto the classical code ladder. The novelty is the bridge, not the math.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  evenWeightCode,
  reedMuller13,
  constructionAMinimalVectors,
  closedUnderAddition,
  dualCode,
  vectorWeight,
} from '@/code/measure/code-lattice'

export default experiment({
  id: 'foundations/codes-under-the-lattices',
  code: 'E-FND-0067',
  title:
    'the committed D4 (24 directions) and E8 (magic-square corner) are Construction A lifts of the parity code [4,3,2] and the Hamming code [8,4,4], root counts 24 and 240 by enumeration, so the geometric ladder is a classical code ladder',
  category: 'foundations',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // D4 = Construction A of the even-weight parity code [4,3,2]
    const parity = evenWeightCode(4)
    const d4 = constructionAMinimalVectors({
      code: parity,
      n: 4,
      range: 2,
    })

    // E8 = Construction A of the extended Hamming code [8,4,4] = RM(1,3)
    const hamming = reedMuller13()
    const e8 = constructionAMinimalVectors({
      code: hamming,
      n: 8,
      range: 2,
    })

    // the Hamming weight distribution: 1 word of weight 0, 14 of weight 4, 1 of weight 8
    const weightCounts: Record<number, number> = {}

    for (const codeword of hamming) {
      const w = vectorWeight(codeword)

      weightCounts[w] = (weightCounts[w] ?? 0) + 1
    }

    const hammingIs844 =
      hamming.length === 16 &&
      weightCounts[0] === 1 &&
      weightCounts[4] === 14 &&
      weightCounts[8] === 1

    // the Hamming code is self-dual, matching E8 unimodularity
    const hammingDual = dualCode(hamming, 8)
    const hammingSet = new Set(
      hamming.map(codeword => codeword.join('')),
    )

    const selfDual =
      hammingDual.length === hamming.length &&
      hammingDual.every(codeword => hammingSet.has(codeword.join('')))

    // CONTROL: the odd-weight coset is not closed under addition, not a code, no lattice
    const odd: number[][] = []

    for (let m = 0; m < 16; m++) {
      const vector = Array.from(
        { length: 4 },
        (unused, i) => (m >> i) & 1,
      )

      if (vectorWeight(vector) % 2 === 1) {
        odd.push(vector)
      }
    }

    const oddNotClosed = !closedUnderAddition(odd, 4)
    const parityClosed = closedUnderAddition(parity, 4)

    const d4Matches = d4.norm === 2 && d4.count === 24
    const e8Matches = e8.norm === 4 && e8.count === 240

    const ok =
      d4Matches &&
      e8Matches &&
      hammingIs844 &&
      selfDual &&
      oddNotClosed &&
      parityClosed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'by exhaustive enumeration the Construction A lift of the even-weight parity code [4,3,2] has minimal norm 2 with exactly 24 minimal vectors (the D4 root system, the substrate direction count) and the lift of the extended Hamming code [8,4,4] = RM(1,3) (weight distribution 1-14-1, self-dual, matching E8 unimodularity) has minimal norm 4 with exactly 240 minimal vectors (the E8 root system), so both committed geometries are classical error-correcting codes lifted to lattices and the D4-to-E8 ladder is the parity-to-Hamming code ladder, while the odd-weight coset is not closed under addition (not a linear code) so its lift is not a lattice, the linearity of the code being what makes the geometry',
      metrics: {
        d4MinNorm: d4.norm,
        d4KissingNumber: d4.count,
        e8MinNorm: e8.norm,
        e8KissingNumber: e8.count,
        hammingWeight4Count: weightCounts[4] ?? 0,
        hammingSelfDual: selfDual ? 1 : 0,
      },
      // CONTROL: the odd-weight coset is not closed under addition, so no code and no lattice.
      control: { oddCosetClosed: oddNotClosed ? 0 : 1 },
      notes:
        'Conway-Sloane Construction A, confirmed by enumeration. The committed D4 (24 directions) and E8 (magic-square corner, E-FND-0061) are lifts of the parity [4,3,2] and Hamming [8,4,4] codes. Companion to the quantum lift E-QTM-0054.',
    })
  },
})
