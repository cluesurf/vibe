# code/coarse

The coarse-graining and selves layer. It sits above the dynamics in the pipeline (`substrate -> tone -> rule -> dynamics -> coarse -> model`) and asks, with controls, whether the micro rule gives rise to macro levels and persistent observers. The move is the standard physics one, group micro cells into macro units, learn the effective rule of the next level up, build its transition matrix, and measure whether the coarse description has real causal power. It **measures**, it does not impose. A level counts only if it shows a spectral gap, a small commuting-square error, and a causal-emergence or Markov-blanket signal. Where the dynamics shows none, the negative is reported. The pure reversible base rule gives churn with no persistent selves, so the self experiments add a cohesion bias, which is not one of the base pieces.

## Modules by theme

### Coarse-graining operators and the level tower

| file | key exports | one-line |
| ---- | ----------- | -------- |
| `macro-unit.ts` | `MacroUnit`, `extractUnits`, `coarseLabels`, `meanUnitSize` | connected same-sign clusters as macro-units, plus the compression factor C |
| `transition-matrix.ts` | `countMatrix`, `rowStochastic`, `transitionEigenvalues`, `spectralGap`, `impliedTimescale`, `quantileLabels`, `symmetricEigenvalues`, `detailedBalanceViolation` | the lag-tau Markov model of a coarse observable and its spectral gap |
| `level-stack.ts` | `Level`, `effectiveVibeCount`, `isCleanLevel` | stack clean levels and account the scale, N_top times the product of the compressions |
| `block-charge-tower.ts` | `BlockChargeLevel`, `blockChargeTower` | the 1D pair-blocking charge tower, a faithful multiscale renormalization |
| `group-field.ts` | `coarseFieldByGroup`, `sumFieldByGroup`, `cubicBlockGroups` | block-average (mean) and block-sum (net charge) of a per-cell field |

### Causal emergence and validation

| file | key exports | one-line |
| ---- | ----------- | -------- |
| `causal-emergence.ts` | `effectiveInformation`, `coarseGrainTpm`, `emergenceGain` | Hoel effective information, micro versus structured versus random coarse-graining |
| `validator.ts` | `commutingSquareError`, `mostProbableNext` | coarse-then-evolve versus evolve-then-coarse, and the deterministic effective rule |
| `surrogate.ts` | `fitMarkovSurrogate`, `predictiveLogLikelihood`, `forwardAccuracy`, `marginalDistribution`, `timeShuffle` | fit a Markov surrogate and validate it against a memoryless and a time-shuffled control |
| `surrogate-tower.ts` | `TowerLevel`, `surrogateTower`, `towerAccuracyAtLag` | a temporal renormalization tower of surrogates at doubling lags |

### Self detection

| file | key exports | one-line |
| ---- | ----------- | -------- |
| `self-criteria.ts` | `regionPartition`, `blanketScreening`, `partialCorrelation`, `correlation`, `distancesFrom` | the Markov-blanket and light-cone primitives, interior/shell/exterior screening |
| `binding-margin.ts` | `bindingMargin`, `ballAtRadius` | the Hearst individuation margin, internal versus boundary coupling |
| `individuality.ts` | `fitnessVariancePartition` | the Price-equation between-group versus within-group variance test |
| `self-trajectory.ts` | `selfTrajectory`, `selfUnitTrajectory`, `driftingSelfTrajectory`, `positionBin`, `makeRng` | emerge a self and record its position-bin trajectory and tone snapshots |

### Persistence and interaction

| file | key exports | one-line |
| ---- | ----------- | -------- |
| `active-persistence.ts` | `activePersistence`, `PersistenceResult` | provenance-tracking audit of self survival under decay and refuge |
| `pattern-persistence.ts` | `patternSurvivalTime` | first beat a majority-vote pattern drops below half under churn |
| `driven-self.ts` | `drivenSelf`, `DrivenSelfSeries` | a self as a model builder in a slowly-flipping sectored environment |
| `two-self.ts` | `emergeSelfShape`, `runTwoSelf`, `runTwoSelfAnnihilation`, `twoSelfSeparation`, `stampShape` | two-self interaction, attraction, annihilation, separation |
| `valence-drift.ts` | `valenceDrift`, `valenceDifferential` | approach-avoid drift along a tone gradient |

## Main entry points

- `extractUnits({ tone, graph, positions, sign?, minSize?, level? }): MacroUnit[]` finds the connected same-sign clusters, each a candidate self carrying its members, size, charge, and centroid. `meanUnitSize(units)` is the compression C, `coarseLabels({ units, cellCount })` is the per-cell label map.
- `countMatrix({ trajectory, stateCount, lag }): number[][]` counts label i at beat t followed by label j at t+tau. `rowStochastic` normalizes it, `transitionEigenvalues` returns the reversibilized real spectrum, `spectralGap(eigs)` returns `{ lambda1, lambda2, lambda3, gap }`, and `impliedTimescale({ eigenvalue, lag })` turns lambda2 into beats. A clean level shows one slow mode and a gap.
- `effectiveInformation(tpm): number` is the causal power at a grain (Hoel, in bits). `coarseGrainTpm({ tpm, groups })` lifts a micro matrix to a macro one. `emergenceGain({ series, fine, macroCount, rng }): { eiMicro, eiSpatial, eiRandom }` runs the candid three-way test, a level emerges when the structured coarse EI beats both the micro EI and the random-coarse control.
- `commutingSquareError({ states, microStep, coarseMap, macroStep }): number` is the fraction of steps where coarse-then-evolve disagrees with evolve-then-coarse, zero is a perfect effective rule. `mostProbableNext(tpm)` is the deterministic skeleton macro rule.
- `regionPartition({ cluster, graph }): { interior, shell, exterior }` splits a region, `blanketScreening({ interior, shell, exterior }): { raw, screened, reduction }` measures whether the shell screens the inside from the outside (reduction near 1 means a clean Markov blanket).
- `selfTrajectory({ L, beats, bins, seed })` is the shared micro source, it emerges a self and returns `{ labels, centroids, snapshots, meanSelfSize }`.
- `effectiveVibeCount({ topUnits, levels })` is the scale accounting, `isCleanLevel({ level, errorBound? })` gates a level on real compression and a commuting effective rule.

## Used by

- **Narrated in full by** [coarse-graining-and-selves.md](../coarse-graining-and-selves.md), the deep dive on the engine, the algorithm, and the null result. Consumer guide, [api/dynamics.md](../api/dynamics.md).
- **Depends on** `code/tone` (the tone state it coarse-grains) and `code/model/self-kit.ts` (the shared self dynamics with the cohesion bias).
- **Example arenas** `test/experiment/selves/` (causal-emergence, coarse-spectral-gap, coarse-commuting-square, coarse-markov-blanket, integrated-information, renormalization-tower) and `test/experiment/renormalization/`.
