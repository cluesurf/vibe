<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <img src='https://github.com/cluesurf/vibe/blob/make/view/vibe.png?raw=true' height='256'/>
</p>

<h3 align='center'>Vibe Theory</h3>
<p align='center'>
  A Discrete Model of the Universe<br/>
  (WIP)
</p>

<br/>
<br/>
<br/>

## Introduction

`vibe-sim` is a finite, discrete, reproducible simulator for testing the
[open problems of Vibe Theory](https://github.com/cluesurf/vibe/tree/make/note/questions)
and the discrete-spacetime program. It generates a discrete substrate,
runs a local rule over it in discrete beats, and measures the emergent
physics, so each research question becomes a runnable measurement.

Everything is finite and seeded. Real numbers appear only as measured
outputs (sprinkling coordinates, eigenvalues), never as the base, in
keeping with the discreteness principle.

The companion paper is a work in progress
[here](https://github.com/cluesurf/vibe/blob/make/vibe.pdf). The
research notes and the simulator design spec live in the monorepo at
`note/research/vibe/` and `note/research/vibe/research/testbed/`.

## What is inside

- **substrate** — Poisson-sprinkled Minkowski and curved spacetime,
  regular lattices, `{p,q}` hyperbolic tilings with Fibonacci
  addressing, hyperbolic random graphs, classical sequential growth.
- **rule** — synchronous, asynchronous, reversible, rewriting, and gauge
  updates.
- **operator** — graph Laplacian, Kahler-Dirac, the evolution
  Hamiltonian, and the gauge-covariant Dirac operator.
- **measure** — dimension, distance, curvature, manifold-likeness,
  Lorentz isotropy, navigation, CHSH, locality, integration, Wilson
  loops.
- **dynamics** — the Benincasa-Dowker action, causal-set Monte Carlo,
  coarse graining, and the Wilson heat bath.
- **experiment** — one runnable script per open problem (P1 to P9), plus
  a scan runner and report writer.

## Quick start

```
pnpm install
pnpm test:sim                                   # known-answer tests
pnpm sim code/experiment/p3-study.ts            # the addressing-vs-Lorentz study
pnpm sim code/experiment/p7-bell.ts             # CHSH vs setting correlation
```

Each experiment is also a standalone script:
`npx tsx code/experiment/pN-*.ts`. Findings are tracked in
`note/experiment/results/`.

## Results

Final status of each open problem, from the latest run. Build state:
typecheck clean, 10 of 10 known-answer tests pass. Full detail in
[note/experiment/results/validation.md](note/experiment/results/validation.md).

| Problem | What it tests                               | Status                  | Key result                                                                                                                                           |
| ------- | ------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1      | local rule with a bounded-below Hamiltonian | validated (partial)     | reversible rule is local (radius 1.67) and the energy is bounded below; whether H itself is local is still open                                      |
| P2      | a dynamics that favors manifold-like order  | candidate progress      | the smeared Benincasa-Dowker action gives near-2D, non-layered ensembles (height ratio ~1, dim ~2) where the sharp action collapsed to layered orders |
| P3      | addressing versus Lorentz                   | candidate solved        | a connected hyperbolic random graph has exponential reach, anisotropy 0.07 (Lorentz-safe), and 100 percent backtracking-routing navigability at once |
| P4      | the monist spinor, spin from topology       | validated               | Kahler-Dirac zero modes equal the Betti sum: disk 1, cylinder 2, torus 4, exactly                                                                    |
| P5      | the Hauptvermutung (unique geometry)        | validated (empirical)   | recovered dimension 3.02 plus or minus 0.05, proper-time coefficient of variation 0.027; a proof is still open                                       |
| P6      | a computable 2D path integral               | open                    | the sum over histories runs and converges, but the sampled orders are not cleanly 2D (dimension 3.26)                                                |
| P7      | quantum statistics from a classical base    | quantified              | CHSH S climbs from 1.0 to 4.0 as setting-state correlation rises; whether that correlation arises naturally is still open                            |
| P8      | one gauge field and one charged fermion     | validated (Stages A, B) | a U(1) field shifts the charged Dirac spectrum and the Aharonov-Bohm phase scales with charge; non-Abelian gauge and chirality are still open        |
| P9      | the relationship of structure to experience | boundary                | only the structural correlates (Markov blanket, integration) are measurable, by design                                                               |

Legend: **validated** means a stated prediction was confirmed by the
testbed. **candidate solved** means a working substrate or mechanism was
found and needs hardening. **quantified** means the mechanism was turned
into a measured curve. **open** means genuinely unsolved (shared
frontier with the literature). **boundary** means outside what the
simulator can decide.

## License

Private

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
