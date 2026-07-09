# Dynamics (Sampling and Evolution)

How states move and get sampled. Monte Carlo over causal sets, lattice gauge sweeps, wave and walk time-stepping, and coarse-graining flows.

All inputs are single objects. RNG-driven functions take an `rng` you pass in, so runs stay deterministic.

## The key pieces

### Sampling and Monte Carlo

| module (`@/code/dynamics/<file>`) | what it does |
|:--- |:--- |
| `uniform-sampler` | `sampleUniform` runs Metropolis over causal sets at a given `beta`. Returns manifold fraction, mean action, acceptance. |
| `mcmc` | `sampleCausalSets` walks the causal-set space and averages one observer. `transitiveClosure` rebuilds the order. |
| `parallel-tempering` | `parallelTempering` runs many `betas` at once with replica swaps. Beats getting stuck in one phase. |
| `wang-landau` | `wangLandauHeight` estimates the density of states (flat-histogram). Read it with `manifoldFractionAt`, `entropyGap`, `crossingBeta`. |
| `exact-enumeration` | `exactCausalSetAverages` enumerates every causal set up to a small size. Ground truth for checking the samplers. |
| `action` | `smearedBenincasaDowker` and `benincasaDowkerAction` are the action functions the samplers weight by. `dimensionTargetAction` pins a target dimension. |

### Lattice gauge

| module (`@/code/dynamics/<file>`) | what it does |
|:--- |:--- |
| `su2-lattice` | `makeSu2Lattice` builds a hot or cold lattice. `metropolisSweep` updates it. `averagePlaquette`, `wilsonLoop`, `creutzRatio` read confinement order parameters. |
| `wilson` | `plaquettesOf`, `wilsonAction`, `heatBathSweep` for a U(1) gauge field on any graph. |
| `wilson-grid` | `gridPlaquettes`, `gridWilsonAction`, `gridMaxwellAction` on a clean square grid. |
| `schwinger-coupled` | `runCoupledSchwinger` evolves a 1+1D fermion plus gauge field together. Returns field energy and momentum drift. |

### Wave and walk evolution

| module (`@/code/dynamics/<file>`) | what it does |
|:--- |:--- |
| `leapfrog-wave` | `evolveLeapfrogWave` time-steps a wave equation. `leapfrogWaveLevelSpeed` checks the signal speed. |
| `reversible-wave` | `reversibleWaveStep` is one exactly time-reversible wave beat. |
| `quantum-walk` | `coinedWalkMSD` and `diracQuantumWalk` for ballistic quantum spreading. `singleParticleQuantumWalk`, `twoParticleQuantumWalk` for particle walks. |
| `random-walk` | `classicalWalkMSD`, `graphWalkMsdExponent`, `randomWalkPath`. The diffusive baseline. |
| `peierls-wavepacket` | `peierlsWavepacketDrift` drifts a charged packet through a gauge field (the Peierls phase). |

### Renormalization and cosmology

| module (`@/code/dynamics/<file>`) | what it does |
|:--- |:--- |
| `coarsegrain` | `decimate` blocks a graph down one level. |
| `renormalization-blocks` | `geometricBlocks`, `domainBlocks`, `csrVoronoiBlocks` define the blocks to coarse-grain over. |
| `renormalization-group` | `oneLoopInverseCoupling`, `couplingMeetingTime`, `qcdRunningMassFactor`. Coupling flow with scale. |
| `friedmann` | `integrateFriedmann`, `friedmannStep`, `decelerationParameter`. Expanding-universe ODE. |
| `inflaton` | `inflatonStep`, `inflatonHubble`. Scalar-field inflation. |

The very specialized sweeps live alongside these. `conserving-sweep`, `cohesive-sweep`, `soc-sweep`, `pumped-reserve-sweep`, `fill-gated-sweep`, `flat-willed-drift-sweep` each tune one update rule for a specific study. Reach for them only when an experiment names them.

## Use it

Sample causal sets at a temperature.

```ts
import { sampleUniform } from '@/code/dynamics/uniform-sampler'

const out = sampleUniform({
  size: 12,
  beta: 1.5,
  epsilon: 1,
  steps: 200_000,
  rng,
})
// out.manifoldFraction, out.meanAction, out.acceptance
```

Beat the stuck-in-a-phase problem with replica swaps.

```ts
import { parallelTempering } from '@/code/dynamics/parallel-tempering'
import { smearedBenincasaDowker } from '@/code/dynamics/action'

const result = parallelTempering({
  size: 10,
  betas: [0.5, 1, 2, 4],
  action: smearedBenincasaDowker({ epsilon: 1 }),
  sweeps: 5_000,
  movesPerSweep: 50,
  observe: ({ poset }) => poset.size,
  rng,
})
// result.samplesByBeta, result.swapAcceptance
```

Couple a fermion to a gauge field and watch them push on each other.

```ts
import { runCoupledSchwinger } from '@/code/dynamics/schwinger-coupled'

const r = runCoupledSchwinger({
  sites: 64,
  coupling: 0.3,
  mass: 0.2,
  flavors: 1,
  backgroundField: 0.1,
  momentumStart: 0.5,
  steps: 400,
  dt: 1,
})
// r.fieldEnergy, r.momentumDrift  (set coupling 0 to decouple)
```

Real experiments that drive these:

- `test/experiment/foundations/uniform.ts`, `foundations/exact.ts` for the samplers vs exact enumeration.
- `test/experiment/gravity/tempering.ts` for parallel tempering.
- `test/experiment/gauge/confinement.ts` for the SU(2) lattice.
- `test/experiment/gauge/coemergence-dynamical-3434.ts`, `gauge/coupling-not-fixed-3434.ts` for coupled Schwinger.
- `test/experiment/gauge/ph-magnetism-3434.ts` for the Peierls wavepacket.
- `test/experiment/quantum/quantum-walk-field.ts` for quantum walks.
- `test/experiment/renormalization/coarse-graining-fixed-point.ts`, `renormalization/wang-landau.ts` for RG.
- `test/experiment/cosmology/dynamics.ts`, `cosmology/inflation.ts` for Friedmann and the inflaton.

## See also

- `@/code/dynamics/action` for the action functions every sampler weights by.
- The state and poset types these functions consume come from the state and geometry modules.
- The `MEMORY.md` rule: keep runs deterministic. Vary size, not seeds.
