// Conformance for code/operator/lattice-fermion: the 2D lattice Dirac operators.
// The strongest independent checks are algebraic identities that hold to machine
// precision: the gamma (Pauli) matrices satisfy the Clifford relation
// {gamma_mu, gamma_nu} = 2 delta_munu I; the Wilson projectors (I +/- gamma)/2 are
// idempotent; the matrix sign squares to I; the naive operator has exactly 2^d
// doublers with zero net chirality (Nielsen-Ninomiya); and the overlap operator
// satisfies Ginsparg-Wilson exactly while the naive one does not.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import {
  Mat2,
  PAULI_X,
  PAULI_Y,
  PAULI_Z,
  GAMMA5,
  IDENTITY2,
  matMul,
  matAdd,
  matScaleReal,
  matFrobenius,
  hermitianSign,
  minSingularValue,
  ginspargWilsonResidual,
  naiveDirac2D,
  overlapDirac2D,
  latticeDiracEnergy1d,
  latticeFermionDoublers,
  brillouinZoneCorners,
  scanBrillouin,
} from '@/code/operator/lattice-fermion'

// Anticommutator {A, B} = AB + BA.
function anti(a: Mat2, b: Mat2): Mat2 {
  return matAdd(matMul(a, b), matMul(b, a))
}

// Distance of A from B in the Frobenius norm.
function dist(a: Mat2, b: Mat2): number {
  return matFrobenius(matAdd(a, matScaleReal(b, -1)))
}

const twoI = matScaleReal(IDENTITY2, 2)
const gammas: { name: string; m: Mat2 }[] = [
  { name: 'gamma1 = sigma_x', m: PAULI_X },
  { name: 'gamma2 = sigma_y', m: PAULI_Y },
]

suite('operator/lattice-fermion: Clifford algebra', [
  ...gammas.map(({ name, m }) =>
    check(`{${name}, itself} = 2I`, () => {
      close(dist(anti(m, m), twoI), 0, 1e-12, `${name} squares to I`)
    }),
  ),
  check('{gamma1, gamma2} = 0 (distinct gammas anticommute to zero)', () => {
    close(matFrobenius(anti(PAULI_X, PAULI_Y)), 0, 1e-12)
  }),
  check('gamma5 anticommutes with gamma1 and gamma2', () => {
    close(matFrobenius(anti(GAMMA5, PAULI_X)), 0, 1e-12, '{g5,g1}')
    close(matFrobenius(anti(GAMMA5, PAULI_Y)), 0, 1e-12, '{g5,g2}')
  }),
  check('gamma5^2 = I', () => {
    close(dist(matMul(GAMMA5, GAMMA5), IDENTITY2), 0, 1e-12)
  }),
  check('the Wilson projectors (I +/- gamma)/2 are idempotent', () => {
    for (const g of [PAULI_X, PAULI_Y]) {
      for (const sign of [1, -1]) {
        const p = matScaleReal(matAdd(IDENTITY2, matScaleReal(g, sign)), 0.5)
        close(dist(matMul(p, p), p), 0, 1e-12, `(I ${sign > 0 ? '+' : '-'} g)/2 squared`)
      }
    }
  }),
])

suite('operator/lattice-fermion: matrix sign', [
  check('sign(H) of a traceless Hermitian H is H / |H| and squares to I', () => {
    // H = [[2,1],[1,-2]], traceless, eigenvalues +/- sqrt(5).
    const h = matAdd(matScaleReal(PAULI_Z, 2), PAULI_X)
    const s = hermitianSign(h)
    const root = Math.sqrt(5)
    close(dist(s, matScaleReal(h, 1 / root)), 0, 1e-12, 'sign(H) = H/sqrt(5)')
    close(dist(matMul(s, s), IDENTITY2), 0, 1e-12, 'sign(H)^2 = I')
  }),
  check('sign(c * sigma_z) = sigma_z for c > 0', () => {
    close(dist(hermitianSign(matScaleReal(PAULI_Z, 3)), PAULI_Z), 0, 1e-12)
  }),
])

suite('operator/lattice-fermion: doublers and dispersion', [
  check('the naive operator has 2^d doublers and zero net chirality', () => {
    for (const [d, species] of [[1, 2], [2, 4], [3, 8]] as const) {
      const result = latticeFermionDoublers(d)
      equal(result.naiveSpecies, species, `naive species in ${d}D`)
      equal(result.netChirality, 0, `net chirality in ${d}D (Nielsen-Ninomiya)`)
      equal(result.wilsonSpecies, 1, `Wilson keeps 1 species in ${d}D`)
    }
  }),
  check('the Brillouin zone has 2^d corners', () => {
    equal(brillouinZoneCorners(2).length, 4, '2D corners')
    equal(brillouinZoneCorners(3).length, 8, '3D corners')
  }),
  check('the naive operator has 4 zero modes on a 4x4 grid (the doublers)', () => {
    const { species } = scanBrillouin({
      operator: ({ k1, k2 }) => naiveDirac2D({ k1, k2 }),
      gridSize: 4,
    })
    equal(species, 4, 'naive doublers at (0,0),(0,pi),(pi,0),(pi,pi)')
  }),
  check('minSingularValue: zero at k=0, one at k=(pi/2, 0) for the naive operator', () => {
    close(minSingularValue(naiveDirac2D({ k1: 0, k2: 0 })), 0, 1e-12, 'naive zero at origin')
    close(
      minSingularValue(naiveDirac2D({ k1: Math.PI / 2, k2: 0 })),
      1,
      1e-12,
      'naive |sin| = 1 at pi/2',
    )
  }),
  check('1D lattice Dirac energy is sqrt(m^2 + sin^2 k)', () => {
    close(latticeDiracEnergy1d({ k: 0, m: 0.7 }), 0.7, 1e-12, 'gap at k=0 is m')
    close(latticeDiracEnergy1d({ k: Math.PI / 2, m: 0 }), 1, 1e-12, 'massless at pi/2')
    close(
      latticeDiracEnergy1d({ k: 0.6, m: 0.4 }),
      Math.sqrt(0.16 + Math.sin(0.6) ** 2),
      1e-12,
      'general dispersion',
    )
  }),
])

suite('operator/lattice-fermion: Ginsparg-Wilson', [
  check('the overlap operator satisfies Ginsparg-Wilson to machine precision', () => {
    const points = [
      { k1: 0.5, k2: 0.7 },
      { k1: 1.3, k2: 2.1 },
      { k1: Math.PI / 2, k2: 0.2 },
    ]

    for (const k of points) {
      const d = overlapDirac2D({ ...k, m0: 1, r: 1 })
      close(ginspargWilsonResidual(d), 0, 1e-9, `GW residual at (${k.k1},${k.k2})`)
    }
  }),
  check('the naive operator does NOT satisfy Ginsparg-Wilson (residual > 0)', () => {
    const residual = ginspargWilsonResidual(naiveDirac2D({ k1: 0.5, k2: 0.7 }))
    ok(residual > 1e-6, 'naive GW residual must be nonzero')
  }),
  check('the overlap operator has a single massless mode on a 4x4 grid, GW max ~ 0', () => {
    const { species, gwResidualMax } = scanBrillouin({
      operator: ({ k1, k2 }) => overlapDirac2D({ k1, k2, m0: 1, r: 1 }),
      gridSize: 4,
    })
    equal(species, 1, 'overlap keeps exactly one species')
    close(gwResidualMax, 0, 1e-9, 'GW holds across the whole grid')
  }),
])
