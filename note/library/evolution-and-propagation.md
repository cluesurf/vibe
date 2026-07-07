# Evolution and Propagation

The stable unitary-evolution engine. It evolves a quantum state under
`exp(-i H t)` using nothing but mat-vecs, stays near-unitary for any
real symmetric `H`, and reads off whether an excitation PROPAGATES
(spreads and leaves) or LOCALIZES (stays trapped) from a single
metric-free diagnostic, the return probability. This is the layer the
fermion-propagation experiments run on.

> This is how the model tells an extended phase from a localized one.
> Start a unit excitation at one cell, evolve it under the operator, and
> watch how much amplitude comes back to the source. A LOW time-average
> means the excitation spread away (propagating), a HIGH average means
> it is trapped (localized). The deterministic Aubry-Andre potential is
> the localization control, the test that could have failed. The whole
> fermion-propagation survey is built on top of this, see
> `code/measure/fermion-propagation` and the per-substrate experiments.

Source, `code/measure/localization.ts` and
`code/measure/fermion-propagation.ts`. The mat-vec and the control
potential live in `code/algebra/linear/sparse.ts`.

## What it does

Given a real symmetric operator `H` (a `LinearOperator` you can apply to
a vector), the engine,

- EVOLVES a complex state `psi = real + i imaginary` under the
  Schrodinger equation `d psi / dt = -i H psi`,
- stays NEAR-UNITARY with a symplectic leapfrog, using only `H` applied
  to a vector (no matrix inverse, no eigendecomposition, no dense
  storage),
- reads a clean `|psi|^2` by SYNCHRONIZING the staggered imaginary part
  back to integer time,
- reports the RETURN PROBABILITY `P(t) = |psi_source(t)|^2`, its
  time-average, and the norm drift (the check that the evolution
  stayed unitary),
- adds a deterministic quasiperiodic potential as the LOCALIZATION
  CONTROL, no randomness anywhere.

There is also an exact eigendecomposition evolver
(`code/operator/unitary-evolution.ts`) for small systems and a
reversible continuous-amplitude wave (`code/dynamics/leapfrog-wave.ts`)
for the renormalization tower. The leapfrog return-probability path is
the one the propagation experiments use at scale.

## The components

| file                                  | role                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `code/measure/localization.ts`        | `returnProbability`, the leapfrog evolution and the synchronized norm           |
| `code/measure/fermion-propagation.ts` | `kahlerDiracReturn`, the clean-vs-disorder return test on a cell graph          |
| `code/algebra/linear/sparse.ts`       | `sparseMatVec`, `LinearOperator`, `sparseWithAubryAndrePotential` (the control) |
| `code/operator/unitary-evolution.ts`  | `evolveByEigendecomposition`, exact `e^{-iHt}` for small `H` (no Trotter error) |
| `code/dynamics/leapfrog-wave.ts`      | the reversible continuous-amplitude wave used for the RG commuting square       |

Start with `returnProbability`. It is the one entry point a propagation
experiment calls.

## How to use it

### Return probability on any LinearOperator

```ts
import { returnProbability } from '@/code/measure/localization'
import { operatorFromSparse } from '@/code/algebra/linear/sparse'

const operator = operatorFromSparse(myRealSymmetricMatrix)
const r = returnProbability({
  operator,
  source: 0,
  steps: 570,
  dt: 0.02,
  sampleEvery: 30,
})
// r.samples      -> P(t) sampled every 30 steps
// r.timeAverage  -> low means propagating, high means localized
// r.normDrift    -> |norm_end / norm_start - 1|, should be tiny (the unitarity check)
```

### Kahler-Dirac fermion return from a neighbors array

```ts
import { kahlerDiracReturn } from '@/code/measure/fermion-propagation'

// neighbors[i] = the facet-neighbour cell ids of cell i (what the tessellation engine produces)
const out = kahlerDiracReturn({ neighbors, disorderStrength: 8 })
// out.clean      -> time-averaged return for the bare operator (expect LOW, propagating)
// out.localized  -> with the Aubry-Andre potential (expect HIGH, trapped)
// out.normDrift  -> the worse of the two norm drifts
```

It picks the source automatically as the most-connected cell, builds
`D = d + delta` on the graph, and runs the same `returnProbability` for
the clean and the disordered operator. A clean-low, localized-high split
is the propagating signature surviving its control.

### Exact evolution for small systems

```ts
import { evolveByEigendecomposition } from '@/code/operator/unitary-evolution'

// re0 + i im0 evolved to time t by phase-rotating each eigenmode by e^{-i lambda_k t}. No Trotter error.
const { re, im } = evolveByEigendecomposition({ eig, n, re0, im0, t })
```

## How it works

The whole evolution is one idea, a SYMPLECTIC LEAPFROG on the real and
imaginary parts of the state.

1. **Split the Schrodinger equation.** Write `psi = real + i imaginary`.
   Then `d psi / dt = -i H psi` splits into two coupled real equations,
   `d(real)/dt = H imaginary` and `d(imaginary)/dt = -H real`. Each side
   needs only `H` applied to a real vector.
2. **Stagger the two parts (the leapfrog).** Kick the imaginary part
   back half a step first, `imaginary -= (dt/2) H real`. Then alternate
   full steps, `real += dt H imaginary`, then `imaginary -= dt H real`.
   The imaginary part now lives half a step ahead of the real part. This
   is the symplectic integrator. It is exactly reversible and stays
   near-unitary, so `|psi|^2` is conserved up to bounded oscillation
   rather than drifting.
3. **Synchronize before reading.** Because the parts are staggered in
   time, a naive `real^2 + imaginary^2` wobbles by `O(dt ||H||)`. So the
   norm and the return probability are read with the imaginary part
   pulled back to integer time, `im_sync = imaginary + (dt/2) H real`
   (since `d imaginary / dt = -H real`). That removes the staggering
   error and recovers the conserved quantity. The start norm is measured
   AFTER the half-step kick, also synchronized, so the drift is a fair
   comparison.
4. **Return probability is the diagnostic.** `returnAt()` reads only the
   source component, `P = real_source^2 + im_sync_source^2`. A LOW
   time-average means the amplitude left the source and did not return
   (extended, propagating). A HIGH average means the amplitude is pinned
   at the source (localized). The measure is metric-free, it needs no
   clean wavepacket and no notion of distance.
5. **The localization control.** `sparseWithAubryAndrePotential` adds a
   deterministic on-site potential to the diagonal,
   `V_i = strength * cos(2 pi phi i)` with `phi` the golden ratio. At
   strength 0 it is the bare operator. At a large strength it drives
   Anderson-like localization with NO randomness. This is the control
   that could have failed, if the clean operator also localized, the
   propagation claim would be empty. The clean-low, localized-high split
   is what makes the result real.

The norm drift is the built-in check. If the leapfrog were
unstable (dt too large), `normDrift` would blow up and the run is
invalid.

## Capabilities and limits

What it handles,

- ANY real symmetric `H` presented as a `LinearOperator`, Laplacian,
  Kahler-Dirac, anything.
- Large sparse systems, the cost is one `sparseMatVec` per half-step, no
  dense matrix is ever formed.
- A deterministic localization control, reproducible run to run (no
  seeds, vary SIZE not randomness).

The stability bound,

- The leapfrog is stable and near-unitary only for `dt` below
  `2 / ||H||` (the spectral norm of `H`). The fermion test uses
  `dt = 0.02` with `steps = 570`, well inside the bound for the
  Kahler-Dirac operator. Push `dt` past `2 / ||H||` and the integrator
  goes unstable, the norm diverges, and `normDrift` flags it.

The staggering caveat,

- The real and imaginary parts are NOT at the same time. Any physical
  readout (norm, return probability, overlap) MUST synchronize the
  imaginary part back to integer time first. Reading the raw
  `real^2 + imaginary^2` gives an `O(dt ||H||)` wobble that is an
  artifact of the integrator, not physics.
- For small systems where the exact answer is wanted with zero
  integrator error, use `evolveByEigendecomposition` instead. It costs a
  dense eigensolve, so it does not scale.

## Why it matters

Telling a propagating phase from a localized one is the core test for
whether a substrate carries real fermion dynamics. A free fermion on the
right geometry should SPREAD and not come back. Disorder should TRAP it.
This engine measures exactly that, stably, on graphs the tessellation
engine builds, with a deterministic control that rules out the trivial
explanations. It is how the {5,3,4} and pentacomb propagation
experiments earn their conclusions instead of asserting them.

## See also

- `api/measure.md`, the brief consumer guide to the measurement layer
  (this doc is the deeper dive on the evolution under it).
- `fermion-engine.md`, how `D = d + delta` (the Kahler-Dirac operator)
  is built, the thing this engine evolves.
- `test/experiment/spin/kahler-dirac-propagation-534.ts`, the {5,3,4}
  fermion propagation experiment.
- `test/experiment/substrate-survey/pentacomb-propagation.ts`, the
  pentacomb propagation experiment.
- `code/algebra/linear/sparse.ts`, the `LinearOperator` interface and
  the Aubry-Andre control potential.
