# Experiment Results

Tracked findings from running the `vibe-sim` testbed (the `@cluesurf/vibe` code).
Each run is a deterministic function of its seed, so every number here reproduces.

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

- [summary.md](summary.md) — all nine experiments (P1 to P9) in one table, with
  the raw numbers, what each means, and the open-problem status.
- [p3-both-worlds.md](p3-both-worlds.md) — the headline finding. A hyperbolic
  random graph can have exponential reach, Lorentz isotropy, and greedy-routing
  navigability at once. A candidate resolution of the addressing-versus-Lorentz
  fork, the most Vibe-Theory-specific open problem.
- [methodology-fixes.md](methodology-fixes.md) — the measurement bugs found and
  fixed while iterating, recorded so the numbers are trustworthy and the
  estimators are not silently wrong.

## Status at a glance

- **Build:** typecheck clean, 10 of 10 tests pass.
- **Solid:** dimension recovery, the Hauptvermutung (low variance), the Lorentz
  test, the CHSH superdeterminism curve, the P3 both-worlds substrate.
- **Open, as expected:** the causal-set dynamics does not yet concentrate on
  manifold-like orders (P2, P6), matching the literature.

See `note/research/vibe/research/open-problems-and-how-to-solve-them.md` in the
monorepo for the problem statements these results speak to.
