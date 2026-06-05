<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>@cluesurf/vibe</h3>
<p align='center'>
  Vibe Theory: A Discrete Model of the Universe
</p>

<br/>
<br/>
<br/>

## Introduction

`vibe-sim` is a finite, discrete, reproducible simulator for testing the
open problems of Vibe Theory and the discrete-spacetime program. It
generates a discrete substrate, runs a local rule over it in discrete
beats, and measures the emergent physics, so each research question
becomes a runnable measurement.

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
