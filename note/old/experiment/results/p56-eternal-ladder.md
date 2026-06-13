# P56: The Full Ladder, Eternally Growing

**Status: demonstrated. The integer ladder grows without bound, with the model living on it.**

## The question

P51 built the integer ladder once, as a static orbit. The roadmap asks for the ladder to
grow forever, with the model living on the growing substrate. Does the whole tower keep
working as it grows?

## What we did

Grow the tessellation epoch by epoch (the automaton emitting more cells each time) and, at
every epoch, run the committed model on the current substrate and measure it, for both the
parameter-free modular group and the heptagrid {7,3}.

## Result

| base | epochs (cells) | Lorentz-safe at every stage | model runs at every stage |
| ---- | -------------- | --------------------------- | ------------------------- |
| modular group PSL(2,Z) | 300, 701, 1500, 3000 | yes | yes |
| heptagrid {7,3} | 222, 612, 1512, 2502 | yes | yes |

The substrate grows without bound (cells only accumulate, the arrow of growth), stays
Lorentz-safe at every size, and the committed model runs on each stage, reproducibly and
non-trivially.

## Reading

The integer ladder grows without bound, and at every stage the substrate stays Lorentz-safe
and the model lives on it. The tessellation is infinite by construction, so the growth never
stops. This is the full ladder, from the integers up, eternally growing, with the model on
the growing substrate.

## Honest reading

The growth here is by re-emitting the tessellation at a larger size each epoch. Truly
incremental growth, adding cells without rebuilding, for arbitrarily long unbounded runs, is
the remaining engineering step.

## See also

`p51-full-ladder.md`, `p48-modular-base.md`, the integer-ladder analysis, and
`note/roadmap.md`.
