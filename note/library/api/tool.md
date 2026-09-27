# Tools (the Primitives)

The substrate-agnostic building blocks every experiment is made of. The Weyl and Kronecker sequences, graphs, posets, bitsets, plus the small helpers that move between them. Everything here is deterministic: no `Math.random`, no seed, no pseudo-random generator, no hash used as a draw (E-MTH-0015 gates all four). The whole library is a pure function of its parameters and the stated starts.

## The key primitives

| module (`@/code/tool/<file>`) | what it gives you |
|:--- |:--- |
| `@/code/tool/weyl` | `makeWeyl({ start })` the Kronecker stream (`next`, `nextInt`, `nextGaussian`), equidistributed in up to 64 dimensions per window, independent across starts. `weyl(index, alpha)` and `weylFill` for a golden or silver fill, `weylCell(key, beat, salt)` for a fixed value per lattice point, `weylPermutation`, `weylUnitVector`, `weylOrthogonal`, `weylUnitary`, `poissonSample`, `sampleEmpiricalFrequencies`. A `start` picks which sequence is read; it is not a seed. |
| `@/code/tool/weyl-point` | `weylPoint({ start, index, slot })`, random access into the stream (its draw 64 index + slot), for up to 64 jointly equidistributed choices per index. Two `weylCell` values of one key at two beats differ by a fixed shift, so they are not independent choices; two slots of one `weylPoint` index are. |
| `@/code/tool/graph` | `makeGraph` and the `Graph` type. `degree`, `meanDegree`, `mostConnectedNode`. `toCsr` / `edgesFromCsr` for the compact sparse form. BFS / distance helpers (`csrDistances`, `csrBallNodes`, `largestComponent`). |
| `@/code/tool/poset` | `makePosetFromRelation` (build a causal set from a precedence test) and the `Poset` type. `precedes`, `relationCount`, `intervalSize`, `pastMatrix`, `subPoset`. |
| `@/code/tool/bitset` | `makeBitMatrix`, `setBit` / `getBit` / `clearBit`, `popcountRow`, `popcountAnd`, `forEachSetBit`. Dense bit storage for reachability matrices. |
| `@/code/tool/substrate` | `Substrate = Poset \| Graph` and a shared adjacency view. `adjacencyOf`, `undirectedAdjacency`, `substrateMeanDegree`. Measure on either form. |
| `@/code/tool/mesh` | The uniform `Mesh` interface (a coin of directions per cell). Builders `squareMesh`, `cubicMesh`, `d4Mesh`, `b4Mesh`. `shellDistances` for BFS radii. See `substrate.md`. |
| `@/code/tool/embedding` | Optional coordinate provenance for a sprinkled substrate. Output-only, used for validation. Never read by a rule. |
| `@/code/tool/integer` | `modulo(value, modulus)` the sign-correct remainder for torus wrap and field reduction. |

## Use it

Read a Kronecker stream. The same start always gives the same values, and nothing random stands behind them.

```ts
import { makeWeyl } from '@/code/tool/weyl'

const stream = makeWeyl({ start: 3 })
stream.next()               // value in [0, 1)
stream.nextInt({ max: 24 }) // integer in [0, 24)
stream.nextGaussian()       // the inverse normal of one stream value
```

A sampler driven by a stream is a deterministic dynamics with a quasi-random schedule, not a Markov chain. Where a sampler can be replaced by a deterministic dynamics of the model's own (the kinetic demon of E-FRC-0110), prefer it.

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

A scan over runs takes one stream per run: distinct starts own distinct primes, so their streams are jointly equidistributed with no linear relation between them.

```ts
import { makeWeyl } from '@/code/tool/weyl'

const stream = makeWeyl({ start: 42 * 1000 + i })
```

Several independent choices per site (a fill and a sign, say) read several slots of one index:

```ts
import { weylPoint } from '@/code/tool/weyl-point'

const filled = weylPoint({ start: salt, index: i, slot: 0 }) < fill
const sign = weylPoint({ start: salt, index: i, slot: 1 }) < 0.5 ? -1 : 1
```

Real usages to copy from:

- `makeWeyl`: `test/experiment/geometry/hauptvermutung.ts`; `weylPoint`: `code/measure/momentum-transport.ts`, `code/coarse/knit-boltzmann.ts`
- `makeGraph`: `test/experiment/selves/tower-of-selves.ts`, `test/experiment/spin/kahler-dirac-propagation-534.ts`
- `toCsr`: `test/experiment/gravity/gravity-3434.ts`, `test/experiment/foundations/s534-dynamics.ts`

## See also

- `substrate.md` for the mesh builders (`d4Mesh`, `cubicMesh`) and the `Substrate` union in full.
- `measure.md` and `dynamics.md` for what reads these primitives.
