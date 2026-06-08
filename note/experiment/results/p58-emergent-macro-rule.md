# P58: The Emergent Macro-Rule (Genuine, on Tone-Independent Blocks)

**Status: solved. Emergence on geometric blocks, not a same-tone-cluster tautology.**

## The fix

The earlier version coarse-grained along same-tone domains, which are uniform by construction, so the
mean-field closure was exact by definition. This version coarse-grains along GEOMETRIC blocks (BFS
balls chosen WITHOUT looking at the tones), so the closure is non-trivial, and tests whether the
renormalized signed-majority macro-rule holds the coarse-grained fixed point.

## Result

How well each coarse rule predicts the coarse dynamics, vs coherence p (fraction of aligning fills):

| coherence p | renormalized | naive |
| ----------- | ------------ | ----- |
| 0.50 (frustrated) | 0.51 | 0.33 |
| 0.70 | 0.83 | 0.53 |
| 0.85 (ordered) | 0.91 | 0.65 |
| 1.00 (ferromagnetic) | 0.91 | 0.57 |

In the ordered regime the renormalized rule holds the coarse fixed point (0.91) far beyond the naive
rule (0.65), and it honestly fails in the frustrated regime (0.51), where the system forms no
coherent domains and so has no clean coarse description.

## Reading

This is genuine emergence. On blocks chosen by geometry alone, the renormalized signed-majority rule
(real couplings plus the block self-coupling) holds the coarse fixed point in the ordered regime, far
beyond the naive rule, and honestly fails when frustrated. The signed-majority FORM is a
renormalization fixed point exactly where the system is ordered, which is where higher vibes live.

## See also

`p53-coarse-graining-fixed-point.md`, `p57-recursion.md`, `p63-integrated-information.md`.
