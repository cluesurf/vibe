# P63: Integrated Information (Tone-Aware)

**Status: solved, and the measure now reads the dynamics, not just the wiring.**

## The fix

The earlier version measured integration by algebraic connectivity, which reads only the graph and
ignores the tones entirely (it could not tell two regions apart if they had the same wiring but
different dynamics). The new measure, toneIntegration, reads the actual rule. For a region it
estimates the minimum-information bipartition: over random tone configurations it measures, for each
candidate cut, how much one side's next tones depend on the other side's current tones (replace that
side with independent noise, re-run the rule, count changed nodes). A region is integrated only if
EVERY way of cutting it still leaves the parts shaping each other.

## Result

| quantity | value |
| -------- | ----- |
| a genuine self (a cell), tone-integration | 0.153 |
| a random same-size bag of vibes | 0.024 |
| selves more integrated than random bags | 6x |
| a self is a local maximum (swapping members lowers it) | 100% of cells |

The decisive check that it reads the dynamics, not just the wiring: take one cell, split it down the
middle, and zero the fills on every edge crossing the split. The graph is untouched, so the
structural measure is identical, but the dynamics decouple along the split.

| same cell | tone-integration |
| --------- | ---------------- |
| fills intact | 0.063 |
| fills cut across the middle (graph unchanged) | 0.000 |

Tone-integration collapses to zero while the wiring (and the old structural proxy) is unchanged.

## Reading

A genuine self resists being cut in the rule's own behaviour, so it scores high, while a random bag
has cuts that lose nothing. A self is a local maximum. And crucially, zeroing the fills across a cell
collapses its integration while the wiring stays the same, proving the measure tracks the dynamics of
feeling, not just topology. This is the integration dial the framework needs, now reading tones.

## See also

`p58-emergent-macro-rule.md`, `p59-nested-selves.md`, `p60-tower-of-selves.md`.
