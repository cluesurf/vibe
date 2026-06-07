# P58: The Emergent Macro-Rule (The Renormalization Fixed Point)

**Status: solved. The macro-rule is a renormalization fixed point exactly on the integrated higher vibes.**

## The question

P57 showed the higher vibe is a derived aggregate of the micro-tones (no stored layer), but
the higher level obeyed the same rule only weakly (emergence about 0.10) with a naive
coarse-graining. Can the macro-rule be made genuinely emergent: the same signed-majority rule,
arising from the micro-dynamics, with no separate stored layer?

## Two fixes

1. **Renormalize the couplings.** The naive rule threw away the coupling MAGNITUDES (it kept
   only the sign of the summed cross-fills) and the cluster SELF-COUPLING (its internal
   cohesion). Restoring both gives the effective coarse rule, same signed-majority FORM:
   `super'(c) = sign( Jself(c) * super(c) + sum_d Jcross(c,d) * super(d) )`
   with `Jself` the sum of intra-cluster fills and `Jcross` the real sum of cross-cluster
   fills. This is a mean-field closure (a member is approximated by its domain's tone).
2. **Coarse-grain along the system's own coherent domains**, the connected regions of one
   tone (the integrated wholes), not arbitrary blocks. Within a uniform domain the mean-field
   closure is exact, so the macro-rule reproduces the aggregated micro-dynamics.

## Result

On a converged self of 1500 vibes:

| coarse-graining | renormalized macro-rule agreement |
| --------------- | --------------------------------- |
| arbitrary random blocks (P57-style) | 0.47 |
| coherent domains, all | 0.80 |
| coherent domains, size >= 3 | 0.94 |
| coherent domains, size >= 5 | 0.95 |
| coherent domains, size >= 10 | **1.00** |

The agreement climbs to 1.00 as the domain grows. The coarse-grained self is an exact fixed
point of the renormalized macro-rule on the larger, more integrated domains.

## Reading

The resolution is precise. Coarse-grain along the real coherent domains (the integrated
wholes), keep the real coupling magnitudes, and add the self-coupling cohesion, and the
higher level obeys the same signed-majority rule the base does, exactly for the larger
wholes. The rule is a renormalization fixed point (same form, renormalized couplings), the
scale-invariance P57 left open.

The deepest point: the threshold for OBEYING the emergent rule is the threshold for BEING a
higher vibe, namely integration. A loose, incoherent bag does not obey a clean macro-rule and
is not a higher vibe. An integrated whole does and is. Agreement rising with domain size is
agreement rising with integration. The rule governs every scale, on exactly the wholes where
higher minds live, and it is emergent (a consequence of the micro-dynamics) rather than
imposed or stored.

## See also

`p57-recursion.md` (the recursion model and the open frontier this closes),
`p53-coarse-graining-fixed-point.md` (the geometric fixed point), and the
higher-vibes-and-recursion and key-fractals specs.
