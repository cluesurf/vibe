# vibe-test

A discrete-spacetime / Vibe Theory testbed. One library that generates a
discrete substrate, runs a local rule over it, and measures the emergent
physics, so that each open problem of the program becomes a runnable
measurement.

Everything is finite, discrete, and seeded (reproducible). Real numbers
appear only as measured outputs (sprinkling coordinates, eigenvalues),
never as the base.

## Layout

```
code/
  core/        rng, bitset, embedding, graph, poset, substrate, gauge-field
  linalg/      complex, dense, sparse, eig-jacobi, eig-lanczos
  tone/        alphabet, configuration
  substrate/   sprinkle-minkowski, sprinkle-curved, lattice, tiling-pq,
               hyperbolic-graph, grow-csg
  rule/        rule, synchronous, asynchronous, reversible, rewrite, gauge
  operator/    laplacian, dirac (Kahler-Dirac), evolution, gauge-dirac
  measure/     dimension, distance, curvature, manifoldlike, lorentz, bell,
               locality, integration, wilson-loop, aharonov-bohm
  dynamics/    action (Benincasa-Dowker), mcmc, coarsegrain, wilson
  experiment/  runner (scans), report (JSON + markdown), p1..p9 scripts, test
  index.ts     public API barrel
```

## Install and run

Dependencies are not vendored. From `case/text/vibe/`:

```
pnpm install
pnpm test:sim                              # known-answer tests
pnpm sim code/experiment/p3-addressing-lorentz.ts
pnpm sim code/experiment/p7-bell.ts
```

Each `pN` experiment is also a standalone script:
`npx tsx code/experiment/pN-*.ts`. Scan experiments (p2, p7) write a
JSON and markdown report under `out/`.

## The experiments map to the open problems

| Script                     | Problem                                            |
| -------------------------- | -------------------------------------------------- |
| `p1-hamiltonian.ts`        | bounded-below Hamiltonian from a reversible rule   |
| `p2-dynamics.ts`           | a dynamics that makes manifold-like order dominate |
| `p3-addressing-lorentz.ts` | the addressing-versus-Lorentz fork                 |
| `p4-spinor.ts`             | the monist spinor (Kahler-Dirac spectrum)          |
| `p5-hauptvermutung.ts`     | does recovered geometry have low variance          |
| `p6-path-integral.ts`      | the 2D sum over histories                          |
| `p7-bell.ts`               | CHSH versus setting-state correlation              |
| `p8-gauge-fermion.ts`      | a U(1) gauge field plus a charged fermion          |
| `p9-integration.ts`        | structural correlates of a self                    |

See `note/questions/` for the problem statements and
`note/experiment/results/` for the findings.

## Conventions

ESM TypeScript. Path alias `~/*` maps to `code/*`. Discriminant property
is always `form`. Functions with two or more parameters take one object
input. Reproducibility is enforced by a seeded PRNG (`core/rng`).
Nothing calls `Math.random` in a way that affects a recorded result.

## Status of the physics

The kinematics (substrates, dimension, distance, Lorentz test, Laplacian
and Dirac spectra, CHSH) is solid. The harder pieces use honest
approximations, documented in each file: the MCMC repairs transitivity
by full closure (so it is for modest sizes), the Benincasa-Dowker action
uses the standard published coefficients, the U(1) gauge coupling to the
Dirac operator is a real-valued `cos(charge*phase)` stand-in for the
complex link, and the tiling generator wires the spanning tree exactly
only for the pentagrid `{5,4}`. These are the same research-grade gaps
the spec flags, not silent shortcuts.
