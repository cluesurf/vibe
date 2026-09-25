# The strong force: SU(3) lattice gauge theory and quenched QCD

## Summary

Six new gauge-arena experiments, `E-FRC-0080` to `E-FRC-0085`, all L2, each with a control that
could have failed. They cover the strong-force cases the package had not simulated: colour
confinement, dynamical gluons, deconfinement, asymptotic freedom, and hadrons (a meson and a
baryon). Before this branch, confinement existed only in 3D SU(2), gluons only as a dimension count,
and hadrons not at all. The map, every number and every caveat are in
`note/experiment/gauge/strong-force.md`.

| code | claim | measured | control |
| --- | --- | --- | --- |
| E-FRC-0080 | 4D SU(3) confines | chi(3,3) / chi(2,2) = 0.76 +- 0.03 at beta 5.7 | U(1) photon 0.32, weak-coupling SU(3) 0.36 |
| E-FRC-0081 | gluon count, colour count, the three-quark invariant | 8.02 fields, N = 3.004, <(Re Tr U)^3> = 0.2500 | SU(2) 3.02 and U(1) 1.01 fields, invariant 0.00 for both |
| E-FRC-0082 | deconfinement at finite temperature | beta_c in [5.100, 5.163] on 8^3 x 2, published 5.09 | confined \|P\| scales 1.51 against 1.54 for zero, three center sectors to 0.0006 |
| E-FRC-0083 | anti-screening per unit C_A | kappa 0.0276 +- 0.0039 (SU(2)), 0.0285 +- 0.0024 (SU(3)) | U(1) rate 0.007 +- 0.005, tree intercepts agree |
| E-FRC-0084 | the pion is a Goldstone boson | d ln m_pi / d ln m_q = 0.439 | gluons off: 0.973 |
| E-FRC-0085 | the gluons make the nucleon mass | 14.3 times three free quarks at m_q = 0.05, 2.07 at m_q = 0 | gluons off: 3 asinh(m) to 0.1 percent |

## What changed

Library, each with a conformance block:

- `code/algebra/group/unitary-matrix.ts`: complex N x N matrices for U(1), SU(2), SU(3).
- `code/tool/hypercubic.ts`: periodic hypercubic geometry, one length per axis.
- `code/dynamics/gauge-lattice.ts`: Wilson action, exact heatbath (von Mises, Kennedy-Pendleton,
  Creutz, Cabibbo-Marinari), overrelaxation, center transformations, the ensemble loop.
- `code/measure/lattice-gauge-observable.ts`: plaquette and moments, Wilson loop table, Creutz
  ratios, Polyakov loop.
- `code/operator/staggered-fermion.ts`: Kogut-Susskind quarks and multi-mass propagators.
- `code/algebra/linear/conjugate-gradient.ts`: multi-shift CG.
- `code/measure/hadron-correlator.ts`: pion and nucleon correlators, effective masses, the quenched
  ensemble loop.
- `code/measure/jackknife.ts`, `code/tool/bisect.ts`, `weightedLinearFit` in `regression.ts`.

Tests: `test/experiment/gauge/{su3-area-law,gluon-count,su3-deconfinement,asymptotic-freedom,
quenched-hadrons}.ts`, their barrel imports and registry rows, 16 conformance checks, and the
regenerated catalog (925 experiments).

Notes: `note/experiment/gauge/strong-force.md` (new), the gauge arena readme (new section, count
85), the package readme count table.

## How it was tested

Run from the worktree root with the package's own tsx:

- `tsc --noEmit -p tsconfig.check.json`: exit 0.
- conformance battery: 126 passed, 0 failed, including the 16 new checks.
- `task/check-constants.ts`: 0 typed constants reaching a verdict.
- `task/check-labels.ts`: 0 contradicted labels, 0 registry rows missing from the barrel (the 20
  "review" rows are existing octonion files).
- `task/check-coverage.ts`: 0 unknown, 0 depth mismatches.
- each new experiment run alone: all six pass, numbers as above.
- the full suite, `test/run.ts`: see the result recorded below.

Before any experiment was written the library was checked against published values: the SU(3)
plaquette at beta 6.0 is 0.5937 (published 0.5937), and SU(2) at beta 2.3 is 0.6023 (published
0.6018).

## Honest status

- All six are L2. The gauge group and the Wilson action are chosen, not derived from the five base
  things. Whether SU(3) comes out of the {3,4,3,4} rule is still open, and it is the first item in
  the note's list of what to do next.
- E-FRC-0083 excludes a group-blind rise but cannot tell C_A from C_F scaling, which differ by only
  19 percent here. The verdict prints both pulls.
- The hadrons are quenched, in one 1.4 fm box at one lattice spacing. The lightest quark mass is not
  resolved for the nucleon by 12 configurations and is reported, not used.
- E-FRC-0081 and E-FRC-0083 were each revised once after a first run failed. The gluon count's
  cubic invariant was underpowered as a curvature fit, so it is now read from plaquette moments. The
  running experiment's "U(1) is flat" control was wrong, since compact U(1) drifts from its cos
  self-coupling, so it now measures that drift as the C_A = 0 point of r = alpha + kappa C_A. Both
  changes are described in the files.
- About eight minutes added to the suite.

## Follow-ups

- The L3 question: an SU(3) connection from the rule itself.
- Dynamical quarks (HMC) and string breaking, the chiral condensate, the rho in a larger box,
  the static potential with the Luscher term, glueballs, scaling.
- `code/tool/gauge-field.ts` still declares an unused `su3` form for the graph gauge field. It is a
  different abstraction from the hypercubic lattice here and was left alone.
- `note/experiment/readme.md` keeps a dated 2026-08-31 arena table (824 files) that is behind the
  catalog. It was not edited piecemeal.
