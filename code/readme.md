# Vibe Theory Testbed

A discrete-spacetime simulator for Vibe Theory. One library that
generates a discrete substrate, runs a local rule over it in discrete
beats, and measures the emergent physics, so each open problem of the
program becomes a runnable measurement.

Everything is finite, discrete, and seeded, so every result is
reproducible. Real numbers appear only as measured outputs (coordinates,
eigenvalues, dimensions), never as the base.

## Layout

```
code/
  model/       the committed-model DSL (vibe.ts)
  tool/        rng, bitset, embedding, graph, graph-store, poset,
               substrate, gauge-field
  linalg/      complex, dense, sparse, eig-jacobi, eig-lanczos,
               eig-hermitian
  tone/        alphabet, configuration (the ternary tone and fill)
  substrate/   coxeter engine and the {3,4,3,4} cell graph with
               O(log n) addressing, hyperbolic-honeycomb,
               hyperbolic-graph, lattice, tiling-pq, sprinkle-minkowski,
               sprinkle-curved, grow-csg, layered-order
  rule/        rule, synchronous, asynchronous, reversible, rewrite,
               gauge
  operator/    laplacian, dirac (Kahler-Dirac), gauge-dirac,
               lattice-fermion, overlap (condensate, su2), evolution,
               ca-hamiltonian, block-ca, gauge-index
  measure/     dimension, order-stats, distance, curvature,
               manifoldlike, lorentz, navigation, bell, locality,
               integration, wilson-loop, aharonov-bohm
  dynamics/    action (Benincasa-Dowker), mcmc, uniform-sampler,
               wang-landau, parallel-tempering, exact-enumeration,
               coarsegrain, wilson, su2-lattice
  gpu/         WebGPU renderers (bulk, cusp gliders, gravity,
               horosphere, nesting)
  viz/         figure exports
  experiment/  one script per problem (p1 .. p240+), runner, report
  index.ts     public API barrel
```

## Install and run

From `deck/vibe/`:

```
pnpm install
pnpm test                                          # known-answer tests
pnpm call code/experiment/p190-spinor-triality.ts
pnpm call code/experiment/p193-ports-3434.ts
```

Each `pN` experiment is also a standalone script:
`npx tsx code/experiment/pN-*.ts`. Scan experiments write JSON and
markdown reports under `out/`.

## The experiments

Each numbered script answers one problem of the program, with the
statement in `note/questions/` and the finding in
`note/experiment/results/`. The series runs from the early kinematics
(substrates, dimension, distance, Lorentz, Laplacian and Dirac spectra,
CHSH), through the selection of the `{3,4,3,4}` substrate, the spinor
coin and three generations, the gauge and Standard-Model numbers,
gravity and holography, cosmology, and the emergent ladder of life and
mind. Recent flagship runs include:

| Script                     | Problem                                          |
| -------------------------- | ------------------------------------------------ |
| `p181-rarity-cascade.ts`   | the rarity cascade and the cosmic alive-fraction |
| `p185-causal-emergence.ts` | macro causation beating micro                    |
| `p187-radial-coherence.ts` | the radial coarse-graining tower (a negative)    |
| `p190-spinor-triality.ts`  | the `D4` spinor coin and three generations       |
| `p193-ports-3434.ts`       | the framework ported to `{3,4,3,4}`              |

## Conventions

ESM TypeScript. Path alias `~/*` maps to `code/*`. The discriminant
property is always `form`. Functions with two or more parameters take
one object input. Reproducibility is enforced by a seeded PRNG
(`~/tool/rng`), and nothing calls `Math.random` in a way that affects a
recorded result.

## Status

The kinematics is solid, the substrate selection and the spinor coin are
measured, and the harder pieces use documented approximations rather than
silent shortcuts, with each recorded negative reported alongside the
positives. See `note/questions/` for the open problems and
`note/experiment/results/` for the findings.

## License

MIT. See [../LICENSE](../LICENSE). Written results and figures are shared
under CC-BY-4.0 (attribution).

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Browse more open-source work on [GitHub](https://github.com/cluesurf).
