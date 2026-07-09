# Architecture and Conventions

How this package is organized, and where new things go. Read this before
adding a file. The goal is one obvious home for every concept, so the
code and the tests never drift apart.

## The two trees

```
code/   the library. Pure science. No test harness, no assertions.
test/   everything test-related. Imports code/, never the reverse.
```

The rule that keeps them clean:

- **`code/` never imports `test/`.** The library does not know the tests
  exist.
- **`test/` imports `code/` freely.** A test is `code/` plus an
  assertion.
- A render script or a verify script lives in `code/` only if it is a
  tool the library ships. A check that asserts a scientific claim lives
  in `test/`.
- **Any potentially reusable logic MUST live in `code/`, never inline in
  `test/`.** If a function computes a named quantity, runs a dynamics or
  rule step, builds a substrate or graph, applies a geometric or
  algebraic transform, or is a measure, it is a library capability and
  belongs under `code/` (by category, see the decision guide below) EVEN
  IF only one experiment uses it today, and even if it has tuned
  constants (parameterize them). An experiment must stay THIN, keeping
  inline ONLY its irreducible identity, the `run()` body that wires
  library calls for this one claim, its specific check/verdict and
  pass-criterion thresholds (the `solved` logic), and any initial
  condition that hardcodes this experiment's own pattern. The test is
  "could this function have a sensible standalone name and docstring
  that another file might call?" If yes, it goes in `code/`. The rule is
  "no general capability inline in `test/`", what remains in an
  experiment is the science, not the library.

## The path alias

Every import is absolute through the `@/` alias, which points at the
package root.

```ts
import { d4Mesh } from '@/code/tool/mesh'
import { verdict } from '@/test/scaffold/verdict'
```

No relative imports across folders. No `.js` extensions. No `/index`
suffix. A file ends at the directory: `from '@/code/draw/color'`, never
`from '@/code/draw/color/index'`.

## code/ — the library

Each subfolder is one concern. The taxonomy:

| folder            | what lives here                                   | examples                                                                                      |
|:--- |:--- |:--- |
| `tool/`           | substrate-agnostic primitives                     | `mesh`, `integer` (modulo), `rng`, `bitset`, `graph`, `poset`                                 |
| `geometry/`       | hyperbolic and Minkowski geometry                 | `distance` (the one hyperbolic distance)                                                      |
| `algebra/linear/` | dense and sparse linear algebra, spectral methods | `complex`, `complex-vector`, `dense`, `eig-*`, `kernel-polynomial` (KPM), `bethe-resolvent`   |
| `algebra/group/`  | the symmetry algebra of the coin                  | `root-system` (D4, F4), `cell-24`, `quaternion`, triality                                     |
| `substrate/`      | the mesh builders                                 | `coxeter/`, `hyperbolic-honeycomb`, `lattice`, `sprinkle-minkowski`                           |
| `rule/`           | the update rules                                  | `lattice-gas` (the engine), `collision` (the 9-state + 24-slot D4 table)                      |
| `tone/`           | the cell state                                    | `will` (the directional fill), `alphabet`, `configuration`                                    |
| `operator/`       | matrices built on a substrate                     | `laplacian`, `dirac`, `lattice-fermion`, `block` (the shared 2x2 assembler), `dirac-skyrmion` |
| `measure/`        | read a number off a state                         | `dimension`, `distance`, `lorentz`, `light-cone`, `bell`, `integration`                       |
| `dynamics/`       | search and sampling over states                   | `mcmc`, `action`, `parallel-tempering`, `su2-lattice`                                         |
| `coarse/`         | coarse-graining and the emergent-self layer       | `macro-unit`, `causal-emergence`, `self-trajectory`, `individuality`, `level-stack`           |
| `control/`        | the null and comparison generators                | `null` (a random baseline)                                                                    |
| `check/`          | the base invariants as predicates                 | `invariant` (conservesCharge, isReversible), `verify-*` scripts                               |
| `model/`          | the committed model as a fluent DSL               | `vibe`                                                                                        |
| `compute/`        | the GPU compute runners and shaders               | `run-*`, `wave.wgsl`                                                                          |
| `draw/`           | 2D drawing primitives                             | `color` (the tone palette), `vector`, `raster` (canvas, disk), `animation` (frames)           |
| `render/`         | the executable render scripts                     | `run/<substrate>/<theme>/*`                                                                   |
| `viz/`            | visualization data exports (numbers a figure consumes) | `clock-24`, `curvature`, `horosphere-export`, `gravity-test`                             |

### The decision guide, where does X go

- **A number read off a state** is a `measure/`.
- **A matrix built from a substrate** is an `operator/`.
- **A reusable numerical algorithm** (a solver, a spectral method) is
  `algebra/linear/`, even if only one experiment uses it today. KPM and
  the Bethe resolvent were pulled out of experiments for exactly this
  reason.
- **A substrate-agnostic helper** (modulo, a graph, an rng) is `tool/`.
- **A symmetry-group construction** (roots, quaternions, triality) is
  `algebra/group/`.
- If two files share a chunk of math, **hoist it to the lowest common
  folder** and import it. One source of truth per concept: the
  hyperbolic distance, the collision table, the tone palette, the 2x2
  block assembler each exist once.

### The substrate engine pattern

The directional lattice gas is the v10 committed substrate. Four pieces
compose it:

- **`Mesh`** (`tool/mesh`): a fixed cell count, a coin of `degree`
  directions, a `neighbour(cell, direction)`, and an
  `opposite(direction)`. `squareMesh` (4), `cubicMesh` (6, the {4,3,4}
  cusp), `d4Mesh` (24, the {3,4,3,4} coin that carries spin).
- **`Will`** (`tone/will`): one ternary tone per direction per cell, an
  `Int8Array`. The scalar charge of a cell is the sum of its slots.
- **`Collision`** (`rule/collision`): a local in-place map on one cell's
  slots, charge-conserving and reversible. `pairCollision` runs the
  9-state pair table on opposite pairs (the 24-slot D4 collide).
  Involutions are their own inverse, the pair table is a bijection, so
  it has a paired inverse.
- **`lattice-gas`** (`rule/lattice-gas`): `beat` = collide then stream.
  `inverseBeat` un-streams then collides with the inverse. Generic over
  any `Mesh`.

To run the rule: build a `Mesh`, `makeWill(mesh)`, fill it, then
`beat`/`run` with a `Collision`. To check it: `conservesCharge` and
`isReversible` from `check/invariant`.

## test/ — the tests

```
test/
  run.ts          the runner: imports the barrel, runs the registry + conformance
  catalog.ts      generates catalog.csv from the registry
  test.ts         the legacy oracle (kept until the last bundled check is reconciled)
  scaffold/       the harness
    suite.ts        experiment, allExperiments, runSuite, the Category type
    verdict.ts      the Verdict type and verdict()
    numeric.ts      shared numeric helpers (allFinite)
  suite/          selections over the registry
    conformance.ts  the library unit tests (bitset, poset, Dirac, samplers)
    battery.ts      regression, paper, crown-jewels filters
  experiment/
    all.ts          the barrel: side-effect imports every experiment for registration
    <category>/     the experiments, by domain
```

### How to add an experiment

An experiment is one file under `test/experiment/<category>/` that calls
`experiment` and returns a `Verdict`. The pattern:

```ts
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'relativity/light-cone',      // '<category>/<slug>', unique
  code: 'E-RLT-0007',               // stable E-<arena>-<number>, arenas in test/codes.csv
  title: 'one sentence, the headline',
  category: 'relativity',           // from the Category union in suite.ts
  substrates: ['3434'],             // or 'any'
  depth: 'L2',                      // the depth rubric, see below
  paper: true,                      // is this a headline result
  run() {
    const measured = someMeasure({ ... })
    const ok = measured === expected
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: 'one plain sentence of what was shown',
      metrics: { measured },        // the numbers, flat Record<string, number>
      // notes: an honest caveat, only if the result is not what it looks like
    })
  },
})
```

### The depth rubric

The grade states what a result actually establishes, not whether it
prints PASSED. This is the authoritative rubric from
`experimental-methodology.md`. Read it.

| depth | what it establishes                                                                                                                                                                  |
|:--- |:--- |
| `L0`  | **circular**, the answer was put in by hand. Proves nothing. Relabel or delete.                                                                                                      |
| `L1`  | **known math**, correctly confirms an established mathematical fact (the 24-cell is the binary tetrahedral group, a 2pi rotation gives minus one).                                   |
| `L2`  | **known physics**, reproduces a known construction on this substrate (a Dirac quantum walk, lattice gauge theory, a ballistic light cone).                                           |
| `L3`  | **emergent and novel**, a single base rule produces the result as a measured consequence, with a control, ideally a quantitative prediction that could be wrong. The genuine target. |

Grade honestly. Most results in a young program are L1 and L2, and that
is fine, as long as they are labeled as such. Never let an L1 or L2
masquerade as L3. An algebra fact (SP1, the 2pi sign on the coin) is L1,
the dynamical version (a spinor carrying the sign under the rule) is the
L3 target.

Rules that the runner enforces:

- **One check, one experiment.** A file may call `experiment` more than
  once (the first as `export default`, the rest as bare statements).
  Registration is a side effect of import, so the barrel picks them all
  up.
- **An L3 claim must carry a `control`.** `runSuite` downgrades a
  controlless L3 to `partial`, and `run.ts` hard-fails on any partial. A
  deep emergent claim without a null baseline is not a claim. If you
  cannot supply a control, the result is L2.
- **State the honest negative.** Every experiment must be able to fail.
  Never read an imposed ingredient (a seed, cohesion, a tuned coupling)
  as emergence. If a phenomenon needs an extra ingredient, that is a
  finding to report in `notes`, not a knob to turn quietly.
- **No `pN` ids.** The old `P36`-style ids are gone. Use a descriptive
  slug. The `paper` flag and `title` carry the meaning.

After adding a file, also add its side-effect import to
`test/experiment/all.ts` (the barrel), add its row to
`test/registry.csv` (the code to file map), and regenerate the catalog
with `npx tsx test/catalog.ts`. Files that are helpers, not tests, simply
do not call `experiment`, they are inert in the registry.

To write an experiment that runs against ALL the regular hyperbolic
tessellations (not one pinned substrate), see
`cross-tessellation-experiments.md`: loop the catalog in
`code/substrate/tessellation-catalog`, measure each with the battery in
`code/measure/tessellation-battery`, and mark the experiment
`substrates: 'any'`. The canonical example is
`test/experiment/substrate-survey/tessellation-survey`.

### The conformance battery

`test/suite/conformance.ts` holds the unit tests of the `code/`
primitives themselves: the bitset, the poset, the Laplacian, the lattice
fermions, the causal-set samplers. These are not physics claims, so they
do not live in the registry. They are the floor the science stands on.

## Running things

```
pnpm test        the structured suite: registry + conformance (the gate)
pnpm test:full   the above plus the legacy oracle (test.ts), for cross-checking
pnpm call <file> run any script, e.g. a render or a compute runner
```

**No ad-hoc assertion scripts in `code/`.** A file that checks a claim
with `console.log('ok'/'FAIL')` and `process.exit(1)` is a test wearing
the wrong hat. It belongs in `test/` through the harness:

- A claim about the **science** (the coin's D4 algebra, the rule's
  conservation and reversibility) is a `experiment` under
  `test/experiment/`. The substrate invariants live in
  `test/experiment/foundations/{coin-algebra, directional-rule}`.
- A check that a **`code/` primitive is correct** (a sampler, the linear
  algebra) is a block in `test/suite/conformance.ts`.

`code/` ships science. `test/` proves it. Keep them apart.

**The one exception:** a GPU compute runner in `code/compute/` may
self-check against a CPU reference and print a pass or fail, because it
needs a real GPU and so cannot run in the headless suite. That is a
runner with a built-in check, not a test masquerading as library code.
Everything that CAN run headless belongs in `test/`.

## Conventions

- **Full English words in names**, files and identifiers. Only DNA-level
  acronyms (`id`, `url`, `uuid`, `png`, `svg`, `rgba`) are allowed.
  `vector` not `vec`, `algebra/linear` not `linalg`, `initialDocument`
  not `initialDoc`.
- **kebab-case** for files and folders.
- **Object params** for any function with two or more arguments:
  `function f(input: { a, b })`, not `f(a, b)`.
- **`form` is the discriminant** for every tagged union, never `type` or
  `kind`.
- **Hoist constant arrays and lookup tables** to module scope.
- **Name the function, no IIFE.** Assign to a const, then call it.
- **No semicolons or em-dashes in prose** (comments, docs, claim
  strings). Short sentences.
- **This doc and all package docs are self-contained.** Never reference
  paths outside this package. The research program notes live elsewhere
  in the monorepo.
