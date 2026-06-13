# P29: Dark Energy in 4D with the Smeared Kernel

**Status: progress. The 4D smeared kernel tames the fluctuation toward the everpresent Lambda.**

## The question

P19 found the sharp 4D Benincasa-Dowker action has the fluctuation problem (the implied
Lambda grows with volume). P10 showed that in 2D the smeared (nonlocal) action tames
this so Lambda shrinks (the everpresent direction). With the 4D smeared kernel now
implemented, does smearing tame the 4D fluctuation too?

## What we did

Implemented the 4D smeared Benincasa-Dowker kernel (coefficients 1, -9, 16, -8 smeared
the same way as 2D). Measured the action-fluctuation scaling on 4D sprinklings for the
sharp and the smeared action, and read off the implied Lambda exponent.

## Result

| action | std(S) scaling | implied delta-Lambda |
| ------ | -------------- | -------------------- |
| sharp 4D | N^1.16 | N^+0.16 (grows) |
| smeared 4D (eps 0.3) | N^1.06 | N^+0.06 (near flat) |

The smeared kernel **tames the fluctuation**: the implied Lambda exponent drops from
+0.16 toward zero (+0.06), the everpresent direction, the same effect smearing has in
2D (P10, where it reached -0.29).

## Honest reading

This confirms the mechanism (smearing pushes the implied Lambda toward shrinking with
volume) but does not yet reach the full everpresent shrinking (-0.5) in 4D at these
sizes: the static action-fluctuation exponent flattens near zero rather than going
clearly negative, and smaller smearing scales do not help. The full everpresent
1 / sqrt(V) likely needs the DYNAMICAL conjugate-volume model (Lambda as the conjugate
of the fluctuating 4-volume), not just the static action variance, plus larger N. At
the observed 4-volume the everpresent scaling would give Lambda of order 10^(-122), the
dark-energy magnitude.

## See also

`p10-cosmological-constant.md` (the 2D smeared result that shrinks), `p19-dark-energy.md`
(the sharp 4D fluctuation problem), and `p29-dark-energy-smeared` (the experiment).
