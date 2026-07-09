# The @cluesurf/vibe Library

A finite, deterministic, reproducible toolkit for the vibe physics framework. You build a discrete substrate, put a state on it, run a rule or build an operator, and measure what emerges. Everything is seeded and finite, so every result is exactly reproducible.

These are friendly, distilled guides for USING the library, not formal API reference. Each one covers a whole domain (many code files grouped into a few tables), with tiny snippets and pointers to real experiments. For how the whole thing fits together, read [overview.md](overview.md). For everything it solves for in one scannable page of tables, see [features.md](features.md).

## The core pattern

Almost everything is a composition of four steps.

```
substrate  ->  state        ->  rule / operator    ->  measure
(a mesh)       (the tone)       (evolve or matrix)     (a number)
```

Build a mesh, optionally put a tone state on it, either run the local rule or build a matrix (a Laplacian, a Dirac operator) on it, then read a number off the result. The model DSL wraps the committed version of this in one line.

## The map

| guide | what it covers | reach for it when |
|:--- |:--- |:--- |
| [api/model](api/model.md) | the `vibe()` fluent DSL, the committed {3,4,3,4} model in a few lines | you want the easy entry point |
| [api/substrate](api/substrate.md) | build a mesh, any hyperbolic honeycomb, the D4 coin, flat lattices, sprinklings, the tessellation catalog | you need a geometry to run on |
| [api/tone-and-rule](api/tone-and-rule.md) | the cell state (the tone) and the reversible conserving local rule (the lattice gas) | you want to run the base dynamics |
| [api/operator](api/operator.md) | matrices built on a substrate, the Laplacian, the Dirac operator, gauge operators | you want to diagonalize or evolve a field |
| [api/measure](api/measure.md) | read a number off a state, dimension, curvature, dispersion, entanglement, and more | you want to measure something |
| [api/dynamics](api/dynamics.md) | sampling, MCMC, lattice gauge, wave and walk evolution, renormalization | you want search, sampling, or time evolution |
| [api/algebra](api/algebra.md) | the symmetry algebra (D4, F4, quaternions, Clifford, octonions, Jordan) and the linear algebra (eigensolvers, KPM, Bethe) | you need spinors, roots, or an eigensolver |
| [api/tool](api/tool.md) | the substrate-agnostic primitives, the seeded rng, graphs, posets, bitsets | you need a building block |
| [api/computing-and-data-structures](api/computing-and-data-structures.md) | content-addressable associative memory and classic data structures realized on the hyperbolic bulk | you want to compute, search, or store on the mesh |
| [api/draw-and-render](api/draw-and-render.md) | the 2D drawing primitives, the render scripts, the WebGPU compute runners | you want a figure or a GPU run |

## The module reference (`code/`)

The `api/` guides above are task-oriented (WHICH function for WHICH job). For the
exact, exhaustive per-directory reference, every module with its key exports and
entry-point signatures, see the `code/` docs, one per source directory, grouped
by role in the pipeline.

The engine (`substrate -> tone -> rule -> dynamics -> coarse -> model`):

- [code/substrate](code/substrate.md) build the mesh (Coxeter honeycombs, the D4 coin, flat lattices, sprinklings)
- [code/tone](code/tone.md) the cell state (`Will`, `makeWill`, `fillWillPattern`, `charge`, `cellTone`)
- [code/rule](code/rule.md) the reversible local rule (`pairCollision`, `beat`, `inverseBeat`, `run`, `stream`)
- [code/dynamics](code/dynamics.md) sampling, MCMC, wave and walk evolution, lattice gauge
- [code/coarse](code/coarse.md) coarse-graining and selves (`extractUnits`, `countMatrix`, `spectralGap`, `emergenceGain`)
- [code/model](code/model.md) the `vibe()` fluent DSL and the committed model
- [code/geometry](code/geometry.md) geometric helpers on the mesh
- [code/algebra](code/algebra.md) the symmetry and linear algebra (D4, F4, Clifford, octonions, eigensolvers)

The analysis and controls:

- [code/measure](code/measure.md) observables and metrics (`fisherRaoDistance`, dimension, curvature, entanglement, `chsh`, RT scaling)
- [code/check](code/check.md) invariants and verification (`conservesCharge`, `isReversible`, `roundtrip`)
- [code/control](code/control.md) the null controls every L3 experiment beats (`scrambleNeighbors`, flat, `erasingCollision`)
- [code/operator](code/operator.md) matrices on the substrate (Laplacian, Kahler-Dirac, gauge)
- [code/compute](code/compute.md) the vibe computer and the compile backends
- [code/tool](code/tool.md) substrate-agnostic primitives (rng, graph, poset, bitset, mesh)

The rendering:

- [code/render](code/render.md), [code/draw](code/draw.md), [code/viz](code/viz.md) scenes, 2D drawing, and figures

## Deep dives (how the engines work inside)

The `api/` guides say WHICH function to call. These deep dives explain HOW each engine works, the algorithm and the idea, the layer under the API.

| deep dive | the engine it explains |
|:--- |:--- |
| [tessellation-engine](tessellation-engine.md) | the exact Coxeter reflection engine, classifies and builds any tessellation from its Schläfli symbol |
| [rule-engine](rule-engine.md) | the reversible charge-conserving directional lattice gas, collide-then-stream, why it is exactly reversible |
| [fermion-engine](fermion-engine.md) | the Kahler-Dirac operator, a fermion as forms on a cell complex, D = d + delta squaring to the Laplacian |
| [spinor-coin](spinor-coin.md) | the 24-direction D4 coin, the binary tetrahedral double cover, triality, the 2pi minus-one sign |
| [spectral-engine](spectral-engine.md) | the eigensolvers and spectral methods, Lanczos, the complex-Hermitian embedding, KPM, the Bethe resolvent |
| [causal-set-sampler](causal-set-sampler.md) | the discrete path integral over causal orders, the Benincasa-Dowker action and the uniform-measure MCMC |
| [evolution-and-propagation](evolution-and-propagation.md) | the leapfrog unitary evolution and the return-probability test for extended versus localized |
| [lattice-gauge-engine](lattice-gauge-engine.md) | gauge fields on links, the Wilson plaquette action, Metropolis sweeps, the coupled Schwinger evolution |
| [coarse-graining-and-selves](coarse-graining-and-selves.md) | coarse-graining the micro rule into macro levels, causal emergence, Markov blankets, the level tower, the null result |
| [associative-memory-engine](associative-memory-engine.md) | content-addressable memory on the mesh, Potter's parallel SITDAC search, the O(log N) broadcast, exponential capacity per radius |

## Start here

The fastest way in is the **model DSL**. The defaults are the committed model.

```ts
import { vibe } from '@/code/model/vibe'

const world = vibe().size(1500).seed(1).build().run(40)
console.log(world.read()) // the emergent structures read off the mesh
```

For custom work, the path is **substrate** then **tone-and-rule** (or **operator**) then **measure**. To write a new experiment, see `../architecture.md` (how to add one) and `../cross-tessellation-experiments.md` (how to run one against every tessellation).

## Conventions

- **Deterministic.** The library never uses `Math.random`. Use the seeded `makeRng` (see [api/tool](api/tool.md)) or `fillWillPattern`. Vary the lattice SIZE, not seeds.
- **The `@/` alias.** Every import is absolute through `@/`, which points at the package root. No relative imports across folders, no `.js` extensions, no `/index`.
- **Finite and exact.** Everything is finite. The base rule is integer arithmetic, so equalities are exact, not tolerant.

## Doc freshness

The `code/` module reference and the deep-dive engine docs were verified against
the current source in this pass. A few of the older `api/` using-guides have
known drift to fix:

- `api/draw-and-render.md` references the GPU runner as `code/gpu/...`, but the
  directory is `code/compute/`, and its render script names (`render-wave.ts`
  and friends) do not match the actual `code/compute/run-*.ts` files.
- `api/draw-and-render.md` lists the render validation folders as `533`, `73`,
  `534`, but the real `code/render/run/` subfolders are `3434`, `534`, `73`
  (there is no `533`, and `3434` is missing from the doc).
- `api/measure.md` says "70 files", but `code/measure/` now holds about 155.

When touching those areas, prefer the `code/<dir>.md` reference, which is
current.

## See also

- [overview.md](overview.md), how the library works in general, what it contains, what it is for.
- `../architecture.md`, where code and tests live, and how to add an experiment.
- `../experimental-methodology.md`, the standards every experiment meets.
- `../cross-tessellation-experiments.md`, how to run an experiment against every regular hyperbolic tessellation.
