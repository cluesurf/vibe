# The Causal-Set Path-Integral Sampler

The discrete path integral over causal orders. It sums over posets
(sprinklings of points with a causal order), weights each by the
Benincasa-Dowker action (the discrete Einstein-Hilbert action), and
finds the manifold-like phase by Monte Carlo. This is the dynamics layer
for causal-set spacetime, the testbed for whether a sum over discrete
histories lands on a smooth-looking geometry.

> This is the program's answer to "what does a sum over discrete
> spacetimes do". A causal set is a poset. The action is a functional of
> its interval counts. The sampler walks the space of orders with the
> CORRECT uniform measure, warm-started from a random sprinkling, and
> reads the recovered dimension off the stable phase. An exact small-N
> enumeration validates the sampler. Be honest up front, this RELIES ON
> a random sprinkling, so every result here is a statistical claim about
> an ensemble, not a property of the deterministic base rule.

Source, `code/dynamics/` (the actions and samplers) plus
`code/tool/poset.ts`, `code/substrate/sprinkle-minkowski.ts`, and
`code/measure/`. Validated by `test/experiment/geometry/dimension.ts`
and `test/experiment/quantum/path-integral.ts`.

## What it does

Given a target dimension and a temperature, the sampler,

- SPRINKLES points into a Minkowski causal diamond and reads off the
  causal order (a poset),
- EVALUATES the Benincasa-Dowker action from interval counts (the
  discrete curvature),
- WALKS the space of labelled causal sets by single-pair toggle moves
  that preserve the uniform measure,
- WEIGHTS each order by `e^{-beta S}` (the Euclidean reweighting, so the
  chain converges),
- READS the manifold fraction, the height ratio, and the Myrheim-Meyer
  dimension off the stable phase,
- VALIDATES itself against an exact enumeration of every small-N causal
  set.

A causal set is locally finite partial order. Elements are events.
`a precedes b` means `a` is in `b`'s causal past. The ALEXANDROV
INTERVAL `A(a,b)` is every element causally between them. Interval
counts are the raw material of the action.

## The components

| file                              | role                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `tool/poset.ts`                   | the causal-set type, `makePosetFromRelation`, `relationCount`, `intervalSize`, `pastMatrix`          |
| `substrate/sprinkle-minkowski.ts` | `sprinkleMinkowski`, the seeded Poisson sprinkling of a causal diamond                               |
| `dynamics/action.ts`              | `benincasaDowkerAction`, `smearedBenincasaDowker`, the smeared kernels, the dimension-target control |
| `dynamics/uniform-sampler.ts`     | `sampleUniform`, the correct uniform-measure MCMC over 2-orders (the flagship)                       |
| `dynamics/mcmc.ts`                | `sampleCausalSets`, the closure-repair Metropolis chain (modest N, any action)                       |
| `dynamics/exact-enumeration.ts`   | `exactCausalSetAverages`, the small-N exact Boltzmann average (the conformance check)                |
| `measure/dimension.ts`            | `myrheimMeyerDimension`, `dimensionFromOrderingFraction` (dimension off the ordering fraction)       |
| `measure/order-stats.ts`          | `orderStatistics`, the height ratio and ordering fraction that separate the phases                   |
| `measure/manifoldlike.ts`         | `manifoldLikeness`, the composite manifold-versus-Kleitman-Rothschild score                          |

Start with `sampleUniform`. It is the one entry point that samples the
correct measure.

## How to use it

### Sprinkle, then sample, then read the dimension

```ts
import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { sampleUniform } from '@/code/dynamics/uniform-sampler'
import { dimensionFromOrderingFraction } from '@/code/measure/dimension'

const rng = makeRng({ seed: 7 })

// 1. Seed a 2D causal diamond. The poset's future relation warm-starts the chain.
const seed = sprinkleMinkowski({ dimension: 2, count: 64, rng })

// 2. Walk the uniform measure, weighted by e^{-beta S} with the smeared 2D action.
const r = sampleUniform({
  size: 64,
  beta: 1,
  epsilon: 0.5,
  steps: 200000,
  rng,
  startFuture: seed.future,
})

// r.manifoldFraction      -> fraction of samples in the manifold phase (height ratio > 1)
// r.meanOrderingFraction  -> the order's ordering fraction, the dimension dial
// r.meanHeightRatio       -> longest chain / sqrt(N), order 1 for a 2D manifold
// r.acceptance            -> move acceptance rate

// 3. Read the Myrheim-Meyer dimension of the stable phase off the ordering fraction.
const d = dimensionFromOrderingFraction(r.meanOrderingFraction) // near 2
```

### Validate the sampler against the exact answer (small N)

```ts
import { exactCausalSetAverages } from '@/code/dynamics/exact-enumeration'
import { smearedBenincasaDowker } from '@/code/dynamics/action'
import { manifoldLikeness } from '@/code/measure/manifoldlike'

const exact = exactCausalSetAverages({
  size: 6,
  betas: [0], // beta = 0 is the pure uniform / entropic average
  action: smearedBenincasaDowker({ epsilon: 0.5, dimension: 2 }),
  observers: [({ poset }) => manifoldLikeness({ poset }).score],
})
// exact.count  -> the number of labelled causal sets on 6 elements
// exact.means  -> the exact uniform average of the manifold score (~0.72)
```

The sampler's beta=0 average must match `exact.means`. That is the
conformance check.

## How it works

The whole thing is one idea, SUM OVER CAUSAL ORDERS. The pipeline,

1. **A causal set is a poset.** `sprinkleMinkowski` drops `N` points
   uniformly by volume into a causal diamond (rejection sampling, so the
   process is Poisson, hence Lorentz invariant). It sorts them by time
   and sets `a precedes b` when their separation is future-timelike. The
   result is a `Poset`, a transitive-closure bit matrix plus extracted
   covering links.

2. **The action is built from interval counts.** The Benincasa-Dowker
   action is the discrete analogue of the Einstein-Hilbert action. It is
   `S/hbar ~ N - sum_k c_k N_k`, where `N_k` is the number of related
   pairs whose Alexandrov interval has exactly `k` elements, and the
   coefficients `c_k` are fixed so the continuum limit recovers the
   Ricci scalar. The published values are `(1, -2, 1)` in 2D and
   `(1, -9, 16, -8)` in 4D. `intervalAbundance` walks the related pairs
   (with a deterministic stride cap so the action stays a pure function
   of the poset) and fills the `N_k` histogram. `intervalSize` is one
   popcount of `future(a) AND past(b)`.

3. **The smeared version tames the fluctuations.** The sharp action
   fluctuates wildly on a lattice. The SMEARED kernel `f_d(n, epsilon)`
   spreads the contribution over about `1/epsilon` order-layers with
   geometric decay and alternating signs, damping the lattice noise so a
   manifold phase becomes visible. `smearedBenincasaDowker` sums
   `f_d(n_yx, epsilon)` over related pairs. The full action is
   `S = -N/2 + epsilon * sum`. At `epsilon` near 1 only links survive,
   recovering the sharp action.

4. **The uniform-measure MCMC samples the CORRECT measure.** This is the
   load-bearing fix. The naive move (toggle a raw bit, then take
   transitive closure) changes many pairs at once and breaks detailed
   balance, so it does NOT sample the uniform measure. `sampleUniform`
   instead proposes toggling a SINGLE related pair `(i, j)` and accepts
   only if the result is still a valid transitive poset. Adding `i < j`
   keeps transitivity iff `past(i)` is a subset of `past(j)` and
   `future(j)` is a subset of `future(i)`. Removing it keeps
   transitivity iff no element sits strictly between. That proposal is
   symmetric, so with a flat target it samples the uniform measure
   exactly, and with weight `e^{-beta S}` it samples the causal-set
   Gibbs ensemble. It runs warm-started from the sprinkling, burns in
   for half the steps, and accumulates observables.

5. **It reads the dimension off the ordering fraction.** A 2D
   manifold-like order has a longest chain about `sqrt(N)`, so its
   HEIGHT RATIO is order 1, while a flat Kleitman-Rothschild order has
   height 3 and a ratio falling toward 0. The sampler classes each
   sample as manifold (height ratio > 1) or layered, giving the MANIFOLD
   FRACTION. The MYRHEIM-MEYER dimension comes from inverting
   `f(d) = (1/2) gamma(d+1) gamma(d/2) / gamma(3d/2)` on the ordering
   fraction (bisection in `dimensionFromOrderingFraction`). For the
   stable phase it lands near the seeded dimension.

6. **Exact enumeration validates the sampler.** `exactCausalSetAverages`
   enumerates every transitive upper-triangular relation on `N` elements
   (every naturally-labelled poset), evaluates the action and any
   observers, and computes the exact Boltzmann average at any `beta`,
   including `beta = 0` (the true uniform average). No detailed-balance
   worry. The sampler's `beta = 0` average must match it. At `N = 6` the
   uniform manifold-score average is about 72 percent, the conformance
   number.

## Capabilities and limits

What it handles,

- The correct uniform measure over labelled causal sets
  (`sampleUniform`), and the Gibbs ensemble at any beta.
- The 2D and 4D smeared Benincasa-Dowker actions, plus the sharp action
  in any dimension.
- A dimension-target action (`dimensionTargetAction`), the positive
  control that rewards a chosen dimension.
- Exact validation at small N (the enumeration is `2^(N(N-1)/2)` masks,
  so practical to N around 7 or 8).

The honest caveats,

- **It relies on a random sprinkling.** The seed comes from a Poisson
  process. Every claim here is a STATISTICAL claim about an ensemble of
  orders, not a property of the deterministic base rule. The vibe
  substrate is deterministic. This sampler is a separate, comparative
  testbed.
- **The naive sampler is biased.** `sampleCausalSets` (the
  closure-repair Metropolis chain in `mcmc.ts`) does NOT reproduce the
  uniform measure (it favours tall orders) and costs `O(N^3)` per move,
  so it is for modest N and for actions where the bias is understood.
  Use `sampleUniform` when the measure matters.
- **The action is subsampled at large N.** Beyond `PAIR_CAP` related
  pairs the interval histogram uses a fixed stride and rescales.
  Deterministic, but an estimate.
- **It is Euclidean, not Lorentzian.** We reweight by `e^{-beta S}`, not
  the oscillatory `e^{iS}`, so the chain converges. This is the standard
  move, but it is not the physical phase.

## Why it matters

This is the program's discrete path integral. It answers a concrete
question, does a sum over discrete causal histories, weighted by a
discrete curvature action, land on something that looks like a smooth
spacetime. The uniform-measure sampler makes the answer trustworthy (the
measure is correct, not biased), and the exact enumeration makes it
checkable (the sampler matches the true average at small N). The
manifold fraction and the recovered dimension are then real, measured
quantities, not assumed ones. It sits beside the substrate engine as the
comparative spacetime, the random Lorentzian ensemble the deterministic
mesh is judged against.

## See also

- `api/dynamics.md`, the brief consumer guide to the actions and
  samplers (this doc is the deeper dive).
- `api/measure.md`, the dimension and order-statistic estimators the
  sampler reads.
- `test/experiment/geometry/dimension.ts`, the 2D path integral landing
  on 2-dimensional orders (warm-start, read the dimension).
- `test/experiment/quantum/path-integral.ts`, the tractable end of the
  sum over histories, mean recovered dimension.
- `code/dynamics/action.ts` and `code/dynamics/uniform-sampler.ts`, the
  action and the correct sampler.
- `note/questions/p2-p6-optimal-path.md` and `p2-dynamics-spec.md`, the
  design notes behind the uniform measure and the height-ratio
  discriminant.
