# P2 / P6 Spec: the causal-set dynamics problem

The deepest open problem in the testbed. This is the plan for what to try and why.

## The problem

A causal-set dynamics is a sum over histories: weight each causal set by an
action and ask which orders dominate. The trouble is that **most causal sets are
not manifold-like**. The Kleitman-Rothschild (KR) orders, flat three-layer
orders, dominate by sheer number. A good dynamics must suppress them so that
smooth, low-dimensional, manifold-like orders dominate instead.

Our first run failed: with the sharp Benincasa-Dowker (BD) action,
manifold-likeness FELL as the coupling rose. Two causes, now understood:

1. **The action was sharp, not smeared.** The BD action with a sharp kernel
   (count only nearest links, coefficients 1, -2, 1) is dominated by large
   fluctuations. This is the well-known BD-action fluctuation problem. The
   literature fix is a **smeared (nonlocal) kernel** with a scale epsilon that
   averages over roughly 1/epsilon order-layers, taming the fluctuations.
2. **The diagnostic was blunt.** Manifold-likeness scored a random small order as
   0.995, because at N = 40 the KR orders are not yet dominant and the heuristic
   did not actually detect layeredness.

## What we can do

### 1. Implement the smeared BD action (the literature mechanism)

The smeared 2D d'Alembertian (Benincasa-Dowker, Dowker-Glaser): for each element
x, sum over its past y with a kernel that depends on the order-interval
cardinality n between them,

```
f2(n, eps) = (1 - eps)^n [ 1 - 2 eps n / (1 - eps)
                              + eps^2 n (n - 1) / (2 (1 - eps)^2) ]
S_eps = - N / 2 + eps * sum over related (y, x) of f2(n_yx, eps)
```

At eps = 1 only the empty intervals (links) survive, recovering the sharp action.
At eps < 1 the kernel spreads over about 1/eps layers, with alternating signs and
geometric decay. The smearing scale is the nonlocality dial: the Goldilocks knob.

### 2. Sharpen the diagnostics

Replace the blunt score with direct order statistics that actually separate a
manifold from a KR order:

- **ordering fraction** (related pairs over all pairs), the Myrheim-Meyer input.
- **height** (longest chain) and **height ratio** = height / sqrt(N). A 2D
  manifold-like order has height about sqrt(N) (proper time), so the ratio is
  order 1. A KR order has height 3, so the ratio falls toward 0. This is a clean
  layeredness detector.
- **Myrheim-Meyer dimension**.

### 3. Sweep epsilon and beta

Run the Monte Carlo with the smeared action, sweeping the smearing scale epsilon
and the inverse temperature beta, and watch the height ratio and dimension. Look
for a window where the dominant orders are tall (non-KR) and near 2-dimensional.

### 4. Positive control: a manifold-favoring action

To separate "the sampler cannot reach manifold-like orders" from "the natural
action does not select them", run a constructed action that directly targets the
2D ordering fraction. If the Monte Carlo then produces tall, 2-dimensional orders,
the method works and the open part is purely the choice of a physical action.

## Honest expectations

The full 2D causal-set phase transition (Surya, Glaser-Surya) lives at hundreds of
elements with careful Monte Carlo. At our modest sizes we may see only the onset.
The realistic deliverables: (a) confirm the smeared action reduces the action
fluctuations and shifts the ensemble, (b) show with the positive control that a
manifold-favoring action does drive the ensemble to tall, near-2D orders, and
(c) report honestly whether the physical smeared BD action alone does so. Even a
clear negative with a working positive control is real progress: it localizes the
problem to the action, not the machinery.

## See also

`note/experiment/results/validation.md` for the validated problems, and
`note/research/vibe/research/open-problems-and-how-to-solve-them.md` (P2) in the
monorepo for the full statement.
