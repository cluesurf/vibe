# The Lattice Gauge Engine

The Wilson lattice gauge program, realized on the substrate. The gauge field lives on the LINKS as group
elements, the physics lives in the PLAQUETTE (the ordered product around a face), and Metropolis or heat-bath
sweeps sample the configurations at a given coupling. A charged fermion couples to the field through the
Peierls phase, and the two sectors evolve together.

> This is the standard lattice gauge theory, delivered on the model's photon and fermion sectors. A connection
> is a tone on the relational vibes (the edges), and every gauge-invariant quantity is a closed loop of those
> tones. The engine covers both groups the program needs, the Abelian U(1) photon and the non-Abelian SU(2),
> and it couples the gauge field to the chiral overlap fermion so the deeper results (the chiral condensate and
> the lattice index theorem) come out as integers.

Source, `code/dynamics/su2-lattice.ts`, `code/dynamics/wilson.ts`, `code/dynamics/wilson-grid.ts`,
`code/dynamics/schwinger-coupled.ts`. Operators in `code/operator/`. Observables in `code/measure/`.
Validated by `test/experiment/gauge/`.

---

## What it does

Given a lattice (a periodic hypercube or any substrate graph) and a gauge group, the engine,

- stores a LINK VARIABLE on every edge, a U(1) phase or an SU(2) unit quaternion,
- builds the PLAQUETTE, the ordered product of links around the smallest oriented loop, the gauge-invariant
  unit of the action,
- forms the WILSON ACTION from the plaquettes and SAMPLES configurations with Metropolis or heat-bath sweeps
  at inverse coupling beta,
- COUPLES a charged fermion to the field through the Peierls phase, the gauge field deflects the fermion and
  the fermion current sources the field (the coupled Schwinger evolution, both directions),
- MEASURES the gauge observables, the Wilson loop, the Creutz ratio (string tension), the Aharonov-Bohm phase,
- computes the deeper operators, the chiral condensate (the overlap sign function) and the overlap index (the
  lattice index theorem).

The whole state is the link array. The gauge field has no value at the sites, only on the edges between them.

---

## The components

| file | role |
| ---- | ---- |
| `code/dynamics/su2-lattice.ts` | the SU(2) engine, `makeSu2Lattice`, `metropolisSweep`, `averagePlaquette`, `wilsonLoop`, `creutzRatio` |
| `code/dynamics/wilson.ts` | the graph U(1) engine, `plaquettesOf`, `wilsonAction`, `heatBathSweep` |
| `code/dynamics/wilson-grid.ts` | the cubic-grid U(1) action, `gridPlaquettes`, `gridWilsonAction`, `gridMaxwellAction` |
| `code/dynamics/schwinger-coupled.ts` | the coupled 1+1D fermion-plus-gauge evolution, `runCoupledSchwinger` |
| `code/operator/maxwell-lattice.ts` | the free Maxwell (curl-curl) operator spectrum, `maxwellLatticeSpectrum` |
| `code/operator/gauge-index.ts` | the lattice index theorem, `gaugeWilsonDirac`, `overlapIndex`, `totalFlux` |
| `code/operator/overlap-condensate.ts` | the U(1) chiral condensate via the overlap sign, `chiralCondensateSignal` |
| `code/operator/overlap-su2.ts` | the non-Abelian condensate, `chiralCondensateSignalSU2` |
| `code/measure/wilson-loop.ts` | the loop observables, `wilsonLoopPhase`, `wilsonLoopValue`, `creutzRatioFromLoops` |
| `code/measure/aharonov-bohm.ts` | the loop holonomy of a charge, `aharonovBohmPhase` |

Start with `su2-lattice.ts` for the full action-and-sampling loop, or `schwinger-coupled.ts` for the coupled
fermion evolution.

---

## How to use it

### Build an SU(2) lattice, sweep, measure the plaquette

```ts
import { makeSu2Lattice, metropolisSweep, averagePlaquette, creutzRatio } from '@/code/dynamics/su2-lattice'
import { Rng } from '@/code/tool/rng'

const rng = new Rng(1)

// a 4D periodic lattice, length 6 per axis, cold start (every link the identity)
const lattice = makeSu2Lattice({ dim: 4, length: 6, hot: false, rng })

// sample at inverse coupling beta. Each sweep proposes a small rotation on every link.
for (let i = 0; i < 200; i++) {
  const accept = metropolisSweep({ lattice, beta: 2.3, eps: 0.3, rng })
  // accept is the acceptance rate, tune eps so it stays near 0.5
}

averagePlaquette({ lattice })   // near 1 in the ordered (weak-coupling) phase, near 0 in the disordered one
creutzRatio({ lattice, r: 2, t: 2 })   // the string tension, positive and scale-stable means confinement
```

A `hot: true` start randomizes every link (the disordered phase). A `cold` start is the ordered vacuum. The
phase the lattice settles into depends on beta, which is the whole point of the sweep.

### Run the coupled Schwinger evolution (1+1D QED)

```ts
import { runCoupledSchwinger } from '@/code/dynamics/schwinger-coupled'

// a charged fermion wavepacket on a ring, plus a U(1) gauge field on the bonds
const out = runCoupledSchwinger({
  sites: 64,
  coupling: 0.4,        // the gauge coupling e, zero decouples the two sectors
  mass: 0.2,
  flavors: 1,
  backgroundField: 0.1, // a constant field seeded on every link, to push the fermion
  momentumStart: 0.3,   // the initial fermion momentum, to radiate into the field
  steps: 200,
  dt: 0.1,
})

out.momentumDrift   // how far the field pushed the fermion (the field -> fermion direction)
out.fieldEnergy     // the field energy raised above the background (the fermion -> field direction)
```

### The U(1) action on a substrate graph

```ts
import { plaquettesOf, wilsonAction, heatBathSweep } from '@/code/dynamics/wilson'

const plaquettes = plaquettesOf({ graph })     // small cycles (triangles, then 4-cycles) of the graph
wilsonAction({ field, plaquettes, beta: 1.5 }) // sum over plaquettes of beta * (1 - cos(holonomy))
heatBathSweep({ field, plaquettes, beta: 1.5, rng })   // one sweep, proposes +/-1 (mod q) per link
```

---

## How it works

The whole engine rests on one idea, a CONNECTION lives on the edges and the physics is the closed loop.

1. **Link variables**. Each edge carries a group element. For U(1) it is a phase, stored as an integer clock
   variable mod q (`wilson.ts`) or a continuous angle theta (`wilson-grid.ts`). For SU(2) it is a unit
   quaternion `(q0, q1, q2, q3)`, the matrix `q0 I + i (q . sigma)`, with `(1/2) Tr U = q0` (`su2-lattice.ts`).
   The link from x in direction mu is the parallel transport you pick up crossing that edge.

2. **The plaquette**. Take the smallest oriented loop, a unit square. Multiply the four links around it in
   order, `U_mu(x) U_nu(x+mu) U_mu(x+nu)^dag U_nu(x)^dag`. This product is the field strength through the face.
   It is GAUGE INVARIANT, a gauge transformation rotates each site, and the rotations cancel around any closed
   loop. The U(1) version is the curl of the link angles, `F = theta_a + theta_b - theta_c - theta_d`.

3. **The Wilson action**. Sum a cost over the plaquettes. For U(1) it is `beta * (1 - cos F)`. For SU(2) it is
   `beta * (1 - (1/2) Tr U_plaq)`. Both are minimized when every plaquette is trivial (a flat connection). The
   small-field limit `1 - cos x -> x^2 / 2` recovers the Maxwell action `(1/2) sum F^2` (`gridMaxwellAction`),
   so Maxwell is the weak-field shadow of Wilson.

4. **The sweep**. Sample configurations weighted by `exp(-S)`. A Metropolis sweep visits every link, proposes a
   small change (a near-identity rotation `r U` for SU(2), a `+/-1 mod q` step for U(1)), and accepts with
   `min(1, exp(-beta deltaS))`. The action change is LOCAL, only the plaquettes touching that link matter, so
   the SU(2) engine precomputes the STAPLE (the sum of the other three links of each touching plaquette) and
   `deltaS = -beta (Tr(U_new A) - Tr(U_old A))`. The U(1) engine indexes plaquettes by edge and recomputes only
   the touching loops. Cold start plus low beta is ordered, hot start plus high beta is disordered.

5. **Observables**. The Wilson loop is the holonomy around a larger rectangle, `wilsonLoopPhase` sums the link
   phases around it and `wilsonLoopValue` takes the cosine. The Creutz ratio
   `chi = -ln(W(r,t) W(r-1,t-1) / (W(r-1,t) W(r,t-1)))` extracts the string tension, a positive scale-stable
   value is the area law of CONFINEMENT. The Aharonov-Bohm phase is the charge times the loop holonomy, nonzero
   even where the local field is zero.

6. **Minimal coupling (the Peierls phase)**. A charged fermion hopping across a link picks up the phase
   `e^{i e theta}` of that link, where e is the charge. This is the gauge-covariant derivative on the lattice.
   In `runCoupledSchwinger` one synchronous beat is, the fermion MASS COIN mixes the two chiralities (the
   right-mover and left-mover) by `cos(mass)` and `sin(mass)`, then each chirality HOPS with its Peierls phase,
   `R` hops +1 with `e^{i e theta}` and `L` hops -1 with `e^{-i e theta}`. The field DEFLECTS the fermion.

7. **Back-reaction (the field sources)**. The fermion current across each bond is accumulated, and the shared
   electric field updates by `E -= e * current * dt` (Ampere), then the link angle advances by
   `theta += E * dt`. So the fermion current SOURCES the field. The two directions, field-pushes-fermion and
   fermion-radiates-field, are both present, bound by the one coupling e. At `e = 0` the sectors decouple
   exactly. Everything is a fixed Gaussian wavepacket on a fixed background, deterministic, no randomness.

8. **The deeper gauge results**. The overlap operator is `D_ov = 1 + gamma5 sign(H_W)`, built from the sign
   function of the Wilson-Dirac kernel `H_W = gamma5 (D_W - m0)`. Its INDEX (the signed zero-mode count) equals
   the gauge topological charge, the lattice Atiyah-Singer theorem, computed as
   `index = -(1/2) sum_i sign(lambda_i)` of `H_W` (`overlapIndex`). The CHIRAL CONDENSATE follows from the
   near-zero spectral density of the gamma5-Hermitian overlap (Banks-Casher), nonzero purely from the anomaly,
   growing with gauge disorder (`chiralCondensateSignal`, and `chiralCondensateSignalSU2` for the non-Abelian
   field). The chiral fermion sees the gauge topology exactly, as an integer.

---

## Capabilities and limits

What it handles,

- BOTH groups, the Abelian U(1) photon (`wilson.ts`, `wilson-grid.ts`) and the non-Abelian SU(2)
  (`su2-lattice.ts`), through the same plaquette-and-sweep shape.
- ANY rank for SU(2), `makeSu2Lattice({ dim })` builds a periodic hypercube of any dimension.
- ARBITRARY substrate graphs for U(1), `plaquettesOf` finds the small cycles of any graph, so the gauge field
  runs on the same mesh the rest of the program uses.
- The FULL coupled evolution, the fermion and the field evolve together with exact back-reaction, not a fixed
  background on either side.
- The TOPOLOGICAL results as integers, the index theorem and the anomaly-driven condensate.

The structural facts,

- The gauge field is on the EDGES, never the sites. Every physical quantity is a closed loop of links.
- The Wilson action and the Maxwell action agree in the weak-field limit, Maxwell is not separate physics.
- The coupling e is a FREE constant. The bare rule does not fix it, the experiments measure what it must be.
- The condensate uses the overlap SIGN function (a dense eigensolve), so it is bounded to small lattices.

---

## Why it matters

This is the gauge half of the physics program, realized honestly. The model's relational tones on the edges ARE
the connection, the plaquette IS the field strength, and the standard lattice machinery (Wilson action,
Metropolis sampling, confinement by the area law, the Peierls-coupled fermion) all run on top with no new
ingredients. The coupled Schwinger evolution shows the gauge field and the charged fermion drive each other in
both directions from one coupling. The overlap index theorem and the chiral condensate show the chiral fermion
sees the gauge topology exactly, the deepest gauge result, as an integer. The same engine covers U(1) and
SU(2), which is what the frontier agenda (the photon, the strong force, the electroweak sector) needs.

## See also

- `api/dynamics.md`, the brief consumer guide to the dynamics engines (this doc is the deeper dive under it).
- `api/operator.md`, the brief consumer guide to the operators (the overlap, the index, the condensate).
- `rule-engine.md`, the base reversible rule the substrate runs on, beneath the gauge sectors.
- `test/experiment/gauge/coupled-qed-3434.ts`, the coupled fermion-plus-gauge evolution (both directions).
- `test/experiment/gauge/su2-condensate.ts`, the non-Abelian chiral condensate from the anomaly.
- `test/experiment/gauge/coemergence-dynamical-3434.ts`, the gauge field and fermion co-emerging on {3,4,3,4}.
