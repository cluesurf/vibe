# code/model

The committed model, the top of the pipeline (`substrate -> tone -> rule -> dynamics -> coarse -> model`). Everything below builds the crystal, this layer commits to one configuration of it and hands you a fluent one-line entry point. `vibe.ts` is the DSL: it wraps a whole substrate-tone-rule-run-measure chain behind `vibe()...build().run().read()`, with the committed {3,4,3,4} choices as the defaults. The other four files are the self and agency kit: `self-kit.ts` is the shared dynamics the selves experiments run on (graph builders, the cohesive beat, cluster and integration measures), and `deliberation.ts`, `selection.ts`, and `trajectory.ts` model choice, variation-and-selection, and agency as counterfactual impact.

## Modules

| file | key exports | what it is |
| ---- | ----------- | ---------- |
| `vibe.ts` | `vibe`, `VibeBuilder`, `VibeWorld`, `VibeConfig` | the fluent DSL for the committed model, the easiest entry point |
| `self-kit.ts` | `emergeSelf`, `beat`, `flatGraph`, `bulkGraph`, `clusterIntegration`, `largestPositiveCluster` | the selves experiments' shared graph, dynamics, and measures |
| `deliberation.ts` | `makeSelf`, `settle`, `settleWithInjection`, `selfCoherence`, `consensusStep` | deterministic choice as Hopfield settling under an urge bias |
| `selection.ts` | `evolvePopulation` | deterministic variation-and-selection over ternary genomes |
| `trajectory.ts` | `runTrajectory`, `steeringImpact`, `multiAgentTrajectory` | agency measured as an agent's counterfactual impact on a decaying world |

## The vibe() DSL (`vibe.ts`)

`vibe()` returns a `VibeBuilder` preloaded with the committed defaults. Chain setters, `build()` into a `VibeWorld`, `run()` the beats, `read()` the emergent measures.

Builder setters (each returns the builder, so they chain):

- `mesh(kind)` picks the substrate, `'hyperbolic' | 'dodecagrid' | 'coxeter' | 'lattice' | 'sprinkle'`.
- `tone(kind)` picks the tone range, `'ternary' | 'binary'`.
- `fill(kind)` picks the seed fill, `'ternary-symmetric' | 'ternary-directed'`.
- `rule(kind)` picks the update rule, `'signed-majority'`.
- `schedule(kind)` picks the timing, `'asynchronous' | 'synchronous'`.
- `grow(kind)` picks the growth mode, `'net-positive' | 'static'`.
- `size(n)` sets the node count, `seed(s)` sets the RNG seed.
- `config(): VibeConfig` freezes and returns the current config. `describe(): string` gives a human-readable spec block for a paper or doc.
- `build(): VibeWorld` instantiates the runnable world.

The world:

- `run(beats): VibeWorld` runs the rule for `beats` beats and returns itself, so runs chain.
- `read()` reads the emergent structures off the settled mesh, `{ meanDegree, lorentzAnisotropy, exponentialReach, hamiltonianMin, hamiltonianBoundedBelow, integrationPhi, higherVibes, toneHistogram }`.

```ts
import { vibe } from '@/code/model/vibe'
const world = vibe().size(1500).seed(1).build().run(40)
world.read()
```

## The self kit (`self-kit.ts`)

The shared substrate and dynamics for the selves experiments. Note, the `beat` here adds a **cohesion** bias, which is not one of the base five pieces (that caveat is spelled out in [coarse-graining-and-selves.md](../coarse-graining-and-selves.md)).

- Graph builders: `flatGraph(L)` (triangular 6-neighbour), `squareGraph(L)` (the exact {4,4} horosphere), `bulkGraph(maxCells)` (the dodecagrid bulk), `horosphereGraph(maxCells, bandHalfWidth?)` (a horosphere band). All return a CSR `Graph`. `toCSR(neighbors, coords?)` converts an adjacency list.
- Topology: `ball(g, center, radius)`, `boundaryFraction(cells, g)` (leakiness), `degreeOf(g, v)`.
- Dynamics: `beat(tone, g, moved, rng, arrow, cohesion)` runs one cohesive update in place (annihilate opposites, cohesive hop, spawn pairs). `totalCharge(t)`, `sameSignNeighbors(tone, g, c, sign)`, `discreteArrow(tone, g, beatIndex, period)` (deterministic pair creation).
- Clustering: `largestPositiveCluster(tone, g)`, `positiveClusters(tone, g)`, `countLargeSameSignComponents({ tone, g, minSize, sign?, cells? })`, `clusterIntegration(cluster, g)` (the phi proxy, fraction of internal edges).
- Emergence: `emergeSelf(g, rng, moved, opts?)` seeds a low-density net-positive fill, runs to settle, and returns `{ tone, cluster }`. `selfLeakAndFidelity({ g, seed, settleBeats?, cohesion? })` returns leak per beat and passive fidelity.

## Choice, selection, agency

- `deliberation.ts` models a choice as **Hopfield settling** under an added urge. `makeSelf({ n, patterns, seed })` builds stored attractors. `settle({ patterns, coupling, urge, urgeWeight, init, maxBeats? })` relaxes to a fixed point, `settleTrace` keeps the trajectory, `settleWithInjection` pins some sites to an exogenous input (showing how uncaused input erodes authorship). `selfCoherence(state, patterns)` measures how authored the act is, `consensusStep(subs, coupling)` binds sub-selves toward their aggregate.
- `selection.ts` has `evolvePopulation({ n, populationSize, generations, select })`, deterministic variation and rank selection over ternary genomes (or a no-selection control), returning start and end mean fitness.
- `trajectory.ts` measures agency as counterfactual impact. `runTrajectory({ m, beats, effort, agent, steered })` runs a decaying ring world with an agent (`'self'` goal-directed repair, `'rock'` fixed pattern, `'none'`) and returns the distance-to-goal trace. `steeringImpact(...)` compares the steered run against an ablated one (`impact = ablatedFinal - steeredFinal`). `multiAgentTrajectory(...)` runs several sub-policies whose integration versus fragmentation decides success.

## Used by

- **Narrated in** the consumer guide [api/model.md](../api/model.md) (the `vibe()` DSL) and [coarse-graining-and-selves.md](../coarse-graining-and-selves.md) (the self-kit dynamics and the cohesion caveat).
- **Consumed by** almost every arena through `vibe()`, and by the selves experiments directly through `self-kit.ts`.
- **Example arenas** `test/experiment/selves/` (uses `self-kit.ts`, `deliberation.ts`, `selection.ts`, `trajectory.ts` for the self, agency, and individuality tests) and `test/experiment/general/` (the committed model read off through `vibe()`).
