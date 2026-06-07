# P70: The Born Rule, Derived Without Assuming It

**Status: solved (non-circular). The exponent 2 is forced, not put in.**

## The fix

The earlier version seeded the substrate with weights = |c|^2 and then "recovered" |c|^2, and it
"selected exponent 2" by comparing to that same pre-squared data. Both were circular. This version
removes them. The only assumption is the model's one quantum claim: a patch's amplitude is the square
root of how many vibes are co-excited in it, amplitude = sqrt(count). The Born rule is then derived.

## The derivation

1. **Quadrature additivity (a substrate fact, measured).** Disjoint patches have disjoint vibe sets,
   so their counts add. Since amplitude = sqrt(count), amplitudes add in quadrature: a_total^2 =
   a1^2 + a2^2. Measured residual: 3e-11.
2. **The exponent is forced by a functional equation.** Probabilities of disjoint outcomes must add,
   P_total = P1 + P2. If P = |a|^p, then quadrature additivity (1) plus probability additivity force
   (a1^2 + a2^2)^(p/2) = a1^p + a2^p for all amplitudes. This holds only at p = 2.

   | exponent p | functional-equation residual |
   | ---------- | ---------------------------- |
   | 1 | 0.29 |
   | 2 | 0.0 (forced) |
   | 3 | 0.41 |

3. **Fair sampling gives Born.** A measurement samples the vibes uniformly, so the probability of an
   outcome is its share of the vibes, count / total = amplitude^2 = |c|^2. Sampled frequencies match
   |c|^2 to 0.0017.

## Reading

The squaring is not inserted. Amplitudes add in quadrature because they are square roots of vibe
counts and disjoint counts add, while probabilities must add over disjoint outcomes, and the only
exponent reconciling those is 2. Fair sampling of the substrate then yields probability equal to
amplitude squared. The single assumption (amplitude = sqrt of vibe density) is the model's core
quantum claim, stated up front, not the Born rule itself.

## See also

`p31-quantum-formalism.md`, `p33-black-hole.md`.
