// The (4, 1) cluster, four roles and one antirole: what spin it carries exactly, whether it can fall apart, and
// whether it is the lightest charged spin one half the role allows.
//
// E-SPN-0055 found, reading color as the translation frame H (27 elements) and spin as the turn group 2T = SL(2, 3)
// acting on every role, that no neutral triple of roles is a natural spin one half (its doublet is twisted, a piece
// of spin 3/2, the uuu / Delta case), and that the first natural doublets appear in four roles and one antirole:
// with a love a role and a fear an antirole, Q = (love - fear) / 3 = 1, five members. This file decomposes that
// cluster exactly (code/algebra/role-cluster), from 3 x 3 traces and vectors of length 243.
//
// PREDICTIONS, written before any run.
// P1 The neutral space of (4, 1) has rank 27 (3^(n + m - 2)), 14 of it spinorial ((27 - (-1)^5) / 2), and holds the
//    natural doublet exactly twice (E-SPN-0055's count). The seven 2T characters built from the model's lifts are
//    orthonormal, every multiplicity is a whole number, and multiplicity times dimension sums to 27.
// P2 FALL-APART. A (4, 1) state can split into a neutral triple (3, 0) and a meson (1, 1) in 4 ways (which love goes
//    with the fear); each product space is 3 x 1 dimensional, so the span has dimension at most 12 < 27. Each product
//    carries the triple's content (a twisted doublet and a one-dimensional character, E-SPN-0055) times the meson's
//    Phi, which is invariant (M (x) conj M fixes Phi), so the span holds NO natural doublet, and by Schur the two
//    natural doublets are orthogonal to it. The natural spin one half cannot fall apart into a triple and a meson
//    at rest relative to each other; it needs relative motion (an orbital unit, the triplet 3, which carries 2' to
//    2 + 2' + 2'').
// P3 The Q = +-1 table: for (n, m) with |n - m| = 3 and n + m <= 9, the natural-doublet multiplicity is a whole number,
//    0 at (3, 0), 2 at (4, 1), and the same for (n, m) and (m, n) (the natural character is real). So by member count
//    (4, 1) and (1, 4) are the lightest charged clusters with a natural spin one half.
// P4 Four identical roles cannot be antisymmetric in the role alone (Lambda^4 of C^3 is 0), so the four loves'
//    exchange sign must sit in their slots (E-SPN-0047: exclusion is the slot, 24 per dock), not in the role.
//
// Gates, fixed before the first run:
// G1 rank 27 and spinorial 14 to 1e-9; the 7 x 7 inner products of the 2T characters are the identity to 1e-9; every
//    multiplicity within 1e-9 of a whole number, sum of multiplicity x dimension = 27, natural multiplicity 2
// G2 the fall-apart span has dimension 12 (Gram rank at 1e-9), the natural-doublet projector's trace on it is under
//    1e-9, and the twisted-doublet projectors' trace on it is over 0.5 (control: the span is not free of spinors)
// G3 every Q = +-1 multiplicity with n + m <= 9 is whole to 1e-9, (3, 0) is 0, (4, 1) is 2, and (n, m) equals (m, n)
// G4 the totally antisymmetric part in the four roles has dimension 0 (to 1e-9); reported: the natural doublets' S4
//    content
//
// Depth L1: exact representation theory on the model's own operators. It is internal-space content only: nothing here
// binds the five (E-SPN-0061) or makes them travel as one object.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type ComplexMatrix } from '@/code/algebra/linear/complex-matrix'
import {
  applyToCluster,
  binaryTetrahedralCharacters,
  cpow,
  cycleType,
  heisenbergGroup,
  neutralCharacter,
  permutations,
  spinTurns,
  type Complex,
} from '@/code/algebra/role-cluster'

const LOOSE = 1e-9
const ROLES = 4
const ANTIROLES = 1

// the S4 characters by cycle type (sorted descending, joined)
const S4: { name: string; dimension: number; values: Record<string, number> }[] = [
  { name: 'symmetric', dimension: 1, values: { '1,1,1,1': 1, '2,1,1': 1, '2,2': 1, '3,1': 1, '4': 1 } },
  { name: 'antisymmetric', dimension: 1, values: { '1,1,1,1': 1, '2,1,1': -1, '2,2': 1, '3,1': 1, '4': -1 } },
  { name: 'two', dimension: 2, values: { '1,1,1,1': 2, '2,1,1': 0, '2,2': 2, '3,1': -1, '4': 0 } },
  { name: 'standard', dimension: 3, values: { '1,1,1,1': 3, '2,1,1': 1, '2,2': -1, '3,1': 0, '4': -1 } },
  { name: 'standardSign', dimension: 3, values: { '1,1,1,1': 3, '2,1,1': -1, '2,2': -1, '3,1': 0, '4': 1 } },
]

const inner = (a: readonly Complex[], b: readonly Complex[]): Complex => {
  let re = 0
  let im = 0

  a.forEach((x, i) => {
    const y = b[i] ?? [0, 0]

    re += x[0] * y[0] + x[1] * y[1]
    im += x[1] * y[0] - x[0] * y[1]
  })

  return [re / a.length, im / a.length]
}

export default experiment({
  id: 'spin/four-one-cluster',
  code: 'E-SPN-0060',
  title:
    'the four-role one-antirole cluster, Q = 1: its translation-neutral space of 27 holds the natural spin one half doublet exactly twice, beside twisted doublets and bosons, and both natural doublets are orthogonal to every split into a neutral triple and a meson, so the spin one half cannot fall apart at rest; it is the smallest charged cluster with a natural doublet, and its four roles cannot be antisymmetric in the role, so their exchange sign must sit in the slots',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const group = heisenbergGroup()
    const { turns, lambda } = spinTurns()
    const characters = binaryTetrahedralCharacters({ turns, lambda })
    const perms = permutations(ROLES)

    // the character of every (turn, permutation) on the neutral space
    const cycleKeys = [...new Set(perms.map(p => cycleType(p).join(',')))]
    const table = new Map<string, Complex[]>()

    for (const key of cycleKeys) {
      table.set(
        key,
        turns.map(t => neutralCharacter({ group, turn: t.unitary, cycles: key.split(',').map(Number), antiroles: ANTIROLES })),
      )
    }

    const spinCharacter = table.get('1,1,1,1') ?? []
    const rank = spinCharacter[turns.findIndex(t => t.order === 1)]?.[0] ?? NaN
    const atMinusOne = spinCharacter[turns.findIndex(t => t.order === 2)]?.[0] ?? NaN
    const spinorial = (rank - atMinusOne) / 2

    // G1
    let orthonormalGap = 0

    characters.forEach((a, i) => {
      characters.forEach((b, j) => {
        const ip = inner(a.values, b.values)

        orthonormalGap = Math.max(orthonormalGap, Math.hypot(ip[0] - (i === j ? 1 : 0), ip[1]))
      })
    })

    const multiplicity = characters.map(c => ({ name: c.name, dimension: c.dimension, m: inner(spinCharacter, c.values) }))
    const wholeGap = Math.max(...multiplicity.map(x => Math.max(Math.abs(x.m[0] - Math.round(x.m[0])), Math.abs(x.m[1]))))
    const dimensionSum = multiplicity.reduce((s, x) => s + Math.round(x.m[0]) * x.dimension, 0)
    const naturalCount = multiplicity.find(x => x.name === 'natural')?.m[0] ?? NaN
    const g1 = Math.abs(rank - 27) < LOOSE && Math.abs(spinorial - 14) < LOOSE && orthonormalGap < LOOSE && wholeGap < LOOSE && dimensionSum === 27 && Math.abs(naturalCount - 2) < LOOSE

    // G2: the fall-apart span, as explicit vectors on (C^3)^5, roles first, the antirole last
    const size = 3 ** (ROLES + ANTIROLES)
    const vectors: Float64Array[] = []

    for (let partner = 0; partner < ROLES; partner++) {
      const triple = [0, 1, 2, 3].filter(r => r !== partner)

      for (let k = 0; k < 3; k++) {
        const v = new Float64Array(size)

        // psi_k on the three roles, times Phi = sum_j |j>_partner |j>_antirole
        for (let x = 0; x < 3; x++) {
          for (let j = 0; j < 3; j++) {
            const digits = new Array<number>(5).fill(0)

            digits[triple[0] ?? 0] = x
            digits[triple[1] ?? 0] = (x + k) % 3
            digits[triple[2] ?? 0] = (x + 2 * k) % 3
            digits[partner] = j
            digits[4] = j

            const index = digits.reduce((s, d) => 3 * s + d, 0)

            v[index] = (v[index] ?? 0) + 1
          }
        }

        vectors.push(v)
      }
    }

    // an orthonormal basis of the span by Gram-Schmidt, and its dimension
    const basis: Float64Array[] = []

    for (const v of vectors) {
      const w = Float64Array.from(v)

      for (const b of basis) {
        const dot = w.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)

        b.forEach((x, i) => {
          w[i] = (w[i] ?? 0) - dot * x
        })
      }

      const norm = Math.sqrt(w.reduce((s, x) => s + x * x, 0))

      if (norm > LOOSE) {
        basis.push(w.map(x => x / norm))
      }
    }

    // <b| P_rho |b> summed over the basis, P_rho = (dim / 24) sum_e conj(chi_rho(e)) R(e) (the span is neutral)
    const traceOnSpan = (rho: { dimension: number; values: readonly Complex[] }): number => {
      let total = 0

      for (const b of basis) {
        turns.forEach((t, i) => {
          const moved = applyToCluster({ vector: { re: b, im: new Float64Array(size) }, unitary: t.unitary as ComplexMatrix, roles: ROLES, antiroles: ANTIROLES })
          const chi = rho.values[i] ?? [0, 0]
          // Re(conj(chi) <b|R b>), b real
          const overlapRe = moved.re.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)
          const overlapIm = moved.im.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

          total += (rho.dimension / turns.length) * (chi[0] * overlapRe + chi[1] * overlapIm)
        })
      }

      return total
    }
    const naturalChar = characters.find(c => c.name === 'natural') ?? characters[0]!
    const twistedChars = characters.filter(c => c.name.startsWith('twisted'))
    const naturalOnSpan = traceOnSpan(naturalChar)
    const twistedOnSpan = twistedChars.reduce((s, c) => s + traceOnSpan(c), 0)
    const g2 = basis.length === 12 && Math.abs(naturalOnSpan) < LOOSE && twistedOnSpan > 0.5

    // G3: the Q = +-1 table, spin only
    const qTable: { n: number; m: number; natural: number; rank: number }[] = []

    for (let n = 0; n <= 9; n++) {
      for (let m = 0; m <= 9 - n; m++) {
        if (Math.abs(n - m) !== 3) {
          continue
        }

        const chi = turns.map(t => neutralCharacter({ group, turn: t.unitary, cycles: new Array<number>(n).fill(1), antiroles: m }))

        qTable.push({ n, m, natural: inner(chi, naturalChar.values)[0], rank: chi[turns.findIndex(t => t.order === 1)]?.[0] ?? NaN })
      }
    }

    const at = (n: number, m: number): number => qTable.find(r => r.n === n && r.m === m)?.natural ?? NaN
    const qWhole = Math.max(...qTable.map(r => Math.abs(r.natural - Math.round(r.natural))))
    const qMirror = Math.max(...qTable.map(r => Math.abs(r.natural - at(r.m, r.n))))
    const g3 = qWhole < LOOSE && Math.abs(at(3, 0)) < LOOSE && Math.abs(at(4, 1) - 2) < LOOSE && qMirror < LOOSE

    // G4: the joint 2T x S4 content
    const joint = (rho: (typeof characters)[number], lambdaS: (typeof S4)[number]): number => {
      let sum = 0

      for (const p of perms) {
        const key = cycleType(p).join(',')
        const chi = table.get(key) ?? []
        const s = lambdaS.values[key] ?? 0

        turns.forEach((_, i) => {
          const c = chi[i] ?? [0, 0]
          const r = rho.values[i] ?? [0, 0]

          sum += s * (c[0] * r[0] + c[1] * r[1])
        })
      }

      return sum / (perms.length * turns.length)
    }
    const antisymmetricDimension = characters.reduce((s, c) => s + c.dimension * joint(c, S4[1]!), 0)
    const naturalS4 = S4.map(l => ({ name: l.name, m: joint(naturalChar, l) }))
    const fullJoint = characters.flatMap(c => S4.map(l => ({ spin: c.name, perm: l.name, m: joint(c, l) }))).filter(x => Math.abs(x.m) > LOOSE)
    const g4 = Math.abs(antisymmetricDimension) < LOOSE

    const ok = g1 && g2 && g3 && g4
    const round = (x: number): number => Math.round(x * 1e9) / 1e9 + 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the (4, 1) neutral space has rank ${rank.toFixed(6)}, ${spinorial.toFixed(6)} spinorial; its 2T content is ${multiplicity.map(x => `${x.name} x ${round(x.m[0])}`).join(', ')} (characters orthonormal to ${orthonormalGap.toExponential(1)}); the 4 ways to split it into a neutral triple and a meson span ${basis.length} dimensions, on which the natural doublets' projector has trace ${naturalOnSpan.toExponential(1)} and the twisted ones' ${twistedOnSpan.toFixed(6)}; natural doublets for |Q| = 1 and n + m <= 9: ${qTable.map(r => `(${r.n}, ${r.m}) ${round(r.natural)} of rank ${round(r.rank)}`).join(', ')}; the part antisymmetric in the four roles has dimension ${round(antisymmetricDimension)}, and the natural doublets sit in S4 as ${naturalS4.filter(x => Math.abs(x.m) > LOOSE).map(x => `${x.name} x ${round(x.m)}`).join(', ')}`,
      metrics: {
        rank,
        spinorial,
        characterOrthonormalGap: orthonormalGap,
        multiplicityWholeGap: wholeGap,
        dimensionSum,
        ...Object.fromEntries(multiplicity.map(x => [`multiplicity_${x.name}`, round(x.m[0])])),
        fallApartDimension: basis.length,
        naturalOnFallApartSpan: naturalOnSpan,
        twistedOnFallApartSpan: twistedOnSpan,
        ...Object.fromEntries(qTable.map(r => [`natural_${r.n}_${r.m}`, round(r.natural)])),
        qTableWholeGap: qWhole,
        qTableMirrorGap: qMirror,
        antisymmetricInRolesDimension: round(antisymmetricDimension),
        ...Object.fromEntries(naturalS4.map(x => [`naturalInS4_${x.name}`, round(x.m)])),
        ...Object.fromEntries(fullJoint.map(x => [`joint_${x.spin}_${x.perm}`, round(x.m)])),
      },
      control: {
        twistedOnFallApartSpan: twistedOnSpan,
        cubedOrderSixCheck: cpow(lambda[turns.findIndex(t => t.order === 6)] ?? [1, 0], 3)[0],
      },
      notes:
        'L1, exact. FIRST RUN, DISCLOSED: G1, G3 and G4 held as predicted and G2 failed on its dimension clause alone: the four triple-times-meson splittings span 11 dimensions, not 12 (one linear relation among the 12 products, a wrong count in P2, not wrong algebra). The part of G2 that carries the physics held: the natural doublets\' projector has trace -8e-16 on the span, while the twisted doublets fill 8 of its 11 dimensions and one-dimensional characters the other 3. Gates not moved; status fail on G2. Reported after the run: the two natural doublets carry the two-dimensional irrep of S4 (the [2, 2] mixed symmetry of the four roles), so four fermion loves need slot parts of that same mixed symmetry, which a dock of 24 slots allows. Spin is the 2T of the role grid acting on every role (a finite group), so "spin one half" means the natural doublet, the restriction of SU(2) spin 1/2; spin 5/2 would also contain it, and the minimal SU(2) reading is 1/2. The two natural doublets of (4, 1) are orthogonal to every triple-times-meson product, so a Q = 1 natural spin one half is a genuinely five-body state: it cannot be written as a neutral triple next to a meson, and it cannot split into them without an orbital unit. Its four roles cannot be antisymmetric in the role alone (a qutrit has no four-fold antisymmetric state), so if the loves are fermions their sign lives in the slots, as E-SPN-0047 found for every vibe. COMPARISON WITH THE RISHON MODEL (Harari 1979, Shupe 1979): the charge assignment is the same, a love a T rishon of charge +1/3 and a fear an anti-T, so three loves are the rishon positron TTT; and the spin problem is the same, since three identical rishons antisymmetric in hypercolor are symmetric in spin in an s-wave, which is spin 3/2, just as the neutral triple here is the uuu / Delta-like twisted doublet (E-SPN-0055). The rishon model gets its spin one half TTT from dynamics (relative motion or chiral binding) it does not derive. The model here resembles the rishon model in its charges and inherits its spin 3/2 problem for the triple, but its own first natural spin one half at Q = 1 is TTTT anti-T, a pentaquark-like five-body state, which the rishon model does not use. Nothing here binds the five: that is E-SPN-0061.',
    })
  },
})
