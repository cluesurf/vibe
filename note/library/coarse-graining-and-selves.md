# Coarse-Graining and Selves

The engine that climbs from the micro rule to emergent macro LEVELS, and detects persistent observers (selves) on
the way up. It coarse-grains the dynamics, builds the transition matrix, measures causal emergence, finds Markov
blankets, and stacks the level tower. This is the layer that asks, honestly, whether anything self-like falls out.

> This is the measurement layer over the base rule, delivered as reusable algorithms, not a story. It MEASURES,
> it does not impose. A level counts as real only if it shows a spectral gap, a coarse map with small
> commuting-square error, and a causal-emergence or blanket signal. Where the dynamics shows none of that, the
> honest negative is reported. The pure reversible rule gives churn with no persistent selves, so the self
> experiments add a cohesion bias, which is NOT one of the base five. That caveat is made explicit below.

Source, `code/coarse/` (the engine), `code/dynamics/coarsegrain.ts` and `code/dynamics/renormalization-blocks.ts`
(the block coarse-graining), `code/measure/persistence.ts` and `code/measure/integration.ts` (persistence and
integrated information), `code/model/self-kit.ts` (the self experiments' shared dynamics). Validated by the
experiments in `test/experiment/selves/coarse-*` and `renormalization-tower`.

---

## What it does

Given a micro trajectory (tones evolving under a beat) and the mesh it runs on, the engine,

- COARSE-GRAINS micro cells into macro UNITS, connected same-sign clusters, or BFS-ball blocks, or fixed
  position bins, and reads the effective macro observable,
- builds the TRANSITION MATRIX of the coarse observable, the lag-tau Markov model, and reads its spectral gap,
- measures CAUSAL EMERGENCE, the effective information of a coarse grain versus the micro grain, structured
  versus a random control,
- validates an effective rule with the COMMUTING SQUARE, coarse-then-evolve versus evolve-then-coarse,
- detects a SELF by its Markov blanket, its individuality, its integrated information, and its persistence,
- STACKS clean levels into a tower and does the scale accounting, N_top times C to the L.

The state it reads is always the micro ground truth. The effective rules are the compression that buys scale, and
each one is checked against the micro it claims to summarize.

---

## The components

| file | role |
| ---- | ---- |
| `code/coarse/macro-unit.ts` | `MacroUnit` (one self, members plus observables), `extractUnits`, the `coarseLabels` map, `meanUnitSize` (the per-level compression C) |
| `code/coarse/transition-matrix.ts` | the Markov-state model, `quantileLabels`, `countMatrix`, `rowStochastic`, `transitionEigenvalues`, `spectralGap`, `impliedTimescale`, `detailedBalanceViolation` |
| `code/coarse/causal-emergence.ts` | Hoel `effectiveInformation`, `coarseGrainTpm`, and `emergenceGain` (structured versus random EI) |
| `code/coarse/validator.ts` | `commutingSquareError` (coarse-then-evolve versus evolve-then-coarse) and `mostProbableNext` (the simplest learned effective rule) |
| `code/coarse/self-criteria.ts` | `regionPartition`, `blanketScreening`, `partialCorrelation`, `distancesFrom`, the blanket and light-cone primitives |
| `code/coarse/individuality.ts` | `fitnessVariancePartition`, the Price-equation between-group versus within-group test |
| `code/coarse/level-stack.ts` | the `Level` and `effectiveVibeCount` accounting (N_top times C to the L), `isCleanLevel` |
| `code/coarse/self-trajectory.ts` | the shared micro source, emerge a self then record its position trajectory and tone snapshots |
| `code/coarse/block-charge-tower.ts` | the 1D real-space block-charge renormalization tower, `blockChargeTower` |
| `code/coarse/group-field.ts` | `coarseFieldByGroup` (mean), `sumFieldByGroup` (net charge), `cubicBlockGroups` |
| `code/dynamics/renormalization-blocks.ts` | the block constructions, `geometricBlocks`, `domainBlocks`, `csrVoronoiBlocks` |
| `code/measure/persistence.ts` | `lagAutocorrelation`, does a coarse pattern survive its lag |
| `code/measure/integration.ts` | `integrationCorrelates`, `algebraicConnectivity`, `toneIntegration`, the integrated-information proxies |
| `code/model/self-kit.ts` | the self experiments' shared dynamics, `flatGraph`, `emergeSelf`, the cohesive `beat` (flag, cohesion is NOT base) |

Start with `transition-matrix.ts` and `causal-emergence.ts`. They are the heart of the level test.

---

## How to use it

### Emerge a self and record its trajectory

```ts
import { selfTrajectory } from '@/code/coarse/self-trajectory'

const traj = selfTrajectory({ L: 64, beats: 400, bins: 8, seed: 1 })
// traj.labels      -> the position-bin label at each beat (the coarse observable)
// traj.centroids   -> the continuous positive-centroid x at each beat
// traj.snapshots   -> periodic tone snapshots (for the commuting square)
// traj.meanSelfSize -> the mean cells-per-self, the level-0 compression C
```

### Build the transition matrix and read its spectral gap

```ts
import { countMatrix, rowStochastic, transitionEigenvalues, spectralGap, impliedTimescale } from '@/code/coarse/transition-matrix'

const counts = countMatrix({ trajectory: traj.labels, stateCount: traj.bins, lag: 4 })
const tpm = rowStochastic(counts)
const eigs = transitionEigenvalues(counts)         // real, in [-1, 1], reversibilized
const gap = spectralGap(eigs)                       // { lambda1, lambda2, lambda3, gap }
const slow = impliedTimescale({ eigenvalue: gap.lambda2, lag: 4 })  // beats
```

### Measure causal emergence, structured versus random

```ts
import { emergenceGain } from '@/code/coarse/causal-emergence'

const out = emergenceGain({ series: traj.centroids, fine: 16, macroCount: 4, rng })
// out.eiMicro    -> effective information at the fine grain
// out.eiSpatial  -> EI of a structured (adjacent-bin) coarse-graining
// out.eiRandom   -> EI of a random coarse-graining of the same coarseness (the control)
// a level emerges when eiSpatial exceeds eiMicro AND eiSpatial exceeds eiRandom
```

### Validate an effective rule with the commuting square

```ts
import { commutingSquareError, mostProbableNext } from '@/code/coarse/validator'

const macroRule = mostProbableNext(tpm)             // the deterministic skeleton of the Markov model
const error = commutingSquareError({
  states: traj.snapshots,
  microStep: (s) => oneBeat(s),                     // the real micro beat
  coarseMap: (s) => positionBin({ tone: s, L: 64, bins: 8 }),
  macroStep: (m) => macroRule[m]!,
})                                                   // 0 is a perfect effective rule
```

### Detect a Markov blanket around a cluster

```ts
import { regionPartition, blanketScreening } from '@/code/coarse/self-criteria'

const { interior, shell, exterior } = regionPartition({ cluster, graph })
// feed the time series of interior, shell, exterior tone to blanketScreening
const screen = blanketScreening({ interior: iSeries, shell: sSeries, exterior: eSeries })
// screen.reduction near 1 means the shell fully screens the inside from the outside
```

### Stack the levels and account the scale

```ts
import { effectiveVibeCount, isCleanLevel } from '@/code/coarse/level-stack'

const levels = [{ level: 0, unitCount: 100, compression: 9, commutingError: 0.1 }]
levels.every((level) => isCleanLevel({ level }))    // each level real (compresses, commutes)
effectiveVibeCount({ topUnits: 100, levels })       // N_top times C to the L
```

---

## How it works

The whole engine is one move, the standard physics one. Simulate the exact micro rule, learn the effective rule
of the next level up, run that on macro-units, and stack. The micro is always the ground truth that validates
each level.

1. **Coarse-grain to units** (`extractUnits`, `geometricBlocks`, `quantileLabels`). Three ways to group. A UNIT
   is a connected same-sign cluster of at least `minSize` cells, found by flood-fill (`extractUnits`), so the
   self is the system's own coherent domain. A BLOCK is a BFS ball grown from a scattered seed
   (`geometricBlocks`), tone-INDEPENDENT, so a coarse rule measured on it is not a same-cluster tautology. A BIN
   is an equal-occupancy quantile of a continuous observable (`quantileLabels`), every bin populated, which
   avoids spurious eigenvalue-1 modes from empty bins. `meanUnitSize` reads off the compression factor C, the
   mean cells per unit.

2. **The transition matrix** (`countMatrix`, `rowStochastic`, `transitionEigenvalues`). The micro Markov
   dynamics, read from a real trajectory of labels. `countMatrix` counts how often label i at beat t is followed
   by label j at beat t+tau. `rowStochastic` normalizes each row to a next-state distribution. For the spectrum,
   the count matrix is symmetrized (detailed balance) and similarity-transformed to S = D to the minus-half C D
   to the minus-half, which has the same eigenvalues as the reversible transition matrix, so a self-contained
   symmetric Jacobi solver (`symmetricEigenvalues`) gives exact-real eigenvalues. An unvisited state is left at a
   zero eigenvalue, not a spurious slow mode at 1. `spectralGap` reports lambda2, the slowest relaxing mode, and
   the gap ratio. `impliedTimescale` turns lambda2 into a timescale in beats. A clean emergent level shows ONE
   slow process and a fast rest, a gap in the implied timescales. No gap means no clean level there, an honest
   negative.

3. **Causal emergence** (`effectiveInformation`, `coarseGrainTpm`, `emergenceGain`). This is the heart. Effective
   information (Hoel) is the causal power of the dynamics at a grain, the average over states of the KL
   divergence of that state's output distribution from the mean output. `coarseGrainTpm` maps a micro transition
   matrix to a macro one by a group-label array, the macro row is the average of its members' rows (a uniform
   intervention over the group), the macro column sums the members' columns. A macro level EMERGES when its EI
   EXCEEDS the micro EI. The catch, and it is a real one, gaining causal power requires LOSING information. A
   many-to-one or noisy coarse-graining concentrates the dynamics into fewer, sharper transitions. This is why
   causal emergence cannot live at the exactly reversible base. A reversible rule loses nothing, so it has no
   slack to convert into macro causal power. Emergence lives at a coarse grain where information IS lost.
   `emergenceGain` makes the test honest with a control, it measures EI three ways, the micro matrix, a
   STRUCTURED coarse-graining that merges adjacent bins (respecting the dynamics), and a RANDOM coarse-graining
   of the same coarseness (the null). A structured macro that keeps more EI than the random macro is the
   signature of a genuine level, not an artifact of coarseness.

4. **The self criteria** (`regionPartition`, `blanketScreening`, `toneIntegration`, `lagAutocorrelation`,
   `fitnessVariancePartition`). A SELF is a region that earns four marks at once. (a) A MARKOV BLANKET,
   `regionPartition` splits a cluster into interior (all neighbors inside), shell (the boundary), and exterior
   (outside cells touching the shell), and `blanketScreening` measures the partial correlation of interior and
   exterior conditioned on the shell. If the shell screens, the conditioned coupling drops to near zero, the
   `reduction` near 1. (b) INDIVIDUALITY, the inside is more tightly coupled to itself than to the outside.
   `integrationCorrelates` reads the ratio of internal to boundary edges, and `algebraicConnectivity` (the
   Fiedler value) measures how hard the region is to cut into independent parts. `toneIntegration` goes further,
   it estimates the minimum-information bipartition by re-running the rule with one side replaced by noise, so a
   region scores high only if EVERY way of splitting it still leaves the parts shaping each other. (c)
   PERSISTENCE, `lagAutocorrelation` asks whether the coarse pattern at beat t still correlates with itself at
   beat t+lag, does the structure survive many beats. (d) INDIVIDUALITY TRANSITION,
   `fitnessVariancePartition` does the Price-equation split, a genuine higher individual shows fitness variance
   shifting from within-group to between-group, the ratio crossing above one. The `commutingSquareError` is the
   cross-check that the self's coarse description actually predicts its own evolution.

5. **The tower** (`Level`, `effectiveVibeCount`, `isCleanLevel`, `blockChargeTower`). Stack the levels. Each
   level treats the units below it as its cells, which is why `MacroUnit` carries the few observables the next
   level runs on, the recursion is well-defined. A level is CLEAN only if it really compresses (more than one
   sub-unit per unit) and its effective rule commutes (commuting-square error below a bound). `effectiveVibeCount`
   does the scale accounting, a top simulation of N_top units with L stacked levels each compressing a factor C
   reaches an effective substrate of N_top times C to the L vibes. `blockChargeTower` is the simplest concrete
   tower, repeatedly sum consecutive pairs of a charge field, the total charge is exactly conserved up every
   level (a faithful multiscale tower) and the compressibility converging to a constant is a renormalization
   fixed point.

---

## Capabilities and limits

What it handles,

- ANY grouping, same-sign clusters, geometric BFS blocks, quantile bins, cubic blocks, with one transition-matrix
  and causal-emergence pipeline behind all of them.
- An honest control everywhere, the random coarse-graining for causal emergence, the shuffled null for
  persistence, the commuting square for the effective rule.
- The full self battery, blanket, individuality, integration, persistence, and the individuality transition, each
  a separate measure that must agree.

The honest position, stated plainly,

- THE NULL RESULT. The pure base rule (reversible, charge-conserving, the five base pieces) gives CHURN, no
  persistent selves. That is the honest negative, reported, not papered over. Selves do not fall out of the bare
  reversible dynamics.
- CAUSAL EMERGENCE NEEDS INFORMATION LOSS. EI can only exceed the micro EI when the coarse-graining is
  many-to-one or noisy, which destroys information. The exactly reversible rule loses nothing, so causal
  emergence cannot live at the reversible base. It lives at a coarse-grained level where information is shed. This
  is a feature of the definition, not a bug in the code, and it is why the level tower starts above the
  reversible floor.
- COHESION IS NOT BASE. The self experiments use `code/model/self-kit.ts`, whose `beat` adds a COHESION bias, a
  charge prefers to hop toward like company (`pHop = 0.1 + cohesion * like`). That is an ADDED ingredient. It is
  not one of the base five (mesh, ternary tone, conserving rule, reflection-and-growth, arrow). The selves the
  self-kit produces are honest as a study of self-criteria measurement, but they do not yet demonstrate selves
  from the pure base rule. The cohesion knob is the thing being held responsible.
- THE GRADES. The spectral gap, the commuting square, and the effective-information measures are L2 method checks
  with controls. The tower is an L1 scale accounting. A genuine L3 emergent-level claim from the pure base rule is
  the TARGET of the full tower, not yet established.

---

## Why it matters

This engine is how the project asks, with controls, whether the micro rule gives rise to macro levels and
persistent observers, instead of asserting it. Causal emergence is the precise version of the question, does a
coarse description have more causal power than the fine one, and the answer is tied to a measurable quantity,
effective information, not a metaphor. The blanket, individuality, integration, and persistence battery is the
precise version of what a self IS, a boundary that screens, an inside more coupled than the outside, a structure
that survives. Keeping the controls (random coarse-graining, shuffled null, commuting square) is what lets the
project report the null result honestly, the bare reversible rule churns, causal emergence needs information loss,
and the self-kit cohesion is an added ingredient. The honest negatives are as much the output as the positives.

## See also

- `api/dynamics.md`, the brief consumer guide to sampling, evolution, and coarse-graining flows (this doc is the
  deeper dive on the selves engine under it).
- `rule-engine.md`, the base reversible rule whose churn is the null result this engine measures.
- `tessellation-engine.md`, the substrate that builds the flat horosphere the selves emerge on.
- `test/experiment/selves/causal-emergence.ts` and `coarse-causal-emergence.ts`, the effective-information level
  test with the random control.
- `test/experiment/selves/coarse-spectral-gap.ts`, `coarse-commuting-square.ts`, `coarse-markov-blanket.ts`, the
  Markov-state-model and blanket measures.
- `test/experiment/selves/integrated-information.ts`, the integrated-information proxy on a candidate region.
- `test/experiment/selves/topological-persistence-3434.ts`, persistence of structure on the {3,4,3,4} substrate.
- `test/experiment/selves/renormalization-tower.ts`, the level-stack accounting, and
  `l3-causal-emergence-needs-loss.ts`, the explicit demonstration that emergence requires information loss.
- The research notes, `note/research/vibe/notes/theory-v0.7.0/paper/selves-and-the-coarse-graining-of-reversibility.md`
  and `routes-to-nested-selves.md`, the written-up findings on selves and the reversible bulk.
