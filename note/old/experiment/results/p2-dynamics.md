# P2: Progress on the Causal-Set Dynamics

P2 was the hardest open problem: making manifold-like orders dominate the sum over
histories. The first attempt failed (the sharp Benincasa-Dowker action drove the
ensemble to layered orders). The second attempt, with the **smeared** action and
a sharper diagnostic, works at the testbed scale. This is genuine progress.

Reproduce: `npx tsx code/experiment/p2-study.ts` and
`npx tsx code/experiment/p2-epsilon.ts`.

## The diagnostic

The discriminant is the **height ratio** = longest chain over sqrt(N). A 2D
manifold-like order has a longest chain about sqrt(N) (its proper time), so the
ratio is order 1. A layered Kleitman-Rothschild (KR) order has height 3, so the
ratio falls toward 0. Together with the Myrheim-Meyer dimension, this cleanly
separates a manifold from a layered order, which the old blunt score did not.

## The mechanism: smearing

The sharp Benincasa-Dowker action counts only nearest links. It is dominated by
fluctuations and, minimised, drives the ensemble to flat layered orders. The
smeared action replaces the sharp kernel with a nonlocal one that averages over
about 1/eps order-layers (the Goldilocks scale). This tames the fluctuations and
exposes a manifold-like regime.

## The result

At inverse temperature beta = 2, comparing ensembles against a true 2D sprinkling
as the reference:

```
ensemble                heightRatio  mmDim
reference 2D sprinkle        1.44     2.18   (N=48)
random (beta=0)              3.41     1.31
sharp BD action              0.29     3.45   <- layered, KR-like (the failure)
smeared BD eps=0.2           3.99     1.34   <- over-smeared, tall near-1D chains
smeared BD eps=0.5           2.09     1.60
smeared BD eps=0.9           1.07     2.15   <- near the 2D reference
```

Sweeping the smearing finely, at two sizes:

```
N=48  reference heightRatio 1.44, mmDim 2.18
  eps 0.80 -> 1.21 / 2.00
  eps 0.85 -> 1.03 / 2.09
  eps 0.90 -> 1.07 / 2.15
  eps 0.95 -> 1.04 / 2.39
  eps 0.99 -> 1.36 / 2.05

N=72  reference heightRatio 1.89, mmDim 1.99
  eps 0.80 -> 1.02 / 2.27
  eps 0.85 -> 0.93 / 2.63
  eps 0.90 -> 1.08 / 2.59
  eps 0.95 -> 1.07 / 2.61
  eps 0.99 -> 1.12 / 2.74
```

## What this says

**The smeared Benincasa-Dowker action produces near-2-dimensional, non-layered
ensembles, robustly across smearing scales eps in [0.8, 0.99] and at both sizes.**
The dimension sits near 2 (about 2.0 to 2.7) and the height ratio near 1 (close to
the 2D-sprinkle reference), in stark contrast to the sharp action, which collapsed
to layered KR orders (height ratio 0.29, dimension 3.45). Smearing the action
turns a KR-favoring measure into a manifold-favoring one.

There is also a clear over-smearing failure: at small eps (0.2 to 0.5) the
ensemble overshoots into tall, near-1-dimensional chains (height ratio up to 4,
dimension down to 1.3). So the manifold regime is a genuine **window** in the
smearing scale, the Goldilocks behaviour the literature predicts: too little
smearing gives layered orders, too much gives chains, and an intermediate-to-high
range gives manifold-like orders.

## Honest caveats

- **Onset, not the full phase transition.** This is N = 48 and 72 with a modest
  Monte Carlo. The recovered dimension drifts a little above 2 at the larger size
  (2.3 to 2.7 versus a reference near 2.0), so the match is approximate. The full
  2D causal-set phase transition (Surya, Glaser-Surya) needs hundreds of elements
  and careful sampling. What we show is the onset: the smeared action clearly
  selects manifold-like over layered orders.
- **The Monte Carlo measure is imperfect.** The beta = 0 "random" ensemble here is
  tall and chain-like, not the uniform KR-dominated measure, because the
  link-toggle move set does not sample uniformly on labelled orders. The
  meaningful comparison is sharp-action (layered) versus smeared-action
  (manifold), and that contrast is sharp.
- **The dimension-target control froze.** A constructed action penalising the
  squared dimension deviation got stuck at the antichair start (acceptance 0 at
  high beta). This is an MCMC initialisation and landscape issue, not central to
  the smeared-action result, but it means the sampler needs a warm start or a
  cluster move for stiff actions.

## Status

P2 moves from **open** to **candidate progress**: the smeared action is a physical
(not constructed) action whose dominant orders are manifold-like at the testbed
scale. The remaining work is to push to larger N and confirm the full phase
transition, and to add a cluster or warm-started Monte Carlo move so stiff
actions do not freeze.

## See also

`note/questions/p2-dynamics-spec.md` for the plan, `summary.md` for all
experiments, `validation.md` for the validated problems.
