// Conformance for code/algebra/group/clifford: the Pauli and Dirac gamma matrices,
// the spin generator, and the Clifford / Coxeter rotors. The expected results are
// the defining algebra relations: sigma_i^2 = I and {sigma_i,sigma_j}=2 delta_ij,
// {gamma_mu,gamma_nu}=2 eta_mu_nu, gamma5^2=I anticommuting with each gamma, the
// Dirac H^2 = (m^2+|p|^2) I, and the spinor double cover (a 2pi rotor = -I, 4pi = I).

import { suite, check, ok, exactArray } from '@/test/code/harness'
import {
  type Complex,
  complex,
  cMul,
} from '@/code/algebra/linear/complex'
import {
  type ComplexMatrix,
  pauli,
  diracGamma,
  diracGamma5,
  minkowski,
  diracHamiltonian,
  spinGeneratorZ,
  cliffordRotor,
  coxeterEdgeRotor,
  cmMultiply,
  cmAntiCommutator,
  cmCommutator,
  cmScale,
  cmIdentity,
  cmZero,
  cmEquals,
  cmPower,
} from '@/code/algebra/group/clifford'

const c = (re: number, im: number): Complex => complex({ re, im })

// Multiply every entry of a matrix by a complex scalar (used to build i * M, 2i * M).
const scaleByComplex = (
  matrix: ComplexMatrix,
  z: Complex,
): ComplexMatrix => matrix.map(row => row.map(value => cMul(value, z)))

const TOL = 1e-12

suite('algebra/group/clifford: Pauli algebra', [
  check('sigma_1, sigma_2, sigma_3 each square to the identity', () => {
    const [, s1, s2, s3] = pauli()

    ok(
      cmEquals(cmMultiply(s1!, s1!), cmIdentity(2), TOL),
      'sigma_1^2 = I',
    )

    ok(
      cmEquals(cmMultiply(s2!, s2!), cmIdentity(2), TOL),
      'sigma_2^2 = I',
    )

    ok(
      cmEquals(cmMultiply(s3!, s3!), cmIdentity(2), TOL),
      'sigma_3^2 = I',
    )
  }),
  check('distinct Paulis anticommute: {sigma_i, sigma_j} = 0', () => {
    const [, s1, s2, s3] = pauli()
    const zero = cmZero(2, 2)

    ok(cmEquals(cmAntiCommutator(s1!, s2!), zero, TOL), '{s1,s2} = 0')
    ok(cmEquals(cmAntiCommutator(s1!, s3!), zero, TOL), '{s1,s3} = 0')
    ok(cmEquals(cmAntiCommutator(s2!, s3!), zero, TOL), '{s2,s3} = 0')
  }),
  check('the Pauli product law: sigma_1 sigma_2 = i sigma_3', () => {
    const [, s1, s2, s3] = pauli()

    ok(
      cmEquals(cmMultiply(s1!, s2!), scaleByComplex(s3!, c(0, 1)), TOL),
      's1 s2 = i s3',
    )
  }),
  check(
    'the Pauli commutator: [sigma_1, sigma_2] = 2 i sigma_3',
    () => {
      const [, s1, s2, s3] = pauli()

      ok(
        cmEquals(
          cmCommutator(s1!, s2!),
          scaleByComplex(s3!, c(0, 2)),
          TOL,
        ),
        '[s1,s2] = 2 i s3',
      )
    },
  ),
])

suite('algebra/group/clifford: Dirac gamma algebra', [
  check('the Minkowski metric is diag(1,-1,-1,-1)', () => {
    exactArray(minkowski, [1, -1, -1, -1], 'eta = diag(1,-1,-1,-1)')
  }),
  check(
    'the Clifford relation {gamma_mu, gamma_nu} = 2 eta_mu_nu I',
    () => {
      const gamma = diracGamma()
      const identity = cmIdentity(4)
      const zero = cmZero(4, 4)

      for (let mu = 0; mu < 4; mu++) {
        for (let nu = 0; nu < 4; nu++) {
          const anti = cmAntiCommutator(gamma[mu]!, gamma[nu]!)

          if (mu === nu) {
            const expected = cmScale(identity, 2 * minkowski[mu]!)

            ok(cmEquals(anti, expected, TOL), `{g${mu},g${mu}} = 2 eta`)
          } else {
            ok(cmEquals(anti, zero, TOL), `{g${mu},g${nu}} = 0`)
          }
        }
      }
    },
  ),
  check(
    'gamma5^2 = I and gamma5 anticommutes with every gamma_mu',
    () => {
      const gamma = diracGamma()
      const gamma5 = diracGamma5()

      ok(
        cmEquals(cmMultiply(gamma5, gamma5), cmIdentity(4), TOL),
        'gamma5^2 = I',
      )

      const zero = cmZero(4, 4)

      for (let mu = 0; mu < 4; mu++) {
        ok(
          cmEquals(cmAntiCommutator(gamma5, gamma[mu]!), zero, TOL),
          `{gamma5, g${mu}} = 0`,
        )
      }
    },
  ),
  check('the Dirac Hamiltonian squares to (m^2 + |p|^2) I', () => {
    const input = { px: 1, py: 2, pz: 3, mass: 4 }
    const h = diracHamiltonian(input)
    const energySquared =
      input.mass * input.mass +
      input.px * input.px +
      input.py * input.py +
      input.pz * input.pz

    ok(
      cmEquals(
        cmMultiply(h, h),
        cmScale(cmIdentity(4), energySquared),
        1e-10,
      ),
      'H^2 = (m^2 + p^2) I, so E = +/- sqrt(m^2 + p^2)',
    )
  }),
])

suite('algebra/group/clifford: spin double cover', [
  check(
    'the spin generator squares to (1/4) I (eigenvalues +/- 1/2)',
    () => {
      const s = spinGeneratorZ()

      ok(
        cmEquals(cmMultiply(s, s), cmScale(cmIdentity(4), 0.25), TOL),
        'S_z^2 = 1/4 I',
      )
    },
  ),
  check('a 2pi spinor rotation is -I, a 4pi rotation is +I', () => {
    // bivector B = i * (2 S_z) = i * diag(sigma3, sigma3); B^2 = -I.
    const twoSpin = cmScale(spinGeneratorZ(), 2)
    const bivector = scaleByComplex(twoSpin, c(0, 1))
    const rotor2pi = cliffordRotor({
      angle: 2 * Math.PI,
      bivector,
      size: 4,
    })

    const rotor4pi = cliffordRotor({
      angle: 4 * Math.PI,
      bivector,
      size: 4,
    })

    ok(
      cmEquals(rotor2pi, cmScale(cmIdentity(4), -1), 1e-12),
      'exp(2pi) rotor = -I (the spinor sign)',
    )

    ok(
      cmEquals(rotor4pi, cmIdentity(4), 1e-12),
      'exp(4pi) rotor = +I (a spinor needs two full turns)',
    )
  }),
])

suite('algebra/group/clifford: Coxeter edge rotor', [
  check('the order-m edge rotor: R^m = -I and R^(2m) = +I', () => {
    for (const m of [2, 3, 4, 6]) {
      const rotor = coxeterEdgeRotor(m)
      const minusIdentity = cmScale(cmIdentity(4), -1)

      ok(
        cmEquals(cmPower(rotor, m), minusIdentity, 1e-10),
        `R^${m} = -I (a 2pi loop where ${m} cells meet)`,
      )

      ok(
        cmEquals(cmPower(rotor, 2 * m), cmIdentity(4), 1e-10),
        `R^${2 * m} = +I (the 4pi return)`,
      )

      // R^m must be genuinely -I, not accidentally +I.
      ok(
        !cmEquals(cmPower(rotor, m), cmIdentity(4), 1e-6),
        `R^${m} is -I, not +I`,
      )
    }
  }),
])
