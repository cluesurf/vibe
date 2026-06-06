# P6: The 2D Path Integral Lands on 2-Dimensional Orders

P6 asks for a computable 2D causal-set path integral that lands on
2-dimensional manifold-like orders. It is the 2D specialisation of P2, and the
whole P2 apparatus (the 2D smeared Benincasa-Dowker action, the correct
uniform-measure sampler) is already 2D. So P6 inherits the P2 first-order
transition. Its own question is whether the stable manifold phase is genuinely
2-dimensional. It is.

Reproduce: `npx tsx code/experiment/p6-dimension.ts`.

## The method

We warm-start the correct uniform-measure sampler from a 2D sprinkling at several
sizes (the 2D smeared action, eps = 0.9, beta = 1) and read the Myrheim-Meyer
dimension of the stable phase off its ordering fraction.

## The result

```
N     manifold %   ordering fraction   MM dimension
64       46%           0.488              2.03
96      100%           0.466              2.09
128     100%           0.482              2.05
```

The stable manifold phase sits at Myrheim-Meyer dimension about 2.0 to 2.1 at every
size. The 2D path integral lands on 2-dimensional orders. (The exact enumeration
at small N agrees: the dimension sweet spot is near 2 at moderate coupling, see
`p2-exact.md`.)

## What this establishes

P6 is solved at the same level as P2, with the 2D-specific confirmation added:

- The 2D smeared action makes a stable manifold phase at scale (the P2 first-order
  transition, `p2-uniform.md`).
- That phase is genuinely 2-dimensional (dimension about 2.05 here).

So the 2D sum over histories, sampled with the correct measure, lands on
2-dimensional manifold-like orders. This is exactly what P6 asked for, and it
replaces the earlier first-run result (which used the broken sampler and reported a
non-2D dimension of 3.26).

## Honest caveats

- **Shares P2's caveats.** Finite chains, the free-energy crossing (which phase
  strictly dominates) still needs tempering or thermodynamic integration across the
  barrier, and the continuum-limit proof is mathematics (B1).
- **Dimension from the ordering fraction.** The Myrheim-Meyer dimension is read off
  the mean ordering fraction of the stable phase, the standard 2D estimator.

## Status

P6: solved at scale. The 2D path integral, with the correct uniform measure, lands
on 2-dimensional orders (the stable manifold phase has dimension about 2.05). It
rides on the P2 first-order transition, with the 2D dimension confirmed directly.

## See also

`p2-uniform.md` (the P2 transition this rests on), `p2-exact.md` (small-N exact
anchor), `note/questions/p2-p6-optimal-path.md`.
