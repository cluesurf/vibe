# How the Library Works (Overview)

The high-level picture of what `@cluesurf/vibe`'s `code/` library contains, how it fits together, and what it is for. For the per-domain guides see the [readme](readme.md) map.

## What it is for

The library turns the vibe theory into runnable measurements. The theory says reality is a growing discrete crystal of experience, and the library is the bench where that idea is built, run, and checked against known physics. You generate a discrete substrate, run one local rule over it or build a field operator on it, and measure what emerges. Each question becomes a concrete experiment that either works or does not, and because everything is finite and seeded, every result is exactly reproducible.

The consumers of the library are the experiments in `test/experiment/` (matter, spin, holography, cosmology, selves) and the cross-tessellation survey. The library ships the science, the experiments prove it.

## The one pattern

Everything is a composition of four steps.

1. **Substrate.** A discrete geometry, a mesh of cells. A hyperbolic honeycomb, the {3,4,3,4} D4 coin, a flat lattice, a causal-set sprinkling.
2. **State.** A tone on the cells, the cellular state the rule acts on. Or no state, if you only want the geometry.
3. **Rule or operator.** Either run the reversible conserving local rule (the lattice gas) over the state, or build a matrix on the substrate (a Laplacian, a Dirac operator, a gauge operator) and diagonalize or evolve it.
4. **Measure.** Read a number off the result. A dimension, a curvature, a dispersion, an entanglement entropy, a return probability.

The model DSL (`vibe()`) wraps the committed version of this whole chain in one fluent line.

## What it contains (the layers)

| layer | folder | what it provides |
|:--- |:--- |:--- |
| substrates | `code/substrate`, `code/tool/mesh` | the discrete geometries, every regular hyperbolic tessellation, the D4 coin, flat lattices, sprinklings, the catalog |
| state and rule | `code/tone`, `code/rule` | the tone (one ternary value per direction per cell) and the reversible conserving local rule |
| operators | `code/operator` | matrices built on a substrate, the Laplacian, the Kahler-Dirac and overlap fermions, the gauge Dirac, the Landau levels |
| measures | `code/measure` | the read-a-number functions, geometry, relativity, quantum, fields, statistics, plus the cross-tessellation battery |
| dynamics | `code/dynamics` | search and sampling over states, MCMC, parallel tempering, lattice gauge, wave and walk evolution, renormalization |
| algebra | `code/algebra` | the symmetry algebra (D4 and F4 roots, quaternions, Clifford, the 24-cell triality, octonions and the J3(O) Jordan algebra) and the linear algebra (dense and sparse, the eigensolvers, the kernel-polynomial method, the Bethe resolvent) |
| the model | `code/model` | the committed model as a fluent DSL, the easiest entry point |
| tools | `code/tool` | the substrate-agnostic primitives, the seeded rng, graphs, posets, bitsets |
| drawing | `code/draw`, `code/render`, `code/compute` | the 2D drawing primitives, the render scripts, and the WebGPU compute runners |

A few smaller folders are specialized. `code/coarse` holds the coarse-graining and causal-emergence machinery for the selves work, `code/control` holds null and comparison generators, and `code/check` holds the base invariants (`conservesCharge`, `isReversible`).

## The two workflows

**The committed model, in one line.** When you just want the working {3,4,3,4} model, use the DSL. The defaults are the commitment.

```ts
import { vibe } from '@/code/model/vibe'
const world = vibe().size(1500).seed(1).build().run(40)
world.read()
```

**A custom experiment.** When you are asking a new question, compose the layers yourself. Build a substrate, put a state on it or build an operator, run or diagonalize, measure, and always include a control that could have failed. This is the experiment pattern in `../architecture.md`, held to the standards in `../experimental-methodology.md`.

```ts
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeGraph } from '@/code/tool/graph'
import { laplacian, laplacianSpectrum } from '@/code/operator/laplacian'

const cells = buildCellGraph({ symbol: [5, 3, 4], maxCells: 2000 })
const substrate = makeGraph({ size: cells.cellCount, directed: false, neighbors: cells.neighbors })
const spectrum = laplacianSpectrum({ substrate, count: 8 }) // the lowest eigenvalues
```

## Determinism and reproducibility

The base is deterministic. The library never relies on `Math.random`. Randomness, where it appears at all, is a seeded `makeRng` so the same call gives the same numbers, and robustness comes from varying the lattice SIZE, not from averaging over seeds. The base rule is integer arithmetic, so where a quantity should be exact the library asserts equality, not a tolerance. The result is that any reader running the same call gets the same number.

## See also

- [readme.md](readme.md), the map of the per-domain guides.
- `../architecture.md`, where code and tests live.
- `../experimental-methodology.md`, the standards.
- `../cross-tessellation-experiments.md`, running an experiment against every tessellation.
