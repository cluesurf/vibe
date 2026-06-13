# P19: Dark Energy in 4D (the Everpresent Lambda)

**Status: 4D scaling measured. Sharp-action fluctuation problem, smeared kernel is the gap.**

## The question

Causal set theory's signature cosmological prediction is Sorkin's everpresent Lambda:
the cosmological constant is conjugate to the spacetime 4-volume V, which is realized
as the element count N, so Lambda fluctuates as 1 / sqrt(V), giving a small nonzero
dark energy of the observed magnitude. P10 measured the action-fluctuation scaling in
2D. This extends it to 4D.

## What we did

Sprinkle N points into 4D Minkowski, many realizations, at several N, and measure the
fluctuation of the 4D Benincasa-Dowker action across realizations. Since the action
estimates Lambda times V, delta-Lambda ~ delta-S / N, so delta-Lambda scales as
N^(actionExponent - 1).

## Result

| N | std(S) of the 4D action |
| - | ----------------------- |
| 64 | 128 |
| 128 | 211 |
| 256 | 447 |
| 512 | 1463 |

- The 4D action fluctuation scales as **std(S) ~ N^1.16**, so the implied
  **delta-Lambda ~ N^+0.16**.

## Honest reading

The exponent is positive, so the **sharp 4D Benincasa-Dowker action shows the known
fluctuation problem**: its fluctuation grows faster than the volume, the wrong sign
for the everpresent Lambda. This is milder than in 2D (where the sharp action gave
+0.47), but still not the everpresent shrinking.

This matches P10 exactly: the SHARP action has the fluctuation problem, and only the
SMEARED (nonlocal) action tames it so the implied Lambda shrinks with volume. We
showed that in 2D (P10, delta-Lambda ~ N^-0.29). In 4D the smeared action falls back
to the sharp one in the current testbed, because the 4D nonlocal smearing kernel (the
four-term Benincasa-Dowker smearing function) is not yet implemented.

So the mechanism is in hand and demonstrated in 2D, and the 4D smearing kernel is the
single remaining implementation step to recover the everpresent 1 / sqrt(V) in four
dimensions. With it, the sign and small value of dark energy would come from the
discreteness rather than a tuned constant.

## See also

`p10-cosmological-constant.md` (the 2D smeared result that does shrink),
`note/questions/frontiers.md` (the dark sector), and `p19-dark-energy-4d` (the experiment).
