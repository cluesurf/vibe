# The Model DSL (vibe())

The committed Vibe Theory model as one fluent builder. This is the easiest way in. Call `vibe()` with no options and you get the working {3,4,3,4} model exactly as specified. The fluent setters let you express variants for comparison.

Import from `@/code/model/vibe`.

## The fluent API

Every setter returns a new builder, so calls chain. No string is ever evaluated. Options are named and dispatched.

| Method | What it does |
| --- | --- |
| `.size(n)` | Number of cells in the mesh. Defaults to 1000. |
| `.seed(s)` | Deterministic seed. Same seed gives the same run. Defaults to 1. |
| `.describe()` | Returns a readable spec block (a string) of the whole model at a glance. Good for printing. |
| `.build()` | Builds the mesh, tones, and fills. Returns a runnable `VibeWorld`. |
| `.run(beats)` | Runs the update rule for `beats` sweeps. Returns the same world, so it chains. |
| `.read()` | Reads the emergent structures off the settled mesh. Returns an object (below). |

Variant setters (for comparison, all optional): `.mesh(k)`, `.tone(k)`, `.fill(k)`, `.rule(k)`, `.schedule(k)`, `.grow(k)`. With none of these set you get the committed model.

`.read()` returns:

- `meanDegree` the average number of neighbors per cell.
- `lorentzAnisotropy` how far the mesh is from Lorentz-isotropic. Lower is better.
- `exponentialReach` boolean, whether ball growth is exponential (hyperbolic).
- `hamiltonianMin` smallest Laplacian eigenvalue.
- `hamiltonianBoundedBelow` boolean, whether the energy is bounded below.
- `integrationPhi` the integration measure of the whole mesh (how strongly it resists being cut apart).
- `higherVibes` count of coherent domains (the recursion: wholes within the whole).
- `toneHistogram` counts of each tone, `{ minus, zero, plus }`.

## Use it

```ts
import { vibe } from '@/code/model/vibe'

const world = vibe().size(1500).seed(1).build().run(40)
const result = world.read()

console.log(result.meanDegree)
console.log(result.higherVibes)
console.log(result.toneHistogram)
```

Print the model first if you want the spec at a glance:

```ts
console.log(vibe().describe())
```

Real usage lives in `test/experiment/foundations/dsl.ts`. It builds the committed model with `vibe().size(1200).seed(1).build().run(40)` and reads it, then swaps one setter (`.mesh('lattice')`) to express the Lorentz-violating lattice variant for comparison.

## Selves kit

For the self experiments there is a separate, lower-level toolkit at `@/code/model/self-kit`. It exposes the cohesive perception beat (`beat`), the discrete arrow (`discreteArrow`), cluster detection (`largestPositiveCluster`, `positiveClusters`), self emergence (`emergeSelf`), and stability measures (`selfLeakAndFidelity`, `clusterIntegration`). Reach for it when you study how selves form and hold together, not for the headline model.

## See also

- `note/library/api/substrate.md` for the mesh under the hood.
- `note/library/api/tone-and-rule.md` for the tones, fills, and the update rule.
