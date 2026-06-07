# P51: The Full Integer Ladder in One Program

**Status: demonstrated. The canonical base, built end to end from the integers.**

## The question

The integer-ladder analysis describes a tower: from the integers Z, generate a group by
its automaton, emit the tessellation, and run the model on it, one continuous
construction. Can the whole tower be built in one program?

## What we did

A single pipeline, `fullLadder`, runs all the rungs:

- Rung 0: integer generator data (matrices for the modular group, Schlafli symbols for the
  crystals).
- Rung 1 and 6: the group, grown deterministically by its automaton (integer-matrix or
  reflection arithmetic), with no randomness.
- Rung 3 and 4: the tessellation, emitted and embedded.
- Rung 5: the vibe model (the ternary signed-majority rule) run on the result.

## Result

The same pipeline, for three bases:

| base | cells | Lorentz anisotropy | Lorentz-safe | model runs, reproducible, evolves |
| ---- | ----- | ------------------ | ------------ | --------------------------------- |
| modular group PSL(2,Z) | 1800 | 0.057 | yes | yes |
| Coxeter crystal {7,3} | 1512 | 0.026 | yes | yes |
| Coxeter crystal {5,4} | 1508 | 0.040 | yes | yes |

All are generated from integer data with no randomness, all are Lorentz-safe, and the
vibe model runs on each, reproducibly and non-trivially.

## Reading

The whole tower stands as one construction. From integer generator data, a deterministic
automaton grows the group and emits the tessellation, and the vibe rule runs on the
result. The modular group (the parameter-free base) and the {7,3} and {5,4} crystals all
come through the same pipeline, integers to lived substrate, with nothing arbitrary and no
randomness in the generation. This is the canonical base, built end to end.

## See also

`p47-coxeter-unification.md`, `p48-modular-base.md`, the integer-ladder and
choosing-the-base analyses, and `p51-full-ladder` (the experiment).
