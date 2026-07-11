// Conformance for code/operator/tight-binding: nearest-neighbour hopping Hamiltonians on
// rings, open chains, tori, with staggered mass and weak/mediator bonds. Spectra are known
// analytically, so each is checked against its closed form:
//   - Periodic ring of n, hopping +t: eigenvalues 2t cos(2 pi k / n), k = 0..n-1.
//   - Open chain of n, hopping -t: eigenvalues {-2t cos(pi k / (n+1))}, k = 1..n.
//   - d-D periodic torus: sum over axes of 2t cos(2 pi k_d / side).
//   - Cutting one bond (weight 0) splits the spectrum into the union of the two block chains.
//   - The staggered-mass chain stays chiral-symmetric: its spectrum is symmetric about 0.
// Structural facts (matrix symmetry, region partition) are checked exactly.

import { suite, check, close, closeArray } from '@/test/code/harness'
import {
  ringHoppingHamiltonian,
  weakBondChainHamiltonian,
  torusHoppingHamiltonian,
  staggeredMassChainHamiltonian,
  mediatorChainHamiltonian,
} from '@/code/operator/tight-binding'
import { DenseMatrix } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

const spec = (m: DenseMatrix): number[] =>
  Array.from(eigSymmetric({ matrix: m }).values).sort((a, b) => a - b)

const sortAsc = (xs: number[]): number[] =>
  [...xs].sort((a, b) => a - b)

const openChainSpectrum = (n: number, t = 1): number[] =>
  sortAsc(
    Array.from(
      { length: n },
      (_, i) => -2 * t * Math.cos((Math.PI * (i + 1)) / (n + 1)),
    ),
  )

function symmetric(m: DenseMatrix, label: string): void {
  for (let i = 0; i < m.rows; i++) {
    for (let j = 0; j < m.cols; j++) {
      close(
        m.data[i * m.cols + j] ?? 0,
        m.data[j * m.cols + i] ?? 0,
        0,
        `${label} [${i}][${j}]`,
      )
    }
  }
}

suite('operator/tight-binding: analytic spectra', [
  check('periodic ring spectrum is 2 cos(2 pi k / n)', () => {
    const n = 6
    const expected = sortAsc(
      Array.from(
        { length: n },
        (_, k) => 2 * Math.cos((2 * Math.PI * k) / n),
      ),
    )

    closeArray(
      spec(ringHoppingHamiltonian({ n })),
      expected,
      1e-9,
      'ring spectrum',
    )
  }),
  check(
    'open uniform chain (weight 1) spectrum is -2 cos(pi k / (n+1))',
    () => {
      const n = 7

      closeArray(
        spec(weakBondChainHamiltonian({ n, bondIndex: 3, weight: 1 })),
        openChainSpectrum(n),
        1e-9,
        'open chain spectrum',
      )
    },
  ),
  check(
    'cutting a bond (weight 0) gives the union of the two block spectra',
    () => {
      const n = 7
      const bond = 3 // splits into sites 0..3 (size 4) and 4..6 (size 3)
      const expected = sortAsc([
        ...openChainSpectrum(4),
        ...openChainSpectrum(3),
      ])

      closeArray(
        spec(
          weakBondChainHamiltonian({ n, bondIndex: bond, weight: 0 }),
        ),
        expected,
        1e-9,
        'cut chain spectrum',
      )
    },
  ),
  check('2D torus spectrum is 2(cos(2 pi a/L) + cos(2 pi b/L))', () => {
    const side = 3
    const expected: number[] = []

    for (let a = 0; a < side; a++) {
      for (let b = 0; b < side; b++) {
        expected.push(
          2 *
            (Math.cos((2 * Math.PI * a) / side) +
              Math.cos((2 * Math.PI * b) / side)),
        )
      }
    }

    closeArray(
      spec(torusHoppingHamiltonian({ dimension: 2, side })),
      sortAsc(expected),
      1e-9,
      'torus spectrum',
    )
  }),
])

suite('operator/tight-binding: staggered mass and structure', [
  check('staggered mass = 0 reduces to the open chain spectrum', () => {
    const n = 6

    closeArray(
      spec(staggeredMassChainHamiltonian({ n, mass: 0 })),
      openChainSpectrum(n),
      1e-9,
      'mass 0 chain',
    )
  }),
  check(
    'staggered mass keeps the spectrum chiral-symmetric about 0',
    () => {
      const n = 6
      const s = spec(staggeredMassChainHamiltonian({ n, mass: 0.7 }))

      for (let i = 0; i < n; i++) {
        close(
          (s[i] ?? 0) + (s[n - 1 - i] ?? 0),
          0,
          1e-9,
          `chiral pair ${i}`,
        )
      }
    },
  ),
  check(
    'the staggered mass sits on the diagonal as (-1)^i * mass',
    () => {
      const n = 6
      const mass = 0.7
      const m = staggeredMassChainHamiltonian({ n, mass })

      for (let i = 0; i < n; i++) {
        close(
          m.data[i * n + i] ?? 0,
          (i % 2 === 0 ? 1 : -1) * mass,
          0,
          `diagonal ${i}`,
        )
      }
    },
  ),
  check('the Hamiltonians are symmetric', () => {
    symmetric(ringHoppingHamiltonian({ n: 6 }), 'ring')
    symmetric(
      weakBondChainHamiltonian({ n: 7, bondIndex: 3, weight: 0.4 }),
      'weak bond',
    )

    symmetric(
      torusHoppingHamiltonian({ dimension: 2, side: 3 }),
      'torus',
    )
  }),
])

suite('operator/tight-binding: mediator chain', [
  check('the region partition is contiguous and complete', () => {
    const med = mediatorChainHamiltonian({
      nA: 2,
      nM: 3,
      nB: 2,
      mediatorWeight: 1,
    })

    closeArray(med.regionA, [0, 1], 0, 'region A')
    closeArray(med.regionM, [2, 3, 4], 0, 'region M')
    closeArray(med.regionB, [5, 6], 0, 'region B')
    close(med.n, 7, 0, 'total size')
  }),
  check('mediator weight 1 is one uniform open chain', () => {
    const med = mediatorChainHamiltonian({
      nA: 2,
      nM: 3,
      nB: 2,
      mediatorWeight: 1,
    })

    closeArray(
      spec(med.h),
      openChainSpectrum(7),
      1e-9,
      'uniform mediator spectrum',
    )
  }),
  check(
    'severing the mediator (weight 0, no bypass) splits into three isolated blocks',
    () => {
      const med = mediatorChainHamiltonian({
        nA: 2,
        nM: 3,
        nB: 2,
        mediatorWeight: 0,
      })

      const expected = sortAsc([
        ...openChainSpectrum(2),
        ...openChainSpectrum(3),
        ...openChainSpectrum(2),
      ])

      closeArray(
        spec(med.h),
        expected,
        1e-9,
        'severed mediator spectrum',
      )
    },
  ),
])
