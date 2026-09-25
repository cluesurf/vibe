# The Strong Force

The gauge arena's strong-force work, on the `experiment/strong-force` branch. It holds
twenty-one experiments, and every claim in them has a control that could have failed.

| codes | what | depth |
| --- | --- | --- |
| `E-FRC-0080` to `E-FRC-0092`, `E-FRC-0098`, and a rebuilt `E-FRC-0007` | SU(3) gauge theory and QCD simulated, each number mapped to a published value | L2 |
| `E-FRC-0093` to `E-FRC-0097` | does SU(3) come out of the committed {3,4,3,4} rule | L3 and L2 |
| `E-FRC-0099` | a three-valued cyclic link under a deterministic reversible rule, the center of SU(3) on its own | L2 |

## Why this exists

Before this branch the arena touched the strong force only from a distance.

| before | what it showed | what it did not |
| --- | --- | --- |
| [`E-FRC-0007`](../../../test/experiment/gauge/confinement.ts) | confinement | in 3D SU(2), with no control (now rebuilt, see below) |
| [`E-FRC-0038`](../../../test/experiment/gauge/non-abelian-3434.ts) | a non-abelian vertex on {3,4,3,4} | its "8 components = 8 gluons" is a dimension count |
| [`E-FND-0020`](../../../test/experiment/foundations/fermions-from-octonions.ts), [`E-FND-0021`](../../../test/experiment/foundations/gauge-group-from-octonions.ts) | colour and SU(3) from the octonions | algebra, no dynamics |
| [`E-FRC-0044`](../../../test/experiment/gauge/rg-unification.ts) | the strong coupling runs | a one-loop formula |
| [`E-SPN-0024`](../../../test/experiment/spin/nuclear-binding-curve.ts) | the nuclear binding curve | the semi-empirical mass formula |

## Part one: does the rule carry SU(3)

**No, and the obstruction is named.** Measured on the committed turning weave, run through
`beat` on the D4 mesh, with no random numbers anywhere. The details are in
[`su3-from-the-rule.md`](su3-from-the-rule.md).

| code | measured | control |
| --- | --- | --- |
| [`E-FRC-0093`](../../../test/experiment/gauge/rule-tone-symmetry.ts) (L3) | the tone keeps **2 of the 9** generators of U(3), the charge U(1) and the overall phase, at most 2 under all 12 triplet or antitriplet assignments. The gap to the first broken generator is 2688. None of the 35 nontrivial tone relabellings (S3, the Weyl group of SU(3)) survives `beat` at sides 3 and 5 | identity and swap maps give 9, pure streaming keeps all 36 relabellings |
| [`E-FRC-0094`](../../../test/experiment/gauge/rule-no-triplet-vertex.ts) | the coin holds 32 zero-sum triangles (16 A2 subsystems) and **no beat** puts one inside an interaction block | a whole-cell collision puts all 32 inside |
| [`E-FRC-0095`](../../../test/experiment/gauge/rule-coin-symmetry.ts) | of 995,328 candidate coin symmetries only the identity holds, so there is no order-three symmetry, no Z3 and no S3 | streaming keeps 1152, the previous knit 12 |

What SU(3) would need: by Schur-Weyl the only U(3)-symmetric line rules are do-nothing and
exchange, so the create, flip and annihilate clock (the arrow) is exactly what breaks U(3). Colour
would need that clock gone, amplitudes on the tone, and a new three-line vertex. That is a sixth
ingredient, not emergence.

The one gap the first pass left, an approximate symmetry appearing only after coarse-graining, is
[`E-FRC-0096`](../../../test/experiment/gauge/) and `0097`, also in the rule note.

## Part two: the strong force, simulated and mapped

Every number here is read off a simulation and compared to a published value, which is never an
input. All L2: the group and the action are chosen, then everything follows.

### Gluons and confinement

| code | question | measured | published or control |
| --- | --- | --- | --- |
| [`E-FRC-0080`](../../../test/experiment/gauge/su3-area-law.ts) | do SU(3) gluons confine | chi(3,3) / chi(2,2) = **0.76 +- 0.03**, an area law | U(1) photon 0.32, weak-coupling SU(3) 0.36, both Coulombic |
| [`E-FRC-0081`](../../../test/experiment/gauge/gluon-count.ts) | how many gluons and colours | **8.02** fields, **N = 3.004**, the three-quark invariant **0.2500** | SU(2) 3.02, U(1) 1.01, invariant 0 for both. Predicted 8, 3, 1/4 |
| [`E-FRC-0087`](../../../test/experiment/gauge/static-quarks.ts) | the static potential | sigma a^2 = **0.125 +- 0.021**, e = **0.34 +- 0.05** | e against pi / 12 = 0.262, pull 1.7. The photon has sigma = 0.0002 +- 0.0006 |
| [`E-FRC-0088`](../../../test/experiment/gauge/static-quarks.ts) | the scale, and how it runs | r0 / a = **3.23 +- 0.21** at 5.7 | Necco-Sommer 2.94, pull 1.4. The ratio to 5.9 against bare and E-scheme two-loop, see the verdict |
| [`E-FRC-0089`](../../../test/experiment/gauge/static-quarks.ts) | the glueball | variational m r0, see the verdict | continuum 4.21 (Morningstar and Peardon) |
| [`E-FRC-0007`](../../../test/experiment/gauge/confinement.ts) | 3D SU(2) to the continuum | sqrt(sigma) / g^2 extrapolates to **0.332 +- 0.06** | continuum 0.3353 (Teper), pull -0.06 |

### Temperature

| code | question | measured | published or control |
| --- | --- | --- | --- |
| [`E-FRC-0082`](../../../test/experiment/gauge/su3-deconfinement.ts) | does colour deconfine | beta_c in **[5.100, 5.163]** on N_t = 2 | published 5.09. Three center sectors at phase 0, 1, 2 x 2 pi / 3 to 0.0006. The confined loop scales 1.51 against 1.54 for zero |
| [`E-FRC-0098`](../../../test/experiment/gauge/su3-deconfinement.ts) | at what temperature | beta_c on N_t = 4, T_c r0, T_c in MeV | published 5.6925 and T_c r0 = 0.7498, about 296 MeV |
| [`E-FRC-0086`](../../../test/experiment/gauge/chiral-condensate.ts) | is chiral symmetry broken, and restored when hot | Sigma(0) = **0.286 +- 0.028** below T_c, **0.00014** above | the estimator reproduces the free condensate to 3.6e-14, with no noise vectors |

### Running

| code | question | measured | published or control |
| --- | --- | --- | --- |
| [`E-FRC-0083`](../../../test/experiment/gauge/asymptotic-freedom.ts) | does the coupling grow with distance, in proportion to what | kappa = **0.0221 +- 0.0063 / 0.0228 +- 0.0041 / 0.0232 +- 0.0033** from SU(2), SU(3), SU(4), largest pull 0.14. Adjoint over fundamental **0.979, 0.997, 0.982** | the tree level is computed exactly, 0.28713, and U(1) extrapolates to 0.2855 +- 0.0023. The source-charge alternative predicts 2.67, 2.25, 2.13 |

### Quarks

| code | question | measured | published or control |
| --- | --- | --- | --- |
| [`E-FRC-0084`](../../../test/experiment/gauge/quenched-hadrons.ts) | is the pion a Goldstone boson | d ln m_pi / d ln m_q near **0.44** | gluons off: 0.97, and 2 asinh(m) to 0.1 percent |
| [`E-FRC-0085`](../../../test/experiment/gauge/quenched-hadrons.ts) | do gluons make the nucleon mass | many times three free quarks at every resolved mass, still heavy at m_q = 0 | gluons off: 3 asinh(m) to 0.1 percent |
| [`E-FRC-0091`](../../../test/experiment/gauge/quenched-hadrons.ts) | the rho, and the ratios nature fixes | m_rho(0), m_N / m_rho at the physical point, J | 938 / 775 = 1.21, and J = 0.37 quenched against 0.48 experiment |
| [`E-FRC-0090`](../../../test/experiment/gauge/dynamical-quarks.ts) | do dynamical quarks break the string | Re P = **0.412 / 0.394** on 4^3 and 6^3 (volume independent). A center rotation costs **ln det = -60** | quenched falls 1.79 against 1.84 for zero, gauge action shifts by exactly 0. The determinant agrees with the hopping expansion to 0.06 percent, and HMC gives <exp(-dH)> = 1.00 |

## Part three: no randomness at the base

The Monte Carlo above uses a seeded generator, which is reproducible, a pure function of its seed,
but it samples an ensemble all the same. Two experiments put that on a deterministic footing.

- [`E-FRC-0092`](../../../test/experiment/gauge/deterministic-thermalization.ts): **deterministic,
  reversible SU(3) dynamics** (a Hamiltonian flow, fourth-order symmetric integrator) from a fixed
  plane-wave pattern, with no random number drawn. It thermalizes on its own: the momentum kurtosis
  goes from 1.5 to **2.997** and the eight colours hold **1/8 each to 0.0005**. Its own kinetic
  temperature, counted over the degrees of freedom the Gauss law leaves free, predicts beta' =
  **5.699**, and the heatbath at that beta agrees on the plaquette (**0.5504 against 0.5497**) and on
  the area law (**chi(2,2) 0.369 against 0.371**). The naive temperature is excluded at 306 sigma. An
  abelian start never moves energy into the charged colours. Leapfrog at step 0.05 left the
  plaquette 0.9 percent low, which is its shadow-Hamiltonian bias, and the fourth order removed it.
- `E-FRC-0099`: the **Z3 center on its own**, three cyclic values per link, under a reversible
  cellular automaton (the Z3 form of the Q2R rule), deterministic and exactly energy-conserving,
  against the heatbath. See its verdict.

The trace estimators went deterministic too. The chiral condensate reads the quark propagator
diagonal at fixed sites, since translation invariance makes every site equivalent. It uses no
noise vectors.

## Mappings to the correct values

The ideas that turned raw lattice numbers into comparisons with published ones:

| idea | where | what it fixed |
| --- | --- | --- |
| compute the tree level, do not fit it | `E-FRC-0083` | an exact rho_0 = 0.28713 made each rate a two-parameter line, and the fit that had resolved nothing came out at pull 0.14 |
| the E-scheme coupling from the plaquette | `E-FRC-0088` | bare two-loop running undershoots the published scale. The plaquette coupling is the standard remedy |
| dimensionless ratios in r0 units | `E-FRC-0088`, `0089`, `0098` | r0 / a, m r0, T_c r0 compare to continuum values directly |
| a variational basis over smearing levels | `E-FRC-0089` | the glueball mass from a correlator matrix, not one effective mass |
| the right Coulomb term for the dimension | `E-FRC-0007` | a 1 / R term in 3D read the tension 13 percent high, ln R brought it to 0.332 against 0.3353 |
| a representation test for the running | `E-FRC-0083` | adjoint and fundamental loops separate C_A from C_F, which groups alone could not |
| a fourth-order symmetric integrator | `E-FRC-0092` | removed the step-size bias that made deterministic dynamics look 0.9 percent off |

## The library these added

| module | what |
| --- | --- |
| `code/algebra/group/unitary-matrix` | complex N x N matrices for U(1), SU(2), SU(3), SU(4) |
| `code/tool/hypercubic` | periodic hypercubic geometry, one length per axis |
| `code/dynamics/gauge-lattice` | Wilson action, exact heatbath, overrelaxation, center transformations |
| `code/dynamics/gauge-smearing` | APE smearing of spatial links |
| `code/dynamics/gauge-molecular-dynamics` | deterministic reversible gauge dynamics, leapfrog and fourth-order, structured starts, kinetic temperature |
| `code/dynamics/dynamical-staggered` | HMC with staggered quarks, the quark force, exact log det, the hopping term |
| `code/dynamics/center-gauge` | Z_N gauge theory, the reversible automaton and the heatbath |
| `code/measure/lattice-gauge-observable` | plaquette and moments, fundamental and adjoint loops, static loops, Creutz ratios, Polyakov loop, glueball operators and correlator matrices |
| `code/measure/static-potential` | lattice Coulomb term, Sommer scale, the Necco-Sommer reference |
| `code/measure/wilson-loop-perturbation` | tree-level Wilson loops, exactly, on a finite box |
| `code/measure/hadron-correlator` | pion, rho, nucleon, effective masses, the quenched ensemble |
| `code/measure/chiral-condensate` | the noise-free condensate and the free momentum sum |
| `code/operator/staggered-fermion` | Kogut-Susskind quarks and multi-mass propagators |
| `code/algebra/linear/{conjugate-gradient,complex-cholesky,generalized-eigen}` | multi-shift CG, exact log det, the variational eigenproblem |
| `code/measure/jackknife`, `code/tool/bisect`, `weightedLinearFit`, `weightedLeastSquares` | binned errors, transitions, fits with errors |

Every module has a conformance block (137 checks pass). Each was checked against a published number
before the first experiment used it: the SU(3) plaquette at beta 6.0 on 6^4 is 0.5937, the
published value.

## Cost

The strong-force experiments add about forty minutes of suite time on one core. The heaviest are
the hadrons in the 2 fm box, asymptotic freedom over four groups, and the static potential
ensembles.

## What is still open

1. **SU(3) in the rule.** Measured absent. Colour needs a sixth ingredient.
2. **The Luscher term cleanly.** Needs R well above 0.5 fm, so boxes of 16^4 and more.
3. **Zero-temperature string breaking.** The thermal form is shown (`E-FRC-0090`). The potential
   flattening at 1.2 fm needs dynamical quarks in large boxes.
4. **Continuum limits in 4D.** Everything here is at one or two couplings, apart from 3D SU(2).
