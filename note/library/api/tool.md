# Tools (the Primitives)

The substrate-agnostic building blocks every experiment is made of. The seeded random source, graphs, posets, bitsets, plus the small helpers that move between them. Everything here is deterministic. The whole library is a pure function of `(seed, parameters)`. Never `Math.random`.

## The key primitives

| module (`@/code/tool/<file>`) | what it gives you |
| --- | --- |
| `@/code/tool/rng` | `makeRng({ seed })` the seeded PRNG (`next`, `nextInt`, `nextGaussian`). Plus `deriveSeed` (child seeds for scans), `poissonSample`, `sampleEmpiricalFrequencies`. |
| `@/code/tool/graph` | `makeGraph` and the `Graph` type. `degree`, `meanDegree`, `mostConnectedNode`. `toCsr` / `edgesFromCsr` for the compact sparse form. BFS / distance helpers (`csrDistances`, `csrBallNodes`, `largestComponent`). |
| `@/code/tool/poset` | `makePosetFromRelation` (build a causal set from a precedence test) and the `Poset` type. `precedes`, `relationCount`, `intervalSize`, `pastMatrix`, `subPoset`. |
| `@/code/tool/bitset` | `makeBitMatrix`, `setBit` / `getBit` / `clearBit`, `popcountRow`, `popcountAnd`, `forEachSetBit`. Dense bit storage for reachability matrices. |
| `@/code/tool/substrate` | `Substrate = Poset \| Graph` and a shared adjacency view. `adjacencyOf`, `undirectedAdjacency`, `substrateMeanDegree`. Measure on either form. |
| `@/code/tool/mesh` | The uniform `Mesh` interface (a coin of directions per cell). Builders `squareMesh`, `cubicMesh`, `d4Mesh`, `b4Mesh`. `shellDistances` for BFS radii. See `substrate.md`. |
| `@/code/tool/embedding` | Optional coordinate provenance for a sprinkled substrate. Output-only, used for validation. Never read by a rule. |
| `@/code/tool/integer` | `modulo(value, modulus)` the sign-correct remainder for torus wrap and field reduction. |

## Use it

Seed an rng. Same seed always gives the same stream.

```ts
import { makeRng } from '@/code/tool/rng'

const rng = makeRng({ seed: 3 })
rng.next()          // float in [0, 1)
rng.nextInt({ max: 24 })  // integer in [0, 24)
rng.nextGaussian()  // standard normal
```

Build a graph from neighbor lists, then take its compact form.

```ts
import { makeGraph, toCsr } from '@/code/tool/graph'

const g = makeGraph({ size: n, directed: false, neighbors })
const { offsets, adj } = toCsr(g.neighbors)
```

Build a causal set from a precedence test over time-sorted elements.

```ts
import { makePosetFromRelation, relationCount } from '@/code/tool/poset'

const p = makePosetFromRelation({
  size: n,
  precedes: ({ a, b }) => /* a is in the past of b */ false,
})
relationCount(p)  // ordered pairs
```

Derive child seeds so a whole scan rebuilds from one number.

```ts
import { makeRng, deriveSeed } from '@/code/tool/rng'

const rng = makeRng({ seed: deriveSeed({ base: 42, index: i }) })
```

Real usages to copy from:

- `makeRng` and `deriveSeed`: `test/experiment/geometry/hauptvermutung.ts`, `test/experiment/holography/signaling.ts`
- `makeGraph`: `test/experiment/selves/tower-of-selves.ts`, `test/experiment/spin/kahler-dirac-propagation-534.ts`
- `toCsr`: `test/experiment/gravity/gravity-3434.ts`, `test/experiment/foundations/s534-dynamics.ts`

## See also

- `substrate.md` for the mesh builders (`d4Mesh`, `cubicMesh`) and the `Substrate` union in full.
- `measure.md` and `dynamics.md` for what reads these primitives.
