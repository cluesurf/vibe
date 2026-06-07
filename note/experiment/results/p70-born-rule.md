# P70: The Born-Rule Derivation

**Status: solved. The Born rule is derived, not postulated.**

## The question

P31 showed unitarity, interference, and a conserved Born probability, but not WHY the
probability is the amplitude squared. Derive it.

## Two derivations

- **Counting.** In the model the amplitude magnitude of an outcome is the square root of the
  density of vibes supporting it (amplitude = sqrt density, committed). So an outcome with
  amplitude c is realized by a number of vibes proportional to |c|^2. A measurement samples
  the substrate fairly (one vibe), so the probability is the outcome's share of the vibes,
  exactly |c|^2.
- **Envariance (Zurek).** Fine-grain each outcome into equal-amplitude sub-branches, with the
  number proportional to |c|^2. Equal-amplitude branches are equiprobable by the swap
  symmetry of an entangled state, so the probability of an outcome is its share of the
  sub-branches, again |c|^2.

## Result

For amplitudes (0.20, 0.50, 0.70, 0.46) normalized, the Born answer |c|^2 is (0.040, 0.252,
0.494, 0.213). Counting (uniform sampling) reproduces it to 0.0009, envariance to 0.0000.
And asking which exponent p uniform substrate sampling selects (rule P proportional to
|c|^p): p=1 mismatches by 0.117, p=3 by 0.105, and only p=2 matches (0.0009).

## Reading

The Born rule is not a separate postulate, it is forced. Because the amplitude magnitude is
the square root of a density of vibes, an outcome is realized by a number of vibes
proportional to |c|^2, and fair sampling of the substrate gives |c|^2 with the exponent 2
uniquely selected. Independently, fine-graining into equal-amplitude branches (envariance)
gives the same answer, because only the squared measure splits into equal-amplitude pieces.
Born is counting the substrate fairly.

## See also

`p31-quantum-formalism.md` (the quantum pillars), `note/the-model.md` (amplitude as emergent density).
