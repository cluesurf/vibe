# Experiment Results

Tracked findings from running the `vibe-sim` testbed (the
`@cluesurf/vibe` code). Each run is a deterministic function of its
seed, so every number here reproduces.

## How to reproduce

From the package root (`deck/vibe`):

```
pnpm install
pnpm test:sim                              # 10 known-answer tests
npx tsx code/experiment/p3-study.ts        # the headline P3 study
npx tsx code/experiment/pN-*.ts            # any single experiment
```

Scan experiments (p2, p7) also write JSON and markdown into `out/`.

## The docs

- [summary.md](summary.md): all nine experiments (P1 to P9) in one
  table, with the raw numbers, what each means, and the open-problem
  status.
- [p3-both-worlds.md](p3-both-worlds.md): the headline finding. A
  hyperbolic random graph can have exponential reach, Lorentz isotropy,
  and greedy-routing navigability at once. A candidate resolution of the
  addressing-versus-Lorentz fork, the most Vibe-Theory-specific open
  problem.
- [validation.md](validation.md): the validation pass. Five predictions
  checked and confirmed: spin from topology (P4, zero modes = Betti
  sum), navigability to 100 percent (P3), geometry sharp in proper time
  (P5), a local rule with a bounded-below Hamiltonian (P1), and charge
  coupling to the fermion (P8).
- [p2-dynamics.md](p2-dynamics.md): progress on the hardest problem. The
  smeared Benincasa-Dowker action selects near-2D, non-layered ensembles
  where the sharp action collapsed to layered orders. The Goldilocks
  smearing window, found.
- [p8-confinement.md](p8-confinement.md): Stage C of the gauge ladder. 3D
  SU(2) lattice gauge theory confines: positive string tension at every
  coupling, falling with beta, the Wilson area law of the strong force.
- [p4-chirality.md](p4-chirality.md): the chirality wall threaded. The
  overlap operator gives one fermion species with exact lattice chiral
  symmetry (Ginsparg-Wilson residual 6e-16), where the naive operator has
  4 doublers and Wilson breaks chirality. Stage D's hard part.
- [p8-index.md](p8-index.md): the chiral fermion meets the gauge field.
  The overlap fermion's index equals the gauge topological charge exactly
  (index = -Q, integer), the lattice Atiyah-Singer index theorem.
- [methodology-fixes.md](methodology-fixes.md): the measurement bugs
  found and fixed while iterating, recorded so the numbers are
  trustworthy and the estimators are not silently wrong.

## Status at a glance

- **Build:** typecheck clean, 14 of 14 tests pass.
- **Validated:** spin from topology and the chirality wall threaded by the
  overlap operator (P4), navigability to 100 percent (P3), geometry sharp
  in dimension and proper time (P5), a local rule with a bounded-below
  Hamiltonian (P1), charge coupling to the fermion, 3D SU(2) confinement,
  and the lattice index theorem (P8 Stages A, B, C plus index = topological
  charge), the CHSH superdeterminism cost curve (P7).
- **Candidate progress:** the smeared causal-set action now selects
  near-2D, non-layered ensembles (P2), where the sharp action failed.
- **Open, as expected:** the dynamical and non-Abelian chiral gauge
  coupling (the full chiral gauge theory), the P2 phase transition at
  scale, and the P6 path integral, matching the literature.
