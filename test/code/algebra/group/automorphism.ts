// Conformance for code/algebra/group/automorphism: the Weyl group order, the full
// automorphism group order, the outer automorphism order, and the diagram-automorphism
// order of a root system. Every expected number is a textbook Lie-theory fact:
//   |W(A_n)| = (n+1)!,  |W(D_n)| = 2^(n-1) n!,  |W(B_n)| = 2^n n!,
//   |Aut(D4 system)| = 1152 = |W(F4)|,  Out(D4) = S3 (order 6) = TRIALITY,
//   diagram-Aut(A_n) = 2,  diagram-Aut(D4) = 6.
// Triality (outer order 6) is unique to D4 among all simple types and is what singles
// out the {3,4,3,4} dock.

import { suite, check, equal } from '@/test/code/harness'
import {
  weylGroupOrder,
  automorphismGroupOrder,
  outerAutomorphismOrder,
  diagramAutomorphismOrder,
} from '@/code/algebra/group/automorphism'
import {
  rootsD4,
  rootsB4,
  rootsAn,
} from '@/code/algebra/group/root-system'

// Hand-built Cartan matrices, independent of the root-system module.
const CARTAN_A2 = [
  [2, -1],
  [-1, 2],
]

const CARTAN_A3 = [
  [2, -1, 0],
  [-1, 2, -1],
  [0, -1, 2],
]

// D4: a central node joined to three outer nodes (the triality fork).
const CARTAN_D4 = [
  [2, -1, -1, -1],
  [-1, 2, 0, 0],
  [-1, 0, 2, 0],
  [-1, 0, 0, 2],
]

suite('algebra/group/automorphism: Weyl group orders', [
  check('|W(A2)| = 3! = 6 (S3, permutations of 3 coordinates)', () => {
    equal(weylGroupOrder(rootsAn(3)), 6, '|W(A2)| = 6')
  }),
  check('|W(D4)| = 2^3 * 4! = 192', () => {
    equal(weylGroupOrder(rootsD4()), 192, '|W(D4)| = 192')
  }),
  check('|W(B4)| = 2^4 * 4! = 384', () => {
    equal(weylGroupOrder(rootsB4()), 384, '|W(B4)| = 384')
  }),
])

suite('algebra/group/automorphism: D4 triality', [
  check('|Aut(D4 root system)| = 1152 (= |W(F4)|)', () => {
    equal(automorphismGroupOrder(rootsD4()), 1152, '|Aut(D4)| = 1152')
  }),
  check('Out(D4) = |Aut|/|W| = 1152/192 = 6 (S3 triality)', () => {
    equal(
      outerAutomorphismOrder(rootsD4()),
      6,
      'outer order 6 = triality',
    )
  }),
])

suite(
  'algebra/group/automorphism: diagram automorphisms from Cartan matrices',
  [
    check('A2 diagram has a Z/2 symmetry (order 2)', () => {
      equal(
        diagramAutomorphismOrder(CARTAN_A2),
        2,
        'A2 diagram aut = 2',
      )
    }),
    check('A3 (a path) has a Z/2 reversal symmetry (order 2)', () => {
      equal(
        diagramAutomorphismOrder(CARTAN_A3),
        2,
        'A3 diagram aut = 2',
      )
    }),
    check(
      'D4 diagram has the full S3 symmetry (order 6) = triality',
      () => {
        equal(
          diagramAutomorphismOrder(CARTAN_D4),
          6,
          'D4 diagram aut = 6',
        )
      },
    ),
  ],
)
