# Measures (Read a Number off a State)

A measure takes a substrate or a state and returns a number. Use them to read geometry, dynamics, quantum, field, and statistical quantities off a vibe. Import from `@/code/measure/<file>`.

## What you can measure

### Geometry

| measure (`@/code/measure/<file>`) | what it returns |
| --- | --- |
| `bfsShells` (`shells`) | shell counts and depths from a root, breadth-first |
| `geodesicBall` (`shells`) | the list of cells within a given radius of a root |
| `shellGrowthRatio` (`shell-growth-ratio`) | how fast shells grow per step (1 is flat, higher is hyperbolic) |
| `graphDistance` (`distance`) | shortest-path hop count between two cells |
| `spectralDimension` (`dimension`) | effective dimension from a random walk return |
| `ballGrowthDimension` (`dimension`) | dimension from how ball size grows with radius |
| `boxCountingDimension` (`dimension`) | Minkowski dimension of a set of cells on a grid |
| `boundaryDimension` (`boundary-dimension`) | dimension of the boundary shell |
| `formanRicci` / `meanCurvature` / `gromovDelta` (`curvature`) | discrete curvature and hyperbolicity |
| `directionsAreCrystallographic` (`crystallographic`) | whether a set of directions forms a crystal lattice |

### Relativity and dynamics

| measure (`@/code/measure/<file>`) | what it returns |
| --- | --- |
| `lightConeRadii` (`light-cone`) | the front radius per beat (the discrete light cone) |
| `lorentzIsotropy` (`lorentz`) | how close front speed is to direction-independent |
| `directionalFrontDistances` (`front-speed`) | how far a front reaches in each direction |
| `rangeAnisotropy` (`front-speed`) | mean speed and spread across directions |
| `diffusionTensorAnisotropy` (`isotropy`) | anisotropy from the spread tensor of a walk |
| `relativisticDispersionFit` (`dispersion`) | fit of frequency versus wave number |
| `returnProbability` (`localization`) | chance a walk returns to its start (localization signal) |
| `kahlerDiracReturn` (`fermion-propagation`) | fermion return amplitude under Kahler-Dirac stepping |

### Quantum and information

| measure (`@/code/measure/<file>`) | what it returns |
| --- | --- |
| `chsh` (`bell`) | the CHSH Bell value S (above 2 breaks local realism) |
| `regionEntanglementEntropy` (`entanglement`) | entanglement entropy of a region of a free-fermion state |
| `algebraicConnectivity` (`integration`) | how integrated (hard to cut) the graph is |
| `ryuTakayanagiScaling` (`holography`) | whether boundary entropy scales like the bulk geodesic (holography) |

### Fields and gravity

| measure (`@/code/measure/<file>`) | what it returns |
| --- | --- |
| `wilsonLoopValue` / `wilsonLoopPhase` (`wilson-loop`) | gauge holonomy around a loop |
| `creutzRatioFromLoops` (`wilson-loop`) | confinement signal from loop areas |
| `aharonovBohmPhase` (`aharonov-bohm`) | phase picked up around enclosed flux |
| `dirichletGreensFunction` (`greens-function`) | lattice Green's function on a region |
| `newtonianPotential3D` / `branePotential` (`gravity-potential`) | gravity potential at a radius |

### Statistics and fits

| measure (`@/code/measure/<file>`) | what it returns |
| --- | --- |
| `powerLawFit` (`regression`) | best-fit exponent and max deviation in log-log |
| `logLogSlope` / `linearFit` (`regression`) | slope of a log-log or linear fit |
| `localForceLawExponent` (`regression`) | local exponent of a force law at a radius |
| `histogramFlatness` (`histogram`) | how uniform a distribution is |
| `distinctLevels` (`spectrum`) | distinct values in a spectrum within a tolerance |
| `orderStatistics` (`order-stats`) | height, widths, and shape of a poset |

### Cross-tessellation battery

| measure (`@/code/measure/<file>`) | what it returns |
| --- | --- |
| `measureTessellation` (`tessellation-battery`) | one Schlafli symbol in, full report out (cells, growth, hyperbolic, crystallographic, spinor) |

## Use it

Shells and growth from a root cell.

```ts
import { bfsShells } from '@/code/measure/shells'
import { shellGrowthRatio } from '@/code/measure/shell-growth-ratio'

const { shellCounts } = bfsShells({ neighbors, root: 0 })
const ratio = shellGrowthRatio({ neighbors, root: 0 })
// ratio near 1 is flat, above 1 is hyperbolic
```

Fit a power law and read the exponent.

```ts
import { powerLawFit } from '@/code/measure/regression'

const { exponent, maxDeviation } = powerLawFit({ xs: radii, ys: ballSizes })
```

Test holography on a built mesh.

```ts
import { ryuTakayanagiScaling } from '@/code/measure/holography'

const result = ryuTakayanagiScaling({ neighbors, coords })
// result.isLogarithmic flags boundary-law scaling
```

Score one tessellation end to end.

```ts
import { measureTessellation } from '@/code/measure/tessellation-battery'

const report = measureTessellation({ schlafli: [5, 3, 4] })
// report.cells, report.growthRatio, report.hyperbolic, report.spinorHook
```

Real experiments that use these:

- `test/experiment/geometry/dimension.ts` (dimension measures)
- `test/experiment/holography/ryu-takayanagi-73.ts` (holography)
- `test/experiment/relativity/lorentz-isotropy.ts` (front speed, isotropy)
- `test/experiment/spin/kahler-dirac-propagation-534.ts` (fermion return)
- `test/experiment/gauge/confinement.ts` (Wilson loops)
- `test/experiment/substrate-survey/pentacomb-propagation.ts` (tessellation battery)

## See also

- Build a substrate first: see the make and build API notes in `note/library/api/`.
- Full module list: `code/measure/` (70 files, this guide covers the essentials).
