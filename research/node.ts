// The claim graph's foundations: assumptions, definitions, lemmas, imported methods and
// observations. Results and experiments are nodes too, built from result.ts.
//
// The five assumptions are the whole of the program. A result that rests on none of them says
// nothing about the program, however well it matches nature, which is why the lattice QCD
// results are reproductions and not evidence for the rule.

import type { Node } from './type'

export const ASSUMPTIONS: Node[] = [
  {
    id: 'A1',
    kind: 'assumption',
    statement:
      'space is the four-dimensional hyperbolic honeycomb {3,4,3,4}, whose cells are 24-cells, with 24 directions per cell',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'A2',
    kind: 'assumption',
    statement:
      'each direction of each cell holds one value from {-1, 0, +1}, and nothing else is stored',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'A3',
    kind: 'assumption',
    statement:
      'one update per step: a fixed nine-state collision table applied to each opposite pair of slots, then streaming each slot to its neighbour, on a fixed 24-beat turning schedule',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'A4',
    kind: 'assumption',
    statement:
      'the update is a bijection of the state (reversible) and conserves the sum of the values (charge)',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'A5',
    kind: 'assumption',
    statement: 'the update draws no random number',
    standing: 'holds',
    depends: [],
  },
]

export const DEFINITIONS: Node[] = [
  {
    id: 'D1',
    kind: 'definition',
    statement:
      'pull: (measured - published) / sigma, with sigma the combined error',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'D2',
    kind: 'definition',
    statement:
      'boundary share: the fraction of the cells within graph radius r of a cell that lie at exactly radius r',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'D3',
    kind: 'definition',
    statement:
      'coverage radius: the smallest radius at which a breadth-first spread from a cell reaches every stored cell',
    standing: 'holds',
    depends: [],
  },
]

export const LEMMAS: Node[] = [
  {
    id: 'L1',
    kind: 'lemma',
    statement:
      'Schur-Weyl: the only maps on two three-state lines that commute with all of U(3) are combinations of the identity and the swap',
    standing: 'holds',
    depends: ['I7'],
  },
  {
    id: 'L2',
    kind: 'lemma',
    statement:
      'Hurwitz: normed division algebras exist only in dimensions 1, 2, 4 and 8',
    standing: 'holds',
    depends: ['I7'],
  },
  {
    id: 'L3',
    kind: 'lemma',
    statement:
      'among the simple Lie algebras only D4 has an outer automorphism group of order six (triality)',
    standing: 'holds',
    depends: ['I7'],
  },
  {
    id: 'L4',
    kind: 'lemma',
    statement:
      'on a graph whose shells grow by a factor lambda, the outer shell holds (lambda - 1) / lambda of the ball in the limit',
    standing: 'holds',
    depends: ['D2'],
  },
]

export const IMPORTS: Node[] = [
  {
    id: 'I1',
    kind: 'import',
    statement:
      'the Wilson lattice gauge action for U(1), SU(2), SU(3) and SU(4) on a hypercubic lattice',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'I2',
    kind: 'import',
    statement:
      'a seeded heatbath and overrelaxation Monte Carlo sampler',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'I3',
    kind: 'import',
    statement:
      'Kogut-Susskind staggered quarks, and hybrid Monte Carlo for dynamical ones',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'I4',
    kind: 'import',
    statement:
      'a fourth-order symmetric integrator for Hamiltonian gauge dynamics',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'I5',
    kind: 'import',
    statement:
      'hyperbolic tilings other than {3,4,3,4} ({5,4} in two dimensions, {5,3,4} and its siblings in three), and a flat cubic lattice as control',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'I6',
    kind: 'import',
    statement:
      'a coined Dirac quantum walk: complex amplitudes, a rotation coin, a shift',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'I7',
    kind: 'import',
    statement:
      'standard mathematics: composition algebras, Lie theory, representation theory',
    standing: 'holds',
    depends: [],
  },
  {
    id: 'I8',
    kind: 'import',
    statement:
      'an analytic travel-time formula for a branching tree: 2 ceil(log_3 s) + 1 steps against s',
    standing: 'holds',
    depends: [],
  },
]

// Measurements of nature a prediction is held against. None, because there is no prediction.
export const OBSERVATIONS: Node[] = []
