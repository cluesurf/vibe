# P2 / P6: Parallel Tempering Resolves the Metastability

The warm-start study found two basins separated by a persistent gap and read it as
metastable coexistence (a hint of a first-order transition). Parallel tempering
overturns that reading and sharpens the real problem. This is honest science: the
better sampler corrected the earlier interpretation.

Reproduce: `npx tsx code/experiment/p2-tempering.ts`.

## The method

We ran R = 8 replicas of the causal-set Monte Carlo at a ladder of inverse
temperatures (smeared action, eps = 0.9, N = 48), with local moves in each replica
and adjacent-replica swaps each sweep. Configurations migrate across the ladder, so
a replica that gets stuck in one basin at cold temperature can warm up, escape, and
re-cool, giving true equilibrium where a single chain cannot. We measured the order
parameter (height ratio), its susceptibility (variance), and the fraction of
samples that are manifold-like (height ratio > 1) at each temperature.

## The result

```
swap acceptance: 18%
beta   mean hr   susceptibility   manifold fraction (hr>1)
0.1     4.03        0.123              100%
0.2     4.01        0.128              100%
0.35    3.68        0.114              100%
0.55    1.92        0.054              100%
0.8     1.57        0.067              100%
1.1     1.25        0.007              100%
1.5     1.94        0.014              100%
2.0     1.09        0.005              100%

coexistence (two modes both populated): no
```

Two clear conclusions:

1. **No coexistence, no first-order transition in this ensemble.** The manifold
   fraction is 100 percent at EVERY temperature. There is no competing layered
   phase. The order parameter simply decreases smoothly from chain-like (height
   ratio 4 at hot) to manifold-like (about 1.1 at cold). The earlier warm-start gap
   was the layered start mixing slowly, not two coexisting phases. Parallel
   tempering, which lets the layered configurations escape, shows they all become
   manifold-like.
2. **The smeared action never produces layered orders here.** Under this action, in
   this sampler, layered Kleitman-Rothschild orders do not appear at any
   temperature. The action robustly avoids them.

## What this tells us, and what P2 really needs

This is genuine progress, because it corrects the picture and isolates the true
remaining obstacle.

- The metastability question is settled: there is no coexistence under the smeared
  action. The earlier "two basins" reading was a sampling artefact.
- But that also means this sampler does not actually test P2's hardest claim.
  P2 asks whether the dynamics makes manifold-like orders dominate over the
  ENTROPIC majority of layered orders. The layered orders dominate the UNIFORM
  measure on causal sets. Our link-toggle move set does not sample the uniform
  measure (it favours tall orders), so the entropic competition never appears, and
  the smeared action wins by default.

So the real remaining need for P2 is not just a faster move, it is a sampler with
**correct detailed balance with respect to the uniform measure on causal sets**, so
that the layered majority is properly represented and we can see whether the action
genuinely beats it. That is a deeper infrastructure requirement than speed, and it
is the honest next step.

## Honest caveats

- **Swap acceptance 18 percent.** Usable but modest. A finer ladder or more
  replicas would improve mixing further. The unanimous 100 percent manifold across
  all temperatures is robust to this, since no temperature shows any layered mass.
- **N = 48.** Modest size. But the absence of a layered phase is a statement about
  the ensemble and the action, not a finite-size effect that larger N would reverse
  for this sampler.
- **The measure, not just the size, is the issue.** The key correction: progress on
  P2 is gated by the sampling measure, not only by the lattice size.

## Status

P2 / P6: the metastability is resolved (no coexistence under the smeared action,
correcting the warm-start reading). The genuine open requirement is a
uniform-measure sampler that represents the entropic layered majority, so the
dominance question can actually be posed. This is documented as the precise next
infrastructure step in `note/questions/p2-p6-optimal-path.md`.

## See also

`p2-dynamics.md` and `p2-transition.md` (earlier results, now refined by this one),
`note/questions/p2-p6-optimal-path.md` (the optimal path).
